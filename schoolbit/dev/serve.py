import http.server, socketserver, os
os.chdir('/tmp/claude-0/-home-user-corbit-opencart/9818c0dc-5bae-5d5a-9e50-90c0658dfb5f/scratchpad/noormock')
class H(http.server.SimpleHTTPRequestHandler):
    def guess_type(self, path):
        if path.endswith('.aspx'): return 'text/html; charset=utf-8'
        return super().guess_type(path)
socketserver.TCPServer(('127.0.0.1',8132), H).serve_forever()
