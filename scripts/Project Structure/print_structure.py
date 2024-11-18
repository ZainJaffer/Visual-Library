import os
from pathlib import Path
from datetime import datetime

def write_structure():
    # Get the project root
    current_path = Path.cwd()
    
    # Create output file path in the same directory as the script
    output_file = Path(__file__).parent / 'project_structure.txt'
    
    with open(output_file, 'w', encoding='utf-8') as f:
        # Write header
        f.write(f"Project Structure - Generated on {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        f.write("=" * 50 + "\n\n")
        f.write(f"Starting from: {current_path}\n\n")
        
        # Write structure
        for root, dirs, files in os.walk(current_path):
            # Skip unwanted directories
            dirs[:] = [d for d in dirs if d not in {'.git', '__pycache__', 'node_modules', 'venv'}]
            
            level = root.replace(str(current_path), '').count(os.sep)
            indent = '    ' * level
            f.write(f"{indent}{os.path.basename(root)}/\n")
            
            subindent = '    ' * (level + 1)
            for file in files:
                f.write(f"{subindent}{file}\n")

if __name__ == "__main__":
    write_structure()
    print("Structure has been written to:", Path(__file__).parent / 'project_structure.txt')