"use strict"
;__filename="background/ports.js",define(["require","exports","./store","./utils","./browser","./exclusions","./i18n"],function(n,r,u,o,t,e,l){
var i,f,c,a,s,v,d,_,b,m,g,p,k;Object.defineProperty(r,"__esModule",{value:true}),
r.getParentFrame=r.complainNoSession=r.complainLimits=r.wo=r.ensuredExitAllGrab=r.showHUD=r.safePost=r.isNotVomnibarPage=r.ensureInnerCSS=r.indexFrame=r.isExtIdAllowed=r.findCPort=r.Nn=r.Rn=r.OnConnect=r.sendResponse=void 0,
i=function(n,r){if(90!==n.H)u.K[n.H](n,r);else{var o=u.K[n.c](n.a,r,n.i);o!==r&&r.postMessage({N:4,m:n.i,r:o})}},
r.sendResponse=function(n,r,o){var t=u.z.get(n.s.Hn);if(t&&t.po.includes(n))try{n.postMessage({N:4,m:r,r:o})}catch(n){}
},r.OnConnect=function(n,r){var o,l,a,d,_,b,m,g,p;if(64&r)s(n,r);else{if(a=(l=(o=v(n)).fr)===u.vomnibarPage_f,r>3||a){
if(999===r)return void(o.Hn>=0&&!o.Dn&&t.removeTempTab(o.Hn,n.sender.tab.windowId,o.fr))
;if(16&r||a)return void c(n,r,a||l===u.e.Fe)}
null!==(b=void 0!==(_=(d=o.Hn)>=0?u.z.get(d):void(d=o.Hn=u.getNextFakeTabId()))?_.En:null)?(g=b.Gn,
p=2===(m=b.ve)?3:1):(m=null===(g=e.Jn?e.Kn(l,o):null)?0:g?1:2,p=0),o.ve=m,void 0!==_&&(p|=4&_.Ln,32&r&&(p|=128,
_.Ln|=128),o.Ln=p),4&r?(o.Ln|=8&r,n.postMessage({N:1,p:g,f:3&p}),n.postMessage({N:6,d:u.ue})):n.postMessage({N:0,f:p,
c:u.ue,p:g,m:u.x,t:u.I,k:u.y}),n.onDisconnect.addListener(f),n.onMessage.addListener(i),
void 0!==_?(2&r&&(u.ne&&_.Qn.s.ve!==m&&u.b(d,m),_.Qn=n),1&r&&!_.Sn&&(_.Sn=n),_.po.push(n)):(u.z.set(d,{Qn:n,
Sn:1&r?n:null,po:[n],En:null,Ln:0}),0!==m&&u.ne&&u.b(d,m))}},f=function(n){var r,o,t=n.s.Hn,e=u.z.get(t)
;e&&(r=(o=e.po).lastIndexOf(n),n.s.Dn?(r===o.length-1?--o.length:r>=0&&o.splice(r,1),
o.length?n===e.Qn&&(e.Qn=o[0]):u.z.delete(t)):r>=0&&u.z.delete(t))},c=function(n,r,e){if(r>15){
if(e)return n.s.Hn<0&&(n.s.Hn=4&r?u.getNextFakeTabId():u.N?u.N.s.Hn:u.L),n.s.Ln|=256,u.U.push(n),
n.onDisconnect.addListener(a),n.onMessage.addListener(i),void(4&r||n.postMessage({N:42,l:u.ae,s:o.a(false)}))
}else n.s.Hn<0||u.de<50||0===n.s.Dn||t.Bn.executeScript(n.s.Hn,{file:u.e.Ke,frameId:n.s.Dn,runAt:"document_start"},t.On)
;n.disconnect()},a=function(n){var r=u.U,o=r.lastIndexOf(n);o===r.length-1?--r.length:o>=0&&r.splice(o,1)},
s=function(n,r){32&r?n.disconnect():(n.s=false,n.onMessage.addListener(i))},v=function(n){var r=n.sender,u=r.tab
;return r.tab=null,n.s={Dn:r.frameId||0,ve:0,Ln:0,Un:null!=u&&u.incognito,Hn:null!=u?u.id:-3,fr:r.url}},
d=function(n,o,l){var i
;return(n=n||(null===(i=u.z.get(u.L))||void 0===i?void 0:i.Sn))&&e.Jn&&(o||e.Vn)?n.s.fr:new Promise(function(o){
var e=u.de>48&&n&&n.s.Dn?t.Tn():null;n?(e?e.getFrame:t.tabsGet)(e?{tabId:n.s.Hn,frameId:n.s.Dn}:n.s.Hn,function(u){
var i=u?u.url:"";return!i&&e&&(l.N=3,r.safePost(n,l)),o(i),t.On()}):t.getCurTab(function(n){
return o(n&&n.length?t.getTabUrl(n[0]):""),t.On()})})},r.Rn=d,_=function(n,o){var t,e
;if(u.N=u.N||(null===(t=u.z.get(u.L))||void 0===t?void 0:t.Sn),
"string"!=typeof(e=r.Rn(u.N,o,n)))return e.then(function(r){return n.u=r,r&&u.K[n.H](n,u.N),r});n.u=e,u.K[n.H](n,u.N)},
r.Nn=_,r.findCPort=function(n){var r=u.z.get(n?n.s.Hn:u.L);return r?r.Qn:null},r.isExtIdAllowed=function(n){
var r,o,t=null!=n.id?n.id:"unknown_sender",e=n.url,l=n.tab,i=u.X,f=i.get(t)
;return true!==f&&l&&(o=(r=u.z.get(l.id))?r.Xn:null,r&&(null==o||o!==t&&"string"==typeof o)&&(r.Xn=null==o?t:2)),
null!=f?f:e===u.vomnibarPage_f||(console.log("%cReceive_ message from an extension/sender not in the allow list: %c%s","background-color:#fffbe5","background-color:#fffbe5;color:red",t),
i.set(t,false),false)},r.indexFrame=function(n,r){var o,t=u.z.get(n);for(o of t?t.po:[])if(o.s.Dn===r)return o
;return null},r.ensureInnerCSS=function(n){if(8&n.Ln)return null;var r=u.z.get(n.Hn);return r&&(r.Ln|=4),n.Ln|=12,u.re},
r.isNotVomnibarPage=function(n,r){var u=n.s,o=u.Ln
;return!(256&o)&&(r||512&o||(console.warn("Receive a request from %can unsafe source page%c (should be vomnibar) :\n %s @ tab %o","color:red","color:auto",u.fr.slice(0,128),u.Hn),
u.Ln|=512),true)},r.safePost=function(n,r){try{return n.postMessage(r),1}catch(n){return 0}},b=function(n,u){
r.showHUD(u,n)},m=function(n,o){if("string"==typeof n){var t=14===o||15===o
;t&&(n.startsWith(u.e.Re+"-")&&n.includes("://")&&(n=n.slice(n.indexOf("/",n.indexOf("/")+2)+1)||n),
n=n.length>41?n.slice(0,41)+"\u2026":n&&n+"."),u.N&&!r.safePost(u.N,{N:12,H:r.ensureInnerCSS(u.N.s),k:t&&n?20:o||1,t:n
})&&(u.N=null)}else n.then(b.bind(null,o))},r.showHUD=m,r.ensuredExitAllGrab=function(n){var r,u={N:8}
;for(r of n.po)4&r.s.Ln||(r.s.Ln|=4,r.postMessage(u));n.Ln|=4},r.wo=function(n,r){var t,e=o.hn(u.z),l=u.L,i=function(r){
var o=u.z.get(r),t=0;return null!=o&&(t=Math.min(o.po.length,8),n(o)),t}
;e.length<50?((t=e.indexOf(l))>=0&&(e.splice(t,1),n(u.z.get(l))),o.m(e,i,r)):e.forEach(i)},g=function(n){
Promise.resolve(n).then(function(n){r.showHUD(l.Yn("notAllowA",[n]))})},r.complainLimits=g,p=function(){
r.complainLimits("control tab sessions")},r.complainNoSession=p,k=function(n,u,o){
return u&&t.Tn()?1===o&&true?t.Wn(t.Tn().getFrame,{tabId:n,frameId:u}).then(function(u){var o=u?u.parentFrameId:0
;return o>0?r.indexFrame(n,o):null}):t.Wn(t.Tn().getAllFrames,{tabId:n}).then(function(t){var e,l=false,i=u
;if(!t)return null;do{for(e of(l=false,t))if(e.frameId===i){l=(i=e.parentFrameId)>0;break}}while(l&&0<--o)
;return i>0&&i!==u?r.indexFrame(n,i):null}):Promise.resolve(null)},r.getParentFrame=k});