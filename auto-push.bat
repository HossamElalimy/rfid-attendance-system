@echo off
cd /d "C:\Users\Administrator\Desktop\Hossam\rfid-attendance-system-main\rfid-attendance-system-main"

echo Adding all tracked and untracked files...
git add -A
git add -f auto-push.bat

echo Checking for changes...
git diff --cached --quiet
IF %ERRORLEVEL% NEQ 0 (
    echo Committing changes with timestamp...
    git commit -m "Auto update %date% %time%"
) ELSE (
    echo No changes to commit.
)

echo Pulling remote changes...
git pull origin main --allow-unrelated-histories --no-edit

echo Pushing to GitHub...
git push origin main

echo Push complete.
pause