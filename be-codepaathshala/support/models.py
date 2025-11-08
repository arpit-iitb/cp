from django.db import models

from accounts.models import User
from batches.models import Assignments, MCQAssignment, Problem, VideoLectures

# Create your models here.

class ReportAnIssue(models.Model):
    DISCUSSION_TYPES = (
        ('P', 'P'),
        ('V', 'V'),
        ('A', 'A'),
        ('M', 'M'),
    )
    type = models.CharField(max_length=1, choices=DISCUSSION_TYPES)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    issue_description = models.TextField()
    problem = models.ForeignKey(Problem, on_delete=models.CASCADE, null=True, blank=True)
    video = models.ForeignKey(VideoLectures, on_delete=models.CASCADE, null=True, blank=True)
    assignment = models.ForeignKey(Assignments, on_delete=models.CASCADE, null=True, blank=True)
    mcq_assignment = models.ForeignKey(MCQAssignment, on_delete=models.CASCADE, null=True, blank=True)
    created_on = models.DateTimeField(auto_now_add=True)
    resolved = models.BooleanField(default=False)

    def _str_(self):
        return f"{self.id} | {self.type} | {self.user}"
    

    class Meta:
        verbose_name = "ReportAnIssue"
        verbose_name_plural = "ReportAnIssue"