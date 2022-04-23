"use strict"
;__filename="background/open_urls.js",define(["require","exports","./store","./utils","./browser","./normalize_urls","./parse_urls","./ports","./exclusions","./i18n","./key_mappings","./run_commands","./clipboard","./tools"],function(n,u,r,e,i,t,l,o,f,c,a,s,d,v){
var p,m,w,g,b,y,h,_,I,$,k,P,T,x,U,j,z,L,M,N;Object.defineProperty(u,"__esModule",{value:true}),
u.du=u.openUrlReq=u.openUrl=u.goToNextUrl=u.openUrlWithActions=u.openShowPage=u.openJSUrl=u.parseReuse=u.pu=u.parseOpenPageUrlOptions=u.preferLastWnd=u.newTabIndex=void 0,
e=e,p={current:0,reuse:1,newwnd:2,frame:3,newbg:-2,lastwndfg:-5,lastwnd:-5,lastwndbg:-6,iflastwnd:-7,lastwndbgbg:-8,
lastwndbginactive:-8},u.newTabIndex=function(n,u,r,e){
return"before"===u||"left"===u||"prev"===u||"previous"===u?n.index:"after"===u||"next"===u||"right"===u?n.index+1:"default"===u?void 0:false!==e&&null!=i.getGroupId(n)?"start"===u||"begin"===u?n.index:"end"===u?void 0:n.index+1:"start"===u||"begin"===u?0:"end"===u?r?3e4:void 0:n.index+1
},u.preferLastWnd=function(n){return n.find(function(n){return n.id===r.E})||n[n.length-1]},
u.parseOpenPageUrlOptions=function(n){return{g:n.group,i:n.incognito,m:n.replace,o:n.opener,r:n.reuse,p:n.position,
w:n.window}},m=function(n){
return"boolean"==typeof n?n:n?"force"===n||("reverse"===n?2!==r.A:"same"===n||"keep"===n?2===r.A:null):null},
w=function(n){return"popup"===n||"normal"===n?n:void 0},g=function(n,u,e){var t=function(u){
return!(n&&u.type!==n||null!=e&&u.incognito!==e||"minimized"===u.state)}
;return(r.E<0?Promise.resolve(null):new Promise(function(n){i.An.get(r.E,function(u){return n(u?t(u)?u:null:(r.E=-1,
null)),i.On()})})).then(function(n){return n||new Promise(function(n){return i.An.getAll(function(e){
var i=e.filter(function(n){return t(n)&&n.id!==r.J}),l=i.length>0?i.sort(function(n,u){return u.id-n.id})[0]:null
;l&&r.E<0&&(r.E=l.id),n(l||!u?l:e.find(function(n){return n.id===r.J})||e.find(function(n){return n.focused})||null)})})
})},u.pu=function(n,u){n=n.slice(0,128).split("?")[0].replace(/\\/g,"/")
;var e=2===r.fe&&/\/globalroot\/device\/condrv|\bdevice\/condrv\/kernelconnect/.test(n);return e&&(r.N=u||r.N,
o.showHUD(c.Yn("harmfulURL"))),e},b=function(n,l,f,c){var d,v,p,m,w=function(n){s.replaceCmdOptions(l),
s.overrideCmdOptions({urls:n,url:null,url_f:null,copied:null,keyword:null},true)};switch(e.wn(),c[1]){case 1:
o.showHUD(c[0],15),s.runNextCmdBy(1,l);break;case 5:case 7:w(null),7===c[1]||l.$p?n=0:s.overrideOption("$p",1),
u.openUrlWithActions(t.rr(c[0]),n,false,f);break;case 4:n>=3&&c[0]&&s.runNextCmdBy(1,l);break;case 6:if(v=r.L,
"openUrls"===(d=c[0])[0]){for(m of(p=[],d.slice(1)))"string"==typeof m||5!==m[1]&&7!==m[1]||(m=t.rr(c[0],null,n)),
"string"!=typeof m?Promise.resolve(m).then(function(u){6===u[1]&&"openUrls"===u[0][0]||b(n,l,f,u)}):p.push(m)
;if(0===p.length)return;return w(p),void(f&&f.length>0?U(f):i.getCurTab(U))}setTimeout(function(){
var n=r.z.get(v),u=e.mn({keys:[d[1]]});r.Ie=null,s.executeCommand(a.st("runKey",u),1,0,n?n.Qn:null,0,null)},0)}},
y=function(n,u,r){n?s.runNextOnTabLoaded(u,r):s.runNextCmdBy(0,u)},h=function(n,u,e,t,l){var o=function(u){
return y(u,n,u),i.On()};if(l){if(l.length>0&&l[0].incognito&&i._n(e))return void i.tabsCreate({url:e},o)
}else if(i._n(e)&&true!==t)return void i.getCurTab(h.bind(null,n,u,e,true));3===u&&r.N&&r.N.s.Dn?s.sendFgCmd(0,false,{
r:1,u:e}):l?i.tabsUpdate(l[0].id,{url:e},o):i.tabsUpdate({url:e},o)},_=function(n,u,r,e,t,l){i.makeWindow({url:n,
focused:u,incognito:r,type:"string"==typeof n||1===n.length?w(e.window):void 0,left:t.left,top:t.top,width:t.width,
height:t.height},null!=t.state?t.state:l&&"minimized"!==l.state?l.state:"",function(n){y(n,e,n&&n.tabs[0])})},
I=function(n,e,t,l,o){var f,c,a=-2!==e,s=l?l.windowId:r.J,d=o.find(function(n){return n.id===s}),v=null!=d&&d.incognito
;!t.window&&2!==e&&(v||(o=o.filter(function(n){return n.incognito&&"normal"===n.type})).length>0)?(f={url:n[0],active:a,
windowId:v?s:u.preferLastWnd(o).id},v&&(f.index=u.newTabIndex(l,t.position,c=true===t.opener,t.group),
c&&(f.openerTabId=l.id)),i.openMultiTabs(f,r.V,true,n,v&&t.group,l,function(n){!v&&a&&i.selectWnd(n),y(n,t,n)
})):_(n,true,true,t,t,d)},u.parseReuse=function(n){
return null==n?-1:"string"!=typeof n?"boolean"==typeof n?n?1:-1:isNaN(+n)?-1:0|n:(n=n.toLowerCase().replace("window","wnd").replace(/-/g,""))in p?p[n]:-1
},$=function(n,u,t){
var l,o,f,c,a,s,d,v,p=u&&u.length>0?i.getTabUrl(u[0]):"",m=[true!==t?false===t?"":t:(/[%$]s/i.exec(n)||["${url_mask}"])[0],r.Be.host_mask||r.Be.host_mark,r.Be.tabid_mask||r.Be.tabId_mask||r.Be.tabid_mark||r.Be.tabId_mark,r.Be.title_mask||r.Be.title_mark,r.Be.id_mask||r.Be.id_mark||r.Be.id_marker],w=[]
;for(l=0;l<m.length;l++)if((f=(o=null!=m[l]?m[l]+"":"")?n.indexOf(o):-1)>=0){for(a of(c=f+o.length,w));
w.push([f,c,0===l?/^[%$]S|^\$\{S:/.test(o)?p:e.rn(p):1===l?new URL(p).host:2===l?p&&""+u[0].id:3===l?p&&""+e.rn(u[0].title):i.Cn.runtime.id])
}if(w.length){for(v of(s="",d=0,w.sort(function(n,u){return n[0]-u[0]}),w))s=s+n.slice(d,v[0])+v[2],d=v[1]
;n=s+n.slice(d)}return n},k=function(n,e,t,l){var o=m(l.incognito);(e>-4?new Promise(function(n){
i.getCurWnd(false,function(u){return n(u||null),i.On()})}):g(w(l.window),true,o)).then(function(n){
return n&&new Promise(function(u){i.Bn.query({active:true,windowId:n.id},function(r){return n.tabs=r,u(n),i.On()})})
}).then(function(f){var c,a=!!f&&!f.focused&&f.id!==r.J,d=-7===e&&!a
;if(f&&(a||-7===e&&(null==o||f.incognito===!!o)))c=f.tabs&&f.tabs.length>0?i.selectFrom(f.tabs):null,i.openMultiTabs({
url:n[0],active:e>-6||d,windowId:f.id,pinned:!!l.pinned,index:c?u.newTabIndex(c,l.position,false,l.group):void 0
},r.V,!!l.incognito&&"string"==typeof l.incognito,n,l.group,c,function(n){
e>-6?a&&i.selectWnd(n):n&&e>-8&&!d&&i.selectTab(n.id),y(n,l,e>-6&&-2!==e&&n)});else{
if(-7===e&&s.runNextCmdBy(0,l))return;_(n,e>-8,null!=o?!!o:t,l,l,f)}})},P=function(n,e,t,l){
var o,f,c=l&&l[0],a=!!c&&c.incognito||2===r.A,s=-2!==e&&-8!==e,d=2===e||e<-3||!!t.window,v=m(t.incognito),p=null!=v&&"string"==typeof t.incognito
;if(!p&&n.some(i._n))d=a||d;else if(a)d=false===v||d;else if(v&&e>-4)return void i.An.getAll(I.bind(null,n,e,t,c))
;d?k(n,e,a,t):(f={url:n[0],active:s,windowId:c?c.windowId:void 0,openerTabId:o=t.opener&&c?c.id:void 0,
pinned:!!t.pinned,index:c?u.newTabIndex(c,t.position,null!=o,t.group):void 0
},i.openMultiTabs(f,r.V,p,n,t.group,c,function(n){s&&n&&i.selectWndIfNeed(n),y(n,t,s&&n)}))},T=function(n,e,t,l,o,c){
var a,d=t?"string"==typeof t?f.ot(t):"object"==typeof t&&t.t&&t.v?t:null:null,v=2===e||1===e,p=1===e&&o.q||{},b=w(1===e?p.w:l.window),h=m(1!==e?l.incognito:p.i),_=true===(1!==e?l.group:p.g)
;r.V=1,1===e?(p.m=null,p.g=_):(s.overrideOption("group",_,l),null!=l.replace&&s.overrideOption("replace",d,l)),
a=e<-3&&d?g(b,-7===e,h):Promise.resolve(!v&&r.J>=0?{id:r.J}:null),Promise.all([a,!_||c?null:new Promise(function(n){
i.getCurTab(function(u){c=u||[],n()})})]).then(function(n){var u=n[0];return d&&(u||v)?new Promise(function(n){
i.Bn.query(u?{windowId:u.id}:{windowType:b||void 0},function(u){
var t,l,o=null!=h?!h:e>-4?2!==r.A:-2,a=(u||[]).filter(function(n){return f.ut(d,n.url)&&n.incognito!==o})
;return _&&a.length>0&&c.length>0&&(t=i.getGroupId(c[0]),u&&(a=a.filter(function(n){return i.getGroupId(n)===t}))),
a.sort(function(n,u){var e=r.T.get(u.id),i=r.T.get(n.id);return i?e?e.i-i.i:1:e?-1:u.id-n.id}),
1===e&&(l=a.filter(function(n){return n.windowId===r.J}),a=l.length>0?l:a),n(a.length?a[0]:null),i.On()})}):null
}).then(function(t){var f,a
;null==t||t.id===r.L&&1!==e?1===e?u.du(o):s.runNextCmdBy(0,l)||(c?P([n],e,l,c):i.getCurTab(P.bind(null,[n],e,l))):(f=-2!==e&&-8!==e,
a=t.windowId!==r.J&&e>-6,i.tabsUpdate(t.id,{url:n},function(n){return n&&(f&&(i.selectTab(n.id),n.active=true),
a&&i.selectWnd(n)),y(n,1===e?o.f||{}:l,-2!==e&&e>-6&&n),i.On()}))})},u.openJSUrl=function(n,u,t,l){
if(/^(void|\(void\))? ?(0|\(0\))?;?$/.test(n.slice(11).trim()))s.runNextCmdBy(1,u);else{if(!t&&r.N){
if(0===l&&(r.N=o.indexFrame(r.N?r.N.s.Hn:r.L,0)||r.N),o.safePost(r.N,{N:5,u:n,f:s.parseFallbackOptions(u)}))return
;if(-1!==l)return void s.runNextCmdBy(0,u);r.N=null}var f=function(r){if(-1===r||i.On()){var l=e.cn(n.slice(11))
;return i.Wn(i.Bn.executeScript,{code:l}).then(function(n){void 0===n&&t&&t(),y(!!n,u,null)}),i.On()}
s.runNextOnTabLoaded(u,null)};r.de<71?i.tabsUpdate({url:n},f):f(-1)}},x=function(n,e,t,l){var o,f,c,a=r.e.ze
;return!(n.length<a.length+3||!n.startsWith(a))&&(l?(n=n.slice(a.length),o=l.incognito,
n.startsWith("#!image ")&&o&&(n="#!image incognito=1&"+n.slice(8).trim()),r.r=(f=[n,null,0])[1]=function(){
return clearTimeout(f[2]),r.r=null,f[0]},f[2]=setTimeout(function(){
f[0]="#!url vimium://error (vimium://show: sorry, the info has expired.)",f[2]=setTimeout(function(){
r.r===f[1]&&(r.r=null),f[0]="",f[1]=null},2e3)},1200),r.V=1,0!==e&&3!==e||o?o&&[0,3,-2,-1].indexOf(e)>=0?i.tabsCreate({
url:a,active:-2!==e},function(n){y(n,t,n)
}):(t.incognito=false,P([a],e,t,[l])):((c=r.de>=54&&!l.url.split("#",2)[1]?i.Cn.extension.getViews({tabId:l.id
}):[]).length>0&&c[0].location.href.startsWith(a)&&c[0].onhashchange?c[0].onhashchange():i.tabsUpdate(l.id,{url:a}),
s.runNextOnTabLoaded(t,null)),true):(i.getCurTab(function(r){if(!r||r.length<=0)return i.On();u.openShowPage(n,e,t,r[0])
}),true))},u.openShowPage=x,U=function(n){var e,l,o,f,c=r.Be,a=c.urls;if(2!==c.$fmt){
if(1!==c.$fmt)for(e=0;e<a.length;e++)a[e]=t.rr(a[e]+"");s.overrideOption("$fmt",2)}for(l of a)if(u.pu(l))return i.On()
;f=1===(o=u.parseReuse(c.reuse))||0===o||3===o?-1:o,r.Be=null,P(a,f,c,n)},j=function(n,l,o,f){var c,a,v,p,m,w,g,y,_
;"string"!=typeof n||(n||9!==l?((a=s.fillOptionWithMask(n,r.Be.mask,"value",["url","url_mask","value"],r.V)).ok&&(n=a.result,
a.useCount&&(r.V=1)),p=r.Be.url_mark,null==(v=r.Be.url_mask)&&null==p||(n=$(n,f,null!=v?v:p)),o&&(m=d.xr(r.Be),
n=r.i(n,0,m)),
9!==l&&(w=(r.Be.keyword||"")+"",n=(null!==(c=r.Be.testUrl)&&void 0!==c?c:!w)?t.rr(n,w,l):t.We(n.trim().split(e.jn),w)),
(g=r.Be.goNext)&&n&&"string"==typeof n&&(n=r.i(n,8192),n=u.goToNextUrl(n,r.V,g)[1]),
n="string"==typeof n?t.Ye(n):n):n=r.newTabUrl_f),_=u.parseReuse((y=r.Be).reuse),r.Be=null,e.wn(),
"string"!=typeof n?n instanceof Promise?n.then(b.bind(0,l,y,f)):b(l,y,f,n):u.openShowPage(n,_,y)||(e.dn(n)?u.openJSUrl(n,y,null,_):u.pu(n)?s.runNextCmdBy(0,y):1===_?T(n,_,y.replace,null,{
u:n,p:y.prefix,q:u.parseOpenPageUrlOptions(y),f:s.parseFallbackOptions(y)
},f):0===_||3===_?h(y,_,n):y.replace?T(n,_,y.replace,y,null,f):f?P([n],_,y,f):i.getCurTab(P.bind(null,[n],_,y)))},
u.openUrlWithActions=j,z=function(n,f){var a,d,v,p,m,w,g,b,y,h,_,I,$
;if(null===f)return o.complainLimits("read clipboard"),void s.runNextCmd(0)
;if(!(f=f.trim()))return o.showHUD(c.Yn("noCopied")),void s.runNextCmd(0)
;if(v="string"==typeof(d=r.Be.copied)&&d.includes("any"),("urls"===d||v)&&(a=f.split(/[\r\n]+/g)).length>1){
for(g of(p=[],m=v&&r.Be.keyword?r.Be.keyword+"":null,w=false,a))if(g=g.trim()){if(g=t.rr(g,m,0),!(v||t.nr<=2)){
p.length=0,w=true;break}p.push(g)}if(p.length>1)return r.Be=s.copyCmdOptions(e.pn(),r.Be),r.Be.urls=p,r.Be.$fmt=1,
void(n&&n.length>0?U(n):i.getCurTab(U));if(w)return void(s.runNextCmd(0)||o.showHUD("The copied lines are not URLs"))}
t.ur.test(f)?f=f.slice(1,-1):(null!=(b=r.Be.testUrl)?b:!r.Be.keyword)&&(f=l.tu(f,b)),
(y=f.indexOf("://")+3)>3&&e.kn.test(f)&&(h=void 0,_=(f=/^ttps?:/i.test(f)?"h"+f:f).indexOf("/",y)+1||f.length,
I=f.slice(y,_),
f=($=I.startsWith("0.0.0.0")?7:I.includes(":::")&&(h=/^(\[?::\]?):\d{2,5}$/.exec(I))?h[1].length:0)?f.slice(0,y)+($>6?"127.0.0.1":"[::1]")+f.slice(y+$):f),
u.openUrlWithActions(f,2,false,n)},u.goToNextUrl=function(n,u,r){var e=false
;return n=n.replace(/\$(?:\{(\d+)[,\/#@](\d*):(\d*)(:-?\d*)?\}|\$)/g,function(n,i,t,l,o){var f,c,a,s,d
;return"$$"===n?"$":(e=true,c=i&&parseInt(i)||1,a=t&&parseInt(t)||0,s=l&&parseInt(l)||0,
(d=o&&parseInt(o.slice(1))||1)<0&&(a=(f=[s,a])[0],s=f[1]),u*=d,c="absolute"!==r?c+u:u>0?a+u-1:u<0?s+u:c,
""+Math.max(a||1,Math.min(c,s?s-1:c)))}),[e,n]},L=function(n){var e,t
;if(r.Be.urls)r.Be.urls instanceof Array&&(n&&n.length>0?U(n):i.getCurTab(U));else{
if((null!=r.Be.url_mask||null!=r.Be.url_mark)&&!n)return i.On()||void i.getCurTab(u.openUrl)
;(e=r.Be.url)?u.openUrlWithActions(e+"",3,true,n):r.Be.copied?(t=r.p(d.xr(r.Be)))instanceof Promise?t.then(z.bind(null,n)):z(n,t):u.openUrlWithActions(r.Be.url_f||"",9,false,n)
}},u.openUrl=L,M=function(n,i){var f,c,a,d,v,p,w,g,b,y,h,_,I;if(e.mn(n),c=null!=i&&o.isNotVomnibarPage(i,true),
r.N=c?i:o.findCPort(i)||r.N,a=n.u,d=n.n&&s.parseFallbackOptions(n.n)||{},p=((v=n.o||e.pn()).k||"")+"",
w=null!==(f=v.t)&&void 0!==f?f:!p,g=v.s,y=(b=n.m||0)<64?-17&b:b,h=null!=n.f?n.f:43===y,d.group=!c||v.g,
d.incognito=null!=m(v.i)?v.i:43===y||null,
d.replace=v.m,d.position=v.p,d.reuse=null!=v.r?v.r:b?"window"===n.t?2:(16&b?-2:-1)+("last-window"===n.t?-4:0):n.r,
d.window=v.w,a)":"===a[0]&&!c&&/^:[bhtwWBHdso]\s/.test(a)&&(a=n.u=a.slice(2).trim()),_=a,a=w?l.ru(a,h):a,
a=r.i(a,c?h?1048576:524288:w?16384:0,g),I=void 0,h?a=(I=a!==_)?t.rr(a,null,-1):a:(I=!!w||!c&&!p)?(a=w?l.tu(a,w):a,
a=t.rr(a,p,c?-1:3)):(a=t.We(a.trim().split(e.jn),p,p&&"~"!==p?-1:0),
I=t.tr,a=t.tr?t.rr(a,null,a.startsWith("vimium:")?3:0):a),
I&&(2!==t.nr&&1!==t.nr||null==n.h?3===t.nr&&a.startsWith("vimium:")&&!_.startsWith("vimium://")&&(a=t.rr(a,null,t.tr||a.startsWith("vimium://run")?3:0)):a=(n.h?"https":"http")+a.slice("s"===a[4]?5:4)),
d.opener=c?false!==v.o:r.ce.vomnibarOptions.actions.includes("opener"),d.url_f=a;else{if(false===n.c)return
;d.copied=null==n.c||n.c,d.keyword=p,d.testUrl=v.t,d.sed=g}r.V=1,s.replaceCmdOptions(d),u.openUrl()},u.openUrlReq=M,
N=function(n,l){var o,f,c=function(e){var t,l,c,v=null!==(t=m(f.i))&&void 0!==t?t:2===r.A&&null;return e=e||[],
null!==v&&(e=e.filter(function(n){return n.incognito===v})),f.g&&o.length>0&&(l=i.getGroupId(o[0]),
e=e.filter(function(n){return i.getGroupId(n)===l})),e.length>0?(c=e.filter(function(n){return n.windowId===r.J}),
void a(c.length>0?c:e)):(n.f&&s.runNextCmdBy(0,n.f)||(o.length<=0||f.w||2===r.A&&!o[0].incognito?i.makeWindow({url:n.u,
type:w(f.w),incognito:2===r.A&&!i._n(n.u)},"",function(n){d(n&&n.tabs&&n.tabs.length>0?n.tabs[0]:null)
}):i.openMultiTabs({url:n.u,index:u.newTabIndex(o[0],f.p,false,true),openerTabId:f.o&&o[0]?o[0].id:void 0,
windowId:o[0].windowId,active:true},1,null,[null],f.g,o[0],d)),i.On())},a=function(u){var e,t,l,o=n.u
;n.p&&u.sort(function(n,u){return n.url.length-u.url.length}),(e=i.selectFrom(u)).url.length>u[0].url.length&&(e=u[0]),
!o.startsWith(r.e.Ee)||r.z.get(e.id)||n.s?(t=r.we?e.url.replace(/^edge:/,"chrome:"):e.url,
l=r.we?o.replace(/^edge:/,"chrome:"):o,i.tabsUpdate(e.id,{url:t.startsWith(l)?void 0:o,active:true},d),
i.selectWndIfNeed(e)):(i.tabsCreate({url:o},d),i.Bn.remove(e.id))},d=function(u){
if(!u)return n.f&&s.runNextCmdBy(0,n.f),i.On();s.runNextOnTabLoaded(n.f||{},u,n.s&&function(){v.It.Bt(n,u)})
},p=t.Ye(n.u.split("#",1)[0]);u.pu(p,l)||((null==(f=n.q||(n.q={})).g||p.startsWith(r.e.Ee))&&(f.g=false),
f.m?T(n.u,null!=f.r&&u.parseReuse(f.r)||1,f.m,null,n):i.Wn(i.getCurTab).then(function(u){
return __awaiter(void 0,void 0,void 0,function*(){var r,t,l,a,s,d,v,m;for(v of(o=u,r=[],t=p,l=w(f.w)||"normal",
e.kn.test(p)&&(a=p.indexOf("/")+2,
s=p.indexOf("/",a+1),(d=p.slice(a,s>0?s:void 0))&&d.includes("@")&&(t=p=p.slice(0,a)+d.split("@")[1]+p.slice(s))),
!p.startsWith("file:")&&!p.startsWith("ftp")||p.includes(".",p.lastIndexOf("/")+1)||r.push(t+(n.p?"/*":"/")),
r.push(n.p?t+"*":t),r))if((m=yield i.Wn(i.Bn.query,{url:v,windowType:l}))&&m.length>0)return c(m);c([])})}))},u.du=N});