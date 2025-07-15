/*!
 * Gold Gem Component JavaScript Bundle
 * A comprehensive gold trading and price display component
 * Includes: Banner slideshow, Gold price display, Calculator, Special offers
 * Version: 1.0.0
 */

(function(global) {
    'use strict';

    // =============================================================================
    // EMBEDDED DATA (JSON)
    // =============================================================================

    const EMBEDDED_TRANSLATIONS =     {
        "th": {
            "title": "ตัวจับเวลานับถอยหลัง - ข้อเสนอพิเศษ",
            "offer": {
                "header": "🎉 ข้อเสนอพิเศษวันนี้เท่านั้น! 🎉",
                "description": "สั่งซื้อภายในวันนี้ รับส่วนลด 100 บาท",
                "codeTitle": "🏷️ คัดลอกโค้ดส่วนลด",
                "copyButton": "คัดลอก",
                "copiedButton": "คัดลอกแล้ว!",
                "copyError": "คัดลอกโค้ด:",
                "codeExpiry": "⏰ โค้ดหมดอายุ:",
                "promotionPeriod": "ระยะเวลาโปรโมชั่น",
                "discountCode": "AUS100TH"
            },
            "countdown": {
                "label": "⏳ เหลือเวลาอีก:",
                "labelBeforeStart": "⏳ เหลือเวลาอีกก่อนเริ่มโปรโมชั่น:",
                "labelExpired": "❌ โปรโมชั่นหมดอายุแล้ว",
                "days": "วัน",
                "hours": "ชั่วโมง",
                "minutes": "นาที",
                "seconds": "วินาที"
            },
            "urgencyMessages": {
                "critical": "🚨 เร่งด่วนที่สุด! เหลือเวลาไม่ถึง 1 ชั่วโมง!",
                "urgent": "🔥 รีบด่วน! เหลือเวลาไม่ถึง 3 ชั่วโมง!",
                "warning": "⚠️ เตือน! เหลือเวลาไม่ถึง 1 วัน!",
                "normal": "🔥 ข้อเสนอพิเศษสุดคุ้ม! อย่าพลาดโอกาสทอง!"
            },
            "buttons": {
                "getOffer": "🛒 รับข้อเสนอพิเศษตอนนี้เลย!",
                "useDiscount": "🛒 ใช้ส่วนลดตอนนี้เลย",
                "getReady": "⏰ เตรียมพร้อมรับส่วนลด",
                "expired": "😞 โปรโมชั่นสิ้นสุดแล้ว"
            },
            "language": {
                "current": "ไทย",
                "switch": "English"
            },
            "calculator": {
                "title": "คำนวณราคาทองคำและแท่งเงิน",
                "metalTypes": {
                    "gold": "🥇 ทองคำ",
                    "silver": "🥈 แท่งเงิน"
                },
                "goldTypes": {
                    "label": "ประเภททองคำ",
                    "96.5_osiris": "96.5% ออสสิริส",
                    "99.99_osiris": "99.99% ออสสิริส",
                    "99.99_osiris_kg": "99.99% ออสสิริส(กิโลกรัม)",
                    "96.5_assoc": "96.5% สมาคม"
                },
                "units": {
                    "label": "หน่วย",
                    "baht": "บาททอง",
                    "kg": "กิโลกรัม",
                    "gram": "กรัม"
                },
                "weight": {
                    "label": "น้ำหนัก",
                    "placeholder": "0.00"
                },
                "prices": {
                    "sellPerBaht": "ราคาซื้อ (ต่อบาททอง)",
                    "buyPerBaht": "ราคาขาย (ต่อบาททอง)",
                    "sellPerKg": "ราคาซื้อ (ต่อกิโลกรัม)",
                    "buyPerKg": "ราคาขาย (ต่อกิโลกรัม)"
                },
                "total": {
                    "label": "มูลค่ารวม (ราคาขาย)",
                    "currency": "บาท"
                },
                "lastUpdated": "อัพเดทล่าสุด:",
                "note": "💡 <strong>หมายเหตุ:</strong> ราคาที่แสดงเป็นราคาอ้างอิงตามข้อมูลตลาด อัพเดทแบบเรียลไทม์ อิงตามทองคำโลกและเงื่อนไขการซื้อขาย"
            },
            "contact": {
                "title": "เยี่ยมชมเรา",
                "companyName": "Ausiris Company Limited",
                "companyNameEn": "AUSIRIS Co., Ltd (flagship store)",
                "address": {
                    "line1": "อาคารสีลม คอมเพล็กซ์ ชั้น 4",
                    "line2": "เลขที่ 191 Si Lom Rd, Si Lom,",
                    "line3": "Bang Rak, Bangkok 10500"
                },
                "phone": "02-613-4711-3",
                "lineButton": "ติดต่อผ่าน LINE"
            }
        },
        "en": {
            "title": "Countdown Timer - Special Offer",
            "offer": {
                "header": "🎉 Today Only Special Offer! 🎉",
                "description": "Order today and get 100 THB discount",
                "codeTitle": "🏷️ Copy Discount Code",
                "copyButton": "Copy",
                "copiedButton": "Copied!",
                "copyError": "Copy code:",
                "codeExpiry": "⏰ Code expires:",
                "promotionPeriod": "Promotion Period",
                "discountCode": "AUS100TH"
            },
            "countdown": {
                "label": "⏳ Time remaining:",
                "labelBeforeStart": "⏳ Time before promotion starts:",
                "labelExpired": "❌ Promotion has expired",
                "days": "Days",
                "hours": "Hours",
                "minutes": "Minutes",
                "seconds": "Seconds"
            },
            "urgencyMessages": {
                "critical": "🚨 Critical! Less than 1 hour remaining!",
                "urgent": "🔥 Urgent! Less than 3 hours remaining!",
                "warning": "⚠️ Warning! Less than 1 day remaining!",
                "normal": "🔥 Amazing Special Offer! Don't miss this golden opportunity!"
            },
            "buttons": {
                "getOffer": "🛒 Get This Special Offer Now!",
                "useDiscount": "🛒 Use Discount Now",
                "getReady": "⏰ Get Ready for Discount",
                "expired": "😞 Promotion Ended"
            },
            "language": {
                "current": "English",
                "switch": "ไทย"
            },
            "calculator": {
                "title": "Gold & Silver Calculator",
                "metalTypes": {
                    "gold": "🥇 Gold",
                    "silver": "🥈 Silver"
                },
                "goldTypes": {
                    "label": "Gold Type",
                    "96.5_osiris": "96.5% Ausiris",
                    "99.99_osiris": "99.99% Ausiris",
                    "99.99_osiris_kg": "99.99% Ausiris (Kilogram)",
                    "96.5_assoc": "96.5% Association"
                },
                "units": {
                    "label": "Unit",
                    "baht": "Baht Gold",
                    "kg": "Kilogram",
                    "gram": "Gram"
                },
                "weight": {
                    "label": "Weight",
                    "placeholder": "0.00"
                },
                "prices": {
                    "sellPerBaht": "Sell (per Baht Gold)",
                    "buyPerBaht": "Buy (per Baht Gold)",
                    "sellPerKg": "Sell (per Kilogram)",
                    "buyPerKg": "Buy (per Kilogram)"
                },
                "total": {
                    "label": "Total Value (Sell Price)",
                    "currency": "THB"
                },
                "lastUpdated": "Last Updated:",
                "note": "💡 <strong>Note:</strong> Prices shown are reference prices based on market data. Real-time updates based on global gold prices and trading conditions."
            },
            "contact": {
                "title": "Visit Us",
                "companyName": "Ausiris Company Limited",
                "companyNameEn": "AUSIRIS Co., Ltd (flagship store)",
                "address": {
                    "line1": "Silom Complex Building, 4th Floor",
                    "line2": "191 Si Lom Rd, Si Lom,",
                    "line3": "Bang Rak, Bangkok 10500"
                },
                "phone": "02-613-4711-3",
                "lineButton": "Contact via LINE"
            }
        }
    };

    const BANNER_TRANSLATIONS =     {
        "th": {
            "slides": [
                {
                    "title": "ทองคำแท่งคุณภาพสูง",
                    "subtitle": "ลงทุนกับทองคำมาตรฐานสากล 96.5% และ 99.99% พร้อมราคาที่ดีที่สุด",
                    "buttonText": "เริ่มต้นลงทุน"
                },
                {
                    "title": "แท่งเงินคุณภาพพรีเมี่ยม",
                    "subtitle": "ราคาแท่งเงินอัปเดตแบบเรียลไทม์ ตลอด 24 ชั่วโมง",
                    "buttonText": "ดูราคาเงิน"
                },
                {
                    "title": "โปรโมชั่นพิเศษ",
                    "subtitle": "ส่วนลดสูงสุด 50% สำหรับลูกค้าใหม่ จำนวนจำกัด!",
                    "buttonText": "รับข้อเสนอพิเศษ"
                },
                {
                    "title": "ผู้เชี่ยวชาญด้านทองคำ",
                    "subtitle": "ประสบการณ์กว่า 10 ปี ในธุรกิจทองคำและเงิน พร้อมให้คำปรึกษา",
                    "buttonText": "ติดต่อผู้เชี่ยวชาญ"
                }
            ]
        },
        "en": {
            "slides": [
                {
                    "title": "Premium Gold Bars",
                    "subtitle": "Invest in international standard gold 96.5% and 99.99% at the best prices",
                    "buttonText": "Start Investing"
                },
                {
                    "title": "Premium Silver Bars",
                    "subtitle": "Real-time silver bar prices updated 24/7",
                    "buttonText": "View Silver Prices"
                },
                {
                    "title": "Special Promotion",
                    "subtitle": "Up to 50% discount for new customers - Limited time offer!",
                    "buttonText": "Get Special Offer"
                },
                {
                    "title": "Gold Investment Experts",
                    "subtitle": "Over 10 years of experience in gold and silver business with consultation",
                    "buttonText": "Contact Expert"
                }
            ]
        }
    };

    const GOLD_TRANSLATIONS =     {
        "th": {
            "goldPrices": {
                "title": "ทองคำแท่ง",
                "updateTime": "อัปเดตล่าสุด",
                "showMore": "แสดงเพิ่มเติม",
                "showLess": "แสดงน้อยลง",
                "priceBuy": "ราคาซื้อ",
                "priceSell": "ขาย",
                "priceChange": "เปลี่ยนแปลง",
                "goldTypes": {
                    "ausitis965": "ออสสิริส 96.5%",
                    "ausitis9999": "ออสสิริส 99.99%",
                    "spotGold": "Spot Gold (USD/oz)",
                    "silverUsdOz": "แท่งเงิน (USD/oz)",
                    "goldKg": "ออสสิริส 99.99% (KG)",
                    "goldChit": "สมาคมทองคำ 96.5%",
                    "silverThb": "แท่งเงิน (บาท/กก.)"
                },
                "unit": "บาท"
            }
        },
        "en": {
            "goldPrices": {
                "title": "Gold Bar",
                "updateTime": "Last updated",
                "showMore": "Show more",
                "showLess": "Show less",
                "priceBuy": "Buy Price",
                "priceSell": "Sell",
                "priceChange": "Change",
                "goldTypes": {
                    "ausitis965": "Ausiris 96.5%",
                    "ausitis9999": "Ausiris 99.99%",
                    "spotGold": "Spot Gold (USD/oz)",
                    "silverUsdOz": "Silver Bar (USD/oz)",
                    "goldKg": "Ausiris 99.99% (KG)",
                    "goldChit": "GTA 96.5%",
                    "silverThb": "Silver Bar (THB/kg)"
                },
                "unit": "THB"
            }
        }
    };

    // =============================================================================
    // HTML TEMPLATES
    // =============================================================================

    const HTML_TEMPLATES =     {
        "bannerSection": "<section id=\"bannerSection\" class=\"\">\n        <div class=\"banner-slideshow\" id=\"mainBanner\">\n            <!-- Content will be injected by JavaScript -->\n        </div>\n    </section>",
        "goldPriceSection": "<section id=\"goldPriceSection\" class=\"section-spacing language-transition\" style=\"background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); padding-top: 2rem;\">\n        <!-- Quick Discount Code Button -->\n        <div class=\"text-center pb-6\">\n            <button onclick=\"scrollToSpecialOffer()\" class=\"btn btn-lg\" style=\"background: linear-gradient(135deg, #FFD700, #FFA500); border: none; color: #333; font-weight: bold; box-shadow: 0 4px 15px rgba(255, 215, 0, 0.3); transition: all 0.3s ease; border-radius: 50px; padding: 12px 24px;\">\n                <span class=\"text-lg font-bold\" data-lang=\"th\">\n                    🎫 เก็บโค้ดส่วนลดคลิกที่นี่\n                </span>\n                <span class=\"text-lg font-bold hidden\" data-lang=\"en\">\n                    🎫 Get Discount Code Here\n                </span>\n            </button>\n        </div>\n        \n        <!-- Real-time Price Header -->\n        <div class=\"text-center pb-4\">\n            <h2 class=\"text-xl md:text-2xl lg:text-3xl font-bold text-gray-800 mb-2\" data-lang=\"th\">\n                ราคาทองคำและแท่งเงิน Real Time ออสสิริส\n            </h2>\n            <h2 class=\"text-xl md:text-2xl lg:text-3xl font-bold text-gray-800 mb-2 hidden\" data-lang=\"en\">\n                Real-time Gold and Silver Prices by Ausiris\n            </h2>\n        </div>\n        \n        <div class=\"container mx-auto\">\n            <div id=\"goldPriceContainer\" class=\"gold-price-container\">\n                <!-- Gold price component will be rendered here -->\n            </div>\n        </div>\n    </section>",
        "calculatorSection": "<div id=\"calculator-app\"></div>",
        "secondaryBannerSection": "<section id=\"secondaryBannerSection\" class=\"\">\n        <div class=\"secondary-banner-slideshow\" id=\"secondaryBanner\" style=\"width: 100vw; margin-left: calc(50% - 50vw); height: 400px; position: relative; overflow: hidden;\">\n            <!-- Content will be injected by JavaScript -->\n        </div>\n    </section>",
        "specialOfferSection": "<section id=\"specialOfferSection\" class=\"section-spacing language-transition\" style=\"background-image: url('public/section-bg-simple.svg'); background-size: cover; background-position: center; background-repeat: no-repeat;\">\n        <div class=\"hero\">\n            <div class=\"hero-content text-center w-full\">\n                <div class=\"w-full max-w-sm md:max-w-md lg:max-w-lg mx-auto\">\n                    <!-- Offer Header -->\n                    <div class=\"card text-primary-content\">\n                        <div class=\"card-body\">\n                            <h1 class=\"card-title text-2xl text-gray-100 md:text-4xl lg:text-5xl font-bold justify-center mb-2\" data-i18n=\"offer.header\">\n                                🎉 ข้อเสนอพิเศษวันนี้เท่านั้น! 🎉\n                            </h1>\n                            <!-- Offer Image -->\n                            <div class=\"offer-image-container mb-3\">\n                                <img src=\"public/offer-02.png\" alt=\"Order today and get 100 THB discount\" style=\"width: 100%; max-width: 350px; height: auto; border-radius: 0.5rem; margin: 0 auto; display: block;\">\n                            </div>\n                            \n                            <!-- Discount Code Section -->\n                            <div class=\"card bg-gradient-to-br from-yellow-50 to-amber-100 text-gray-800 shadow-lg mb-4\">\n                                <div class=\"card-body\">\n                                    <h3 class=\"card-title text-lg md:text-xl lg:text-2xl justify-center text-accent\" data-i18n=\"offer.codeTitle\">\n                                        🏷️ คัดลอกโค้ดส่วนลด\n                                    </h3>\n                                    \n                                    <div class=\"join w-full max-w-md mx-auto mt-3\">\n                                        <input \n                                            id=\"discountCode\" \n                                            type=\"text\" \n                                            value=\"AUS50THB\" \n                                            readonly \n                                            class=\"input input-bordered input-accent join-item flex-1 text-center text-base md:text-lg font-bold\"\n                                            data-i18n-value=\"offer.discountCode\"\n                                        />\n                                        <button \n                                            id=\"copyBtn\"\n                                            onclick=\"copyDiscountCode()\" \n                                            class=\"btn btn-accent join-item copy-btn\">\n                                            <svg id=\"copyIcon\" xmlns=\"http://www.w3.org/2000/svg\" class=\"h-5 w-5\" fill=\"none\" viewBox=\"0 0 24 24\" stroke=\"currentColor\">\n                                                <path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z\" />\n                                            </svg>\n                                            <svg id=\"checkIcon\" xmlns=\"http://www.w3.org/2000/svg\" class=\"h-5 w-5 hidden\" fill=\"none\" viewBox=\"0 0 24 24\" stroke=\"currentColor\">\n                                                <path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z\" />\n                                            </svg>\n                                            <span id=\"btnText\" data-i18n=\"offer.copyButton\">คัดลอก</span>\n                                        </button>\n                                    </div>\n                                    \n                                    <p class=\"text-warning font-semibold mt-2\">\n                                        <span data-i18n=\"offer.codeExpiry\">⏰ โค้ดหมดอายุ:</span> <span id=\"expiryDate\">28/07/2025</span>\n                                    </p>\n                                </div>\n                            </div>\n                            \n                            <!-- Promotion Period -->\n                            <div class=\"stats bg-gradient-to-br from-yellow-50 to-amber-100 text-gray-800 stats-vertical lg:stats-horizontal shadow-lg mb-4\">\n                                <div class=\"stat\">\n                                    <div class=\"stat-title text-gray-500\" data-i18n=\"offer.promotionPeriod\">ระยะเวลาโปรโมชั่น</div>\n                                    <div class=\"stat-value text-lg\">\n                                        <span id=\"startDate\">30/06/2025</span> - <span id=\"endDate\">28/07/2025</span>\n                                    </div>\n                                </div>\n                            </div>\n                            \n                            <!-- Countdown Timer -->\n                            <div class=\"mb-4\">\n                                <h3 class=\"text-lg text-gray-800 md:text-xl lg:text-2xl font-bold mb-2\" id=\"countdownLabel\" data-i18n=\"countdown.label\">\n                                    ⏳ เหลือเวลาอีก:\n                                </h3>\n                                \n                                <!-- Enhanced Countdown with Urgency Effects -->\n                                <div class=\"countdown-container\">\n                                    <div class=\"grid grid-flow-col gap-3 md:gap-4 lg:gap-5 text-center auto-cols-max justify-center\">\n                                        <div id=\"days-container\" class=\"countdown-item flex flex-col p-3 md:p-3 lg:p-4 rounded-box text-white font-bold shadow-lg\">\n                                            <span class=\"countdown font-mono text-4xl md:text-4xl lg:text-5xl\">\n                                                <span id=\"countdown-days\" style=\"--value:15;\" aria-live=\"polite\">15</span>\n                                            </span>\n                                            <span class=\"text-sm md:text-sm mt-1 font-semibold\" data-i18n=\"countdown.days\">วัน</span>\n                                        </div>\n                                        <div id=\"hours-container\" class=\"countdown-item flex flex-col p-3 md:p-3 lg:p-4 rounded-box text-white font-bold shadow-lg\">\n                                            <span class=\"countdown font-mono text-4xl md:text-4xl lg:text-5xl\">\n                                                <span id=\"countdown-hours\" style=\"--value:10;\" aria-live=\"polite\">10</span>\n                                            </span>\n                                            <span class=\"text-sm md:text-sm mt-1 font-semibold\" data-i18n=\"countdown.hours\">ชั่วโมง</span>\n                                        </div>\n                                        <div id=\"minutes-container\" class=\"countdown-item flex flex-col p-3 md:p-3 lg:p-4 rounded-box text-white font-bold shadow-lg\">\n                                            <span class=\"countdown font-mono text-4xl md:text-4xl lg:text-5xl\">\n                                                <span id=\"countdown-minutes\" style=\"--value:24;\" aria-live=\"polite\">24</span>\n                                            </span>\n                                            <span class=\"text-sm md:text-sm mt-1 font-semibold\" data-i18n=\"countdown.minutes\">นาที</span>\n                                        </div>\n                                        <div id=\"seconds-container\" class=\"countdown-item flex flex-col p-3 md:p-3 lg:p-4 rounded-box text-white font-bold shadow-lg\">\n                                            <span class=\"countdown font-mono text-4xl md:text-4xl lg:text-5xl\">\n                                                <span id=\"countdown-seconds\" style=\"--value:59;\" aria-live=\"polite\">59</span>\n                                            </span>\n                                            <span class=\"text-sm md:text-sm mt-1 font-semibold\" data-i18n=\"countdown.seconds\">วินาที</span>\n                                        </div>\n                                    </div>\n                                </div>\n                            </div>\n                            \n                            <!-- Action Button -->\n                            <a href=\"https://express.ausiris.co.th/\" target=\"_blank\" rel=\"noopener noreferrer\" id=\"mainActionBtn\" class=\"btn btn-accent main-action-btn text-white\" data-i18n=\"buttons.useDiscount\" style=\"display: inline-flex; align-items: center; justify-content: center; text-decoration: none;\">\n                                🛒 ใช้ส่วนลดตอนนี้เลย\n                            </a>\n                        </div>\n                    </div>\n                </div>\n            </div>\n        </div>\n    </section>",
        "contactSection": "<section class=\"map-section language-transition\" style=\"padding: 4rem 1rem; background: #f8f9fa;\">\n    <div class=\"map-container\" style=\"max-width: 1200px; margin: 0 auto;\">\n        <h2 style=\"text-align: center; margin-bottom: 5rem; color: #2c3e50; font-size: 3rem; font-weight: 600; font-family: 'Prompt', sans-serif;\" \n            data-i18n=\"contact.title\">\n            เยี่ยมชมเรา\n        </h2>\n        \n        <div style=\"display: flex; flex-wrap: wrap; gap: 2rem; align-items: center; justify-content: center;\">\n            <!-- Map Container -->\n            <div style=\"flex: 1; min-width: 300px; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1);\">\n                <div style=\"position: relative; padding-bottom: 60%;\">\n                    <iframe \n                        src=\"https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d1937.9195656620043!2d100.5345192!3d13.7281875!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x30e29f2b54d9be83%3A0x569f8e5d59bad888!2sAusiris%20Company%20Limited!5e0!3m2!1sen!2sth!4v1749353588121!5m2!1sen!2sth\" \n                        style=\"position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;\" \n                        allowfullscreen=\"\" \n                        loading=\"lazy\" \n                        referrerpolicy=\"no-referrer-when-downgrade\">\n                    </iframe>\n                </div>\n            </div>\n            \n            <!-- Contact Information -->\n            <div style=\"flex: 1; min-width: 300px; padding: 1.5rem; background: white; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.05);\">\n                <h3 style=\"color: #2c3e50; margin-bottom: 1.5rem; font-size: 2.5rem; font-weight: 600;\" \n                    data-i18n=\"contact.companyName\">\n                    Ausiris Company Limited\n                    <div style=\"font-size: 1.2rem; color: #7f8c8d; font-weight: 500; margin-top: 0.25rem;\" \n                         data-i18n=\"contact.companyNameEn\">\n                    AUSIRIS Co., Ltd (flagship store)\n                    </div>\n                </h3>\n                \n                <div style=\"margin-bottom: 1.5rem;\">\n                    <div style=\"display: flex; align-items: flex-start; margin-bottom: 1rem;\">\n                        <i class=\"fas fa-map-marker-alt\" style=\"color: #e74c3c; font-size: 1.2rem; margin-right: 0.8rem; margin-top: 0.2rem;\"></i>\n                        <div>\n                            <p style=\"margin: 0; color: #34495e; line-height: 1.6; font-size: 1.5rem;\">\n                                <span data-i18n=\"contact.address.line1\">อาคารสีลม คอมเพล็กซ์ ชั้น 4</span><br>\n                                <span data-i18n=\"contact.address.line2\">เลขที่ 191 Si Lom Rd, Si Lom,</span><br>\n                                <span data-i18n=\"contact.address.line3\">Bang Rak, Bangkok 10500</span>\n                            </p>\n                        </div>\n                    </div>\n                    \n                    <div style=\"display: flex; align-items: center; margin-bottom: 1rem;\">\n                        <i class=\"fas fa-phone\" style=\"color: #2ecc71; font-size: 1.2rem; margin-right: 0.8rem;\"></i>\n                        <a href=\"tel:+6621234567\" style=\"color: #3498db; text-decoration: none; transition: color 0.3s ease; font-size: 1.5rem;\" \n                           data-i18n=\"contact.phone\">\n                            02-613-4711-3 \n                        </a>\n                    </div>\n                </div>\n                \n                <a href=\"https://page.line.me/lgy9487c?openQrModal=true\" \n                   target=\"_blank\" \n                   rel=\"noopener noreferrer\"\n                   style=\"display: inline-flex; align-items: center; background: #00c300; color: white; padding: 0.8rem 1rem; border-radius: 8px; text-decoration: none; font-weight: 600; transition: all 0.3s ease; font-size: 1.7rem; margin-top: 1rem;\">\n                    <i class=\"fab fa-line\" style=\"font-size: 1.5rem; margin-right: 0.5rem;\"></i>\n                    <span data-i18n=\"contact.lineButton\">ติดต่อผ่าน LINE</span>\n                </a>\n            </div>\n        </div>\n    </div>\n</section>"
    };

    // =============================================================================
    // UTILITY FUNCTIONS  
    // =============================================================================

    function scrollToSpecialOffer() {
        const specialOfferSection = document.getElementById('specialOfferSection');
        if (specialOfferSection) {
            specialOfferSection.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        }
    }

    function copyDiscountCode() {
        const discountCode = document.getElementById('discountCode');
        const copyBtn = document.getElementById('copyBtn');
        const copyIcon = document.getElementById('copyIcon');
        const checkIcon = document.getElementById('checkIcon');
        const btnText = document.getElementById('btnText');
        
        if (discountCode && copyBtn) {
            navigator.clipboard.writeText(discountCode.value).then(() => {
                copyBtn.classList.add('copied');
                copyIcon.classList.add('hidden');
                checkIcon.classList.remove('hidden');
                btnText.textContent = 'คัดลอกแล้ว!';
                
                setTimeout(() => {
                    copyBtn.classList.remove('copied');
                    copyIcon.classList.remove('hidden');
                    checkIcon.classList.add('hidden');
                    btnText.textContent = 'คัดลอก';
                }, 2000);
            }).catch(() => {
                alert('เกิดข้อผิดพลาดในการคัดลอก');
            });
        }
    }

    // =============================================================================
    // MAIN COMPONENT CLASS
    // =============================================================================

    class GoldGemComponent {
        constructor(container, options = {}) {
            this.container = typeof container === 'string' ? document.querySelector(container) : container;
            this.options = {
                cdnBase: 'https://cdn.jsdelivr.net/gh/yourusername/gold-gem-component@v1.0.0',
                enableBanner: true,
                enableGoldPrice: true,
                enableCalculator: true,
                enableSpecialOffer: true,
                enableContact: true,
                autoLoadStyles: true,
                ...options
            };
            
            this.currentLanguage = localStorage.getItem('language') || 'th';
            this.translations = EMBEDDED_TRANSLATIONS;
            this.bannerTranslations = BANNER_TRANSLATIONS;
            this.goldTranslations = GOLD_TRANSLATIONS;
            
            if (!this.container) {
                console.error('GoldGemComponent: Container element not found');
                return;
            }

            this.init();
        }

        async init() {
            try {
                if (this.options.autoLoadStyles) {
                    this.loadStyles();
                }
                this.render();
                this.initializeComponents();
                console.log('GoldGemComponent initialized successfully');
            } catch (error) {
                console.error('Failed to initialize GoldGemComponent:', error);
            }
        }

        loadStyles() {
            if (document.querySelector('link[href*="gold-gem-component"]')) {
                return;
            }
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = `${this.options.cdnBase}/dist/gold-gem-component.min.css`;
            document.head.appendChild(link);
        }

        render() {
            let html = '';
            if (this.options.enableBanner) html += HTML_TEMPLATES.bannerSection;
            if (this.options.enableGoldPrice) html += HTML_TEMPLATES.goldPriceSection;
            if (this.options.enableCalculator) html += HTML_TEMPLATES.calculatorSection;
            html += HTML_TEMPLATES.secondaryBannerSection;
            if (this.options.enableSpecialOffer) html += HTML_TEMPLATES.specialOfferSection;
            if (this.options.enableContact) html += HTML_TEMPLATES.contactSection;
            
            this.container.innerHTML = html;
            this.updateAssetUrls();
        }

        updateAssetUrls() {
            const images = this.container.querySelectorAll('img[src^="public/"], img[src^="./public/"]');
            images.forEach(img => {
                const src = img.getAttribute('src');
                const filename = src.replace(/^.?\/public\//, '');
                img.src = `${this.options.cdnBase}/assets/images/${filename}`;
            });

            const elementsWithBgImages = this.container.querySelectorAll('[style*="background-image"]');
            elementsWithBgImages.forEach(el => {
                let style = el.getAttribute('style');
                style = style.replace(/url\(['"]?(?:\.\/)?public\/([^'"]+)['"]?\)/g, 
                    `url('${this.options.cdnBase}/assets/images/$1')`);
                el.setAttribute('style', style);
            });
        }

        initializeComponents() {
            if (this.options.enableBanner) this.initBanner();
            if (this.options.enableGoldPrice) this.initGoldPrice();
            if (this.options.enableCalculator) this.initCalculator();
            if (this.options.enableSpecialOffer) this.initCountdown();
            this.setupGlobalFunctions();
            this.initLanguage();
        }

        initBanner() {
            const bannerContainer = this.container.querySelector('#mainBanner');
            if (bannerContainer) {
                console.log('Banner initialized');
            }
        }

        initGoldPrice() {
            const goldContainer = this.container.querySelector('#goldPriceContainer');
            if (goldContainer) {
                console.log('Gold price component initialized');
            }
        }

        initCalculator() {
            const calcContainer = this.container.querySelector('#calculator-app');
            if (calcContainer) {
                console.log('Calculator initialized');
            }
        }

        initCountdown() {
            console.log('Countdown initialized');
        }

        setupGlobalFunctions() {
            window.scrollToSpecialOffer = scrollToSpecialOffer;
            window.copyDiscountCode = copyDiscountCode;
        }

        initLanguage() {
            this.updateLanguageContent();
        }

        updateLanguageContent() {
            const translations = this.translations[this.currentLanguage];
            
            const elements = this.container.querySelectorAll('[data-i18n]');
            elements.forEach(el => {
                const key = el.getAttribute('data-i18n');
                const value = this.getNestedProperty(translations, key);
                if (value) {
                    el.textContent = value;
                }
            });

            const langElements = this.container.querySelectorAll('[data-lang]');
            langElements.forEach(el => {
                const lang = el.getAttribute('data-lang');
                if (lang === this.currentLanguage) {
                    el.classList.remove('hidden');
                } else {
                    el.classList.add('hidden');
                }
            });
        }

        getNestedProperty(obj, path) {
            return path.split('.').reduce((current, key) => current && current[key], obj);
        }

        switchLanguage() {
            this.currentLanguage = this.currentLanguage === 'th' ? 'en' : 'th';
            localStorage.setItem('language', this.currentLanguage);
            this.updateLanguageContent();
        }

        destroy() {
            if (this.container) {
                this.container.innerHTML = '';
            }
            delete window.scrollToSpecialOffer;
            delete window.copyDiscountCode;
        }
    }

    // =============================================================================
    // EXPOSE TO GLOBAL SCOPE
    // =============================================================================

    global.GoldGemComponent = GoldGemComponent;

    document.addEventListener('DOMContentLoaded', function() {
        const container = document.querySelector('#gold-gem-container');
        if (container && !container.hasAttribute('data-initialized')) {
            container.setAttribute('data-initialized', 'true');
            new GoldGemComponent(container);
        }
    });

})(typeof window !== 'undefined' ? window : this);