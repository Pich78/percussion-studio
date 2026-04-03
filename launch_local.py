import http.server
import socketserver
import subprocess
import sys
import os

PORT = 8000


class StandardHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    pass


if __name__ == "__main__":
    print("Regenerating manifest and metadata files...")

    script_path = os.path.join(
        os.path.dirname(__file__), "tools", "generate_manifest.py"
    )
    result = subprocess.run(
        [sys.executable, script_path], capture_output=True, text=True
    )

    if result.returncode == 0:
        print("Manifest generated successfully.")
    else:
        print("Error generating manifest:", result.stderr)

    with socketserver.TCPServer(("", PORT), StandardHTTPRequestHandler) as httpd:
        print(f"Server started on port {PORT}")
        print("Press Ctrl+C to stop the server.")

        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped manually. Goodbye!")
            sys.exit(0)
