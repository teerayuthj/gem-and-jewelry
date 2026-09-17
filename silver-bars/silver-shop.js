/* ===== Silver Shop — การ์ดสินค้าแท่งเงิน (โชว์เคสเลื่อนแนวนอน) =====
   - แสดงเฉพาะ "ราคาขาย (+VAT)" · ไม่ใช้ฝั่ง buying จาก API
   - แต่ละใบลิงก์ไปหน้าสินค้าที่ Ausiris Express (แก้ที่ PRODUCTS ด้านล่าง)
   - rail เลื่อนแนวนอนทั้งสองจอ: มือถือปัดนิ้ว snap ทีละใบ · เดสก์ท็อปกดลูกศร หรือจับการ์ดลากด้วยเมาส์
   - auto-mount: ผู้ใช้แค่วาง <div id="silver-shop"></div>
   - ไฟล์นี้แยกจาก silver-bars.js สมบูรณ์ วางคู่กันในหน้าเดียวได้
*/
(function () {
    'use strict';

    /* ===== CONFIG — แก้ที่เดียวจบ ===============================
       Override ได้ 2 ทางโดยไม่ต้องแก้ไฟล์นี้:
         1) window.SILVER_SHOP_CONFIG = { apiUrl: '...', shopUrl: '...' };  (ก่อนโหลด script)
         2) <div id="silver-shop" data-api-url="..." data-shop-url="..." data-refresh="30000"></div>
    ============================================================ */
    var DEFAULTS = {
        apiUrl: 'https://api-price.ausiris.co.th/api/v1/prices/ausiris-silver',  // '' = โหมด mock
        refreshMs: 0,          // 0 = ไม่ auto-refresh / เช่น 30000 = ทุก 30 วินาที
        title: 'เงินแท่งออสสิริส',
        subtitle: 'โลหะเงินบริสุทธิ์ 99.99% — เลือกน้ำหนักที่ต้องการ',

        /* ชื่อสินค้า — บนการ์ดแยกแสดง 2 บรรทัดเพื่อไม่ให้น้ำหนักถูกบีบตกบรรทัด
             บรรทัดบน (เล็ก/จาง) = brand
             บรรทัดล่าง (ใหญ่/เข้ม) = weightTemplate  ← ส่วนที่ลูกค้าเลือกจริง
           ส่วน alt/aria ใช้ชื่อเต็มต่อกัน 'โลหะเงินออสสิริส 99.99% น้ำหนัก 50 กรัม' */
        brand: 'โลหะเงินออสสิริส 99.99%',
        weightTemplate: 'น้ำหนัก {weight}',

        priceUnit: 'บาท',   // หน่วยท้ายราคาบนการ์ด

        /* optional: รายการสินค้าและชื่อเต็มตามหน้าร้าน
           ถ้ามี priceKey จะใช้ราคาสดจาก API และใช้ price เป็นราคาสำรอง */
        catalog: null,

        /* ข้อความ VAT — บอกครั้งเดียวบนหัว แทนการห้อย +VAT ทุกใบ
           เขียนแบบ "รวม...แล้ว" เพื่อไม่ให้เข้าใจผิดว่าต้องบวกเพิ่มตอนจ่าย */
        vatNote: 'ราคาที่แสดงรวมภาษีมูลค่าเพิ่ม (VAT 7%) แล้ว',
        shopUrl: 'https://express.ausiris.co.th/',  // ปลายทางสำรอง ถ้ารายการนั้นยังไม่มี link เฉพาะ

        /* ไอคอนตะกร้าบนปุ่มสั่งซื้อ
           'auto' = เช็คว่าหน้านี้โหลด Font Awesome ไว้ไหม ถ้ามีใช้ FA ถ้าไม่มีถอยไปใช้ SVG ในตัว
           'fa'   = บังคับใช้ Font Awesome (หน้าต้องโหลด FA เอง)
           'svg'  = บังคับใช้ SVG ในตัว ไม่พึ่ง FA เลย */
        icon: 'auto'
    };

    /* ===== PRODUCTS — ข้อมูลสินค้าที่ API ไม่ได้ส่งมา ==========
       key = key จาก API หลังตัด prefix sell_/buy_ (เช่น sell_100g_pattern → 100g_pattern)

       image : URL รูปสินค้า — เว้นว่าง ('') = ใช้ภาพ SVG แทนไปก่อน
               ของฝั่งทองเก็บที่ http://www.ausiris.co.th/content/dam/ausirisgold/stamped-gold/...
               ฝั่งเงินพอได้ไฟล์จริงแล้ว ใส่ URL ตรงนี้ได้เลย
       link  : URL หน้าสินค้าที่ Ausiris Express — เว้นว่าง = ใช้ cfg.shopUrl
       badge : ป้ายมุมบนซ้าย (เช่น 'ยอดนิยม') — เว้นว่าง = ไม่แสดง
               ถ้า label มีคำว่า "ลวดลาย" จะขึ้น badge สีเงินให้อัตโนมัติ
    ============================================================ */
    var PRODUCTS = {
        '1baht':        { image: '', link: '', badge: '' },
        '5baht':        { image: '', link: '', badge: '' },
        '10baht':       { image: '', link: '', badge: '' },
        '10g':          { image: '', link: '', badge: 'ยอดนิยม' },
        '20g':          { image: '', link: '', badge: '' },
        '50g':          { image: '', link: '', badge: '' },
        '100g':         { image: '', link: '', badge: 'ยอดนิยม' },
        '100g_pattern': { image: '', link: '', badge: '' },
        '150g':         { image: '', link: '', badge: '' }
    };

    /* ===== MOCK DATA — ใช้เมื่อ apiUrl ว่าง หรือ API ล่ม ===== */
    var MOCK_DATA = [
        { key: '1baht',        name: '1 บาท',    sub: '15.24 กรัม',  grams: 15.24,  sell: 1310,  kind: 'baht' },
        { key: '5baht',        name: '5 บาท',    sub: '76.22 กรัม',  grams: 76.22,  sell: 5900,  kind: 'baht' },
        { key: '10baht',       name: '10 บาท',   sub: '152.44 กรัม', grams: 152.44, sell: 11260, kind: 'baht' },
        { key: '10g',          name: '10 กรัม',  sub: '',            grams: 10,     sell: 970,   kind: 'gram' },
        { key: '20g',          name: '20 กรัม',  sub: '',            grams: 20,     sell: 1730,  kind: 'gram' },
        { key: '50g',          name: '50 กรัม',  sub: '',            grams: 50,     sell: 4050,  kind: 'gram' },
        { key: '100g',         name: '100 กรัม', sub: '',            grams: 100,    sell: 8000,  kind: 'gram' },
        { key: '100g_pattern', name: '100 กรัม', sub: 'ลวดลาย',      grams: 100,    sell: 8200,  kind: 'gram', tag: 'ลวดลาย' },
        { key: '150g',         name: '150 กรัม', sub: '',            grams: 150,    sell: 11090, kind: 'gram' }
    ];

    /* ===== แปลง response จาก API → รูปแบบภายใน =====
       API shape: { selling:[{key,label,price,...}], buying:[...], updated_at }
       ใช้เฉพาะ selling — ฝั่ง buying ถูกละไว้ทั้งหมดตามดีไซน์ */
    var BAHT_TO_GRAM = 15.244;

    function baseKey(k) { return String(k || '').replace(/^(sell|buy)_/, ''); }

    /* น้ำหนักจริง(กรัม) แกะจาก key ก่อนเพราะคงที่กว่า label */
    function gramsFor(key, label) {
        var k = baseKey(key);
        var mB = k.match(/^(\d+(?:\.\d+)?)baht/);
        if (mB) return parseFloat(mB[1]) * BAHT_TO_GRAM;
        var mG = k.match(/^(\d+(?:\.\d+)?)g/);
        if (mG) return parseFloat(mG[1]);
        var ml = String(label || '').match(/([\d.]+)\s*(?:g\.?|กรัม)/);
        return ml ? parseFloat(ml[1]) : 0;
    }

    function kindOf(key, name) {
        var k = baseKey(key);
        if (/baht/.test(k)) return 'baht';
        if (/\dg(_|$)/.test(k)) return 'gram';
        return name.indexOf('บาท') > -1 ? 'baht' : 'gram';
    }

    /* "1 บาท (15.24 g.)" → { name:'1 บาท', sub:'15.24 กรัม' }
       "100 กรัม (ลวดลาย)" → { name:'100 กรัม', sub:'ลวดลาย', tag:'ลวดลาย' } */
    function parseLabel(label) {
        var s = String(label || '').trim();
        var tag = '';
        if (s.indexOf('ลวดลาย') > -1) tag = 'ลวดลาย';
        var sub = '';
        var m = s.match(/^(.*?)\s*\(([^)]*)\)\s*$/);
        if (m) {
            s = m[1].trim();
            sub = m[2].trim().replace(/\s*g\.?$/i, ' กรัม');
        }
        return { name: s, sub: sub, tag: tag };
    }

    function mapApiResponse(json) {
        var selling = (json && json.selling) || [];
        return selling.map(function (s) {
            var info = parseLabel(s.label);
            return {
                key: baseKey(s.key),
                name: info.name,
                sub: info.sub,
                tag: info.tag,
                grams: gramsFor(s.key, s.label),
                sell: num(s.price),
                kind: kindOf(s.key, info.name)
            };
        }).filter(function (r) { return r.sell > 0; });
    }

    /* รูปสินค้า — รับได้ทั้ง images: ['a','b'] (หลายรูป) และ image: 'a' แบบเดิม
       คืนเป็น array เสมอเพื่อให้ฝั่ง render มีทางเดียว · กรองค่าว่างทิ้งกัน <img src=""> */
    function imageList(item) {
        var list = Array.isArray(item.images) ? item.images.slice() : [];
        if (!list.length && item.image) list = [item.image];
        return list.filter(function (u) { return !!String(u || '').trim(); });
    }

    function applyCatalog(rows, useLivePrices) {
        var catalog = state.cfg && state.cfg.catalog;
        if (!Array.isArray(catalog) || !catalog.length) return rows;

        var byKey = {};
        rows.forEach(function (row) { byKey[row.key] = row; });

        return catalog.map(function (item, index) {
            var source = useLivePrices && item.priceKey ? byKey[baseKey(item.priceKey)] : null;
            return {
                key: item.key || ('catalog-' + index),
                fullName: String(item.name || '').trim(),
                name: (source && source.name) || '',
                sub: item.sub || '',
                tag: item.tag || '',
                badge: item.badge || '',
                grams: num(item.grams) || (source && source.grams) || 0,
                sell: source ? source.sell + num(item.priceAdjustment) : num(item.price),
                kind: item.kind || (source && source.kind) || 'gram',
                images: imageList(item),
                imageFit: item.imageFit || '',
                link: item.link || ''
            };
        }).filter(function (row) { return row.fullName && row.sell > 0; });
    }

    /* ===== Markup (inject เอง) ===== */
    var MARKUP =
        '<div class="sls-container">' +
            '<div class="sls-header">' +
                '<h2 class="sls-title" id="slsTitle">—</h2>' +
                '<div class="sls-subtitle" id="slsSubtitle"></div>' +
                '<div class="sls-meta">' +
                    '<span class="sls-note" id="slsNote"></span>' +
                    '<span class="sls-updated" id="slsUpdated"></span>' +
                '</div>' +
            '</div>' +
            '<div class="sls-filters" id="slsFilters">' +
                '<button type="button" class="sls-filter sls-active" data-filter="all">ทั้งหมด</button>' +
                '<button type="button" class="sls-filter" data-filter="baht">แท่งบาท</button>' +
                '<button type="button" class="sls-filter" data-filter="gram">แท่งกรัม</button>' +
                '<button type="button" class="sls-filter" data-filter="granule">เม็ดเงิน</button>' +
            '</div>' +
            '<div class="sls-hint">← เลื่อนดูน้ำหนักอื่น →</div>' +
            /* ปุ่มลูกศรอยู่นอก rail (ใน railwrap) เพราะ rail คือกล่องที่เลื่อน
               ถ้าเอาปุ่มไว้ข้างในมันจะเลื่อนหนีไปกับการ์ดด้วย */
            '<div class="sls-railwrap">' +
                '<button type="button" class="sls-arrow sls-prev" id="slsPrev" ' +
                        'aria-controls="slsRail" aria-label="เลื่อนไปทางซ้าย"></button>' +
                '<div class="sls-rail" id="slsRail" tabindex="0" role="list" aria-label="รายการเงินแท่ง"></div>' +
                '<button type="button" class="sls-arrow sls-next" id="slsNext" ' +
                        'aria-controls="slsRail" aria-label="เลื่อนไปทางขวา"></button>' +
            '</div>' +
            '<div class="sls-dots" id="slsDots" aria-hidden="true"></div>' +
        '</div>';

    /* ไอคอนตะกร้า 2 แบบ — เลือกด้วย cfg.icon (ดู DEFAULTS)
       ใช้ชื่อคลาสแบบ fa5 ซึ่ง fa6 ยังรองรับเป็น alias อยู่ (fas→fa-solid, fa-shopping-cart→fa-cart-shopping)
       ครอบคลุมทั้ง fa5 และ fa6 ด้วยสตริงเดียว */
    var CART_FA = '<i class="fas fa-shopping-cart" aria-hidden="true"></i>';
    var INFO_FA = '<i class="fas fa-info-circle" aria-hidden="true"></i>';
    var INFO_SVG =
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
        'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
        '<circle cx="12" cy="12" r="9"/><path d="M12 11v5"/><path d="M12 7.6v.6"/></svg>';
    var CART_SVG =
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" ' +
        'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
        '<circle cx="9" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/>' +
        '<path d="M2 3h3l2.4 11.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.6L21 7H6"/></svg>';

    /* ลูกศรบนปุ่มเลื่อน rail — โหมดเดียวกับตะกร้า/ข้อมูล (FA ถ้ามี ไม่มีก็ SVG ในตัว) */
    var CHEV_FA = { left: '<i class="fas fa-chevron-left" aria-hidden="true"></i>',
                    right: '<i class="fas fa-chevron-right" aria-hidden="true"></i>' };
    function chevSvg(dir) {
        return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" ' +
            'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M' +
            (dir === 'left' ? '15 4 7 12l8 8' : '9 4 17 12l-8 8') + '"/></svg>';
    }

    function cartIcon() { return state.useFa ? CART_FA : CART_SVG; }
    function infoIcon() { return state.useFa ? INFO_FA : INFO_SVG; }
    function chevIcon(dir) { return state.useFa ? CHEV_FA[dir] : chevSvg(dir); }

    /* เช็คว่าหน้านี้โหลด Font Awesome ไว้จริงไหม
       วิธี: แปะ <i> ที่มีคลาส FA ลงไปนอกจอ แล้วอ่าน font-family ที่ browser คำนวณให้
       ถ้า FA โหลดสำเร็จ font-family จะเป็น "Font Awesome ..." — เช็ค CSS จริง ไม่ใช่เดาจากชื่อไฟล์ */
    function faAvailable() {
        try {
            var probe = document.createElement('i');
            probe.className = 'fas fa-shopping-cart';
            probe.style.cssText = 'position:absolute;left:-9999px;top:-9999px;visibility:hidden;';
            document.body.appendChild(probe);
            var fam = (window.getComputedStyle(probe).fontFamily || '');
            document.body.removeChild(probe);
            return /font\s*awesome/i.test(fam);
        } catch (e) {
            return false;
        }
    }

    /* ===== State ===== */
    var state = { filter: 'all', data: [], mock: true, cfg: null, host: null, useFa: false };

    /* ===== Helpers ===== */
    function $(id) { return document.getElementById(id); }
    function num(v) { var n = Number(v); return isFinite(n) ? n : 0; }
    function money(n) { return Math.round(n).toLocaleString('en-US'); }
    function esc(s) {
        return String(s == null ? '' : s)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    function resolveConfig(host) {
        var cfg = {};
        for (var k in DEFAULTS) cfg[k] = DEFAULTS[k];
        var g = window.SILVER_SHOP_CONFIG || {};
        for (var gk in g) cfg[gk] = g[gk];
        if (host && host.dataset) {
            if (host.dataset.apiUrl) cfg.apiUrl = host.dataset.apiUrl;
            if (host.dataset.shopUrl) cfg.shopUrl = host.dataset.shopUrl;
            if (host.dataset.refresh) cfg.refreshMs = num(host.dataset.refresh);
            if (host.dataset.title) cfg.title = host.dataset.title;
            if (host.dataset.subtitle) cfg.subtitle = host.dataset.subtitle;
            if (host.dataset.icon) cfg.icon = host.dataset.icon;
        }
        return cfg;
    }

    /* ===== ภาพแทนชั่วคราว =====
       วาดแพ็กเกจแท่งเงินด้วย SVG แนวตั้ง ให้ทรงใกล้เคียงรูปถ่ายจริง (การ์ดสีเขียวเข้ม + แท่งเงินตรงกลาง)
       เพื่อให้เห็นสัดส่วนจริงตอนวางเลย์เอาต์ · ขนาดแท่งขยับตามน้ำหนัก
       พอใส่ image ใน PRODUCTS แล้ว ฟังก์ชันนี้จะไม่ถูกเรียก */
    function placeholderSvg(grams, isPattern, uid) {
        var bw = Math.min(46, 20 + Math.log(grams + 1) * 5.5);   // ความกว้างแท่ง
        var bh = bw * 1.5;
        var bx = 60 - bw / 2, by = 78 - bh / 2;
        var sid = 'slsBar' + uid, tid = 'slsPack' + uid;
        return '<svg viewBox="0 0 120 160" role="img" aria-hidden="true">' +
            '<defs>' +
                '<linearGradient id="' + tid + '" x1="0" y1="0" x2="1" y2="1">' +
                    '<stop offset="0%" stop-color="#14615c"/><stop offset="100%" stop-color="#063a38"/>' +
                '</linearGradient>' +
                '<linearGradient id="' + sid + '" x1="0" y1="0" x2="1" y2="1">' +
                    '<stop offset="0%" stop-color="#ffffff"/><stop offset="45%" stop-color="#dfe6ee"/>' +
                    '<stop offset="100%" stop-color="#a6b3c2"/>' +
                '</linearGradient>' +
            '</defs>' +
            /* ซองแพ็กเกจ */
            '<rect x="18" y="8" width="84" height="144" rx="9" fill="#e4e9ee" stroke="#c2ccd6" stroke-width="1"/>' +
            '<rect x="23" y="13" width="74" height="134" rx="6" fill="url(#' + tid + ')"/>' +
            /* แท่งเงิน */
            '<rect x="' + bx.toFixed(1) + '" y="' + by.toFixed(1) + '" width="' + bw.toFixed(1) +
                '" height="' + bh.toFixed(1) + '" rx="3" fill="url(#' + sid + ')" ' +
                'stroke="#8fa0b3" stroke-width="0.6"/>' +
            (isPattern
                /* ลวดลาย: จุดกระจายบนหน้าแท่ง */
                ? '<g fill="none" stroke="#93a2b3" stroke-width="0.9" opacity=".85">' +
                  '<circle cx="' + (bx + bw * 0.32).toFixed(1) + '" cy="' + (by + bh * 0.32).toFixed(1) + '" r="' + (bw * 0.11).toFixed(1) + '"/>' +
                  '<circle cx="' + (bx + bw * 0.68).toFixed(1) + '" cy="' + (by + bh * 0.5).toFixed(1) + '" r="' + (bw * 0.11).toFixed(1) + '"/>' +
                  '<circle cx="' + (bx + bw * 0.35).toFixed(1) + '" cy="' + (by + bh * 0.68).toFixed(1) + '" r="' + (bw * 0.11).toFixed(1) + '"/>' +
                  '</g>'
                /* หน้าปกติ: โลโก้ + เส้นข้อความจำลอง */
                : '<text x="60" y="' + (by + bh * 0.42).toFixed(1) + '" text-anchor="middle" ' +
                    'font-family="Prompt,sans-serif" font-size="' + (bw * 0.3).toFixed(1) +
                    '" font-weight="700" fill="#8b9aac">A</text>' +
                  '<rect x="' + (bx + bw * 0.2).toFixed(1) + '" y="' + (by + bh * 0.58).toFixed(1) + '" width="' +
                    (bw * 0.6).toFixed(1) + '" height="1.6" rx="0.8" fill="#a9b6c4"/>' +
                  '<rect x="' + (bx + bw * 0.28).toFixed(1) + '" y="' + (by + bh * 0.68).toFixed(1) + '" width="' +
                    (bw * 0.44).toFixed(1) + '" height="1.4" rx="0.7" fill="#bcc7d3"/>') +
            /* แบรนด์ท้ายซอง */
            '<text x="60" y="130" text-anchor="middle" font-family="Prompt,sans-serif" ' +
                'font-size="9.5" font-weight="700" fill="#ffffff" letter-spacing="1.2">AUSIRIS</text>' +
            '<text x="60" y="139" text-anchor="middle" font-family="Prompt,sans-serif" ' +
                'font-size="4" font-weight="500" fill="#8fc4bf" letter-spacing="0.6">FINE SILVER 999.0</text>' +
        '</svg>';
    }

    /* ภาพแทนสำหรับเม็ดเงิน แยกจากทรงแท่งเงินเพื่อไม่ให้ลูกค้าเข้าใจผิด */
    function granulePlaceholderSvg(uid) {
        var sid = 'slsGranule' + uid, tid = 'slsGranulePack' + uid;
        return '<svg viewBox="0 0 120 160" role="img" aria-hidden="true">' +
            '<defs>' +
                '<linearGradient id="' + tid + '" x1="0" y1="0" x2="1" y2="1">' +
                    '<stop offset="0%" stop-color="#14615c"/><stop offset="100%" stop-color="#063a38"/>' +
                '</linearGradient>' +
                '<radialGradient id="' + sid + '" cx="32%" cy="28%" r="72%">' +
                    '<stop offset="0%" stop-color="#ffffff"/><stop offset="48%" stop-color="#dfe6ee"/>' +
                    '<stop offset="100%" stop-color="#94a3b8"/>' +
                '</radialGradient>' +
            '</defs>' +
            '<rect x="18" y="8" width="84" height="144" rx="9" fill="#e4e9ee" stroke="#c2ccd6" stroke-width="1"/>' +
            '<rect x="23" y="13" width="74" height="134" rx="6" fill="url(#' + tid + ')"/>' +
            '<g fill="url(#' + sid + ')" stroke="#8391a3" stroke-width="0.55">' +
                '<circle cx="46" cy="55" r="8"/><circle cx="62" cy="52" r="8.5"/>' +
                '<circle cx="76" cy="60" r="7.5"/><circle cx="51" cy="70" r="8.5"/>' +
                '<circle cx="68" cy="69" r="9"/><circle cx="79" cy="77" r="7"/>' +
                '<circle cx="47" cy="86" r="7"/><circle cx="62" cy="86" r="8"/>' +
                '<circle cx="75" cy="92" r="7.5"/>' +
            '</g>' +
            '<text x="60" y="112" text-anchor="middle" font-family="Prompt,sans-serif" ' +
                'font-size="5" font-weight="600" fill="#b7d8d5" letter-spacing="0.4">SILVER GRANULES</text>' +
            '<text x="60" y="130" text-anchor="middle" font-family="Prompt,sans-serif" ' +
                'font-size="9.5" font-weight="700" fill="#ffffff" letter-spacing="1.2">AUSIRIS</text>' +
            '<text x="60" y="139" text-anchor="middle" font-family="Prompt,sans-serif" ' +
                'font-size="4" font-weight="500" fill="#8fc4bf" letter-spacing="0.6">FINE SILVER 999.0</text>' +
        '</svg>';
    }

    /* 'น้ำหนัก 50 กรัม' — ลวดลายต่อท้ายเป็นวงเล็บ 'น้ำหนัก 100 กรัม (ลวดลาย)' */
    function weightLine(r) {
        var weight = r.name + (r.tag ? ' (' + r.tag + ')' : '');
        return state.cfg.weightTemplate.replace('{weight}', weight);
    }

    /* ชื่อเต็มต่อกัน ใช้กับ alt / aria-label ที่ต้องอ่านรวดเดียวจบ */
    function fullName(r) { return r.fullName || (state.cfg.brand + ' ' + weightLine(r)); }

    /* ===== Render ===== */
    function cardHtml(r, i) {
        var meta = PRODUCTS[r.key] || {};
        var href = r.link || meta.link || state.cfg.shopUrl;
        var name = fullName(r);

        var badge = '';
        if (r.tag) badge = '<span class="sls-badge sls-pattern">' + esc(r.tag) + '</span>';
        else if (r.badge || meta.badge) badge = '<span class="sls-badge">' + esc(r.badge || meta.badge) + '</span>';

        /* รูปสินค้า: ซ้อนทุกใบทับกันแล้วสลับด้วย opacity (ดู bindShots)
           lazy ทุกใบ ยกเว้นรูปแรกของการ์ด 3 ใบแรกที่เห็นทันทีตั้งแต่เปิดหน้า — ใบพวกนั้นถ้า lazy
           จะกลายเป็นกล่องเปล่าแวบหนึ่งก่อนรูปโผล่ ทั้งที่ยังไงก็ต้องโหลดอยู่ดี
           ที่เหลือ (รวมรูปที่ 2 ของทุกใบ) โหลดต่อเมื่อเลื่อนมาถึงจริง
           alt ใส่เฉพาะใบแรก ใบอื่นเป็นมุมมองเพิ่มของสินค้าเดียวกัน ให้ screen reader อ่านซ้ำไม่มีประโยชน์ */
        var shots = r.images && r.images.length ? r.images : (meta.image ? [meta.image] : []);
        var pic = shots.length
            ? '<div class="sls-card-shots">' + shots.map(function (u, n) {
                  return '<img class="sls-shot' + (n === 0 ? ' sls-shot-on' : '') + '" ' +
                      'src="' + esc(u) + '" ' +
                      (n === 0 ? 'alt="' + esc(name) + '"' : 'alt="" aria-hidden="true"') +
                      ' loading="' + (n === 0 && i < 3 ? 'eager' : 'lazy') + '" decoding="async">';
              }).join('') + '</div>'
            : r.kind === 'granule' ? granulePlaceholderSvg(i) : placeholderSvg(r.grams, !!r.tag, i);

        /* จุดบอกว่ามีกี่รูป/อยู่รูปไหน — ขึ้นเฉพาะสินค้าที่มีมากกว่า 1 รูป
           รูปเดียวแล้วขึ้นจุด = หลอกให้กดแล้วไม่มีอะไรเกิดขึ้น */
        var shotDots = shots.length > 1
            ? '<div class="sls-shot-dots" aria-hidden="true">' + shots.map(function (_, n) {
                  return '<i class="' + (n === 0 ? 'sls-on' : '') + '"></i>';
              }).join('') + '</div>'
            : '';

        /* sub = ข้อมูลเสริมที่ชื่อไม่ได้บอก (กรัมเทียบของแท่งบาท) — ไม่มีก็ไม่ต้องขึ้นบรรทัดเปล่า */
        var sub = r.sub && r.sub !== r.tag
            ? '<div class="sls-card-sub">' + esc(r.sub) + '</div>' : '';

        var productName = r.fullName
            ? '<div class="sls-card-name sls-card-name-full" title="' + esc(r.fullName) + '">' + esc(r.fullName) + '</div>'
            : '<div class="sls-card-brand">' + esc(state.cfg.brand) + '</div>' +
              '<div class="sls-card-name">' + esc(weightLine(r)) + '</div>';

        return '<article class="sls-card" role="listitem" data-kind="' + esc(r.kind) + '">' +
                badge +
                '<div class="sls-card-img' + (r.imageFit === 'cover' ? ' sls-card-img-cover' : '') + '"' +
                    (shots.length > 1 ? ' data-shots="' + shots.length + '"' : '') + '>' +
                    pic + shotDots +
                '</div>' +
                '<div class="sls-card-body">' +
                    productName + sub +
                    '<div class="sls-card-price">' + money(r.sell) +
                        '<small>' + esc(state.cfg.priceUnit) + '</small></div>' +
                    '<div class="sls-card-btn">' +
                        '<a href="' + esc(href) + '" target="_blank" rel="noopener noreferrer" ' +
                           'aria-label="สั่งซื้อ ' + esc(name) + '">' +
                            cartIcon() + 'สั่งซื้อ</a>' +
                    '</div>' +
                '</div>' +
            '</article>';
    }

    function currentRows() {
        return state.data.filter(function (r) {
            return state.filter === 'all' || r.kind === state.filter;
        });
    }

    function renderRail() {
        var rail = $('slsRail');
        var rows = currentRows();
        rail.classList.remove('sls-skeleton');
        if (!rows.length) {
            rail.innerHTML = '<div class="sls-empty">ไม่มีสินค้าในหมวดนี้</div>';
            syncNav();
            return;
        }
        rail.innerHTML = rows.map(cardHtml).join('');
        rail.scrollLeft = 0;    /* เปลี่ยน filter แล้วต้องกลับไปต้นแถว ไม่ใช่ค้างกลางทาง */
        syncNav();
    }

    function renderSkeleton() {
        var rail = $('slsRail');
        rail.classList.add('sls-skeleton');
        var cards = '';
        for (var i = 0; i < 4; i++) {
            cards += '<article class="sls-card">' +
                '<div class="sls-card-img"></div>' +
                '<div class="sls-card-body">' +
                    '<span class="sls-bar sls-w60"></span>' +
                    '<span class="sls-bar sls-w40"></span>' +
                    '<span class="sls-bar sls-full"></span>' +
                '</div></article>';
        }
        rail.innerHTML = cards;
        $('slsDots').innerHTML = '';
        $('slsPrev').disabled = $('slsNext').disabled = true;   /* ยังโหลดไม่เสร็จ อย่าเพิ่งให้กดเลื่อน */
    }

    function renderMeta(time) {
        $('slsTitle').textContent = state.cfg.title;
        $('slsSubtitle').textContent = state.cfg.subtitle;
        $('slsNote').innerHTML = state.cfg.vatNote
            ? infoIcon() + '<span>' + esc(state.cfg.vatNote) + '</span>' : '';
        $('slsUpdated').textContent = time ? 'อัปเดตราคา: ' + time : '';
    }

    /* ===== ตัวควบคุม rail ===== */

    /* รองรับ scroll-behavior ไหม — ถ้าไม่ อย่าส่ง object เข้า scrollTo()
       เพราะเบราว์เซอร์เก่าจะอ่าน object เป็นพิกัด x แล้วกลายเป็น NaN เด้งกลับไป 0 */
    var SMOOTH_OK = 'scrollBehavior' in document.documentElement.style;

    /* ระยะ 1 ใบ = ความกว้างการ์ด + gap
       อ่าน gap จาก CSS จริงแทน hard-code เพราะมือถือ 12px เดสก์ท็อป 16px ไม่เท่ากัน */
    function cardStep(rail) {
        var c = rail.querySelector('.sls-card');
        if (!c) return 0;
        var gap = parseFloat(window.getComputedStyle(rail).gap);
        return c.offsetWidth + (isFinite(gap) ? gap : 12);
    }

    /* dots บอกว่าอยู่ใบไหน (มือถือ) + เปิด/ปิดลูกศร (เดสก์ท็อป) — สถานะมาจากค่า scroll ชุดเดียวกัน */
    function syncNav() {
        var rail = $('slsRail'), dots = $('slsDots');
        var prev = $('slsPrev'), next = $('slsNext');
        var cards = rail.querySelectorAll('.sls-card');
        if (!cards.length) {
            dots.innerHTML = '';
            prev.disabled = next.disabled = true;
            return;
        }
        /* เผื่อ 8px เพราะจุดพักซ้ายสุดไม่ใช่ 0 เป๊ะ (rail มี padding แล้ว snap ไปเกาะขอบการ์ด) */
        var max = rail.scrollWidth - rail.clientWidth;
        var atEnd = max > 0 && rail.scrollLeft >= max - 8;

        var step = cardStep(rail);
        var idx = step > 0 ? Math.round(rail.scrollLeft / step) : 0;
        /* สุดขวาแล้วเลื่อนได้ไม่ครบอีก 1 ช่วงการ์ด (rail แคบกว่าผลรวมการ์ด)
           ปัดให้เป็นใบสุดท้ายไปเลย ไม่งั้น dot ดวงท้ายไม่มีวันติด */
        if (atEnd) idx = cards.length - 1;

        var html = '';
        for (var i = 0; i < cards.length; i++) {
            html += '<i class="' + (i === idx ? 'sls-on' : '') + '"></i>';
        }
        dots.innerHTML = html;

        /* ของเห็นครบไม่ต้องเลื่อน (เช่น filter เหลือ 3 ใบ) → max = 0 ปุ่มดับทั้งคู่เอง */
        prev.disabled = rail.scrollLeft <= 8;
        next.disabled = max <= 0 || atEnd;

        /* บอก CSS ว่ารอบนี้เลื่อนได้ไหม — ใช้ตัดสินว่าจะขึ้นเคอร์เซอร์มือจับหรือเปล่า
           ไม่มีอะไรให้เลื่อนแล้วยังขึ้นมือจับ = หลอกให้ลากแล้วไม่เกิดอะไร */
        rail.classList.toggle('sls-grabbable', max > 8);
    }

    /* เลื่อนทีละ "หน้า" = จำนวนการ์ดที่มองเห็นพอดี ไม่หยุดค้างครึ่งใบ */
    function pageScroll(dir) {
        var rail = $('slsRail');
        var step = cardStep(rail);
        if (!step) return;
        var perPage = Math.max(1, Math.floor(rail.clientWidth / step));
        var max = rail.scrollWidth - rail.clientWidth;
        var from = rail.scrollLeft;
        var to = Math.max(0, Math.min(from + dir * step * perPage, max));

        if (SMOOTH_OK) {
            rail.scrollTo({ left: to, behavior: 'smooth' });
            /* กันเหนียว: ถ้าหน้าที่ฝัง component ตั้ง scroll-behavior: smooth ไว้ที่ระดับ global
               บาง engine จะนิ่งสนิทแทนที่จะเลื่อน — เช็คที่ 150ms ถ้ายังไม่ขยับให้กระโดดไปเลย */
            setTimeout(function () { if (rail.scrollLeft === from) rail.scrollLeft = to; }, 150);
        } else {
            rail.scrollLeft = to;
        }
        /* smooth ยิง scroll event เป็นชุดจนกว่าจะนิ่ง — เช็คสถานะลูกศรซ้ำหลังอนิเมชันจบ */
        setTimeout(syncNav, 400);
        setTimeout(syncNav, 700);
    }

    /* ===== จับการ์ดลากด้วยเมาส์ =====
       เดสก์ท็อปไม่มีนิ้วให้ปัด ปุ่มลูกศรอย่างเดียวฝืนเวลาอยากขยับนิดเดียว
       ทำเฉพาะ pointerType 'mouse' — ทัชสกรีนปล่อยให้เป็นการปัดของระบบเหมือนเดิม
       ซึ่งมี momentum + snap ในตัวอยู่แล้ว ถ้าไปดักจะได้ของที่แย่กว่าเดิม */
    var DRAG_SLOP = 6;   // px ที่ยังนับว่า "คลิก" ไม่ใช่ "ลาก" — มือสั่นตอนกดปุ่มสั่งซื้อจะได้ไม่โดนกิน

    function bindDrag(rail) {
        if (!window.PointerEvent) return;   // เบราว์เซอร์เก่า: ยังมีลูกศรกับ shift+ล้อเมาส์ให้ใช้
        var down = false, dragging = false, startX = 0, startScroll = 0, snapCss = '';

        rail.addEventListener('pointerdown', function (e) {
            /* ล้างสถานะก่อนเช็คเงื่อนไขทุกครั้ง — ถ้าไปล้างหลัง guard แล้วรอบก่อนลากค้างไว้
               (เช่นลากเสร็จแล้วเปลี่ยน filter เป็นชุดที่ไม่ต้องเลื่อน) คลิกถัดไปจะโดนกินฟรี ๆ */
            dragging = false;
            down = false;
            if (e.pointerType !== 'mouse' || e.button !== 0) return;
            if (rail.scrollWidth - rail.clientWidth <= 8) return;   // ไม่มีอะไรให้เลื่อน อย่าไปยุ่งกับคลิก
            down = true;
            startX = e.clientX;
            startScroll = rail.scrollLeft;
        });

        rail.addEventListener('pointermove', function (e) {
            if (!down) return;
            var dx = e.clientX - startX;
            if (!dragging) {
                if (Math.abs(dx) < DRAG_SLOP) return;
                dragging = true;
                /* mandatory snap จะดึงกลับทุกครั้งที่เซ็ต scrollLeft ระหว่างลาก จนขยับไม่ได้เลย
                   ปิดชั่วคราวแล้วค่อยเปิดคืนตอนปล่อย เพื่อให้มันหยุดเข้าที่การ์ดเอง */
                snapCss = rail.style.scrollSnapType;
                rail.style.scrollSnapType = 'none';
                rail.classList.add('sls-dragging');
                /* capture ไว้เพื่อให้ลากเลยขอบ rail แล้วยังตามต่อ และปล่อยนอกจอก็ยังได้ pointerup
                   ห่อ try ไว้เพราะบางกรณี pointer หลุดไปก่อนแล้ว จะ throw ทิ้งการลากทั้งชุด */
                try { rail.setPointerCapture(e.pointerId); } catch (err) {}
            }
            rail.scrollLeft = startScroll - dx;
        });

        function endDrag(e) {
            if (!down) return;
            down = false;
            if (!dragging) return;
            rail.classList.remove('sls-dragging');
            rail.style.scrollSnapType = snapCss;   /* คืนค่า → เบราว์เซอร์ snap เข้าใบใกล้สุดให้เอง */
            try { rail.releasePointerCapture(e.pointerId); } catch (err) {}
            setTimeout(syncNav, 120);   // รอ snap เข้าที่ก่อนค่อยอ่านตำแหน่งจริง
        }
        rail.addEventListener('pointerup', endDrag);
        rail.addEventListener('pointercancel', endDrag);

        /* ลากจบแล้วเบราว์เซอร์ยิง click ตามมาที่การ์ดใต้เมาส์
           ถ้าไม่ดักไว้ = ลากเลื่อนทีไรเด้งไปหน้าสั่งซื้อทุกที (capture phase เพื่อกินก่อนถึง <a>) */
        rail.addEventListener('click', function (e) {
            if (!dragging) return;
            dragging = false;
            e.preventDefault();
            e.stopPropagation();
        }, true);

        /* กันเบราว์เซอร์ลากรูป/ลิงก์ออกมาเป็น ghost image แทนที่จะเลื่อน rail */
        rail.addEventListener('dragstart', function (e) { e.preventDefault(); });
    }

    /* ===== สลับรูปสินค้าในการ์ด (เฉพาะใบที่มีหลายรูป) =====
       ไม่ทำแกลเลอรีแบบปัดในการ์ด เพราะ rail แม่กินการปัดแนวนอนไปแล้ว นิ้วจะแยกไม่ออก
       ว่าปัดดูรูปหรือปัดเปลี่ยนสินค้า — ในการ์ดจึงเป็น "แตะ" อย่างเดียว
         ทุกจอ     : แตะที่รูป = ไปรูปถัดไป (ครบแล้ววนกลับใบแรก)
         เดสก์ท็อป : ชี้เมาส์ค้าง = แอบดูรูปถัดไป เอาเมาส์ออก = กลับรูปที่เลือกไว้ */
    function bindShots(rail) {
        /* ไต่ขึ้นจาก target หากล่องรูปที่มีหลายรูป — ใช้ delegate เพราะ renderRail สร้าง innerHTML ใหม่ทุกครั้ง */
        function shotBox(e) {
            var el = e.target;
            while (el && el !== rail) {
                if (el.classList && el.classList.contains('sls-card-img') &&
                    el.getAttribute('data-shots')) return el;
                el = el.parentNode;
            }
            return null;
        }

        function showShot(box, idx) {
            var imgs = box.querySelectorAll('.sls-shot');
            if (!imgs.length) return;
            idx = (idx % imgs.length + imgs.length) % imgs.length;
            for (var i = 0; i < imgs.length; i++) {
                imgs[i].classList.toggle('sls-shot-on', i === idx);
            }
            var dots = box.querySelectorAll('.sls-shot-dots i');
            for (var d = 0; d < dots.length; d++) {
                dots[d].classList.toggle('sls-on', d === idx);
            }
        }

        /* bubble phase — ตัวดักคลิกหลังลากใน bindDrag อยู่ capture phase จึงกินก่อนได้
           ผลคือลากเลื่อน rail แล้วปล่อยบนรูป จะไม่เผลอสลับรูปให้ */
        rail.addEventListener('click', function (e) {
            var box = shotBox(e);
            if (!box) return;
            var n = box.querySelectorAll('.sls-shot').length;
            box.slsShot = ((box.slsShot || 0) + 1) % n;
            showShot(box, box.slsShot);
        });

        /* pointerover/out ใช้แทน enter/leave เพราะสองตัวหลัง bubble ไม่ได้ delegate ไม่ติด */
        rail.addEventListener('pointerover', function (e) {
            if (e.pointerType !== 'mouse') return;
            var box = shotBox(e);
            if (box) showShot(box, (box.slsShot || 0) + 1);
        });

        rail.addEventListener('pointerout', function (e) {
            if (e.pointerType !== 'mouse') return;
            var box = shotBox(e);
            if (!box) return;
            /* ขยับระหว่างลูก ๆ ในกล่องเดิม (รูป → จุด) ยังไม่นับว่าออก ไม่งั้นภาพกระพริบ */
            if (e.relatedTarget && box.contains(e.relatedTarget)) return;
            showShot(box, box.slsShot || 0);
        });
    }

    /* ===== Data ===== */
    function useMock() {
        state.data = applyCatalog(MOCK_DATA.slice(), false);
        state.mock = true;
        renderMeta(null);
        renderRail();
    }

    function loadData() {
        var cfg = state.cfg;
        if (!cfg.apiUrl) { useMock(); return; }
        if (!state.data.length) renderSkeleton();
        fetch(cfg.apiUrl)
            .then(function (res) {
                if (!res.ok) throw new Error('api ' + res.status);
                return res.json();
            })
            .then(function (json) {
                var rows = mapApiResponse(json);
                if (!rows.length) throw new Error('empty');
                state.data = applyCatalog(rows, true);
                state.mock = false;
                renderMeta(json.updated_at || json.time || json.updated || null);
                renderRail();
            })
            .catch(function () {
                if (!state.mock && state.data.length) return;   // มีราคาเดิมอยู่แล้ว ไม่ต้องถอยไป mock
                useMock();
            });
    }

    /* ===== Init ===== */
    function mount() {
        var host = $('silver-shop') || document.querySelector('[data-silver-shop]');
        if (!host) return null;
        if (!$('slsRail')) host.innerHTML = MARKUP;
        return host;
    }

    function bindEvents() {
        var filters = $('slsFilters');
        filters.addEventListener('click', function (e) {
            var btn = e.target.closest ? e.target.closest('.sls-filter') : null;
            if (!btn || !filters.contains(btn)) return;
            Array.prototype.forEach.call(filters.querySelectorAll('.sls-filter'), function (b) {
                b.classList.remove('sls-active');
            });
            btn.classList.add('sls-active');
            state.filter = btn.getAttribute('data-filter');
            renderRail();
        });

        var rail = $('slsRail');
        rail.addEventListener('scroll', syncNav, { passive: true });
        /* resize แล้วเบราว์เซอร์อาจขยับ scrollLeft เองโดยไม่ยิง scroll event
           รอ frame ถัดไปให้ layout นิ่งก่อนค่อยอ่านค่า ไม่งั้นสถานะลูกศรค้างของรอบก่อน */
        window.addEventListener('resize', function () {
            if (window.requestAnimationFrame) window.requestAnimationFrame(syncNav);
            else syncNav();
        });

        $('slsPrev').addEventListener('click', function () { pageScroll(-1); });
        $('slsNext').addEventListener('click', function () { pageScroll(1); });

        bindDrag(rail);
        bindShots(rail);
    }

    function init() {
        var host = mount();
        if (!host) return;
        state.host = host;
        state.cfg = resolveConfig(host);
        state.useFa = state.cfg.icon === 'fa' ? true
                    : state.cfg.icon === 'svg' ? false
                    : faAvailable();
        /* ไอคอนลูกศรเติมตรงนี้ ไม่ใช่ใน MARKUP เพราะตอน inject markup ยังไม่รู้ว่ามี FA ไหม */
        $('slsPrev').innerHTML = chevIcon('left');
        $('slsNext').innerHTML = chevIcon('right');
        renderMeta(null);
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
