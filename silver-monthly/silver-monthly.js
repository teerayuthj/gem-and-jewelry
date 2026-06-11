/* ===== Silver Monthly History Component =====
   ดึงราคา Silver ย้อนหลังรายเดือน + ราคาล่าสุด + performance panel
   ทำงานกับ element ที่มี id ขึ้นต้นด้วย sm* (ดู silver-monthly-component.html)
*/
(function () {
    'use strict';

    // ===== Config: แก้ host ตรงนี้ที่เดียว =====
    var API_HOST = 'http://27.254.3.9';

    var MONTHLY_BASE = API_HOST + '/api/v1/history/silver/monthly';
    var LATEST_URL = API_HOST + '/api/v1/prices/silver';
    var YESTERDAY_URL = API_HOST + '/api/v1/prices/silver-yesterday';
    var DAILY_URL = API_HOST + '/api/v1/history/silver/daily';

    var SIDE_LABEL = { bid: 'Bid', offer: 'Offer', bidspot: 'Spot Bid', offerspot: 'Spot Offer' };
    var currentSide = 'offer';
    var monthlyFull = [];   // ราคารายเดือนทั้งหมด (ascending) สำหรับ headline

    // ===== Markup (JS inject เอง — ผู้ใช้แค่วาง <div id="silver-monthly"></div>) =====
    var MARKUP =
        '<div class="sm-container">' +
            '<div class="sm-page-header">' +
                '<div class="sm-page-title">Silver Monthly History</div>' +
                '<div class="sm-page-sub">ราคาปิดสิ้นเดือนและการเปลี่ยนแปลง</div>' +
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
            '<div class="sm-controls">' +
                '<div class="sm-field"><label>From</label><select id="smFromMonth"></select></div>' +
                '<div class="sm-field"><label>To</label><select id="smToMonth"></select></div>' +
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
            '<div class="sm-table-card"><table>' +
                '<thead><tr>' +
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
        if (document.getElementById('smTbody')) return true; // มี markup อยู่แล้ว
        var host = document.getElementById('silver-monthly')
                || document.querySelector('[data-silver-monthly]');
        if (host) { host.innerHTML = MARKUP; return true; }
        return false;
    }

    // ===== Fetch =====
    async function fetchRange() {
        var res = await fetch(MONTHLY_BASE + '/range');
        if (!res.ok) throw new Error('range ' + res.status);
        return res.json();
    }
    async function fetchLatest() {
        var res = await fetch(LATEST_URL);
        if (!res.ok) throw new Error('latest ' + res.status);
        return res.json();
    }
    async function fetchYesterday() {
        var res = await fetch(YESTERDAY_URL);
        if (!res.ok) throw new Error('yesterday ' + res.status);
        return res.json();
    }
    async function fetchDaily(range) {
        var res = await fetch(DAILY_URL + '?range=' + range);
        if (!res.ok) throw new Error('daily ' + res.status);
        return res.json();
    }
    // คืนวันสุดท้ายของเดือน (YYYY-MM -> YYYY-MM-DD) กัน 400 จากเดือนที่ไม่มีวันที่ 31
    function lastDayOf(ym) {
        var parts = ym.split('-').map(Number);
        var last = new Date(parts[0], parts[1], 0).getDate();
        return ym + '-' + String(last).padStart(2, '0');
    }
    async function fetchMonthly(from, to) {
        var res = await fetch(MONTHLY_BASE + '?from=' + from + '-01&to=' + lastDayOf(to));
        if (!res.ok) throw new Error('monthly ' + res.status);
        return res.json();
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

        // อ้างอิง 7 วัน จาก daily history
        var daily = [];
        try { daily = await fetchDaily('7d'); } catch (e) { /* ignore */ }
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
        var defs = [['7 วัน', ref7], ['1 เดือน', ref1], ['3 เดือน', ref3], ['ทั้งหมด', refAll]];
        $('smPerf').innerHTML = defs.map(function (d) {
            var p = pctCell(offer, d[1]);
            return '<div class="sm-perf-item"><div class="sm-lbl">' + d[0] +
                '</div><div class="sm-val ' + p.cls + '">' + p.text + '</div></div>';
        }).join('');
    }

    // ===== Render table + summary =====
    function render(rows) {
        var tbody = $('smTbody');
        var summary = $('smSummary');
        var key = 'close_' + currentSide;

        if (!rows.length) {
            tbody.innerHTML = '<tr><td colspan="4" class="sm-empty">ไม่มีข้อมูลในช่วงที่เลือก</td></tr>';
            summary.innerHTML = '';
            return;
        }

        var enriched = rows.map(function (r, i) {
            var prev = i > 0 ? rows[i - 1][key] : null;
            var cur = r[key];
            var change = prev != null ? cur - prev : null;
            var pct = (prev != null && prev !== 0) ? (change / prev) * 100 : null;
            return Object.assign({}, r, { close: cur, change: change, pct: pct });
        });

        tbody.innerHTML = enriched.map(function (r) {
            var dir = r.change == null ? 'sm-flat' : (r.change > 0 ? 'sm-up' : (r.change < 0 ? 'sm-down' : 'sm-flat'));
            var arrow = dir === 'sm-up' ? '▲' : (dir === 'sm-down' ? '▼' : '');
            return '<tr>' +
                '<td class="sm-month">' + r.month + '</td>' +
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
            '<div class="sm-summary-item"><span class="sm-lbl">Start (' + first.month + ')</span><span class="sm-val">' + fmt(first.close) + '</span></div>' +
            '<div class="sm-summary-item"><span class="sm-lbl">End (' + last.month + ')</span><span class="sm-val">' + fmt(last.close) + '</span></div>' +
            '<div class="sm-summary-item"><span class="sm-lbl">Net Change</span><span class="sm-val ' + dir + '">' + arrow + ' ' + fmtSigned(net) + ' (' + fmtSigned(netPct) + '%)</span></div>';
    }

    // ===== Init =====
    async function init() {
        if (!mount()) return; // ไม่มี mount point บนหน้านี้
        var range;
        try {
            range = await fetchRange();
        } catch (e) {
            $('smTbody').innerHTML = '<tr><td colspan="4" class="sm-empty">โหลดข้อมูลไม่สำเร็จ: ' + e.message + '</td></tr>';
            return;
        }
        if (!range.min || !range.max) {
            $('smTbody').innerHTML = '<tr><td colspan="4" class="sm-empty">ยังไม่มีข้อมูลประวัติรายเดือน</td></tr>';
            return;
        }

        var months = monthsBetween(range.min, range.max);
        var fromSel = $('smFromMonth'), toSel = $('smToMonth');
        var opts = months.map(function (m) { return '<option value="' + m + '">' + m + '</option>'; }).join('');
        fromSel.innerHTML = opts;
        toSel.innerHTML = opts;
        fromSel.value = months[0];
        toSel.value = months[months.length - 1];

        try { monthlyFull = await fetchMonthly(range.min, range.max); } catch (e) { monthlyFull = []; }
        loadHeadline();
        setInterval(loadHeadline, 30000);

        async function apply() {
            if (fromSel.value > toSel.value) { alert('From ต้องไม่มากกว่า To'); return; }
            try {
                var rows = await fetchMonthly(fromSel.value, toSel.value);
                render(rows);
            } catch (e) {
                $('smTbody').innerHTML = '<tr><td colspan="4" class="sm-empty">โหลดข้อมูลไม่สำเร็จ: ' + e.message + '</td></tr>';
            }
        }

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
