import http.server
import socketserver
import webbrowser
import threading
import sys

PORT = 8000

class StandardHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    pass

def open_browser():
    """Opens the default web browser at the local server address."""
    url = f"http://localhost:{PORT}"
    print(f"Opening browser at {url} ...")
    webbrowser.open(url)

if __name__ == '__main__':
    print("Regenerating manifest and metadata files...")
    import subprocess
    import os
    
    script_path = os.path.join(os.path.dirname(__file__), "tools", "generate_manifest.py")
    result = subprocess.run([sys.executable, script_path], capture_output=True, text=True)
    
    if result.returncode == 0:
        print("Manifest generated successfully.")
    else:
        print("Error generating manifest:", result.stderr)

    # Set a timer to run the open_browser function after 1 second.
    threading.Timer(1.0, open_browser).start()

    with socketserver.TCPServer(("", PORT), StandardHTTPRequestHandler) as httpd:
        print(f"Server started on port {PORT}")
        print("Press Ctrl+C to stop the server.")
        
        try:
            # Keep the server running indefinitely
            httpd.serve_forever()
        except KeyboardInterrupt:
            # Catch the Ctrl+C signal to exit cleanly
            print("\nServer stopped manually. Goodbye!")
            sys.exit(0)