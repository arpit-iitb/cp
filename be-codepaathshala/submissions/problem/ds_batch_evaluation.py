import requests
from decouple import config

# url = "https://judge0-extra-ce.p.rapidapi.com/submissions"

# querystring = {"base64_encoded":"false","wait":"true","fields":"*"}

# headers = {
# 	"content-type": "application/json",
# 	"Content-Type": "application/json",
# 	"X-RapidAPI-Key": "",
# 	"X-RapidAPI-Host": "judge0-extra-ce.p.rapidapi.com"
# }


# url = "https://judge0-extra-ce.p.rapidapi.com/submissions/batch"
# querystring_post = {"base64_encoded":"false"}
# headers = {
#     "content-type": "application/json",
#     "Content-Type": "application/json",
#     "X-RapidAPI-Key": config("API_KEY_CE_EXTRA"),
#     "X-RapidAPI-Host": "judge0-extra-ce.p.rapidapi.com"
# }

# headers_get_request = {
#     "X-RapidAPI-Key": config("API_KEY_CE_EXTRA"),
#     "X-RapidAPI-Host": "judge0-extra-ce.p.rapidapi.com"
# }
base_url = config("JUDGE0_EXTRA_API_SITE_URL")
url = config("JUDGE0_EXTRA_API_SITE_URL")+"submissions/batch?base64_encoded=false"
headers = {
    "content-type": "application/json",
}


def evaluate(payload, input_data, expected_output_data):
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
    response = requests.get(f"{base_url}submissions/batch?tokens={token}&base64_encoded=false")
    result = response.json()
    print(result)
    result = result['submissions']
    compilation_error_msg = "Compilation Error: "
    i = 0
    Accepted = 0
    Failed = 0
    testcases = []
    compilation_status = False
    for res in result:
        id  = res['status']['id']
        print("id", id)
        
        if id == 3:
            Accepted += 1
        elif id == 4:
            Failed += 1
            testcase = dict()
            testcase['input'] = input_data[i]
            testcase['actualOutput'] = res['stdout']
            testcase['expectedOutput'] = expected_output_data[i]
            testcases.append(testcase)
        else:
            compilation_status = True
            compile_output = res['stderr'] 
            compilation_error_msg += compile_output 
            break
        i = i + 1
    return Accepted, Failed, compilation_status, compilation_error_msg, testcases


    # print(response.json())
    # res = response.json()
    # id  = res['status']['id']
    # print(res['stderr'])
    # if id==3:
    #     return 'A', res['stdout']
    # elif id==4:
    #     return 'W', res['stdout']
    # else:
    #     error = res['stderr']
    #     return 'C', error

