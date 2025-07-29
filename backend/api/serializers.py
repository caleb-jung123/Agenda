from rest_framework import serializers
from .models import Tag, Note, Task

class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = "__all__"
        read_only_fields = ["id", "author"]
        
    def create(self, validated_data):
        validated_data["author"] = self.context["request"].user
        return super().create(validated_data)
        
class NoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Note
        fields = "__all__"
        read_only_fields = ["id", "author"]
    
class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = "__all__"
        read_only_fields = ["id", "author", "created_at", "updated_at"]      
        