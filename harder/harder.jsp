<%@ page language="java" %>
<%@ include file="/apps/ausiris-gold/global.jsp" %>
<%@ page contentType="text/html; charset=utf-8" 
    import="java.util.*,
    com.day.cq.commons.Externalizer,
	com.day.cq.wcm.commons.WCMUtils,
	org.apache.commons.lang.StringUtils,
	com.day.cq.commons.Externalizer,
	info.geometrixx.commons.util.GeoHelper,
	javax.jcr.Session"
%>
<%@page import="java.util.Set" %>
<%@page import="java.util.HashMap" %>
<%
	com.annotate.aem.components.login.KeyService keyService = sling.getService(com.annotate.aem.components.login.KeyService.class);

	String user_id = (String)session.getAttribute("user_id");
	String img_profile = "";
	String t_title = "";
	String t_firstname = "";
	String t_surname = "";
	String email = "";
	String username = "";
//String s_step = "";
	int step = 0;

    if(user_id != null){
        keyService.setUser(user_id);

		img_profile = keyService.getProfile().get("img_profile");
		t_title = (String)session.getAttribute("t_title");
        t_firstname = (String)session.getAttribute("t_firstname");
        t_surname = (String)session.getAttribute("t_surname");
        email = (String)session.getAttribute("email");
		username = (String)keyService.getProfile().get("username");
        //s_step = keyService.getProfile().get("step");
        //step =  Integer.parseInt(keyService.getProfile().get("step"));

        if(img_profile == null || img_profile.isEmpty()){
            switch (t_title) {
              case "ห้างทอง":
					img_profile = "/etc/designs/ausiris-gold/img/user/men.svg";
                    break;
              case "นาย": 
					img_profile = "/etc/designs/ausiris-gold/img/user/men.svg";
                    break;
              case "นางสาว":        
					img_profile = "/etc/designs/ausiris-gold/img/user/women.svg";
                    break;
              case "นาง":        
					img_profile = "/etc/designs/ausiris-gold/img/user/women.svg";
                    break;
              default:
                    img_profile = "/etc/designs/ausiris-gold/img/user/men.svg";
                    break;
            }
        }
    }
%>
<%@ page import="java.util.Iterator,com.day.text.Text, com.day.cq.wcm.api.PageFilter, com.day.cq.wcm.api.Page" %>
	<div class="video-popup" id="video-popup" style="display: none;">
		<div class="wrapper">
			<div class="title">
				<a href="javascript:void(0);" id="video-close" class="close-video">
					Close <i class="fa fa-close" aria-hidden="true"></i>
				</a>
			</div>
		    <video id="videoplay" controls="" style="background: #FFF;">
                <source src="http://www.ausiris.co.th/content/dam/ausirisgold/video/ausiris_manual_new.mp4" type="video/mp4">
		         Your browser does not support HTML5 video.
		    </video>
		</div>
	</div>
	<style type="text/css" media="screen">
		/* line 1626, ../sass/_content.scss */
		.video-popup {
		  display: none;
		  position: fixed;
		  z-index: 120;
		  top: 0;
		  bottom: 0;
		  left: 0;
		  right: 0;
		  background: rgba(0, 0, 0, 0.7);
		}
		/* line 1635, ../sass/_content.scss */
		.video-popup > .wrapper {
		  margin: 50px auto;
		}
		@media (min-width: 1140px) {
		  /* line 1635, ../sass/_content.scss */
		  .video-popup > .wrapper {
		    width: 70%;
		  }
		}
		@media (min-width: 720px) and (max-width: 1139px) {
		  /* line 1635, ../sass/_content.scss */
		  .video-popup > .wrapper {
		    width: 70%;
		  }
		}
		@media (min-width: 320px) and (max-width: 719px) {
		  /* line 1635, ../sass/_content.scss */
		  .video-popup > .wrapper {
		    width: 90%;
		  }
		}
		@media (min-width: 0px) and (max-width: 319px) {
		  /* line 1635, ../sass/_content.scss */
		  .video-popup > .wrapper {
		    width: 90%;
		  }
		}
		/* line 1650, ../sass/_content.scss */
		.video-popup > .wrapper .title {
		  text-align: right;
		}
		/* line 1652, ../sass/_content.scss */
		.video-popup > .wrapper .title .close-video {
		  display: inline-block;
		  vertical-align: top;
		  zoom: 1;
		  /* Fix for IE7 */
		  *display: inline;
		  /* Fix for IE7 */
		  color: #FFF;
		  font-size: 16px;
		  margin: 10px 0;
		}
		/* line 1662, ../sass/_content.scss */
		.video-popup > .wrapper video {
		  width: 100%;
		  background: #FFF;
		  -moz-box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.5);
		  -webkit-box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.5);
		  box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.5);
		}
	</style>
	<script>
		$(document).on('click', 'a.btn-w[href="#video1.html"]', function(event) {
			event.preventDefault();
			/* Act on the event */
			$("#video-popup").fadeToggle();
			$("#videoplay")[0].play();
		});

		$(document).on('click','#video-close',function(ev){
			ev.preventDefault();
			$(".video-popup").fadeOut();
			$("#videoplay")[0].pause();
		});
	</script>
