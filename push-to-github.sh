#!/bin/bash

# Chronos Studio - GitHub Push Script
# Repository: https://github.com/bjaouihichem316-boop/ChronosStudio

echo "🚀 Chronos Studio - Pushing to GitHub"
echo "======================================"
echo ""
echo "Repository: https://github.com/bjaouihichem316-boop/ChronosStudio"
echo "Branch: main"
echo ""

# Check if git is initialized
if [ ! -d .git ]; then
    echo "⚠️  Git not initialized. Initializing..."
    git init
fi

# Add all files
echo "📦 Adding files..."
git add .

# Check if there are changes to commit
if git diff --staged --quiet; then
    echo "✅ No changes to commit. Repository is up to date."
else
    # Create commit
    echo "💾 Creating commit..."
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
✅ Research Workspace (Stage 2)
✅ Script Studio (Stage 3)
✅ Production Studio Foundation (Stage 4)

Ready for Stage 5: AI Generation Pipeline"

    echo "✅ Commit created successfully"
fi

# Check if remote is configured
if ! git remote | grep -q "origin"; then
    echo "🔗 Adding remote origin..."
    git remote add origin https://github.com/bjaouihichem316-boop/ChronosStudio.git
fi

# Set main branch
echo "🌿 Setting main branch..."
git branch -M main

# Push to GitHub
echo "📤 Pushing to GitHub..."
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Successfully pushed to GitHub!"
    echo ""
    echo "Repository: https://github.com/bjaouihichem316-boop/ChronosStudio"
    echo "Branch: main"
    echo "Status: ✅ Live"
else
    echo ""
    echo "❌ Push failed. Please check:"
    echo "1. GitHub credentials are configured"
    echo "2. Repository exists and you have push access"
    echo "3. Try: gh auth login"
fi
