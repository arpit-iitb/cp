# serializers.py
from rest_framework import serializers
from batches.models import Lesson, Batch, Problem, ProblemReport, TemplateCode, TestCase, VideoLectures, Assignments, MCQAssignment, Text
from codingjudge.enum import DIFFICULTY_LEVEL, MCQ_OPTIONS


class LessonSerializer(serializers.ModelSerializer):
    type = serializers.SerializerMethodField()
    title = serializers.SerializerMethodField()
    difficulty_level = serializers.SerializerMethodField()
    priority_order = serializers.FloatField()

    def get_type(self, obj):
        return obj.get_type_display()

    def get_title(self, obj):
        if obj.type == 'P':
            return obj.problem.title if obj.problem else ""
        elif obj.type == 'V':
            return obj.video.title if obj.video else ""
        elif obj.type == 'A':
            return obj.assignment.title if obj.assignment else ""
        elif obj.type == 'M':
            return obj.MCQ_assignment.title if obj.MCQ_assignment else ""
        elif obj.type == 'T':
            return obj.Text.title if obj.Text else ""
        else:
            return ""

    def get_difficulty_level(self, obj):
        if obj.type == 'P' and obj.problem:
            difficulty_level_value = obj.problem.difficulty_level
        elif obj.type == 'V' and obj.video:
            difficulty_level_value = obj.video.difficulty_level
        elif obj.type == 'A' and obj.assignment:
            difficulty_level_value = obj.assignment.difficulty_level
        elif obj.type == 'M' and obj.MCQ_assignment:
            difficulty_level_value = obj.MCQ_assignment.difficulty_level
        elif obj.type == 'T' and obj.Text:
            difficulty_level_value = obj.Text.difficulty_level
        else:
            difficulty_level_value = None
        
        if difficulty_level_value:
            return difficulty_level_value
        return ""

    class Meta:
        model = Lesson
        fields = ('type', 'title', 'difficulty_level', 'priority_order','attempts')


class TemplateCodeSerializer(serializers.ModelSerializer):
    class Meta:
        model = TemplateCode
        fields = ('language', 'code')

class TestCaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = TestCase
        fields = ('input_data', 'expected_output')

class ProblemSerializer(serializers.ModelSerializer):
    template_codes = TemplateCodeSerializer(many=True, read_only=True)
    test_cases = serializers.SerializerMethodField()
    img_urls = serializers.SerializerMethodField()

    class Meta:
        model = Problem
        fields = '__all__'

    def get_test_cases(self, obj):
        if obj.full_stack_evaluation:
            return TestCaseSerializer(obj.test_cases.all(), many=True).data
        return []
    
    def get_img_urls(self, obj):
        if obj.img_urls:
            return obj.img_urls.split(',')  # Splitting the string into a list of URLs
        return []



class VideoLecturesSerializer(serializers.ModelSerializer):
    class Meta:
        model = VideoLectures
        fields = '__all__'

class TextSerializer(serializers.ModelSerializer):
    class Meta:
        model = Text
        fields = '__all__'

class AssignmentsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Assignments
        fields = '__all__'

class ProblemReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProblemReport
        fields = '__all__'

