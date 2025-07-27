from django.db import models
from django.contrib.auth.models import User

# Create your models here.

class Tag(models.Model):
    name = models.CharField(max_length=100, unique=True)
    author = author = models.ForeignKey(User, on_delete=models.CASCADE, related_name="tag")

    def __str__(self):
        return self.name

class Note(models.Model):
    name = models.CharField(max_length=100)
    tags = models.ManyToManyField(Tag)
    notes = models.TextField()
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name="note")
    last_updated = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.name