import ast
from openai import OpenAI
from decouple import config
client = OpenAI(
    api_key= config("openai_api_key")
)

def AI_evaluation(problem_description, user_solution, correct_solution, grading_scheme):

    sys_prompt = f'''
    You will be provided with problem Description, grading scheme and correct solution. You task is to grade the user input and you will have to return the final score and feedback in json format with key final_score and feedback. 
    problem Description:
    {problem_description}

    Correct solution:
    {correct_solution}

    Grading Scheme:
    {grading_scheme}
    '''

    completion = client.chat.completions.create(
    model="gpt-3.5-turbo",
    max_tokens=4000,
    messages=[
        {"role": "system", "content": sys_prompt},
        {"role": "user", "content": user_solution }
    ],

)

    print("LLM response received successfully")
    message = completion.choices[0].message
    result = ast.literal_eval(message.content)

    return result


