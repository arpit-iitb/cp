from django.db import models

from accounts.models import User
from batches.models import Assignments, ChildBatch, MCQAssignment, Problem, VideoLectures

# Create your models here.
class Discussion(models.Model):
    DISCUSSION_TYPES = (
        ('P', 'Problem'),
        ('V', 'VideoLectures'),
        ('A', 'Assignments'),
        ('M', 'MCQQuestion'),
        ('F', 'FullStack'),
    )
    type = models.CharField(max_length=1, choices=DISCUSSION_TYPES)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    discussion_text = models.TextField()
    likes = models.IntegerField(default=0)
    problem = models.ForeignKey(Problem, on_delete=models.CASCADE, null=True, blank=True)
    video = models.ForeignKey(VideoLectures, on_delete=models.CASCADE, null=True, blank=True)
    assignment = models.ForeignKey(Assignments, on_delete=models.CASCADE, null=True, blank=True)
    mcq_assignment = models.ForeignKey(MCQAssignment, on_delete=models.CASCADE, null=True, blank=True)
    batch= models.ForeignKey(ChildBatch,on_delete=models.CASCADE, null=True, blank=True)
    created_on = models.DateTimeField(auto_now_add=True)


    def _str_(self):
        return f"{self.id} | {self.type} | {self.user}"
    

    class Meta:
        verbose_name = "Discussion"
        verbose_name_plural = "Discussions"
        