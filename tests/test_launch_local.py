#!/usr/bin/env python3
"""
tests/test_launch_local.py

Test-only HTTP server for the E2E suite (Playwright). Node.js/npm never run
this script — the test runner (Playwright webServer) starts/stops it. The app
itself is still served/launched by launch_local.py at the repo root.

The two servers stay in sync under the following rules:
  1) If a change is done in launch_local.py, it shall be done as well here.
  2) If a fix for a test is done here, it shall NOT be ported to launch_local.py.

This test server differs from launch_local.py on purpose: it sets SO_REUSEADDR
and handles requests in threads so the test runner can stop and restart it
repeatedly without "Address already in use" errors, and it keeps its log quiet.
"""
import http.server
import os
import socketserver
import subprocess
import sys

PORT = 8000


class ThreadingTCPServer(socketserver.ThreadingTCPServer):
    """Threaded server that releases the port immediately on restart."""

    allow_reuse_address = True
    daemon_threads = True


class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_request(self, code="-", size="-"):
        pass

    def log_message(self, fmt, *args):
        pass


def main():
    # Serve the repo root (two levels up from this file).
    repo_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    os.chdir(repo_root)

    # Keep the manifest in sync with data/ (same behavior as launch_local.py).
    manifest_script = os.path.join(repo_root, "tools", "generate_manifest.py")
    result = subprocess.run([sys.executable, manifest_script], capture_output=True, text=True)
    if result.returncode != 0:
        print("Error generating manifest:", result.stderr, file=sys.stderr)

    with ThreadingTCPServer(("", PORT), QuietHandler) as httpd:
        print(f"Test server started on port {PORT}")
        httpd.serve_forever()


if __name__ == "__main__":
    main()
