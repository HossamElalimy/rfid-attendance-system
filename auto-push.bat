@echo off
cd /d "C:\Users\Administrator\Desktop\Hossam\rfid-attendance-system-main\rfid-attendance-system-main"

echo 📂 Forcing tracked files...
git add backend frontend
git add -f auto-push.bat

echo 📝 Committing changes with timestamp...
git commit -m "Auto update %date% %time%"

echo 🔄 Pulling any remote changes...
git pull origin main --allow-unrelated-histories

echo 🚀 Pushing to GitHub...
git push origin main

echo ✅ Push complete!
pause