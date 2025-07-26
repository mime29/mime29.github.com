#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${RED}🗑️  Gallery Reset Tool${NC}"
echo "============================"
echo

# Function to show what will be deleted
show_current_state() {
    echo -e "${CYAN}📊 Current gallery state:${NC}"
    
    # Check gallery-data.json
    if [[ -f "gallery-data.json" ]]; then
        echo -e "${BLUE}📄 gallery-data.json:${NC}"
        if command -v jq >/dev/null 2>&1; then
            # Use jq for pretty formatting if available
            echo "   Title: $(jq -r '.title // "N/A"' gallery-data.json)"
            echo "   Images: $(jq -r '.images | length' gallery-data.json) items"
        else
            # Basic info without jq
            echo "   File exists ($(wc -c < gallery-data.json) bytes)"
        fi
    else
        echo -e "${YELLOW}📄 gallery-data.json: Not found${NC}"
    fi
    
    # Check images folder
    if [[ -d "images" ]]; then
        image_count=$(find images -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" -o -iname "*.gif" -o -iname "*.webp" \) 2>/dev/null | wc -l)
        folder_size=$(du -sh images 2>/dev/null | cut -f1)
        echo -e "${BLUE}📁 images/ folder:${NC}"
        echo "   Images: $image_count files"
        echo "   Size: $folder_size"
        
        if [[ $image_count -gt 0 ]] && [[ $image_count -le 10 ]]; then
            echo "   Files:"
            find images -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" -o -iname "*.gif" -o -iname "*.webp" \) 2>/dev/null | sort | sed 's/^/     /'
        elif [[ $image_count -gt 10 ]]; then
            echo "   Files: (showing first 10)"
            find images -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" -o -iname "*.gif" -o -iname "*.webp" \) 2>/dev/null | sort | head -10 | sed 's/^/     /'
            echo "     ... and $((image_count - 10)) more"
        fi
    else
        echo -e "${YELLOW}📁 images/ folder: Not found${NC}"
    fi
    
    # Check localStorage (if we can detect browser data)
    echo -e "${BLUE}💾 Browser localStorage:${NC}"
    echo "   Will be cleared when accessing the gallery next time"
    
    echo
}

# Function to create default gallery-data.json
create_default_json() {
    cat > gallery-data.json << 'EOF'
{
  "title": "Curated Photo Gallery",
  "created": "CREATED_TIMESTAMP",
  "images": []
}
EOF
    
    # Replace timestamp
    if command -v date >/dev/null 2>&1; then
        timestamp=$(date -u +"%Y-%m-%dT%H:%M:%S.%3NZ" 2>/dev/null || date -u +"%Y-%m-%dT%H:%M:%SZ")
        sed -i.bak "s/CREATED_TIMESTAMP/$timestamp/" gallery-data.json && rm gallery-data.json.bak
    fi
}

# Show current state
show_current_state

# First confirmation
echo -e "${YELLOW}⚠️  WARNING: This will permanently delete:${NC}"
echo "   • All images in the images/ folder"
echo "   • All data in gallery-data.json"
echo "   • Reset the gallery to default state"
echo
echo -e "${RED}❗ This action cannot be undone!${NC}"
echo

read -p "Are you sure you want to reset the gallery? (type 'yes' to confirm): " first_confirm

if [[ "$first_confirm" != "yes" ]]; then
    echo -e "${GREEN}✅ Reset cancelled. No changes made.${NC}"
    exit 0
fi

# Second confirmation for extra safety
echo
echo -e "${RED}🔥 FINAL WARNING${NC}"
echo "You are about to permanently delete all gallery content!"
echo

read -p "Type 'RESET' in uppercase to proceed: " final_confirm

if [[ "$final_confirm" != "RESET" ]]; then
    echo -e "${GREEN}✅ Reset cancelled. No changes made.${NC}"
    exit 0
fi

echo
echo -e "${BLUE}🧹 Starting gallery reset...${NC}"

# Remove images folder
if [[ -d "images" ]]; then
    echo -e "${YELLOW}🗂️  Removing images folder...${NC}"
    rm -rf images
    if [[ $? -eq 0 ]]; then
        echo -e "${GREEN}✅ Images folder removed${NC}"
    else
        echo -e "${RED}❌ Failed to remove images folder${NC}"
        exit 1
    fi
else
    echo -e "${YELLOW}📁 Images folder not found, skipping...${NC}"
fi

# Reset gallery-data.json
echo -e "${YELLOW}📄 Resetting gallery-data.json...${NC}"
if create_default_json; then
    echo -e "${GREEN}✅ gallery-data.json reset to default${NC}"
else
    echo -e "${RED}❌ Failed to reset gallery-data.json${NC}"
    exit 1
fi

# Create empty images folder
echo -e "${YELLOW}📁 Creating empty images folder...${NC}"
mkdir -p images
if [[ $? -eq 0 ]]; then
    echo -e "${GREEN}✅ Empty images folder created${NC}"
else
    echo -e "${RED}❌ Failed to create images folder${NC}"
    exit 1
fi

# Offer to commit changes if in git repository
if git rev-parse --git-dir > /dev/null 2>&1; then
    echo
    read -p "Commit the reset to git? (y/N): " commit_reset
    
    if [[ $commit_reset =~ ^[Yy]$ ]]; then
        echo -e "${BLUE}📝 Committing reset...${NC}"
        git add .
        git commit -m "Reset gallery to default state

- Clear all images from images/ folder  
- Reset gallery-data.json to default
- Start with empty gallery

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"
        
        if [[ $? -eq 0 ]]; then
            echo -e "${GREEN}✅ Reset committed to git${NC}"
        else
            echo -e "${RED}❌ Failed to commit reset${NC}"
        fi
    fi
fi

echo
echo -e "${GREEN}🎉 Gallery reset completed successfully!${NC}"
echo
echo -e "${CYAN}📋 Summary:${NC}"
echo "   • Images folder: Cleared and recreated"
echo "   • gallery-data.json: Reset to default"
echo "   • Gallery title: 'Curated Photo Gallery'"
echo "   • Image count: 0"
echo
echo -e "${BLUE}💡 You can now add new images to start fresh!${NC}"