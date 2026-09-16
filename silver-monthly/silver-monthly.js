/* ===== Silver Monthly History Component =====
   ดึงราคา Silver ย้อนหลังรายเดือน + ราคาล่าสุด + performance panel
   ทำงานกับ element ที่มี id ขึ้นต้นด้วย sm* (ดู silver-monthly-component.html)
*/
(function () {
    'use strict';

    // ===== Config: แก้ host ตรงนี้ที่เดียว =====
    // override จากหน้า host ได้:
    //   <script>window.SILVER_MONTHLY_CONFIG = { apiHost: 'https://...' };</script>  (ต้องวางก่อน silver-monthly.js)
    var CFG = window.SILVER_MONTHLY_CONFIG || {};

    // gateway ใหม่เป็น https ทั้งหมด — ไม่มี URL http เหลือในไฟล์นี้ จึงไม่มีทางเกิด mixed content
    // (หน้า https เรียก api https = ปกติ / หน้า http เรียก api https ก็ได้ เบราว์เซอร์ไม่บล็อกขาขึ้น)
    // CORS ฝั่ง gateway สะท้อน Origin ที่ส่งมา จึงใช้ได้ทั้งหน้า http และ https
    var API_HOST = CFG.apiHost || 'https://api-price.ausiris.co.th';
    var HISTORY_HOST = CFG.historyHost || API_HOST;

    var MONTHLY_PATH = '/api/v1/history/silver/monthly';
    var WEEKLY_PATH = '/api/v1/history/silver/weekly';
    var DAILY_PATH = '/api/v1/history/silver/daily';
    var LATEST_URL = API_HOST + '/api/v1/prices/silver';
    var YESTERDAY_URL = API_HOST + '/api/v1/prices/silver-yesterday';

    var SIDE_LABEL = { bid: 'Bid', offer: 'Offer', bidspot: 'Spot Bid', offerspot: 'Spot Offer' };
    var currentSide = 'offer';
    var currentPeriod = 'monthly';   // 'monthly' | 'weekly'
    var monthlyFull = [];   // ราคารายเดือนทั้งหมด (ascending) สำหรับ headline

    // ===== Markup (JS inject เอง — ผู้ใช้แค่วาง <div id="silver-monthly"></div>) =====
    var MARKUP =
        '<div class="sm-container">' +
            '<div class="sm-page-header">' +
                '<div class="sm-page-title">Silver Monthly History</div>' +
                '<div class="sm-page-sub">ราคาปิดรายเดือนของราคาเงิน</div>' +
            '</div>' +
            '<div class="sm-hero">' +
                '<div class="sm-hero-main">' +
                    '<div class="sm-hero-label">ราคาเงินล่าสุด (Offer)</div>' +
                    '<div class="sm-hero-price" id="smHeroPrice">—</div>' +
                    '<div class="sm-hero-change" id="smHeroChange"></div>' +
                '</div>' +
                '<div class="sm-hero-side">' +
                    '<div class="sm-hero-row"><span>Bid</span><b id="smHeroBid">—</b></div>' +
                    '<div class="sm-hero-row"><span>Spot (Offer)</span><b id="smHeroSpot">—</b></div>' +
                    '<div class="sm-hero-row"><span>อัปเดตเมื่อ</span><b id="smHeroTime">—</b></div>' +
                '</div>' +
            '</div>' +
            '<div class="sm-perf" id="smPerf"></div>' +
            '<div class="sm-controls" id="smControls">' +
                '<div class="sm-field"><label>Period</label>' +
                    '<div class="sm-side-tabs sm-view-tabs" id="smPeriodTabs">' +
                        '<button data-period="weekly">Weekly</button>' +
                        '<button data-period="monthly" class="sm-active">Monthly</button>' +
                    '</div>' +
                '</div>' +
                '<div class="sm-field sm-monthly-field"><label>From</label><select id="smFromMonth"></select></div>' +
                '<div class="sm-field sm-monthly-field"><label>To</label><select id="smToMonth"></select></div>' +
                '<div class="sm-field"><label>Side</label>' +
                    '<div class="sm-side-tabs" id="smSideTabs">' +
                        '<button data-side="bid">Bid</button>' +
                        '<button data-side="offer" class="sm-active">Offer</button>' +
                        '<button data-side="bidspot">Spot Bid</button>' +
                        '<button data-side="offerspot">Spot Offer</button>' +
                    '</div>' +
                '</div>' +
                '<div class="sm-field"><label>&nbsp;</label><button id="smApplyBtn">Apply</button></div>' +
            '</div>' +
            '<div class="sm-summary" id="smSummary"></div>' +
            '<div class="sm-notice" id="smNotice" hidden></div>' +
            '<div class="sm-table-card" id="smTableCard"><table>' +
                '<thead><tr id="smTableHead">' +
                    '<th>Month</th>' +
                    '<th class="sm-num">Close Price</th>' +
                    '<th class="sm-num">Δ Change</th>' +
                    '<th class="sm-num">Δ %</th>' +
                '</tr></thead>' +
                '<tbody id="smTbody"></tbody>' +
            '</table></div>' +
        '</div>';

    // ฉีด markup ลง mount point ถ้ายังไม่มี (รองรับทั้งแบบวาง div ว่าง และแบบวาง markup เอง)
    function mount() {
        if (document.getElementById('smTbody')) { watchVW(); return true; } // มี markup อยู่แล้ว
        var host = document.getElementById('silver-monthly')
                || document.querySelector('[data-silver-monthly]');
        if (host) { host.innerHTML = MARKUP; watchVW(); return true; }
        return false;
    }

    // ===== full-bleed กันล้นขวา =====
    // CSS ใช้ var(--sm-vw) แทน 100vw เพราะ 100vw รวมความกว้าง scrollbar
    // ป้อนค่าจาก documentElement.clientWidth (ความกว้างจริงที่ไม่รวม scrollbar) ให้แทน
    var lastVW = -1;
    function syncVW() {
        var el = document.querySelector('.sm-container');
        if (!el) return;
        var w = document.documentElement.clientWidth;
        if (w === lastVW) return;           // กัน ResizeObserver วนซ้ำ
        lastVW = w;
        el.style.setProperty('--sm-vw', w + 'px');
    }
    function watchVW() {
        syncVW();
        window.addEventListener('resize', syncVW);
        // scrollbar โผล่/หายตอนเนื้อหาโหลดเสร็จก็ทำให้ clientWidth เปลี่ยน — resize ไม่ยิง
        if (window.ResizeObserver) {
            try { new ResizeObserver(syncVW).observe(document.documentElement); } catch (e) {}
        }
    }

    // ===== Fetch =====
    async function fetchJson(url, what) {
        var res = await fetch(url);
        if (!res.ok) throw new Error(what + ' ' + res.status);
        return res.json();
    }
    function fetchLatest() { return fetchJson(LATEST_URL, 'latest'); }
    function fetchYesterday() { return fetchJson(YESTERDAY_URL, 'yesterday'); }

    // ตั้งเมื่อ range ล้มเหลว → เลิกยิง history ซ้ำใน loadHeadline ที่วนทุก 30 วิ
    var historyDown = false;

    function fetchHistory(path, what) { return fetchJson(HISTORY_HOST + path, what); }

    // คืนวันสุดท้ายของเดือน (YYYY-MM -> YYYY-MM-DD) กัน 400 จากเดือนที่ไม่มีวันที่ 31
    function lastDayOf(ym) {
        var parts = ym.split('-').map(Number);
        var last = new Date(parts[0], parts[1], 0).getDate();
        return ym + '-' + String(last).padStart(2, '0');
    }
    function fetchRange() { return fetchHistory(MONTHLY_PATH + '/range', 'range'); }
    function fetchDaily(range) { return fetchHistory(DAILY_PATH + '?range=' + range, 'daily'); }
    function fetchMonthly(from, to) {
        return fetchHistory(MONTHLY_PATH + '?from=' + from + '-01&to=' + lastDayOf(to), 'monthly');
    }
    function fetchWeekly(from, to) {
        return fetchHistory(WEEKLY_PATH + '?from=' + from + '-01&to=' + lastDayOf(to), 'weekly');
    }

    // ===== Helpers =====
    function $(id) { return document.getElementById(id); }
    function monthsBetween(min, max) {
        var out = [];
        var a = min.split('-').map(Number), b = max.split('-').map(Number);
        var y = a[0], m = a[1], ey = b[0], em = b[1];
        while (y < ey || (y === ey && m <= em)) {
            out.push(y + '-' + String(m).padStart(2, '0'));
            m++; if (m > 12) { m = 1; y++; }
        }
        return out;
    }
    function fmt(n) {
        if (n == null) return '—';
        return Number(n).toLocaleString('en-US', { maximumFractionDigits: 2 });
    }
    function fmtSigned(n) {
        if (n == null) return '—';
        var sign = n > 0 ? '+' : (n < 0 ? '−' : '');
        return sign + fmt(Math.abs(n));
    }
    function pctCell(cur, ref) {
        if (ref == null || ref === 0 || cur == null) return { cls: 'sm-flat', text: '—' };
        var pct = (cur - ref) / ref * 100;
        var cls = pct > 0 ? 'sm-up' : (pct < 0 ? 'sm-down' : 'sm-flat');
        var arrow = pct > 0 ? '▲' : (pct < 0 ? '▼' : '');
        return { cls: cls, text: arrow + ' ' + fmtSigned(pct) + '%' };
    }
    var MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    // "2026-03-23".."2026-03-29" -> "23-29 Mar 2026"  (ข้ามเดือน/ปีจัดให้อ่านง่าย)
    function fmtWeekLabel(r) {
        var s = (r.start_date || '').split('-'), e = (r.end_date || '').split('-');
        if (s.length !== 3 || e.length !== 3) return r.period || '';
        var sy = +s[0], sm = +s[1], sd = +s[2], ey = +e[0], em = +e[1], ed = +e[2];
        if (sy === ey && sm === em) return sd + '-' + ed + ' ' + MON[sm - 1] + ' ' + sy;
        if (sy === ey) return sd + ' ' + MON[sm - 1] + ' - ' + ed + ' ' + MON[em - 1] + ' ' + sy;
        return sd + ' ' + MON[sm - 1] + ' ' + sy + ' - ' + ed + ' ' + MON[em - 1] + ' ' + ey;
    }

    // ===== Headline (latest price + performance) =====
    async function loadHeadline() {
        var latest;
        try { latest = await fetchLatest(); } catch (e) { return; }
        var s = latest.Silver || {};
        var offer = Number(s.offer);
        $('smHeroPrice').textContent = fmt(offer);
        $('smHeroBid').textContent = fmt(Number(s.bid));
        $('smHeroSpot').textContent = fmt(Number(s.offerspot));
        $('smHeroTime').textContent = s.time || '—';

        // เปลี่ยนแปลงวันนี้ = ราคาล่าสุด เทียบ ราคาเมื่อวานทางการ
        var yClose = null;
        try {
            var y = await fetchYesterday();
            var yObj = y['Silver-yesterday'] || y.Silver || {};
            yClose = Number(yObj.offer);
            if (!isFinite(yClose)) yClose = null;
        } catch (e) { /* ignore */ }

        // อ้างอิง 7 วัน จาก daily history — ข้ามไปเลยถ้ารู้แล้วว่า history ใช้ไม่ได้
        // (loadHeadline วนทุก 30 วิ ถ้าไม่ข้ามจะยิงทิ้งทุกรอบจน console เต็ม)
        var daily = [];
        if (!historyDown) {
            try { daily = await fetchDaily('7d'); } catch (e) { /* ignore */ }
        }
        var ref7 = daily.length ? daily[0].close_offer : null;

        var chEl = $('smHeroChange');
        if (yClose != null) {
            var ch = offer - yClose;
            var pct = yClose ? ch / yClose * 100 : 0;
            var cls = ch > 0 ? 'sm-up' : (ch < 0 ? 'sm-down' : 'sm-flat');
            var arrow = ch > 0 ? '▲' : (ch < 0 ? '▼' : '');
            chEl.className = 'sm-hero-change ' + cls;
            chEl.textContent = arrow + ' ' + fmtSigned(ch) + ' (' + fmtSigned(pct) + '%) วันนี้';
        } else {
            chEl.textContent = '';
        }

        // Performance panel
        var m = monthlyFull;
        var ref1 = m.length >= 2 ? m[m.length - 2].close_offer : null;
        var ref3 = m.length >= 4 ? m[m.length - 4].close_offer : null;
        var refAll = m.length ? m[0].close_offer : null;
        // ตัดช่วงที่ไม่มีข้อมูลอ้างอิงทิ้ง (เช่น history ล่ม) ดีกว่าโชว์ '—' เรียงกัน
        var defs = [['7 วัน', ref7], ['1 เดือน', ref1], ['3 เดือน', ref3], ['ทั้งหมด', refAll]]
            .filter(function (d) { return d[1] != null; });
        $('smPerf').hidden = !defs.length;
        $('smPerf').innerHTML = defs.map(function (d) {
            var p = pctCell(offer, d[1]);
            return '<div class="sm-perf-item"><div class="sm-lbl">' + d[0] +
                '</div><div class="sm-val ' + p.cls + '">' + p.text + '</div></div>';
        }).join('');
    }

    // ===== Render table + summary =====
    function renderEmpty(message) {
        $('smTbody').innerHTML = '<tr><td colspan="4" class="sm-empty">' + message + '</td></tr>';
        $('smSummary').innerHTML = '';
        syncVW();   // ความสูงเปลี่ยน -> scrollbar อาจโผล่/หาย -> ความกว้างจริงเปลี่ยน
    }

    function renderHistory(rows) {
        var tbody = $('smTbody');
        var summary = $('smSummary');
        var key = 'close_' + currentSide;
        var label = function (r) { return currentPeriod === 'weekly' ? fmtWeekLabel(r) : r.month; };
        var emptyText = currentPeriod === 'weekly'
            ? 'ไม่มีข้อมูลรายสัปดาห์ในช่วงที่เลือก'
            : 'ไม่มีข้อมูลรายเดือนในช่วงที่เลือก';
        var periodLabel = currentPeriod === 'weekly' ? 'Week' : 'Month';

        if (!rows.length) { renderEmpty(emptyText); return; }

        var enriched = rows.map(function (r, i) {
            var prev = i > 0 ? rows[i - 1][key] : null;
            var cur = r[key];
            var change = prev != null ? cur - prev : null;
            var pct = (prev != null && prev !== 0) ? (change / prev) * 100 : null;
            return Object.assign({}, r, { close: cur, change: change, pct: pct });
        });

        // แสดงใหม่สุดขึ้นบน (กลับลำดับเฉพาะตอน render — enriched ยังเรียงเก่า→ใหม่ ไว้คำนวณ summary)
        tbody.innerHTML = enriched.slice().reverse().map(function (r) {
            var dir = r.change == null ? 'sm-flat' : (r.change > 0 ? 'sm-up' : (r.change < 0 ? 'sm-down' : 'sm-flat'));
            var arrow = dir === 'sm-up' ? '▲' : (dir === 'sm-down' ? '▼' : '');
            return '<tr>' +
                '<td class="sm-month">' + label(r) + '</td>' +
                '<td class="sm-num">' + fmt(r.close) + '</td>' +
                '<td class="sm-num">' + fmtSigned(r.change) + '</td>' +
                '<td class="sm-num">' +
                (r.pct == null ? '—' : '<span class="sm-pill ' + dir + '">' + arrow + ' ' + fmtSigned(r.pct) + '%</span>') +
                '</td></tr>';
        }).join('');

        var first = enriched[0], last = enriched[enriched.length - 1];
        var net = last.close - first.close;
        var netPct = first.close !== 0 ? (net / first.close) * 100 : 0;
        var dir = net > 0 ? 'sm-up' : (net < 0 ? 'sm-down' : 'sm-flat');
        var arrow = net > 0 ? '▲' : (net < 0 ? '▼' : '');
        summary.innerHTML =
            '<div class="sm-summary-item"><span class="sm-lbl">Side</span><span class="sm-val">' + SIDE_LABEL[currentSide] + '</span></div>' +
            '<div class="sm-summary-item"><span class="sm-lbl">Start ' + periodLabel + ' (' + label(first) + ')</span><span class="sm-val">' + fmt(first.close) + '</span></div>' +
            '<div class="sm-summary-item"><span class="sm-lbl">End ' + periodLabel + ' (' + label(last) + ')</span><span class="sm-val">' + fmt(last.close) + '</span></div>' +
            '<div class="sm-summary-item"><span class="sm-lbl">Net Change</span><span class="sm-val ' + dir + '">' + arrow + ' ' + fmtSigned(net) + ' (' + fmtSigned(netPct) + '%)</span></div>';
        syncVW();   // ความสูงเปลี่ยน -> scrollbar อาจโผล่/หาย -> ความกว้างจริงเปลี่ยน
    }

    // ปิดเฉพาะส่วน history แล้วขึ้นข้อความแทน — hero + performance ด้านบนยังทำงานต่อ
    function disableHistory(message) {
        ['smControls', 'smSummary', 'smTableCard'].forEach(function (id) {
            var el = $(id);
            if (el) el.hidden = true;
        });
        var note = $('smNotice');
        if (note) { note.textContent = message; note.hidden = false; }
        syncVW();
    }

    // ===== Init =====
    async function init() {
        if (!mount()) return; // ไม่มี mount point บนหน้านี้

        var range = null, rangeErr = null;
        try { range = await fetchRange(); } catch (e) { rangeErr = e; historyDown = true; }

        var hasRange = !!(range && range.min && range.max);
        if (hasRange) {
            try { monthlyFull = await fetchMonthly(range.min, range.max); } catch (e) { monthlyFull = []; }
        }

        // hero/performance ไม่ได้พึ่ง history — เรียกก่อนเช็ค error เสมอ
        loadHeadline();
        setInterval(loadHeadline, 30000);

        if (!hasRange) {
            if (rangeErr) {
                // รายละเอียดทางเทคนิคไว้ใน console — บนหน้าเว็บโชว์ข้อความอ่านง่ายพอ
                console.warn('[silver-monthly] history ใช้ไม่ได้:', rangeErr.message, '| host:', HISTORY_HOST);
            }
            disableHistory(rangeErr
                ? 'ยังดูราคาย้อนหลังไม่ได้ในขณะนี้ — ราคาล่าสุดด้านบนยังอัปเดตตามปกติ'
                : 'ยังไม่มีข้อมูลประวัติรายเดือน');
            return;
        }

        var months = monthsBetween(range.min, range.max);
        var fromSel = $('smFromMonth'), toSel = $('smToMonth');
        var opts = months.map(function (m) { return '<option value="' + m + '">' + m + '</option>'; }).join('');
        fromSel.innerHTML = opts;
        toSel.innerHTML = opts;
        fromSel.value = months[0];
        toSel.value = months[months.length - 1];

        async function apply() {
            if (fromSel.value > toSel.value) { alert('From ต้องไม่มากกว่า To'); return; }
            try {
                var rows = currentPeriod === 'weekly'
                    ? await fetchWeekly(fromSel.value, toSel.value)
                    : await fetchMonthly(fromSel.value, toSel.value);
                renderHistory(rows);
            } catch (e) {
                renderEmpty('โหลดข้อมูลไม่สำเร็จ: ' + e.message);
            }
        }

        Array.prototype.forEach.call($('smPeriodTabs').querySelectorAll('button'), function (btn) {
            btn.addEventListener('click', function () {
                Array.prototype.forEach.call($('smPeriodTabs').querySelectorAll('button'), function (b) { b.classList.remove('sm-active'); });
                btn.classList.add('sm-active');
                currentPeriod = btn.getAttribute('data-period');
                $('smTableHead').firstElementChild.textContent =
                    currentPeriod === 'weekly' ? 'Week' : 'Month';
                apply();
            });
        });
        $('smApplyBtn').addEventListener('click', apply);
        Array.prototype.forEach.call($('smSideTabs').querySelectorAll('button'), function (btn) {
            btn.addEventListener('click', function () {
                Array.prototype.forEach.call($('smSideTabs').querySelectorAll('button'), function (b) { b.classList.remove('sm-active'); });
                btn.classList.add('sm-active');
                currentSide = btn.getAttribute('data-side');
                apply();
            });
        });

        apply();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
