import pandas as pd
import json

# Load the original CSV file into a DataFrame
df = pd.read_csv('ev-capabl-report.csv')

# List of unique topics
unique_topics = ['Aptitude', 'Aptitude - Ages', 'Aptitude - Clocks', 'Aptitude - Coding Pattern Recognition', 'Aptitude - HCF & LCM', 'Aptitude - Height and Distance', 'Aptitude - Logarithms', 'Aptitude - Number Series 2', 'Aptitude - Number Series Pattern Recognition', 'Aptitude - Permutation and Combination', 'Aptitude - Probability', 'Aptitude - Problems on Train', 'Aptitude - Profit and Loss', 'Aptitude - Progression Series', 'Aptitude - Ratios', 'Aptitude - Time and Work', 'Aptitude 3', 'Aptitude Quiz - Calender', 'Aptitude Quiz - Clocks', 'Aptitude Quiz - Coding & Decoding', 'Aptitude Quiz - Geometry and Mensuration', 'BMS', 'Basic Concepts of EV', 'Battery Calculations and Benchmark studies', 'Battery Chemistry', 'Battery Management System - I', 'Battery Management System - II', 'Battery Management System - III', 'Battery Management Systems (BMS)', 'Battery Pack Design', 'Battery Performance Metrics', 'Battery Properties-1', 'Battery Properties-2', 'Battery Safety', 'Battery Testing and Characterization', 'Battery design', 'CAD', 'Charging Infrastructure', 'Charging Infrastructure Design', 'Charging Infrastructure Policies', 'Charging Modes', 'Charging Standards ', 'Charging and Discharging Techniques', 'Charging station components', 'Control Architecture -2 - part 3', 'EMI/EMC Considerations', 'EV Charging Part 2', 'Embedded System & C language', 'Gate Drive Circuits', 'History of Battery Technology', 'International Standards and Harmonization', 'Inverter Design and Control', 'Lithium-Ion Cell Charging', 'Lithium-ion Battery Technology - 1', 'Lithium-lon Battery Terminologies - 1', 'Lithium-lon Battery Terminologies - 2', 'Manual Transmission', 'Matlab', 'Power Electronics Converters', 'Power Factor Correction (PFC)', 'Power Semiconductor Devices', 'Powertrain Electrification', 'Protection and Fault Diagnosis', 'Regenerative Braking', 'Safety Considerations', 'System Integration and Control', 'Thermal Management', 'Topology of EV Powertrains', 'Vehicle transmission']
new_df = pd.DataFrame(columns=['name', 'email', 'mobile', 'attempted_mcq_count', 'total_mcq_score', 'rem_time', 'submission_date'] + unique_topics)

# Function to parse the JSON data and extract values
def extract_correct_attempts(json_data, topics):
    attempts = json.loads(json_data)
    return {topic: attempts.get(topic, 0) for topic in topics}

# List to store each row of the new DataFrame
rows = []

# Iterate over each row in the original DataFrame
for index, row in df.iterrows():
    # Extract user information
    user_info = row[['name', 'email', 'mobile', 'attempted_mcq_count', 'total_mcq_score', 'rem_time', 'submission_date']].to_dict()
    
    # Extract correct attempts for each topic
    correct_attempts = extract_correct_attempts(row['correct topicwise attempts'], unique_topics)
    
    # Combine user information with correct attempts
    combined_data = {**user_info, **correct_attempts}
    
    # Append the combined data to the list of rows
    rows.append(combined_data)

# Create a new DataFrame from the list of rows
new_df = pd.DataFrame(rows, columns=new_df.columns)

# Save the new DataFrame to a CSV file
new_df.to_csv('transformed_ev.csv', index=False)