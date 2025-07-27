from django.shortcuts import render
from .models import Tag, Note
from .serializers import TagSerializer, NoteSerializer
from rest_framework import viewsets
from rest_framework.exceptions import PermissionDenied

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
    queryset = Note.objects.all()
    serializer_class = NoteSerializer

class TaskViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = TaskSerializer

    def get_queryset(self):
        return Task.objects.filter(author=self.request.user).order_by("due_date")