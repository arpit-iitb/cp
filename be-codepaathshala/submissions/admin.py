from django.contrib import admin
from batches.models import MCQAssignment
from submissions.models import AssignmentSubmission, CodeSubmission, MCQSubmission, AssignmentSubmissionFile, UserScoreData, UserActivity

# Register your models here.

class CodeSubmissionAdmin(admin.ModelAdmin):
    list_display = ('user', 'problem', 'judgment', 'submission_count', 'submission_date', 'batch_name', 'score')
    list_filter = ('problem', 'judgment', 'submission_date', 'batch_name')
    search_fields = ('user__username', 'problem__title', 'batch_name')
    date_hierarchy = 'submission_date'

    def submission_count(self, obj):
        return CodeSubmission.get_submission_count(user=obj.user, problem=obj.problem)

    submission_count.short_description = 'Submission Count'

admin.site.register(CodeSubmission, CodeSubmissionAdmin)

class AssignmentSubmissionAdmin(admin.ModelAdmin):
    list_display = ('user', 'assignment', 'score', 'feedback', 'submission_count', 'submission_date', 'batch_name')
    list_filter = ('assignment', 'submission_date', 'batch_name')
    search_fields = ('user__username', 'assignment__title', 'batch_name')
    date_hierarchy = 'submission_date'
    def submission_count(self, obj):
        return AssignmentSubmission.get_submission_count(user=obj.user, assignment=obj.assignment)
    submission_count.short_description = 'Submission Count'
admin.site.register(AssignmentSubmission, AssignmentSubmissionAdmin)

class MCQSubmissionAdmin(admin.ModelAdmin):
    list_display = ('user', 'mcq', 'score', 'result', 'submission_date', 'batch_name')
    list_filter = ('mcq', 'result', 'submission_date', 'batch_name')
    search_fields = ('user__username', 'mcq__title', 'batch_name')
    date_hierarchy = 'submission_date'

admin.site.register(MCQSubmission, MCQSubmissionAdmin)

class UserScoreDataAdmin(admin.ModelAdmin):
    list_display = ('user', 'content_id', 'type', 'title', 'score', 'batch_name')
    list_filter = ('user', 'content_id', 'type', 'title', 'score', 'batch_name')
    search_fields = ('user__username', 'title', 'batch_name')

admin.site.register(UserScoreData, UserScoreDataAdmin)

@admin.register(UserActivity)
class UserActivityAdmin(admin.ModelAdmin):
    list_display = ('user', 'content_type', 'batch_name', 'submission_date')
    list_filter = ('content_type', 'batch_name', 'submission_date')
    search_fields = ('user__username', 'batch_name')
    date_hierarchy = 'submission_date'

@admin.register(AssignmentSubmissionFile)
class AssignmentSubmissionFileAdmin(admin.ModelAdmin):
    list_display = ('user', 'batch_name', 'other_info', 'file')
    list_filter = ('user', 'batch_name', 'other_info')
    search_fields = ('other_info',)
