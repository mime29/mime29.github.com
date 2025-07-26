// Photo gallery data
let galleryData = {
    title: 'Curated Photo Gallery',
    images: []
};

// Check if running locally or on GitHub Pages
const isLocal = location.hostname === 'localhost' || location.hostname === '127.0.0.1' || location.hostname === '';

// Check if local server with file API is available
let hasServerAPI = false;
async function checkServerAPI() {
    try {
        console.log('🔍 Checking server API...');
        const response = await fetch('/api/server-status');
        hasServerAPI = response.ok;
        console.log(`🔌 Server API available: ${hasServerAPI}`);
        if (hasServerAPI) {
            await loadLocalImages();
        }
    } catch (error) {
        console.log('❌ Server API check failed:', error.message);
        hasServerAPI = false;
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', async function() {
    // Setup basic functionality first
    if (isLocal) {
        setupDragAndDrop();
    } else {
        // Hide admin panel and clear title on GitHub Pages
        document.getElementById('admin-panel').classList.add('hidden');
        document.getElementById('page-title-display').textContent = '';
    }
    
    // Check server API availability first
    if (isLocal) {
        await checkServerAPI();
    } else {
        // On GitHub Pages, load static gallery data
        await loadStaticGalleryData();
    }
    
    // If no server API or no data loaded, fall back to localStorage
    if (!hasServerAPI || galleryData.images.length === 0) {
        loadData();
    }
    
    // Ensure title editing is set up regardless of data source
    setupInlineTitleEditing();
    
    initializeGallery();
});

// Load data from localStorage or default
function loadData() {
    const saved = localStorage.getItem('curatedGallery');
    if (saved) {
        galleryData = JSON.parse(saved);
    }
    
    // Update page title
    document.getElementById('page-title').textContent = galleryData.title;
    document.getElementById('page-title-display').textContent = galleryData.title;
    
    // Setup inline title editing
    setupInlineTitleEditing();
}

// Save data to localStorage
function saveData() {
    localStorage.setItem('curatedGallery', JSON.stringify(galleryData));
}

// Save data with error handling
function saveDataWithErrorHandling() {
    try {
        localStorage.setItem('curatedGallery', JSON.stringify(galleryData));
    } catch (error) {
        console.error('Error saving data:', error);
    }
}


// Setup inline title editing
let titleEditingSetup = false;
function setupInlineTitleEditing() {
    if (titleEditingSetup) return; // Avoid duplicate setup
    
    const titleElement = document.getElementById('page-title-display');
    
    // Only enable editing if running locally
    if (isLocal) {
        titleElement.contentEditable = true;
        titleElement.addEventListener('blur', async function() {
            const newTitle = this.textContent.trim();
            if (newTitle && newTitle !== galleryData.title) {
                console.log(`🏷️ Title changed from "${galleryData.title}" to "${newTitle}"`);
                galleryData.title = newTitle;
                document.getElementById('page-title').textContent = newTitle;
                saveDataWithErrorHandling();
                await saveDataFile();
                console.log('✅ Title saved successfully');
            }
        });
        
        titleElement.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.blur();
            }
        });
        
        console.log('🎯 Title editing setup complete');
    } else {
        // Disable editing on GitHub Pages
        titleElement.contentEditable = false;
        titleElement.style.cursor = 'default';
        console.log('🔒 Title editing disabled (GitHub Pages)');
    }
    
    titleEditingSetup = true;
}

// Add images to gallery
function addImages() {
    const input = document.getElementById('image-input');
    const files = input.files;
    
    processFiles(files);
    input.value = ''; // Clear input
}

// Process files (used by both file input and drag & drop)
function processFiles(files) {
    Array.from(files).forEach(file => {
        if (file.type.startsWith('image/')) {
            compressAndAddImage(file);
        } else {
            alert(`File "${file.name}" is not a valid image format.`);
        }
    });
}

// Compress image and add to gallery
function compressAndAddImage(file) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = function() {
        compressImageToTarget(img, canvas, ctx, file);
    };
    
    img.src = URL.createObjectURL(file);
}

