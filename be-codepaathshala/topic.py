import pandas as pd
import json

# Load the CSV file into a DataFrame
df = pd.read_csv('ev-capabl-report.csv')

# Initialize an empty set to store unique topics
unique_topics = set()

# Function to extract topics from JSON columns
def extract_topics(json_data):
    topics = json.loads(json_data)
    return set(topics.keys())

# Iterate over each row in the DataFrame
for index, row in df.iterrows():
    # Extract topics from 'correct_topicwise_attempts' column
    correct_topics = extract_topics(row['correct topicwise attempts'])
    unique_topics.update(correct_topics)
    
    # Extract topics from 'incorrect_topicwise_attempts' column
    incorrect_topics = extract_topics(row['incorrect topicwise attempts'])
    unique_topics.update(incorrect_topics)

# Convert the set to a sorted list
unique_topics_list = sorted(unique_topics)

# Print the unique topics
print(unique_topics_list)
