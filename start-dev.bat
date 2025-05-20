@echo off
echo Stopping any existing Node.js processes...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo Cleaning Angular cache...
if exist .angular\cache rmdir /s /q .angular\cache
timeout /t 2 /nobreak >nul

echo Starting Angular development server...
ng serve --poll

pause
