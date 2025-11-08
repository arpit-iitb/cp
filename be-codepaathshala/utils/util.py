from django.core.mail import send_mail, EmailMessage
from email.mime.image import MIMEImage
from django.core.mail import EmailMultiAlternatives
from batches.models import Client
from codingjudge import settings

def send_email():
    from codingjudge.settings import EMAIL_HOST_USER
    subject = 'EC2 Celery Testing'
    message = 'This is ec2 celery testing'
    email_from = EMAIL_HOST_USER
    recipient_list = ['balbir.iitbombay3602@gmail.com','mail.shubhamlal@gmail.com','aroramanav887@gmail.com']
    # recipient_list = ['dhruvgupta3377@gmail.com']
    send_mail(subject, message, email_from, recipient_list)

def forget_password_email(subject,message,user_list):
    from codingjudge.settings import EMAIL_HOST_USER
    email_from = EMAIL_HOST_USER
    send_mail(subject, message, email_from, user_list)


def batchEmail(username, email, first_name, password, client_name):
    client = Client.objects.get(name=client_name)
    headers = {'Reply-To': client.email}
    user_emails = [email, client.email]
    subject = f'Welcome to {client_name} LMS Platfrom | Login Crendentials'
    message = f"""
Dear {first_name},

Welcome to {client_name}! 🚀

We're delighted to have you join our platform of eager learners, and we're confident that the skills you'll develop here will empower you.

website url: {client.website}

Your Login Credentials are here!

Username: {username}
email: {email}
Password: {password}

Getting Started:

1. Login: Head to {client.website} and sign in using your provided credentials.

2. Click on profile icon and then click on change password to change the default password and add your new password.

3. Registered Batches: Go to the registered batches page and find your batch(es).

4. Enter inside batch and start learning.


Questions or hurdles? Reach out to our dedicated support team at {client.email}

We're thrilled to be part of your learning journey, and we can't wait to see your growth on {client_name}!

Best regards,
{client_name} Team
            """
    email_from = settings.EMAIL_HOST_USER

    email = EmailMessage(
        subject,
        message,
        email_from,
        user_emails,
        headers={'Reply-To': client.email},  # Set Reply-To header
    )

    # Send the email
    email.send(fail_silently=False)
    
# def batch_stats_mail(subject, message, recipients, images):
#     from codingjudge.settings import EMAIL_HOST_USER
#     email_content = message
#     email_from = EMAIL_HOST_USER
#     email = EmailMultiAlternatives(subject, '', to= recipients, from_email= email_from)
#     email.attach_alternative(email_content, "text/html")
#     for key, values in images.items():
#         chart_buf = values
#         image = MIMEImage(chart_buf.read())
#         image.add_header('Content-ID', f'<{key}>')
#         image.add_header('Content-Disposition', 'inline', filename=f'{key}.png')
#         email.attach(image)
#     email.send()

from codingjudge.settings import EMAIL_HOST_USER
def batch_stats_mail(subject, message, recipients, images):
    email_from = EMAIL_HOST_USER
    email = EmailMultiAlternatives(subject, '', to=recipients, from_email=email_from)
    email.attach_alternative(message, "text/html")
    try:
        for key, chart_buf in images.items():
            image = MIMEImage(chart_buf.read())
            image.add_header('Content-ID', f'<{key}>')
            image.add_header('Content-Disposition', 'inline', filename=f'{key}.png')
            email.attach(image)
            chart_buf.seek(0)
        email.send()
    except Exception as e:
        print(f"Error sending email: {e}")