<header>
    <div id="header-slide">
        <div class="container">

            <% if(user_id != null){ %> 
                <div class="header-slide-user">
                    <div class="header-slide-user-header">
						<%=t_firstname%> <%=t_surname%>
                    </div>
                    <div class="header-slider-user-status">
                        <div class="register-profile">
                            <div class="register-profile-list border" >
                                <div class="left">โปรแกรมออมทอง</div>
                                <div class="right"><a href="javascript:void(0);" id="user-open-saving-m">เปิดบัญชี</a></div>
                            </div>
                            <div class="register-profile-list">
                                <div class="left">ทองคำแท่งออนไลน์ </div>
                                <div class="right"><a href="javascript:void(0);" id="user-open-trade-m">เปิดบัญชี</a></div>
                            </div>
                        </div>                    
                    </div>
                </div>            
                <ul class="header-slide-list">
                    <%@include file="/apps/ausiris-gold/components/menu-list/menu-list-user.jsp"%>
                </ul>
         		<a href="/services/logout?page=index.html" class="header-logout">ออกจากระบบ</a>

            <% } else { %>

            	<ul class="header-slide-list header-margin">

            		<%@include file="/apps/ausiris-gold/components/menu-list/menu-list-user.jsp"%>
					<li><a class="txt_color2" href="https://express.ausiris.co.th/">Ausiris Online Store</a></li>
                </ul>

            <% } %>

        </div>
    </div>
    <div class="menu-mobile gold" id="menu-nav">
      <div class="bar"></div>    
    </div>
    <!-- End Mobile -->

    <div id="header" class="gold">
        <div class="container" style="width: 1370px;">
           <div class="logo">
               <a href="/content/index.html">
                     <img src="/etc/designs/ausiris-gold/img/logo.svg" height="35px" alt="">
               </a>
           </div>
            <nav>

                <ul class="menu-list dropdown-content" id="nav" role="tablist">
                    <% if(user_id != null){ %> 
                        <%@include file="/apps/ausiris-gold/components/menu-list/menu-list.jsp"%>
                    <% } else { %>
                        <%@include file="/apps/ausiris-gold/components/menu-list/menu-list.jsp"%>
                    <% } %>

		<!--
 			<li class="dropdown">
     			<a href="#" class="dropdown-toggle" data-toggle="dropdown">อื่นๆ</a>
        			<ul id="products-menu" class="dropdown-menu clearfix" role="menu">
            			<li><a class="txt_color2" href="https://blog.ausiris.co.th/" target="_blank">บทความ</a></li>
            			<li><a href="">B</a></li>
            			<li><a href="">C</a></li>
            			<li><a href="">D</a></li>
        			</ul>
    		</li>
		-->
                </ul>

                <div class="search disable">
                   <a href="javascript:void(0);" class="search-btn"></a>
                </div>

                    <% if(user_id != null){ %> 
                    <div class="user">

                        <script type="text/javascript">
                            $g_username = '<%=username%>';
                        </script>
                        <% String account_id1 = (String)session.getAttribute("account_id1");
                           String account_id2 = (String)session.getAttribute("account_id2");                                        
						%>
                       <% if(step == 1){ %>
                           <a href="/content/index/customer/open-account.html" class="btn-w btn-w-color10 btn-w-s">เปิดบัญชีออนไลน์</a>
                       <% } else if(step == 2){ %>
                           <a href="/content/index/customer/open-account-verified.html" class="btn-w btn-w-color10 btn-w-s">กลับเข้าสู่หน้าเปิดบัญชี</a>
                       <% } else if(step == 3){ %>
                           <a href="/content/index/customer/openaccount-final.html" class="btn-w btn-w-color10 btn-w-s">กลับเข้าสู่หน้าเปิดบัญชี</a>
                       <% } else if(step == 4){  %>

                       <% } else if(step == 5){ %>
                        <a href="https://express.ausiris.co.th/" target="_blank" class="btn-w btn-w-color10 btn-w-s">Ausiris Online Store</a>
                       <% } else if(step == 0){ %>
							<!-- <a href="/content/index/customer/register.html" class="btn-w btn-w-color10 btn-w-s">เปิดบัญชีออนไลน์</a> -->
                        	<a href="/content/index/redirect.html" class="btn-w btn-w-color10 btn-w-s js-trade-choice ags-has-dd">ระบบซื้อขายทองคำแท่ง</a>
                       <% } %>

                     </div>
                        <div id="userheader">
                            <div class="user-icon" style="background: url('<%=img_profile%>');"></div>
                            <div class="popup-box" id="userheader-popup">

                                <div class="loading form-loading" id="loading-user-popup" style="display: none;">
                                    <div class="loading-icon">
                                        <div class="loading-l"></div>
                                        <div class="loading-r"></div>
                                    </div>
                                </div>                                
                                <div class="first-row">
                                   <div class="register-profile">
                                        <div class="register-profile-name"><%=t_firstname%> <%=t_surname%></div>
                                        <div class="register-profile-list border" >
                                            <div class="left">โปรแกรมออมทอง</div>
                                            <div class="right"><a href="javascript:void(0);" id="user-open-saving">เปิดบัญชี</a></div>
                                        </div>
                                        <div class="register-profile-list">
                                            <div class="left">ทองคำแท่งออนไลน์ </div>
                                            <div class="right"><a href="javascript:void(0);" id="user-open-trade">เปิดบัญชี</a></div>
                                        </div>
                                   </div>

                                </div>
                                <div class="second-row">
                                    <ul class="main-menu">
                                        <li class="sub-menu disable"><a class="link" href="/content/index/dashboard.html">แดชบอร์ด</a></li>
                                        <li class="sub-menu disable"><a class="link" href="/content/index/register/editprofile.html">แก้ไขโปรไฟล์</a></li>
                                        <li class="sub-menu" style="width: 100%; border-radius: 0 0 3px 3px;"><a class="link" href="/services/logout?page=index.html">ออกจากระบบ</a></li>
                                    </ul>
                                </div>
                                <div class="triangle"></div>
                            </div>
                        </div>
                    <% } else { %>
                	<div class="user" style="margin-left: 70px;">
                        <a href="https://ausirisnext.com/" target="_blank" class="btn-w btn-w-color10 btn-w-s js-trade-choice ags-has-dd" style="padding: 3px 18px;" >ระบบซื้อขายทองคำแท่ง</a>
   						<a href="https://express.ausiris.co.th/" target="_blank" class="btn-w btn-w-color10 btn-w-s" style="padding: 3px 18px;">Ausiris Online Store</a> 

                     </div>
                    <% } %>

            </nav>
        </div>
          </div>

