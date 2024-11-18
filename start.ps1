# Activate virtual environment
.\venv\Scripts\activate.ps1
cd backend

# Ask user what they want to do
$choice = Read-Host "What would you like to do?
1. Set up environment only
2. Start Django server
Enter your choice (1 or 2)"

if ($choice -eq "1") {
    Write-Host "Environment ready! You can now run Django commands."
} elseif ($choice -eq "2") {
    python manage.py runserver
} else {
    Write-Host "Invalid choice. Please enter 1 or 2."
}