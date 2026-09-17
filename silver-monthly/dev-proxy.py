#!/usr/bin/env python3
"""
Dev-only server สำหรับ test silver-monthly บน localhost.
- เสิร์ฟไฟล์ static (page.html, css, js) จากโฟลเดอร์นี้
- proxy ทุก request ที่ขึ้นต้นด้วย /api/ ไปยัง API จริง พร้อมปลอม Origin
  เป็น ausiris.co.th (API server whitelist origin นี้) แล้วแนบ CORS header กลับ
ใช้:  python3 dev-proxy.py   แล้วเปิด  http://localhost:8000/page.html
"""
import http.server, socketserver, urllib.request, urllib.error, os, sys

# เลือก API host ได้ 3 ทาง (เรียงตามลำดับความสำคัญ):
#   1) argument:  python3 dev-proxy.py http://192.168.10.240
#   2) env var:   SM_API_HOST=http://192.168.10.240 python3 dev-proxy.py
#   3) ค่า default ด้านล่าง
DEFAULT_API_HOST = "http://192.168.10.240"   # LAN host (ต้องอยู่วงเน็ตเดียวกัน)
API_HOST = (sys.argv[1] if len(sys.argv) > 1 else os.environ.get("SM_API_HOST", DEFAULT_API_HOST)).rstrip("/")
SPOOF_ORIGIN = "http://www.ausiris.co.th"
PORT = 8000

class Handler(http.server.SimpleHTTPRequestHandler):
    def _proxy(self):
        url = API_HOST + self.path
        req = urllib.request.Request(url, headers={
            "Origin": SPOOF_ORIGIN,
            "Referer": SPOOF_ORIGIN + "/",
            "User-Agent": "Mozilla/5.0",
        })
        try:
            with urllib.request.urlopen(req, timeout=15) as r:
                body, status = r.read(), r.status
                ctype = r.headers.get("Content-Type", "application/json")
        except urllib.error.HTTPError as e:
            body, status, ctype = e.read(), e.code, "application/json"
        except Exception as e:
            body, status, ctype = str(e).encode(), 502, "text/plain"
        self.send_response(status)
        self.send_header("Content-Type", ctype)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        if self.path.startswith("/api/"):
            return self._proxy()
        return super().do_GET()

socketserver.TCPServer.allow_reuse_address = True
with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print(f"Dev server: http://localhost:{PORT}/page.html  (api -> {API_HOST})")
    httpd.serve_forever()
