import argparse
import http.server
import socketserver
import subprocess
import sys
import os

PORT = 8000


def main():
    parser = argparse.ArgumentParser(description="Percussion Studio local development server")
    parser.add_argument(
        "-v",
        "--verbose",
        action="store_true",
        help="log every HTTP request (path and status) to the terminal",
    )
    args = parser.parse_args()

    class RequestHandler(http.server.SimpleHTTPRequestHandler):
        def log_request(self, code="-", size="-"):
            # Verbose mode logs every request; otherwise keep the console quiet.
            # Errors (404 etc.) are still reported via log_message/log_error.
            if args.verbose:
                super().log_request(code, size)

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

    with socketserver.TCPServer(("", PORT), RequestHandler) as httpd:
        print(f"Server started on port {PORT}")
        if args.verbose:
            print("Verbose logging enabled: each request will be printed.")
        print("Press Ctrl+C to stop the server.")

        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped manually. Goodbye!")
            sys.exit(0)


if __name__ == "__main__":
    main()
