@echo off
echo Starting ToolLink servers...

echo.
echo Starting Backend Server...
start cmd /k "cd backend && npm run dev"

echo.
echo Starting Frontend Server...
start cmd /k "npm run dev"

echo.
echo Both servers should be starting now in separate command windows.
echo.
echo - Backend will run on http://localhost:3001
echo - Frontend will run on http://localhost:5173
echo.
echo After both servers start, you can access the application at http://localhost:5173
echo.

pause
