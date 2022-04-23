"use strict"
;__filename="background/others.js",define(["require","exports","./store","./browser","./utils","./settings","./i18n","./normalize_urls","./normalize_urls","./open_urls"],function(e,n,t,o,i,u,r,l,a,c){
Object.defineProperty(n,"__esModule",{value:true}),i=i,u=u;var s,f,m,d,g,p,v,b=t.F.showActionIcon=function(e){
var n=o.Cn.browserAction;n?(t.ne=e,o.import2("/background/action_icon.js").then(function(e){e.ei()}),
Promise.resolve(r.gr("name")).then(function(t){e||(t+="\n\n"+r.gr("noActiveState")),n.setTitle({title:t})
})):t.F.showActionIcon=void 0};u.lo.then(function(){t.ce.showActionIcon?b(true):t.b=t.C}),setTimeout(function(){
new Promise(function(n,t){e(["/background/sync.js"],n,t)}).then(e=>e)},100),(function(){function e(){_&&(_.To=null),
y=D=_=T=null,M&&clearTimeout(M),w&&clearTimeout(w),j=C=F=M=w=0,h="",i.wn()}function n(){var t=Date.now()-j
;if(t>5e3||t<-5e3)return e();M=setTimeout(n,3e4)}function u(){var e,n;if(w=0,(e=_)&&!e.yo)return _=null,
e.To?((n=Date.now())<j&&(j=n-1e3),f(e.Po,e.To)):void 0}function s(e,n,u,r,l){var c,s,f,m,g,v,w,P,M,j,S,O,U,V,q,x,z
;if(e.To){for(_=null,c=n.length>0?n[0]:null,C=r,F=l,D=[],f=new Set,m=" ".concat(t.ae.s," ").includes(" type-letter "),
g=0,
v=u?0:1,w=n.length;g<w;g++)M=(P=n[g]).title,S=P.e,U="",V=null!=P.s,q=b&&!(u&&0===g)&&("tab"===S?P.s!==t.L:"history"===S&&!V),
(O=i.on(O=j=P.u,1)).startsWith("file")&&(O=a.$e(O)),
O=O.replace(/%20/g," "),f.has(O)?O=":".concat(g+v," ").concat(O):f.add(O),q&&(U=" ~".concat(g+v,"~")),x={content:O,
description:U=(M||m?(M?M+" <dim>":"<dim>")+(m?"[".concat(P.e[0].toUpperCase(),"] "):"")+(M?"-</dim> <url>":"</dim><url>"):"<url>")+P.textSplit+"</url>"+(U&&"<dim>".concat(U,"</dim>"))
},q&&(x.deletable=true),(q||V)&&(y||(y=new Map),y.has(O)||y.set(O,{Do:S,Bi:V?P.s:null,fr:j})),D.push(x);T=e.Po,
u?"search"===c.e?(s=((z=c.p)&&"<dim>".concat(i.bn(z)+d,"</dim>"))+"<url>".concat(c.textSplit,"</url>"),k=2,
(c=n[1])&&"math"===c.e&&(D[1].description="".concat(c.textSplit," = <url><match>").concat(c.t,"</match></url>"))):(k=3,
s=D[0].description):1!==k&&(s="<dim>".concat(p,"</dim><url>%s</url>"),k=1),u&&(h=n[0].u,
y&&D.length>0&&h!==D[0].content&&y.set(h,y.get(D[0].content)),D.shift()),s&&o.Cn.omnibox.setDefaultSuggestion({
description:s}),e.To(D),i.wn()}else _===e&&(_=null)}function f(e,o){var i,r,l,a;e=O(e),_&&(_.To=(i=e===_.Po)?o:null,
i)||(e!==T?1===C&&e.startsWith(T)?o([]):(_={To:o,Po:e,yo:false},w||(r=Date.now(),
(l=t.ae.t+j-r)>30&&l<3e3?w=setTimeout(u,l):(_.yo=true,M||(M=setTimeout(n,3e4)),j=r,y=D=null,h="",
a=C<2||!e.startsWith(T)?0:3===C?e.includes(" ")?0:8:F,t.M._u(e,{o:"omni",t:a,r:S,c:P,f:1},s.bind(null,_))))):D&&o(D))}
function m(e,n,o){return e?":"===e[0]&&/^:([1-9]|1[0-2]) /.test(e)&&(e=e.slice(" "===e[2]?3:4)):e=l.rr(""),
"file://"===e.slice(0,7).toLowerCase()&&(e=/\.(?:avif|bmp|gif|icon?|jpe?g|a?png|svg|tiff?|webp)$/i.test(e)?l.Xe("show image "+e,false,0):e),
null!=o?t.K[5]({s:o}):c.openUrlReq({u:e,r:"currentTab"===n?0:"newForegroundTab"===n?-1:-2})}
var d,g,p,v,b,T,h,_,w,y,P,D,M,j,k,C,F,S,O,U=o.Cn.omnibox;U&&(d=": ",g=false,p="Open: ",
b=!!(v=U.onDeleteSuggestion)&&"function"==typeof v.addListener,T=null,h="",_=null,w=0,y=null,P=128,D=null,M=0,k=0,C=0,
F=0,S=t.de<60?6:12,O=function(e){if(e=e.trim().replace(i.jn," "),t.ce.vomnibarOptions.actions.includes("icase")){
var n=/^:[WBH] /.test(e)?3:0;e=n?e.slice(0,n)+e.slice(n).toLowerCase():e.toLowerCase()}return e},
U.onInputStarted.addListener(function(){if(o.getCurWnd(false,function(e){var n=e&&e.width
;P=n?Math.floor((n-160/devicePixelRatio)/7.72):128}),g||(g=true,Promise.resolve(r.gr("i18n")).then(function(){
"en"!==r.vr()&&Promise.resolve(r.Yn("colon")).then(function(e){d=e+r.Yn("NS")||d,p=r.Yn("OpenC")||p})})),M)return e()}),
U.onInputChanged.addListener(f),U.onInputEntered.addListener(function n(o,i){var r,l,a=_;if(a&&a.To){
if(a.To=n.bind(null,o,i),a.yo)return;return w&&clearTimeout(w),u()}return o=O(o),null===T&&o?t.M._u(o,{o:"omni",t:0,r:3,
c:P,f:1},function(e,n){return n?m(e[0].u,i,e[0].s):m(o,i)
}):(h&&o===T&&(o=h),l=null==(r=null==y?void 0:y.get(o))?void 0:r.Bi,e(),m(r?r.fr:o,i,l))}),b&&v.addListener(function(e){
var n=parseInt(e.slice(e.lastIndexOf("~",e.length-2)+1))-1,o=D&&D[n].content,i=o&&y?y.get(o):null,u=i&&i.Do;u?t.K[22]({
t:u,s:i.Bi,u:i.fr
},null):console.log("Error: want to delete a suggestion but no related info found (may spend too long before deleting).")
}))})(),s=0,f=false,m=0,d=t.we?"edge:":"chrome:",g=t.we?"":d+"//newtab/",p=t.we?"":d+"//new-tab-page/",v=function(e){
0===e.frameId&&e.url.startsWith(d)&&s&(e.url.startsWith(g)||e.url.startsWith(p)?2:1)&&!m&&o.n(e.tabId)},o.s([{
origins:["chrome://*/*"]},t.de>79&&!t.we?{origins:["chrome://new-tab-page/*"]}:null],function e(n){
if(1&(s=(n[0]?1:0)+(n[1]?2:0))&&!t.ce.allBrowserUrls&&(s^=1),f!==!!s){var i=o.Tn();if(!i)return false
;i.onCommitted[(f=!f)?"addListener":"removeListener"](v)}m=m||s&&setTimeout(function(){s?o.Bn.query({url:d+"//*/*"
},function(e){for(var n of(m=0,e||[]))!t.z.has(n.id)&&s&(n.url.startsWith(g)||n.url.startsWith(p)?2:1)&&o.n(n.id)
;return o.On()}):m=0},120),s&&!t.F.allBrowserUrls&&(t.F.allBrowserUrls=e.bind(null,n,false))}),
t.pe&&t.pe.then(function(e){var n=e&&e.reason,i="install"===n?"":"update"===n&&e.previousVersion||"none"
;"none"!==i&&setTimeout(function(){if(o.Bn.query({status:"complete"},function(e){var n,t=/^(file|ftps?|https?):/
;for(n of e)t.test(n.url)&&o.n(n.id)
}),console.log("%cVimium_ C%c has been %cinstalled%c with %o at %c%s%c.","color:red","color:auto","color:#0c85e9","color:auto",e,"color:#0c85e9",new Date(Date.now()-6e4*(new Date).getTimezoneOffset()).toJSON().slice(0,-5).replace("T"," "),"color:auto"),
t.e.Ge&&console.log("Sorry, but some commands of Vimium C require the permission to run in incognito mode."),i){
if(u.co("vomnibarPage"),!(parseFloat(t.e.Oe)<=parseFloat(i))&&(t.o?t.o(6e3):t.o=true,u.co("newTabUrl"),
t.ce.notifyUpdate)){var n="vimium_c-upgrade-notification"
;Promise.all([r.Yn("Upgrade"),r.Yn("upgradeMsg",[t.e.qe]),r.Yn("upgradeMsg2"),r.Yn("clickForMore")]).then(function(e){
var i,u={type:"basic",iconUrl:location.origin+"/icons/icon128.png",title:"Vimium C "+e[0],message:e[1]+e[2]+"\n\n"+e[3]}
;t.de<67&&(u.isClickable=true),t.de>=70&&(u.silent=true),(i=o.Cn.notifications)&&i.create(n,u,function(e){var u
;if(u=o.On())return u;n=e||n,i.onClicked.addListener(function e(n){n==n&&(i.clear(n),t.K[20]({u:l.rr("vimium://release")
}),i.onClicked.removeListener(e))})})})}}else u.lo.then(function(){var e=function(){
t.Q||t.h?++n<25&&setTimeout(e,200):t.K[20]({u:t.e.Ee+"#commands"})},n=0;setTimeout(e,200)})},500)}),
setTimeout(function(){globalThis.document.body.innerHTML="",i.wn()},1e3)});