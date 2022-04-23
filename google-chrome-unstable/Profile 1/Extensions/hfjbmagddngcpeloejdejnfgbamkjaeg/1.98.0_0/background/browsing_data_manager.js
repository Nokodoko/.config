"use strict"
;__filename="background/browsing_data_manager.js",define(["require","exports","./store","./browser","./utils","./settings","./completion_utils"],function(t,e,n,r,i,o,u){
var f,a,l,c,s,_,m,v,d,p,T,h;Object.defineProperty(e,"__esModule",{value:true
}),e.Pr=e.Br=e.Vr=e.Wr=e.qr=e.Hr=e.Gr=e.omniBlockList=void 0,i=i,o=o,f=decodeURIComponent,c=-1,s="1",_=null,v=null,
e.omniBlockList=m=null,e.Gr=function(t){var e,n,r=t.slice(0,5);if("https"===r)e=8;else if("http:"===r)e=7;else{
if(!r.startsWith("ftp"))return null;e=6}return n=t.indexOf("/",e),{
Kr:"__proto__"!==(t=t.slice(e,n<0?t.length:n))?t:".__proto__",Qr:e}},e.Hr={Xr:null,Yr:"",oi:0,kr:0,ui:null,
fi:function(){var t=r.Cn.bookmarks;t.onCreated.addListener(e.Hr.ai),t.onRemoved.addListener(e.Hr.li),
t.onChanged.addListener(e.Hr.li),t.onMoved.addListener(e.Hr.ai),t.onImportBegan.addListener(function(){
r.Cn.bookmarks.onCreated.removeListener(e.Hr.ai)}),t.onImportEnded.addListener(function(){
r.Cn.bookmarks.onCreated.addListener(e.Hr.ai),e.Hr.ai()})},ci:function(){n.H.ve=1,e.Hr.kr&&(clearTimeout(e.Hr.kr),
e.Hr.kr=0),r.Cn.bookmarks.getTree(e.Hr.si)},si:function(t){n.H.be=[],n.H.Me=[],n.H.ve=2,u._i.Et(2),
t.forEach(e.Hr.mi,e.Hr),setTimeout(function(){return e.Pr.vi(n.H.be)},50),e.Hr.fi&&(setTimeout(e.Hr.fi,0),e.Hr.fi=null)
;var r=e.Hr.ui;e.Hr.ui=null,r&&r()},mi:function(t){var r,o,u,f=t.title,a=t.id,l=f||a,c=e.Hr.Yr+"/"+l
;t.children?(n.H.Me.push({uo:a,di:c,pi:l}),r=e.Hr.Yr,2<++e.Hr.oi&&(e.Hr.Yr=c),t.children.forEach(e.Hr.mi,e.Hr),
--e.Hr.oi,e.Hr.Yr=r):(u=(o=t.url).startsWith("javascript:"),n.H.be.push({uo:a,di:c,pi:l,t:u?"javascript:":o,
Ti:m?e.Vr(o,f):1,u:u?"javascript:":o,fo:u?o:null,hi:u?i.cn(o):null}))},gi:function(){var t=performance.now()-n.H.Ce
;0===n.H.ve&&(t>=6e4||t<-5e3?(e.Hr.kr=n.H.Ce=0,n.H.je=false,e.Hr.ci()):(n.H.be=[],n.H.Me=[],
e.Hr.kr=setTimeout(e.Hr.gi,3e4),u._i.Et(2)))},ai:function(){n.H.Ce=performance.now(),
n.H.ve<2||(e.Hr.kr=setTimeout(e.Hr.gi,6e4),n.H.ve=0)},li:function(t,r){
for(var i,o,u,f,l,c,s=n.H.be,_=s.length,v=r&&r.title,d=0;d<_&&s[d].uo!==t;d++);if(d<_)return o=(i=s[d]).u,u=r&&r.url,
a&&(null==v?o!==i.t||!r:null!=u&&o!==u)&&n.D.has(o)&&e.qr.bi&&e.qr.xi(o)<0&&n.D.delete(o),
void(null!=v?(i.di=i.di.slice(0,-i.pi.length)+(v||i.uo),i.pi=v||i.uo,u&&(i.u=u,i.t=e.Pr.ki(u,i),e.Pr.wi()),
m&&(i.Ti=e.Vr(i.u,i.pi))):(s.splice(d,1),r||e.Hr.ai()));if(n.H.Me.find(function(e){return e.uo===t})){
if(null!=v)return e.Hr.ai();if(!n.H.je&&a){for(c of(f=n.D,l=e.qr.xi,e.qr.bi?s:[]))f.has(o=c.u)&&l(o)<0&&f.delete(o)
;n.H.je=true}return e.Hr.ai()}}},n.findBookmark=function(t,r){var o,u,f,a,l,c,s;if(2!==n.H.ve)return o=i.g(),
e.Hr.ui=o.zn,e.Hr.ci(),o.xn.then(n.findBookmark.bind(0,t,r))
;if(f=(u=r.includes("/"))?(r+"").replace(/\\\/?|\//g,function(t){return t.length>1?"/":"\n"
}).split("\n").filter(function(t){return t}):[],!r||u&&!f.length)return Promise.resolve(false)
;for(c of(a=u?"/"+f.slice(1).join("/"):"",
l=u?"/"+f[0]+a:"",t?[]:n.H.be))if(u&&(c.di===l||c.di===a)||c.pi===r)return Promise.resolve(c)
;for(c of t?n.H.Me:[])if(u&&(c.di===l||c.di===a)||c.pi===r)return Promise.resolve(c);for(c of(s=null,
t?[]:n.H.be))if(c.pi.includes(r)){if(s){s=null;break}s=c}return Promise.resolve(s)},d=function(t){t&&t()},e.qr={
bi:false,yi:0,Di:null,Li:function(t){e.qr.Di?t&&e.qr.Di.push(t):(n.G.Pe=Date.now(),e.qr.Di=t?[t]:[],
e.qr.yi||r.Cn.history.search({text:"",maxResults:2e4,startTime:0},function(t){setTimeout(e.qr.Ri,0,t)}))},
Ri:function(t){var i,o,u,f,a;for(e.qr.Ri=null,i=0,o=t.length;i<o;i++)(f=(u=t[i]).url).length>2e3&&(f=e.qr.ji(f,u)),
t[i]={t:f,pi:u.title,Ii:u.lastVisitTime,Ti:1,u:f};if(m)for(a of t)0===e.Vr(a.t,a.pi)&&(a.Ti=0);setTimeout(function(){
setTimeout(function(){var t,r,i,o,u,f,a,l,c=n.G.Se
;for(t=c.length-1;0<t;)for(u=(o=(r=c[t]).t=e.Pr.ki(i=r.u,r)).length>=i.length;0<=--t&&!((a=(f=c[t]).u).length>=i.length)&&i.startsWith(a);)f.u=i.slice(0,a.length),
l=u?a:e.Pr.ki(a,f),f.t=u||l.length<a.length?o.slice(0,l.length):l;e.qr.Mi&&setTimeout(function(){
e.qr.Mi&&e.qr.Mi(n.G.Se)},200)},100),n.G.Se.sort(function(t,e){return t.u>e.u?1:-1}),e.qr.bi=true,
r.Cn.history.onVisitRemoved.addListener(e.qr.Pi),r.Cn.history.onVisited.addListener(e.qr.Ui)},100),n.G.Se=t,e.qr.Li=d,
e.qr.Di&&e.qr.Di.length>0&&setTimeout(function(t){for(var e of t)e()},1,e.qr.Di),e.qr.Di=null},Ui:function(t){
var r,i,o,f,a,l,c,s,_,v=t.url;if(v.length>2e3&&(v=e.qr.ji(v,t)),r=t.lastVisitTime,i=t.title,o=++n.G.Ve,f=n.G.ke,
(a=e.qr.xi(v))<0&&n.G.Ne++,(o>59||o>10&&Date.now()-n.G.Pe>3e5)&&e.qr.Ei(),l=a>=0?n.G.Se[a]:{t:"",pi:i,Ii:r,
Ti:m?e.Vr(v,i):1,u:v},f&&(s=e.Gr(v))&&((c=f.get(s.Kr))?(c.Ii=r,a<0&&(c.Oi+=l.Ti),
s.Qr>6&&(c.or=8===s.Qr?1:0)):f.set(s.Kr,{Ii:r,Oi:l.Ti,or:8===s.Qr?1:0})),a>=0)return l.Ii=r,void(i&&i!==l.pi&&(l.pi=i,
u._i.Xt&&u._i.Et(1),m&&(_=e.Vr(v,i),l.Ti!==_&&(l.Ti=_,c&&(c.Oi+=_||-1)))));l.t=e.Pr.ki(v,l),n.G.Se.splice(~a,0,l),
u._i.Xt&&u._i.Et(1)},Pi:function(t){var r,i,o,f,a,c,s,_,m;if(l.length=0,r=n.D,u._i.Et(1),t.allHistory)return n.G.Se=[],
n.G.ke=new Map,i=new Set(n.H.be.map(function(t){return t.u})),void r.forEach(function(t,e){i.has(e)||r.delete(e)})
;for(s of(o=e.qr.xi,
f=n.G.Se,a=n.G.ke,t.urls))(_=o(s))>=0&&(a&&f[_].Ti&&(m=e.Gr(s))&&(c=a.get(m.Kr))&&--c.Oi<=0&&a.delete(m.Kr),
f.splice(_,1),r.delete(s))},ji:function(t,e){var n=t.lastIndexOf(":",9),r=n>0&&"://"===t.substr(n,3),o=e.title
;return t=t.slice(0,(r?t.indexOf("/",n+4):n)+320)+"\u2026",o&&o.length>160&&(e.title=i.vn(o,0,160)),t},Ei:function(){
var t=Date.now();if(n.G.Ne<=0);else{if(t<n.G.Pe+1e3&&t>=n.G.Pe)return;setTimeout(r.Cn.history.search,50,{text:"",
maxResults:Math.min(999,n.G.Ve+10),startTime:t<n.G.Pe?t-3e5:n.G.Pe},e.qr.Ai)}return n.G.Pe=t,n.G.Ne=n.G.Ve=0,e.Pr.wi()},
Mi:function(t){var r,i,o,u,f,a,l,c;for(i of(e.qr.Mi=null,r=n.G.ke,t))o=i.Ii,u=i.Ti,(f=e.Gr(i.u))&&(l=f.Qr,
(c=r.get(a=f.Kr))?(c.Ii<o&&(c.Ii=o),c.Oi+=u,l>6&&(c.or=8===l?1:0)):r.set(a,{Ii:o,Oi:u,or:8===l?1:0}))},Ai:function(t){
var r,i,o,u,f=n.G.Se,a=e.qr.xi;if(!(f.length<=0))for(r of t){if((i=r.url).length>2e3&&(r.url=i=e.qr.ji(i,r)),
(o=a(i))<0)n.G.Ne--;else if(!(u=r.title)||u===f[o].pi)continue;n.G.Ve--,e.qr.Ui(r)}},xi:function(t){
for(var e="",r=n.G.Se,i=r.length-1,o=0,u=0;o<=i;)if((e=r[u=o+i>>>1].u)>t)i=u-1;else{if(e===t)return u;o=u+1}return~o}},
p=function(t,n,i){var o=r.$n();o?o.getRecentlyClosed({
maxResults:Math.min(Math.round(1.2*t),+o.MAX_SESSION_RESULTS||25,25)},function(t){var o,u,f,a,l,c,s;for(a of(o=[],f=0,
t||[]))(l=a.tab)?((c=l.url).length>2e3&&(c=e.qr.ji(c,l)),s=l.title,(n||e.Vr(c,s))&&o.push({u:c,pi:s,
Si:(u=a.lastModified,u<3e11&&u>-4e10?1e3*u:u),Bi:[l.windowId,l.sessionId]})):f=1;return f?setTimeout(i,0,o):i(o),r.On()
}):i([])},e.Wr=p,e.Vr=function(t,e){return v.test(e)||v.test(t)?0:1},e.Br={Vi:function(t){var e,n
;if(m)for(e of t)for(n of m)if(n=n.trim(),e.includes(n)||n.length>9&&e.length+2>=n.length&&n.includes(e))return true
;return false},Wi:function(){var t,r,i,o,u;if(n.H.be)for(t of n.H.be)t.Ti=m?e.Vr(t.t,t.di):1
;if(n.G.Se)for(t of(r=n.G.ke,
n.G.Se))i=m?e.Vr(t.t,t.pi):1,t.Ti!==i&&(t.Ti=i,r&&(o=e.Gr(t.u))&&(u=r.get(o.Kr))&&(u.Oi+=i||-1))}},e.Pr={
ki:function(t,e){if(t.length>=400||t.lastIndexOf("%")<0)return t;try{return f(t)}catch(t){}
return n.D.get(t)||(e&&l.push(e),t)},vi:function(t){for(var r,i,o=n.D,u=l,a=-1,c=t.length;;)try{
for(;++a<c;)(r=t[a]).t=(i=r.u).length>=400||i.lastIndexOf("%")<0?i:f(i);break}catch(t){r.t=o.get(i)||(u.push(r),i)}
e.Pr.wi()},wi:function(){0!==l.length&&-1===c&&(c=0,setTimeout(T,17))}},T=function(){var t,e,r,i,o=l.length
;if(!s||c>=o)return l.length=0,c=-1,void(_=null)
;for(o=Math.min(c+32,o),_=_||new TextDecoder(s);c<o;c++)(t=n.D.get(i=(r="string"==typeof(e=l[c]))?e:e.u))?r||(e.t=t):(t=(t=i.replace(/%[a-f\d]{2}(?:%[a-f\d]{2})+/gi,h)).length!==i.length?t:i,
"string"!=typeof e?n.D.set(e.u,e.t=t):n.D.set(e,t));c<l.length?setTimeout(T,4):(l.length=0,c=-1,_=null)},h=function(t){
var e,n,r=new Uint8Array(t.length/3);for(e=1,n=0;e<t.length;e+=3)r[n++]=parseInt(t.substr(e,2),16);return _.decode(r)},
n.F.omniBlockList=function(t){var r,o=[];for(r of t.split("\n"))r.trim()&&"#"!==r[0]&&o.push(r)
;v=o.length>0?new RegExp(o.map(i.c).join("|"),""):null,e.omniBlockList=m=o.length>0?o:null,
(n.G.Se||n.H.be.length)&&setTimeout(e.Br.Wi,100)},o.lo.then(function(){o.co("omniBlockList")}),
n.F.localeEncoding=function(t){var r=!!t&&!(t=t.toLowerCase()).startsWith("utf"),i=s;if((s=r?t:"")!==i){try{
new TextDecoder(s)}catch(t){r=false}r?"1"!==i&&setTimeout(function(){return n.G.Se&&e.Pr.vi(n.G.Se),e.Pr.vi(n.H.be)
},100):(n.D.clear(),l&&(l.length=0)),a!==r&&(l=r?[]:{length:0,push:n.C},a=r,c=-1)}},o.co("localeEncoding"),
n.M.yu=function(t,n,i){switch(n){case"tab":u._i.qi(null),r.Bn.remove(+t,function(){var t=r.On();return t||u._i.qi(null),
i(!t),t});break;case"history":var o=!e.qr.bi||e.qr.xi(t)>=0;r.Cn.history.deleteUrl({url:t}),o&&u._i.Et(1),i(o)}},
n.M.Ci=e.Br.Vi});