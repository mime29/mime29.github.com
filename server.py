#!/usr/bin/env python3
"""
Local development server for Curated Photo Gallery
Provides file system access for saving images and data files
"""

import http.server
import socketserver
import json
import base64
import os
import urllib.parse
from pathlib import Path

class GalleryHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
    
    def end_headers(self):
        # Add CORS headers to allow frontend access
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()
    
    def do_OPTIONS(self):
        # Handle preflight requests
        self.send_response(200)
        self.end_headers()
    
    def do_GET(self):
        if self.path == '/api/server-status':
            self.handle_server_status()
        elif self.path == '/api/load-images':
            self.handle_load_images()
        elif self.path == '/api/load-data':
            self.handle_load_data()
        else:
            super().do_GET()
    
    def do_POST(self):
        if self.path == '/api/save-image':
            self.handle_save_image()
        elif self.path == '/api/save-data':
            self.handle_save_data()
        else:
            super().do_POST()
    
    def handle_server_status(self):
        """Endpoint to check if server API is available"""
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        response = {'status': 'ok', 'api': 'available'}
        self.wfile.write(json.dumps(response).encode())
    
    def handle_save_image(self):
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
            
            filename = data['filename']
            image_data = data['data']  # base64 data URL
            
            # Remove data URL prefix (data:image/jpeg;base64,)
            if ',' in image_data:
                image_data = image_data.split(',')[1]
            
            # Create images directory if it doesn't exist
            images_dir = Path('images')
            images_dir.mkdir(exist_ok=True)
            
            # Save image file
            image_path = images_dir / filename
            with open(image_path, 'wb') as f:
                f.write(base64.b64decode(image_data))
            
            # Send success response
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            response = {'success': True, 'message': f'Image saved as {filename}'}
            self.wfile.write(json.dumps(response).encode())
            
        except Exception as e:
            self.send_error(500, f'Error saving image: {str(e)}')
    
    def handle_save_data(self):
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
            
            # Save gallery data file
            with open('gallery-data.json', 'w') as f:
                json.dump(data, f, indent=2)
            
            # Send success response
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            response = {'success': True, 'message': 'Gallery data saved'}
            self.wfile.write(json.dumps(response).encode())
            
        except Exception as e:
            self.send_error(500, f'Error saving data: {str(e)}')
    
    def do_DELETE(self):
        if self.path.startswith('/api/delete-image/'):
            self.handle_delete_image()
        else:
            super().do_DELETE()
    
    def handle_delete_image(self):
        try:
            # Extract filename from path
            filename = self.path.split('/api/delete-image/')[-1]
            filename = urllib.parse.unquote(filename)
            
            image_path = Path('images') / filename
            if image_path.exists():
                os.remove(image_path)
                
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            response = {'success': True, 'message': f'Image {filename} deleted'}
            self.wfile.write(json.dumps(response).encode())
            
        except Exception as e:
            self.send_error(500, f'Error deleting image: {str(e)}')
    
    def handle_load_images(self):
        """Load all images from the images directory"""
        try:
            images_dir = Path('images')
            if not images_dir.exists():
                images_dir.mkdir(exist_ok=True)
            
            images = []
            for image_file in images_dir.glob('image_*'):
                if image_file.is_file() and image_file.suffix.lower() in ['.jpg', '.jpeg', '.png', '.gif', '.webp']:
                    # Read image as base64
                    with open(image_file, 'rb') as f:
                        image_data = base64.b64encode(f.read()).decode('utf-8')
                        data_url = f"data:image/jpeg;base64,{image_data}"
                    
                    # Extract ID and original filename from filename
                    filename = image_file.name
                    parts = filename.split('_', 2)
                    if len(parts) >= 3:
                        image_id = parts[1]
                        original_filename = '_'.join(parts[2:])
                    else:
                        image_id = str(hash(filename))
                        original_filename = filename
                    
                    images.append({
                        'id': image_id,
                        'filename': filename,
                        'originalFilename': original_filename,
                        'src': data_url,
                        'size': image_file.stat().st_size
                    })
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(images).encode())
            
        except Exception as e:
            self.send_error(500, f'Error loading images: {str(e)}')
    
    def handle_load_data(self):
        """Load gallery data from gallery-data.json"""
        try:
            data_file = Path('gallery-data.json')
            if data_file.exists():
                with open(data_file, 'r') as f:
                    data = json.load(f)
                
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps(data).encode())
            else:
                # Return empty data structure
                empty_data = {
                    'title': 'Curated Photo Gallery',
                    'images': []
                }
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps(empty_data).encode())
                
        except Exception as e:
            self.send_error(500, f'Error loading data: {str(e)}')

def run_server(port=8000):
    """Start the local development server"""
    handler = GalleryHandler
    
    with socketserver.TCPServer(("", port), handler) as httpd:
        print(f"🎨 Curated Gallery Server")
        print(f"📁 Serving files from: {os.getcwd()}")
        print(f"🌐 Server running at: http://localhost:{port}")
        print(f"📷 Images will be saved to: {os.getcwd()}/images/")
        print(f"💾 Data file: {os.getcwd()}/gallery-data.json")
        print(f"\n🚀 Open http://localhost:{port} in your browser")
        print(f"⏹️  Press Ctrl+C to stop the server\n")
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n🛑 Server stopped")

if __name__ == "__main__":
    import sys
    port = 8000
    
    if len(sys.argv) > 1:
        try:
            port = int(sys.argv[1])
        except ValueError:
            print(f"Invalid port number: {sys.argv[1]}")
            sys.exit(1)
    
    run_server(port)