import re
import requests
import time
from requests.exceptions import ConnectionError
from django.core.management.base import BaseCommand
from django.utils.dateparse import parse_duration
from batches.models import VideoLectures
from utils.download_vtt import download_vtt_file


VIMEO_API_URL = "https://api.vimeo.com/videos/"
VIMEO_ACCESS_TOKEN = 'b6ac57a74724cd5d545866aa9ae720b3'


def extract_vimeo_id(link):
    pattern = r"https://player\.vimeo\.com/video/(\d+)"
    match = re.search(pattern, link)
    if match:
        return match.group(1)
    return None

def get_video_text(self, video_id):
    headers = {
        'Authorization': f'Bearer {VIMEO_ACCESS_TOKEN}',
    }
    try:
        response = requests.get(f"{VIMEO_API_URL}{video_id}/texttracks", headers=headers)
        if response.status_code == 200:
            data = response.json()
            data = data.get('data')
            text = ""
            for data in data:
                text += download_vtt_file(data.get('link'))
                # print(text)
            return text
    
    except requests.exceptions.RequestException as e:
        raise ConnectionError(f"Failed to connect to Vimeo API: {e}")
    
    return None

def get_video_transcript(video_id):
    try:
        # Retrieve the VideoLectures instance by video_id
        lecture = VideoLectures.objects.get(id=video_id)
        
        # Extract Vimeo video ID from the lecture link
        vimeo_video_id = extract_vimeo_id(lecture.link)
        
        if vimeo_video_id:
            try:
                # Fetch the transcript text from Vimeo
                transcript = get_video_text(vimeo_video_id)
                print(transcript)  # Optional: Print the transcript for debugging
                
                if transcript:
                    # Update the lecture's transcript field and save the instance
                    lecture.transcript = transcript
                    lecture.save()
                else:
                    # Handle the case where the transcript is not available
                    print(f"Transcript not available for video ID: {video_id}")
                    
            except ConnectionError as e:
                print(f"Failed to connect to Vimeo API: {e}")
        else:
            print(f"Invalid Vimeo video ID extracted from link: {lecture.link}")
    
    except VideoLectures.DoesNotExist:
        print(f"VideoLecture with ID {video_id} does not exist.")

            

