from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from decouple import config
import requests
import json
from services.authentication import CompilerAuthentication

# Create your views here.
class SubmissionsView(APIView):
    authentication_classes = [CompilerAuthentication]

    def get(self,request):
        base64_encoded = request.GET.get('base64_encoded')
        fields = request.GET.get('fields')
        page = int(request.GET.get('page'))
        per_page = int(request.GET.get('per_page'))
        
        url = f"{config('JUDGE0_API_SITE_URL')}submissions/?base64_encoded={base64_encoded}&fields={fields}&page={page}&per_page={per_page}"
        headers = {'Content-Type': 'application/json'}
        response = requests.request("GET", url, headers=headers)
        # this needs authorization token to be fixed later 
        return Response({"message":"Successful"}, status=response.status_code)

    def post(self, request):
        try:
            base64_encoded = request.GET.get('base64_encoded')
            wait = request.GET.get('wait')
            
            url = f"{config('JUDGE0_API_SITE_URL')}submissions/?base64_encoded={base64_encoded}&wait={wait}"
            payload = json.dumps(request.data)
            headers = {'Content-Type': 'application/json'}
            response = requests.request("POST", url, headers=headers, data=payload)

            return Response(json.loads(response.text), status=response.status_code)
        except Exception:
            return Response({"message":"Something Went Wrong"}, status=500)


class SubmissionsTokenView(APIView):
    authentication_classes = [CompilerAuthentication]

    def get(self, request,token):
        try:
            base64_encoded = request.GET.get('base64_encoded')
            fields = request.GET.get('fields')
            
            url = f"{config('JUDGE0_API_SITE_URL')}submissions/{token}?base64_encoded={base64_encoded}&fields={fields}"
            headers = {'Content-Type': 'application/json'}
            response = requests.request("GET", url, headers=headers)

            return Response(json.loads(response.text), status=response.status_code)
        except Exception:
            return Response({"message":"Something Went Wrong"}, status=500)
    
    def delete(self,request,token):
        try:
            fields = request.GET.get('fields')
            url = f"{config('JUDGE0_API_SITE_URL')}submissions/{token}?fields={fields}"
            headers = {'Content-Type': 'application/json'}
            response = requests.request("DELETE", url, headers=headers)
            # this needs authorization token to be fixed later
            return Response(status=response.status_code)
        
        except Exception as e:
            return Response({"message":"Something Went Wrong"}, status=500)

            

class SubmissionsBatchView(APIView):
    authentication_classes = [CompilerAuthentication]

    def get(self,request):
        try:
            tokens = request.GET.get('tokens')
            base64_encoded = request.GET.get('base64_encoded')
            fields = request.GET.get('fields')

            url = f"{config('JUDGE0_API_SITE_URL')}submissions/batch?tokens={tokens}&base64_encoded={base64_encoded}&fields={fields}"
            headers = {'Content-Type': 'application/json'}
            response = requests.request("GET", url, headers=headers)
            return Response(json.loads(response.text), status=response.status_code)

        except Exception as e:
            return Response({"message":"Something Went Wrong"}, status=500) 

    def post(self, request):
        try:
            base64_encoded = request.GET.get('base64_encoded')
            
            url = f"{config('JUDGE0_API_SITE_URL')}submissions/batch?base64_encoded={base64_encoded}"
            payload = json.dumps(request.data)
            headers = {'Content-Type': 'application/json'}
            response = requests.request("POST", url, headers=headers, data=payload)

            return Response(json.loads(response.text), status=response.status_code)
        except Exception:
            return Response({"message":"Something Went Wrong"}, status=500)

class LanguagesView(APIView):
    authentication_classes = [CompilerAuthentication]

    def get(self,request):
        try:
            
            url = f"{config('JUDGE0_API_SITE_URL')}languages/"
            headers = {'Content-Type': 'application/json'}
            response = requests.request("GET", url, headers=headers)
            
            return Response(json.loads(response.text), status=response.status_code)

        except Exception as e:
            return Response({"message":"Something Went Wrong"}, status=500) 

