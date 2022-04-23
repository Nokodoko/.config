"use strict"
;__filename="background/exclusions.js",define(["require","exports","./store","./utils","./browser","./normalize_urls","./settings","./ports"],function(n,t,u,o,r,e,i,l){
var f,a,c,s,v,m,p,d,$,g;Object.defineProperty(t,"__esModule",{value:true
}),t.Zn=t.nt=t.Kn=t.tt=t.Vn=t.Jn=t.ut=t.ot=t.rt=void 0,o=o,i=i,t.rt=function(n,t){var u,r
;return t=t&&t.replace(/<(\S+)>/g,"$1"),
"^"===n[0]?(u=o.k(n.startsWith("^$|")?n.slice(3):n,"",0))||console.log("Failed in creating an RegExp from %o",n):"`"===n[0]&&((r=o.v(n.slice(1),0))||console.log("Failed in creating an URLPattern from %o",n)),
u?{t:1,v:u,k:t}:r?{t:3,v:r,k:t}:{t:2,v:n.startsWith(":vimium://")?e.Xe(n.slice(10),false,-1):n.slice(1),k:t}},
t.ot=function(n){var t,u,r,i;return"^"===n[0]?(n=n.startsWith("^$|")?n.slice(3):n,
t=".*$".includes(n.slice(-2))?n.endsWith(".*$")?3:n.endsWith(".*")?2:0:0,n=0!==t&&"\\"!==n[n.length-t]?n.slice(0,-t):n,
(u=o.k(n,""))?{t:1,v:u}:null):"`"===n[0]?(r=o.v(n.slice(1)))?{t:3,v:r
}:null:"localhost"===n||!n.includes("/")&&n.includes(".")&&(!/:(?!\d+$)/.test(n)||o.sn(n,6))?(n=(n=(n=n.toLowerCase()).endsWith("*")?n.slice(0,/^[^\\]\.\*$/.test(n.slice(-3))?-2:-1):n).startsWith(".*")&&!/[(\\[]/.test(n)?"*."+n.slice(2):n,
i=void 0,
(u=o.k("^https?://"+(n.startsWith("*")&&"."!==n[1]?"[^/]"+n:(i=n.replace(/\./g,"\\.")).startsWith("*")?i.replace("*\\.","(?:[^./]+\\.)*?"):i),"",0))?{
t:1,v:u}:n.includes("*")?null:{t:2,v:"https://"+(n.startsWith(".")?n.slice(1):n)+"/"}):{t:2,
v:(t=(n=(n=(":"===n[0]?n.slice(1):n).replace(/([\/?#])\*$/,"$1")).startsWith("vimium://")?e.Xe(n.slice(9),false,-1):n).indexOf("://"))>0&&t+3<n.length&&n.indexOf("/",t+3)<0?n+"/":n
}},t.ut=function(n,t){return 1===n.t?n.v.test(t):2===n.t?t.startsWith(n.v):n.v.test(t)},t.Jn=f=false,t.Vn=a=false,
c=false,s=[],v=function(n){s=n.map(function(n){return t.rt(n.pattern,n.passKeys)})},m=function(n){
return(n?[t.rt(n,"")]:s).map(function(n){return{t:n.t,v:1===n.t?n.v.source:2===n.t?n.v:{hash:n.v.hash,
hostname:n.v.hostname,pathname:n.v.pathname,port:n.v.port,protocol:n.v.protocol,search:n.v.search}}})},t.tt=m,
p=function(n,r){var e,i,l,f,a="";for(i of s)if(1===i.t?i.v.test(n):2===i.t?n.startsWith(i.v):i.v.test(n)){
if(0===(l=i.k).length||"^"===l[0]&&l.length>2||c)return l&&l.trim();a+=l}
return!a&&r.Dn&&n.lastIndexOf("://",5)<0&&!o.kn.test(n)&&null!=(f=null===(e=u.z.get(r.Hn))||void 0===e?void 0:e.Sn)?t.Kn(f.s.fr,f.s):a?a.trim():null
},t.Kn=p,d=function(){var n=!r.Tn()||false?null:function(n){u.K[8](n)};return d=function(){return n},n},t.nt=function(){
var n,t,u,r=o.pn(),e=0;for(n of s)if(t=n.k){if("^"===t[0]&&t.length>2)return true;for(u of t.split(" "))r[u]=1,e++}
return e?r:null},$=function(n){var o,r,e=s.length>0?null:{N:1,p:null,f:0};n?e||i.so({N:3,H:8
}):(o=null!=u.$||void 0!==u.$&&u.ne,r=s,l.wo(function(n){var r,i,l,f=n.Qn.s.ve,a=n.Qn.s;for(r of n.po){if(i=null,l=0,e){
if(0===r.s.ve)continue}else if(l=null===(i=t.Kn(r.s.fr,r.s))?0:i?1:2,!i&&r.s.ve===l)continue;n.En||(r.postMessage(e||{
N:1,p:i,f:0}),r.s.ve=l)}o&&f!==a.ve&&u.b(a.Hn,a.ve)},function(){return r===s}))},t.Zn=$,g=function(){
var n,o,e=s.length>0,i=e||f?d():null;i&&(f!==e&&(t.Jn=f=e,n=r.Tn().onHistoryStateUpdated,
e?n.addListener(i):n.removeListener(i)),a!==(o=e&&u.ce.exclusionListenHash)&&(t.Vn=a=o,
n=r.Tn().onReferenceFragmentUpdated,o?n.addListener(i):n.removeListener(i)))},u.F.exclusionRules=function(n){
var o=!s.length,r=u.y;v(n),c=u.ce.exclusionOnlyFirstMatch,g(),setTimeout(function(){setTimeout(t.Zn,10,o),
u.y===r&&i.co("keyMappings",null)},1)},u.F.exclusionOnlyFirstMatch=function(n){c=n},u.F.exclusionListenHash=g,
i.lo.then(function(){v(u.ce.exclusionRules),c=u.ce.exclusionOnlyFirstMatch})});