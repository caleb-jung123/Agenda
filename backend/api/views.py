from django.shortcuts import render
from .models import Tag, Note, Task
from .serializers import TagSerializer, NoteSerializer, TaskSerializer, UserSerializer
from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework import filters
from django_filters.rest_framework import DjangoFilterBackend
from django_filters import rest_framework as django_filters
from django.utils import timezone
from django.db.models import Q, Count
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken

def set_jwt_cookies(response, refresh_token):
    response.set_cookie(
        'access_token',
        str(refresh_token.access_token),
        max_age=60 * 60,
        httponly=True,
        secure=False,
        samesite='Lax'
    )
    
    response.set_cookie(
        'refresh_token',
        str(refresh_token),
        max_age=24 * 60 * 60,
        httponly=True,
        secure=False,
        samesite='Lax'
    )

# Create your views here.

class UserView(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    username = request.data.get('username')
    password = request.data.get('password')
    
    if not username or not password:
        return Response({'error': 'Please provide both username and password'}, status=status.HTTP_400_BAD_REQUEST)
    
    user = authenticate(username=username, password=password)
    
    if user is None:
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
    
    if not user.is_active:
        return Response({'error': 'User account is disabled'}, status=status.HTTP_401_UNAUTHORIZED)
    
    refresh = RefreshToken.for_user(user)
    
    response = Response({
        'user': {
            'id': user.id,
            'username': user.username,
            'first_name': user.first_name,
            'last_name': user.last_name,
        }
    })
    
    set_jwt_cookies(response, refresh)
    
    return response

@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    serializer = UserSerializer(data=request.data)
    
    if serializer.is_valid():
        try:
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            
            response = Response({
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                }
            }, status=status.HTTP_201_CREATED)
            
            set_jwt_cookies(response, refresh)
            
            return response
        except Exception as e:
            return Response({'error': 'Failed to create user account'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def logout_view(request):
    response = Response({'message': 'Successfully logged out'})
        
    response.delete_cookie('access_token')
    response.delete_cookie('refresh_token')
    
    return response

@api_view(['GET'])
def user_profile_view(request):
    user = request.user
    return Response({
        'id': user.id,
        'username': user.username,
        'first_name': user.first_name,
        'last_name': user.last_name,
    })

class TaskFilter(django_filters.FilterSet):
    tags = django_filters.ModelMultipleChoiceFilter(
        queryset=Tag.objects.all(),
        field_name='tags',
        to_field_name='id'
    )
    completed = django_filters.BooleanFilter()
    has_due_date = django_filters.BooleanFilter(method='filter_has_due_date')
    overdue = django_filters.BooleanFilter(method='filter_overdue')
    search = django_filters.CharFilter(method='filter_search')
    
    class Meta:
        model = Task
        fields = ['completed', 'tags']
    
    def filter_has_due_date(self, queryset, name, value):
        if value:
            return queryset.exclude(due_date__isnull=True)
        else:
            return queryset.filter(due_date__isnull=True)
    
    def filter_overdue(self, queryset, name, value):
        if value:
            return queryset.filter(due_date__lt=timezone.now(), completed=False)
        return queryset
    
    def filter_search(self, queryset, name, value):
        return queryset.filter(
            Q(name__icontains=value) | Q(description__icontains=value)
        )

class TagViewSet(viewsets.ModelViewSet):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        return Tag.objects.filter(
            Q(author__isnull=True) | Q(author=user)
        ).order_by('is_builtin', 'name')

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)
    
    def perform_destroy(self, instance):
        if instance.is_builtin:
            raise PermissionDenied("You can't delete built-in tags.")
        if instance.author != self.request.user:
            raise PermissionDenied("You can only delete your own tags.")
        return super().perform_destroy(instance)
    
class NoteViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = NoteSerializer
    
    def get_queryset(self):
        return Note.objects.filter(author=self.request.user).order_by("created_at")
        
class TaskViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = TaskSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = TaskFilter
    search_fields = ['name', 'description']
    ordering_fields = ['created_at', 'updated_at', 'due_date', 'name', 'completed']
    ordering = 'due_date', '-created_at'

    def get_queryset(self):
        return Task.objects.filter(author=self.request.user).prefetch_related('tags').order_by(self.ordering)

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        task = self.get_object()
        task.completed = True
        task.save(update_fields=['completed'])
        serializer = self.get_serializer(task)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def uncomplete(self, request, pk=None):
        task = self.get_object()
        task.completed = False
        task.save(update_fields=['completed'])
        serializer = self.get_serializer(task)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def bulk_complete(self, request):
        task_ids = request.data.get('task_ids', [])
        if not task_ids:
            return Response({"detail": "task_ids is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        tasks = Task.objects.filter(id__in=task_ids, author=request.user)
        updated_count = tasks.update(completed=True)
        
        return Response({"detail": f"{updated_count} tasks marked as completed", "updated_count": updated_count})
    
    @action(detail=False, methods=['post'])
    def bulk_uncomplete(self, request):
        task_ids = request.data.get('task_ids', [])
        if not task_ids:
            return Response({"detail": "task_ids is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        tasks = Task.objects.filter(id__in=task_ids, author=request.user)
        updated_count = tasks.update(completed=False)
        
        return Response({"detail": f"{updated_count} tasks marked as uncompleted", "updated_count": updated_count})

    @action(detail=False, methods=['post'])
    def bulk_delete(self, request):
        task_ids = request.data.get('task_ids', [])
        if not task_ids:
            return Response({"detail": "task_ids is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        tasks = Task.objects.filter(id__in=task_ids, author=request.user)
        deleted_count, _ = tasks.delete()
        
        return Response({"detail": f"{deleted_count} tasks deleted", "deleted_count": deleted_count})

    @action(detail=True, methods=['post'])
    def start_pomodoro(self, request, pk=None):
        task = self.get_object()
        task.pomodoro_start = timezone.now()
        task.save(update_fields=["pomodoro_start"])
        return Response({"status": "started", "pomodoro_start": task.pomodoro_start})
    
    @action(detail=True, methods=['post'])
    def end_pomodoro(self, request, pk=None):
        task = self.get_object()
        if not task.pomodoro_start:
            return Response({"detail": "There is no pomodoro timer active."}, status=status.HTTP_400_BAD_REQUEST)

        now = timezone.now()
        duration = now - task.pomodoro_start

        task.last_pomodoro_duration = duration
        task.total_pomodoro_time += duration
        task.pomodoro_start = None
        task.save(update_fields=["last_pomodoro_duration", "total_pomodoro_time", "pomodoro_start"])

        return Response({"status": "ended", "last_pomodoro_duration": duration, "total_pomodoro_time": task.total_pomodoro_time})

class TaskStatsView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, *args, **kwargs):
        user_tasks = Task.objects.filter(author=request.user)
        total_tasks = user_tasks.count()
        completed_tasks = user_tasks.filter(completed=True).count()
        pending_tasks = total_tasks - completed_tasks
        overdue_tasks = user_tasks.filter(due_date__lt=timezone.now(), completed=False).count()
        tag_stats = user_tasks.values('tags__name').annotate(count=Count('id'), completed_count=Count('id', filter=Q(completed=True))).exclude(tags__name__isnull=True)
        
        return Response({"total_tasks": total_tasks, "completed_tasks": completed_tasks, "pending_tasks": pending_tasks, "overdue_tasks": overdue_tasks, "tag_stats": list(tag_stats)})
    
class CalendarView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, *args, **kwargs):
        res = {}
        tasks = Task.objects.filter(author=self.request.user).order_by("due_date")
        month = int(request.GET.get("month"))
        year = int(request.GET.get("year"))
        
        for raw_task in tasks:
            task_month = raw_task.due_date.month
            task_year = raw_task.due_date.year
            task = TaskSerializer(raw_task).data
            date = task["due_date"]
            if month == task_month and year == task_year:
                if date not in res:
                    res[date] = [task]
                else:
                    res[date].append(task)
        
        return Response(res)