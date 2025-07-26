#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 GitHub Pages Gallery Updater${NC}"
echo "=================================="

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo -e "${RED}❌ Error: Not in a git repository${NC}"
    exit 1
fi

# Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
    echo -e "${YELLOW}⚠️  You have uncommitted changes:${NC}"
    git status --porcelain
    echo
    read -p "Do you want to commit these changes first? (y/N): " commit_changes
    
    if [[ $commit_changes =~ ^[Yy]$ ]]; then
        echo
        read -p "Enter commit message: " commit_message
        if [[ -z "$commit_message" ]]; then
            commit_message="Update gallery files"
        fi
        
        echo -e "${BLUE}📝 Committing changes...${NC}"
        git add .
        git commit -m "$commit_message

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ Changes committed successfully${NC}"
        else
            echo -e "${RED}❌ Failed to commit changes${NC}"
            exit 1
        fi
    else
        echo -e "${YELLOW}⚠️  Proceeding without committing changes...${NC}"
    fi
fi

# Prompt for GitHub username
echo
read -p "Enter GitHub username: " username

# Validate username input
if [[ -z "$username" ]]; then
    echo -e "${RED}❌ Error: Username cannot be empty${NC}"
    exit 1
fi

# Construct repository URL
repo_url="git@github.com:${username}/${username}.github.com.git"
echo
echo -e "${BLUE}🎯 Target repository: ${repo_url}${NC}"

# Check if remote origin exists and get current URL
current_remote=$(git remote get-url origin 2>/dev/null)

if [[ -n "$current_remote" ]]; then
    echo -e "${YELLOW}📍 Current origin: ${current_remote}${NC}"
    
    # Check if we need to update the remote URL
    if [[ "$current_remote" != "$repo_url" && "$current_remote" != "https://github.com/${username}/${username}.github.com.git" ]]; then
        echo
        read -p "Update remote origin to match username? (Y/n): " update_remote
        
        if [[ ! $update_remote =~ ^[Nn]$ ]]; then
            echo -e "${BLUE}🔧 Updating remote origin...${NC}"
            git remote set-url origin "$repo_url"
            echo -e "${GREEN}✅ Remote origin updated${NC}"
        fi
    fi
else
    echo -e "${BLUE}🔧 Adding remote origin...${NC}"
    git remote add origin "$repo_url"
    echo -e "${GREEN}✅ Remote origin added${NC}"
fi

# Get current branch
current_branch=$(git branch --show-current)
echo -e "${BLUE}🌿 Current branch: ${current_branch}${NC}"

# Push to repository
echo
echo -e "${BLUE}🚀 Pushing to repository...${NC}"
git push -u origin "$current_branch"

if [ $? -eq 0 ]; then
    echo
    echo -e "${GREEN}🎉 Successfully pushed to ${username}.github.com!${NC}"
    echo -e "${GREEN}🌐 Your gallery will be available at: https://${username}.github.io${NC}"
    
    # Offer to open the website
    if command -v open >/dev/null 2>&1; then
        echo
        read -p "Open the website in your browser? (y/N): " open_site
        if [[ $open_site =~ ^[Yy]$ ]]; then
            open "https://${username}.github.io"
        fi
    fi
else
    echo
    echo -e "${RED}❌ Failed to push to repository${NC}"
    echo -e "${YELLOW}💡 Make sure you have:${NC}"
    echo "   - SSH key configured for GitHub"
    echo "   - Write access to the repository"
    echo "   - Repository exists at github.com:${username}/${username}.github.com"
    exit 1
fi