</header>

<!-- ===== Dropdown เลือกระบบซื้อขายทองคำแท่ง ===== -->
<div class="ags-dd" id="agsTradeDropdown">
    <a class="ags-dd-item" href="https://www.ausirisgoldtrading.com/" target="_blank" rel="noopener">
        <span class="ags-dd-name">Ausiris Gold Trading</span>
        <span class="ags-dd-desc">ระบบซื้อขายทองคำแท่งออนไลน์</span>
    </a>
    <a class="ags-dd-item" href="https://ausirisnext.com/trade/auth/login" target="_blank" rel="noopener">
        <span class="ags-dd-name">Ausiris Next</span>
        <span class="ags-dd-desc">ระบบซื้อขายทองคำแท่งรูปแบบใหม่</span>
    </a>
    <a class="ags-dd-item" href="https://www.mygoldplus.in.th/" target="_blank" rel="noopener">
        <span class="ags-dd-name">MyGOLD Plus</span>
        <span class="ags-dd-desc">ช้อป ออม ลงทุนทองคำ ผ่านแอปพลิเคชัน</span>
    </a>
</div>

<!-- ===== Dropdown เกี่ยวกับเรา (รวม เกี่ยวกับเรา + ติดต่อเรา) =====
     href จะถูก sync จากเมนูจริงของ AEM ตอนโหลด ดูสคริปต์ท้ายไฟล์ -->
<div class="ags-dd" id="agsAboutDropdown">
    <a class="ags-dd-item" href="/content/index/aboutausiris.html">
        <span class="ags-dd-name">เกี่ยวกับออสสิริส</span>
        <span class="ags-dd-desc">ประวัติและข้อมูลบริษัท</span>
    </a>
    <a class="ags-dd-item" href="/content/index/Contact.html">
        <span class="ags-dd-name">ติดต่อเรา</span>
        <span class="ags-dd-desc">ที่อยู่ เบอร์โทร และแผนที่</span>
    </a>
</div>

<!-- ===== Dropdown Silver (หน้าหลัก + ราคาย้อนหลัง 2 แบบ) =====
     href ของรายการแรกจะถูก sync จากเมนูจริงของ AEM ตอนโหลด -->
<div class="ags-dd" id="agsSilverDropdown">
    <a class="ags-dd-item" href="/content/index/silver.html">
        <span class="ags-dd-name">Silver</span>
        <span class="ags-dd-desc">ภาพรวม ข่าวสาร และสินค้าเงินแท่ง 99.99%</span>
    </a>
    <a class="ags-dd-item" href="/content/index/silver/silver-history.html">
        <span class="ags-dd-name">ราคาเงินแท่งย้อนหลัง</span>
        <span class="ags-dd-desc">ราคาปิดรายเดือน ย้อนหลังหลายปี</span>
    </a>
    <a class="ags-dd-item" href="/content/index/silver/silver-hour.html">
        <span class="ags-dd-name">ราคาเงินแท่งรายชั่วโมง</span>
        <span class="ags-dd-desc">ความเคลื่อนไหวของราคาแบบรายชั่วโมง</span>
    </a>