// Progressively compress image until under target size
async function compressImageToTarget(img, canvas, ctx, file) {
    const targetSizeBytes = 500 * 1024; // 500KB - much more reasonable for localStorage
    let maxDimension = Math.max(img.width, img.height);
    let quality = 0.9;
    let attempts = 0;
    const maxAttempts = 15;
    const statusElement = document.getElementById('compression-status');
    
    // Show compression status
    statusElement.textContent = `Compressing "${file.name}"...`;
    statusElement.classList.remove('hidden');
    
    async function tryCompress() {
        attempts++;
        
        // Update status
        statusElement.textContent = `Compressing "${file.name}" (attempt ${attempts}/${maxAttempts})...`;
        
        // Calculate dimensions
        let { width, height } = img;
        
        if (width > height) {
            if (width > maxDimension) {
                height = (height * maxDimension) / width;
                width = maxDimension;
            }
        } else {
            if (height > maxDimension) {
                width = (width * maxDimension) / height;
                height = maxDimension;
            }
        }
        
        // Set canvas size and draw image
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to data URL
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        
        // Calculate size (rough estimate: base64 is ~1.37x larger than binary)
        const sizeBytes = (dataUrl.length * 0.75);
        
        if (sizeBytes <= targetSizeBytes || attempts >= maxAttempts) {
            // Success or max attempts reached
            const finalSizeKB = (sizeBytes / 1024).toFixed(0);
            const originalSizeMB = (file.size / 1024 / 1024).toFixed(1);
            
            statusElement.textContent = `✓ Compressed "${file.name}" from ${originalSizeMB}MB to ${finalSizeKB}KB`;
            setTimeout(() => {
                statusElement.classList.add('hidden');
            }, 3000);
            
            const imageData = {
                id: Date.now() + Math.random(),
                src: dataUrl,
                title: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
                filename: file.name
            };
            
            galleryData.images.push(imageData);
            await saveImageFile(dataUrl, file.name, imageData.id);
            saveDataWithErrorHandling();
            await saveDataFile();
            renderGallery();
            return;
        }
        
        // Still too large, reduce quality or dimensions
        if (quality > 0.3) {
            quality -= 0.1; // Reduce quality
        } else {
            maxDimension = Math.floor(maxDimension * 0.8); // Reduce dimensions
            quality = 0.8; // Reset quality for new size
        }
        
        // Try again
        setTimeout(() => tryCompress(), 10); // Small delay to prevent blocking
    }
    
    tryCompress();
}

// Load images from local server
async function loadLocalImages() {
    if (!hasServerAPI) {
        console.log('⚠️ No server API available');
        return;
    }
    
    try {
        console.log('🔄 Loading data from server...');
        
        // Load gallery data
        const dataResponse = await fetch('/api/load-data');
        if (dataResponse.ok) {
            const serverData = await dataResponse.json();
            console.log('📄 Server data:', serverData);
            
            // Load images
            const imagesResponse = await fetch('/api/load-images');
            if (imagesResponse.ok) {
                const serverImages = await imagesResponse.json();
                console.log(`📷 Found ${serverImages.length} image files on server`);
                
                // Merge server data with loaded images
                // Create map with both string and number keys to handle ID type mismatches
                const imageMap = new Map();
                serverImages.forEach(img => {
                    imageMap.set(img.id, img);
                    imageMap.set(String(img.id), img);
                    imageMap.set(Number(img.id), img);
                });
                
                if (serverData.images && serverData.images.length > 0) {
                    console.log('🔗 Merging data file with image files...');
                    galleryData.title = serverData.title || galleryData.title;
                    galleryData.images = serverData.images.map(imgData => {
                        const serverImage = imageMap.get(imgData.id) || imageMap.get(String(imgData.id)) || imageMap.get(Number(imgData.id));
                        if (!serverImage) {
                            console.warn(`⚠️ Image file not found for ID: ${imgData.id} (type: ${typeof imgData.id})`);
                            console.log('Available image IDs:', serverImages.map(img => `${img.id} (${typeof img.id})`));
                        }
                        return {
                            id: imgData.id,
                            src: serverImage ? serverImage.src : `/images/${imgData.filename}`,
                            title: imgData.title,
                            filename: imgData.originalFilename || imgData.filename
                        };
                    }).filter(img => img.src && img.src !== '');
                } else {
                    console.log('📂 No data file found, loading all images from directory...');
                    // No data file, just load all images found in directory
                    galleryData.images = serverImages.map(img => ({
                        id: img.id,
                        src: img.src,
                        title: img.originalFilename.replace(/\.[^/.]+$/, ""),
                        filename: img.originalFilename
                    }));
                }
                
                // Update UI
                document.getElementById('page-title').textContent = galleryData.title;
                document.getElementById('page-title-display').textContent = galleryData.title;
                
                // Setup inline title editing
                setupInlineTitleEditing();
                
                saveDataWithErrorHandling();
                renderGallery();
                
                console.log(`✅ Loaded ${galleryData.images.length} images from local server`);
            } else {
                console.error('❌ Failed to load images from server');
            }
        } else {
            console.error('❌ Failed to load data from server');
        }
    } catch (error) {
        console.error('❌ Error loading local images:', error);
    }
}

