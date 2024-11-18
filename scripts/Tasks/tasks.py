import json
from pprint import pprint

# Replace 'data.json' with your actual file name
input_file_path = 'C:/Users/Zain Jaffer/Desktop/Dev/Full Stack/Visual Library/scripts/Tasks/old_data.json'
output_file_path = 'C:/Users/Zain Jaffer/Desktop/Dev/Full Stack/Visual Library/scripts/Tasks/new_data.json'

# First, let's print out all unique list IDs and their cards to help map them
list_cards = {}

with open(input_file_path, 'r', encoding='utf-8') as file:
    data = json.load(file)

# First pass - collect all list IDs and their associated card names
for card in data.get('cards', []):
    list_id = card.get('idList')
    card_name = card.get('name', '')
    if list_id not in list_cards:
        list_cards[list_id] = []
    list_cards[list_id].append(card_name)


# Create mapping of list IDs to stages
list_id_to_stage = {
    "672e6ec0dbe0609e72fff6bf": "To Do",        # First list with "Configure Development..."
    "672e6f1e1ea3792335a845c6": "In Progress",  # List with "Set up virtual environment..."
    "672e6f4891e89a856bf96187": "Testing",      # List with "Create Basic Navigation..."
    "672e6f23978e80891a2b5b58": "Done",
    "672e6f2866425210e3f8412e": "Backlog"    
          # List with "Set up GitHub Repo..."
}

# Print out the mapping to verify
print("\nPrinting samples of each stage:")
for list_id, cards in list_cards.items():
    stage = list_id_to_stage.get(list_id, "No Stage")
    print(f"\nStage: {stage}")
    print("Sample cards in this stage:")
    for card in cards[:3]:  # Print first 2 cards as example
        print(f"- {card}")

# Initialize an empty list to store extracted data
extracted_data = []

# Iterate through each card in the 'cards' list
for card in data.get('cards', []):
    card_name = card.get('name', '')
    description = card.get('desc', '')
    description = description.split("\n")
    
    # Extract label names
    labels = card.get('labels', [])
    label_names = [label.get('name', '') for label in labels]
    
    # Get the stage based on list ID
    list_id = card.get('idList')
    stage_name = list_id_to_stage.get(list_id, "No Stage")
    
    # Append the extracted information as a dictionary
    extracted_data.append({
        'Card Name': card_name,
        'Description': description,
        'Labels': label_names,
        'Stage': [stage_name]  # Keep as list to maintain consistency with original format
    })

# Add some debugging in the card processing loop
for card in data.get('cards', []):
    list_id = card.get('idList')
    card_name = card.get('name', '')
    if not list_id:
        print(f"Warning: Card '{card_name}' has no list ID")
    elif list_id not in list_id_to_stage:
        print(f"Warning: Card '{card_name}' has unknown list ID: {list_id}")

# Save the extracted data
with open(output_file_path, 'w', encoding='utf-8') as file:
    json.dump(extracted_data, file, indent=4)

print(f"\nProcessed {len(extracted_data)} cards")
