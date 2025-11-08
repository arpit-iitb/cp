from datetime import datetime
from django.db import models
from accounts.models import User
from batches.models import Assignments, Client,  MCQAssignment, Problem, MCQQuestions, MultiCorrectMCQs
from codingjudge.enum import CONTENT_ITEM_TYPES
from django.utils.timezone import now


class Assessment_v2(models.Model):
    title=models.CharField(max_length=300)
    test_id = models.CharField(max_length=100, unique=True, default="something")
    description=models.TextField(blank=True)
    language = models.CharField(max_length=200, verbose_name="default language", blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    access_users = models.ManyToManyField(User, related_name='assessments_v2', blank=True)
    passing_marks = models.FloatField(default=0)
    Total_marks = models.IntegerField(default=0)
    timed_assessments = models.BooleanField(default=False)
    duration = models.CharField(max_length=4, blank=True)
    brand_logo = models.CharField(max_length=1000, blank=True)
    max_violations = models.IntegerField(blank=True,null=True)
    proctored = models.BooleanField(default=False)
    show_result = models.BooleanField(default=False)
    client = models.ForeignKey(Client, null=True, blank=True, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.title}"
    
    class Meta:
        verbose_name = 'Assessment_v2'
        verbose_name_plural = 'Assessments_v2'

class ProblemSet(models.Model):
    title = models.CharField(max_length=255)
    number_of_easy_problems = models.PositiveIntegerField(blank=True, null=True)
    number_of_medium_problems = models.PositiveIntegerField(blank=True, null=True)
    number_of_hard_problems = models.PositiveIntegerField(blank=True, null=True)
    problems = models.ManyToManyField(Problem)

    def __str__(self):
        return self.title
    
class MCQSet(models.Model):
    title = models.CharField(max_length=255)
    number_of_easy_mcqs = models.PositiveIntegerField(blank=True, null=True)
    number_of_medium_mcqs = models.PositiveIntegerField(blank=True, null=True)
    number_of_hard_mcqs = models.PositiveIntegerField(blank=True, null=True)
    mcqs = models.ManyToManyField(MCQQuestions, blank= True)
    multi_mcqs = models.ManyToManyField(MultiCorrectMCQs, blank= True)

    def __str__(self):
        return self.title

class SubjectiveSet(models.Model):
    title = models.CharField(max_length=255)
    number_of_easy_questions = models.PositiveIntegerField(blank=True, null=True)
    number_of_medium_questions = models.PositiveIntegerField(blank=True, null=True)
    number_of_hard_questions = models.PositiveIntegerField(blank=True, null=True)
    questions = models.ManyToManyField(Assignments)

    def __str__(self):
        return self.title

class AssessmentItem_v2(models.Model):

    sections_type = models.CharField(max_length=3, choices = CONTENT_ITEM_TYPES)
    title = models.CharField(max_length=100,default='a')
    priority_order = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    set_count = models.IntegerField(default=0)
    coding_problem = models.ManyToManyField(ProblemSet, blank=True)
    mcq = models.ManyToManyField(MCQSet, blank=True)
    subjective = models.ManyToManyField(SubjectiveSet, blank=True)
    section_cutoff = models.FloatField(default=0)
    Total_marks = models.IntegerField(default=0)
    assessment = models.ForeignKey(Assessment_v2, on_delete=models.CASCADE)
    time_duration = models.CharField(max_length=4, blank=True)
    easy_question_marks   = models.PositiveIntegerField(default=1)
    medium_question_marks = models.PositiveIntegerField(default=2)
    hard_question_marks   = models.PositiveIntegerField(default=3)

    def __str__(self):
        return f"{self.id} | {self.sections_type} | {self.assessment}"

    class Meta:
        verbose_name = 'Assessment Item v2'
        verbose_name_plural = 'Assessment Items v2'

class AssessmentEvaluation_v2(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    test_id = models.CharField(max_length=100, blank=True)
    responsesheet = models.TextField()
    mcq_score = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    subjective_assignment_score = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    coding_section_score = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    total_marks = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    judgement = models.TextField()
    submission_time = models.DateTimeField(default=datetime.now)
    

    def __str__(self):
        return f"Assessment Evaluation for {self.user.username}"

    class Meta:
        verbose_name = 'Assessment Evaluation v2'
        verbose_name_plural = 'Assessment Evaluations v2'


class OpenAssessmentEvaluation_V2(models.Model):
    name = models.CharField(max_length=255)
    email = models.CharField(max_length=255)
    mobile = models.CharField(max_length=10)
    test_id = models.CharField(max_length=100)
    responsesheet = models.TextField()
    resultSheet = models.TextField(blank=True)
    subjective_assignment_score = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    mcq_score = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    coding_problem_score = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    total_marks = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    judgement = models.TextField()
    submission_date = models.DateTimeField(default=now)
    graded = models.BooleanField(default=False)

    def __str__(self):
        return f"Assessment Evaluation for {self.name}"

    class Meta:
        verbose_name = 'Open Assessment V2 Evaluation'
        verbose_name_plural = 'Open Assessment V2 Evaluations'

class AsessmentResultMeta(models.Model):
    student_name = models.CharField(max_length=255)
    email = models.CharField(max_length=255)
    test_id = models.CharField(max_length=255)
    submission_id = models.CharField(max_length=255)
    assessment_item_name = models.CharField(max_length=255)
    obtained_marks = models.IntegerField(default=0)
    max_marks = models.IntegerField(default=0)
    evaluated_at = models.DateTimeField(default=now)
    submitted_at = models.DateTimeField(default=now)
    violations = models.IntegerField(default=0)
    time_taken= models.IntegerField(default= 0)
        
class AssessmentResultVerbose(models.Model):
    student_name = models.CharField(max_length=255)
    email = models.CharField(max_length=255)
    test_id = models.CharField(max_length=255)
    submission_id = models.CharField(max_length=255)
    assessment_item_name = models.CharField(max_length=255)
    question_type = models.CharField(max_length=3, choices = CONTENT_ITEM_TYPES)
    question_id   = models.IntegerField(blank = False)
    difficulty = models.IntegerField(blank = False)
    obtained_marks = models.IntegerField( default=0)
    max_marks = models.IntegerField(default=0)
    parent_topic = models.CharField(max_length=255)
    evaluated_at = models.DateTimeField(default=now)
    submitted_at = models.DateTimeField(default=now)