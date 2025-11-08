
from rest_framework import serializers

from accounts.models import UserProfile
from batches.models import ChildBatch,VideoLectures

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile.user
        fields = ['id', 'username', 'email', 'name', 'phone_number', 'is_active', 'is_staff', 'is_verified']

class ChildBatchListSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChildBatch
        fields = ['id', 'name']

class VideoLectureSerializer(serializers.ModelSerializer):
    class Meta:
        model = VideoLectures
        fields = ['title', 'description', 'link', 'pptLink', 'docsLink', 'difficulty_level']

class LessonPriorityUpdateSerializer(serializers.Serializer):
    lesson_id = serializers.IntegerField()
    priority_order = serializers.DecimalField(max_digits=10, decimal_places=2)

class CSVUploadSerializer(serializers.Serializer):
    file = serializers.FileField()