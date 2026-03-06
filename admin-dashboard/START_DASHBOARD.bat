@echo off
echo.
echo ╔════════════════════════════════════════════════════════╗
echo ║   STARTING ADMIN DASHBOARD                            ║
echo ╚════════════════════════════════════════════════════════╝
echo.

cd /d "%~dp0"

echo Stopping any running servers on port 3000...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000 ^| findstr LISTENING') do taskkill /F /PID %%a 2>nul
timeout /t 2 /nobreak >nul

echo.
echo Clearing Next.js cache...
if exist .next rmdir /s /q .next 2>nul
if exist node_modules\.cache rmdir /s /q node_modules\.cache 2>nul

echo.
echo Starting server...
echo.
echo ═══════════════════════════════════════════════════════
echo   Admin Dashboard will be available at:
echo   http://localhost:3000
echo.
echo   Live Fleet Map:
echo   http://localhost:3000/map
echo ═══════════════════════════════════════════════════════
echo.

npm run dev
