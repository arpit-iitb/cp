import requests
from decouple import config

# url = "http://43.204.62.0:2358/submissions/?base64_encoded=false&wait=true" Aws hosted
url = config("JUDGE0_EXTRA_API_SITE_URL")+"submissions/?base64_encoded=false&wait=true"

headers = {
	"content-type": "application/json",
}


def evaluate(payload):
    payload['language_id'] = 10
    response = requests.post(url, json=payload, headers=headers)
    
    print(response.json())
    res = response.json()
    id  = res['status']['id']
    print(res['stderr'])
    if id==3:
        return 'A', res['stdout']
    elif id==4:
        return 'W', res['stdout']
    else:
        error = res['stderr']
        return 'C', error

