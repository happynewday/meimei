(window.webpackJsonp=window.webpackJsonp||[]).push([[20],{519:function(e,a,t){"use strict";t.r(a);var n=t(20),r=t.n(n),s=t(14),u=t.n(s),c=t(83),p=function(e){return Object(c.a)({url:"/backend/picture/list",method:"POST",data:e})};a.default={namespace:"pics",state:{tag:null,pageNum:1,pageSize:20,items:[],maxPage:0},effects:{load:u.a.mark(function e(a,t){var n,r,s,c,i,g,o,l,m,f;return u.a.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return n=a.playload,r=t.call,s=t.put,c=t.select,e.next=4,c(function(e){return e.pics});case 4:return i=e.sent,g=i.pageSize,o=n.tag,e.next=9,r(p,{tag:o,pageNum:1,pageSize:g});case 9:if(l=e.sent,m=l.status,f=l.data,0===m){e.next=14;break}return e.abrupt("return");case 14:return e.next=16,s({type:"save",playload:{items:f.list,maxPage:f.pages,pageNum:f.pageNum,tag:o}});case 16:case"end":return e.stop()}},e,this)}),nextPage:u.a.mark(function e(a,t){var n,r,s,c,i,g,o,l,m,f,d,x;return u.a.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return n=t.call,r=t.put,s=t.select,e.next=3,s(function(e){return e.pics});case 3:if(c=e.sent,i=c.pageSize,g=c.pageNum,o=c.tag,l=c.items,m=c.maxPage,g!==m){e.next=11;break}return e.abrupt("return");case 11:return e.next=13,n(p,{tag:o,pageNum:g+1,pageSize:i});case 13:if(f=e.sent,d=f.status,x=f.data,0===d){e.next=18;break}return e.abrupt("return");case 18:return e.next=20,r({type:"save",playload:{items:l.concat(x.list),maxPage:x.total,pageNum:x.pageNum}});case 20:case"end":return e.stop()}},e,this)})},reducers:{save:function(e,a){var t=a.playload;return r()({},e,t)}}}}}]);