from datetime import datetime
from django.db import models
from accounts.models import User
from batches.models import Assignments, MCQAssignment, Problem
from codingjudge.enum import CONTENT_ITEM_TYPES


# Define a model to store code submissions
class CodeSubmission(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    problem = models.ForeignKey(Problem, on_delete=models.CASCADE)
    source_code = models.TextField()
    batch_name = models.CharField(max_length=200, default="default")
    passed_testcases = models.CharField(max_length=20, default=0)
    failed_testcases = models.CharField(max_length=20, default=0)
    language_id = models.CharField(max_length=20, default=0)
    judgment = models.CharField(max_length=20)  # Accepted, Wrong Answer, etc.
    submission_date = models.DateTimeField(default=datetime.now)
    score = models.IntegerField(null=True)
    time_taken = models.CharField(max_length=50, default="0")

    @classmethod
    def get_submission_count(cls, user, problem):
        return cls.objects.filter(user=user, problem=problem).count()

    def __str__(self):
        return f"Submission by {self.user.username} for Problem '{self.problem.title}'"

class AssignmentSubmission(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    assignment = models.ForeignKey(Assignments, on_delete=models.CASCADE)
    text_source = models.TextField()
    file=models.URLField()
    batch_name = models.CharField(max_length=200, default="default")
    submission_date = models.DateTimeField(auto_now_add=True)
    score = models.CharField(max_length=255, blank = True)
    feedback = models.TextField(blank=True)
    @classmethod
    def get_submission_count(cls, user, assignment):
        return cls.objects.filter(user=user, assignment=assignment).count()
    def __str__(self):
        return f"Submission by {self.user.username} for Assignment '{self.assignment.title}'"


# MCQ Submission
class MCQSubmission(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    responseSheet = models.TextField()
    mcq=models.ForeignKey(MCQAssignment, on_delete=models.CASCADE)
    score = models.CharField(max_length=10, blank=True, verbose_name='total_score')
    result = models.CharField(max_length=10, blank=True, verbose_name='result')
    batch_name = models.CharField(max_length=200, default="default")
    correct_question_ids=models.TextField(default='',blank=True)
    wrong_question_ids=models.TextField(default='',blank=True)
    submission_date = models.DateTimeField(auto_now_add=True)
    @classmethod
    def get_submission_count(cls, user, mcq):
        return cls.objects.filter(user=user, mcq=mcq).count()

    def __str__(self):
        return f"Submission by {self.user.username} for MCQ Assignment '{self.mcq.title}'"

def user_directory_path(instance, filename):
    # File will be uploaded to MEDIA_ROOT/phone_number/<filename>
    return '{0}/{1}'.format(instance.user.phone_number, filename)

    
class AssignmentSubmissionFile(models.Model):
   user = models.ForeignKey(User, on_delete=models.CASCADE)
   file=models.FileField(upload_to=user_directory_path)
   batch_name = models.TextField(blank=True, max_length=200)
   other_info = models.TextField(blank=True, max_length=200)

   def __str__(self):
        return f'{self.user.username} - {self.file.name}'
   

class UserScoreData(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    content_id = models.CharField(max_length=10)
    type = models.CharField(max_length=3, choices=CONTENT_ITEM_TYPES)
    title = models.CharField(max_length=200)
    score = models.CharField(max_length=10, blank=True, verbose_name='score')
    maximum_possible_score = models.CharField(max_length=10, blank=True)
    batch_name = models.CharField(max_length=200, default="default")

    def __str__(self):
        return f"{self.user.username} score for {self.title}-{self.type}"


class UserActivity(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    content_type = models.CharField(max_length=3, choices=CONTENT_ITEM_TYPES)
    batch_name = models.CharField(max_length=200, default="default")
    submission_date = models.DateTimeField(default=datetime.now)