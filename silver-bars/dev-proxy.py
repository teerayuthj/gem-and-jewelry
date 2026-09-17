#!/usr/bin/env python3
"""
Dev-only server สำหรับ test silver-bars บน localhost.
- เสิร์ฟไฟล์ static (page.html, css, js) จากโฟลเดอร์นี้
- proxy ทุก request ที่ขึ้นต้นด้วย /api/ ไปยัง API จริง พร้อมปลอม Origin
  เป็น ausiris.co.th (API server whitelist origin นี้) แล้วแนบ CORS header กลับ

เหตุผล: API (192.168.10.140) ไม่ส่ง Access-Control-Allow-Origin
        เบราว์เซอร์จึงอ่าน response ข้าม origin ไม่ได้ตอน dev
        บน AEM จริง (โดเมน ausiris.co.th) เรียกตรงได้ ไม่ต้องใช้ proxy

ใช้:  python3 dev-proxy.py            (default host = 192.168.10.140)
      python3 dev-proxy.py http://192.168.10.140
แล้วเปิด  http://localhost:8000/page.html
"""
import http.server, socketserver, urllib.request, urllib.error, os, sys

DEFAULT_API_HOST = "http://192.168.10.140"   # LAN host (ต้องอยู่วงเน็ตเดียวกัน)
API_HOST = (sys.argv[1] if len(sys.argv) > 1 else os.environ.get("SB_API_HOST", DEFAULT_API_HOST)).rstrip("/")
SPOOF_ORIGIN = "http://www.ausiris.co.th"
PORT = int(os.environ.get("PORT", 8000))     # env PORT ไว้เผื่อ 8000 ไม่ว่าง (รันหลายตัวพร้อมกัน)

HERE = os.path.dirname(os.path.abspath(__file__))
REPO_ROOT = os.path.dirname(HERE)

class Handler(http.server.SimpleHTTPRequestHandler):
    def translate_path(self, path):
        # page.html อ้างรูปสินค้าด้วย ../public/... ซึ่งเบราว์เซอร์ย่อเป็น /public/...
        # ไฟล์จริงอยู่ระดับ repo (นอกโฟลเดอร์นี้) — dev เท่านั้น ให้ข้ามขึ้นไปหยิบได้
        # ไม่งั้นรูปสินค้า 404 แล้วเห็นเลย์เอาต์ไม่ตรงกับของจริง
        if path.startswith("/public/"):
            return os.path.join(REPO_ROOT, *path.lstrip("/").split("/"))
        return super().translate_path(path)

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
