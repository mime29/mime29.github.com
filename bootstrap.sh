#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

echo -e "${MAGENTA}🚀 GitHub Pages Gallery Bootstrap${NC}"
echo "====================================="
echo

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to install GitHub CLI
install_gh_cli() {
    echo -e "${BLUE}📦 Installing GitHub CLI...${NC}"
    
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        if command_exists brew; then
            brew install gh
        else
            echo -e "${RED}❌ Homebrew not found. Please install Homebrew first:${NC}"
            echo "   /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
            return 1
        fi
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        if command_exists apt; then
            # Debian/Ubuntu
            curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
            sudo chmod go+r /usr/share/keyrings/githubcli-archive-keyring.gpg
            echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
            sudo apt update
            sudo apt install gh
        elif command_exists yum; then
            # Red Hat/CentOS/Fedora
            sudo dnf install 'dnf-command(config-manager)'
            sudo dnf config-manager --add-repo https://cli.github.com/packages/rpm/gh-cli.repo
            sudo dnf install gh
        else
            echo -e "${RED}❌ Unable to automatically install GitHub CLI on this Linux distribution${NC}"
            echo -e "${YELLOW}💡 Please install manually: https://github.com/cli/cli#installation${NC}"
            return 1
        fi
    else
        echo -e "${RED}❌ Unsupported operating system: $OSTYPE${NC}"
        echo -e "${YELLOW}💡 Please install GitHub CLI manually: https://github.com/cli/cli#installation${NC}"
        return 1
    fi
}

# Function to setup SSH key
setup_ssh_key() {
    local email="$1"
    local ssh_key_path="$HOME/.ssh/id_ed25519"
    
    echo -e "${BLUE}🔑 Setting up SSH key...${NC}"
    
    if [[ -f "$ssh_key_path" ]]; then
        echo -e "${YELLOW}📍 SSH key already exists at $ssh_key_path${NC}"
        read -p "Use existing SSH key? (Y/n): " use_existing
        if [[ $use_existing =~ ^[Nn]$ ]]; then
            ssh_key_path="$HOME/.ssh/id_ed25519_github_$(date +%s)"
            echo -e "${BLUE}📝 Creating new SSH key at $ssh_key_path${NC}"
        else
            return 0
        fi
    fi
    
    # Generate SSH key
    ssh-keygen -t ed25519 -C "$email" -f "$ssh_key_path" -N ""
    
    if [[ $? -eq 0 ]]; then
        echo -e "${GREEN}✅ SSH key generated successfully${NC}"
        
        # Start ssh-agent and add key
        eval "$(ssh-agent -s)"
        ssh-add "$ssh_key_path"
        
        # Add SSH key to GitHub
        echo -e "${BLUE}🔐 Adding SSH key to GitHub...${NC}"
        gh ssh-key add "${ssh_key_path}.pub" --title "Gallery Bootstrap Key $(date +%Y-%m-%d)"
        
        if [[ $? -eq 0 ]]; then
            echo -e "${GREEN}✅ SSH key added to GitHub successfully${NC}"
        else
            echo -e "${RED}❌ Failed to add SSH key to GitHub${NC}"
            return 1
        fi
    else
        echo -e "${RED}❌ Failed to generate SSH key${NC}"
        return 1
    fi
}

# Function to create GitHub Pages repository
create_github_pages_repo() {
    local username="$1"
    local repo_name="${username}.github.com"
    
    echo -e "${BLUE}📁 Creating GitHub Pages repository...${NC}"
    
    # Check if repository already exists
    if gh repo view "$username/$repo_name" >/dev/null 2>&1; then
        echo -e "${YELLOW}📍 Repository $username/$repo_name already exists${NC}"
        read -p "Continue with existing repository? (Y/n): " use_existing_repo
        if [[ $use_existing_repo =~ ^[Nn]$ ]]; then
            echo -e "${RED}❌ Bootstrap cancelled${NC}"
            exit 1
        fi
        return 0
    fi
    
    # Create repository
    gh repo create "$repo_name" \
        --public \
        --description "Personal photo gallery powered by GitHub Pages" \
        --homepage "https://${username}.github.io" \
        --enable-issues=false \
        --enable-wiki=false
    
    if [[ $? -eq 0 ]]; then
        echo -e "${GREEN}✅ Repository created successfully${NC}"
        echo -e "${CYAN}🌐 Repository URL: https://github.com/$username/$repo_name${NC}"
        echo -e "${CYAN}🌐 GitHub Pages URL: https://${username}.github.io${NC}"
        
        # Enable GitHub Pages
        echo -e "${BLUE}📄 Enabling GitHub Pages...${NC}"
        gh api repos/$username/$repo_name/pages \
            --method POST \
            --field source.branch=master \
            --field source.path=/ >/dev/null 2>&1
        
        if [[ $? -eq 0 ]]; then
            echo -e "${GREEN}✅ GitHub Pages enabled${NC}"
        else
            echo -e "${YELLOW}⚠️  GitHub Pages will be enabled automatically after first push${NC}"
        fi
        
        return 0
    else
        echo -e "${RED}❌ Failed to create repository${NC}"
        return 1
    fi
}

