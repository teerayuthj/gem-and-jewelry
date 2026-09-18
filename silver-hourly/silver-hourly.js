/* ===== Silver Hourly History Component =====
   ราคาแท่งเงินออสสิริส 99.99% ที่ระบบเก็บทุกชั่วโมง + เลือกช่วงวันที่
   ทำงานกับ element ที่มี id ขึ้นต้นด้วย sh* (JS ฉีด markup เองทั้งหมด)

   Endpoint:
     GET {apiHost}/api/v1/history/silver/hourly?range=30d
   ตอบกลับเป็น array ของ record (1 record = 1 ชั่วโมง):
     {
       "hour_start": 1789527600,          // unix sec ต้นชั่วโมง — ใช้จัดกลุ่ม/เรียง/วาดกราฟ
       "hour": "2026-09-16 10:00:00",     // (ถ้ามี) รอบชั่วโมงแบบเวลาไทย — ใช้ก่อน hour_start
       "recorded_at": 1789527605,         // unix sec ตอนเครื่องบันทึก
       "bid_thb_kg": 108876.0,            // รับซื้อ บาท/kg
       "offer_thb_kg": 111276.0,          // ขายออกก่อน VAT บาท/kg
       "offer_vat_thb_kg": 119065.0,      // ขายออกรวม VAT 7%
       "bid_usd_oz": 107.67,              // Silver Spot bid
       "offer_usd_oz": 107.71,            // Silver Spot offer
       "vat_rate": 0.07,
       "source_time": "2026-09-16 10:00:03",  // เวลาจากไฟล์ราคา (ไม่ได้แสดง เก็บไว้ตรวจย้อนหลัง)
       "updated_at":  "2026-09-16 10:00:05",  // เวลาเครื่องตอนบันทึก = เวลาที่แสดงบนหน้าจอ
       "comparison": {
         "basis": "previous_business_day",
         "status": "matched",
         "reference_date": "2026-09-15",
         "offer_thb_kg": 110000.0,
         "offer_vat_thb_kg": 117700.0,
         "offer_thb_kg_change": 1276.0,
         "offer_vat_thb_kg_change": 1365.0
       }
     }

   override จากหน้า host ได้ (ต้องวางก่อน silver-hourly.js):
     <script>window.SILVER_HOURLY_CONFIG = { apiHost: 'https://...', defaultRange: 7 };</script>
*/
(function () {
    'use strict';

    // ===== Config =====
    var CFG = window.SILVER_HOURLY_CONFIG || {};
    var API_HOST = CFG.apiHost || 'https://api-price.ausiris.co.th';
    var HOURLY_URL = API_HOST + '/api/v1/history/silver/hourly';
    var PRESETS = CFG.presets || [1, 2, 7, 14, 30];
    var DEFAULT_RANGE = CFG.defaultRange || 7;
    // ค่า range ที่ endpoint รองรับจริง (ค่าอื่นตอบ 400) — ขอค่าที่ครอบช่วงที่เลือก แล้วค่อยกรองฝั่ง client
    var API_RANGES = CFG.apiRanges || [7, 30];
    var MAX_RANGE_DAYS = CFG.maxRangeDays || API_RANGES[API_RANGES.length - 1];
    var PAGE = CFG.pageSize || 48;                  // แสดงทีละ 2 วัน แล้วค่อยกด "แสดงเพิ่ม"
    var REFRESH_MS = CFG.refreshMs || 5 * 60 * 1000;
    var WIDE_PX = 860;                              // ตาราง comparison มีหลายคอลัมน์; จอแคบใช้การ์ด
    var MIN_LOADING_MS = CFG.minLoadingMs == null ? 180 : Math.max(0, Number(CFG.minLoadingMs) || 0);

    // ===== ข้อความทั้งหมด แก้ผ่าน config ได้ ไม่ต้องแตะโค้ด =====
    // description รับ HTML ได้ (<b> <br> <a>) — ตั้งจากหน้า host เท่านั้น ไม่ได้รับ input จากผู้ใช้
    var TEXT = {
        title:      CFG.title      != null ? CFG.title      : 'Silver รายชั่วโมง',
        subtitle:   CFG.subtitle   != null ? CFG.subtitle   : 'แท่งเงินออสสิริส 99.99% · THB/kg',
        desc:       CFG.description != null ? CFG.description : '',   // เว้นว่าง = ไม่แสดงกล่องนี้
        rangeTitle: CFG.rangeTitle != null ? CFG.rangeTitle : 'ช่วงเวลา',
        chartTitle: CFG.chartTitle != null ? CFG.chartTitle : 'ราคาขายรวม VAT 7% ย้อนหลัง',
        listTitle:  CFG.listTitle  != null ? CFG.listTitle  : 'รายการรายชั่วโมง',
        footNote:   CFG.footNote   != null ? CFG.footNote   : 'บันทึกอัตโนมัติทุกชั่วโมง'
    };

    // ===== State =====
    var state = { rangeDays: DEFAULT_RANGE, from: null, to: null, sort: 'desc', limit: PAGE, loading: false };
    var all = [];        // ข้อมูลที่โหลดมาทั้งก้อน (ascending)
    var rows = [];       // เฉพาะช่วงที่เลือก (ascending)
    var cache = {};      // rangeKey -> rows  กันยิงซ้ำตอนสลับ preset ไปมา
    var chartPts = [];
    var inflight = 0;    // ตัดผลลัพธ์ที่มาช้ากว่าคำขอล่าสุดทิ้ง

    // ===== Markup =====
    var MARKUP =
        '<div class="sh-container">' +
            '<div class="sh-hero">' +
                '<div>' +
                    '<div class="sh-hero-t">' + TEXT.title + '</div>' +
                    (TEXT.subtitle ? '<div class="sh-hero-s">' + TEXT.subtitle + '</div>' : '') +
                '</div>' +
                '<div class="sh-live" id="shLive" role="status" aria-live="polite"><i></i><span id="shLiveText">กำลังโหลด</span></div>' +
            '</div>' +

            '<div class="sh-skeleton-cards" id="shCardsSkeleton" hidden aria-hidden="true">' +
                '<div class="sh-skeleton-card sh-skeleton-primary"><i class="sh-skel sh-skel-label"></i><i class="sh-skel sh-skel-price"></i><i class="sh-skel sh-skel-pill"></i></div>' +
                '<div class="sh-skeleton-card"><i class="sh-skel sh-skel-label"></i><i class="sh-skel sh-skel-price"></i><i class="sh-skel sh-skel-note"></i></div>' +
                '<div class="sh-skeleton-card"><i class="sh-skel sh-skel-label"></i><i class="sh-skel sh-skel-price"></i><i class="sh-skel sh-skel-note"></i></div>' +
            '</div>' +

            '<div class="sh-cards" id="shCards">' +
                '<div class="sh-main">' +
                    '<div class="sh-main-top"><span>ราคาขายรวม VAT 7%</span><span id="shTime">—</span></div>' +
                    '<div class="sh-main-p">' +
                        '<b id="shVat">—</b><span class="sh-main-u">บาท/kg</span>' +
                    '</div>' +
                    '<div class="sh-deltas">' +
                        '<span class="sh-pill sh-flat" id="shChg"></span>' +
                        '<span class="sh-pill sh-hour sh-flat" id="shHourChg"></span>' +
                    '</div>' +
                '</div>' +
                '<div class="sh-duo">' +
                    '<div class="sh-mini"><span>ขายออกก่อน VAT</span><b id="shOffer">—</b><small class="sh-mini-delta" id="shOfferChg"></small></div>' +
                    '<div class="sh-mini"><span>ราคารับซื้อ</span><b id="shBid">—</b><small class="sh-mini-note" id="shBidNote">ราคาปัจจุบัน</small></div>' +
                '</div>' +
            '</div>' +

            (TEXT.desc ? '<div class="sh-desc">' + TEXT.desc + '</div>' : '') +

            '<div class="sh-box">' +
                '<div class="sh-range">' +
                    '<span class="sh-range-l">' + TEXT.rangeTitle + '</span>' +
                    '<div class="sh-seg" id="shPresets"></div>' +
                '</div>' +
                '<div class="sh-sum" id="shSum"></div>' +
                '<div class="sh-sum-skeleton" id="shSumSkeleton" hidden aria-hidden="true">' +
                    '<i class="sh-skel"></i><i class="sh-skel"></i><i class="sh-skel"></i>' +
                '</div>' +
                // ช่องวันที่ซ่อนไว้ กด "กำหนดเอง" ถึงจะเผย — คนส่วนใหญ่ใช้แค่ปุ่มลัด
                '<div class="sh-custom" id="shCustom">' +
                    '<label>ตั้งแต่วันที่<input type="date" id="shFrom"></label>' +
                    '<label>ถึงวันที่<input type="date" id="shTo"></label>' +
                '</div>' +
            '</div>' +

            '<div class="sh-chart-skeleton" id="shChartSkeleton" hidden aria-hidden="true">' +
                '<i class="sh-skel sh-skel-chart-title"></i><i class="sh-skel sh-skel-chart"></i>' +
            '</div>' +
            '<div class="sh-chart-card" id="shChartCard">' +
                '<div class="sh-chart-t" id="shChartTitle">' + TEXT.chartTitle + '</div>' +
                '<div class="sh-chart-note" id="shChartNote" hidden></div>' +
                '<svg id="shChart"></svg>' +
                '<div class="sh-tip" id="shTip"></div>' +
            '</div>' +

            '<div class="sh-listhead" id="shListhead"><div><span>' + TEXT.listTitle + '</span>' +
                '<small>แต่ละแถวจับคู่กับเวลาเดียวกันของวันทำการก่อนหน้า</small></div>' +
                '<select id="shSort">' +
                    '<option value="desc">ล่าสุดก่อน</option>' +
                    '<option value="asc">เก่าสุดก่อน</option>' +
                '</select></div>' +
            '<div class="sh-rows-skeleton" id="shRowsSkeleton" hidden aria-hidden="true">' +
                '<div class="sh-skeleton-day"><i class="sh-skel"></i></div>' +
                '<div class="sh-skeleton-row"><i class="sh-skel"></i><i class="sh-skel"></i><i class="sh-skel"></i><i class="sh-skel"></i><i class="sh-skel"></i><i class="sh-skel"></i><i class="sh-skel"></i><i class="sh-skel"></i></div>' +
                '<div class="sh-skeleton-row"><i class="sh-skel"></i><i class="sh-skel"></i><i class="sh-skel"></i><i class="sh-skel"></i><i class="sh-skel"></i><i class="sh-skel"></i><i class="sh-skel"></i><i class="sh-skel"></i></div>' +
                '<div class="sh-skeleton-row"><i class="sh-skel"></i><i class="sh-skel"></i><i class="sh-skel"></i><i class="sh-skel"></i><i class="sh-skel"></i><i class="sh-skel"></i><i class="sh-skel"></i><i class="sh-skel"></i></div>' +
                '<div class="sh-skeleton-row"><i class="sh-skel"></i><i class="sh-skel"></i><i class="sh-skel"></i><i class="sh-skel"></i><i class="sh-skel"></i><i class="sh-skel"></i><i class="sh-skel"></i><i class="sh-skel"></i></div>' +
                '<div class="sh-skeleton-row"><i class="sh-skel"></i><i class="sh-skel"></i><i class="sh-skel"></i><i class="sh-skel"></i><i class="sh-skel"></i><i class="sh-skel"></i><i class="sh-skel"></i><i class="sh-skel"></i></div>' +
            '</div>' +
            '<div id="shRows"></div>' +
            '<div class="sh-state" id="shState" hidden></div>' +
            '<div class="sh-foot" id="shFoot"><span id="shCount"></span><span>' + TEXT.footNote + '</span></div>' +
            '<button class="sh-more" id="shMore" hidden>แสดงเพิ่ม</button>' +
        '</div>';

    function mount() {
        var host = document.getElementById('silver-hourly') || document.querySelector('[data-silver-hourly]');
        if (!host) return false;
        host.innerHTML = MARKUP;
        watchVW();
        return true;
    }

    // ===== full-bleed กันล้นขวา =====
    // CSS ใช้ var(--sh-vw) แทน 100vw เพราะ 100vw รวมความกว้าง scrollbar
    // ป้อนค่าจาก documentElement.clientWidth (ความกว้างจริงที่ไม่รวม scrollbar) ให้แทน
    var lastVW = -1;
    function syncVW() {
        var el = document.querySelector('.sh-container');
        if (!el) return;
        var w = document.documentElement.clientWidth;
        if (w === lastVW) return;           // กัน ResizeObserver วนซ้ำ
        lastVW = w;
        el.style.setProperty('--sh-vw', w + 'px');
    }
    function watchVW() {
        syncVW();
        window.addEventListener('resize', syncVW);
        // scrollbar โผล่/หายตอนเนื้อหาโหลดเสร็จก็ทำให้ clientWidth เปลี่ยน — resize ไม่ยิง
        if (window.ResizeObserver) {
            try { new ResizeObserver(syncVW).observe(document.documentElement); } catch (e) {}
        }
    }

    // ===== Helpers =====
    function $(id) { return document.getElementById(id); }
    function num(v) {
        if (v == null || v === '') return null;
        var n = Number(v);
        return isFinite(n) ? n : null;
    }
    function pad2(n) { return String(n).padStart(2, '0'); }
    function dayKey(d) { return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()); }
    function hhmm(d) { return pad2(d.getHours()) + ':' + pad2(d.getMinutes()); }
    function hhmmss(d) { return hhmm(d) + ':' + pad2(d.getSeconds()); }

    var TH_MON = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    var TH_DOW = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
    function thDate(d) {
        return d.getDate() + ' ' + TH_MON[d.getMonth()] + ' ' + pad2((d.getFullYear() + 543) % 100);
    }
    // ใช้ในหัวข้อคั่นวัน — ปรากฏวันละครั้ง จึงใส่ชื่อวันเต็มได้ไม่รก
    function thDateLong(d) { return TH_DOW[d.getDay()] + 'ที่ ' + d.getDate() + ' ' + TH_MON[d.getMonth()] + ' ' + pad2((d.getFullYear() + 543) % 100); }

    // "10 – 16 ก.ย. 69" / "28 ส.ค. – 16 ก.ย. 69" — ตัดส่วนที่ซ้ำกันออก
    function rangeLabel(a, b) {
        var ya = pad2((a.getFullYear() + 543) % 100), yb = pad2((b.getFullYear() + 543) % 100);
        if (dayKey(a) === dayKey(b)) return thDate(a);
        if (ya === yb && a.getMonth() === b.getMonth()) return a.getDate() + ' – ' + b.getDate() + ' ' + TH_MON[b.getMonth()] + ' ' + yb;
        if (ya === yb) return a.getDate() + ' ' + TH_MON[a.getMonth()] + ' – ' + b.getDate() + ' ' + TH_MON[b.getMonth()] + ' ' + yb;
        return thDate(a) + ' – ' + thDate(b);
    }

    // "2026-09-16 10:00:00" -> Date (local) — parse เองเพราะ Safari ไม่รับรูปแบบนี้
    // ค่าที่ API ส่งมาเป็นเวลาไทยอยู่แล้ว จึงประกอบเป็น Date ท้องถิ่นที่มีตัวเลขเดียวกัน = โชว์ตรงตามที่บันทึกเสมอ
    function parseSql(s) {
        var m = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?/.exec(String(s || ''));
        if (!m) return null;
        return new Date(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +(m[6] || 0));
    }

    // unix sec -> Date ที่มี "ตัวเลขเวลาแบบกรุงเทพ"
    // ถ้าใช้ new Date(sec*1000) เฉย ๆ เวลาจะเลื่อนตาม timezone ของเครื่องผู้ใช้
    // (เปิดจากต่างประเทศจะเห็นคนละชั่วโมง) จึงตรึง Asia/Bangkok ไว้เสมอ
    var BKK_FMT = null;
    function bkkFromUnix(sec) {
        var d = new Date(Number(sec) * 1000);
        try {
            if (!BKK_FMT) {
                BKK_FMT = new Intl.DateTimeFormat('en-GB', {
                    timeZone: 'Asia/Bangkok', hour12: false,
                    year: 'numeric', month: '2-digit', day: '2-digit',
                    hour: '2-digit', minute: '2-digit', second: '2-digit'
                });
            }
            var p = {};
            BKK_FMT.formatToParts(d).forEach(function (x) { p[x.type] = x.value; });
            return new Date(+p.year, +p.month - 1, +p.day, +(p.hour % 24), +p.minute, +p.second);
        } catch (e) {
            return d;   // เบราว์เซอร์เก่าที่ไม่รองรับ timeZone -> ใช้เวลาเครื่อง
        }
    }

    function fmtN(n, d) {
        if (n == null || !isFinite(n)) return '—';
        return Number(n).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
    }
    function fmtSignedN(n, d) {
        if (n == null || !isFinite(n)) return '—';
        var s = n > 0 ? '+' : (n < 0 ? '−' : '');
        return s + Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
    }
    function dirOf(n) { return n == null || !isFinite(n) ? 'sh-flat' : (n > 0 ? 'sh-up' : (n < 0 ? 'sh-down' : 'sh-flat')); }
    function arrowOf(n) { return n > 0 ? '▲' : (n < 0 ? '▼' : ''); }

    function startOfDay(d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0); }
    function endOfDay(d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999); }
    function daysBetween(a, b) { return Math.round((startOfDay(b) - startOfDay(a)) / 86400000); }

    function comparisonFromApi(raw) {
        if (!raw || typeof raw !== 'object') return null;
        var referenceDate = raw.reference_date ? parseSql(raw.reference_date + ' 00:00:00') : null;
        var referenceTs = raw.hour_start != null ? bkkFromUnix(raw.hour_start) : null;
        return {
            basis: raw.basis || 'previous_business_day',
            status: raw.status || 'missing_reference_day',
            referenceDate: referenceDate,
            referenceTs: referenceTs,
            offer: num(raw.offer_thb_kg),
            offerVat: num(raw.offer_vat_thb_kg),
            offerChange: num(raw.offer_thb_kg_change),
            offerChangePct: num(raw.offer_thb_kg_change_pct),
            offerVatChange: num(raw.offer_vat_thb_kg_change),
            offerVatChangePct: num(raw.offer_vat_thb_kg_change_pct)
        };
    }

    function isBusinessDay(d) { return d.getDay() !== 0 && d.getDay() !== 6; }

    // fallback ช่วง deploy ที่ frontend ใหม่อาจเจอ backend เก่า:
    // จับคู่วันทำการก่อนหน้าในข้อมูลที่โหลดมา โดยใช้ชั่วโมง Bangkok เดียวกันเท่านั้น
    function attachLocalComparisons(list) {
        var byDate = {};
        var businessDates = [];

        list.forEach(function (r) {
            var key = dayKey(r.ts);
            if (!byDate[key]) {
                byDate[key] = { date: startOfDay(r.ts), hours: {} };
                if (isBusinessDay(r.ts)) businessDates.push(key);
            }
            byDate[key].hours[r.ts.getHours()] = r;
        });
        businessDates.sort();

        list.forEach(function (r) {
            if (r.comparison) return; // backend เป็น source of truth เมื่อมีข้อมูลแล้ว
            var currentKey = dayKey(r.ts);
            var referenceKey = null;
            for (var i = businessDates.length - 1; i >= 0; i--) {
                if (businessDates[i] < currentKey) { referenceKey = businessDates[i]; break; }
            }
            if (!referenceKey) {
                r.comparison = {
                    basis: 'previous_business_day', status: 'missing_reference_day',
                    referenceDate: null, referenceTs: null,
                    offer: null, offerVat: null, offerChange: null, offerChangePct: null,
                    offerVatChange: null, offerVatChangePct: null
                };
                return;
            }

            var reference = byDate[referenceKey].hours[r.ts.getHours()];
            if (!reference) {
                r.comparison = {
                    basis: 'previous_business_day', status: 'missing_reference_hour',
                    referenceDate: byDate[referenceKey].date, referenceTs: null,
                    offer: null, offerVat: null, offerChange: null, offerChangePct: null,
                    offerVatChange: null, offerVatChangePct: null
                };
                return;
            }

            var offerChange = r.offer == null || reference.offer == null ? null : r.offer - reference.offer;
            var vatChange = r.offerVat == null || reference.offerVat == null ? null : r.offerVat - reference.offerVat;
            r.comparison = {
                basis: 'previous_business_day', status: 'matched',
                referenceDate: byDate[referenceKey].date, referenceTs: reference.ts,
                offer: reference.offer, offerVat: reference.offerVat,
                offerChange: offerChange,
                offerChangePct: reference.offer ? offerChange / reference.offer * 100 : null,
                offerVatChange: vatChange,
                offerVatChangePct: reference.offerVat ? vatChange / reference.offerVat * 100 : null
            };
        });

        return list;
    }

    function comparisonTimeLabel(r) {
        var c = r && r.comparison;
        if (!c || !c.referenceDate) return 'วันทำการก่อนหน้า';
        var hour = c.referenceTs ? c.referenceTs.getHours() : r.ts.getHours();
        return thDate(c.referenceDate) + ' ' + pad2(hour) + ':00';
    }

    // ===== Data =====
    // record ดิบ -> รูปแบบที่ทุกส่วนของ component ใช้
    function normalize(list) {
        if (!Array.isArray(list)) list = (list && list.data) || [];
        var normalized = list.map(function (d) {
            // รอบชั่วโมง: ใช้ hour (เวลาไทยอ่านง่าย) ก่อน ถ้าไม่มีค่อย fallback ไป hour_start (unix)
            var ts = d.hour ? parseSql(d.hour) : null;
            if (!ts && d.hour_start != null) ts = bkkFromUnix(d.hour_start);
            // เวลาเครื่องตอนบันทึก: ใช้ updated_at ก่อน เพราะเป็นเวลาไทยแบบ wall-clock อยู่แล้ว
            // ไม่มีค่อยแปลงจาก recorded_at (unix) โดยตรึงโซนกรุงเทพ
            var rec = parseSql(d.updated_at);
            if (!rec && d.recorded_at != null) rec = bkkFromUnix(d.recorded_at);
            return {
                ts: ts,                           // รอบของชั่วโมง — ใช้จัดกลุ่ม/เรียง/วาดกราฟ
                srcTime: parseSql(d.source_time), // เวลาจากไฟล์ราคา — เก็บไว้เผื่อต้องตรวจย้อนหลัง (ไม่ได้แสดง)
                recordedAt: rec,                  // เวลาที่เครื่องเซิร์ฟเวอร์บันทึก — ตัวที่เอาไปแสดง
                bid: num(d.bid_thb_kg),
                offer: num(d.offer_thb_kg),
                offerVat: num(d.offer_vat_thb_kg),
                bidSpot: num(d.bid_usd_oz),
                offerSpot: num(d.offer_usd_oz),
                vatRate: num(d.vat_rate),
                comparison: comparisonFromApi(d.comparison)
            };
        }).filter(function (r) {
            return r.ts && isFinite(r.ts.getTime()) && r.offerVat != null;
        }).map(function (r) {
            // เวลาที่โชว์ให้ผู้ใช้ = เวลาเครื่องตอนบันทึก ไม่ใช่หัวชั่วโมง
            // (ตัวเก็บอาจทำงานช้ากว่าหัวชั่วโมงหลายสิบนาที ถ้าโชว์ 19:00 ทั้งที่บันทึกตอน 19:44 จะเข้าใจผิด)
            r.shownTs = r.recordedAt || r.srcTime || r.ts;
            return r;
        }).sort(function (a, b) { return a.ts - b.ts; });
        return attachLocalComparisons(normalized);
    }

    function fetchRange(days) {
        var key = days + 'd';
        if (cache[key]) return Promise.resolve(cache[key]);
        return fetch(HOURLY_URL + '?range=' + encodeURIComponent(key))
            .then(function (res) {
                if (!res.ok) throw new Error('HTTP ' + res.status);
                return res.json();
            })
            .then(function (json) {
                var list = normalize(json);
                cache[key] = list;
                return list;
            });
    }

    // API รับเป็น range ย้อนหลังจากปัจจุบัน และรองรับแค่บางค่า
    // -> เลือกค่าที่เล็กที่สุดที่ยังครอบช่วงที่ผู้ใช้เลือก (เช่น เลือก 2 วัน ก็ขอ 7d แล้วกรองเอง)
    function neededDays() {
        var want = Math.max(1, daysBetween(state.from, new Date()) + 1);
        for (var i = 0; i < API_RANGES.length; i++) {
            if (want <= API_RANGES[i]) return API_RANGES[i];
        }
        return API_RANGES[API_RANGES.length - 1];
    }

    function applyFilter() {
        var a = startOfDay(state.from).getTime(), b = endOfDay(state.to).getTime();
        rows = all.filter(function (r) { var t = r.ts.getTime(); return t >= a && t <= b; });
    }

    function showState(kind, msg) {
        var el = $('shState');
        if (!kind) { el.hidden = true; return; }
        el.hidden = false;
        el.className = 'sh-state' + (kind === 'error' ? ' sh-err' : '');
        el.textContent = msg;
    }

    function setDataVisibility(visible) {
        $('shCards').hidden = !visible;
        $('shChartCard').hidden = !visible;
        $('shRows').hidden = !visible;
        $('shFoot').hidden = !visible;
    }

    function setLoadingView(active) {
        var container = document.querySelector('.sh-container');
        state.loading = active;
        if (container) {
            container.classList.toggle('sh-is-loading', active);
            container.setAttribute('aria-busy', active ? 'true' : 'false');
        }
        $('shCardsSkeleton').hidden = !active;
        $('shSumSkeleton').hidden = !active;
        $('shChartSkeleton').hidden = !active;
        $('shRowsSkeleton').hidden = !active;
        $('shSort').disabled = active;
        $('shSum').hidden = active;
        $('shMore').hidden = true;
        if (active) {
            setDataVisibility(false);
            showState(null);
            $('shLiveText').textContent = 'กำลังโหลด…';
        } else {
            setDataVisibility(true);
        }
    }

    function waitForVisibleSkeleton(startedAt, value) {
        var remaining = Math.max(0, MIN_LOADING_MS - (Date.now() - startedAt));
        return new Promise(function (resolve) {
            setTimeout(function () { resolve(value); }, remaining);
        });
    }

    function load(silent) {
        if (silent && state.loading) return;
        var my = ++inflight;
        var startedAt = Date.now();
        if (!silent) {
            setLoadingView(true);
        }
        fetchRange(neededDays()).then(function (list) {
            return silent ? list : waitForVisibleSkeleton(startedAt, list);
        }).then(function (list) {
            if (my !== inflight) return;   // มีคำขอใหม่แซงไปแล้ว
            all = list;
            applyFilter();
            if (!silent) setLoadingView(false);
            if (!rows.length) {
                showState('loading', 'ไม่มีข้อมูลรายชั่วโมงในช่วงวันที่เลือก');
                setDataVisibility(false);
                $('shRows').innerHTML = '';
                $('shChart').innerHTML = '';
                $('shCount').textContent = '';
                $('shMore').hidden = true;
                $('shSum').hidden = true;
                $('shLiveText').textContent = 'ไม่มีข้อมูล';
                return;
            }
            showState(null);
            renderAll();
        }).catch(function (e) {
            if (my !== inflight) return;
            console.warn('[silver-hourly] โหลดข้อมูลไม่สำเร็จ:', e.message, '| url:', HOURLY_URL);
            // background refresh ต้องไม่ล้างราคาที่ผู้ใช้กำลังอ่านอยู่
            if (silent) return;
            setLoadingView(false);
            showState('error', 'ยังดูราคาย้อนหลังรายชั่วโมงไม่ได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง');
            setDataVisibility(false);
            $('shRows').innerHTML = '';
            $('shChart').innerHTML = '';
            $('shCount').textContent = '';
            $('shMore').hidden = true;
            $('shSum').hidden = true;
            $('shLiveText').textContent = 'โหลดไม่สำเร็จ';
        });
    }

    // ===== Render: ราคาล่าสุด =====
    function renderHero() {
        var last = rows[rows.length - 1];
        var prev = rows.length > 1 ? rows[rows.length - 2] : null;
        var hourChange = prev ? last.offerVat - prev.offerVat : null;
        var comparison = last.comparison;
        var comparisonMatched = comparison && comparison.status === 'matched';
        var vatChange = comparisonMatched ? comparison.offerVatChange : null;
        var offerChange = comparisonMatched ? comparison.offerChange : null;
        var vatPct = last.vatRate != null ? Math.round(last.vatRate * 100) : 7;

        $('shTime').textContent = hhmmss(last.shownTs) + ' น. · ' + thDate(last.shownTs);
        $('shVat').textContent = fmtN(last.offerVat, 0);
        $('shOffer').textContent = fmtN(last.offer, 0);
        $('shBid').textContent = fmtN(last.bid, 0);
        $('shBidNote').textContent = 'ราคาปัจจุบัน ณ ' + hhmmss(last.shownTs) + ' น.';
        // ชิปนี้เป็นแค่ตัวบอกสถานะ ไม่ใส่วินาที กันดันหัวข้อจนตกบรรทัดบนมือถือ
        $('shLiveText').textContent = 'อัปเดต ' + hhmm(last.shownTs) + ' น.';

        var lbl = $('shTime').parentNode.firstElementChild;
        if (lbl) lbl.textContent = 'ราคาขายรวม VAT ' + vatPct + '%';

        var dayPill = $('shChg');
        dayPill.hidden = false;
        dayPill.className = 'sh-pill ' + dirOf(vatChange);
        dayPill.textContent = comparisonMatched
            ? arrowOf(vatChange) + ' ' + fmtSignedN(vatChange, 0) +
                (comparison.offerVatChangePct == null ? '' : ' (' + fmtSignedN(comparison.offerVatChangePct, 2) + '%)') +
                ' · เทียบ ' + comparisonTimeLabel(last)
            : 'ไม่มีข้อมูลวันทำการก่อนหน้าในเวลาเดียวกัน';

        var hourPill = $('shHourChg');
        hourPill.hidden = hourChange == null;
        hourPill.className = 'sh-pill sh-hour ' + dirOf(hourChange);
        hourPill.textContent = hourChange == null
            ? ''
            : arrowOf(hourChange) + ' ' + fmtSignedN(hourChange, 0) + ' · จากชั่วโมงก่อน';

        var offerDelta = $('shOfferChg');
        offerDelta.hidden = !comparisonMatched;
        offerDelta.className = 'sh-mini-delta ' + dirOf(offerChange);
        offerDelta.textContent = comparisonMatched
            ? arrowOf(offerChange) + ' ' + fmtSignedN(offerChange, 0) + ' · เทียบ ' + comparisonTimeLabel(last)
            : '';
    }

    // ===== Render: กราฟเส้น (SVG เขียนเอง ไม่พึ่ง library) =====
    function renderChart() {
        var svg = $('shChart');
        var note = $('shChartNote');
        // มีจุดเดียววาดเส้นไม่ได้ (ช่วงที่เพิ่งเริ่มเก็บ) — บอกตรง ๆ ดีกว่าโชว์กราฟเปล่า
        // ใช้ style.display ไม่ใช้ property hidden — SVGElement ไม่รองรับ .hidden ทุกเบราว์เซอร์
        if (rows.length < 2) {
            svg.innerHTML = '';
            svg.style.display = 'none';
            note.hidden = false;
            note.textContent = 'ช่วงนี้มีข้อมูลเพียง ' + rows.length + ' ชั่วโมง — ต้องมีอย่างน้อย 2 ชั่วโมงถึงจะวาดกราฟได้';
            chartPts = [];
            return;
        }
        svg.style.display = '';
        note.hidden = true;
        var W = Math.round(svg.getBoundingClientRect().width) || 900;
        var H = Math.round(svg.getBoundingClientRect().height) || 260;
        var small = W < 480;
        var PL = small ? 48 : 64, PR = small ? 8 : 14, PT = 12, PB = 26;
        var FS = small ? 10 : 11;
        svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);   // viewBox = ขนาดพิกเซลจริง ตัวหนังสือจึงคม

        var vs = rows.map(function (r) { return r.offerVat; });
        var hi = Math.max.apply(null, vs), lo = Math.min.apply(null, vs);
        var padY = (hi - lo) * .12 || 1;
        var top = hi + padY, bot = lo - padY, sp = top - bot;
        var X = function (i) { return PL + (i / Math.max(1, rows.length - 1)) * (W - PL - PR); };
        var Y = function (v) { return PT + (1 - (v - bot) / sp) * (H - PT - PB); };

        var g = '';
        var nY = small ? 3 : 4;
        for (var k = 0; k <= nY; k++) {
            var v = bot + sp * k / nY, y = Y(v);
            g += '<line x1="' + PL + '" y1="' + y + '" x2="' + (W - PR) + '" y2="' + y + '" stroke="#e2e8f0" stroke-width="1"/>' +
                 '<text x="' + (PL - 6) + '" y="' + (y + 3.5) + '" text-anchor="end" font-size="' + FS + '" fill="#64748b">' + fmtN(v, 0) + '</text>';
        }

        // เส้นแบ่งวัน + ป้ายวัน (เว้นระยะให้ป้ายไม่ทับกัน)
        var dayCount = 0, seen = {};
        rows.forEach(function (r) { var k = dayKey(r.ts); if (!seen[k]) { seen[k] = 1; dayCount++; } });
        var maxLbl = Math.max(2, Math.floor((W - PL - PR) / (small ? 64 : 86)));
        var step = Math.max(1, Math.ceil(dayCount / maxLbl));
        var n = 0; seen = {};
        rows.forEach(function (r, i) {
            var k = dayKey(r.ts);
            if (seen[k]) return; seen[k] = 1;
            var x = X(i);
            if (i > 0) g += '<line x1="' + x + '" y1="' + PT + '" x2="' + x + '" y2="' + (H - PB) + '" stroke="#f1f5f9" stroke-width="1"/>';
            if (n % step === 0) {
                var wLbl = small ? 56 : 70;
                var endAlign = x + wLbl > W - PR;   // ป้ายวันสุดท้ายชิดขวา กันล้นขอบ
                g += '<text x="' + (endAlign ? (W - PR) : (x + 3)) + '" y="' + (H - PB + 16) +
                     '" text-anchor="' + (endAlign ? 'end' : 'start') + '" font-size="' + FS + '" fill="#64748b">' + thDate(r.ts) + '</text>';
            }
            n++;
        });

        var line = rows.map(function (r, i) { return (i ? 'L' : 'M') + X(i).toFixed(1) + ' ' + Y(r.offerVat).toFixed(1); }).join(' ');
        var area = line + ' L' + X(rows.length - 1).toFixed(1) + ' ' + (H - PB) + ' L' + X(0).toFixed(1) + ' ' + (H - PB) + ' Z';
        g += '<defs><linearGradient id="shGrad" x1="0" y1="0" x2="0" y2="1">' +
             '<stop offset="0%" stop-color="#3b82f6" stop-opacity=".22"/>' +
             '<stop offset="100%" stop-color="#3b82f6" stop-opacity="0"/></linearGradient></defs>' +
             '<path d="' + area + '" fill="url(#shGrad)"/>' +
             '<path d="' + line + '" fill="none" stroke="#2563eb" stroke-width="2" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>' +
             '<circle cx="' + X(vs.indexOf(hi)) + '" cy="' + Y(hi) + '" r="4" fill="#16a34a"/>' +
             '<circle cx="' + X(vs.indexOf(lo)) + '" cy="' + Y(lo) + '" r="4" fill="#dc2626"/>' +
             '<line class="sh-cross" x1="0" y1="' + PT + '" x2="0" y2="' + (H - PB) + '" stroke="#94a3b8" stroke-width="1" stroke-dasharray="3 3" opacity="0"/>' +
             '<circle class="sh-dot" r="4.5" fill="#2563eb" stroke="#fff" stroke-width="2" opacity="0"/>';
        svg.innerHTML = g;

        chartPts = rows.map(function (r, i) { return { x: X(i), y: Y(r.offerVat), r: r, i: i }; });
    }

    function bindChart() {
        var card = $('shChartCard'), svg = $('shChart'), tip = $('shTip');
        function move(ev) {
            if (!chartPts.length) return;
            var box = svg.getBoundingClientRect();
            var cx = ev.clientX != null ? ev.clientX : (ev.touches && ev.touches[0].clientX);
            var sx = cx - box.left;
            var best = chartPts[0];
            chartPts.forEach(function (p) { if (Math.abs(p.x - sx) < Math.abs(best.x - sx)) best = p; });

            var cross = svg.querySelector('.sh-cross'), dot = svg.querySelector('.sh-dot');
            if (cross) { cross.setAttribute('x1', best.x); cross.setAttribute('x2', best.x); cross.setAttribute('opacity', '1'); }
            if (dot) { dot.setAttribute('cx', best.x); dot.setAttribute('cy', best.y); dot.setAttribute('opacity', '1'); }

            var comparison = best.r.comparison;
            var matched = comparison && comparison.status === 'matched';
            var vatChange = matched ? comparison.offerVatChange : null;
            var offerChange = matched ? comparison.offerChange : null;
            tip.innerHTML = thDate(best.r.shownTs) + ' ' + hhmmss(best.r.shownTs) + ' น.<br>' +
                'รวม VAT <b>' + fmtN(best.r.offerVat, 0) + '</b>' +
                (matched ? ' (' + fmtSignedN(vatChange, 0) + ' / 24 ชม.)' : '') +
                '<br>ขายออก <b>' + fmtN(best.r.offer, 0) + '</b>' +
                (matched ? ' (' + fmtSignedN(offerChange, 0) + ' / 24 ชม.)' : '') +
                ' · รับซื้อ <b>' + fmtN(best.r.bid, 0) + '</b>' +
                (matched ? '<br>เทียบ ' + comparisonTimeLabel(best.r) : '<br>ไม่มีข้อมูลวันอ้างอิงเวลาเดียวกัน');

            var cardBox = card.getBoundingClientRect();
            var half = tip.offsetWidth / 2 + 6;
            var lx = box.left - cardBox.left + best.x;
            lx = Math.max(half, Math.min(cardBox.width - half, lx));   // กันหลุดขอบจอมือถือ
            tip.style.left = lx + 'px';
            tip.style.top = (box.top - cardBox.top + best.y) + 'px';
            tip.style.opacity = '1';
        }
        svg.addEventListener('mousemove', move);
        svg.addEventListener('touchmove', function (e) { move(e); e.preventDefault(); }, { passive: false });
        svg.addEventListener('mouseleave', function () {
            tip.style.opacity = '0';
            var c = svg.querySelector('.sh-cross'), d = svg.querySelector('.sh-dot');
            if (c) c.setAttribute('opacity', '0');
            if (d) d.setAttribute('opacity', '0');
        });
    }

    // ===== Render: รายการรายชั่วโมง =====
    function renderList() {
        var list = rows.slice();
        if (state.sort === 'desc') list.reverse();
        var shown = list.slice(0, state.limit);
        var host = $('shRows');

        // จอกว้าง -> ตารางเปรียบเทียบ VAT/ขายออกกับวันทำการก่อนหน้า
        // จอแคบ  -> การ์ดใบเดียวคั่นด้วยเส้น แตะกางดูราคาอ้างอิง/รับซื้อ/Spot
        var wide = (host.clientWidth || 0) >= WIDE_PX;

        function matched(r) { return r.comparison && r.comparison.status === 'matched'; }
        function deltaHtml(value) {
            return value == null
                ? '<span class="sh-missing">—</span>'
                : '<b class="' + dirOf(value) + '">' + arrowOf(value) + ' ' + fmtSignedN(value, 0) + '</b>';
        }
        function priceCell(r, current, reference, extraClass) {
            var ref = matched(r)
                ? 'อ้างอิง ' + comparisonTimeLabel(r) + ' · ' + fmtN(reference, 0)
                : 'ไม่มีข้อมูลอ้างอิงเวลาเดียวกัน';
            return '<td class="sh-price-cell ' + (extraClass || '') + '">' +
                '<b>' + fmtN(current, 0) + '</b><small>' + ref + '</small></td>';
        }

        // วันที่ซ้ำทุกแถวอ่านยาก -> ยกไปไว้หัวข้อคั่นวัน แถวเหลือแค่เวลา
        var curDay = null;
        function daySep(r, cols) {
            var k = dayKey(r.shownTs);
            if (k === curDay) return '';
            curDay = k;
            return cols
                ? '<tr class="sh-daysep"><td colspan="' + cols + '">' + thDateLong(r.shownTs) + '</td></tr>'
                : '<div class="sh-daysep">' + thDateLong(r.shownTs) + '</div>';
        }

        if (wide) {
            host.innerHTML =
                '<div class="sh-table-scroll"><table class="sh-table"><thead><tr>' +
                    '<th>เวลา</th><th>รวม VAT 7%</th><th>Δ VAT 24 ชม.</th>' +
                    '<th>ขายออกก่อน VAT</th><th>Δ ขายออก 24 ชม.</th><th>รับซื้อ</th>' +
                    '<th>Spot Bid</th><th>Spot Offer</th>' +
                '</tr></thead><tbody>' +
                shown.map(function (r) {
                    var comparison = r.comparison || {};
                    return daySep(r, 8) + '<tr>' +
                        '<td>' + hhmmss(r.shownTs) + '</td>' +
                        priceCell(r, r.offerVat, comparison.offerVat, 'sh-vat-c') +
                        '<td class="sh-delta-cell">' + deltaHtml(comparison.offerVatChange) + '</td>' +
                        priceCell(r, r.offer, comparison.offer, '') +
                        '<td class="sh-delta-cell">' + deltaHtml(comparison.offerChange) + '</td>' +
                        '<td>' + fmtN(r.bid, 0) + '</td>' +
                        '<td class="sh-spot">' + fmtN(r.bidSpot, 2) + '</td>' +
                        '<td class="sh-spot">' + fmtN(r.offerSpot, 2) + '</td>' +
                    '</tr>';
                }).join('') + '</tbody></table></div>';
        } else {
            host.innerHTML = '<div class="sh-list">' + shown.map(function (r) {
                var comparison = r.comparison || {};
                var referenceLabel = matched(r) ? comparisonTimeLabel(r) : 'ไม่มีข้อมูลเวลาเดียวกัน';
                return daySep(r, 0) + '<div class="sh-row">' +
                    '<div class="sh-row-head">' +
                        '<div class="sh-t"><b>' + hhmmss(r.shownTs) + '</b></div>' +
                        '<div class="sh-p">' +
                            '<div class="sh-pr"><span>ขายออก</span><b>' + fmtN(r.offer, 0) + '</b></div>' +
                            '<div class="sh-pr sh-pr-change"><span>Δ ขายออก 24 ชม.</span>' + deltaHtml(comparison.offerChange) + '</div>' +
                            '<div class="sh-pr"><span>รวม VAT</span><b class="sh-vat">' + fmtN(r.offerVat, 0) + '</b></div>' +
                            '<div class="sh-pr sh-pr-change"><span>Δ VAT 24 ชม.</span>' + deltaHtml(comparison.offerVatChange) + '</div>' +
                        '</div>' +
                        '<span class="sh-caret">⌄</span>' +
                    '</div>' +
                    '<div class="sh-row-body">' +
                        '<div class="sh-reference">เทียบ ' + referenceLabel + '</div>' +
                        '<div class="sh-pr"><span>ขายออกวันอ้างอิง</span><b>' + (matched(r) ? fmtN(comparison.offer, 0) : '—') + '</b></div>' +
                        '<div class="sh-pr"><span>รวม VAT วันอ้างอิง</span><b>' + (matched(r) ? fmtN(comparison.offerVat, 0) : '—') + '</b></div>' +
                        '<div class="sh-pr"><span>รับซื้อ THB/kg</span><b>' + fmtN(r.bid, 0) + '</b></div>' +
                        '<div class="sh-pr"><span>Spot bid / offer</span><b>' + fmtN(r.bidSpot, 2) + ' / ' + fmtN(r.offerSpot, 2) + '</b></div>' +
                    '</div>' +
                '</div>';
            }).join('') + '</div>';

            Array.prototype.forEach.call(host.querySelectorAll('.sh-row-head'), function (h) {
                h.addEventListener('click', function () { h.parentNode.classList.toggle('sh-open'); });
            });
        }

        $('shCount').textContent = 'แสดง ' + shown.length.toLocaleString() + ' จาก ' + list.length.toLocaleString() + ' รายการ';
        $('shMore').hidden = shown.length >= list.length;
        $('shMore').textContent = 'แสดงเพิ่ม (เหลืออีก ' + (list.length - shown.length).toLocaleString() + ' ชั่วโมง)';
        syncVW();   // ความสูงเปลี่ยน -> scrollbar อาจโผล่/หาย -> ความกว้างจริงเปลี่ยน
    }

    // บรรทัดสรุปใต้ปุ่มช่วงเวลา — แทนที่ข้อมูลที่เดิมต้องไปอ่านเอาจากช่อง date input
    function renderSummary() {
        var el = $('shSum');
        if (!rows.length) { el.hidden = true; return; }
        el.hidden = false;
        var last = rows[rows.length - 1];
        el.innerHTML =
            '<span>แสดง <b>' + rangeLabel(state.from, state.to) + '</b></span>' +
            '<span class="sh-dot">·</span><span><b>' + rows.length.toLocaleString() + '</b> ชั่วโมง</span>' +
            '<span class="sh-dot">·</span><span>อัปเดตล่าสุด <b>' + hhmmss(last.shownTs) + '</b></span>';
    }

    function renderAll() {
        setDataVisibility(true);
        renderHero();
        renderSummary();
        renderChart();
        renderList();
    }

    // ===== Controls =====
    function setRangeDays(n) {
        var to = new Date();
        state.rangeDays = n;
        state.to = to;
        state.from = new Date(to.getFullYear(), to.getMonth(), to.getDate() - (n - 1));
        state.limit = PAGE;
        $('shFrom').value = dayKey(state.from);
        $('shTo').value = dayKey(state.to);
        markPreset(n);
    }
    // n = จำนวนวันของ preset, null = โหมดกำหนดเอง (ปุ่ม "กำหนดเอง" ติด + เผยช่องวันที่)
    function markPreset(n) {
        Array.prototype.forEach.call($('shPresets').querySelectorAll('button'), function (b) {
            var custom = b.hasAttribute('data-custom');
            b.classList.toggle('sh-on', n == null ? custom : (!custom && +b.getAttribute('data-d') === n));
        });
        $('shCustom').classList.toggle('sh-open', n == null);
    }

    function bindControls() {
        $('shPresets').innerHTML = PRESETS.map(function (n) {
            return '<button data-d="' + n + '">' + (n === 1 ? 'วันนี้' : n + ' วัน') + '</button>';
        }).join('') + '<button data-custom>กำหนดเอง</button>';

        // จำกัดช่วงที่เลือกได้ให้อยู่ในเพดานที่ API ย้อนหลังให้ได้
        var today = new Date();
        var minDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() - (MAX_RANGE_DAYS - 1));
        ['shFrom', 'shTo'].forEach(function (id) {
            $(id).min = dayKey(minDay);
            $(id).max = dayKey(today);
        });

        $('shPresets').addEventListener('click', function (e) {
            var b = e.target.closest ? e.target.closest('button') : null;
            if (!b) return;
            // "กำหนดเอง" แค่เผยช่องวันที่ ยังไม่ต้องโหลดใหม่ (ช่วงยังเป็นค่าเดิม)
            if (b.hasAttribute('data-custom')) { markPreset(null); return; }
            setRangeDays(+b.getAttribute('data-d'));
            load();
        });

        ['shFrom', 'shTo'].forEach(function (id) {
            $(id).addEventListener('change', function () {
                var lo = $('shFrom').min, hi = $('shFrom').max;
                var f = $('shFrom').value, t = $('shTo').value;
                if (!f || !t) return;
                if (f < lo) { f = lo; $('shFrom').value = f; }      // เผื่อเบราว์เซอร์ที่ไม่บังคับ min/max
                if (t > hi) { t = hi; $('shTo').value = t; }
                if (f > t) { $('shTo').value = f; t = f; }
                state.from = parseSql(f + ' 00:00:00');
                state.to = parseSql(t + ' 00:00:00');
                state.limit = PAGE;
                markPreset(null);   // เลือกวันเองแล้ว -> ค้างไว้ที่โหมดกำหนดเอง
                load();
            });
        });

        $('shSort').addEventListener('change', function () {
            state.sort = this.value;
            state.limit = PAGE;
            if (rows.length) renderList();
        });

        $('shMore').addEventListener('click', function () {
            state.limit += PAGE;
            renderList();
        });

        // หมุนจอ / เปลี่ยนขนาด -> วาดกราฟใหม่ + สลับตาราง<->การ์ดตามความกว้างจริง
        var rzT;
        window.addEventListener('resize', function () {
            clearTimeout(rzT);
            rzT = setTimeout(function () { if (rows.length) { renderChart(); renderList(); } }, 180);
        });
    }

    // ===== Init =====
    function init() {
        if (!mount()) return;   // ไม่มี mount point บนหน้านี้
        bindControls();
        bindChart();
        setRangeDays(DEFAULT_RANGE);
        load();

        // ข้อมูลเพิ่มชั่วโมงละครั้ง — ดึงใหม่เงียบ ๆ เป็นระยะ (ข้ามตอนแท็บถูกซ่อน)
        setInterval(function () {
            if (document.hidden) return;
            cache = {};
            load(true);
        }, REFRESH_MS);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
