@echo off
:: MoodTune AI — Backend Startup Script (Windows)
echo Starting MoodTune AI Backend...
cd /d %~dp0
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
