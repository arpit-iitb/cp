import ast
from openai import OpenAI
from decouple import config
client = OpenAI(
    api_key= config("openai_api_key")
)

def AIDescription(transcript, sys_prompt):
    print("generating AI Description...")
    sys_prompt_default = '''
    You will be provided with subtitle of educational video. Your task is to generate the good formated description like the example given below. Subtitle contains timestamp as well, you need not to include subtitle in the description that you'll generate.
    Here is the sample response and you are expected to return results in same format. Heading will differ as per the video contents. 
    <div>
    <style>
        #code-box {
            background-color: #272822;
            color: #f8f8f2;
            padding: 10px;
            border-radius: 5px;
            overflow-x: auto;
            margin: 10px 0;
        }
        code {
            font-family: 'Courier New', Courier, monospace;
        }
        .keyword {
            color: #f92672; /* pink */
        }

        .comment {
            color: #00ffff; /* cyan */
        }
        .function {
            color: #a6e22e; /* light green */
        }
        .number {
            color: #f92672; /* pink */
        }
        .type-example {
            color: #ffa500; /* orange */
        }
        h1 {
            color: #001f68; /* dark blue */
            font-weight: bold;
        }
        h2 {
            color: #001f3f; /* dark blue */
            font-weight: bold;
        }
        h3 {
            color: #000A30; /* light blue */
            font-weight: bold;
        }
    </style>
</div>

<h1>Introduction to Excel</h1><br>

<h2>Overview</h2>
<p>Hello everyone. In this session, we are going to give a brief introduction to Excel Spreadsheet software are very simple but have rows and columns and it has a tabular form data predominantly. Excel is the most commonly used and it has a lot of features built into it.</p><br>

<h2>Why Excel?</h2>
<p>Predominantly, it is used for data cleaning, pivot tables, visualization, and many other tasks. This session covers how Excel is used in data analytics with a brief introduction. Normally, we'll be importing and cleaning data. These are the two common formats for the Excel spreadsheet.</p><br>

<h3>What is Excel?</h3>
<p>Excel supports different data formats, including tab-delimited and comma-separated values (CSV). For example, let's say you have A, B, C; this means you'll get A in one cell, B in another cell, and C in another cell. 
<h3>Features of Excel</h3>
<p>Using Excel, you can complete or replace missing values, remove duplicates, find and handle outliers, sort and filter data, and use pivot tables for data exploration. </p><br>

<h2>Conclusion</h2>
<p>Excel is a powerful tool for various data-related tasks but has limitations, especially with larger datasets and complex calculations. Understanding its strengths and weaknesses can help you use it more effectively in your data analysis workflows.</p><br>

<h2>Further Readings and Resources</h2><br>
<p><a href="https://support.microsoft.com/en-us/excel"><u>Excel Support - Microsoft</u></a></p>
    '''

    completion = client.chat.completions.create(
    model="gpt-3.5-turbo",
    max_tokens=4000,
    messages=[
        {"role": "system", "content": sys_prompt},
        {"role": "user", "content": transcript }
    ],

)

    print("LLM response received successfully")
    message = completion.choices[0].message
    result = message.content

    return result


def AITopic(question, topic_list):
    print("generating AI Description...")
    sys_prompt_default = f'''
    You will be provided with question text and topic list, You are supposed to choose 1 item at any given index which best suitable. Don't return anything else.
    topic_list: {topic_list}
    '''

    completion = client.chat.completions.create(
    model="gpt-3.5-turbo",
    max_tokens=4000,
    messages=[
        {"role": "system", "content": sys_prompt_default},
        {"role": "user", "content": f'question text: {question}' }
    ],

)

    print("LLM response received successfully")
    message = completion.choices[0].message
    result = message.content

    return result

def AIMCQ(transcript, sys_prompt):
    print("generating AI Description...")

    completion = client.chat.completions.create(
    model="gpt-3.5-turbo",
    max_tokens=4000,
    messages=[
        {"role": "system", "content": sys_prompt},
        {"role": "user", "content": transcript }
    ],

)

    print("LLM response received successfully")
    message = completion.choices[0].message
    result = message.content

    return result