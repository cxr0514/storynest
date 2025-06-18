#!/bin/bash

# 🚀 StoryNest GitHub Setup and Push Script
# Run this script after creating a GitHub repository

echo "🌟 Setting up StoryNest GitHub repository..."

# Check if GitHub remote exists
if git remote get-url origin >/dev/null 2>&1; then
    echo "✅ GitHub remote already configured"
else
    echo "⚠️  Please enter your GitHub repository URL:"
    echo "   Example: https://github.com/yourusername/storynest.git"
    read -p "Repository URL: " REPO_URL
    
    if [ -n "$REPO_URL" ]; then
        git remote add origin "$REPO_URL"
        echo "✅ GitHub remote added: $REPO_URL"
    else
        echo "❌ No repository URL provided. Please run:"
        echo "   git remote add origin https://github.com/yourusername/storynest.git"
        exit 1
    fi
fi

# Check git status
echo "📋 Current git status:"
git status --short

# Push to GitHub
echo "🚀 Pushing to GitHub..."
if git push -u origin main; then
    echo "🎉 Successfully pushed StoryNest to GitHub!"
    echo ""
    echo "📝 Next steps:"
    echo "1. Visit your GitHub repository"
    echo "2. Review the README.md for setup instructions" 
    echo "3. Configure GitHub Actions for CI/CD (optional)"
    echo "4. Set up deployment to Vercel or your preferred platform"
    echo "5. Begin beta testing with families!"
    echo ""
    echo "🌟 StoryNest is now ready for the world!"
else
    echo "❌ Failed to push to GitHub. Please check:"
    echo "1. Repository URL is correct"
    echo "2. You have push permissions"
    echo "3. Repository exists on GitHub"
    echo ""
    echo "Manual push command:"
    echo "git push -u origin main"
fi
