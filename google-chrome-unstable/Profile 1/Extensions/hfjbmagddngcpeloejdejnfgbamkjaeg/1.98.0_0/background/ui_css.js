"use strict"
;__filename="background/ui_css.js",define(["require","exports","./store","./utils","./settings","./ports"],function(n,i,r,e,t,o){
var u,s,f,c,a,l;Object.defineProperty(i,"__esModule",{value:true}),i.ni=i.ii=i.mergeCSS=i.ri=void 0,f=function(n,o){
return-1===n?i.mergeCSS(o,-1):(2===n&&(r.Z=null),(f=0===n&&r.ie.get("findCSS"))?(s=null,r.te=a(f),
r.re=o.slice(u.length),void(r.ae.c=r.ie.get("omniCSS")||"")):void e.l("vimium-c.css").then(function(e){var o,s,f,a,l
;u.slice(u.indexOf(",")+1),r.de<54&&(e=e.replace(/user-select\b/g,"-webkit-$&")),
r.de<62&&(e=e.replace(/#[\da-f]{4}([\da-f]{4})?\b/gi,function(n){
n=5===n.length?"#"+n[1]+n[1]+n[2]+n[2]+n[3]+n[3]+n[4]+n[4]:n
;var i=parseInt(n.slice(1),16),r=i>>16&255,e=i>>8&255,t=(255&i)/255+""
;return"rgba(".concat(i>>>24,",").concat(r,",").concat(e,",").concat(t.slice(0,4),")")})),
s=(e=(o=c(e)).ui).indexOf("all:"),f=e.lastIndexOf("{",s),a=r.de>=53?e.indexOf(";",s):e.length,
e=e.slice(0,f+1)+e.slice(s,a+1)+e.slice(e.indexOf("\n",a)+1||e.length),r.de>64&&true?(s=e.indexOf("display:"),
f=e.lastIndexOf("{",s),e=e.slice(0,f+1)+e.slice(s)):e=e.replace("contents","block"),
r.de<73&&(e=e.replace("3px 5px","3px 7px")),r.de<69&&(e=e.replace(".LH{",".LH{box-sizing:border-box;")),
r.we&&r.de<89&&(e=e.replace("forced-colors","-ms-high-contrast")),e=e.replace(/\n/g,""),
r.de<85&&(e=e.replace(/0\.01|\/\*!DPI\*\/ ?[\d.]+/g,"/*!DPI*/"+(r.de<48?1:.5))),t.io("innerCSS",u+e),
t.io("findCSS",(l=o.find).length+"\n"+l),i.mergeCSS(r.ce.userDefinedCss,n)}));var f},i.ri=f,c=function(n){
var i,r,e=n?n.split(/^\/\*\s?#!?([A-Za-z:]+)\s?\*\//m):[""],t={ui:e[0].trim()}
;for(i=1;i<e.length;i+=2)t[r=e[i].toLowerCase()]=(t[r]||"")+e[i+1].trim();return t},a=function(n){
var i=(n=n.slice(n.indexOf("\n")+1)).indexOf("\n")+1,r=n.indexOf("\n",i);return{c:n.slice(0,i-1).replace("  ","\n"),
s:n.slice(i,r).replace("  ","\n"),i:n.slice(r+1)}},l=function(n,e){
var s,f,l,d,S,v,b,g,m,p,C,x=r.ie.get("innerCSS"),_=x.indexOf("\n");if(x=_>0?x.slice(0,_):x,f=(s=c(n)).ui?x+"\n"+s.ui:x,
l=s["find:host"],d=s["find:selection"],S=s.find,v=s.omni,b="omniCSS",_=(x=r.ie.get("findCSS")).indexOf("\n"),
g=(x=x.slice(0,_+1+ +x.slice(0,_))).indexOf("\n",_+1),m=x.slice(0,g).indexOf("  "),d=d?"  "+d.replace(/\n/g," "):"",
(m>0?x.slice(m,g)!==d:d)&&(x=x.slice(_+1,m=m>0?m:g)+d+x.slice(g),g=m-(_+1)+d.length,_=-1),p=x.indexOf("\n",g+1),
C=x.slice(0,p).indexOf("  ",g),
l=l?"  "+l.replace(/\n/g," "):"",(C>0?x.slice(C,p)!==l:l)&&(x=x.slice(_+1,C>0?C:p)+l+x.slice(p),_=-1),
_<0&&(x=x.length+"\n"+x),S=S?x+"\n"+S:x,x=(r.ie.get(b)||"").split("\n",1)[0],v=v?x+"\n"+v:x,-1===e)return{
ui:f.slice(u.length),find:a(S),omni:v};t.io("innerCSS",f),t.io("findCSS",S),t.io(b,v||null),i.ri(0,f),
0!==e&&1!==e&&(o.wo(function(n){var e;for(e of n.po)8&e.s.Ln&&e.postMessage({N:12,H:r.re,f:32&e.s.Ln?i.ni(e.s):void 0})
}),t.no({N:47,d:{c:r.ae.c}}))},i.mergeCSS=l,i.ii=function(n,i){var t,o,u,s,f,c,a=r.ae.s
;!n.o&&r.oe||(o=" ".concat(n.t," "),
s=(u=a&&" ".concat(a," ")).includes(o),t=(t=(f=null!=n.e?n.e:s)?s?a:a+o:u.replace(o," ")).trim().replace(e.jn," "),
false!==n.b?(n.o&&(r.oe=f!==" ".concat(r.ce.vomnibarOptions.styles," ").includes(o)),t!==a&&(r.ae.s=t,c={N:47,d:{s:t}},
e.m(r.U.slice(0),function(n){return n!==i&&r.U.includes(n)&&n.postMessage(c),1}))):r.ae.s=t)},i.ni=function(n){
var i=r.te;return r.de<86&&n.fr.startsWith("file://")?s||(s={
c:i.c+"\n.icon.file { -webkit-user-select: auto !important; user-select: auto !important; }",s:i.s,i:i.i}):i},
t.lo.then(function(){
u=r.e.Oe+","+r.de+";",r.re=r.ie.get("innerCSS")||"",r.re&&!r.re.startsWith(u)?(r.ie.set("vomnibarPage_f",""),
i.ri(1,r.re)):i.ri(0,r.re),r.F.userDefinedCss=i.mergeCSS})});