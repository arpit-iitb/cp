DIFFICULTY_LEVEL = {
    'HARD': 3,
    'MEDIUM': 2,
    'EASY': 1,
    'ALL_STATUS': (
        (3, "hard"),
        (2, "medium"),
        (1, "easy")
    )
}

MCQ_OPTIONS = {
    'OPTION_A':'A',
    'OPTION_B':'B',
    'OPTION_C':'C',
    'OPTION_D':'D',
    'ALL_OPTIONS':(
        ('A', 'option_A'),
        ('B', 'option_B'),
        ('C', 'option_C'),
        ('D', 'option_D'),
    )
}

LANGUAGE_CHOICES = (
    ('python', 'Python'),
    ('java', 'Java'),
    ('cpp', 'C++'),
    ('sql', 'sql'),
    ('javascript', 'javascript'),
    # Add more languages as needed
)

CONTENT_ITEM_TYPES = (
        ('P', 'CodingProblem'),
        ('A', 'SubjectiveAssignment'),
        ('M', 'MCQAssignment'),
        ('V', 'VideoTutorial'),
        ('T', 'Text')
)