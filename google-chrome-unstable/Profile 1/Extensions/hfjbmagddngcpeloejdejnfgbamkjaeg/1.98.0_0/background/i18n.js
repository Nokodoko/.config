"use strict"
;__filename="background/i18n.js",define(["require","exports","./store","./utils","./browser"],function(n,r,u,t,e){
var o,i,c,f,a,l,s;Object.defineProperty(r,"__esModule",{value:true
}),r.dr=r.getI18nJson=r.vr=r.br=r.Yn=r.gr=r.$r=r.jr=void 0,r.jr=1,i=0,r.$r=[],r.gr=function(n){
return e.Cn.i18n.getMessage(n)},c=function(n,u){if(1===i){var t=o.get(n)
;return null!=u&&t?t.replace(/\$\d/g,function(n){return u[+n[1]-1]}):t||""}return i||(i=r.getI18nJson("background")),
i.then(function(n){o=n,i=1}).then(r.Yn.bind(null,n,u))},r.Yn=c,f=function(n,r){return n.endsWith(r)},r.br=function(n,r){
return n&&n.split(" ").reduce(function(n,u){return n||(u.includes("=")?r&&u.startsWith(r)?u.slice(r.length+1):n:u)},"")
},a=function(n){var u=r.gr("i18n");return r.br(u,n||"background")||r.gr("lang1")||"en"},r.vr=a,l=function(n){
var u=f(n,".json")?n:"".concat(r.vr(n),"/").concat(n,".json");return t.l("/i18n/".concat(u))},r.getI18nJson=l,
s=function(){var n,u=r.$r,t=["$1","$2","$3","$4"];for(n=0;n<117;n++)u.push(e.Cn.i18n.getMessage(""+n,t));r.dr=null},
r.dr=s});