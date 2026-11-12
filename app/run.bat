@echo off
title NODES — E-Learning Platform

echo ====================================
echo   NODES — E-Learning Platform
echo   IMK • Teknik Informatika • ITI
echo ====================================
echo.

:: Cek apakah Python tersedia
where python >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python tidak ditemukan di PATH!
    echo Instal Python 3.11+ dari https://python.org
    pause
    exit /b 1
)

:: Instal dependensi Python jika belum
if not exist "server\venv" (
    echo [1/3] Menginstal dependensi Python...
    cd server
    pip install -r requirements.txt -q
    cd ..
) else (
    echo [1/3] Dependensi Python sudah terinstal.
)

:: Build frontend jika belum ada
if not exist "web\dist\index.html" (
    echo [2/3] Membangun frontend...
    cd web
    call npm install
    call npm run build
    cd ..
) else (
    echo [2/3] Frontend sudah di-build.
)

echo [3/3] Menjalankan server...
echo.
echo ========================================
echo   Akses: http://127.0.0.1:8787
echo   Demo:  demo@nodes.id / Nodes#2026
echo   Tekan Ctrl+C untuk menghentikan
echo ========================================
echo.

cd server
python -m uvicorn app.main:app --host 127.0.0.1 --port 8787

pause

