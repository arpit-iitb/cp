import requests
from celery import shared_task
from batches.models import Problem
import time

# url = config("JUDGE0_API_SITE_URL")+"submissions/batch?base64_encoded=false"
url = "http://4.240.82.177:2358/submissions/batch?base64_encoded=false"
url_python_for_ml = "http://4.240.82.177:2357/submissions/batch?base64_encoded=false"
headers = {
    "content-type": "application/json",
}

@shared_task
def CodeRunner(source_code, language_id, id):
    problem = Problem.objects.get(pk=id)
    test_cases = problem.test_cases.all()

    request_payload = {"submissions" : []}
    response_payload = {"tokens": []}

    for test_case in test_cases:
        stdin = test_case.input_data
        expected_output = test_case.expected_output
        
        if int(language_id) == 71:
            request_payload['submissions'].append({
                "source_code"    : problem.precode + source_code,
                "language_id"    : 10,
                "stdin"          : stdin,
                "expected_output": expected_output,
            })

        else :
            request_payload['submissions'].append({
                "source_code"    : problem.precode + source_code,
                "language_id"    : language_id,
                "stdin"          : stdin,
                "expected_output": expected_output,
            })

        
    res = {"error":"queue is full"}

    tries = 0
    while "error" in res:    
        if tries > 30:
            raise ValueError()
        tries += 1
        if int(language_id) == 71:
            response = requests.post(url_python_for_ml, json=request_payload, headers=headers)
        else:
            response = requests.post(url, json=request_payload, headers=headers)
        res = response.json()
        print(res)
        time.sleep(.3)

    for i in res:
        response_payload["tokens"].append(i['token'])
    return response_payload
