"use strict"
;__filename="background/filter_tabs.js",define(["require","exports","./store","./utils","./browser","./ports","./exclusions","./run_commands"],function(n,u,r,e,t,l,i,a){
var c,o,f,s,d;Object.defineProperty(u,"__esModule",{value:true
}),u.hu=u.mu=u.bu=u.mayRequireActiveTab=u.getNecessaryCurTabInfo=u.gu=u.getNearArrIndex=u.ku=u.wu=u.xu=u.getTabRange=void 0,
e=e,i=i,u.getTabRange=function(n,u,e,t){return c(n,u,e,r.V,t,r.Be.limited)},c=function(n,u,r,e,t,l){var i,a=e>0
;return t&&(e+=a?t:-t),
(i=n+e)<=u&&i>-2?a?[n,i]:[i+1,n+1]:false===l||null==l&&(Math.abs(e)<2*(r||u)||e<10)?Math.abs(e)<u?a?[u-e,u]:[0,-e]:[0,u]:a?[n,u]:[0,n+1]
},o=function(n,e,l,i,c,o){var f,s=function(i){var o,f,s,d;if(!i||!i.length)return c(0),t.On();o=t.selectIndexFrom(i),
s=(f=h?[0,i.length]:u.getTabRange(o,i.length,0,e))[0],d=f[1],h&&(a.overrideCmdOptions({limited:false},true),
a.overrideOption("$limit",r.V),r.V=r.V>0?9999:-9999),l(i,n?[s,o,d]:[o+1===d||r.V>0&&s!==o?s:d-1,o,d],c)
},d=r.Be.filter,h=d&&/(^|[&+])limit(ed)?=count\b/.test(d+"")
;i?0===i.length||Math.abs(r.V)>1||h?0===i.length||h||false?((f=i[0]?i[0].windowId:r.J)>=0?t.Wn(t.An.get,f,{populate:true
}):t.Wn(t.getCurWnd,true)).then(function(n){s(n?n.tabs:[])}):s(i):e?i[0].index+r.V<0?t.Mn(s):t.Bn.query({
windowId:i[0].windowId,index:i[0].index+r.V},function(e){
return e&&e.length&&(true===o||t.Fn(e[0])&&(!o||o(e[0])))&&(!d||u.mu(i[0],e,d).length>0)?r.V<0?l([e[0],i[0]],[0,1,n?2:1],c):l([i[0],e[0]],[n?0:1,0,2],c):t.Mn(s),
t.On()}):l(i,[0,0,1],c):c(0)},u.xu=o,u.wu=function(){var n=0,u=-1;return r.T.forEach(function(e,t){
e.i>n&&t!==r.L&&(n=e.i,u=t)}),u},f=function(n,r,e){var l
;return n&&(n.index||r)?e&&e[l=Math.max(e.indexOf(n),0)+(r?1:-1)]&&t.Fn(e[l])?Promise.resolve(e[l]):t.Wn(t.Bn.query,{
windowId:n.windowId,index:n.index+(r?1:-1)}).then(function(l){
return l&&l[0]?t.Fn(l[0])?l[0]:(e&&e.length>2?Promise.resolve(e.filter(t.Fn)):t.Wn(t.Mn)).then(function(e){
return e&&e.length?e[u.getNearArrIndex(e,n.index+(r?1:-1),r)]:null}):null}):Promise.resolve(null)},u.ku=f,
u.getNearArrIndex=function(n,u,r){
for(var e=n.length>1?0:1;e<n.length;e++)if(n[e].index>=u)return n[e].index===u||r?e:e>0?e-1:0;return n.length-1},
u.gu=function(n,u){1===Math.abs(n)?t.getCurTab(function(r){var e=r[0].index+n;e>=0?t.Bn.query({windowId:r[0].windowId,
index:e},function(e){return e?u(n>0?[r[0],e[0]]:[e[0],r[0]]):t.getCurTabs(u),t.On()}):t.getCurTabs(u)}):t.getCurTabs(u)
},s=function(n){if(!n)return null;var r=u.mayRequireActiveTab(n);return r>2?t.Wn(t.getCurTab).then(function(n){
return n&&n[0]||null}):r?Promise.resolve(l.Rn(null,r>1)).then(function(n){return n?{url:n}:null}):null},
u.getNecessaryCurTabInfo=s,u.mayRequireActiveTab=function(n){var u,r,e,t,l=0;for(u of(n+"").split(/[&+]/)){
if(e=(r=u.split("=",1)[0]).includes(".")?"":r||u,
t=u.slice(e?e.length+1:0),e&&"same"===t&&"hidden"!==e&&!e.startsWith("discard"))return 3;if(!t&&e){
if(e.startsWith("title")||"group"===e)return 3;l="hash"===e?2:l||("host"===e||"url"===e?1:0)}}return l},d=function(n,u){
return""===(n=n&&n.toLowerCase())||"1"===n||"true"===n?!u||null:"only"===n||"0"!==n&&"false"!==n&&null},
u.bu=function(n,u,r){var e=n?(n+"").split(/[&+]/).find(function(n){return n.startsWith(u)
}):null,t=e?e.slice(1+u.length):null;return null!==t?d(t,r):null},u.mu=function(n,u,a,o){
var f,s,h,v,m,b,g,k,p,w,x=0,M=0,_=0,I=[],P=function(u){
var l,a,c,o,s,h,v,m,b,g,k,p,w,P,j,y,q,A=u.split("=",1)[0],N=A.includes("."),O=!N&&A.endsWith("!"),$=N?"":(O?A.slice(0,-1):A)||u,z=u.slice(N?0:A.length+("="===u.charAt(A.length+1)?2:1)),B=z&&e.cn(z),C="same"===B||"cur"===B||"current"===B,D=null
;switch($){case"title":case"title*":l=B||n&&n.title,a=B&&"/"===B[0]?B.lastIndexOf("/"):0,
D=(c=a>1?e.k(B.slice(1,a),B.slice(a+1).replace(/g/g,""),0):null)?function(n){return c.test(n.title||"")}:l?function(n){
return(n.title||"").includes(l)}:D;break;case"url":case"urlhash":case"url+hash":case"url-hash":case"hash":o=null,
"url"===$&&B?o=i.ot(B):(s=n?t.getTabUrl(n):null,h=$.includes("hash"),o=s?i.ot(":"+(h?s:s.split("#",1)[0])):null),
D=o?function(n){return i.ut(o,t.getTabUrl(n))}:D;break;case"host":case"":
D=(v=B||($&&n?null===(f=e.in(t.getTabUrl(n)))||void 0===f?void 0:f.host:""))?function(n){var u
;return v===(null===(u=e.in(t.getTabUrl(n)))||void 0===u?void 0:u.host)}:D;break;case"active":
D=null!=(m=d(B,1))?function(n){return n.active===m}:D;break;case"new":case"old":case"visited":b=d(B)===("new"!==$),
D=function(n){return r.T.has(n.id)===b};case"discarded":case"discard":D=null!=(g=!C&&d(B,1))?function(n){
return n.discarded===g}:D;break;case"group":
D=null!=(k=B||(n?null!=t.getGroupId(n)?t.getGroupId(n)+"":"":null))?function(n){var u
;return(null!==(u=t.getGroupId(n))&&void 0!==u?u:"")+""===k}:D;break;case"hidden":D=D;break;case"highlight":
case"highlighted":D=null!=(p=C?n?n.highlighted:null:d(B))?function(n){return n.highlighted===p}:D;break;case"incognito":
case"incognito":D=null!=(w=C?n?n.incognito:null:d(B))?function(n){return n.incognito===w}:D;break;case"pinned":
D=null!=(P=C?n?n.pinned:null:d(B,1))?function(n){return n.pinned===P}:D;break;case"mute":case"muted":
D=null!=(j=C?n?t.isTabMuted(n):null:d(B))?function(n){return t.isTabMuted(n)===j}:D;break;case"audible":case"audio":
D=null!=(y=C?n?n.audible:null:d(B))?function(n){return n.audible===y}:D;break;case"min":case"max":case"limit":
case"limited":q="count"===B?r.Be.$limit||r.V:parseInt(B)||0,"min"===$?M=q:"max"===$?_=q:x=q||1,D=function(){return true}
}D&&I.push([D,O])};for(s of(a+"").split(/[&+]/))P(s);return o&&(o.known=I.length>0),0===I.length?u.slice(0):(h=u,
v=u.filter(function(n){for(var u of I)if(u[0](n)===u[1])return false;return true}),
!(m=v.length)||M>0&&m<M||_>0&&m>_?(r.Be&&r.Be.$else||l.showHUD(m?"".concat(m," tabs found but expect ").concat(m<M?M:_):"No tabs matched the filter parameter"),
[]):(x&&((b=n?h.indexOf(n):-1)<0&&(g=n?n.id:r.L,b=h.findIndex(function(n){return n.id===g})),
b>=0?((p=(k=v.findIndex(function(n){return h.indexOf(n)>=b}))>=0&&h.indexOf(v[k])>b)&&v.splice(k,0,null),
w=c(k>=0?k:m-1,m,0,r.V>0?x:-x,p?1:0,false),v=v.slice(w[0],w[1]),p&&(v=v.filter(function(n){return!!n
}))):v=x>0?v.slice(0,x):v.slice(-x)),v))},u.hu=function(n,u){var e,l,i=function(n,u){n.ind=u},a=function(n,u){
return n<u?-1:n>u?1:0},c=n.map(function(n,u){return{tab:n,ind:u,time:null,rhost:null,group:t.getGroupId(n),
pinned:n.pinned}}),o=-1,f=false
;for(l of(u instanceof Array?u.slice(0):(true===u?"time":u+"").split(/[, ]+/g)).reverse())e="r"===l[0]&&"e"!==l[1]||"-"===l[0]?(l=l.slice(1),
-1):1,l.includes("time")&&!l.includes("creat")||l.includes("recen")?(null==c[0].time&&c.forEach(function(n){
var u=n.tab.id,e=r.T.get(u);n.time=u===r.L?1:null!=e?2047-e.i:u+2
}),o=1):l.startsWith("host")||"url"===l?(c[0].rhost||c.forEach(function(n){
var u,r,e,t=n.tab.url,l=t.indexOf("://")+3,i=l>3?t.indexOf("/",l):0
;i<l?n.rhost=t:(e=(r=(u=t.slice(l,i)).lastIndexOf(":"))>0&&u.lastIndexOf(":",r-1)>0,
n.rhost=e?u:u.slice(0,r>0?r:u.length).split(".").reverse().join(".")+(r>0?" "+u.slice(1):""))}),
o="url"===l?3:2):o="title"===l?4:l.includes("creat")||"id"===l?5:"window"===l?6:"index"===l?7:"reverse"===l?(e=-1,7):-1,
o<0||(c.sort(function(n,u){
return(1===o?n.time-u.time:o<4?a(n.rhost,u.rhost)||(3===o?a(n.tab.url,u.tab.url):0):4===o?a(n.tab.title,u.tab.title):5===o?n.tab.id-u.tab.id:6===o?n.tab.windowId-u.tab.windowId:n.ind-u.ind)*e||n.ind-u.ind
}),c.forEach(i),f=true);return f&&c.some(function(n){return null!=n.group})&&c.sort(function(n,u){
return null==n.group?null==u.group?n.ind-u.ind:1:null==u.group||n.group<u.group?-1:n.group>u.group?1:n.ind-u.ind}),
f&&(c.forEach(i),c.sort(function(n,u){return n.pinned!==u.pinned?n.pinned?-1:1:n.ind-u.ind})),f?c.map(function(n){
return n.tab}):n}});