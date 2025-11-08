from django.db import models
from django.contrib.auth.hashers import make_password, check_password
from batches.models import Client, MCQAssignment, Problem, VideoLectures, Assignments, ChildBatch

from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.db import models
from django.utils.translation import gettext as _

from .managers import CustomUserManager

class User(AbstractBaseUser, PermissionsMixin):
    username = models.CharField(default="",unique=True, max_length=50, null=True)
    email = models.EmailField(max_length=255, unique=True, null=True)
    name = models.CharField(max_length=150, null=True,blank=True)
    phone_number = models.CharField(max_length=20, unique=True, null=True,blank=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True,null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True,null=True, blank=True)
    
    objects = CustomUserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ('username',)


    def __str__(self):
        return f"{self.username} : {self.email}"

    class Meta:
        ordering = ("-created_at",)


    @staticmethod
    def is_username_available(username):
        user = User.objects.filter(username=username)
        if user.exists():
            return False
        return True
    
    @staticmethod
    def is_email_available(email):
        user = User.objects.filter(email=email)
        if user.exists():
            return False
        return True
    
    @staticmethod
    def is_password_valid(password,hash_password):
        return check_password(password, hash_password)
    
    # def save(self, *args, **kwargs):
    #     if self._state.adding or 'password' in self.__dict__:
    #         self.password = make_password(self.password)
    #     super().save(*args, **kwargs)


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    client = models.ForeignKey(Client, on_delete=models.CASCADE, blank=True, related_name='client', default=2)
    program = models.CharField(max_length=100, blank=True, verbose_name='program name')
    streak = models.IntegerField(default=0)
    solved_problem_count = models.IntegerField(default=0)
    # total_submission = models.IntegerField(default=0)
    assosiatedbatches = models.ManyToManyField(ChildBatch, related_name='assosiated_batches', blank=True)
    solved_problems = models.ManyToManyField(Problem, related_name='solved_by_users', blank=True)
    watched_videos = models.ManyToManyField(VideoLectures, related_name='watched_by_users', blank=True)
    assignment_Submission = models.ManyToManyField(Assignments, related_name='submitted_by_users', blank=True)
    mcq_assignments = models.ManyToManyField(MCQAssignment, related_name="mcq_assignments", blank=True)
    max_streak = models.IntegerField(default=0)
    total_Score = models.IntegerField(default=0)
    current_streak = models.IntegerField(default=0)
    last_login = models.DateTimeField(null=True, blank=True)
    last_submission_date = models.DateField(null=True, blank=True)
    linkedin_url = models.URLField(blank=True, verbose_name='LinkedIn URL')
    github_url = models.URLField(blank=True, verbose_name='GitHub URL')
    created_at = models.DateTimeField(auto_now_add=True,null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True,null=True, blank=True)
    
    def __str__(self):
        return self.user.username
    class Meta:
        db_table = 'user_profile'


class UserSessions(models.Model):
    # username = models.CharField(default="", max_length=50, blank=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='session_profile', blank=True, null=True)
    session_start = models.DateTimeField(null=True, blank=True)
    session_end = models.DateTimeField(null=True, blank=True)
    ended = models.BooleanField(default=False)

class Otp(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='otps')
    otp = models.IntegerField()
    creation_time = models.DateTimeField()