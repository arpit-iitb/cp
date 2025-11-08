# serializers.py
from rest_framework import serializers
from .models import Discussion

class DiscussionSerializer(serializers.ModelSerializer):
    username = serializers.SerializerMethodField()
    batch_name = serializers.SerializerMethodField()
    
    def get_username(self, obj):
        return obj.user.username  
    
    def get_batch_name(self, obj):
        if(obj.batch is not None):
            return obj.batch.name 
        return None
    class Meta:
        model = Discussion
        fields =['id', 'username', 'batch_name','batch', 'type', 'discussion_text', 'likes', 'created_on', 'user','problem','video', 'assignment', 'mcq_assignment' ]


