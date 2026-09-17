(function () {
  "use strict";

  var FONT_AWESOME_HREF =
    "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css";

  // แก้ไข HTML ของ footer ได้ตรงนี้ เหมือนเขียน HTML ปกติ
  var footerHTML = `
<style>
  #footer { contain: layout; }
    #footer .footer-store-list { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; list-style: none; padding: 0; }
    #footer .footer-store-list li { margin: 0 !important; }
    #footer .footer-store-list li img { height: 28px; width: auto !important; display: block; }
    /* DBD badge อยู่ในคอลัมน์ "จดทะเบียนพาณิชย์" */
    #footer .privacy-mt { padding-left: 12px !important; padding-right: 12px !important; }
    #footer .privacy-mt h6 { text-align: center !important; }
    #footer .footer-dbd-list {
      display: block !important;
      text-align: center !important;
      width: 100% !important;
      padding: 0 !important;
      margin: 0 !important;
    }
    #footer .footer-dbd-list a {
      display: block !important;
      margin: 0 auto 10px auto !important;
      float: none !important;
      width: -moz-fit-content;
      width: fit-content;
    }
    #footer .footer-dbd-list a:last-child { margin-bottom: 0 !important; }
    #footer .footer-dbd-list img {
      height: 28px !important;
      width: auto !important;
      display: block !important;
      margin: 0 auto !important;
      background: #fff;
      padding: 3px 5px;
      border-radius: 8px;
      box-sizing: content-box;
    }
    @media (min-width: 768px) {
      #footer .privacy-mt h6 { text-align: left !important; }
      #footer .footer-dbd-list { text-align: left !important; }
      #footer .footer-dbd-list a { margin-left: 0 !important; margin-right: 0 !important; }
      #footer .footer-dbd-list img { margin: 0 !important; }
    }
</style>
<footer id="footer" class="gold ">
  <div class="container">
    <div class="footer-sub">
      <div class="footer-detail">
        <a href="javascript:void(0);" class="footer-logo">
          <img src="/etc/designs/ausiris-gold/img/logo-footer.svg" height="35px" alt="">
        </a>
        <h6 class="footer-address txt_color3">
          Silom Complex 4th Floor<br>
          191 Silom, Silom, Bangrak<br>
          Bangkok Thailand 10500<br>
          Tel : 0-2613-0888
        </h6>
        <section style="margin: 12px 0 12px 0;">
          <a style="margin: 0 15px 0 0;" href="https://web.facebook.com/ausirisnextgoldinvestment" class="social-i" data-is-external="false" data-has-more="false" data-has-children="true" title="Facebook" data-track="click" data-type="social" data-id="ausiris:footer:social" rel="noopener noreferrer nofollow" target="_blank">
            <svg class="social-icon" xmlns="http://www.w3.org/2000/svg" width="23" height="22" viewBox="0 0 23 22" aria-label="Facebook Icon Button"><path fill="white" fill-rule="evenodd" d="M22.1 11.0C22.1 4.9 17.1 0 11.0 0S0 4.9 0 11.0C0 16.5 4.0 21.1 9.3 22v-7.7h-2.8v-3.1h2.8V8.6c0-2.7 1.6-4.3 4.1-4.3 1.2 0 2.4.216 2.4.216v2.7H14.6c-1.3 0-1.8.853-1.8 1.7v2.0h3.0l-.49 3.2h-2.5V22c5.2-.83 9.3-5.4 9.3-10.9"></path></svg>
          </a>
          <a style="margin: 0 15px 0 0;" href="https://www.instagram.com/ausirisgold/" class="social-i" data-is-external="false" data-has-more="false" data-has-children="true" title="Instagram" data-track="click" data-type="social" data-id="ausiris:footer:social" rel="noopener noreferrer nofollow" target="_blank">
            <svg class="social-icon" xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22" aria-label="Instagram Icon Button"><g fill="white"><path d="M11 0 6.5.1c-1.2.1-2 .2-2.7.5-.7.3-1.4.7-2 1.2A5 5 0 0 0 .5 3.7C.3 4.5.1 5.3.1 6.5L0 11a42.8 42.8 0 0 0 .6 7.2 5 5 0 0 0 1.3 1.9 5 5 0 0 0 1.9 1.3c.7.3 1.5.5 2.7.5l4.5.1 4.5-.1c1.2-.1 2-.2 2.7-.5a5 5 0 0 0 1.9-1.3 5 5 0 0 0 1.3-1.9c.3-.7.5-1.5.5-2.7L22 11l-.1-4.5c-.1-1.2-.2-2-.5-2.7a5 5 0 0 0-1.3-1.9A5 5 0 0 0 18.2.6c-.7-.3-1.5-.5-2.7-.5L11 0zm0 2 4.4.1c1.1 0 1.7.2 2 .4.5.2.9.4 1.3.8s.6.8.8 1.3l.4 2L20 11l-.1 4.4c0 1.1-.2 1.7-.4 2-.2.5-.4.9-.8 1.3s-.8.6-1.3.8l-2 .4-4.4.1H6.6c-1.1 0-1.7-.2-2-.4-.5-.2-.9-.4-1.3-.8s-.6-.8-.8-1.3c-.2-.4-.3-1-.4-2L2 11V6.6c0-1.1.2-1.7.4-2 .2-.6.5-1 .8-1.4l1.3-.8c.4-.2 1-.3 2-.4H11z"></path><path d="M11 14.5c-2 0-3.6-1.6-3.6-3.6C7.4 9 9 7.4 11 7.4S14.6 9 14.6 11a3.7 3.7 0 0 1-3.6 3.5zm0-9C8 5.5 5.5 8 5.5 11S8 16.5 11 16.5s5.5-2.5 5.5-5.5S14 5.5 11 5.5zm6.9-.4c0 .7-.6 1.3-1.3 1.3s-1.3-.6-1.3-1.3c0-.7.6-1.3 1.3-1.3s1.3.6 1.3 1.3"></path></g></svg>
          </a>
          <a style="margin: 0 15px 0 0;" href="https://x.com/ausirisgold" class="social-i" data-is-external="false" data-has-more="false" data-has-children="true" title="Twitter" data-track="click" data-type="social" data-id="ausiris:footer:social" rel="noopener noreferrer nofollow" target="_blank">
            <svg class="social-icon" xmlns="http://www.w3.org/2000/svg" width="21" height="22" viewBox="0 0 1200 1227" aria-label="Twitter Icon Button"><path fill="white" fill-rule="nonzero" d="M714.2,519.3L1160.9,0H1055L667.1,450.9L357.3,0H0l468.5,681.8L0,1226.4h105.9l409.6-476.2l327.2,476.2H1200 L714.2,519.3L714.2,519.3z M569.2,687.8l-47.5-67.9L144,79.7h162.6l304.8,436l47.5,67.9l396.2,566.7H892.5L569.2,687.8L569.2,687.8z "></path></svg>
          </a>
          <a style="margin: 0 15px 0 0;" href="https://www.youtube.com/ausirisgroup" class="social-i" data-is-external="false" data-has-more="false" data-has-children="true" title="Youtube" data-track="click" data-type="social" data-id="ausiris:footer:social" rel="noopener noreferrer nofollow" target="_blank">
            <svg class="social-icon" xmlns="http://www.w3.org/2000/svg" width="30" height="22" viewBox="0 0 32 22" aria-label="YouTube Icon Button"><path fill="white" fill-rule="evenodd" d="M15.6.246c1.2.003 9.7.047 11.9.65a3.8 3.8 0 0 1 2.7 2.7c.602 2.2.646 6.7.65 7.4v.156c-.004.6-.048 5.1-.65 7.4a3.8 3.8 0 0 1-2.7 2.7c-2.2.59-10.4.644-11.9.649h-.457c-1.4-.005-9.7-.059-11.9-.65A3.8 3.8 0 0 1 .65 18.6C.032 16.2.002 11.6 0 11.1v-.07c.002-.452.0-5.1.65-7.4A3.8 3.8 0 0 1 3.3.895C5.6.293 14.1.25 15.3.246zm-3.2 6.2v9.3l8.0-4.6-8.0-4.6z"></path></svg>
          </a>
          <a style="margin: 0 15px 0 0;" href="https://www.tiktok.com/@ausirisgold" class="social-i" data-is-external="false" data-has-more="false" data-has-children="true" title="TikTok" data-track="click" data-type="social" data-id="ausiris:footer:social" rel="noopener noreferrer nofollow" target="_blank">
            <svg class="social-icon" xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" aria-label="TikTok Icon Button"><path fill="white" fill-rule="nonzero" d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.15 2.7 1.68 4.24 1.85v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.93 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"></path></svg>
          </a>
        </section>
      </div>
      <section class="d-flex justify-content-center justify-content-lg-between p-4 border-bottom">
        <div class="text-center text-md-start mt-5">
          <div class="col-xs-6 col-sm-4 col-md-2 col-lg-2 col-xl-2 mx-auto mb-4">
            <h6 class="fw-bold mb-4 txt_color3" style="font-weight: bold;">ผลิตภัณฑ์</h6>
            <p><a href="/content/index/saving.html" class="text-reset txt_color3 list-foo">ออมทอง</a></p>
            <p><a href="/content/index/bullion.html" class="text-reset txt_color3 list-foo">ทองคำแท่ง</a></p>
            <p><a href="/content/index/silver.html" class="text-reset txt_color3 list-foo">เงิน (Silver)</a></p>
            <p><a href="/content/index/products.html" class="text-reset txt_color3 list-foo">สินค้า</a></p>
            <p><a href="https://www.ausirisgoldtrading.com/" class="text-reset txt_color3 list-foo">ซื้อขายทองคำแท่ง</a></p>
            <p><a href="https://express.ausiris.co.th/" class="text-reset txt_color3 list-foo">Express Ausiris</a></p>
          </div>
          <div class="col-xs-6 col-sm-4 col-md-3 col-lg-2 col-xl-2 mx-auto mb-4">
            <h6 class="fw-bold mb-4 txt_color3" style="font-weight: bold;">เกี่ยวกับ Ausiris</h6>
            <p><a href="/content/index/research.html" class="text-reset txt_color3 list-foo">บทวิเคราะห์</a></p>
            <p><a href="/content/index/goldprice.html" class="text-reset txt_color3 list-foo">ราคาทองวันนี้</a></p>
            <p><a href="/content/index/goldprice/historical-goldprice.html" class="text-reset txt_color3 list-foo">ราคาทองเปิด ปิดรายวัน</a></p>
            <p><a href="/content/index/goldprice/gold-asso-daily-update.html" class="text-reset txt_color3 list-foo">ราคาเปลี่ยนระหว่างวัน</a></p>
            <p><a href="/content/index/aboutausiris.html" class="text-reset txt_color3 list-foo">เกี่ยวกับเรา</a></p>
            <p><a href="/content/index/Contact.html" class="text-reset txt_color3 list-foo">ติดต่อเรา</a></p>
            <p><a href="/content/index/blog.html" class="text-reset txt_color3 list-foo">บทความ</a></p>
          </div>
          <div class="col-xs-6 col-sm-4 col-md-3 col-lg-2 col-xl-2 mx-auto mb-4 privacy-mt">
            <h6 class="fw-bold mb-4 txt_color3" style="font-weight: bold;">ความเป็นส่วนตัว</h6>
            <p></p>
            <p><a href="/content/index/aboutausiris/cookies-policy.html" class="text-reset txt_color3 list-foo">นโยบายคุกกี้</a></p>
            <p><a href="/content/index/aboutausiris/Privacy.html" class="text-reset txt_color3 list-foo">Privacy</a></p>
          </div>
          <div class="col-xs-6 col-sm-4 col-md-3 col-lg-2 col-xl-2 mx-auto mb-4 privacy-mt">
            <h6 class="fw-bold mb-4 txt_color3" style="font-weight: bold;">จดทะเบียนพาณิชย์</h6>
            <div class="footer-dbd-list">
              <a href='https://dbdregistered.dbd.go.th/api/public/shopinfoReg?param=DD044653E96B00E20760420B04B935968F717D6C85270302BB59DB9E38B8FC3D' target="_blank">
                <img src='https://dbdregistered.dbd.go.th/api/public/bannerreg?param=DD044653E96B00E20760420B04B935968F717D6C85270302BB59DB9E38B8FC3D' alt="DBD Registered" />
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
    <div class="footer-undersub">
      <h6 class="footer-copyright txt_color3">
        © ${new Date().getFullYear()} Ausiris, All Rights Reserved
      </h6>
      <div class="footer-store-groups">
  
      
        <ul class="footer-store-list footer-store-list--apps">
          <li><a href="http://www.ausirisgroup.com/aspen/" target="_blank"><img class="img-responsive" src="http://www.ausiris.co.th/content/dam/ausirisgold/logo/aspen.png" width="91px" style="border-radius: 5px;" alt=""></a></li>
          <li><a href="https://play.google.com/store/apps/details?id=com.fg.mdp.psi.ausiris&hl=en" target="_blank"><img class="img-responsive" src="/etc/designs/ausiris-gold/img/googleplay.png" width="93px" alt=""></a></li>
          <li><a href="https://itunes.apple.com/th/app/ausiris-gold-investment-trade/id986699897?mt=8" target="_blank"><img class="img-responsive" src="/etc/designs/ausiris-gold/img/appstore.png" width="101px" alt=""></a></li>
        </ul>
      </div>
    </div>
  </div>
</footer>
`;

  function injectFontAwesome() {
    if (document.querySelector('link[data-ausiris-footer-fa]')) return;
    var link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = FONT_AWESOME_HREF;
    link.setAttribute("data-ausiris-footer-fa", "");
    document.head.appendChild(link);
  }

  function renderFooter() {
    if (document.getElementById("footer")) return;
    injectFontAwesome();

    var target = document.getElementById("ausiris-footer");
    if (target) {
      target.innerHTML = footerHTML;
    } else {
      document.body.insertAdjacentHTML("beforeend", footerHTML);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", renderFooter);
  } else {
    renderFooter();
  }
})();