class LanguagesIdView(APIView):
    authentication_classes = [CompilerAuthentication]

    def get(self,request,id):
        try:
            
            url = f"{config('JUDGE0_API_SITE_URL')}languages/{id}/"
            headers = {'Content-Type': 'application/json'}
            response = requests.request("GET", url, headers=headers)
            
            return Response(json.loads(response.text), status=response.status_code)

        except Exception as e:
            return Response({"message":"Something Went Wrong"}, status=500) 

class LanguagesAllView(APIView):
    authentication_classes = [CompilerAuthentication]
    
    def get(self,request):
        try:
            
            url = f"{config('JUDGE0_API_SITE_URL')}languages/all/"
            headers = {'Content-Type': 'application/json'}
            response = requests.request("GET", url, headers=headers)
            
            return Response(json.loads(response.text), status=response.status_code)

        except Exception as e:
            return Response({"message":"Something Went Wrong"}, status=500) 

class StatusesView(APIView):
    authentication_classes = [CompilerAuthentication]

    def get(self,request):
        try:
            
            url = f"{config('JUDGE0_API_SITE_URL')}/statuses"
            headers = {'Content-Type': 'application/json'}
            response = requests.request("GET", url, headers=headers)
            
            return Response(json.loads(response.text), status=response.status_code)

        except Exception as e:
            return Response({"message":"Something Went Wrong"}, status=500) 

class StatisticsView(APIView):
    authentication_classes = [CompilerAuthentication]

    def get(self,request):
        try:
            
            url = f"{config('JUDGE0_API_SITE_URL')}/statistics"
            headers = {'Content-Type': 'application/json'}
            response = requests.request("GET", url, headers=headers)
            
            return Response(json.loads(response.text), status=response.status_code)

        except Exception as e:
            return Response({"message":"Something Went Wrong"}, status=500) 

class WorkersView(APIView):
    authentication_classes = [CompilerAuthentication]

    def get(self,request):
        try:
            
            url = f"{config('JUDGE0_API_SITE_URL')}/workers"
            headers = {'Content-Type': 'application/json'}
            response = requests.request("GET", url, headers=headers)
            
            return Response(json.loads(response.text), status=response.status_code)

        except Exception as e:
            return Response({"message":"Something Went Wrong"}, status=500)

class AboutView(APIView):
    authentication_classes = [CompilerAuthentication]
    
    def get(self,request):
        try:
            
            url = f"{config('JUDGE0_API_SITE_URL')}/about"
            headers = {'Content-Type': 'application/json'}
            response = requests.request("GET", url, headers=headers)
            
            return Response(json.loads(response.text), status=response.status_code)

        except Exception as e:
            return Response({"message":"Something Went Wrong"}, status=500)

class VersionView(APIView):
    authentication_classes = [CompilerAuthentication]

    def get(self,request):
        try:
            
            url = f"{config('JUDGE0_API_SITE_URL')}/version"
            headers = {'Content-Type': 'application/json'}
            response = requests.request("GET", url, headers=headers)
            
            return Response({'version':response._content}, status=response.status_code)

        except Exception as e:
            return Response({"message":"Something Went Wrong"}, status=500)

class IsolateView(APIView):
    authentication_classes = [CompilerAuthentication]

    def get(self,request):
        try:
            
            url = f"{config('JUDGE0_API_SITE_URL')}/isolate"
            headers = {'Content-Type': 'application/json'}
            response = requests.request("GET", url, headers=headers)
            
            return Response({'isolate':response._content}, status=response.status_code)

        except Exception as e:
            return Response({"message":"Something Went Wrong"}, status=500)

class LicenseView(APIView):
    authentication_classes = [CompilerAuthentication]
    
    def get(self,request):
        try:
            
            url = f"{config('JUDGE0_API_SITE_URL')}/license"
            headers = {'Content-Type': 'application/json'}
            response = requests.request("GET", url, headers=headers)
            
            return Response({'license':response._content}, status=response.status_code)
        except Exception as e:
            return Response({"message":"Something Went Wrong"}, status=500)






#  Judge0 Extra Views

