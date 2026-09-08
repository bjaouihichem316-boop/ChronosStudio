@echo off
REM Chronos Studio - GitHub Push Script for Windows
REM Repository: https://github.com/bjaouihichem316-boop/ChronosStudio

echo.
echo Chronos Studio - Pushing to GitHub
echo ======================================
echo.
echo Repository: https://github.com/bjaouihichem316-boop/ChronosStudio
echo Branch: main
echo.

REM Check if git is initialized
if not exist .git (
    echo Git not initialized. Initializing...
    git init
)

REM Add all files
echo Adding files...
git add .

REM Check if there are changes to commit
git diff --staged --quiet
if %errorlevel% equ 0 (
    echo No changes to commit. Repository is up to date.
) else (
    REM Create commit
    echo Creating commit...
    git commit -m "feat: complete production studio foundation

- Add Production Studio with characters, locations, scenes, shots, storyboard, and assets
- Implement shot breakdown system with full metadata
- Add visual storyboard interface
- Create production overview dashboard with progress metrics
- Integrate Production with existing Script and Research domains
- Add comprehensive sample data for 'The Fall of Constantinople — 1453'
- Update README with full project documentation
- Enhance .gitignore for better repository hygiene

Stage 4 Complete:
- Research Workspace (Stage 2)
- Script Studio (Stage 3)
- Production Studio Foundation (Stage 4)

Ready for Stage 5: AI Generation Pipeline"

    echo Commit created successfully
)

REM Check if remote is configured
git remote | findstr "origin" >nul
if %errorlevel% neq 0 (
    echo Adding remote origin...
    git remote add origin https://github.com/bjaouihichem316-boop/ChronosStudio.git
)

REM Set main branch
echo Setting main branch...
git branch -M main

REM Push to GitHub
echo Pushing to GitHub...
git push -u origin main

if %errorlevel% equ 0 (
    echo.
    echo Successfully pushed to GitHub!
    echo.
    echo Repository: https://github.com/bjaouihichem316-boop/ChronosStudio
    echo Branch: main
    echo Status: Live
) else (
    echo.
    echo Push failed. Please check:
    echo 1. GitHub credentials are configured
    echo 2. Repository exists and you have push access
    echo 3. Try: gh auth login
)

echo.
pause
