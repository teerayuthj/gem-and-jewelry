/* ===== Silver Bars — ตารางราคาแท่งเงินเล็ก (Option B) =====
   ตารางเปรียบเทียบ ขายออก(+VAT) / รับซื้อ ต่อหน่วยน้ำหนัก
   - กรองหมวด (ทั้งหมด / แท่งบาท / แท่งกรัม)
   - แตะหัวคอลัมน์เพื่อเรียงลำดับ
   - auto-mount: ผู้ใช้แค่วาง <div id="silver-bars"></div>
   - รองรับ API URL ในอนาคต (ดู CONFIG ด้านล่าง)
*/
(function () {
    'use strict';

    /* ===== CONFIG — แก้ที่เดียวจบ ===============================
       ต่อ API จริงในอนาคต: ตั้ง apiUrl ให้ชี้ endpoint ที่คืนรายการแท่งเงิน
       เว้นว่าง ('') = ใช้ MOCK_DATA (โหมดตัวอย่าง แสดง badge "ราคาตัวอย่าง")

       Override ได้ 2 ทางโดยไม่ต้องแก้ไฟล์นี้:
         1) window.SILVER_BARS_CONFIG = { apiUrl: '...', refreshMs: 30000 };  (ก่อนโหลด script)
         2) <div id="silver-bars" data-api-url="..." data-refresh="30000"></div>
    ============================================================ */
    var DEFAULTS = {
        apiUrl: 'https://api-price.ausiris.co.th/api/v1/prices/ausiris-silver',  // '' = โหมด mock
        refreshMs: 0,          // 0 = ไม่ auto-refresh / เช่น 30000 = ทุก 30 วินาที
        title: 'ราคารับซื้อขายออก',
        subtitle: 'โลหะเงินออสสิริส 99.9% ขนาดเล็ก'
    };

    /* ===== MOCK DATA — ราคาตัวอย่าง (แทนที่ด้วย API เมื่อพร้อม) =====
       sell = ขายออก (รวม VAT แล้ว) · buy = รับซื้อ · grams = น้ำหนัก(กรัม)
       tag  = ป้ายกำกับ (เช่น ลวดลาย) */
    var MOCK_DATA = [
        { name: '1 บาท (15.24 g.)',   grams: 15.24,  sell: 1310,  buy: 945 },
        { name: '5 บาท (76.22 g.)',   grams: 76.22,  sell: 5900,  buy: 4740 },
        { name: '10 บาท (152.44 g.)', grams: 152.44, sell: 11260, buy: 9480 },
        { name: '10 กรัม',  grams: 10,  sell: 970,   buy: 620 },
        { name: '20 กรัม',  grams: 20,  sell: 1730,  buy: 1245 },
        { name: '50 กรัม',  grams: 50,  sell: 4050,  buy: 3110 },
        { name: '100 กรัม', grams: 100, sell: 8000,  buy: 6220 },
        { name: '100 กรัม', grams: 100, sell: 8200,  buy: null, tag: 'ลวดลาย' },
        { name: '150 กรัม', grams: 150, sell: 11090, buy: 9330 }
    ];

    /* ===== แปลง response จาก API → รูปแบบภายใน =====
       API shape: { selling:[{key,label,price,...}], buying:[{key,label,price,...}], updated_at }
       - จับคู่ selling/buying ด้วย key (ตัด prefix sell_/buy_)
       - บางน้ำหนัก (เช่น 100g ลวดลาย) ไม่มีในฝั่ง buying → buy = null */
    var BAHT_TO_GRAM = 15.244;   // 1 บาท = 15.244 กรัม (ใช้แปลงเพื่อ "เรียงตามน้ำหนักจริง")

    function baseKey(k) { return String(k || '').replace(/^(sell|buy)_/, ''); }

    /* น้ำหนักจริง(กรัม) สำหรับใช้ sort — แกะจาก key ก่อน (คงที่/เชื่อถือได้)
       เช่น 1baht→15.244, 10baht→152.44, 20g→20, 100g_pattern→100
       ถ้า key แปลกค่อย fallback ไปแกะจาก label */
    function gramsFor(key, label) {
        var k = baseKey(key);
        var mB = k.match(/^(\d+(?:\.\d+)?)baht/);
        if (mB) return parseFloat(mB[1]) * BAHT_TO_GRAM;
        var mG = k.match(/^(\d+(?:\.\d+)?)g/);
        if (mG) return parseFloat(mG[1]);
        return gramsFromLabel(label);
    }

    function gramsFromLabel(label) {
        label = label || '';
        var mg = label.match(/([\d.]+)\s*g\.?/);          // "(15.24 g.)"
        if (mg) return parseFloat(mg[1]);
        var mk = label.match(/([\d.]+)\s*กรัม/);           // "20 กรัม"
        if (mk) return parseFloat(mk[1]);
        return 0;
    }

    function parseLabel(label) {
        label = label || '';
        var tag = '', name = label;
        if (name.indexOf('ลวดลาย') > -1) {
            tag = 'ลวดลาย';
            name = name.replace(/\s*\(ลวดลาย\)\s*/, '').trim();
        }
        return { name: name, tag: tag };
    }

    function mapApiResponse(json) {
        var selling = json.selling || [];
        var buying = json.buying || [];
        var buyMap = {};
        buying.forEach(function (b) { buyMap[baseKey(b.key)] = num(b.price); });
        return selling.map(function (s) {
            var info = parseLabel(s.label);
            var bk = baseKey(s.key);
            return {
                name: info.name,
                grams: gramsFor(s.key, s.label),
                tag: info.tag,
                sell: num(s.price),
                buy: buyMap.hasOwnProperty(bk) ? buyMap[bk] : null
            };
        });
    }

    /* ===== Markup (inject เอง) ===== */
    var MARKUP =
        '<div class="slb-container">' +
            '<div class="slb-header">' +
                '<h2 class="slb-title" id="slbTitle">—</h2>' +
                '<div class="slb-subtitle" id="slbSubtitle"></div>' +
                '<div class="slb-sub"><span id="slbUpdated"></span></div>' +
            '</div>' +
            '<div class="slb-filters" id="slbFilters">' +
                '<button class="slb-filter slb-active" data-filter="all">ทั้งหมด</button>' +
                '<button class="slb-filter" data-filter="baht">แท่งบาท</button>' +
                '<button class="slb-filter" data-filter="gram">แท่งกรัม</button>' +
            '</div>' +
            '<div class="slb-table-card">' +
                '<table class="slb-table">' +
                    '<thead><tr id="slbHead">' +
                        '<th class="slb-left" data-sort="grams">น้ำหนัก<span class="slb-arrow"></span></th>' +
                        '<th data-sort="sell">ขายออก (+VAT)<span class="slb-arrow"></span></th>' +
                        '<th data-sort="buy">รับซื้อ<span class="slb-arrow"></span></th>' +
                    '</tr></thead>' +
                    '<tbody id="slbBody"></tbody>' +
                '</table>' +
            '</div>' +
        '</div>';

    /* ===== State ===== */
    var state = { filter: 'all', sortKey: '', sortDir: 1, data: [], mock: true, cfg: null, host: null };

    /* ===== Helpers ===== */
    function $(id) { return document.getElementById(id); }
    function num(v) { var n = Number(v); return isFinite(n) ? n : 0; }
    function fmt(n) { return Math.round(n).toLocaleString('en-US'); }
    function money(n) { return fmt(n); }

    function resolveConfig(host) {
        var cfg = {};
        for (var k in DEFAULTS) cfg[k] = DEFAULTS[k];
        var g = window.SILVER_BARS_CONFIG || {};
        for (var gk in g) cfg[gk] = g[gk];
        if (host && host.dataset) {
            if (host.dataset.apiUrl) cfg.apiUrl = host.dataset.apiUrl;
            if (host.dataset.refresh) cfg.refreshMs = num(host.dataset.refresh);
            if (host.dataset.title) cfg.title = host.dataset.title;
        }
        return cfg;
    }

    function matchFilter(r) {
        if (state.filter === 'baht') return r.name.indexOf('บาท') > -1;
        if (state.filter === 'gram') return r.name.indexOf('กรัม') > -1;
        return true;
    }

    function currentRows() {
        var rows = state.data.map(function (d) {
            return { name: d.name, grams: d.grams, sell: d.sell, buy: d.buy, tag: d.tag || '' };
        }).filter(matchFilter);
        if (state.sortKey) {
            var k = state.sortKey, dir = state.sortDir;
            rows.sort(function (a, b) {
                var av = a[k] == null ? -Infinity : a[k];
                var bv = b[k] == null ? -Infinity : b[k];
                return (av - bv) * dir;
            });
        }
        return rows;
    }

    /* ===== Render ===== */
    function renderTable() {
        var tbody = $('slbBody');
        var rows = currentRows();
        if (!rows.length) {
            tbody.innerHTML = '<tr><td colspan="3" class="slb-empty">ไม่มีข้อมูลในหมวดนี้</td></tr>';
            return;
        }
        tbody.innerHTML = rows.map(function (r) {
            var tag = r.tag ? '<span class="slb-tag">' + r.tag + '</span>' : '';
            var buyCell = (r.buy == null) ? '<span class="slb-none">—</span>' : money(r.buy);
            return '<tr>' +
                '<td class="slb-weight"><div class="slb-wname">' + r.name + tag + '</div></td>' +
                '<td class="slb-sell">' + money(r.sell) + '</td>' +
                '<td class="slb-buy">' + buyCell + '</td>' +
            '</tr>';
        }).join('');
        updateSortIndicators();
    }

    function updateSortIndicators() {
        Array.prototype.forEach.call($('slbHead').querySelectorAll('th'), function (th) {
            var arrow = th.querySelector('.slb-arrow');
            if (th.getAttribute('data-sort') === state.sortKey) {
                th.classList.add('slb-sorted');
                arrow.textContent = state.sortDir > 0 ? ' ▲' : ' ▼';
            } else {
                th.classList.remove('slb-sorted');
                arrow.textContent = ' ⇅';
            }
        });
    }

    function renderSkeleton() {
        var tbody = $('slbBody');
        var rows = '';
        for (var i = 0; i < 5; i++) {
            rows += '<tr class="slb-skeleton">' +
                '<td class="slb-weight"><span class="slb-bar"></span></td>' +
                '<td><span class="slb-bar"></span></td>' +
                '<td><span class="slb-bar"></span></td></tr>';
        }
        tbody.innerHTML = rows;
    }

    function renderMeta(time) {
        $('slbTitle').textContent = state.cfg.title;
        $('slbSubtitle').textContent = state.cfg.subtitle;
        $('slbUpdated').textContent = time ? 'อัปเดต: ' + time : '';
    }

    /* ===== Data ===== */
    function loadData() {
        var cfg = state.cfg;
        if (!cfg.apiUrl) {
            state.data = MOCK_DATA.slice();
            state.mock = true;
            renderMeta(null);
            renderTable();
            return;
        }
        renderSkeleton();
        fetch(cfg.apiUrl)
            .then(function (res) {
                if (!res.ok) throw new Error('api ' + res.status);
                return res.json();
            })
            .then(function (json) {
                var rows = mapApiResponse(json);
                if (!rows.length) throw new Error('empty');
                state.data = rows;
                state.mock = false;
                renderMeta(json.updated_at || json.time || json.updated || null);
                renderTable();
            })
            .catch(function () {
                state.data = MOCK_DATA.slice();
                state.mock = true;
                renderMeta(null);
                renderTable();
            });
    }

    /* ===== Init ===== */
    function mount() {
        var host = $('silver-bars') || document.querySelector('[data-silver-bars]');
        if (!host) return null;
        if (!$('slbBody')) host.innerHTML = MARKUP;
        return host;
    }

    function bindEvents() {
        Array.prototype.forEach.call($('slbFilters').querySelectorAll('.slb-filter'), function (btn) {
            btn.addEventListener('click', function () {
                Array.prototype.forEach.call($('slbFilters').querySelectorAll('.slb-filter'),
                    function (b) { b.classList.remove('slb-active'); });
                btn.classList.add('slb-active');
                state.filter = btn.getAttribute('data-filter');
                renderTable();
            });
        });
        Array.prototype.forEach.call($('slbHead').querySelectorAll('th'), function (th) {
            th.addEventListener('click', function () {
                var key = th.getAttribute('data-sort');
                if (!key) return;
                if (state.sortKey === key) state.sortDir *= -1;
                else { state.sortKey = key; state.sortDir = 1; }
                renderTable();
            });
        });
    }

    function init() {
        var host = mount();
        if (!host) return;
        state.host = host;
        state.cfg = resolveConfig(host);
        bindEvents();
        loadData();
        if (state.cfg.refreshMs > 0 && state.cfg.apiUrl) {
            setInterval(loadData, state.cfg.refreshMs);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
