from batches.models import Batch, ChildBatch, Lesson, VideoLectures, Problem, MCQAssignment, Assignments, Client
from submissions.models import UserActivity
from accounts.models import User, UserProfile, UserSessions
from django.db.models import Count
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import datetime
from utils.util import batch_stats_mail
import io
# import time
import numpy as np
import pandas as pd
from django.utils import timezone
from datetime import timedelta,datetime,date
import seaborn as sns
from matplotlib.colors import LinearSegmentedColormap
from codingjudge.celery import app
import pprint

def batch_stats(batchname):
    child_batch_names = [batchname]
    parent_batch  = Batch.objects.filter(childbatch__name__in = child_batch_names).distinct()
    lessons       = Lesson.objects.filter(batch__in = parent_batch)

    user_profiles = UserProfile.objects.filter(assosiatedbatches__name__in = child_batch_names, user__is_staff = False).distinct()

    total_videos         = VideoLectures.objects.filter(id__in=lessons.values('video'))
    total_mcq_assignment = MCQAssignment.objects.filter(id__in=lessons.values('MCQ_assignment'))
    total_problem        = Problem.objects.filter(id__in=lessons.values('problem'))
    total_assignment     = Assignments.objects.filter(id__in=lessons.values('assignment'))

    
    total_videos_watched_count        = 0
    total_solved_mcq_assignment_count = 0
    total_solved_problems             = 0
    total_solved_assignments          = 0 

    user_profiles_with_watch_count = user_profiles.annotate(watched_video_count=Count('watched_videos'))
    total_videos_watched_count = user_profiles_with_watch_count.filter(
            watched_videos__in=total_videos).aggregate(
                    total_watched_videos_count=Count('watched_videos'))['total_watched_videos_count']

    user_profiles_with_mcq_count = user_profiles.annotate(solved_mcq_count=Count('mcq_assignments'))
    total_solved_mcq_assignment_count = user_profiles_with_mcq_count.filter(
            mcq_assignments__in=total_mcq_assignment).aggregate(
                    total_solved_mcq_count=Count('mcq_assignments'))['total_solved_mcq_count']
    
    user_profiles_with_problem_count = user_profiles.annotate(solved_problems_count=Count('solved_problems'))
    total_solved_problems = user_profiles_with_problem_count.filter(
            solved_problems__in=total_problem).aggregate(
                    total_solve_problem_count=Count('solved_problems'))['total_solve_problem_count']
    
    user_profiles_with_assignment_count = user_profiles.annotate(solved_assignment_count=Count('assignment_Submission'))
    total_solved_assignments = user_profiles_with_assignment_count.filter(
            assignment_Submission__in=total_assignment).aggregate(
                    total_solve_assignment_count=Count('watched_videos'))['total_solve_assignment_count']

    start_date = ''
    end_date   = ''
    total_days = 6
    end_date = datetime.today()
    end_date = end_date.date()
    end_date   = end_date - timezone.timedelta(days=1)
    start_date = end_date - timezone.timedelta(days=7)

    

    active_users = 0
    for user in user_profiles:
        try:
            if start_date <= user.last_login.date() <= end_date:
                active_users += 1
        except:
            pass

    # Previous week data 
    end_date_prev   = start_date    - timezone.timedelta(days=1)
    start_date_prev = end_date_prev - timezone.timedelta(days=7)

    prev_active_users = 0
    for user in user_profiles:
        try:
            if start_date_prev <= user.last_login.date() <= end_date_prev:
                prev_active_users += 1
        except:
            pass
    
    
    user_activities = UserActivity.objects.filter(batch_name__in = child_batch_names)
    user_activity_dict = {}

    for days in range(total_days ,-1,-1):
        start_day_time = end_date - timedelta(days = days)
        end_day_time   = end_date - timedelta(days = days - 1)
        user_activity_dict[f"{start_day_time}"] = {
            'P':user_activities.filter(content_type = "P",submission_date__gt = start_day_time, submission_date__lt = end_day_time).count(),
            'A':user_activities.filter(content_type = "A",submission_date__gt = start_day_time, submission_date__lt = end_day_time).count(),
            'M':user_activities.filter(content_type = "M",submission_date__gt = start_day_time, submission_date__lt = end_day_time).count(),
            'V':user_activities.filter(content_type = "V",submission_date__gt = start_day_time, submission_date__lt = end_day_time).count(),
        }
    
    completion_percent = ((total_videos_watched_count + total_solved_mcq_assignment_count + total_solved_problems + total_solved_assignments)*100)/((total_videos.count() + total_mcq_assignment.count() + total_problem.count() + total_assignment.count())*user_profiles.count())
    data_dict = {
            "total_videos"                      : total_videos.count(),
            "total_mcq_assignment"              : total_mcq_assignment.count(),
            "total_problem"                     : total_problem.count(),
            "total_assignment"                  : total_assignment.count(),
            "total_user_count"                  : user_profiles.count(),
            "total_videos_watched_count"        : total_videos_watched_count,
            "total_solved_mcq_assignment_count" : total_solved_mcq_assignment_count,
            "total_solved_problems"             : total_solved_problems,
            "total_solved_assignments"          : total_solved_assignments,
            "active_users"                      : active_users,
            'user_activity'                     : user_activity_dict,
            "completion_percent"                : (int(completion_percent * 100))/100,
            "prev_week_active_user"             : prev_active_users
    }
 
    client = parent_batch[0].client
    start_date = ''
    end_date   = ''
    end_date = datetime.today()
    end_date = end_date.date()
    end_date = end_date - timezone.timedelta(days=1)
    total_days = 6
    
    user_profiles = UserProfile.objects.filter(assosiatedbatches__name__in = child_batch_names)

    users = User.objects.filter(profile__in=user_profiles, is_staff = True).distinct()

    time_spent    = {}
    distinct_user = {}
    aggregate_time = 0
    aggregate_distinct_user_count = 0

    for days in range(total_days ,-1,-1):
        start_day_time = end_date - timedelta(days = days)
        end_day_time   = end_date - timedelta(days = days - 1)
        usersessions   = UserSessions.objects.filter(user__in = users, session_start__gt = start_day_time, session_end__lt = end_day_time)
        
        distinct_user_count = 0
        distinct_user_count = usersessions.values('user').distinct().count()
        aggregate_distinct_user_count = aggregate_distinct_user_count + distinct_user_count
        total_session_time = timedelta(weeks=0, days=0, hours=0, minutes=0)
        distinct_user[f"{start_day_time}"] = distinct_user_count

        for session in usersessions:
            start_time = session.session_start
            end_time = session.session_end
            session_time = end_time - start_time 
            total_session_time = total_session_time + session_time
            
        total_seconds = total_session_time.total_seconds()              
        seconds_in_hour = 60 * 60                     
        total_session_time_hrs = total_seconds / seconds_in_hour  
        aggregate_time = aggregate_time + total_session_time_hrs
        time_spent[f"{start_day_time}"] = f"{total_session_time_hrs:.2f}"

    average_daily_distinct_users = aggregate_distinct_user_count/(total_days+1)
    data_dict["time_spent"] = time_spent
    data_dict["distinct_user"] = distinct_user
    data_dict["aggregate_time"] = f"{aggregate_time:.2f}"
    data_dict["average_daily_distinct_users"] = f"{average_daily_distinct_users:.2f}"
    return data_dict