class ExtraSubmissionsView(APIView):
    authentication_classes = [CompilerAuthentication]

    def get(self,request):
        base64_encoded = request.GET.get('base64_encoded')
        fields = request.GET.get('fields')
        page = int(request.GET.get('page'))
        per_page = int(request.GET.get('per_page'))
        
        url = f"{config('JUDGE0_EXTRA_API_SITE_URL')}submissions/?base64_encoded={base64_encoded}&fields={fields}&page={page}&per_page={per_page}"
        headers = {'Content-Type': 'application/json'}
        response = requests.request("GET", url, headers=headers)
        # this needs authorization token to be fixed later 
        return Response({"message":"Successful"}, status=response.status_code)

    def post(self, request):
        try:
            base64_encoded = request.GET.get('base64_encoded')
            wait = request.GET.get('wait')
            
            url = f"{config('JUDGE0_EXTRA_API_SITE_URL')}submissions/?base64_encoded={base64_encoded}&wait={wait}"
            payload = json.dumps(request.data)
            headers = {'Content-Type': 'application/json'}
            response = requests.request("POST", url, headers=headers, data=payload)

            return Response(json.loads(response.text), status=response.status_code)
        except Exception:
            return Response({"message":"Something Went Wrong"}, status=500)

class ExtraSubmissionsTokenView(APIView):
    authentication_classes = [CompilerAuthentication]

    def get(self, request,token):
        try:
            base64_encoded = request.GET.get('base64_encoded')
            fields = request.GET.get('fields')
            
            url = f"{config('JUDGE0_EXTRA_API_SITE_URL')}submissions/{token}?base64_encoded={base64_encoded}&fields={fields}"
            headers = {'Content-Type': 'application/json'}
            response = requests.request("GET", url, headers=headers)

            return Response(json.loads(response.text), status=response.status_code)
        except Exception:
            return Response({"message":"Something Went Wrong"}, status=500)
    
    def delete(self,request,token):
        try:
            fields = request.GET.get('fields')
            url = f"{config('JUDGE0_EXTRA_API_SITE_URL')}submissions/{token}?fields={fields}"
            headers = {'Content-Type': 'application/json'}
            response = requests.request("DELETE", url, headers=headers)
            # this needs authorization token to be fixed later
            return Response(status=response.status_code)
        
        except Exception as e:
            return Response({"message":"Something Went Wrong"}, status=500)

class ExtraSubmissionsBatchView(APIView):
    authentication_classes = [CompilerAuthentication]

    def get(self,request):
        try:
            tokens = request.GET.get('tokens')
            base64_encoded = request.GET.get('base64_encoded')
            fields = request.GET.get('fields')

            url = f"{config('JUDGE0_EXTRA_API_SITE_URL')}submissions/batch?tokens={tokens}&base64_encoded={base64_encoded}&fields={fields}"
            headers = {'Content-Type': 'application/json'}
            response = requests.request("GET", url, headers=headers)
            return Response(json.loads(response.text), status=response.status_code)

        except Exception as e:
            return Response({"message":"Something Went Wrong"}, status=500) 

    def post(self, request):
        try:
            base64_encoded = request.GET.get('base64_encoded')
            
            url = f"{config('JUDGE0_EXTRA_API_SITE_URL')}submissions/batch?base64_encoded={base64_encoded}"
            payload = json.dumps(request.data)
            headers = {'Content-Type': 'application/json'}
            response = requests.request("POST", url, headers=headers, data=payload)

            return Response(json.loads(response.text), status=response.status_code)
        except Exception:
            return Response({"message":"Something Went Wrong"}, status=500)


class ExtraLanguagesView(APIView):
    authentication_classes = [CompilerAuthentication]

    def get(self,request):
        try:
            
            url = f"{config('JUDGE0_EXTRA_API_SITE_URL')}languages/"
            headers = {'Content-Type': 'application/json'}
            response = requests.request("GET", url, headers=headers)
            
            return Response(json.loads(response.text), status=response.status_code)

        except Exception as e:
            return Response({"message":"Something Went Wrong"}, status=500) 

