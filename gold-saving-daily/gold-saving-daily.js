/* ===== ประกาศราคาออมทอง (Gold Saving Daily) Component =====
   พอร์ตจาก mock.html แบบ A ("ประกาศ") — ไม่มีแถบสถานะ (statusBar) แล้ว
   สถานะของราคาบอกด้วยชิปเล็กใต้หัวข้อแทน

   กติกาสำคัญ: ใช้เฉพาะ "ราคาปิดที่บันทึก" (effective_price / entry / latest_price)
   ไม่อ่าน reference_* ซึ่งเป็นราคาสมาคมสด และไม่ใช้เวลาปัจจุบันของ browser ตัดสินใจอะไรทั้งสิ้น
   วันที่ตัวใหญ่ = วันที่ของ record ราคาเสมอ · เวลาแสดง 17:00 น. ตายตัวจาก effective_price_time

   mount: <div id="gold-saving-daily"></div>  (หรือ [data-gold-saving-daily])
   override: window.GOLD_SAVING_DAILY_CONFIG (ต้องวางก่อนไฟล์นี้)
*/
(function () {
    'use strict';

    var CFG = window.GOLD_SAVING_DAILY_CONFIG || {};

    // gateway เป็น https ทั้งหมด — ไม่มี URL http ในไฟล์นี้ จึงไม่มีทางเกิด mixed content
    // CORS ฝั่ง gateway สะท้อน Origin ที่ส่งมา จึงเรียกตรงจากหน้า AEM ได้ ไม่ต้องมี proxy
    var API_HOST = CFG.apiHost || 'https://api-price.ausiris.co.th';
    var CTX_URL = API_HOST + '/api/v1/gold-saving';
    var MONTHLY_URL = API_HOST + '/api/v1/gold-saving/monthly';

    var FIXED_PRICE_TIME = '17:00';                 // fallback ถ้า API ไม่ส่ง effective_price_time
    var PRESETS = CFG.presets || [1000, 2000, 5000, 10000];
    var REFRESH_MS = CFG.refreshMs == null ? 300000 : CFG.refreshMs;   // 0 = ไม่ refresh
    var MAX_AMOUNT = 10000000;

    var TEXT = {
        title: CFG.title || 'ประกาศราคาทองคำ สำหรับลูกค้าออมทองออสสิริส',
        customTitle: CFG.customTitle || 'สำหรับลูกค้าที่ออมทองตามยอดที่กำหนดเอง',
        customLabel: CFG.customLabel || 'กรอกยอดออมของคุณ',
        footNote: CFG.footNote || 'คำนวณจากราคาปิดที่บันทึกล่าสุด ณ เวลา 17:00 น.',
        errorText: CFG.errorText || 'ยังโหลดราคาประกาศไม่ได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง'
    };

    var TH_MONTH = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
                    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
    var TH_MONTH_ABBR = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
                         'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    var TH_DAY = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];

    var state = {
        ctx: null,       // ผลจาก /gold-saving
        days: null,      // eligible_purchase_days จาก /gold-saving/monthly
        amount: 0,
        loaded: false
    };
    state.amount = parseAmount(CFG.defaultAmount == null ? 3000 : CFG.defaultAmount) || 3000;

    /* ================= helpers ================= */
    function $(id) { return document.getElementById(id); }
    function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }

    // ทุกฟังก์ชันวันที่แกะจาก string 'YYYY-MM-DD' ตรง ๆ (UTC) — ไม่ผ่าน timezone ของเครื่อง
    function thDate(iso) {
        if (!iso) return '—';
        var p = iso.split('-'), d = new Date(Date.UTC(+p[0], +p[1] - 1, +p[2]));
        return 'วัน' + TH_DAY[d.getUTCDay()] + ' ที่ ' + (+p[2]) + ' ' + TH_MONTH[+p[1] - 1] + ' ' + (+p[0] + 543);
    }
    function thDateShort(iso) {
        if (!iso) return '—';
        var p = iso.split('-');
        return (+p[2]) + ' ' + TH_MONTH_ABBR[+p[1] - 1] + ' ' + ((+p[0] + 543) % 100);
    }
    function thDayShort(iso) {
        if (!iso) return '—';
        var p = iso.split('-'), d = new Date(Date.UTC(+p[0], +p[1] - 1, +p[2]));
        return TH_DAY[d.getUTCDay()] + ' ' + thDateShort(iso);
    }
    function thMonthYear(month) {
        var p = (month || '').split('-');
        return TH_MONTH[(+p[1] || 1) - 1] + ' ' + (+p[0] + 543);
    }
    function money(n) { return n == null ? '—' : Number(n).toLocaleString('en-US'); }
    function num2(n) {
        return n == null ? '—' : Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    function gold(n) { return n == null ? '—' : Number(n).toFixed(6); }
    function round(v, p) { var m = Math.pow(10, p); return Math.round(v * m) / m; }
    function parseAmount(value) {
        var digits = String(value == null ? '' : value).replace(/[^0-9]/g, '');
        var n = parseInt(digits, 10);
        return isNaN(n) ? 0 : Math.min(n, MAX_AMOUNT);
    }
    // ใช้ตอน /monthly ล่ม — จันทร์–ศุกร์ทั้งเดือน ตรงกับ eligible_purchase_days ฝั่ง Rust
    function weekdaysIn(month) {
        var p = (month || '').split('-'), y = +p[0], m = +p[1], n = 0;
        if (!y || !m) return 0;
        var d = new Date(Date.UTC(y, m - 1, 1));
        while (d.getUTCMonth() === m - 1) {
            var w = d.getUTCDay();
            if (w !== 0 && w !== 6) n++;
            d.setUTCDate(d.getUTCDate() + 1);
        }
        return n;
    }

    /* =====================================================================
       กติกาเลือกราคา
       saved   = มีราคาของวันที่ขอแล้ว              -> ใช้ราคาที่บันทึกของวันนั้น
       carried = ยังไม่มีราคาของวันที่ขอ            -> คงราคาบันทึกล่าสุดไว้
       weekend = เสาร์–อาทิตย์                      -> ใช้ราคาปิดวันศุกร์
       missing = ไม่เคยมีราคาบันทึกเลย              -> ไม่ fallback ไปราคา realtime
       ===================================================================== */
    function resolve(ctx) {
        // effective_price คือ contract ใหม่ของ backend; entry/latest_price รองรับ API เวอร์ชันเดิม
        var price = ctx.effective_price || ctx.entry || ctx.latest_price || null;
        var isCurrentDate = !!price && price.price_date === ctx.requested_date;
        return {
            mode: !price ? 'missing' : !ctx.is_purchase_day ? 'weekend' : isCurrentDate ? 'saved' : 'carried',
            isCarried: !!price && !isCurrentDate,
            fixedTime: ctx.effective_price_time || FIXED_PRICE_TIME,
            priceDate: price ? price.price_date : null,
            selling: price ? price.selling_price : null,
            buyback: price ? price.buyback_price : null
        };
    }

    // สูตรตรงกับฝั่ง Rust (daily_allocations / calculate_plan)
    function plan(amount, selling, days) {
        if (!amount || !days) return null;
        var daily = Math.floor(amount * 100 / days) / 100;
        return {
            daily: daily,
            goldPerDay: selling ? round(daily / selling, 6) : null,
            goldMonth: selling ? round(amount / selling, 6) : null
        };
    }

    /* ================= markup (JS inject เอง — host แค่วาง div) ================= */
    function presetRow(amount) {
        return '<tr data-amt="' + amount + '">' +
            '<td>' + money(amount) + '<span class="gsd-sub">บาท/เดือน</span></td>' +
            '<td class="gsd-num"><span class="gsd-sk" data-c="daily">00.00</span></td>' +
            '<td><span class="gsd-sk" data-c="gday">0.000000</span></td>' +
            '<td><span class="gsd-sk" data-c="gmonth">0.000000</span></td>' +
            '</tr>';
    }

    function markup() {
        return '<div class="gsd-container gsd-loading">' +
            '<div class="gsd-head">' +
                '<h2 class="gsd-title">' + TEXT.title + '<br>' +
                    'ณ เวลา <span class="gsd-at" id="gsdTime">—</span></h2>' +
                '<p class="gsd-date"><span id="gsdDateMain" class="gsd-sk">วันศุกร์ ที่ 00 กันยายน 2569</span>' +
                    '<span class="gsd-today" id="gsdChip" hidden></span></p>' +
            '</div>' +

            '<div class="gsd-error" id="gsdError" hidden></div>' +

            '<div class="gsd-pair" aria-live="polite">' +
                '<div class="gsd-pcard gsd-buy">' +
                    '<div class="gsd-pcard-cap">ซื้อคืน <small>บาทละ</small></div>' +
                    '<div class="gsd-pcard-body">' +
                        '<span class="gsd-pcard-val gsd-num gsd-sk" id="gsdBuyback">00,000</span>' +
                        '<span class="gsd-pcard-unit">บาท</span></div>' +
                '</div>' +
                '<div class="gsd-pcard gsd-sell">' +
                    '<div class="gsd-pcard-cap">ขายออก <small>บาทละ</small></div>' +
                    '<div class="gsd-pcard-body">' +
                        '<span class="gsd-pcard-val gsd-num gsd-sk" id="gsdSelling">00,000</span>' +
                        '<span class="gsd-pcard-unit">บาท</span></div>' +
                '</div>' +
            '</div>' +

            '<div class="gsd-table"><table>' +
                '<thead><tr>' +
                    '<th>ออมเดือนละ</th><th>ซื้อทอง<br>วันละ (บาท)</th>' +
                    '<th>ทองที่ได้<br>ต่อวัน</th><th>ทองที่ได้<br>ทั้งเดือน</th>' +
                '</tr></thead>' +
                '<tbody id="gsdBody">' +
                    PRESETS.map(presetRow).join('') +
                    '<tr class="gsd-user-row" data-user>' +
                        '<td><span class="gsd-you">ยอดของคุณ</span>' +
                            '<span class="gsd-num" data-c="amount">' + money(state.amount) + '</span>' +
                            '<span class="gsd-sub">บาท/เดือน</span></td>' +
                        '<td class="gsd-num"><span class="gsd-sk" data-c="daily">00.00</span></td>' +
                        '<td><span class="gsd-sk" data-c="gday">0.000000</span></td>' +
                        '<td><span class="gsd-sk" data-c="gmonth">0.000000</span></td>' +
                    '</tr>' +
                '</tbody>' +
            '</table></div>' +

            '<p class="gsd-foot-note" id="gsdFoot">' + TEXT.footNote + '</p>' +

            '<div class="gsd-custom">' +
                '<h3>' + TEXT.customTitle + '</h3>' +
                '<div class="gsd-inputrow">' +
                    '<span>' + TEXT.customLabel + '</span>' +
                    '<input id="gsdAmount" type="text" inputmode="numeric" autocomplete="off" maxlength="10"' +
                        ' aria-label="' + esc(TEXT.customLabel) + '" value="' + money(state.amount) + '">' +
                    '<em>บาท/เดือน</em>' +
                '</div>' +
                '<div class="gsd-chips" id="gsdChips">' + PRESETS.map(function (a) {
                    return '<button type="button" data-amt="' + a + '"' +
                        (state.amount === a ? ' class="gsd-on"' : '') + '>' + money(a) + '</button>';
                }).join('') + '</div>' +
                '<p class="gsd-custom-help" id="gsdHelp">ผลคำนวณแสดงในแถว “ยอดของคุณ” ในตารางด้านบน</p>' +
            '</div>' +
        '</div>';
    }

    /* ================= full-bleed กันล้นขวา ================= */
    // CSS ใช้ var(--gsd-vw) แทน 100vw เพราะ 100vw รวมความกว้าง scrollbar
    var lastVW = -1;
    function syncVW() {
        var el = document.querySelector('.gsd-container');
        if (!el) return;
        var w = document.documentElement.clientWidth;
        if (w === lastVW) return;           // กัน ResizeObserver วนซ้ำ
        lastVW = w;
        el.style.setProperty('--gsd-vw', w + 'px');
    }
    function watchVW() {
        syncVW();
        window.addEventListener('resize', syncVW);
        // scrollbar โผล่/หายตอนเนื้อหาโหลดเสร็จก็ทำให้ clientWidth เปลี่ยน — resize ไม่ยิง
        if (window.ResizeObserver) {
            try { new ResizeObserver(syncVW).observe(document.documentElement); } catch (e) {}
        }
    }

    /* ================= render ================= */
    function cell(row, key) { return row.querySelector('[data-c="' + key + '"]'); }

    function fillRow(row, amount, selling, days) {
        var p = plan(amount, selling, days);
        var base = plan(amount, null, days);
        cell(row, 'daily').textContent = num2(base ? base.daily : null);
        setGold(cell(row, 'gday'), p ? p.goldPerDay : null);
        setGold(cell(row, 'gmonth'), p ? p.goldMonth : null);
    }
    function setGold(el, v) {
        el.textContent = v == null ? '—' : gold(v);
        el.classList.toggle('gsd-g', v != null);
        el.classList.toggle('gsd-num', v != null);
        el.classList.toggle('gsd-offv', v == null);
    }

    // อัปเดตเฉพาะแถว "ยอดของคุณ" — เรียกตอนพิมพ์ ไม่แตะส่วนอื่นเพื่อไม่ให้ input เสีย focus
    function renderUserRow() {
        var row = document.querySelector('.gsd-user-row');
        if (!row) return;
        var view = state.ctx ? resolve(state.ctx) : null;
        cell(row, 'amount').textContent = money(state.amount);
        fillRow(row, state.amount, view ? view.selling : null, days());
        var chips = document.querySelectorAll('#gsdChips button');
        Array.prototype.forEach.call(chips, function (b) {
            b.classList.toggle('gsd-on', parseInt(b.getAttribute('data-amt'), 10) === state.amount);
        });
    }

    function days() {
        if (state.days) return state.days;
        var month = state.ctx ? (state.ctx.requested_date || '').slice(0, 7) : '';
        return weekdaysIn(month);
    }

    function render() {
        var container = document.querySelector('.gsd-container');
        if (!container) return;

        if (!state.ctx) {                 // โหลด context ไม่สำเร็จ
            $('gsdError').textContent = TEXT.errorText;
            $('gsdError').hidden = false;
            container.classList.remove('gsd-loading');
            $('gsdTime').textContent = '—';
            $('gsdDateMain').textContent = '—';
            $('gsdChip').hidden = true;
            $('gsdBuyback').textContent = '—';
            $('gsdSelling').textContent = '—';
            Array.prototype.forEach.call(document.querySelectorAll('#gsdBody tr'), function (row) {
                var amt = row.hasAttribute('data-user') ? state.amount : parseInt(row.getAttribute('data-amt'), 10);
                fillRow(row, amt, null, days());
            });
            return;
        }

        var ctx = state.ctx;
        var view = resolve(ctx);
        var d = days();
        $('gsdError').hidden = true;

        // หัวข้อ + วันที่ — วันที่ตัวใหญ่คือวันที่ของ record ราคา ไม่ใช่วันที่ปฏิทิน
        $('gsdTime').textContent = view.priceDate ? view.fixedTime + ' น.' : 'ยังไม่มีราคาที่บันทึก';
        $('gsdDateMain').textContent = view.priceDate ? thDate(view.priceDate) : thDate(ctx.requested_date);

        var chip = $('gsdChip');
        if (!view.priceDate) {
            chip.textContent = 'ยังไม่มีราคาที่บันทึกในระบบ';
            chip.hidden = false;
        } else if (view.isCarried) {
            chip.textContent = 'วันนี้ ' + thDayShort(ctx.requested_date) +
                (view.mode === 'weekend' ? ' · ใช้ราคาวันศุกร์' : ' · รอราคาบันทึกของวันใหม่');
            chip.hidden = false;
        } else {
            chip.hidden = true;
        }

        $('gsdBuyback').textContent = money(view.buyback);
        $('gsdSelling').textContent = money(view.selling);

        Array.prototype.forEach.call(document.querySelectorAll('#gsdBody tr'), function (row) {
            var amt = row.hasAttribute('data-user') ? state.amount : parseInt(row.getAttribute('data-amt'), 10);
            if (row.hasAttribute('data-user')) cell(row, 'amount').textContent = money(state.amount);
            fillRow(row, amt, view.selling, d);
        });

        $('gsdFoot').innerHTML = 'หมายเหตุ : เดือน' + thMonthYear((ctx.requested_date || '').slice(0, 7)) +
            ' เฉลี่ยซื้อทอง ' + d + ' วันทำการ<br>' + TEXT.footNote;
        $('gsdHelp').textContent = 'ผลคำนวณแสดงในแถว “ยอดของคุณ” ในตารางด้านบน · ' + d + ' วันทำการ';

        state.loaded = true;
        container.classList.remove('gsd-loading');
    }

    /* ================= events ================= */
    function bind() {
        var input = $('gsdAmount');
        input.addEventListener('input', function () {
            state.amount = parseAmount(input.value);
            input.value = state.amount ? money(state.amount) : '';
            renderUserRow();
        });
        input.addEventListener('blur', function () {
            if (state.amount < 1) state.amount = 1;
            input.value = money(state.amount);
            renderUserRow();
        });
        $('gsdChips').addEventListener('click', function (e) {
            var btn = e.target.closest('button[data-amt]');
            if (!btn) return;
            state.amount = parseInt(btn.getAttribute('data-amt'), 10);
            input.value = money(state.amount);
            renderUserRow();
        });
    }

    /* ================= data ================= */
    function getJSON(url) {
        return fetch(url, { cache: 'no-store' }).then(function (r) {
            if (!r.ok) throw new Error('HTTP ' + r.status);
            return r.json();
        });
    }

    function load() {
        return Promise.all([
            getJSON(CTX_URL).catch(function (e) {
                console.warn('[gold-saving-daily] โหลด context ไม่สำเร็จ:', e.message);
                return null;
            }),
            // ต้องการแค่ eligible_purchase_days — ไม่ขึ้นกับยอดออม จึงไม่ต้องยิงซ้ำตอนพิมพ์
            getJSON(MONTHLY_URL).catch(function () { return null; })
        ]).then(function (res) {
            if (res[0]) state.ctx = res[0];
            if (res[1] && res[1].eligible_purchase_days) state.days = res[1].eligible_purchase_days;
            render();
        });
    }

    /* ================= boot ================= */
    function init() {
        var host = document.getElementById('gold-saving-daily') || document.querySelector('[data-gold-saving-daily]');
        if (!host) return;
        host.innerHTML = markup();
        watchVW();
        bind();
        load();
        if (REFRESH_MS > 0) setInterval(load, REFRESH_MS);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
