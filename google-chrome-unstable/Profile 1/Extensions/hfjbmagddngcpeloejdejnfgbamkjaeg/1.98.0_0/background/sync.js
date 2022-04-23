"use strict"
;__filename="background/sync.js",define(["require","exports","./store","./utils","./browser","./settings"],function(n,t,e,r,i,u){
function o(){return new Date(Date.now()-6e4*(new Date).getTimezoneOffset()).toJSON().slice(0,-5).replace("T"," ")}
var f,l,c,s,a,d,y,v,g,p,b,S,m,O,N,J,j,w,T,_,h,k,x,D,q;Object.defineProperty(t,"__esModule",{value:true}),u=u,
f=(r=r).mn({findModeRawQueryList:1,innerCSS:1,keyboard:1,newTabUrl_f:1,vomnibarPage_f:1}),l=i.Cn.storage,s=null,a="",
d=null,y=null,v=0,p=function(){return c||(c=l&&l.sync)},b=function(n){S(n,"sync")},S=function(n,t){var e,i,u
;if("sync"===t)if(e=function(n){var t,e,i,u;if(d){
for(t in r.mn(n),d)!(i=(e=t.split(":")[0])===t)&&e in d||O(e,null!=(u=i?d[t]:null)?u.newValue:n[e],n);d=null}},r.mn(n),
d?Object.assign(d,n):d=n,g)g.then(function(){return S({},t)});else for(i in n=d,d=null,n){if(u=n[i],
8===(i.includes(":")?8:O(i,null!=u?u.newValue:null)))return d=n,void p().get(e);delete n[i]}},m=function(){
console.log.apply(console,["[".concat(o(),"]")].concat([].slice.call(arguments)))},O=function(n,t,r){var i,o,f,l,c,s
;if(n in u.to&&x(n)){if(i=u.to[n],o=t&&"object"==typeof t&&t.$_serialize||""){if("split"===o&&!r)return 8
;if(8===(t=_(n,t,r)))return}null!=t?(f=g?i:e.ce[n],(s="object"!=typeof i)?(c=t,l=f):(c=JSON.stringify(t),
l=JSON.stringify(f)),
c!==l&&(c===(f=s?i:JSON.stringify(i))&&(t=i),g||m("sync.this: update",n,"string"==typeof t?(t.length>32?t.slice(0,30)+"...":t).replace(/\n/g,"\\n"):t),
N(n,t))):e.ce[n]!=i&&(g||m("sync.this: reset",n),N(n,i))}},N=function(n,t){a=n,u.ro(n,t),a="",n in u.eo&&u.so({N:6,
d:[u.eo[n]]})},J=function(n,t){x(n)&&n!==a&&(s||(setTimeout(k,800),s=r.pn()),s[n]=t)},j=function(n){
return n.replace(/[<`\u2028\u2029]/g,function(n){return"<"===n?"`l":"`"===n?"`d":"\u2028"===n?"`r":"`n"})},
w=function(n){return n.replace(/"|\\[\\"]/g,function(n){return'"'===n?"`q":'\\"'===n?"`Q":"`S"})},T=function(n){var t={
Q:'\\"',S:"\\\\",d:"`",l:"<",n:"\u2029",q:'"',r:"\u2028"};return n.replace(/`[QSdlnqr]/g,function(n){return t[n[1]]})},
_=function(n,t,e){var r,i,o,f,l="";switch(t.$_serialize){case"split":for(r=t.k,i=t.s,o=0;o<i;o++){
if(!(f=e[n+":"+o])||"string"!=typeof f||!f.startsWith(r))return 8;l+=f.slice(r.length)}break;case"single":
return JSON.parse(T(JSON.stringify(t.d)));default:
return m("Error: can not support the data format in synced settings data:",n,":",t.$_serialize),null}
return"string"==typeof u.to[n]?l=T(l):(l=T(JSON.stringify(l)),JSON.parse(l.slice(1,-1)))},h=function(n,t,e){
var r,i,o,f,l,c,s,a,d,v,g,p,b,S,m,O;if(t&&!("string"!=typeof t?"object"!=typeof t:t.length<8192/6-40)&&(i="",
!((r=JSON.stringify(t)).length<8192/6-40||(o=function(n){return n.replace(/[^\x00-\xff]/g,function(n){
var t=n.charCodeAt(0);return"\\u"+(t>4095?"":"0")+t.toString(16)})},f=true,l=r.length,
3*((c=(r=j(r)).length)-l)+3*l<8093)))){
if((i=f?e.encode(r):r=o(r)).length<8093)return(f?i.length+4*(c-l):Math.ceil((i.length-c)/5*3+6*(c-l)+(l-(i.length-c)/5-(c-l))))<8093?void 0:r
;for(s=0,a=Date.now().toString(36)+":",d={},r="string"==typeof u.to[n]?r.slice(1,-1):w(r),f?(y||(y=new TextDecoder),
i=e.encode(r)):i=o(r),v=0,g=i.length;v<g;){if(p=Math.min(v+8134,g),b=void 0,S=0,f){for(;p<g&&128==(192&i[p]);p--);
b=y.decode(i.subarray(v,p))}else b=i.slice(v,p);if(r=b.slice(-6),(S=p<g?r.lastIndexOf("\\"):-1)>0&&S>r.length-2)b+="b",
S=1;else if(S>0&&"u"===r[S+1])for(m=S=r.length-S;m++<6;b+="b");else S=0;if(b=JSON.parse('"'.concat(b,'"')),
S&&((O=b.endsWith("b"))||(p-=S),b=b.slice(0,S>1&&O?S-6:-1)),d[n+":"+s++]=a+b,v=p,s>=13)break}return d[n]={
$_serialize:"split",k:a,s:s},d}},k=function(){var n,t,o,f,l,c,a,d,v=s,g=[],b=[],S=[],O=r.pn(),N={};if(s=null,
v&&e.w===J){for(t in n=new TextEncoder,v)for(c="string"==typeof(l=u.to[o=t])||"object"==typeof l&&"vimSync"!==o?0:13,
null!=(f=v[o])?(a=h(o,f,n))&&"object"==typeof a?(O[o]=a,c=a[o].s):(N[o]=a?{$_serialize:"single",d:JSON.parse(a)}:f,
b.push(o)):(S.push(o),g.push(o));c<13;c++)S.push(o+":"+c)
;for(o in y=n=null,g.length>0&&m("sync.cloud: reset",g.join(", ")),S.length>0&&p().remove(S),
b.length>0&&(m("sync.cloud: update",b.join(", ")),p().set(N)),d=function(n){p().set(O[n],function(){var t=i.On()
;return t?m("Failed to update",n,":",t.message||t):m("sync.cloud: update (serialized) "+n),t})},O)d(o)}},x=function(n){
return!(n in f)},D=function(n){e.o=null,v&&clearTimeout(v),v=setTimeout(function(){v=0,u.ho.get(function(n){
var t,i,o,f,l,c,s,a,d=u.mo;if(d.length){for(m("storage.local: update settings from localStorage"),r.mn(n),t=r.pn(),i=0,
o=d.length;i<o;i++)l=n[f=d.key(i)],f in u.to?(s=c=e.ce[f],a=l,"object"==typeof u.to[f]&&(a=JSON.stringify(l),
s=JSON.stringify(c)),s!==a&&u.ro(f,c)):n[f]!==l&&"i18n_f"!==f&&(t[f]=l);Object.keys(t).length>0&&u.ho.set(t),d.clear()}
})},n)},q=function(n,t){var i,o,f;if(r.mn(n),!(n.vimSync||null==e.ce.vimSync&&e.me))return e.w=e.C,void t()
;for(f in n.vimSync||(m("sync.cloud: enable vimSync"),n.vimSync=true,p().set({vimSync:true})),i=[],o=u.mo,
e.ce)e.ce[f]!==u.to[f]&&(!(f in n)&&x(f)&&i.push(f),o&&o.removeItem(f));for(f of i)O(f,null)
;for(f in n)f.includes(":")||O(f,n[f],n);D(60),u.co("vimSync"),setTimeout(function(){t()},4),
m("sync.cloud: download settings")},e.F.vimSync=function(n){var t,r,i;if(p()){if(r=(t=p().onChanged)||l.onChanged,
i=t?b:S,!n)return r.removeListener(i),void(e.w=e.C);e.w!==J&&(r.addListener(i),e.w=J,D(60))}},u.lo.then(function(){
var n,t=e.ce.vimSync;false===t||!t&&!e.me?(e.o=(n=true===e.o)?null:D,n&&D(6e3),e.pe=null):(g=e.pe?e.pe.then(function(n){
return e.pe=null,!!n&&"install"===n.reason}).then(function(n){return n?new Promise(function(n){p()?p().get(function(t){
var r=i.On(),o=0===e.fe&&e.me&&(r||0===Object.keys(t).length)?function(){u.ro("ignoreKeyboardLayout",1),n()}:n
;return r?(e.F.vimSync=e.C,o(),m("Error: failed to get storage:",r,"\n\tSo disable syncing temporarily.")):q(t,o),r
}):n()}):void 0}).then(function(){e.h=null,g=null}):null,e.h=g&&Promise.race([g,new Promise(function(n){
setTimeout(n,800)})]).then(function(){e.h=null}))})});