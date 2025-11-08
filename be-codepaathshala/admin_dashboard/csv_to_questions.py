from batches.models import MCQQuestions, MultiCorrectMCQs
import math

def csv_to_questions(data):
    try:
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

    #Validataion
    for row in range(0, len(mcq_question)):
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

        try:
            if math.isnan(topic[row]):
                return (f"Error in Row {row + 2}! Topic Not provided not provided")
        except:
            pass

        if difficulty[row] == 1 or difficulty[row] == 2 or difficulty[row] == 3:
            pass
        else:
            return (f"Error in Row {row + 2}! Difficulty should be 1/2/3")

    single_question_list        = []
    multiple_question_list      = []

    for row in range(0, len(mcq_question)):
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
    
    MCQQuestions.objects.bulk_create(single_question_list)
    MultiCorrectMCQs.objects.bulk_create(multiple_question_list)
    return "Questions Created"