import base64
from django.utils import timezone
from datetime import datetime
from decouple import config
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
import requests
import pandas as pd
from accounts.models import UserProfile
from batches.models import Problem
from submissions.problem.ds_batch_evaluation import evaluate
from submissions.models import CodeSubmission, UserScoreData


base_url = config("JUDGE0_API_SITE_URL")
url = config("JUDGE0_API_SITE_URL")+"submissions/batch?base64_encoded=false"
headers = {
    "content-type": "application/json",
}

# url = "https://judge0-ce.p.rapidapi.com/submissions/batch"
# querystring_post = {"base64_encoded":"false"}
# headers = {
#     "content-type": "application/json",
#     "Content-Type": "application/json",
#     "X-RapidAPI-Key": config("API_KEY"),
#     "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com"
# }

# headers_get_request = {
#     "X-RapidAPI-Key": config("API_KEY"),
#     "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com"
# }


def CreateProblemSubmission(user, source_code, language_id, stdin, time_taken, batch_name, id):

    problem = Problem.objects.get(pk=id)
    has_python_pandas = problem.topics.filter(name="python-pandas").exists()
    if has_python_pandas:
        # URL of the CSV file
        csv_url = problem.csv_link
        csv_url = csv_url.split(',')
        if len(csv_url) == 1:
            df = pd.read_csv(csv_url[0])
            df_str = df.to_csv(index=False)
            source_code = f'''
import pandas as pd
import io

# Convert string back to DataFrame
df = pd.read_csv(io.StringIO({repr(df_str)}))

# Your additional code here
{source_code}
'''
        else:
            df1 = pd.read_csv(csv_url[0])
            df2 = pd.read_csv(csv_url[1])
            df_str1 = df1.to_csv(index=False)
            df_str2 = df2.to_csv(index=False)
            source_code = f'''
import pandas as pd
import io

# Convert string back to DataFrame
df1 = pd.read_csv(io.StringIO({repr(df_str1)}))
df2 = pd.read_csv(io.StringIO({repr(df_str2)}))

# Your additional code here
{source_code}
'''

    print(source_code, language_id, stdin, id, time_taken)
    isDSProblem = language_id == '71'
    if isDSProblem:
        language_id = 10
    difficulty_level = problem.difficulty_level
    problemId = id
    test_cases = problem.test_cases.all()
    submission_data = []
    testcases = []
    input_data = []
    expected_output_data = []
    Accepted = 0
    Failed = 0
    compilation_status = False
    for test_case in test_cases:
        stdin = test_case.input_data
        expected_output = test_case.expected_output
        input_data.append(stdin)
        expected_output_data.append(expected_output)
        payload = {
        "language_id": language_id,
        "source_code": problem.precode + source_code,
        "stdin": stdin, 
        "expected_output": expected_output
        }
        submission_data.append(payload)
        
    payload = {
        "submissions": submission_data
    }
    if not isDSProblem:
        response = requests.post(url, json=payload, headers=headers)
        res = response.json()
        token = ""
        for response in response.json():
            token+=response['token']+','
        token = token[:len(token)-1]
        #getting submissions
        while True:
            print("calling...")
            querystring_get = {"tokens":token, "base64_encoded":"false", "fields":"status_id"}
            response = requests.get(f"{base_url}submissions/batch?tokens={token}&base64_encoded=false&fields=token,stdout,stderr,status_id,language_id")
            
            result = response.json()
            result = result['submissions']
            status = []
            for res in result:
                status.append(res['status_id'])
            
            if 1 not in status and 2 not in status:
                break
            
        print(status)
        querystring_get = {"tokens":token, "base64_encoded":"false"}
        response = requests.get(f"{base_url}submissions/batch?tokens={token}&base64_encoded=true")
        
        result = response.json()
        print(result)
        result = result['submissions']
        compilation_error_msg = "Compilation Error: "
        i = 0
        for res in result:
            id  = res['status']['id']
            print("id", id)
            
            if id == 3:
                Accepted += 1
            elif id == 4:
                Failed += 1
                testcase = dict()
                testcase['input'] = input_data[i]
                decoded_bytes = base64.b64decode(res['stdout'])
                decoded_string = decoded_bytes.decode('utf-8')
                testcase['actualOutput'] = decoded_string
                testcase['expectedOutput'] = expected_output_data[i]
                testcases.append(testcase)
            else:
                compilation_status = True
                if language_id == '82':
                        decoded_bytes = base64.b64decode(res.get('stderr', ''))
                        decoded_string = decoded_bytes.decode('utf-8')
                else:
                    decoded_bytes = base64.b64decode(res.get('compile_output', ''))
                    decoded_string = decoded_bytes.decode('utf-8')
                compile_output = res['stderr'] if language_id == '71' else decoded_string
                compilation_error_msg += compile_output if compile_output is not None else res['stderr']
                break
            i = i + 1
    else:
        Accepted, Failed, compilation_status, compilation_error_msg, testcases = evaluate(payload, input_data, expected_output_data)
    print(Accepted, Failed, compilation_status)
    if compilation_status:
        judgment = "CompilationError"
    elif Failed > 0:
        judgment = "Failed"
    else:
        judgment = "Passed"
    submission = CodeSubmission(user=user, time_taken=time_taken, problem=problem, source_code=source_code,batch_name=batch_name, passed_testcases=Accepted, failed_testcases=Failed, judgment=judgment, language_id=language_id)
    if not compilation_status:
        Calculated_score, max_score = calculate_score(difficulty_level, Accepted, Failed)
        submission.score = Calculated_score
        try:
            user_score_data = UserScoreData.objects.get(
                user=user,
                content_id=problemId,
                type='P'
            )
            # Update the score if the new score is greater than the existing score
            existing_score = float(user_score_data.score)
            if Calculated_score > existing_score:
                user_score_data.score = Calculated_score
                user_score_data.title = problem.title
                user_score_data.maximum_possible_score = max_score
                user_score_data.batch_name = batch_name
                user_score_data.save()
        except UserScoreData.DoesNotExist:
            # Create a new record if it doesn't exist
            UserScoreData.objects.create(
                user=user,
                content_id=problemId,
                type='P',
                title=problem.title,
                score=Calculated_score,
                maximum_possible_score=max_score,
                batch_name=batch_name
            )
    else:
        Calculated_score = 0
        submission.score = Calculated_score
    profile = UserProfile.objects.get(user=user)
    profile.last_login = datetime.now()
    profile.save()
    updateScore(user, Calculated_score, problemId)
    submission.save()
    hasSubmitted=has_submitted_today(user)
    print(hasSubmitted,100)
    if hasSubmitted==False:
        update_streak(user,1)
        update_last_submission_date(user)
    
    
    if compilation_status:
        return {
            "message": compilation_error_msg,
            "stdout": "",
            "status": "CE"
        }
    elif Failed == 0:
        user = user
        user_profile, created = UserProfile.objects.get_or_create(user=user)
        user_profile.solved_problems.add(problem)
        return {
            "message": f"{Accepted}/{Accepted+Failed} testcases are passed",
            "stdout": "",
            "status": "S",
            "score":Calculated_score
        }
    else:
        return { 
            "message": f"{Accepted}/{Accepted+Failed} testcases are passed",
            "stdout": "",
            "status": "W",
            'failedTestCases': testcases,
            "score":Calculated_score
        }  

