from django.shortcuts import get_object_or_404
from batches.models import MCQAssignment, MCQQuestions, MultiCorrectMCQs
import ast

answer_map = {
    1: 'A',
    2: 'B',
    3: 'C',
    4: 'D',
}
# Mapping from option letters to indices
option_mapping = {'A': 1, 'B': 2, 'C': 3, 'D': 4}

# Function to convert correct answer string to a list of integers
def correct_answer_to_list(correct_answer):
    # Split the correct answer string by commas and strip whitespace from each part
    cleaned_correct_answer = [option.strip() for option in correct_answer.split(',')]
    return [1 if option in cleaned_correct_answer else 0 for option in option_mapping.keys()]


def calculate_marks(single_answers, multi_answers):
    total_marks = 0
    max_marks = 0
    correct_question_ids = []
    incorrect_question_ids = []
    # calculating scoring for single correct mcqs
    for question_id, user_answer in single_answers.items():
        question_id = question_id[2:]
        print(question_id)
        # print("hi", user_answer)
        if len(str(user_answer)) > 0:
            print(user_answer)
            user_answer = answer_map[user_answer]
            print(user_answer)
        question = get_object_or_404(MCQQuestions, id=question_id)
        print("Hi there" , question.correct_answer)
        
        difficulty = question.difficulty_level
        if difficulty == 1:
            max_marks += 1
        elif difficulty == 2:
            max_marks += 2
        else:
            max_marks +=3

        if user_answer.strip().lower() == question.correct_answer.strip().lower():
            correct_question_ids.append("sc"+question_id)
            if question.difficulty_level == 1:
                total_marks += 1
            elif question.difficulty_level == 2:
                total_marks += 2
            else:
                total_marks += 3
        else:
            incorrect_question_ids.append("sc"+question_id)

    # calculating scoring for multi correct mcqs
    for question_id, user_answer in multi_answers.items():
        print("inside multi correct question")
        question_id = question_id[2:]
        if len(str(user_answer)) > 0:
            user_answer_raw = ast.literal_eval(str(user_answer))
            user_answer_list = [0, 0, 0, 0]
            for answer in user_answer_raw:
                user_answer_list[answer-1] = 1
        else:
            user_answer_list = []
        question = get_object_or_404(MultiCorrectMCQs, id=question_id)
        correct_answer_str = question.correct_answers
        print(user_answer, correct_answer_str)
        correct_answer_list = correct_answer_to_list(correct_answer_str)
        

        difficulty = question.difficulty_level
        if difficulty == 1:
            max_marks += 1
        elif difficulty == 2:
            max_marks += 2
        else:
            max_marks +=3

        print(user_answer_list, correct_answer_list)
        if user_answer_list == correct_answer_list:
            correct_question_ids.append("mc"+question_id)
            if question.difficulty_level == 1:
                total_marks += 1
            elif question.difficulty_level == 2:
                total_marks += 2
            else:
                total_marks += 3
        else:
            incorrect_question_ids.append("mc"+question_id)
    return total_marks, max_marks, correct_question_ids, incorrect_question_ids


def calculate_assessment_mcq_marks(single_answers, multi_answers, easy_marks, medium_marks, hard_marks):
    total_marks = 0
    max_marks = 0
    correct_question_ids = []
    incorrect_question_ids = []
    print("Multiple answers")
    # calculating scoring for single correct mcqs
    for question_id, user_answer in single_answers.items():
        question_id = question_id[2:]
        print(question_id)
        if len(str(user_answer)) > 0:
            # print(user_answer)
            user_answer = answer_map[user_answer]
            # print(user_answer)
        question = get_object_or_404(MCQQuestions, id=question_id)
        # print(question.correct_answer)
        
        difficulty = question.difficulty_level
        if difficulty == 1:
            max_marks += int(easy_marks)
        elif difficulty == 2:
            max_marks += int(medium_marks)
        else:
            max_marks += int(hard_marks)

        if user_answer.strip().lower() == question.correct_answer.strip().lower():
            correct_question_ids.append("sc"+question_id)
            if question.difficulty_level == 1:
                total_marks += int(easy_marks)
            elif question.difficulty_level == 2:
                total_marks += int(medium_marks)
            else:
                total_marks += int(hard_marks)
        else:
            incorrect_question_ids.append("sc"+question_id)

    # calculating scoring for multi correct mcqs
    for question_id, user_answer in multi_answers.items():
        question_id = question_id[2:]
        if len(str(user_answer)) > 0:
            user_answer_raw = ast.literal_eval(str(user_answer))
            user_answer_list = [0, 0, 0, 0]
            for answer in user_answer_raw:
                user_answer_list[answer-1] = 1
        else:
            user_answer_list = []
        question = get_object_or_404(MultiCorrectMCQs, id=question_id)
        correct_answer_str = question.correct_answers
        correct_answer_list = correct_answer_to_list(correct_answer_str)
        

        difficulty = question.difficulty_level
        if difficulty == 1:
            max_marks += int(easy_marks)
        elif difficulty == 2:
            max_marks += int(medium_marks)
        else:
            max_marks += int(hard_marks)

        if user_answer_list == correct_answer_list:
            correct_question_ids.append("mc"+question_id)
            if question.difficulty_level == 1:
                total_marks += int(easy_marks)
            elif question.difficulty_level == 2:
                total_marks += int(medium_marks)
            else:
                total_marks += int(hard_marks)
        else:
            incorrect_question_ids.append("mc"+question_id)
    return total_marks, max_marks, correct_question_ids, incorrect_question_ids

def max_marks_mcq_assignment(assignment_id):
    try:
        assignment = MCQAssignment.objects.get(id=assignment_id)
    except MCQAssignment.DoesNotExist:
        return "Assignment not found."

    difficulty_marks = {1: 1, 2: 2, 3: 3}  # Easy: 1 mark, Medium: 2 marks, Hard: 3 marks
    total_score = 0

    # Calculate score for single correct MCQs
    for question in assignment.questions.all():
        total_score += difficulty_marks.get(question.difficulty_level, 0)

    # Calculate score for multi-correct MCQs
    for question in assignment.multicorrectmcqs.all():
        total_score += difficulty_marks.get(question.difficulty_level, 0)

    return total_score