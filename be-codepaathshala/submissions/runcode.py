import base64
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
import pandas as pd
from decouple import config
import requests

from batches.models import Problem
from submissions.ds_evaluate import evaluate
url = url = config("JUDGE0_API_SITE_URL")+"submissions/?base64_encoded=true&wait=true"
headers = {
    "content-type": "application/json",
}

def CodeRunner(source_code, language_id, stdin, id, batch_name):
    problem = Problem.objects.get(pk=id)
    print(problem)
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

    # print(source_code)
    print('----------------------------------------------------------------')
    isDSProblem = language_id == '71'
    print(isDSProblem)
    print(source_code, language_id)
    if not stdin:
        print('----------------------------------------------------------------inside not stdin')
        problem = get_object_or_404(Problem, id=id)
        test_cases = problem.test_cases.all()
        Accepted = 0
        Failed = 0
        compilation_status = False
        testcases = []
        for test_case in test_cases:
            stdin = test_case.input_data
            expected_output = test_case.expected_output
            payload = {
                "language_id": language_id,
                "source_code": problem.precode + source_code,
                "stdin": stdin, 
                "expected_output": expected_output
                }
            if not isDSProblem:
                # Convert values to base64
                base64_payload = {}
                for key, value in payload.items():
                    if isinstance(value, str):
                        base64_payload[key] = base64.b64encode(value.encode()).decode()
                    else:
                        base64_payload[key] = base64.b64encode(str(value).encode()).decode()
                base64_payload['language_id'] = language_id

                response = requests.post(url, json=base64_payload, headers=headers)
                res = response.json()
                print(res, '--')
                compilation_error_msg = "Compilation Error: "
                print(res['status'])
                id  = res['status']['id']
                if id == 3:
                    Accepted += 1
                elif id == 4:
                    Failed += 1
                    testcase = dict()
                    testcase['input'] = stdin
                    if res['stdout'] is not None:
                        decoded_bytes = base64.b64decode(res['stdout'])
                        decoded_string = decoded_bytes.decode('utf-8')  # Decode bytes to string if needed
                    else:
                        decoded_bytes = None
                        decoded_string = None  # or you can handle it differently
                    testcase['actualOutput'] = decoded_string
                    testcase['expectedOutput'] = expected_output
                    testcases.append(testcase)
                else:
                    if language_id == '82':
                        decoded_bytes = base64.b64decode(res.get('stderr', ''))
                        decoded_string = decoded_bytes.decode('utf-8')
                    else:
                        decoded_bytes = base64.b64decode(res.get('compile_output', ''))
                        decoded_string = decoded_bytes.decode('utf-8')
                    compile_output = res['stderr'] if language_id == '71'  else decoded_string
                    compilation_error_msg += compile_output if compile_output is not None else res['stderr']
                    compilation_status = True
                    break
    
                break #run only 1 test case
            else:
                output, stdout  = evaluate(payload)
                if output == 'A':
                    Accepted += 1
                elif output == 'W':
                    Failed += 1
                    testcase = dict()
                    testcase['input'] = stdin
                    testcase['actualOutput'] = stdout
                    testcase['expectedOutput'] = expected_output
                    testcases.append(testcase)
                else:
                    compilation_status = True
                    compilation_error_msg = stdout
                    break
                break
        print(Accepted, Failed, compilation_status)
        if compilation_status:
            return {
                "message": compilation_error_msg,
                "stdout": "",
                "status": "CE"
            }
        elif Failed == 0:
            return {
                "message": f"{Accepted}/{Accepted+Failed} testcases are passed",
                "stdout": "",
                "status": "S"
            }
        else:
            return { 
                "message": f"{Accepted}/{Accepted+Failed} testcases are passed",
                "stdout": "",
                "status": "W",
                'failedTestCases': testcases
            }
    else:
        payload = {
            "language_id": language_id,
            "source_code": source_code,
            "stdin": stdin, 
            "expected_output": "7"
        }
        if not isDSProblem:
            # Convert values to base64
            base64_payload = {}
            for key, value in payload.items():
                if isinstance(value, str):
                    base64_payload[key] = base64.b64encode(value.encode()).decode()
                else:
                    base64_payload[key] = base64.b64encode(str(value).encode()).decode()
            base64_payload['language_id'] = language_id

            response = requests.post(url, json=payload, headers=headers)
            res = response.json()
            id  = res['status']['id']
            if id == 3 or id == 4:
                if res['stdout'] is not None:
                    decoded_bytes = base64.b64decode(res['stdout'])
                    decoded_string = decoded_bytes.decode('utf-8')  # Decode bytes to string if needed
                else:
                    decoded_bytes = None
                    decoded_string = None  # or you can handle it differently
                context = {
                    "message": "Successfully compiled",
                    "stdout": decoded_string,
                    "status": "CT" # custom testcase 
                }
            else:
                if language_id == '82':
                        decoded_bytes = base64.b64decode(res.get('stderr', ''))
                        decoded_string = decoded_bytes.decode('utf-8')
                else:
                    decoded_bytes = base64.b64decode(res.get('compile_output', ''))
                    decoded_string = decoded_bytes.decode('utf-8')
                    
                compile_output = res['stderr'] if language_id == '71' else decoded_string
                compilation_error_msg = compile_output if compile_output is not None else res['stderr']
                context = {
                    "message": "Compilation Error: " + compilation_error_msg,
                    "stdout": "",
                    "status": "CE" # custom testcase 
                }
        else:
            output, stdout  = evaluate(payload)
            if output == 'A' or output == 'W':
                context = {
                    "message": "Successfully compiled",
                    "stdout": str(stdout),
                    "status": "CT" # custom testcase 
                }
            else:
                context = {
                    "message": "Compilation Error" + stdout,
                    "stdout": "",
                    "status": "CE" # custom testcase 
                }
        return context    
