from django.db import models
from django.contrib.auth.models import User

# Create your models here.

class Tag(models.Model):
    name = models.CharField(max_length=100, unique=False)
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name="tag", null=True)
    is_builtin = models.BooleanField(default = False)
    
    class Meta:
        unique_together = (("author", "name"),)
        ordering = ["is_builtin", "name"]

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
    
class Task(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    due_date = models.DateTimeField(null=True, blank=True)
    completed = models.BooleanField(default=False)
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name="tasks")
    tags = models.ManyToManyField(Tag, blank=True, related_name="tasks")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name