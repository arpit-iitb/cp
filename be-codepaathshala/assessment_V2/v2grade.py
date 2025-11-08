import json

from assessment_V2.models import AssessmentItem_v2
from batches.models import MCQQuestions, Problem


answer_map = {
    'a': 'A',
    'b': 'B',
    'c': 'C',
    'd': 'D'
}

def grade_submission(submission, assessment):
    try:
        # Parse the response sheet
        json_str = submission.responsesheet.replace("'", '"')
        data = json.loads(json_str)
    except json.JSONDecodeError:
        print(f"Failed to decode JSON for submission {submission.id}")
        return None

    if not submission.graded:
        mcq_score = 0
        coding_score = 0
        assessment_scores = []

        # Grade MCQ answers
        if 'assessment_items' in data:
            for mcq_item in data['assessment_items']:
                if mcq_item['type'] == 'mcq' and 'answers' in mcq_item:
                    assessment_item = AssessmentItem_v2.objects.get(title=mcq_item['title'], assessment=assessment)
                    marking_scheme = [assessment_item.easy_question_marks, assessment_item.medium_question_marks, assessment_item.hard_question_marks]
                    print("mcq section marks", marking_scheme)
                    item_score = 0
                    for answer in mcq_item['answers']:
                        answer_key = next(iter(answer))  # Assuming each answer has one key
                        id = int(answer_key[3:])
                        mcq_question = MCQQuestions.objects.get(id=id)
                        res_answer = answer[answer_key]
                        if len(res_answer) > 0:
                            if answer_map.get(res_answer) == mcq_question.correct_answer:
                                mcq_score += marking_scheme[int(mcq_question.difficulty_level)-1]
                                item_score += marking_scheme[int(mcq_question.difficulty_level)-1]

                    assessment_scores.append({
                        "type": mcq_item['type'],
                        "title": mcq_item['title'],
                        "section_score": item_score
                    })

            # Grade coding answers
            for coding_item in data['assessment_items']:
                if coding_item['type'] == 'coding' and 'answers' in coding_item:
                    assessment_item = AssessmentItem_v2.objects.get(title=coding_item['title'], assessment=assessment)
                    marking_scheme = [assessment_item.easy_question_marks, assessment_item.medium_question_marks, assessment_item.hard_question_marks]
                    print("coding section marking scheme", marking_scheme)
                    item_score = 0
                    for answer in coding_item['answers']:
                        answer_key = next(iter(answer))  # Assuming each answer has one key
                        problem = Problem.objects.get(id=answer_key)
                        level = int(problem.difficulty_level)
                        res_answer = answer[answer_key]
                        if len(res_answer) > 0:
                            coding_score += (float(res_answer) / 100) *  marking_scheme[level-1]
                            item_score += (float(res_answer) / 100) * marking_scheme[level-1]

                    assessment_scores.append({
                        "type": coding_item['type'],
                        "title": coding_item['title'],
                        "section_score": item_score
                    })

        # Update submission scores
        print(mcq_score, coding_score, assessment_scores)
        submission.mcq_score = mcq_score
        submission.coding_problem_score = coding_score
        submission.total_marks = submission.mcq_score + submission.coding_problem_score
        submission.graded = True
        submission.resultSheet = json.dumps(assessment_scores)
        submission.save()

        return submission

    return None