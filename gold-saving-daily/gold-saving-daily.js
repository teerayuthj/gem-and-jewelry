/* ===== ประกาศราคาออมทอง (Gold Saving Daily) Component =====
   หัวประกาศ = "วันที่ · เวลา" บรรทัดเดียว เป็นตัวใหญ่สุดของ component
   ไม่มีแถบสถานะและไม่มีชิปบอกสถานะ — วันที่ของ record ที่ขึ้นหัวคือตัวบอกเอง

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
        // ชื่อประกาศ 2 บรรทัด — ข้อความธรรมดา (ไม่รับ HTML) คำใน goldWord จะถูกทำเป็นสีทองให้เอง
        titleTop: CFG.titleTop || 'ประกาศราคาทองคำ',
        titleSub: CFG.titleSub || 'สำหรับลูกค้าออมทองออสสิริส',
        goldWord: CFG.goldWord == null ? 'ทองคำ' : CFG.goldWord,   // '' = ไม่เน้นคำไหนเลย
        customTitle: CFG.customTitle || 'สำหรับลูกค้าที่ออมทองตามยอดที่กำหนดเอง',
        customLabel: CFG.customLabel || 'กรอกยอดออมของคุณ',
        footNote: CFG.footNote || 'คำนวณจากราคาปิดที่บันทึกล่าสุด ณ เวลา 17:00 น.',
        errorText: CFG.errorText || 'ยังโหลดราคาประกาศไม่ได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง',
        noPriceText: CFG.noPriceText || 'ยังไม่มีราคาที่บันทึก'
    };

    var TH_MONTH = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
                    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
    var TH_MONTH_ABBR = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
                         'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    var TH_DAY = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];

    var state = {
        ctx: null,       // ผลจาก /gold-saving
        monthly: null,   // ผลคำนวณทั้งหมดจาก /gold-saving/monthly
        amount: 0,
        loaded: false
    };
    var monthlyLoadTimer = null;
    var monthlyRequestId = 0;
    state.amount = parseAmount(CFG.defaultAmount == null ? 3000 : CFG.defaultAmount) || 3000;

    /* ================= helpers ================= */
    function $(id) { return document.getElementById(id); }
    function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }

    // ทำคำเดียวในข้อความให้เป็นสีทอง — escape ก่อนแล้วค่อยแทรก tag จึงไม่เปิดช่อง HTML จาก config
    function goldWord(text, word) {
        var safe = esc(text);
        if (!word) return safe;
        var w = esc(word), i = safe.indexOf(w);
        if (i < 0) return safe;
        return safe.slice(0, i) + '<em class="gsd-gw">' + w + '</em>' + safe.slice(i + w.length);
    }

    // ทุกฟังก์ชันวันที่แกะจาก string 'YYYY-MM-DD' ตรง ๆ (UTC) — ไม่ผ่าน timezone ของเครื่อง
    function thDate(iso) {
        if (!iso) return '—';
        var p = iso.split('-'), d = new Date(Date.UTC(+p[0], +p[1] - 1, +p[2]));
        return 'วัน' + TH_DAY[d.getUTCDay()] + ' ที่ ' + (+p[2]) + ' ' + TH_MONTH[+p[1] - 1] + ' ' + (+p[0] + 543);
    }
    // แบบย่อสำหรับจอแคบ: "พฤหัสบดี ที่ 17 ก.ย. 2569" (CSS สลับกับแบบเต็มเอง)
    function thDateMedium(iso) {
        if (!iso) return '—';
        var p = iso.split('-'), d = new Date(Date.UTC(+p[0], +p[1] - 1, +p[2]));
        return TH_DAY[d.getUTCDay()] + ' ที่ ' + (+p[2]) + ' ' + TH_MONTH_ABBR[+p[1] - 1] + ' ' + (+p[0] + 543);
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
    function truncateGoldFromCents(amountCents, selling) {
        var scale = 1000000;
        return Math.trunc(amountCents * scale / (selling * 100)) / scale;
    }
    function parseAmount(value) {
        var digits = String(value == null ? '' : value).replace(/[^0-9]/g, '');
        var n = parseInt(digits, 10);
        return isNaN(n) ? 0 : Math.min(n, MAX_AMOUNT);
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

    // รองรับ backend รุ่นเก่าระหว่าง rollout; รุ่นใหม่ใช้ requested_plan โดยไม่คำนวณซ้ำ
    function legacyPlanForAmount(amount) {
        var summary = state.monthly;
        var selling = summary && summary.latest_price ? Number(summary.latest_price.selling_price) : 0;
        if (!summary || !(selling > 0)) return null;

        var source = null;
        if (summary.monthly_amount === amount) {
            source = { daily_amount: summary.initial_daily_amount };
        } else {
            var calculations = summary.calculations || [];
            for (var i = 0; i < calculations.length; i++) {
                if (calculations[i].monthly_amount === amount) {
                    source = calculations[i];
                    break;
                }
            }
        }
        if (!source || source.daily_amount == null) return null;

        var dailyCents = Math.round(Number(source.daily_amount) * 100);
        return {
            monthly_amount: amount,
            daily_amount: Number(source.daily_amount),
            gold_baht_per_day: truncateGoldFromCents(dailyCents, selling),
            estimated_monthly_gold_baht: truncateGoldFromCents(amount * 100, selling)
        };
    }

    // Component แสดงค่าจาก backend; fallback ด้านบนทำงานเฉพาะ API รุ่นเก่าที่ยังไม่มี field ใหม่
    function planForAmount(amount) {
        if (!state.monthly) return null;
        if (!Object.prototype.hasOwnProperty.call(state.monthly, 'requested_plan')) {
            return legacyPlanForAmount(amount);
        }
        var requested = state.monthly.requested_plan;
        if (requested && requested.monthly_amount === amount) return requested;
        var calculations = state.monthly.calculations || [];
        for (var i = 0; i < calculations.length; i++) {
            if (calculations[i].monthly_amount === amount) return calculations[i];
        }
        return null;
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
                '<h2 class="gsd-title">' +
                    '<span class="gsd-t1">' + goldWord(TEXT.titleTop, TEXT.goldWord) + '</span>' +
                    '<span class="gsd-t2">' + esc(TEXT.titleSub) + '</span>' +
                '</h2>' +
                '<p class="gsd-hero">' +
                    '<span class="gsd-dfull gsd-sk" id="gsdDateFull">วันศุกร์ ที่ 00 กันยายน 2569</span>' +
                    '<span class="gsd-dshort gsd-sk" id="gsdDateShort">ศุกร์ ที่ 00 ก.ย. 2569</span>' +
                    '<span class="gsd-dot" id="gsdDot">·</span>' +
                    '<span class="gsd-tm gsd-num gsd-sk" id="gsdTime">00:00 น.</span>' +
                '</p>' +
                '<div class="gsd-rule"></div>' +
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
                    '<th>ทองที่ได้<br>ต่อวัน<br>(บาททอง)</th>' +
                    '<th>ทองที่ได้<br>ทั้งเดือน<br>(บาททอง)</th>' +
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

    // หัวประกาศ — วันที่ (เต็ม/ย่อ ให้ CSS เลือกตามความกว้าง) กับเวลา อยู่บรรทัดเดียวกัน
    // time = null -> ยังไม่มีราคาบันทึก · iso = null -> โหลดไม่สำเร็จ ตัดท่อนเวลาทิ้งไปเลย
    function setHead(iso, time) {
        $('gsdDateFull').textContent = iso ? thDate(iso) : '—';
        $('gsdDateShort').textContent = iso ? thDateMedium(iso) : '—';
        var tm = $('gsdTime'), dot = $('gsdDot');
        tm.hidden = dot.hidden = !iso;
        if (!iso) return;
        tm.textContent = time || TEXT.noPriceText;
        tm.classList.toggle('gsd-tm-note', !time);
    }

    function fillRow(row, plan) {
        cell(row, 'daily').textContent = num2(plan ? plan.daily_amount : null);
        setGold(cell(row, 'gday'), plan ? plan.gold_baht_per_day : null);
        setGold(cell(row, 'gmonth'), plan ? plan.estimated_monthly_gold_baht : null);
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
        cell(row, 'amount').textContent = money(state.amount);
        fillRow(row, planForAmount(state.amount));
        var chips = document.querySelectorAll('#gsdChips button');
        Array.prototype.forEach.call(chips, function (b) {
            b.classList.toggle('gsd-on', parseInt(b.getAttribute('data-amt'), 10) === state.amount);
        });
    }

    function days() {
        return state.monthly ? state.monthly.eligible_purchase_days : null;
    }

    function render() {
        var container = document.querySelector('.gsd-container');
        if (!container) return;

        if (!state.ctx) {                 // โหลด context ไม่สำเร็จ
            $('gsdError').textContent = TEXT.errorText;
            $('gsdError').hidden = false;
            container.classList.remove('gsd-loading');
            setHead(null, null);
            $('gsdBuyback').textContent = '—';
            $('gsdSelling').textContent = '—';
            Array.prototype.forEach.call(document.querySelectorAll('#gsdBody tr'), function (row) {
                fillRow(row, null);
            });
            return;
        }

        var ctx = state.ctx;
        var view = resolve(ctx);
        var d = days();
        $('gsdError').hidden = true;

        // วันที่ตัวใหญ่ = วันที่ของ record ราคา ไม่ใช่วันที่ปฏิทินของเครื่องผู้ใช้
        setHead(view.priceDate || ctx.requested_date, view.priceDate ? view.fixedTime + ' น.' : null);

        $('gsdBuyback').textContent = money(view.buyback);
        $('gsdSelling').textContent = money(view.selling);

        Array.prototype.forEach.call(document.querySelectorAll('#gsdBody tr'), function (row) {
            var amt = row.hasAttribute('data-user') ? state.amount : parseInt(row.getAttribute('data-amt'), 10);
            if (row.hasAttribute('data-user')) cell(row, 'amount').textContent = money(state.amount);
            fillRow(row, planForAmount(amt));
        });

        $('gsdFoot').innerHTML = 'หมายเหตุ : เดือน' + thMonthYear((ctx.requested_date || '').slice(0, 7)) +
            ' เฉลี่ยซื้อทอง ' + (d == null ? '—' : d) + ' วันทำการ<br>' + TEXT.footNote;
        $('gsdHelp').textContent = 'ผลคำนวณแสดงในแถว “ยอดของคุณ” ในตารางด้านบน · ' +
            (d == null ? '—' : d) + ' วันทำการ';

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
            queueMonthlyLoad();
        });
        input.addEventListener('blur', function () {
            if (state.amount < 1) state.amount = 1;
            input.value = money(state.amount);
            renderUserRow();
            queueMonthlyLoad();
        });
        $('gsdChips').addEventListener('click', function (e) {
            var btn = e.target.closest('button[data-amt]');
            if (!btn) return;
            state.amount = parseInt(btn.getAttribute('data-amt'), 10);
            input.value = money(state.amount);
            renderUserRow();
            queueMonthlyLoad();
        });
    }

    /* ================= data ================= */
    function getJSON(url) {
        return fetch(url, { cache: 'no-store' }).then(function (r) {
            if (!r.ok) throw new Error('HTTP ' + r.status);
            return r.json();
        });
    }

    function monthlyURL(amount) {
        return MONTHLY_URL + '?amount=' + encodeURIComponent(amount);
    }

    function queueMonthlyLoad() {
        if (monthlyLoadTimer) clearTimeout(monthlyLoadTimer);
        if (state.amount < 1) return;
        monthlyLoadTimer = setTimeout(loadMonthly, 300);
    }

    function loadMonthly() {
        var requestedAmount = state.amount;
        var requestId = ++monthlyRequestId;
        return getJSON(monthlyURL(requestedAmount)).then(function (summary) {
            if (requestId !== monthlyRequestId || requestedAmount !== state.amount) return;
            state.monthly = summary;
            render();
        }).catch(function (e) {
            console.warn('[gold-saving-daily] โหลดผลคำนวณไม่สำเร็จ:', e.message);
        });
    }

    function load() {
        var requestedAmount = state.amount;
        var requestId = ++monthlyRequestId;
        return Promise.all([
            getJSON(CTX_URL).catch(function (e) {
                console.warn('[gold-saving-daily] โหลด context ไม่สำเร็จ:', e.message);
                return null;
            }),
            getJSON(monthlyURL(requestedAmount)).catch(function () { return null; })
        ]).then(function (res) {
            if (res[0]) state.ctx = res[0];
            if (requestId === monthlyRequestId && requestedAmount === state.amount && res[1]) {
                state.monthly = res[1];
            }
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