def calculate_score(difficulty_level, accepted, rejected):
    scores = {
        '1': 50,
        '2': 100,
        '3': 150
    }
    max_score = scores[str(difficulty_level)]
    if accepted + rejected == 0:
        score = 0
    else:
        score = max(0, max_score - (rejected * (max_score / (accepted + rejected))))
    return int(score), max_score


def update_streak(user, new_streak):
    try:
        user_profile = UserProfile.objects.get(user=user)
    except UserProfile.DoesNotExist:
        return JsonResponse({'success': False, 'message': 'User not found'}, status=404)

    profile = UserProfile.objects.get(user=user)
    today = datetime.now().date()
    if profile.last_login and profile.last_login.date() == today:
        profile.streak = int(new_streak)
        profile.last_login = datetime.now()
        profile.current_streak += 1
        profile.max_streak = max(profile.max_streak, profile.current_streak) 
    else:
        profile.streak = 0
        profile.last_login = datetime.now()
        profile.current_streak = 1
    profile.last_submission_date = datetime.now().date()
    profile.save()

    return JsonResponse({
        'success': True,
        'message': 'Streak updated successfully',
        'current_streak': profile.current_streak,
        'max_streak': profile.max_streak
    })


def has_submitted_today(user):
    try:
        user_profile = UserProfile.objects.get(user=user)
    except UserProfile.DoesNotExist:
        return JsonResponse({'success': False, 'message': 'User profile not found'}, status=404)

    return  user_profile.last_submission_date == timezone.now().date()


def update_last_submission_date(user):
    try:
        user_profile = UserProfile.objects.get(user=user)
    except UserProfile.DoesNotExist:
        return JsonResponse({'success': False, 'message': 'User profile not found'}, status=404)
    user_profile.last_submission_date = datetime.now().date()
    user_profile.save()

    return JsonResponse({'success': True, 'message': 'Last submission date updated successfully'})

from django.db.models import Max
def updateScore(user, score, problem_id):
    user_profile = UserProfile.objects.get(user=user)
    new_score = int(score)
    
    # Get the highest score for the given problem and user
    old_score = CodeSubmission.objects.filter(user=user, problem_id=problem_id).aggregate(Max('score'))['score__max'] or 0
    print(old_score, new_score)
    if old_score < new_score:
        user_profile.total_Score = user_profile.total_Score - old_score + new_score
        user_profile.save()

    return JsonResponse({
        'success': True,
        'message': 'Total score updated successfully',
        'total_score': user_profile.total_Score
    })
    