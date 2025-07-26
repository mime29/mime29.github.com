# 📸 Curated Photo Gallery

A beautiful, responsive photo gallery powered by [LightGallery](https://www.lightgalleryjs.com/) with local editing capabilities and seamless GitHub Pages deployment.

![Gallery Preview](https://img.shields.io/badge/Demo-Live%20Gallery-brightgreen?style=for-the-badge&logo=github)

## ✨ Features

- 🎨 **Beautiful Design**: Modern, responsive interface that works on all devices
- 🖼️ **LightGallery Integration**: Smooth lightbox experience with zoom and thumbnails
- ✏️ **Local Editing**: Full admin controls when running locally
- 🚀 **GitHub Pages Ready**: Automatic deployment with read-only production mode
- 🎯 **Smart Centering**: Perfectly centered gallery layout on all screen sizes
- 📱 **Mobile Optimized**: Touch-friendly interface for mobile devices
- 💾 **Data Persistence**: Automatic saving with localStorage and JSON backup
- 🔄 **Drag & Drop**: Easy image uploading and reordering (local development)

## 🚀 Quick Start

### Option 1: Complete Setup (Recommended)
Perfect for new users or those without a GitHub account.

```bash
git clone https://github.com/mime29/mime29.github.com.git my-gallery
cd my-gallery
./bootstrap.sh
```

The bootstrap script will:
- Install GitHub CLI if needed
- Help create a GitHub account (if needed)
- Set up SSH keys automatically
- Create your `username.github.com` repository
- Deploy your gallery to GitHub Pages

### Option 2: Manual Setup
For users with existing GitHub accounts.

```bash
git clone https://github.com/mime29/mime29.github.com.git my-gallery
cd my-gallery
# Edit files as needed
./update.sh
```

## 📋 Management Scripts

This repository includes three powerful management scripts:

### 🌟 `./bootstrap.sh` - Complete Setup
**Use this for initial setup or new GitHub accounts**

```bash
./bootstrap.sh
```

**What it does:**
- ✅ Installs GitHub CLI (macOS/Linux)
- 👤 Guides through GitHub account creation
- 🔐 Sets up authentication and SSH keys
- 📁 Creates your GitHub Pages repository
- 🚀 Deploys your gallery automatically
- 🌐 Provides your live gallery URL

### 🔄 `./update.sh` - Deploy Changes
**Use this to push changes to your live gallery**

```bash
./update.sh
```

**What it does:**
- 📝 Detects and commits uncommitted changes
- 🎯 Prompts for your GitHub username
- 🔧 Updates repository URL if needed
- 🚀 Pushes changes to GitHub Pages
- 🌐 Provides deployment confirmation

### 🗑️ `./reset.sh` - Start Fresh
**Use this to completely reset your gallery**

```bash
./reset.sh
```

**What it does:**
- 📊 Shows current gallery state
- ⚠️ Two-stage confirmation for safety
- 🗂️ Removes all images from `images/` folder
- 📄 Resets `gallery-data.json` to default
- 🔄 Optional git commit of reset

## 🛠️ Local Development

### Running Locally

#### Option 1: Simple File Server
```bash
# Open directly in browser
open index.html
```

#### Option 2: Local Server (Recommended)
```bash
# Python 3
python3 server.py

# Or specify port
python3 server.py 8080
```

#### Option 3: Other Servers
```bash
# Node.js
npx serve .

# Python 2
python -m SimpleHTTPServer 8000
```

### Local Features
When running locally, you get full admin controls:

- 📝 **Edit gallery title** - Click the title to edit inline
- 🖼️ **Add images** - Drag & drop or use file picker
- ✏️ **Edit image titles** - Click any image title to edit
- 🗑️ **Remove images** - Click remove button on any image
- 🔄 **Reorder images** - Drag and drop to reorder
- 💾 **Export/Import** - Backup and restore your gallery data

### File Structure
```
my-gallery/
├── index.html          # Main gallery page
├── app.js             # Gallery functionality
├── server.py          # Local development server
├── gallery-data.json  # Gallery configuration
├── images/            # Your photo collection
├── bootstrap.sh       # Complete setup script
├── update.sh          # Deployment script
├── reset.sh           # Reset utility
└── README.md          # This documentation
```

## 🌐 GitHub Pages Deployment

Your gallery will be automatically available at:
```
https://YOUR-USERNAME.github.io
```

### Production Features
- 🔒 **Read-only mode** - Admin controls hidden for security
- ⚡ **Fast loading** - Optimized for GitHub Pages CDN
- 📱 **Mobile responsive** - Perfect on all devices
- 🎨 **Clean interface** - No clutter, just your photos

## 📊 Data Management

### Gallery Configuration (`gallery-data.json`)
```json
{
  "title": "Your Gallery Title",
  "created": "2025-01-26T12:00:00.000Z",
  "images": [
    {
      "id": 1640995200000,
      "filename": "image_1640995200000_photo.jpg",
      "title": "Beautiful Sunset",
      "originalFilename": "photo.jpg"
    }
  ]
}
```

### Image Storage
- **Local**: Images stored in `images/` folder
- **Naming**: Auto-generated as `image_{timestamp}_{original_name}`
- **Formats**: Supports JPG, PNG, GIF, WebP
- **Compression**: Automatic compression to 500KB for web optimization

## 🎨 Customization

### Styling
Edit the CSS in `index.html` to customize:
- Colors and fonts
- Layout and spacing
- Animations and effects
- Responsive breakpoints

### Functionality
Modify `app.js` to add:
- New image effects
- Custom sorting options
- Additional metadata fields
- Integration with other services

## 🔧 Advanced Usage

### Multiple Galleries
Create separate repositories for different galleries:
```bash
# Photography portfolio
git clone https://github.com/mime29/mime29.github.com.git photography
cd photography
# Customize and deploy

# Travel photos
git clone https://github.com/mime29/mime29.github.com.git travel
cd travel
# Customize and deploy
```

### Custom Domain
To use a custom domain with GitHub Pages:

1. Add a `CNAME` file to your repository:
```bash
echo "gallery.yourdomain.com" > CNAME
git add CNAME
git commit -m "Add custom domain"
git push
```

2. Configure DNS with your domain provider
3. Enable HTTPS in GitHub Pages settings

### Backup Strategy
```bash
# Export your gallery data
./update.sh

# Create backup
git tag backup-$(date +%Y%m%d)
git push --tags

# Restore from backup
git checkout tags/backup-20250126
```

## 🆘 Troubleshooting

### Common Issues

**Q: Gallery is blank on GitHub Pages**
```bash
# Check if files are committed
git status
./update.sh
```

**Q: Images not loading locally**
```bash
# Use the Python server instead of file://
python3 server.py
```

**Q: Can't push to GitHub**
```bash
# Check authentication
gh auth status
gh auth login
```

**Q: SSH key issues**
```bash
# Regenerate SSH key
ssh-keygen -t ed25519 -C "your-email@example.com"
gh ssh-key add ~/.ssh/id_ed25519.pub
```

### Getting Help

1. 📖 Check this README thoroughly
2. 🐛 [Open an issue](https://github.com/mime29/mime29.github.com/issues) with details
3. 💬 Include error messages and steps to reproduce
4. 📋 Mention your operating system and browser

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- [LightGallery](https://www.lightgalleryjs.com/) for the beautiful lightbox
- [GitHub Pages](https://pages.github.com/) for free hosting
- [GitHub CLI](https://cli.github.com/) for automation tools

---

**🌟 Star this repository if you find it useful!**

**🚀 Ready to create your gallery?** Run `./bootstrap.sh` to get started in minutes!