// Load static gallery data from GitHub Pages
async function loadStaticGalleryData() {
    try {
        console.log('📄 Loading static gallery data from GitHub Pages...');
        
        const response = await fetch('./gallery-data.json');
        if (response.ok) {
            const staticData = await response.json();
            console.log('📄 Static data loaded:', staticData);
            
            if (staticData.title) {
                galleryData.title = staticData.title;
            }
            
            if (staticData.images && staticData.images.length > 0) {
                // For GitHub Pages, use direct image URLs instead of converting to data URLs
                galleryData.images = staticData.images.map(imgData => {
                    const imagePath = `./images/${imgData.filename}`;
                    return {
                        id: imgData.id,
                        src: imagePath,
                        title: imgData.title,
                        filename: imgData.originalFilename || imgData.filename
                    };
                });
            }
            
            // Update UI
            document.getElementById('page-title').textContent = galleryData.title;
            document.getElementById('page-title-display').textContent = galleryData.title;
            // Update browser tab title
            document.title = galleryData.title;
            
            // Render the gallery
            renderGallery();
            
            console.log(`✅ Loaded ${galleryData.images.length} images from static files`);
        } else {
            console.log('📂 No gallery-data.json found, using default data');
        }
    } catch (error) {
        console.log('❌ Error loading static gallery data:', error);
    }
}


// Remove image from gallery
async function removeImage(imageId) {
    console.log('🗑️ removeImage called with imageId:', imageId);
    console.log('📊 Current images count:', galleryData.images.length);
    
    if (confirm('Are you sure you want to remove this image?')) {
        console.log('✅ User confirmed removal');
        const initialCount = galleryData.images.length;
        
        // Find the image to get its filename
        const imageToRemove = galleryData.images.find(img => img.id === imageId);
        if (imageToRemove) {
            console.log('🗑️ Removing image:', imageToRemove.filename);
            
            // Delete the actual image file from server
            if (hasServerAPI) {
                try {
                    // Construct the server filename format: image_{id}_{originalfilename}
                    const serverFilename = `image_${imageToRemove.id}_${imageToRemove.filename}`;
                    console.log('🗑️ Server filename to delete:', serverFilename);
                    
                    const deleteResponse = await fetch(`/api/delete-image/${encodeURIComponent(serverFilename)}`, {
                        method: 'DELETE'
                    });
                    if (deleteResponse.ok) {
                        console.log('🗑️ Image file deleted from server successfully');
                    } else {
                        console.error('❌ Failed to delete image file from server:', await deleteResponse.text());
                    }
                } catch (error) {
                    console.error('❌ Error deleting image file from server:', error);
                }
            }
        }
        
        galleryData.images = galleryData.images.filter(img => img.id !== imageId);
        console.log('📊 Images after filter:', galleryData.images.length, 'removed:', initialCount - galleryData.images.length);
        
        saveData();
        console.log('💾 saveData() completed');
        
        try {
            await saveDataFile();
            console.log('📄 saveDataFile() completed successfully');
        } catch (error) {
            console.error('❌ saveDataFile() failed:', error);
        }
        
        renderGallery();
        console.log('🎨 renderGallery() completed');
    } else {
        console.log('❌ User cancelled removal');
    }
}

// Setup inline image title editing
function setupImageTitleEditing(titleElement, imageId) {
    // Only enable editing if running locally
    if (isLocal) {
        titleElement.addEventListener('blur', async function() {
            const newTitle = this.textContent.trim();
            const image = galleryData.images.find(img => img.id === imageId);
            if (image && newTitle && newTitle !== image.title) {
                console.log(`🖼️ Image title changed from "${image.title}" to "${newTitle}"`);
                image.title = newTitle;
                saveDataWithErrorHandling();
                await saveDataFile();
            }
        });
        
        titleElement.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.blur();
            }
            // Prevent event bubbling to avoid interfering with drag & drop
            e.stopPropagation();
        });
        
        titleElement.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    } else {
        // Disable editing on GitHub Pages
        titleElement.contentEditable = false;
        titleElement.style.cursor = 'default';
        titleElement.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }
}

