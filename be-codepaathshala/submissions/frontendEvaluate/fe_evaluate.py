from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from accounts.models import UserProfile
from batches.models import Problem
from submissions.models import CodeSubmission
from datetime import datetime
from django.utils import timezone

def CreateFrontendSubmission(user, problem_id, htmlCode, cssCode, jsCode, passedTests, failedTests, batch_name):
    print(passedTests, failedTests)
    if failedTests == 0:
        judgment = 'Passed'
    else:
        judgment = 'Failed'
    problem = get_object_or_404(Problem, id=problem_id)
    difficulty_level = problem.difficulty_level
    problemId=problem.id
    time_taken = 0
    source_code = htmlCode + '\n' + cssCode + '\n' + jsCode
    submission = CodeSubmission(user=user, time_taken=time_taken, problem=problem, source_code=source_code,batch_name=batch_name, passed_testcases=passedTests, failed_testcases=failedTests, judgment=judgment, language_id='frontend-evaluations')
    
    # Score calculation
    Calculated_score = calculate_score(difficulty_level, passedTests, failedTests)
    submission.score = Calculated_score
    profile = UserProfile.objects.get(user=user)
    profile.last_login = datetime.now()
    profile.save()
    updateScore(user,Calculated_score, problemId)
    submission.save()
    hasSubmitted=has_submitted_today(user)
    print(hasSubmitted,100)
    if hasSubmitted==False:
        update_streak(user,1)
        update_last_submission_date(user)
    
    if failedTests == 0:
        user = user
        user_profile, created = UserProfile.objects.get_or_create(user=user)
        user_profile.solved_problems.add(problem)
        return {
            "message": f"{passedTests}/{passedTests+failedTests} testcases are passed",
            "stdout": "",
            "status": "S",
            "score":Calculated_score
        }
    else:
        return { 
            "message": f"{passedTests}/{passedTests+failedTests} testcases are passed",
            "stdout": "",
            "status": "W",
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
    return int(score)


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


def updateScore(user, score, problem_id):
    user_profile = UserProfile.objects.get(user=user)
    print(f"Received parameters - user_id: {user}, score: {score}, problem_id: {problem_id}")
    new_score = int(score)
    submitted_problems = CodeSubmission.objects.filter(user=user, problem_id=problem_id)
    old_score = 0
    for submitted_problem in submitted_problems:
        print(submitted_problem)
        if submitted_problem.score is not None:
            old_score = max(submitted_problem.score, old_score)
    print(f"Updated score for user {user} and problem {problem_id}: old_score={old_score}, new_score={new_score}")
    
    total_score  = max(old_score, new_score)
    if old_score < new_score:
        total_score = user_profile.total_Score - old_score + new_score
        user_profile.total_Score = total_score
        user_profile.save()

    return JsonResponse({
        'success': True,
        'message': 'Total score updated successfully',
        'total_score': total_score
    })