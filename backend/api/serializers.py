from rest_framework import serializers
from .models import Tag, Note, Task

class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = "all"
        read_only_fields = ["id", "author"]

    def create(self, validated_data):
        validated_data["author"] = self.context["request"].user
        return super().create(validated_data)

class NoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Note
        fields = "all"
        read_only_fields = ["id", "author"]

    def create(self, validated_data):
        validated_data["author"] = self.context["request"].user
        return super().create(validated_data)

class TaskSerializer(serializers.ModelSerializer):
    tags = TagSerializer(many=True, read_only=True)
    tag_ids = serializers.ListField(child=serializers.IntegerField(), write_only=True, required=False)
    
    class Meta:
        model = Task
        fields = ["id", "name", "description", "due_date", "completed", "tags", "tag_ids", 
                 "pomodoro_start", "last_pomodoro_duration", "total_pomodoro_time", 
                 "created_at", "updated_at"]
        read_only_fields = ["id", "author", "created_at", "updated_at", "last_pomodoro_duration", "total_pomodoro_time"]

    def create(self, validated_data):
        tag_ids = validated_data.pop('tag_ids', [])
        validated_data["author"] = self.context["request"].user
        task = super().create(validated_data)
        if tag_ids:
            task.tags.set(tag_ids)
        return task
    
    def update(self, instance, validated_data):
        tag_ids = validated_data.pop('tag_ids', None)
        task = super().update(instance, validated_data)
        if tag_ids is not None:
            task.tags.set(tag_ids)
        return task