// Render gallery
function renderGallery() {
    const gallery = document.getElementById('lightgallery');
    gallery.innerHTML = '';
    
    galleryData.images.forEach((image, index) => {
        const item = document.createElement('li');
        item.draggable = true;
        item.dataset.imageId = image.id;
        item.dataset.index = index;
        
        // Calculate file size for display
        const sizeKB = Math.round((image.src.length * 0.75) / 1024);
        
        const adminControls = isLocal ? `
            <div class="image-controls">
                <button onclick="removeImage('${image.id}')">Remove</button>
            </div>
        ` : '';
        
        // Only show size if it's greater than 0
        const sizeDisplay = sizeKB > 0 ? `<div class="image-size">${sizeKB}KB</div>` : '';
        
        const imageSrc = image.src || '';
        
        // Skip images with no src
        if (!imageSrc) {
            return;
        }
        
        // Set data-src for lightGallery
        item.setAttribute('data-src', imageSrc);
        item.setAttribute('data-lg-size', '1600-1067');
        
        item.innerHTML = `
            <img src="${imageSrc}" alt="${image.title}">
            ${adminControls}
            <div class="image-info">
                <div class="image-title" contenteditable="${isLocal}">${image.title}</div>
                ${sizeDisplay}
            </div>
        `;
        
        // Setup inline editing for this image title
        const titleElement = item.querySelector('.image-title');
        setupImageTitleEditing(titleElement, image.id);
        
        // Setup drag and drop (only locally)
        if (isLocal) {
            setupImageDragAndDrop(item);
        } else {
            // Disable dragging on GitHub Pages
            item.draggable = false;
        }
        
        gallery.appendChild(item);
    });
    
    // Reinitialize lightGallery
    initializeGallery();
}

// Setup drag and drop for image reordering
function setupImageDragAndDrop(item) {
    item.addEventListener('dragstart', function(e) {
        // Only start drag if not editing title
        if (e.target.classList.contains('image-title') && e.target.isContentEditable) {
            e.preventDefault();
            return;
        }
        
        this.classList.add('dragging');
        e.dataTransfer.setData('text/plain', this.dataset.imageId);
        e.dataTransfer.effectAllowed = 'move';
    });
    
    item.addEventListener('dragend', function(e) {
        this.classList.remove('dragging');
        // Remove all drag-over classes
        document.querySelectorAll('#lightgallery li').forEach(el => {
            el.classList.remove('drag-over');
        });
    });
    
    item.addEventListener('dragover', function(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        
        if (!this.classList.contains('dragging')) {
            this.classList.add('drag-over');
        }
    });
    
    item.addEventListener('dragleave', function(e) {
        // Only remove drag-over if we're actually leaving this element
        if (!this.contains(e.relatedTarget)) {
            this.classList.remove('drag-over');
        }
    });
    
    item.addEventListener('drop', function(e) {
        e.preventDefault();
        this.classList.remove('drag-over');
        
        const draggedId = e.dataTransfer.getData('text/plain');
        const targetId = this.dataset.imageId;
        
        if (draggedId !== targetId) {
            reorderImages(draggedId, targetId);
        }
    });
}

// Reorder images in the gallery
async function reorderImages(draggedId, targetId) {
    console.log('🔄 reorderImages called:', { draggedId, targetId, types: { draggedId: typeof draggedId, targetId: typeof targetId } });
    console.log('📊 Current gallery IDs:', galleryData.images.map(img => ({ id: img.id, type: typeof img.id, title: img.title })));
    
    // Convert IDs to numbers for comparison since data might be strings
    const numDraggedId = Number(draggedId);
    const numTargetId = Number(targetId);
    
    const draggedIndex = galleryData.images.findIndex(img => Number(img.id) === numDraggedId);
    const targetIndex = galleryData.images.findIndex(img => Number(img.id) === numTargetId);
    
    console.log('🔍 Found indices:', { draggedIndex, targetIndex });
    
    if (draggedIndex === -1 || targetIndex === -1) {
        console.error('❌ Could not find image indices for reordering');
        return;
    }
    
    if (draggedIndex === targetIndex) {
        console.log('ℹ️ Same position, no reordering needed');
        return;
    }
    
    // Remove dragged image and insert at target position
    const draggedImage = galleryData.images.splice(draggedIndex, 1)[0];
    galleryData.images.splice(targetIndex, 0, draggedImage);
    
    console.log(`📷 Moved image "${draggedImage.title}" from position ${draggedIndex + 1} to position ${targetIndex + 1}`);
    
    // Save and re-render
    saveDataWithErrorHandling();
    await saveDataFile();
    renderGallery();
}