class ExtraLanguagesIdView(APIView):
    authentication_classes = [CompilerAuthentication]

    def get(self,request,id):
        try:
            
            url = f"{config('JUDGE0_EXTRA_API_SITE_URL')}languages/{id}/"
            headers = {'Content-Type': 'application/json'}
            response = requests.request("GET", url, headers=headers)
            
            return Response(json.loads(response.text), status=response.status_code)

        except Exception as e:
            return Response({"message":"Something Went Wrong"}, status=500) 

class ExtraLanguagesAllView(APIView):
    authentication_classes = [CompilerAuthentication]

    def get(self,request):
        try:
            
            url = f"{config('JUDGE0_EXTRA_API_SITE_URL')}languages/all/"
            headers = {'Content-Type': 'application/json'}
            response = requests.request("GET", url, headers=headers)
            
            return Response(json.loads(response.text), status=response.status_code)

        except Exception as e:
            return Response({"message":"Something Went Wrong"}, status=500) 

class ExtraStatusesView(APIView):
    authentication_classes = [CompilerAuthentication]

    def get(self,request):
        try:
            
            url = f"{config('JUDGE0_EXTRA_API_SITE_URL')}/statuses"
            headers = {'Content-Type': 'application/json'}
            response = requests.request("GET", url, headers=headers)
            
            return Response(json.loads(response.text), status=response.status_code)

        except Exception as e:
            return Response({"message":"Something Went Wrong"}, status=500) 

class ExtraStatisticsView(APIView):
    authentication_classes = [CompilerAuthentication]

    def get(self,request):
        try:
            
            url = f"{config('JUDGE0_EXTRA_API_SITE_URL')}/statistics"
            headers = {'Content-Type': 'application/json'}
            response = requests.request("GET", url, headers=headers)
            
            return Response(json.loads(response.text), status=response.status_code)

        except Exception as e:
            return Response({"message":"Something Went Wrong"}, status=500) 

class ExtraWorkersView(APIView):
    authentication_classes = [CompilerAuthentication]

    def get(self,request):
        try:
            
            url = f"{config('JUDGE0_EXTRA_API_SITE_URL')}/workers"
            headers = {'Content-Type': 'application/json'}
            response = requests.request("GET", url, headers=headers)
            
            return Response(json.loads(response.text), status=response.status_code)

        except Exception as e:
            return Response({"message":"Something Went Wrong"}, status=500)

class ExtraAboutView(APIView):
    authentication_classes = [CompilerAuthentication]
    
    def get(self,request):
        try:
            
            url = f"{config('JUDGE0_EXTRA_API_SITE_URL')}/about"
            headers = {'Content-Type': 'application/json'}
            response = requests.request("GET", url, headers=headers)
            
            return Response(json.loads(response.text), status=response.status_code)

        except Exception as e:
            return Response({"message":"Something Went Wrong"}, status=500)

class ExtraVersionView(APIView):
    authentication_classes = [CompilerAuthentication]

    def get(self,request):
        try:
            
            url = f"{config('JUDGE0_EXTRA_API_SITE_URL')}/version"
            headers = {'Content-Type': 'application/json'}
            response = requests.request("GET", url, headers=headers)
            
            return Response({'version':response._content}, status=response.status_code)

        except Exception as e:
            return Response({"message":"Something Went Wrong"}, status=500)

class ExtraIsolateView(APIView):
    authentication_classes = [CompilerAuthentication]

    def get(self,request):
        try:
            
            url = f"{config('JUDGE0_EXTRA_API_SITE_URL')}/isolate"
            headers = {'Content-Type': 'application/json'}
            response = requests.request("GET", url, headers=headers)
            
            return Response({'isolate':response._content}, status=response.status_code)

        except Exception as e:
            return Response({"message":"Something Went Wrong"}, status=500)

class ExtraLicenseView(APIView):
    authentication_classes = [CompilerAuthentication]
    
    def get(self,request):
        try:
            
            url = f"{config('JUDGE0_EXTRA_API_SITE_URL')}/license"
            headers = {'Content-Type': 'application/json'}
            response = requests.request("GET", url, headers=headers)
            
            return Response({'license':response._content}, status=response.status_code)
        except Exception as e:
            return Response({"message":"Something Went Wrong"}, status=500)