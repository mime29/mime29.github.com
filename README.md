# Curated Photo Gallery

A responsive photo gallery website built with lightGallery that supports local editing and GitHub Pages deployment.

## Features

- **Responsive Design**: Works on all devices
- **Local Editing**: Add/remove photos and edit titles when running locally
- **Read-only on GitHub Pages**: Admin controls are hidden in production
- **Export/Import**: Save and restore your gallery data
- **Clean Interface**: Modern, minimal design

## Local Development

1. Open `index.html` in a web browser
2. Use the admin controls to:
   - Change the page title
   - Add images (drag & drop or select files)
   - Edit image titles
   - Remove images
   - Export/import gallery data

## GitHub Pages Deployment

1. Create a new repository on GitHub
2. Upload all files to the repository
3. Go to Settings > Pages
4. Select "Deploy from a branch" and choose "main"
5. Your gallery will be available at `https://username.github.io/repository-name`

## File Structure

- `index.html` - Main HTML file
- `app.js` - JavaScript functionality
- `README.md` - This file

## Data Storage

- Local development uses `localStorage` to persist data
- For GitHub Pages, you'll need to commit your data as part of the repository
- Use export/import functionality to transfer data between environments