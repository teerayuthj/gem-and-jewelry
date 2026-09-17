<%@ page contentType="text/html; charset=utf-8" %>
<%@include file="/apps/ausiris-gold/global.jsp"%>
<%@ page import="java.util.Iterator,com.day.text.Text, com.day.cq.wcm.api.PageFilter, com.day.cq.wcm.api.Page" %><%

   Page navRootPage = currentPage.getAbsoluteParent(1);
    if (navRootPage == null && currentPage != null) { 
       navRootPage = currentPage; 
   }
%>
                 <%
       if (navRootPage != null) { 
           Iterator<Page> children = navRootPage.listChildren(new PageFilter(request));
           while (children.hasNext()) { 
               Page child = children.next(); 
           %><li><a href="<%= child.getPath() %>.html" class="txt_color2" ><%=child.getTitle() %></a></li><%
           } 
       } 
                 %>

<% if(session.getAttribute("user_id") != null){ %> 
<li><a class="txt_color2" href="/content/index/redirect.html">ระบบซื้อขายทองคำแท่ง</a></li>
<% } else { %>
<li><a class="txt_color2" href="/content/index/redirect.html">ระบบซื้อขายทองคำแท่ง</a></li>
<!-- <li><a class="txt_color2" href="/content/index/customer/register.html">เปิดบัญชีออนไลน์</a></li> -->
<% } %>

