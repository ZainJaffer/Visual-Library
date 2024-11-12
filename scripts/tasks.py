import json
from pprint import pprint
import pandas as pd

# Replace 'data.json' with your actual file name
input_file_path = 'C:/Users/Zain Jaffer/Desktop/Dev/Full Stack/Visual Library/scripts/old_data.json'
output_file_path = 'C:/Users/Zain Jaffer/Desktop/Dev/Full Stack/Visual Library/scripts/new_data.json'

with open(input_file_path, 'r', encoding='utf-8') as file:
    data = json.load(file)

print(f"Type of the JSON object: {type(data)}")

if isinstance(data, dict):
    print("Top-level keys:")
    for key in data.keys():
        print(f"- {key}")


# Check if 'cards' key exists and is a list
if 'cards' in data and isinstance(data['cards'], list):
    print(f"'cards' contains {len(data['cards'])} items.")
    print("First card details:")
    pprint(data['cards'][0])
else:
    print("'cards' key is not found or is not a list.")


# Initialize an empty list to store extracted data
extracted_data = []

# Iterate through each card in the 'cards' list
for card in data.get('cards', []):
    card_name = card.get('name', '')  # Extract card name 
    description = card.get('desc', '')  # Extract description
    description = description.split("\n")
    
    # Extract label names
    labels = card.get('labels', [])
    label_names = [label.get('name', '') for label in labels]
    
    
    # Append the extracted information as a dictionary
    extracted_data.append({
        'Card Name': card_name,
        'Description': description,
        'Labels': label_names
    })


print(extracted_data)
print(len(extracted_data))

with open(output_file_path, 'w', encoding='utf-8') as file:
    json.dump(extracted_data,file)
