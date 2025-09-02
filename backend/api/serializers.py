from rest_framework import serializers
from .models import Tag, Note, Task
from django.contrib.auth.models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'password']
        extra_kwargs = {
            "password": {"write_only": True, "min_length": 8}
        }
    
    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User.objects.create_user(
            username=validated_data.get('username'),
            password=password,
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        return user
    
    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("A user with this username already exists.")
        return value

class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = "__all__"
        read_only_fields = ["id", "author"]
        
    def create(self, validated_data):
        validated_data["author"] = self.context["request"].user
        return super().create(validated_data)
        
class NoteSerializer(serializers.ModelSerializer):
    tags = TagSerializer(many=True, read_only=True)
    tag_ids = serializers.PrimaryKeyRelatedField(
        many=True, 
        queryset=Tag.objects.all(), 
        source='tags', 
        write_only=True, 
        required=False
    )
    
    class Meta:
        model = Note
        fields = "__all__"
        read_only_fields = ["id", "author"]
    
class TaskSerializer(serializers.ModelSerializer):
    tags = TagSerializer(many=True, read_only=True)
    tag_ids = serializers.PrimaryKeyRelatedField(
        many=True, 
        queryset=Tag.objects.all(), 
        source='tags', 
        write_only=True, 
        required=False
    )
    
    class Meta:
        model = Task
        fields = "__all__"
        read_only_fields = ["id", "author", "created_at", "updated_at", "last_pomodoro_duration", "total_pomodoro_time"]      
        