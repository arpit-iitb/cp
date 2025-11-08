from django.urls import path
from .views import UserAssessmentQuestionsView, AdminAssessmentDetailView, UserAssessmentInfo, OpenAssessmentSubmissionView, CompileRunProblemAPI, AdminAssessmentListView, GetAllAssessment, GetAllProblems, GetAllSingleMCQ, GetAllMultiMCQ, GetAllSubjectiveQue, CreateAssessment, CreateAssessmentItem, GetAssessmentItem, GetSubmitTaskStatus, GetSets, CreateSet, ExportGradedAssessmentsAPIView, GetStudentReport, SetOrder

urlpatterns = [
    path('details/', UserAssessmentQuestionsView.as_view(), name ='assessment-qusetions'),
    path('assessment-info/', UserAssessmentInfo.as_view(), name ='assessment-info'),
    path('open-assessment-submission/', OpenAssessmentSubmissionView.as_view(), name='open-assessment-submission'),
    path('submit-problem/', CompileRunProblemAPI.as_view(), name = "submit problem"),
    path('admin/assessment-list/', AdminAssessmentListView.as_view(), name='admin-assessment-list'),
    path('admin/assessment-detail/', AdminAssessmentDetailView.as_view(), name='admin-assessment-detail'),
    path('get-assessments/', GetAllAssessment.as_view(), name="Get all assessments"),
    path('get-problems/', GetAllProblems.as_view(), name='Get All Problems'),
    path('get-single-mcq/', GetAllSingleMCQ.as_view(), name='Get All Single MCQ'),
    path('get-multi-mcq/', GetAllMultiMCQ.as_view(), name='Get All Multi MCQ'),
    path('get-subjective-questions/', GetAllSubjectiveQue.as_view(), name='Get All Subjective Questions'),
    path('create-assessment/', CreateAssessment.as_view(), name="Create Assessment"),
    path('create-assessment-item/', CreateAssessmentItem.as_view(), name = "Create Assessment Item"),
    path('get-assessment-items/', GetAssessmentItem.as_view(), name = "Get all assessment items"),
    path('get-submit-task-status/<str:task_id>', GetSubmitTaskStatus.as_view(), name='Get Submitted Task Status'),
    path('get-sets/', GetSets.as_view(), name='Get Sets'),
    path('create-set/', CreateSet.as_view(), name = "Create Set"),
    path('admin/export-graded-assessments/', ExportGradedAssessmentsAPIView.as_view(), name='export_graded_assessments'),
    path('set-priority-order/', SetOrder.as_view(), name = "Set Order"),
    path('get-student-report/', GetStudentReport.as_view(), name = "Get Student Report" )
  
    ]