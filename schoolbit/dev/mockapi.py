import http.server, socketserver, json
GOOD='TESTKEYTESTKEYTESTKEYTESTKEYTESTKEYTESTKEYTESTKE'
class H(http.server.BaseHTTPRequestHandler):
    def _send(self, code, obj):
        b=json.dumps(obj).encode(); self.send_response(code)
        self.send_header('Content-Type','application/json'); self.send_header('Content-Length',str(len(b))); self.end_headers(); self.wfile.write(b)
    def _auth(self):
        return self.headers.get('Authorization','')=='Bearer '+GOOD
    def do_POST(self):
        if self.path.startswith('/api/v1/get-balance'):
            return self._send(200,{'status':'Success','data':{'balance':4963}}) if self._auth() else self._send(401,{'message':'Unauthenticated.'})
        self._send(404,{})
    def do_GET(self):
        if self.path.startswith('/api/v1/sendernames'):
            if not self._auth(): return self._send(401,{'message':'Unauthenticated.'})
            return self._send(200,{'status':'Success','data':[{'name':'Arbiter','status':'approved'},{'name':'Pend','status':'pending'}],'pagination':{'last_page':1}})
        self._send(404,{})
    def log_message(self,*a): pass
socketserver.TCPServer(('0.0.0.0',8133),H).serve_forever()