</div>
<link href="https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<style type="text/css">
    /* การ์ดใช้ฟอนต์ Prompt ชุดเดียวกับหน้าอื่นในเว็บ ไม่อิงฟอนต์ของ header */
    .ags-dd, .ags-dd-item, .ags-dd-name, .ags-dd-desc {
        font-family: 'Prompt', "Helvetica Neue", Arial, sans-serif;
    }
    .ags-dd {
        display: none; position: fixed; top: 0; left: 0; z-index: 99999;
        min-width: 240px; background: #fff; border: 1px solid #e6e6e6; border-radius: 8px;
        box-shadow: 0 8px 22px rgba(0,0,0,.16); padding: 6px 0; text-align: left;
    }
    .ags-dd.is-open { display: block; }
    .ags-dd:before {
        content: ""; position: absolute; top: -6px; right: 22px;
        width: 10px; height: 10px; background: #fff;
        border-left: 1px solid #e6e6e6; border-top: 1px solid #e6e6e6;
        -webkit-transform: rotate(45deg); transform: rotate(45deg);
    }
    .ags-dd.is-up:before {
        top: auto; bottom: -6px;
        border-left: 0; border-top: 0;
        border-right: 1px solid #e6e6e6; border-bottom: 1px solid #e6e6e6;
    }
    .ags-dd-item {
        display: block; padding: 10px 20px; text-decoration: none; color: #333;
        border-bottom: 1px solid #f2f2f2;
    }
    .ags-dd-item:last-child { border-bottom: 0; }
    .ags-dd-item:hover, .ags-dd-item:focus { background: #faf6ef; text-decoration: none; color: #333; }
    .ags-dd-name { display: block; font-size: 15px; color: #002458; line-height: 1.4; }
    .ags-dd-desc { display: block; font-size: 12px; color: #999; line-height: 1.4; }
    /* การ์ดที่เปิดจากเมนูกลางแถบ ให้ชิดซ้ายของเมนู (ลูกศรย้ายตาม) */
    .ags-dd.is-left:before { right: auto; left: 22px; }
    /* ลูกศรเล็กๆ บอกว่าเมนูนี้กดแล้วมีเมนูย่อย */
    .ags-has-dd:after {
        content: ""; display: inline-block; margin-left: 6px; vertical-align: middle;
        border: 4px solid transparent; border-bottom: 0; border-top-color: currentColor;
    }

    /* ===== เมนูย่อยบนมือถือ: กางในลิสต์ (accordion) แทนการ์ดลอยแบบ desktop =====
       selector ต้องชนะ "#header-slide .header-slide-list li a" ของดีไซน์เดิม เลยต้องเขียนยาวแบบนี้ */
    #header-slide .header-slide-list li.ags-m-item { position: relative; }
    #header-slide .header-slide-list li.ags-m-item.is-open { background: #faf6ef; }
    #header-slide .header-slide-list li.ags-m-item.is-open > a.ags-m-toggle { color: #a9814f; }
    /* ปุ่มลูกศรฝั่งขวา สำหรับเมนูที่แตะชื่อแล้วไปหน้านั้นเลย (เช่น Silver) */
    #header-slide .header-slide-list li a.ags-m-more {
        position: absolute; top: 0; right: 0; width: 66px;
        padding: 20px 0; line-height: 18px;   /* สูงเท่าแถวเมนูเดิม (padding/line-height ชุดเดียวกัน) */
        border-bottom: 0; text-align: center;
    }
    /* ลูกศรบอกว่ากดแล้วกางได้ (หมุนขึ้นเมื่อเปิด) */
    #header-slide .ags-m-caret {
        display: inline-block; width: 7px; height: 7px; margin: -4px 0 0 9px;
        border-right: 2px solid currentColor; border-bottom: 2px solid currentColor;
        vertical-align: middle;
        -webkit-transform: rotate(45deg); transform: rotate(45deg);
        -webkit-transition: -webkit-transform .25s ease; transition: transform .25s ease;
    }
    #header-slide .ags-m-more .ags-m-caret { margin-left: 0; }
    #header-slide .header-slide-list li.ags-m-item.is-open > a.ags-m-more { color: #a9814f; }
    #header-slide .ags-m-item.is-open .ags-m-caret {
        margin-top: 2px;
        -webkit-transform: rotate(-135deg); transform: rotate(-135deg);
    }
    #header-slide .ags-m-panel {
        max-height: 0; overflow: hidden;
        -webkit-transition: max-height .3s ease; transition: max-height .3s ease;
    }
    #header-slide .ags-m-item.is-open > .ags-m-panel { max-height: 500px; }
    /* กล่องขาวข้างใน = การ์ดชุดเดียวกับ desktop แต่วางอยู่ในลิสต์ */
    #header-slide .ags-m-panel-inner {
        margin: 2px 14px 14px; background: #fff; border: 1px solid #ece3d4;
        border-radius: 10px; overflow: hidden;
        box-shadow: 0 4px 14px rgba(0, 0, 0, .06);
        font-family: 'Prompt', "Helvetica Neue", Arial, sans-serif;
    }
    #header-slide .header-slide-list li a.ags-m-sub {
        display: block; padding: 13px 16px; text-align: center; text-decoration: none;
        border-bottom: 1px solid #f4efe6;
    }
    #header-slide .header-slide-list li a.ags-m-sub.is-last { border-bottom: 0; }
    #header-slide .header-slide-list li a.ags-m-sub:active { background: #faf6ef; }
    #header-slide .ags-m-name {
        display: block; font-size: 15px; color: #002458; line-height: 1.45;
    }
    #header-slide .ags-m-desc {
        display: block; font-size: 12px; color: #9a9a9a; line-height: 1.45; margin-top: 1px;
    }
