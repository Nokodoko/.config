"use strict"
;__filename="background/eval_urls.js",define(["require","exports","./store","./utils","./browser","./normalize_urls","./parse_urls","./ports","./exclusions","./i18n"],function(e,r,n,s,u,a,t,c,l,i){
var f,o,p;Object.defineProperty(r,"__esModule",{value:true}),l=l,n.u=function(e,r,l,i){var d,g,b,h,m,y,v,x,$,k;if(r|=0,
"paste"===e?e+=" .":e.includes("%20")&&!e.includes(" ")&&(e=e.replace(/%20/g," ")),
r<0||!(e=e.trim())||(d=e.search(/[/ ]/))<=0||!/^[a-z][\da-z\-]*(?:\.[a-z][\da-z\-]*)*$/i.test(g=e.slice(0,d).toLowerCase())||/\.(?:css|html?|js)$/i.test(g))return null
;if(!(e=e.slice(d+1).trim()))return null;if(1===r)switch(g){case"sum":case"mul":
e=e.replace(/[\s+,\uff0b\uff0c]+/g,"sum"===g?" + ":" * "),g="e";break;case"avg":case"average":
b=e.split(/[\s+,\uff0b\uff0c]+/g),e="("+b.join(" + ")+") / "+b.length,g="e"}if(1===r)switch(g){case"e":case"exec":
case"eval":case"expr":case"calc":case"m":case"math":return u.import2("/lib/math_parser.js").then(f.bind(0,e))
;case"error":return[e,3]}else if(r>=2)switch(g){case"run":return[["run",e],6];case"status":case"state":
return r>=3&&o(e),[e,r>=3?4:7];case"url-copy":case"search-copy":case"search.copy":case"copy-url":
if((m=a.rr(e,null,1,i))instanceof Promise)return m.then(function(e){var r=e[0]||e[2]||""
;return r=r instanceof Array?r.join(" "):r,[r=n.f(r),1]})
;e=(m=5===a.nr&&m instanceof Array?m[0]:m)instanceof Array?m.join(" "):m;case"cp":case"copy":case"clip":
return[e=n.f(e),1]}switch(g){case"urls":return r<1?null:p(e,r);case"cd":case"up":if(!(b=(e+"  ").split(" "))[2]){
if(r<1)return null;if("string"!=typeof(m=c.Rn()))return m.then(function(s){
var u=s&&n.u("cd "+e+" "+(e.includes(" ")?s:". "+s),r,l,i)
;return u?"string"==typeof u?[u,7]:u:[s?"fail in parsing":"No current tab found",3]});b[2]=m}return y="/"===(g=b[0])[0],
d=parseInt(g,10),d=isNaN(d)?"/"===g?1:y?g.replace(/(\.+)|./g,"$1").length+1:-g.replace(/\.(\.+)|./g,"$1").length||-1:d,
(v=t.fu({u:b[2],p:d,t:null,f:1,a:"."!==b[1]?b[1]:""}))&&v.u||[v?v.e:"No upper path",3];case"parse":case"decode":
(g=e.split(" ",1)[0]).search(/\/|%2f/i)<0?e=e.slice(g.length+1).trimLeft():g="~",b=[e=s.an(e)],e=a.rr(e,null,0,i),
4!==a.nr&&(h=t.fu({u:e}))?""===h.u?b=[g]:(b=h.u.split(" ")).unshift(g):b=b[0].split(s.jn);break;case"sed":
case"substitute":case"sed-p":case"sed.p":case"sed2":return x=e.split(" ",1)[0],e=e.slice(x.length+1).trim(),
$="sed2"===g?e.split(" ",1)[0]:"",[e=(e=e.slice($.length).trim())&&n.i(e,g.endsWith("p")?32768:0,$?{r:x,k:$
}:/^[@#$-]?[\w\x80-\ufffd]+$|^\.$/.test(x)?{r:null,k:x}:{r:x,k:null}),5];case"u":case"url":case"search":
b=s.an(e,true).split(s.jn);break;case"paste":if(r>0)return(m=n.p(e))instanceof Promise?m.then(function(e){
return[e?e.trim().replace(s.jn," "):"",5]}):[m?m.trim().replace(s.jn," "):"",5];default:return null}
return l?[b,2]:i&&i>12?null:(k=b[0]&&n.se.map.has(b[0])?b.shift():null,a.We(b,k,12===i?0:r,i))},f=function(e,r){
var n,s,u
;for(a.ur.test(e)&&(e=e.slice(1,-1)),e=(e=(e=e.replace(/\uff0c/g," ")).replace(/deg\b/g,"\xb0").replace(/[\xb0']\s*\d+(\s*)(?=\)|$)/g,function(e,r){
return(e=e.trim())+("'"===e[0]?"''":"'")+r
}).replace(/([\u2070-\u2079\xb2\xb3\xb9]+)|[\xb0\uff0b\u2212\xd7\xf7]|''?/g,function(e,r){var n,s,u=""
;if(!r)return"\xb0"===e?"/180*PI+":(n="\uff0b\u2212\xd7\xf7".indexOf(e))>=0?"+-*/"[n]:"/".concat("''"===e?3600:60,"/180*PI+")
;for(s of e)u+=s<"\xba"?s>"\xb3"?1:s<"\xb3"?2:3:s.charCodeAt(0)-8304;return u&&"**"+u
}).replace(/([\d.])rad\b/g,"$1")).replace(/^=+|=+$/g,"").trim(),n=[].reduce.call(e,function(e,r){
return e+("("===r?1:")"===r?-1:0)},0);n<0;n++)e="("+e;for(;n-- >0;)e+=")";if(e){
for(;e&&"("===e[0]&&")"===e.slice(-1);)e=e.slice(1,-1).trim();e=e||"()"}if(s="",
(u=r.MathParser||globalThis.MathParser||{}).evaluate){try{s="function"==typeof(s=u.evaluate("()"!==e?e:"0"))?"":""+s
}catch(e){}u.clean(),u.errormsg&&(u.errormsg="")}return[s,0,e]},o=function(e){
var r,u,a,t,f,o,p,d,g,b,h,m,y,v,x,$,k,_,w=n.L;if(!parseInt(e,10)||(w=parseInt(e,10),e=e.slice(e.search(/[/ ]/)+1)),
r=n.z.get(w||(w=n.L))){for(k of(n.N=r.Sn||r.Qn,a=(u=e.search(/[/ ]/))>0?e.slice(u+1):"",e=e.toLowerCase(),
u>0&&(e=e.slice(0,u)),e.includes("-")&&e.endsWith("able")&&(e+="d"),a=((t=!!a&&/^silent/i.test(a))?a.slice(7):a).trim(),
f=0,o=function(e){console.log(e),f||c.showHUD(e),f=1},a.includes("%")&&/%[a-f0-9]{2}/i.test(a)&&(a=s.cn(a)),
a&&!a.startsWith("^ ")?(o('"vimium://status" only accepts a list of hooked keys'),
a=""):a&&(p=a.match(/<(?!<)(?:a-)?(?:c-)?(?:m-)?(?:s-)?(?:[a-z]\w+|[^\sA-Z])>|\S/g),
a=p?p.join(" ").replace(/<(\S+)>/g,"$1"):""),b=(g=n.N.s).ve,h=l.Jn?1===b?b:(d=l.Kn(g.fr,g))?1:null===d?0:2:0,
y=!!a&&"enable"===e,x={N:1,
p:2===(m="enable"===e?0:"disable"===e?2:"toggle-disabled"===e?2!==b?2===h?null:2:2===h?0:null:"toggle-enabled"===e?0!==b?0===h?null:0:0===h?2:null:"toggle-next"===e?1===b?0:0===b?2===h?null:2:2===h?0:null:"toggle"===e||"next"===e?0!==b?0:2:("reset"!==e&&o('Unknown status action: "'.concat(e,'", so reset')),
null))||y?a:null,f:v=null===m?0:2===m?3:1},$=v?m:0,r.En=v?{ve:$,Gn:x.p}:null,r.po))_=k.s,
!v&&l.Jn&&1!=($=null===(d=x.p=l.Kn(_.fr,_))?0:d?1:2)&&_.ve===$||(_.ve=$,k.postMessage(x));$=r.Qn.s.ve,
t||f||Promise.resolve(i.Yn(0!==$||y?2===$?"fullyDisabled":"halfDisabled":"fullyEnabled")).then(function(e){
c.showHUD(i.Yn("newStat",[e]))}),n.ne&&$!==b&&n.b(w,$)}},p=function(e,r){
var s,u,t,c,l=e.indexOf(":")+1||e.indexOf(" ")+1;if(l<=0)return["No search engines given",3]
;if((s=e.slice(0,l-1).split(e.lastIndexOf(" ",l-1)>=0?" ":"|").filter(function(e){return n.se.map.has(e)
})).length<=0)return["No valid search engines found",3];for(c of(u=e.slice(l).split(" "),t=["openUrls"],
s))t.push(a.We(u,c,r));return t.some(function(e){return e instanceof Promise})?Promise.all(t).then(function(e){
return[e,6]}):[t,6]}});