from django.shortcuts import render
from .models import Tag, Note, Task
from .serializers import TagSerializer, NoteSerializer, TaskSerializer
from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from djanto.utils import timezone

# Create your views here.

class TagViewSet(viewsets.ModelViewSet):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    
    def get_queryset(self):
        user = self.request.user
        return Tag.objects.filter(author__in=[None, self.request.user])
        # REMEMBER TO SET AUTHOR = NULL FOR BUILT IN TAGS FOR THE FUTURE

    def perform_destroy(self, instance):
        if instance.is_builtin:
            raise PermissionDenied("You can't delete Built‑in tags.")
        return super().perform_destroy(instance)    
    
class NoteViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = NoteSerializer
    
    def get_queryset(self):
        return Note.objects.filter(author=self.request.user).order_by("created_at")

class TaskViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = TaskSerializer

    def get_queryset(self):
        return Task.objects.filter(author=self.request.user).order_by("due_date")
    
    def start(self, request):
        task = self.get_object()
        task.pomodoro_start = timezone.now()
        task.save(update_fields=["pomodoro_start"])
        return Response({"status: started", "pomodoro_start", task.pomodoro_start})
    
    def end(self, request):
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
                