</style>
<script type="text/javascript">
(function () {
    if (window.__agsTradeDropdown) { return; }
    window.__agsTradeDropdown = true;

    var TRIGGER = 'js-trade-choice';
    // ลิงก์ที่ให้เปิด dropdown ด้วย แม้จะอยู่ในไฟล์อื่น (เช่น เมนูมือถือ menu-list-user.jsp)
    var HREF = /\/redirect\.html($|[?#])|^https?:\/\/(www\.)?ausirisnext\.com\/?($|[?#])/i;
    var MENU_ATTR = 'data-ags-dd';      // ปุ่มไหนเปิดการ์ดใบไหน (ไม่ใส่ = การ์ดซื้อขายทองคำแท่ง)
    var DEFAULT_MENU = 'agsTradeDropdown';
    var current = null;                 // ปุ่มที่เปิดอยู่
    var currentMenu = null;             // การ์ดที่เปิดอยู่
    var closeTimer = null;
    // เปิดด้วย hover เฉพาะเครื่องที่ใช้เมาส์จริง (มือถือ/แท็บเล็ตยังใช้แตะเหมือนเดิม)
    var HOVER = !!(window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches);

    function hasClass(el, name) {
        return el.className && (' ' + el.className + ' ').indexOf(' ' + name + ' ') > -1;
    }

    function menuFor(btn) {
        var id = (btn.getAttribute && btn.getAttribute(MENU_ATTR)) || DEFAULT_MENU;
        return document.getElementById(id);
    }

    function isTrigger(el) {
        if (!el.getAttribute) { return false; }
        if (el.getAttribute(MENU_ATTR)) { return true; }
        if (hasClass(el, TRIGGER)) { return true; }
        var h = el.getAttribute('href');
        return !!(h && HREF.test(h));
    }

    function closestTrigger(el) {
        while (el && el !== document) {
            // ในเมนูมือถือใช้ accordion (ดูสคริปต์ท้ายไฟล์) ไม่ต้องเด้งการ์ดลอยทับจอ
            if (el.id === 'header-slide') { return null; }
            if (isTrigger(el)) { return el; }
            el = el.parentNode;
        }
        return null;
    }

    function inMenu(el) {
        while (el && el !== document) {
            if (hasClass(el, 'ags-dd')) { return true; }
            el = el.parentNode;
        }
        return false;
    }

    function cancelClose() {
        if (closeTimer) { clearTimeout(closeTimer); closeTimer = null; }
    }

    function close() {
        cancelClose();
        if (currentMenu) { currentMenu.className = 'ags-dd'; }
        current = null;
        currentMenu = null;
    }

    // หน่วงก่อนปิด เผื่อเมาส์กำลังเลื่อนจากปุ่มข้ามช่องว่างลงมาในเมนู
    function closeLater() {
        cancelClose();
        closeTimer = setTimeout(close, 250);
    }

    function openUnder(btn) {
        var m = menuFor(btn);
        if (!m) { return false; }
        cancelClose();
        if (currentMenu && currentMenu !== m) { currentMenu.className = 'ags-dd'; }

        // ปุ่มมุมขวา -> ชิดขวา, เมนูกลางแถบ (data-ags-align="left") -> ชิดซ้าย
        var alignLeft = btn.getAttribute && btn.getAttribute('data-ags-align') === 'left';
        var cls = 'ags-dd is-open' + (alignLeft ? ' is-left' : '');
        m.className = cls;

        var r = btn.getBoundingClientRect();
        var w = m.offsetWidth;
        var left = alignLeft ? r.left : r.right - w;
        if (left + w > window.innerWidth - 8) { left = window.innerWidth - 8 - w; }
        if (left < 8) { left = 8; }              // กันตกขอบจอ (มือถือ)

        var h = m.offsetHeight;
        var top = r.bottom + 10;                 // ปกติเปิดลงล่าง
        if (top + h > window.innerHeight - 8 && r.top - 10 - h > 8) {
            top = r.top - 10 - h;                // ล่างไม่พอ -> เด้งขึ้นบน
            m.className = cls + ' is-up';
        }
        m.style.top = top + 'px';
        m.style.left = left + 'px';
        current = btn;
        currentMenu = m;
        return true;
    }

    document.addEventListener('click', function (e) {
        if (inMenu(e.target)) { return; }   // คลิกตัวเลือกในเมนู -> ไปตามลิงก์ปกติ
        var btn = closestTrigger(e.target);
        if (btn) {
            // เมนูที่มีหน้าของตัวเอง (data-ags-nav) -> hover ดูการ์ดได้ แต่คลิกไปหน้านั้นเลย
            if (btn.getAttribute('data-ags-nav')) { close(); return; }
            if (current === btn) {
                e.preventDefault();
                // บนเมาส์เมนูเปิดค้างจาก hover อยู่แล้ว คลิกซ้ำไม่ต้องปิด
                if (!HOVER) { close(); }
                return;
            }
            // ถ้าเมนูไม่ถูกโหลด ให้ลิงก์เดิมทำงานตามปกติ
            if (openUnder(btn)) { e.preventDefault(); }
            return;
        }
        close();
    }, false);

    if (HOVER) {
        document.addEventListener('mouseover', function (e) {
            if (inMenu(e.target)) { cancelClose(); return; }
            var btn = closestTrigger(e.target);
            if (!btn) { return; }
            if (current === btn) { cancelClose(); return; }
            openUnder(btn);
        }, false);

        document.addEventListener('mouseout', function (e) {
            if (!current) { return; }
            if (!inMenu(e.target) && !closestTrigger(e.target)) { return; }
            var to = e.relatedTarget;
            // ยังวนอยู่ในปุ่มเดิมหรือในเมนู -> ไม่ต้องปิด
            if (to && (inMenu(to) || closestTrigger(to) === current)) { return; }
            closeLater();
        }, false);
    }

    document.addEventListener('keydown', function (e) {
        if (e.keyCode === 27) { close(); }
    }, false);

    // ให้เมนูเลื่อนตามปุ่มเสมอ (กรณี header เลื่อน/ย่อจอ)
    function reposition() {
        if (current) { openUnder(current); }
    }
    window.addEventListener('resize', reposition, false);
    window.addEventListener('scroll', reposition, true);
}());
</script>

<script type="text/javascript">
// รวมเมนู "เกี่ยวกับเรา" + "ติดต่อเรา" ในแถบ desktop ให้เหลือรายการเดียว
// (เมนู desktop generate จาก AEM ผ่าน menu-list.jsp เลยมาจับตอน render เสร็จแทนการแก้ JSP)
// หมายเหตุ: ฝั่งมือถือ (.header-slide-list) รวมให้เหมือนกัน แต่ทำเป็น accordion ดูสคริปต์ท้ายไฟล์
(function () {
    if (window.__agsAboutMerge) { return; }
    window.__agsAboutMerge = true;

    var ABOUT = /aboutausiris\.html($|[?#])/i;
    var CONTACT = /contact\.html($|[?#])/i;

    function ready(fn) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', fn, false);
        } else {
            fn();
        }
    }

    ready(function () {
        var nav = document.getElementById('nav');
        var card = document.getElementById('agsAboutDropdown');
        if (!nav || !card) { return; }

        var links = nav.getElementsByTagName('a');
        var about = null, contact = null;
        for (var i = 0; i < links.length; i++) {
            var h = links[i].getAttribute('href') || '';
            if (!about && ABOUT.test(h)) { about = links[i]; }
            else if (!contact && CONTACT.test(h)) { contact = links[i]; }
        }
        // โครงเมนูจาก AEM เปลี่ยน -> ปล่อยเมนูเดิมไว้ ดีกว่าทำพัง
        if (!about || !contact) { return; }

        // ให้ลิงก์ในการ์ดตรงกับที่ AEM สร้างจริงเสมอ
        var items = card.getElementsByTagName('a');
        if (items[0]) { items[0].setAttribute('href', about.getAttribute('href')); }
        if (items[1]) { items[1].setAttribute('href', contact.getAttribute('href')); }

        // "เกี่ยวกับเรา" กลายเป็นปุ่มเปิดการ์ด
        about.setAttribute('data-ags-dd', 'agsAboutDropdown');
        about.setAttribute('data-ags-align', 'left');
        about.className = about.className ? about.className + ' ags-has-dd' : 'ags-has-dd';

        // เอา <li> ของ "ติดต่อเรา" ออกจากแถบเมนู (ย้ายเข้าไปอยู่ในการ์ดแล้ว)
        var li = contact;
        while (li && li.parentNode && li.parentNode !== nav) { li = li.parentNode; }
        if (li && li.parentNode === nav) { nav.removeChild(li); }
    });
}());
</script>

<script type="text/javascript">
// เมนู "Silver" ในแถบ desktop -> เปิดการ์ด (หน้าหลัก + ราคาย้อนหลังรายเดือน/รายชั่วโมง)
(function () {
    if (window.__agsSilverMenu) { return; }
    window.__agsSilverMenu = true;

    var SILVER = /\/silver\.html($|[?#])/i;

    function ready(fn) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', fn, false);
        } else {
            fn();
        }
    }

    ready(function () {
        var nav = document.getElementById('nav');
        var card = document.getElementById('agsSilverDropdown');
        if (!nav || !card) { return; }

        var links = nav.getElementsByTagName('a');
        var silver = null;
        for (var i = 0; i < links.length; i++) {
            if (SILVER.test(links[i].getAttribute('href') || '')) { silver = links[i]; break; }
        }
        // ไม่เจอเมนู Silver (โครงจาก AEM เปลี่ยน) -> ปล่อยไว้ ดีกว่าทำพัง
        if (!silver) { return; }

        // รายการแรกของการ์ด = หน้าเดิมของเมนู ให้ตรงกับที่ AEM สร้างจริงเสมอ
        var items = card.getElementsByTagName('a');
        if (items[0]) { items[0].setAttribute('href', silver.getAttribute('href')); }

        silver.setAttribute('data-ags-dd', 'agsSilverDropdown');
        silver.setAttribute('data-ags-align', 'left');
        // Silver มีหน้าของตัวเอง: เอาเมาส์ชี้ = เห็นการ์ด, คลิก = เข้าหน้า Silver เลย
        silver.setAttribute('data-ags-nav', '1');
        silver.className = silver.className ? silver.className + ' ags-has-dd' : 'ags-has-dd';
    });
}());
</script>

<script type="text/javascript">
// ===== เมนูย่อยบนมือถือ (#header-slide) =====
// มือถือแตะแล้วการ์ดลอยแบบ desktop ใช้ไม่ได้ เลยกางเป็น accordion ในลิสต์แทน
// เนื้อหาอ่านจากการ์ด .ags-dd ชุดเดิม -> แก้รายการที่การ์ดที่เดียว ได้ทั้ง desktop + mobile
(function () {
    if (window.__agsMobileSubmenu) { return; }
    window.__agsMobileSubmenu = true;

    var ABOUT = /aboutausiris\.html($|[?#])/i;
    var CONTACT = /contact\.html($|[?#])/i;
    var SILVER = /\/silver\.html($|[?#])/i;
    var TRADE = /\/redirect\.html($|[?#])|^https?:\/\/(www\.)?ausirisnext\.com\/?($|[?#])/i;

    function ready(fn) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', fn, false);
        } else {
            fn();
        }
    }

    function hasClass(el, name) {
        return el.className && (' ' + el.className + ' ').indexOf(' ' + name + ' ') > -1;
    }

    // หา <span> ลูกที่เป็น class ที่ต้องการ (เลี่ยง querySelector เผื่อ browser เก่า)
    function spanIn(el, name) {
        var c = el.childNodes;
        for (var i = 0; i < c.length; i++) {
            if (c[i].nodeType === 1 && hasClass(c[i], name)) { return c[i]; }
        }
        return null;
    }

    function linkIn(list, re) {
        var a = list.getElementsByTagName('a');
        for (var i = 0; i < a.length; i++) {
            if (re.test(a[i].getAttribute('href') || '')) { return a[i]; }
        }
        return null;
    }

    function liOf(el, list) {
        while (el && el.parentNode && el.parentNode !== list) { el = el.parentNode; }
        return (el && el.parentNode === list) ? el : null;
    }

    // แปลงการ์ดของ desktop -> panel ของ accordion
    // skipHref: ตัดรายการที่ซ้ำกับตัวเมนูเองออก (เมนูที่แตะชื่อแล้วไปหน้านั้นอยู่แล้ว)
    function panelFrom(cardId, skipHref) {
        var card = document.getElementById(cardId);
        if (!card) { return null; }
        var items = card.getElementsByTagName('a');
        if (!items.length) { return null; }

        var panel = document.createElement('div');
        panel.className = 'ags-m-panel';
        var inner = document.createElement('div');
        inner.className = 'ags-m-panel-inner';

        for (var i = 0; i < items.length; i++) {
            var src = items[i];
            if (skipHref && src.getAttribute('href') === skipHref) { continue; }
            var a = document.createElement('a');
            a.className = 'ags-m-sub';
            a.setAttribute('href', src.getAttribute('href') || '#');
            if (src.getAttribute('target')) { a.setAttribute('target', src.getAttribute('target')); }
            if (src.getAttribute('rel')) { a.setAttribute('rel', src.getAttribute('rel')); }

            var name = spanIn(src, 'ags-dd-name');
            var desc = spanIn(src, 'ags-dd-desc');
            var n = document.createElement('span');
            n.className = 'ags-m-name';
            n.innerHTML = name ? name.innerHTML : src.innerHTML;
            a.appendChild(n);
            if (desc) {
                var d = document.createElement('span');
                d.className = 'ags-m-desc';
                d.innerHTML = desc.innerHTML;
                a.appendChild(d);
            }
            inner.appendChild(a);
        }
        if (!inner.childNodes.length) { return null; }
        inner.childNodes[inner.childNodes.length - 1].className += ' is-last';
        panel.appendChild(inner);
        return panel;
    }

    // หา element ที่เลื่อนได้ที่ครอบอยู่ เผื่อการ์ดที่กางออกตกขอบล่างจอ
    function scroller(el) {
        while (el && el !== document.body) {
            if (el.scrollHeight > el.clientHeight + 4) { return el; }
            el = el.parentNode;
        }
        return null;
    }

    function keepInView(li) {
        setTimeout(function () {
            var over = li.getBoundingClientRect().bottom - window.innerHeight + 16;
            if (over <= 0) { return; }
            var sc = scroller(li.parentNode);
            if (sc) { sc.scrollTop += over; }
            else if (window.scrollBy) { window.scrollBy(0, over); }
        }, 320);
    }

    // เปิดได้ทีละอัน ลิสต์จะได้ไม่ยาวเกินจอ
    function toggle(list, li) {
        var open = hasClass(li, 'is-open');
        var all = list.childNodes;
        for (var i = 0; i < all.length; i++) {
            if (all[i].nodeType === 1 && hasClass(all[i], 'is-open')) {
                all[i].className = all[i].className.replace(/\s*is-open/, '');
                if (all[i].agsBtn) { all[i].agsBtn.setAttribute('aria-expanded', 'false'); }
            }
        }
        if (open) { return; }
        li.className = li.className + ' is-open';
        if (li.agsBtn) { li.agsBtn.setAttribute('aria-expanded', 'true'); }
        keepInView(li);
    }

    // เปลี่ยนลิงก์ธรรมดาในเมนูมือถือให้เป็นหัว accordion
    // keepLink = true: แตะชื่อเมนู -> ไปหน้าเดิมเลย, เมนูย่อยกางด้วยปุ่มลูกศรฝั่งขวา
    function accordion(list, link, cardId, keepLink) {
        var li = liOf(link, list);
        var href = link.getAttribute('href');
        var panel = li && panelFrom(cardId, keepLink ? href : null);
        if (!panel) { return null; }

        li.className = li.className ? li.className + ' ags-m-item' : 'ags-m-item';

        var caret = document.createElement('i');
        caret.className = 'ags-m-caret';

        var btn;
        if (keepLink) {
            // ปุ่มแยกฝั่งขวา ไม่ไปทับพื้นที่กดของชื่อเมนู
            btn = document.createElement('a');
            btn.className = 'ags-m-more';
            btn.setAttribute('href', 'javascript:void(0);');
            btn.setAttribute('aria-label', 'เมนูย่อย');
            btn.appendChild(caret);
            li.appendChild(btn);
        } else {
            // ทั้งแถวเป็นตัวกาง (ปลายทางเดิมของลิงก์ยังอยู่ เป็นรายการแรกในการ์ด)
            btn = link;
            btn.setAttribute('href', 'javascript:void(0);');
            btn.removeAttribute('target');
            btn.className = btn.className ? btn.className + ' ags-m-toggle' : 'ags-m-toggle';
            btn.appendChild(caret);
        }
        btn.setAttribute('role', 'button');
        btn.setAttribute('aria-expanded', 'false');
        li.agsBtn = btn;

        li.appendChild(panel);
        btn.onclick = function (e) {
            if (e && e.preventDefault) { e.preventDefault(); }
            toggle(list, li);
            return false;
        };
        return li;
    }

    ready(function () {
        var slide = document.getElementById('header-slide');
        if (!slide) { return; }
        var lists = slide.getElementsByTagName('ul');
        for (var i = 0; i < lists.length; i++) {
            var list = lists[i];
            if (!hasClass(list, 'header-slide-list')) { continue; }

            // เกี่ยวกับเรา: รวม "ติดต่อเรา" เข้ามาให้เหมือนการ์ดฝั่ง desktop
            var about = linkIn(list, ABOUT);
            var contact = linkIn(list, CONTACT);
            if (about && accordion(list, about, 'agsAboutDropdown') && contact) {
                var cli = liOf(contact, list);
                if (cli) { list.removeChild(cli); }
            }

            // Silver: แตะชื่อ = เข้าหน้า Silver เลย, แตะลูกศรขวา = ดูราคาย้อนหลังรายเดือน/รายชั่วโมง
            var silver = linkIn(list, SILVER);
            if (silver) { accordion(list, silver, 'agsSilverDropdown', true); }

            // ระบบซื้อขายทองคำแท่ง: เห็นครบทั้ง 3 ระบบ แทนการยิงไป redirect.html ทันที
            var trade = linkIn(list, TRADE);
            if (trade) { accordion(list, trade, 'agsTradeDropdown'); }
        }
    });
}());
</script>
<!-- ===== จบส่วน Dropdown เลือกระบบซื้อขายทองคำแท่ง ===== -->