def send_batch_stats_email(batch, emails):
    # stats = batch_stats("Capabl DS-0124")
    stats = batch_stats(batch)
    pprint.pprint(stats)
    # total_number_of_students = 104
    # active_students          = 31
    # time_spent_by_student    = 71.48
    # student_daily_login      = 12
    # total_videos             = 101
    # total_mcq                = 42
    # total_problems           = 34
    # toal_assignment          = 65

    total_number_of_students = stats["total_user_count"]
    active_students          = stats["active_users"]
    time_spent_by_student    = stats["aggregate_time"]
    student_daily_login      = stats["average_daily_distinct_users"]
    total_videos             = stats["total_videos"]
    total_mcq                = stats["total_mcq_assignment"]
    total_problems           = stats["total_problem"]
    toal_assignment          = stats["total_assignment"]

    # time_spent = {
    #     "2024-06-27": "6.00",
    #     "2024-06-28": "7.30",
    #     "2024-06-29": "9.10",
    #     "2024-06-30": "2.00",
    #     "2024-07-01": "3.00",
    #     "2024-07-02": "5.00",
    #     "2024-07-03": "10.00"
    # }
    time_spent = stats["time_spent"]

    dates = list(time_spent.keys())
    times = list(map(float, time_spent.values()))
    dates = [datetime.strptime(date, "%Y-%m-%d").strftime("%d %b") for date in dates]

    data = pd.DataFrame({'Date': dates, 'Time Spent (hours)': times})
    
    sns.set(style="whitegrid", context="talk")
    cmap = LinearSegmentedColormap.from_list("mycmap", ["#f0f4ff", "#d6eaff"])

    plt.figure(figsize=(6, 6))

    lineplot = sns.lineplot(data=data, x='Date', y='Time Spent (hours)', marker='o', linewidth=2.5, color='#1f77b4')

    plt.gca().set_facecolor(cmap(0.))
    plt.gcf().patch.set_facecolor(cmap(1.))
    plt.gcf().patch.set_alpha(0.5)

    lineplot.set_title('Time Spent Over Dates', fontsize=16, weight='bold', color='darkslategray')
    lineplot.set_xlabel('Date', fontsize=12, weight='bold', color='gray')
    lineplot.set_ylabel('Time Spent (hours)', fontsize=12, weight='bold', color='gray')
    lineplot.tick_params(labelsize=12, labelcolor='gray')
    plt.xticks()
    
    # for i, txt in enumerate(times):
    #     lineplot.annotate(f'{txt:.2f}', (dates[i], times[i]), textcoords="offset points", xytext=(0,10), ha='center', fontsize=10, color='black', weight='bold')
    plt.grid(True, which='both', linestyle='--', linewidth=0.5, color='gray', alpha=0.5)

    plt.tight_layout()
    buf1 = io.BytesIO()
    plt.savefig(buf1, format='png')
    buf1.seek(0)
    plt.close()

    # user_activity = {
    #     "2024-05-27": {"P": 2, "A": 3, "M": 6, "V": 1},
    #     "2024-05-28": {"P": 3, "A": 6, "M": 7, "V": 0},
    #     "2024-05-29": {"P": 9, "A": 2, "M": 5, "V": 8},
    #     "2024-05-30": {"P": 4, "A": 8, "M": 4, "V": 2},
    #     "2024-05-31": {"P": 1, "A": 2, "M": 8, "V": 9},
    #     "2024-06-01": {"P": 3, "A": 6, "M": 9, "V": 1},
    #     "2024-06-02": {"P": 2, "A": 1, "M": 6, "V": 9}
    # }

    user_activity = stats["user_activity"]
    
    dates = list(user_activity.keys())
    formatted_dates = [datetime.strptime(date, "%Y-%m-%d").strftime("%d %b") for date in dates]

    activities = ["P", "A", "M", "V"]
    data = {activity: [user_activity[date][activity] for date in dates] for activity in activities}
    sns.set(style="whitegrid", context="talk")

    cmap = LinearSegmentedColormap.from_list("mycmap", ["#f0f4ff", "#d6eaff"])

    fig, ax = plt.subplots(figsize=(6, 6))

    bottom = np.zeros(len(dates))
    colors = {'P': '#1f77b4', 'A': '#17becf', 'M': '#9467bd', 'V': '#aadcf0'}  # Blue shades and complementary colors

    for activity in activities:
        ax.bar(formatted_dates, data[activity], bottom=bottom, label=activity, color=colors[activity])
        bottom += np.array(data[activity])

    ax.set_facecolor(cmap(0.))
    fig.patch.set_facecolor(cmap(1.))
    fig.patch.set_alpha(0.5)

    ax.set_title('User Activity Over Dates', fontsize=16, weight='bold', color='darkslategray')
    ax.set_xlabel('Date', fontsize=12, weight='bold', color='gray')
    ax.set_ylabel('Activity Count', fontsize=12, weight='bold', color='gray')
    ax.tick_params(labelsize=10, labelcolor='gray')
    plt.xticks()
    ax.grid(True, which='both', linestyle='--', linewidth=0.5, color='gray', alpha=0.5)
    ax.legend(title='Activities', fontsize=10, title_fontsize='10')

    plt.tight_layout()
    buf2 = io.BytesIO()
    plt.savefig(buf2, format='png')
    buf2.seek(0)
    plt.close()
    # distinct_user = {
    #     "2024-06-21": 7,
    #     "2024-06-22": 4,
    #     "2024-06-23": 9,
    #     "2024-06-24": 10,
    #     "2024-06-25": 12,
    #     "2024-06-26": 14,
    #     "2024-06-27": 15
    # }
    distinct_user = stats["distinct_user"]

    dates = list(distinct_user.keys())
    values = list(distinct_user.values())

    dates = [datetime.strptime(date, "%Y-%m-%d").strftime("%d %b") for date in dates]

    sns.set(style="whitegrid", context="talk")
    cmap = LinearSegmentedColormap.from_list("mycmap", ["#f0f4ff", "#d6eaff"])
    fig, ax = plt.subplots(figsize=(6, 6))

    ax.set_facecolor(cmap(0.))
    fig.patch.set_facecolor(cmap(1.))
    fig.patch.set_alpha(0.5)

    bars = ax.bar(dates, values, color='#1f77b4', alpha=0.7, edgecolor='darkblue')

    ax.set_title('Distinct Users Over Dates', fontsize=16, weight='bold', color='darkslategray')
    ax.set_xlabel('Date', fontsize=12, weight='bold', color='gray')
    ax.set_ylabel('Distinct Users', fontsize=12, weight='bold', color='gray')
    ax.tick_params(labelsize=10, labelcolor='gray')
    plt.xticks()

    # for bar in bars:
    #     yval = bar.get_height()
    #     plt.text(bar.get_x() + bar.get_width()/2, yval + 0.5, int(yval), ha='center', fontsize=10, color='darkblue')

    ax.grid(True, which='both', linestyle='--', linewidth=0.5, color='gray', alpha=0.5)

    plt.tight_layout()

    buf3 = io.BytesIO()
    plt.savefig(buf3, format='png')
    buf3.seek(0)
    plt.close()

    buf3.seek(0)  

    # completion_percentage = 68.17
    completion_percentage = stats["completion_percent"]

    data = [completion_percentage, 100 - completion_percentage]
    labels = ['Completed', 'To Complete']
    colors = ['#1f77b4', '#d3d3d3']

    sns.set(style="whitegrid", context="talk")

    fig, ax = plt.subplots(figsize=(6, 6))

    cmap = LinearSegmentedColormap.from_list("mycmap", ["#f0f4ff", "#d6eaff"])

    wedges, texts, autotexts = ax.pie(data, labels=labels, colors=colors, autopct='%1.1f%%', startangle=90, pctdistance=0.85, wedgeprops=dict(width=0.3, edgecolor='w'))

    centre_circle = plt.Circle((0, 0), 0.70, color='white', fc='white', linewidth=1.25)
    fig.gca().add_artist(centre_circle)
    
    ax.set_facecolor(cmap(0.))
    fig.patch.set_facecolor(cmap(1.))
    fig.patch.set_alpha(0.5)

    ax.axis('equal')

    plt.setp(autotexts, size=10, weight="bold", color="darkslategray")
    plt.setp(texts, size=10, weight="bold", color="gray")

    plt.title('Avg. Completion Percentage: {:.2f}%'.format(completion_percentage), fontsize=16, weight='bold', color='darkslategray')

    buf4 = io.BytesIO()
    plt.savefig(buf4, format='png')
    buf4.seek(0)
    plt.close()
    # time.sleep(6)

    weekly_student_change = ""
    if stats["prev_week_active_user"] > stats["active_users"]:
        if stats["active_users"] == 0:
            weekly_student_change = f'User Logins increased by {stats["prev_week_active_user"]}% in comparison to previous week'
        else:
            weekly_student_change  = f'User Logins increased by {((stats["prev_week_active_user"] - stats["active_users"])/stats["active_users"]) * 100}% in comparison to previous week'

    elif stats["prev_week_active_user"] ==  stats["active_users"]:
        weekly_student_change = "User Logins were similar to previous week."

    elif stats["prev_week_active_user"] < stats["active_users"]:
        if stats["prev_week_active_user"] == 0:
            weekly_student_change = f'User Logins decreased by {stats["active_users"]}% in comparison to previous week'
        else:
            weekly_student_change = f'User Logins decreased by {((stats["active_users"] - stats["prev_week_active_user"])/stats["prev_week_active_user"]) * 100}% in comparison to previous week'

    week_completed_data= {
        "Videos"                   : stats["total_videos_watched_count"],
        "MCQassigment"             : stats["total_solved_mcq_assignment_count"],
        "Problems"                 : stats["total_solved_problems"],
        "Assignment"               : stats["total_solved_assignments"]
    }
    # week_completed_data= {
    #     "Videos"                    : 0,
    #     "MCQassigment"              : 0,
    #     "Problems"                  : 0,
    #     "Assignment"                : 0,
    # }

    sorted_week_data = dict(sorted(week_completed_data.items(), key = lambda item : item[1], reverse = True))
    this_week_content_stats = ''

    first_entry = next(iter(sorted_week_data.items()))

    if first_entry[1] != 0:
        this_week_content_stats = f"<li>Students for this batch uses our platform mostly for {first_entry[0]}</li>"
    
    
    body = f'''
    <html lang="en">
    <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
            <title>Data Report</title>
            <style>
            body {{
                font-family: 'Roboto';
                font-size: 12px;
            }}
            li {{
                font-size: 14px;
            }}
            p{{
                font-size: 14px;
            }}
            table {{
                border-collapse: collapse;
                width: 100%;
                max-width: 600px; /* Adjust width as needed */
                margin-bottom: 20px;
                background-color: #f0f4ff; /* Light blue background */
                border: 1px solid #ddd; /* Light gray border */
            }}
            table th, table td {{
                border: 1px solid #ddd;
                padding: 8px;
                text-align: left;
                font-size: 14px;
            }}
            table th {{
                background-color: #1f77b4; /* Subtle blue for header */
                color: white;
            }}
            table td{{
            }}
            </style>
    </head>
    <body>
    <div class="content">
            <h2>Hello, Here is Your Weekly Report For Batch - <b>{batch}</b></h2>
            <hr>
            <h2>Analysis</h2>
            <li>{weekly_student_change}</li>
            {this_week_content_stats}
            <hr>
            <h2>Graphs</h2>
            <img src="cid:TimeSpentByStudents"  alt="Graph" style="max-width: 100%; height: auto;">
            <img src="cid:UserActivity"         alt="Graph" style="max-width: 100%; height: auto;">
            <img src="cid:DistinctUsersPerDay"  alt="Graph" style="max-width: 100%; height: auto;">
            <img src="cid:CompletionPercentage" alt="Graph" style="max-width: 100%; height: auto;">
            <hr>
            <h2>Students Stats</h2>
            <table>
                <tr>
                        <td>Total number of Students</td>
                        <td>{total_number_of_students}</td>
                </tr>
                <tr>
                        <td>Active Students (LoggedIn in past 7 days)</td>
                        <td>{active_students}</td>
                </tr>
                <tr>
                        <td>Total Time spent by Students (hours)</td>
                        <td>{time_spent_by_student}</td>
                </tr>
                <tr>
                        <td>Average No. of student LoggingIn Daily </td>
                        <td>{student_daily_login}</td>
                </tr>
            </table>
            <hr>
                <h2>Batch Stats</h2>

            <table>
                <tr>
                        <td>Total Videos</td>
                        <td>{total_videos}</td>
                </tr>
                <tr>
                        <td>Total MCQs</td>
                        <td>{total_mcq}</td>
                </tr>
                <tr>
                        <td>Total Problems</td>
                        <td>{total_problems}</td>
                </tr>
                <tr>
                        <td>Total Assignments</td>
                        <td>{toal_assignment}</td>
                </tr>
            </table><br/>
    </div>
    <p>
    <br/>For more information Please Checkout this Batch's Dashboard on our <a href = "https://codingjudge.com/manage/batch">Website</a>.<br/> <br/>
    Thankyou <br/>
    CodingJudge Team <br/>
    </p>
    </body>
    </html>
    '''
    
    images = {
        "TimeSpentByStudents" : buf1,
        "UserActivity"        : buf2,
        "DistinctUsersPerDay" : buf3,
        "CompletionPercentage": buf4
    }
    
    batch_stats_mail("email subject", body, emails, images)

# @app.task
def start_sending_batch_emails():
    batches = ChildBatch.objects.all()
    req_batches = ["Careerpedia - Data Analytics", "Careerpedia - Data Science"]
    for batch in batches:
        if batch.name in req_batches:
            client = Batch.objects.get(childbatch = batch.pk).client
            print(client.name)
            users = User.objects.filter(profile__client = client.pk, is_staff = True)
            # emails = []
            # for user in users:
            #     print(user.username)
            #     emails.append(user.email)
            # print(emails)
            emails = ["dhruvgupta3377@gmail.com", "dgupta7_be21@thapar.edu", "mail.shubhamlal@gmail.com", "balbiryadaviitdelhi1000@gmail.com"]
            send_batch_stats_email(batch.name,emails)
    # emails = ["dhruvgupta3377@gmail.com", "dgupta7_be21@thapar.edu"]
    # send_batch_stats_email("Capabl DS-0124",emails)   