# Function to setup git repository
setup_git_repo() {
    local username="$1"
    local repo_url="git@github.com:${username}/${username}.github.com.git"
    
    echo -e "${BLUE}📝 Setting up local git repository...${NC}"
    
    # Initialize git if not already initialized
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        git init
        echo -e "${GREEN}✅ Git repository initialized${NC}"
    fi
    
    # Set remote origin
    if git remote get-url origin >/dev/null 2>&1; then
        git remote set-url origin "$repo_url"
        echo -e "${GREEN}✅ Remote origin updated${NC}"
    else
        git remote add origin "$repo_url"
        echo -e "${GREEN}✅ Remote origin added${NC}"
    fi
    
    # Set main branch name
    git branch -M master
    
    # Check if we have files to commit
    if [[ -n "$(git status --porcelain)" ]]; then
        echo -e "${BLUE}📦 Committing gallery files...${NC}"
        git add .
        git commit -m "Initial commit: Bootstrap photo gallery

- Setup complete photo gallery application
- Configured for GitHub Pages deployment
- Ready for image uploads and customization

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"
        
        if [[ $? -eq 0 ]]; then
            echo -e "${GREEN}✅ Files committed successfully${NC}"
        else
            echo -e "${RED}❌ Failed to commit files${NC}"
            return 1
        fi
    fi
    
    # Push to GitHub
    echo -e "${BLUE}🚀 Pushing to GitHub...${NC}"
    git push -u origin master
    
    if [[ $? -eq 0 ]]; then
        echo -e "${GREEN}✅ Successfully pushed to GitHub${NC}"
        return 0
    else
        echo -e "${RED}❌ Failed to push to GitHub${NC}"
        return 1
    fi
}

# Main execution starts here
echo -e "${CYAN}This script will help you:${NC}"
echo "  1. Install GitHub CLI (if needed)"
echo "  2. Authenticate with GitHub"
echo "  3. Setup SSH keys for secure access"
echo "  4. Create your GitHub Pages repository"
echo "  5. Deploy your photo gallery"
echo

# Check if GitHub CLI is installed
if ! command_exists gh; then
    echo -e "${YELLOW}📦 GitHub CLI not found${NC}"
    read -p "Install GitHub CLI automatically? (Y/n): " install_gh
    
    if [[ ! $install_gh =~ ^[Nn]$ ]]; then
        if ! install_gh_cli; then
            exit 1
        fi
    else
        echo -e "${RED}❌ GitHub CLI is required for this script${NC}"
        echo -e "${YELLOW}💡 Please install it manually: https://github.com/cli/cli#installation${NC}"
        exit 1
    fi
fi

echo -e "${GREEN}✅ GitHub CLI is available${NC}"

# Check if user is authenticated
if ! gh auth status >/dev/null 2>&1; then
    echo -e "${BLUE}🔐 Not authenticated with GitHub${NC}"
    echo
    echo -e "${CYAN}📋 You have two options:${NC}"
    echo "  1. Create a new GitHub account"
    echo "  2. Login with existing account"
    echo
    
    read -p "Do you have a GitHub account? (y/N): " has_account
    
    if [[ $has_account =~ ^[Yy]$ ]]; then
        echo -e "${BLUE}🔑 Please authenticate with your existing account${NC}"
        gh auth login
    else
        echo -e "${CYAN}🌟 Creating a new GitHub account${NC}"
        echo
        echo -e "${YELLOW}📝 Please visit: https://github.com/join${NC}"
        echo "   1. Choose a username (this will be part of your gallery URL)"
        echo "   2. Use a valid email address"
        echo "   3. Create a secure password"
        echo "   4. Verify your email address"
        echo
        echo -e "${BLUE}💡 Tip: Your gallery will be available at: https://USERNAME.github.io${NC}"
        echo
        
        read -p "Press Enter after creating your GitHub account..."
        
        echo -e "${BLUE}🔑 Now let's authenticate with your new account${NC}"
        gh auth login
    fi
    
    if [[ $? -ne 0 ]]; then
        echo -e "${RED}❌ Authentication failed${NC}"
        exit 1
    fi
fi

echo -e "${GREEN}✅ Authenticated with GitHub${NC}"

# Get GitHub username
username=$(gh api user --jq '.login')
echo -e "${CYAN}👤 GitHub username: $username${NC}"

# Get user email for SSH key
email=$(gh api user --jq '.email // empty')
if [[ -z "$email" ]]; then
    read -p "Enter your email address for SSH key: " email
fi

# Setup SSH key
if ! setup_ssh_key "$email"; then
    echo -e "${RED}❌ SSH key setup failed${NC}"
    exit 1
fi

# Create GitHub Pages repository
if ! create_github_pages_repo "$username"; then
    echo -e "${RED}❌ Repository creation failed${NC}"
    exit 1
fi

# Setup local git repository and push
if ! setup_git_repo "$username"; then
    echo -e "${RED}❌ Git setup failed${NC}"
    exit 1
fi

# Final success message
echo
echo -e "${GREEN}🎉 Bootstrap completed successfully!${NC}"
echo
echo -e "${CYAN}📋 Summary:${NC}"
echo "   • GitHub username: $username"
echo "   • Repository: https://github.com/$username/$username.github.com"
echo "   • Gallery URL: https://$username.github.io"
echo "   • SSH key configured for secure access"
echo
echo -e "${YELLOW}⏰ Note: GitHub Pages may take a few minutes to deploy${NC}"
echo -e "${BLUE}💡 You can now use ./update.sh to push changes and ./reset.sh to start over${NC}"

# Offer to open the gallery
if command -v open >/dev/null 2>&1; then
    echo
    read -p "Open your gallery URL in browser? (Y/n): " open_gallery
    if [[ ! $open_gallery =~ ^[Nn]$ ]]; then
        open "https://$username.github.io"
    fi
fi