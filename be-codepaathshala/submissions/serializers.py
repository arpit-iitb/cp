from rest_framework import serializers
from .models import CodeSubmission, AssignmentSubmission, AssignmentSubmissionFile

class CodeSubmissionSerializer(serializers.ModelSerializer):
    title = serializers.SerializerMethodField()
    class Meta:
        model = CodeSubmission
        fields = '__all__'
    
    def get_title(self,obj):
        if obj.problem.title:
            return obj.problem.title
        return ''
    
class AssignmentSubmissionFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = AssignmentSubmissionFile
        fields = '__all__'


class AssignmentSubmissionSerializer(serializers.ModelSerializer):
    title = serializers.SerializerMethodField()
    class Meta:
        model = AssignmentSubmission
        fields = '__all__'
    
    def get_title(self,obj):
        if obj.assignment.title:
            return obj.assignment.title
        return ''