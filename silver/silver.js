async function fetchSilverPrice() {
    try {
        await new Promise(resolve => setTimeout(resolve, 1500));

        const slvResp = await fetch('http://27.254.3.9/api/v1/prices/silver');
        const slvRespYest = await fetch('http://27.254.3.9/api/v1/prices/silver-yesterday');

        const slvTyd = await slvResp.json();
        const slvYest = await slvRespYest.json();

        const silverToday = slvTyd?.Silver;
        const silverYest = slvYest?.['Silver-yesterday'];

        if (!silverToday || !silverYest) {
            console.error('Invalid API response format:', { slvTyd, slvYest });
            return;
        }

        const slvUsdBid = silverToday.bidspot;
        const slvUsdOffer = silverToday.offerspot;

        const slvKgBid = silverToday.bid;
        const slvKgOffer = silverToday.offer;

        const slvTime = silverToday.time;

        const prevOffer = silverYest.offerspot || 0;
        const prevOffer965 = silverYest.offer || 0;

        const slvUsdChg = slvUsdOffer - prevOffer;
        const slvKgChg = slvKgOffer - prevOffer965;

        const slvKgOfferWithVAT = calculateVAT(slvKgOffer);

        updElTxt('slvUsdBid', fmtNumComma(slvUsdBid));
        updElTxt('slvUsdOffer', fmtNumComma(slvUsdOffer));

        updElTxt('slvKgBid', fmtNumCommaSV(slvKgBid));
        updElTxt('slvKgOffer', fmtNumCommaSV(slvKgOffer));

        updElTxt('slvTime', getTimeString(slvTime));
        updElTxt('slvTimeKG', getTimeString(slvTime));

        updElinnerHTML('slvDate', 'ราคาซื้อขาย Ausiris Silver <br>' + fmtThDate(slvTime, 'long'));

        updElTxt('slvKgVat', fmtNumCommaSV(slvKgOfferWithVAT.toFixed(0)));

        rmSkelCls('slvDate');

        updElTxt('slvUsdChg', (slvUsdChg > 0 ? '+' : '') + fmtNumComma(slvUsdChg));
        updElTxt('slvKgChg', (slvKgChg > 0 ? '+' : '') + fmtNumComma(slvKgChg));

        const changeSVSpot = document.getElementById('slvUsdChg');
        const changeSVKG = document.getElementById('slvKgChg');

        updElTxt('slvTimeUpd', fmtThDate(slvTime));

        if (slvUsdChg > 0) {
            changeSVSpot.style.color = '#059669';
        } else if (slvUsdChg < 0) {
            changeSVSpot.style.color = '#dc2626';
        } else {
            changeSVSpot.style.color = '#ffffff';
        }

        if (slvKgChg > 0) {
            changeSVKG.style.color = '#059669';
        } else if (slvKgChg < 0) {
            changeSVKG.style.color = '#dc2626';
        } else {
            changeSVKG.style.color = '#ffffff';
        }

        rmSkelCls('slvUsdBid');
        rmSkelCls('slvUsdOffer');
        rmSkelCls('slvUsdChg');
        rmSkelCls('slvKgBid');
        rmSkelCls('slvKgOffer');
        rmSkelCls('slvKgChg');
        rmSkelCls('slvTimeUpd');
        rmSkelCls('slvDate');
        rmSkelCls('slvKgVat');

    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

function rmSkelCls(id) {
    const element = document.getElementById(id);
    if (element) {
        element.classList.remove('sv-skeleton', 'sv-skeleton-text');
        element.style.background = 'transparent';
    }
}

function updElinnerHTML(id, text) {
    const element = document.getElementById(id);
    if (element) {
        element.innerHTML = text;
    }
}

function calculateVAT(slvKgOffer) {
    return slvKgOffer * 1.07;
}

function updElTxt(id, text) {
    const element = document.getElementById(id);
    if (element) {
        element.innerText = text;
    }
}

function fmtNumComma(number) {
    return number.toLocaleString();
}

function fmtNumCommaSV(number) {
    const num = Number(number);
    if (isNaN(num)) {
        return 'Invalid number';
    }
    return num.toLocaleString();
}

function getTimeString(time) {
    return time.slice(10, 16);
}

function formatDate(dateString) {
    if (dateString.includes('/')) {
        const [day, month, year] = dateString.split('/');
        const convertedYear = parseInt(year) - 543;
        return `--`;
    }
    const [year, month, day] = dateString.split('-');
    return `--`;
}

function fmtThDate(isoDateTime, monthFormat = 'short') {
    const dateObj = new Date(isoDateTime);
    const dateOptions = {
        weekday: 'long',
        day: 'numeric',
        month: monthFormat,
        year: 'numeric',
        timeZone: 'Asia/Bangkok'
    };
    const formattedDate = dateObj.toLocaleDateString('th-TH', dateOptions);
    return formattedDate;
}

setInterval(fetchSilverPrice, 2000);
fetchSilverPrice();
