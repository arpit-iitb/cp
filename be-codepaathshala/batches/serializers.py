from rest_framework import serializers
from .models import ChildBatch, MCQAssignment, MCQQuestions, Problem, Assignments

class ProblemSerializer(serializers.ModelSerializer):
    class Meta:
        model = Problem
        fields = '__all__'

class AssignemntsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Assignments
        fields = '__all__'

class MCQQuestionsSerializer(serializers.ModelSerializer):
    class Meta:
        model = MCQQuestions
        fields = '__all__'

class MCQAssignmentSerializer(serializers.ModelSerializer):
    questions = MCQQuestionsSerializer(many=True)

    class Meta:
        model = MCQAssignment
        fields = '__all__'
        
class ChildBatchSerializer(serializers.ModelSerializer):
    parent_batch_name = serializers.CharField(source='parentbatch.name')
    parent_batch_weekly_topics = serializers.CharField(source='parentbatch.weekly_topics')
    parent_batch_description = serializers.CharField(source='parentbatch.description')
    parent_batch_client_name = serializers.CharField(source='parentbatch.client.name')
    parent_batch_client_logo = serializers.URLField(source='parentbatch.client.logo')

    class Meta:
        model = ChildBatch
        fields = ('id','name', 'start_date', 'end_date', 'parent_batch_name', 'parent_batch_description', 'parent_batch_weekly_topics','parent_batch_client_name', 'parent_batch_client_logo', 'created_at', 'updated_at')