// Initialize lightGallery
let lgInstance = null;
function initializeGallery() {
    const gallery = document.getElementById('lightgallery');
    
    // Destroy existing instance if it exists
    if (lgInstance) {
        lgInstance.destroy();
    }
    
    // Initialize new instance
    lgInstance = window.lightGallery(gallery, {
        plugins: [window.lgZoom, window.lgThumbnail],
        speed: 500,
        thumbnail: true,
        animateThumb: false,
        zoomFromOrigin: false,
        allowMediaOverlap: true,
        toggleThumb: true
    });
}

// Export gallery data
function exportData() {
    const dataStr = JSON.stringify(galleryData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'gallery-data.json';
    link.click();
    
    URL.revokeObjectURL(url);
}

// Save or download individual image file
async function saveImageFile(dataUrl, originalFilename, imageId) {
    const filename = `image_${imageId}_${originalFilename}`;
    
    if (hasServerAPI) {
        try {
            const response = await fetch('/api/save-image', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    filename: filename,
                    data: dataUrl
                })
            });
            
            if (response.ok) {
                console.log(`✅ Image saved: ${filename}`);
                return true;
            } else {
                console.error('❌ Failed to save image to server');
                return false;
            }
        } catch (error) {
            console.error('❌ Error saving image:', error);
            return false;
        }
    } else {
        // Fallback to download
        downloadImageFile(dataUrl, originalFilename, imageId);
        return true;
    }
}

// Download individual image file (fallback method)
function downloadImageFile(dataUrl, originalFilename, imageId) {
    const link = document.createElement('a');
    const filename = `image_${imageId}_${originalFilename}`;
    
    link.href = dataUrl;
    link.download = filename;
    link.click();
}

// Save or download data file with image titles and metadata
async function saveDataFile() {
    const dataToSave = {
        title: galleryData.title,
        created: new Date().toISOString(),
        images: galleryData.images.map(img => ({
            id: img.id,
            filename: `image_${img.id}_${img.filename}`,
            title: img.title,
            originalFilename: img.filename
        }))
    };
    
    if (hasServerAPI) {
        try {
            const response = await fetch('/api/save-data', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dataToSave)
            });
            
            if (response.ok) {
                console.log('✅ Gallery data saved to gallery-data.json');
                return true;
            } else {
                console.error('❌ Failed to save data to server');
                return false;
            }
        } catch (error) {
            console.error('❌ Error saving data:', error);
            return false;
        }
    } else {
        // Fallback to download
        downloadDataFile(dataToSave);
        return true;
    }
}

// Download data file (fallback method)
function downloadDataFile(dataToSave = null) {
    if (!dataToSave) {
        dataToSave = {
            title: galleryData.title,
            created: new Date().toISOString(),
            images: galleryData.images.map(img => ({
                id: img.id,
                filename: `image_${img.id}_${img.filename}`,
                title: img.title,
                originalFilename: img.filename
            }))
        };
    }
    
    const dataStr = JSON.stringify(dataToSave, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'gallery-data.json';
    link.click();
    
    URL.revokeObjectURL(url);
}

// Download all images and data file
async function downloadAllFiles() {
    if (galleryData.images.length === 0) {
        alert('No images to download!');
        return;
    }
    
    if (hasServerAPI) {
        // Save data file
        await saveDataFile();
        
        // Save all images
        for (const image of galleryData.images) {
            await saveImageFile(image.src, image.filename, image.id);
        }
        
        alert(`✅ Saved ${galleryData.images.length} images and data file to local folder!`);
    } else {
        // Fallback to download mode
        downloadDataFile();
        
        galleryData.images.forEach((image, index) => {
            setTimeout(() => {
                downloadImageFile(image.src, image.filename, image.id);
            }, index * 500); // 500ms delay between downloads
        });
        
        alert(`Started download of ${galleryData.images.length} images and data file. Check your Downloads folder.`);
    }
}

// Setup drag and drop functionality
function setupDragAndDrop() {
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('image-input');
    
    // Handle drop zone click to trigger file input
    dropZone.addEventListener('click', () => {
        fileInput.click();
    });
    
    // Prevent default drag behaviors
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false);
    });
    
    // Highlight drop zone when item is dragged over it
    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, highlight, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, unhighlight, false);
    });
    
    // Handle dropped files
    dropZone.addEventListener('drop', handleDrop, false);
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    function highlight(e) {
        dropZone.classList.add('drag-over');
    }
    
    function unhighlight(e) {
        dropZone.classList.remove('drag-over');
    }
    
    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        
        processFiles(files);
    }
}