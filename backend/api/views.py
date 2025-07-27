from django.shortcuts import render
from .models import Tag, Note
from .serializers import TagSerializer, NoteSerializer
from rest_framework import viewsets

# Create your views here.

class TagViewSet(viewsets.ModelViewSet):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    
class NoteViewSet(viewsets.ModelViewSet):
    queryset = Note.objects.all()
    serializer_class = NoteSerializer