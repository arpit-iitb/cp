from django.contrib import admin
from .models import Client, Assignments, Batch, Lesson, MCQAssignment, MCQQuestions, MultiCorrectMCQs, Problem, Topic, VideoLectures, ChildBatch, TemplateCode, TestCase, ProblemReport, Text



class TestcaseInline(admin.TabularInline):
    model = TestCase
    extra = 1

class TemplateCodeInline(admin.TabularInline):
    model = TemplateCode
    extra = 1

@admin.register(Batch)
class BatchAdmin(admin.ModelAdmin):
    list_display = ('name', 'client', 'start_date', 'end_date', 'language')
    search_fields = ('name', 'client__name', 'language')
    list_filter = ('start_date', 'end_date', 'language', 'client')


@admin.register(Problem)
class ProblemAdmin(admin.ModelAdmin):
    inlines = [TestcaseInline, TemplateCodeInline]
    list_display = ('title', 'difficulty_level', 'created_at', 'updated_at')
    search_fields = ('title',)
    list_filter = ('difficulty_level', 'created_at', 'updated_at')


@admin.register(VideoLectures)
class VideoLecturesAdmin(admin.ModelAdmin):
    list_display = ('title', 'difficulty_level', 'duration', 'created_at', 'updated_at')
    search_fields = ('title', 'description')
    list_filter = ('difficulty_level', 'created_at', 'updated_at')

@admin.register(Text)
class TextAdmin(admin.ModelAdmin):
    list_display = ('title', 'difficulty_level', 'created_at', 'updated_at')
    search_fields = ('title', 'description')
    list_filter = ('difficulty_level', 'created_at', 'updated_at')


@admin.register(Assignments)
class AssignmentsAdmin(admin.ModelAdmin):
    list_display = ('title', 'difficulty_level', 'created_at', 'updated_at')
    search_fields = ('title', 'description')
    list_filter = ('difficulty_level', 'created_at', 'updated_at')


@admin.register(MCQAssignment)
class MCQAssignmentAdmin(admin.ModelAdmin):
    list_display = ('title', 'difficulty_level', 'created_at', 'updated_at')
    search_fields = ('title', 'description')
    list_filter = ('difficulty_level', 'created_at', 'updated_at')
    filter_horizontal = ('questions', 'multicorrectmcqs')

@admin.register(ChildBatch)
class ChildBatchAdmin(admin.ModelAdmin):
    list_display = ('name', 'parentbatch', 'client', 'start_date', 'end_date')
    search_fields = ('name', 'parentbatch__name')
    list_filter = ('start_date', 'end_date', 'parentbatch', 'client')


@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = ('batch', 'type', 'priority_order', 'week_number', 'video', 'assignment', 'problem', 'MCQ_assignment')
    search_fields = ('batch__name', 'type', 'problem__title', 'video__title', 'assignment__title')
    list_filter = ('batch', 'type', 'week_number', 'problem', 'video', 'assignment')


@admin.register(Client)
class ClientAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'clientId', 'phone_number', 'website', 'client_id_vimeo', 'project_id_vimeo', 'created_at', 'updated_at')
    search_fields = ('name', 'client_id_vimeo', 'project_id_vimeo')
    list_filter = ('created_at', 'updated_at')


@admin.register(MCQQuestions)
class MCQQuestionsAdmin(admin.ModelAdmin):
    list_display = ('question_text', 'topic', 'difficulty_level', 'correct_answer')
    search_fields = ('question_text', 'topic')
    list_filter = ('topic', 'difficulty_level')


@admin.register(MultiCorrectMCQs)
class MultiCorrectMCQsAdmin(admin.ModelAdmin):
    list_display = ('question_text', 'topic', 'difficulty_level')
    search_fields = ('question_text', 'topic')
    list_filter = ('topic', 'difficulty_level')


@admin.register(ProblemReport)
class ProblemReportAdmin(admin.ModelAdmin):
    list_display = ('problem_id', 'username', 'email', 'contact_number')
    search_fields = ('username', 'email', 'problem_id__title')
    list_filter = ('problem_id',)


@admin.register(Topic)
class TopicAdmin(admin.ModelAdmin):
    list_display = ('name',)
    search_fields = ('name',)


@admin.register(TemplateCode)
class TemplateCodeAdmin(admin.ModelAdmin):
    list_display = ('problem', 'language')
    search_fields = ('problem__title', 'language')
    list_filter = ('language',)


@admin.register(TestCase)
class TestCaseAdmin(admin.ModelAdmin):
    list_display = ('problem', 'input_data', 'expected_output')
    search_fields = ('problem__title',)
    list_filter = ('problem',)

