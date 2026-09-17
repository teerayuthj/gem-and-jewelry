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
					<li><a class="txt_color2" href="https://express.ausiris.co.th/">ออสสิิริสเอ็กซ์เพรส</a></li>
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
                        <a href="https://express.ausiris.co.th/" target="_blank" class="btn-w btn-w-color10 btn-w-s">ออสสิริสเอ็กซ์เพรส</a>
                       <% } else if(step == 0){ %>
							<!-- <a href="/content/index/customer/register.html" class="btn-w btn-w-color10 btn-w-s">เปิดบัญชีออนไลน์</a> -->
                        	<a href="/content/index/redirect.html" class="btn-w btn-w-color10 btn-w-s">ระบบซื้อขายทองคำแท่ง</a>
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
                        <a href="https://ausirisnext.com/" target="_blank" class="btn-w btn-w-color10 btn-w-s" style="padding: 3px 18px;" >ระบบซื้อขายทองคำแท่ง</a>
   						<a href="https://express.ausiris.co.th/" target="_blank" class="btn-w btn-w-color10 btn-w-s" style="padding: 3px 18px;">ออสสิริสเอ็กซ์เพรส</a> 

                     </div>
                    <% } %>

            </nav>
        </div>
          </div>
   
</header>
