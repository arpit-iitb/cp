from batches.models import MCQAssignment, MCQQuestions, Lesson, MultiCorrectMCQs, Batch
import math
from collections import defaultdict

#NOTE- data is a pandas Dataframe
def csv_to_mcq(data, batch_name):
  try:
    week = data['Week'].tolist()
    assignment_name = data['Assignment Name'].tolist()
    mcq_question = data['MCQ question'].tolist()
    mcq_type = data['MCQ Type'].tolist()
    option_a = data['Option A'].tolist()
    option_b = data['Option B'].tolist()
    option_c = data['Option C'].tolist()
    option_d = data['Option D'].tolist()
    correct_option = data['Correct Option'].tolist()
    difficulty = data['Difficulty'].tolist()
    topic = data['Topic'].tolist()
  except:
    return "Error in accessing fields"
  
  #CSV validation
  for row in range(0, len(mcq_question)):
    try:  
      if (math.isnan(week[row])):
        return (f"Error in Row {row + 2}! Week Number not provided")
      if (int(week[row]) <= 0) :
        return (f"Error in Row {row + 2}! Week Number must be a number and greater than 0")
    except:
      return (f"Error in Row {row + 2}! Week Number must be a number and greater than 0")
    
    try:
      if math.isnan(assignment_name[row]):
        return (f"Error in Row {row + 2}! Assignment Name not provided")
    except:
      pass

    try:
      if  math.isnan(mcq_question[row]):
        return (f"Error in Row {row + 2}! MCQ question not provided")
    except:
      pass

    if mcq_type[row] == 's':
      if correct_option[row] not in ['A','B','C','D']: 
        return (f"Error in Row {row + 2}! Wrong format for single correct options")
      
    elif mcq_type[row] == 'm':
      correct_options = correct_option[row].split(',')
      if set(correct_options).issubset({'A','B','C','D'}): 
        pass
      else: 
        return (f"Error in Row {row + 2}! Wrong format for multi correct options")
    else:
      return (f"Error in Row {row + 2}! Wrong MCQ type should be s/m")
    
    # if math.isnan(option_a[row]) or math.isnan(option_b[row]) or math.isnan(option_c[row]) or math.isnan(option_d[row]):
    #   return (f"Error in Row {row + 2}! Options Not provided not provided")
    
    try:
      if math.isnan(topic[row]):
        return (f"Error in Row {row + 2}! Topic Not provided not provided")
    except:
      pass

    if difficulty[row] == 1 or difficulty[row] == 2 or difficulty[row] == 3:
      pass
    else:
      return (f"Error in Row {row + 2}! Difficulty should be 1/2/3")

  #Getting Batch Name
  batch = Batch.objects.get(name = batch_name)


  single_question_list        = []
  multiple_question_list      = []
  unique_assignment_name      = set()
  assignment_vs_single        = defaultdict(list)
  assignment_vs_multiple      = defaultdict(list)
  assignment_vs_week          = {} 
  assignment_list             = []

# Creating Questions
  for row in range(0, len(mcq_question)):
    unique_assignment_name.add(assignment_name[row])

    assignment_vs_week[assignment_name[row]] = week[row]
    if mcq_type[row] == 's':
      question = MCQQuestions(
        question_text = mcq_question[row],
        option_a = option_a[row],
        option_b = option_b[row],
        option_c = option_c[row],
        option_d = option_d[row],
        correct_answer = correct_option[row],
        difficulty_level = difficulty[row],
        topic = topic[row]
      )
      single_question_list.append(question)
      assignment_vs_single[assignment_name[row]].append(question)

    elif mcq_type[row] == 'm':
      question = MultiCorrectMCQs(
        question_text = mcq_question[row],
        option_a = option_a[row],
        option_b = option_b[row],
        option_c = option_c[row],
        option_d = option_d[row],
        correct_answers = correct_option[row],
        difficulty_level = difficulty[row],
        topic = topic[row]
      )
      multiple_question_list.append(question)
      assignment_vs_multiple[assignment_name[row]].append(question)

# Creating Assignments
  for assignment in unique_assignment_name:
      mcqassign = MCQAssignment(
        title = assignment,
        description = "",
        difficulty_level = 1,#this is a required field need to be removed if we choose to remove this field from the model
      )
      assignment_list.append(mcqassign)

#Saving Assignments, Questions to DB
  MCQQuestions_list     = MCQQuestions.objects.bulk_create(single_question_list)
  MultiCorrectMCQs_list = MultiCorrectMCQs.objects.bulk_create(multiple_question_list)
  MCQAssignment_list    = MCQAssignment.objects.bulk_create(assignment_list)


#Updating Assignments and Creating Lessons
  lesson_list = []
  for mcq_assignment in MCQAssignment_list:
    mcq_assignment_name = mcq_assignment.title
    mcq_assignment.questions.add(*(assignment_vs_single[mcq_assignment_name]))
    mcq_assignment.multicorrectmcqs.add(*(assignment_vs_multiple[mcq_assignment_name]))
    lesson = Lesson(
      type = 'M',
      priority_order = 0.0,
      week_number = assignment_vs_week[mcq_assignment_name],
      MCQ_assignment = mcq_assignment,
      batch = batch
    )
    lesson_list.append(lesson)

  # MCQAssignment_list    = MCQAssignment.objects.bulk_update(MCQAssignment_list)
  Lesson_list           = Lesson.objects.bulk_create(lesson_list)

  return "Assignments Created"
