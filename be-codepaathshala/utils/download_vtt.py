import requests

def download_vtt_file(url):
    response = requests.get(url)
    if response.status_code == 200:
        vtt_content = response.text
        return vtt_content
    else:
        raise Exception(f"Failed to download the VTT file. Status code: {response.status_code}")

