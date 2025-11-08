from django.db import models
from codingjudge.enum import DIFFICULTY_LEVEL, LANGUAGE_CHOICES, MCQ_OPTIONS
from django.contrib.contenttypes.fields import GenericForeignKey, GenericRelation
from django.contrib.contenttypes.models import ContentType

class Client(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(null=True,blank=True)
    client_id_vimeo = models.CharField(max_length=100, blank=True)
    project_id_vimeo = models.CharField(max_length=100, blank=True)
    logo=models.URLField(blank=True)
    email = models.EmailField(max_length=254, blank=True)
    clientId = models.CharField(max_length=50, blank=True)
    phone_number = models.CharField(max_length=15, blank=True)
    website = models.URLField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class Topic(models.Model):
    name = models.CharField(max_length=255, verbose_name="Topic Name")
    def __str__(self):
        return self.name
    

class Batch(models.Model):
    client = models.ForeignKey(Client, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    weekly_topics = models.TextField(blank=True)
    description=models.TextField(blank=True)
    language = models.CharField(max_length=200, verbose_name="default language", blank=True)
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.name
    
    class Meta:
        db_table = 'batch'

class ChildBatch(models.Model):
    parentbatch = models.ForeignKey(Batch, on_delete=models.CASCADE)
    client = models.ForeignKey(Client, on_delete=models.SET_NULL, null=True, blank=True)
    name = models.CharField(max_length=100)
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name}"



class Problem(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    img_urls = models.TextField(blank=True)
    input_format = models.TextField()
    output_format = models.TextField()
    output_format = models.TextField()
    constraints = models.TextField()
    difficulty_level = models.IntegerField(choices=DIFFICULTY_LEVEL.get('ALL_STATUS'))
    full_stack_evaluation = models.BooleanField(default=False)
    csv_link = models.CharField(max_length=1000, null=True,blank=True)
    precode = models.TextField(blank=True)
    solution = models.TextField(null=True,blank=True)
    topics = models.ManyToManyField(Topic, verbose_name="Topics", blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.title

    class Meta:
        db_table = 'problem'

class ProblemReport(models.Model):
    problem_id = models.ForeignKey('Problem', on_delete=models.CASCADE)
    email = models.EmailField()
    username = models.CharField(max_length=100)
    issue_description = models.TextField()
    your_code = models.TextField(blank=True, null=True)
    contact_number = models.CharField(max_length=15, blank=True, null=True)

    def __str__(self):
        return f"Problem Report - {self.problem_id} - {self.username}"   

class VideoLectures(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    link = models.CharField(max_length=2550,blank=True)
    pptLink=models.CharField(max_length=2550,blank=True)
    docsLink=models.CharField(max_length=2550,blank=True)
    difficulty_level = models.IntegerField(choices=DIFFICULTY_LEVEL.get('ALL_STATUS'))
    duration = models.DurationField(null=True,blank=True)
    transcript = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    practice_questions = models.TextField(blank=True, null= True)

    def __str__(self):
        return self.title
    
    class Meta:
        db_table = 'video_lecture'
        
class Assignments(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    difficulty_level = models.IntegerField(choices=DIFFICULTY_LEVEL.get('ALL_STATUS'))
    grading_prompt = models.TextField(blank=True)
    solution = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

    class Meta:
        db_table = 'assignments'

class Text(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    difficulty_level = models.IntegerField(choices=DIFFICULTY_LEVEL.get('ALL_STATUS'))
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title


class MCQQuestions(models.Model):
    question_text = models.TextField(verbose_name="Question Text")
    option_a = models.CharField(max_length=2000, verbose_name="Option A")
    option_b = models.CharField(max_length=2000, verbose_name="Option B")
    option_c = models.CharField(max_length=2000, verbose_name="Option C")
    option_d = models.CharField(max_length=2000, verbose_name="Option D")
    correct_answer = models.CharField(
        max_length=1,
        choices=[
            ('A', 'Option A'),
            ('B', 'Option B'),
            ('C', 'Option C'),
            ('D', 'Option D'),
        ],
        verbose_name="Correct Answer"
    )
    difficulty_level = models.IntegerField(choices=DIFFICULTY_LEVEL.get('ALL_STATUS'))
    topic = models.CharField(max_length=255,default="", verbose_name="Topic")

    def __str__(self):
        return f"{self.topic} | {self.difficulty_level} | {self.question_text}"


    class Meta:
        verbose_name = "MCQ_Question"
        verbose_name_plural = "MCQ_Questions"

class MultiCorrectMCQs(models.Model):
    question_text = models.TextField(verbose_name="Question Text")
    option_a = models.CharField(max_length=2000, verbose_name="Option A")
    option_b = models.CharField(max_length=2000, verbose_name="Option B")
    option_c = models.CharField(max_length=2000, verbose_name="Option C")
    option_d = models.CharField(max_length=2000, verbose_name="Option D")
    correct_answers = models.CharField(max_length=255, verbose_name="Correct Answers (Multi-select)")
    difficulty_level = models.IntegerField(choices=DIFFICULTY_LEVEL.get('ALL_STATUS'))
    topic = models.CharField(max_length=255, default="", verbose_name="Topic")

    def __str__(self):
        return f"{self.topic} | {self.difficulty_level} | {self.question_text}"

    class Meta:
        verbose_name = "Multi Correct MCQ"
        verbose_name_plural = "Multi Correct MCQs"



# Create your models here.
class MCQAssignment(models.Model):
    title = models.CharField(max_length=255, verbose_name="Title")
    description = models.TextField(verbose_name="Description")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    difficulty_level = models.IntegerField(choices=DIFFICULTY_LEVEL.get('ALL_STATUS'))
    single_correct_mcqs_count = models.IntegerField(null=True, blank=True)
    questions = models.ManyToManyField(MCQQuestions, verbose_name="Select Question",related_name='MCQsetA', blank=True)
    multicorrectmcqs = models.ManyToManyField(MultiCorrectMCQs, verbose_name="Select Multi Correct MCQs",related_name='MCQsetB', blank=True)
    isTimedAssignment=models.BooleanField(default=False, verbose_name="Timed Assignment")
    timer=models.CharField(verbose_name="Problem Time in minutes",blank=True,max_length=255)
    def __str__(self):
        return f"{self.id} | {self.title} | {self.updated_at}"
    
    

class Lesson(models.Model):
    # Define choices for lesson types
    LESSON_TYPES = (
        ('P', 'P'),
        ('V', 'V'),
        ('A', 'A'),
        ('M', 'M'),
        ('T', 'T')
    )

    # Define fields for Lesson model
    type = models.CharField(max_length=1, choices=LESSON_TYPES)
    priority_order = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    week_number = models.PositiveIntegerField()
    # Add other fields as needed
    attempts=models.IntegerField(null=True,blank=True,default=None)

    # Define a foreign key to link with specific type
    problem = models.ForeignKey(Problem, on_delete=models.CASCADE, null=True, blank=True)
    video = models.ForeignKey(VideoLectures, on_delete=models.CASCADE, null=True, blank=True)
    assignment = models.ForeignKey(Assignments, on_delete=models.CASCADE, null=True, blank=True)
    MCQ_assignment = models.ForeignKey(MCQAssignment, on_delete=models.CASCADE, null=True, blank=True)
    Text = models.ForeignKey(Text, on_delete=models.CASCADE, null=True, blank=True)

    batch = models.ForeignKey(Batch, on_delete=models.CASCADE)

    def _str_(self):
        return f"{self.id} | {self.type} | {self.priority_order} | {self.week_number} "

    class Meta:
        db_table = 'lesson'


# Define a model for test cases
class TestCase(models.Model):
    problem = models.ForeignKey(Problem, on_delete=models.CASCADE, related_name='test_cases')
    input_data = models.TextField(verbose_name="Input Data")
    expected_output = models.TextField(verbose_name="Expected Output")

    class Meta:
        db_table = 'testcase'



# Define a model for language-specific template code
class TemplateCode(models.Model):
    problem = models.ForeignKey(Problem, on_delete=models.CASCADE, related_name='template_codes')
    
    # Language choices for the template code
    language = models.CharField(max_length=10, choices=LANGUAGE_CHOICES, default='python')
    code = models.TextField(verbose_name="Template Code")

    class Meta:
        db_table = 'template_code'




