from django.contrib import admin
from .models import Assessment_v2, AssessmentItem_v2, AssessmentEvaluation_v2, OpenAssessmentEvaluation_V2, ProblemSet, MCQSet, SubjectiveSet, AssessmentResultVerbose, AsessmentResultMeta
# Register your models here.



class AssessmentItemInline(admin.TabularInline):
    model=AssessmentItem_v2
    extra=1

@admin.register(ProblemSet)
class ProblemSetAdmin(admin.ModelAdmin):
    list_display = ('title', 'number_of_easy_problems', 'number_of_medium_problems','number_of_hard_problems')
    filter_horizontal = ('problems',)


@admin.register(MCQSet)
class ProblemSetAdmin(admin.ModelAdmin):
    list_display = ('title', 'number_of_easy_mcqs', 'number_of_medium_mcqs','number_of_hard_mcqs')
    filter_horizontal = ('mcqs','multi_mcqs')


@admin.register(SubjectiveSet)
class ProblemSetAdmin(admin.ModelAdmin):
    list_display = ('title', 'number_of_easy_questions', 'number_of_medium_questions','number_of_hard_questions')
    filter_horizontal = ('questions',)    

@admin.register(Assessment_v2)
class Assessment_v2Admin(admin.ModelAdmin):
    inlines=[AssessmentItemInline]
    list_display = ('title', 'test_id', 'Total_marks',)
    list_filter = ('title', 'test_id')
    filter_horizontal = ('access_users',)

@admin.register(AssessmentItem_v2)
class AssessmentItemAdmin(admin.ModelAdmin):
    list_display=('assessment','sections_type','priority_order','section_cutoff','Total_marks','time_duration')
    list_filter= ('assessment','sections_type','priority_order')
    filter_horizontal = ('coding_problem','mcq','subjective',)


@admin.register(AssessmentEvaluation_v2)
class AssessmentItemAdmin(admin.ModelAdmin):
    list_display=('user','test_id','responsesheet','mcq_score','subjective_assignment_score','coding_section_score','judgement','total_marks','submission_time')
    list_filter = ('user', )

@admin.register(OpenAssessmentEvaluation_V2)
class OpenAssessmentEvaluation_V2Admin(admin.ModelAdmin):
    list_display = ('name', 'email', 'mobile', 'test_id', 'mcq_score', 'submission_date','coding_problem_score', 'graded')
    list_filter = ('name', 'email', 'mobile', 'test_id')
    search_fields = ('name', 'email', 'mobile', 'test_id')

@admin.register(AsessmentResultMeta)
class AsessmentResultMeta(admin.ModelAdmin):
    list_display = ('student_name', 'email', 'test_id', 'assessment_item_name', 'obtained_marks', 'max_marks', 'evaluated_at', 'submitted_at')
    list_filter = ('email', 'test_id', 'student_name', 'assessment_item_name')
    search_fields = ('email', 'student_name')

@admin.register(AssessmentResultVerbose)
class AssessmentResultVerbose(admin.ModelAdmin):
    list_display = ('student_name', 'email', 'test_id', 'assessment_item_name', 'question_type', 'question_id',  'obtained_marks', 'max_marks', 'evaluated_at', 'submitted_at')
    list_filter = ('email', 'test_id', 'student_name', 'assessment_item_name')
    search_fields = ('email', 'student_name')

