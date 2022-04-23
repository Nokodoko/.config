"use strict"
;__filename="background/normalize_urls.js",define(["require","exports","./store","./utils"],function(e,r,t,n){
var i,a,u,s,l,o,f,c,m;Object.defineProperty(r,"__esModule",{value:true
}),r.$e=r.Ye=r.Ze=r.We=r.Xe=r.er=r.rr=r.tr=r.nr=r.ir=r.ar=r.ur=r.sr=r.lr=void 0,
r.lr=/^([^:]+(:[^:]+)?@)?([^:]+|\[[^\]]+])(:\d{2,5})?$/,r.sr=/^(?:ext|web)\+[a-z]+:/,
r.ur=/^"[^"]*"$|^'[^']*'$|^\u201c[^\u201d]*\u201d$/,r.ar=/\$([sS$])?(?:\{([^}]*)})?/g,r.ir=/\$([+-]?\d+)/g,
i=["blank","newtab","options","show"],u={__proto__:null,about:"",changelog:"/RELEASE-NOTES.md",help:"/wiki",home:"",
license:"/LICENSE.txt",option:a="options.html",permissions:"/PRIVACY-POLICY.md#permissions-required",
policy:"/PRIVACY-POLICY.md",popup:a,preference:a,preferences:a,privacy:"/PRIVACY-POLICY.md#privacy-policy",profile:a,
profiles:a,readme:"#readme",release:"/RELEASE-NOTES.md",releases:"/RELEASE-NOTES.md",
"release-notes":"/RELEASE-NOTES.md",setting:a,settings:a,wiki:"/wiki"},r.nr=0,r.tr=false,r.rr=function(e,i,a,u){
var f,c,p,d,v,w,b,h,g;return e=e.trim(),r.nr=0,n.dn(e)?(e=e.replace(/\xa0/g," "),n.wn(),e):(f=-1,c=0,p=false,
h='"'===(w=e.replace(/[\n\r]+[\t \xa0]*/g,"").replace(/\xa0/g," "))[0]&&w.endsWith('"'),g=w,e=w=h?w.slice(1,-1):w,
/^[A-Za-z]:(?:[\\/](?![:*?"<>|/])|$)|^\/(?:Users|home|root)\/[^:*?"<>|/]+/.test(e)||e.startsWith("\\\\")&&e.length>3?m(e):((d=(e=w.toLowerCase()).indexOf(" ")+1||e.indexOf("\t")+1)>1&&(e=e.slice(0,d-1)),
0===(d=e.indexOf(":"))?f=4:-1!==d&&n.kn.test(e)?e.startsWith("vimium:")?(f=3,a|=0,e=w.slice(9),
a<-1||!e?w="vimium://"+e:-1===a||h||!(w=t.u(e,a,null,(u||0)+1))?w=r.Xe(e,false,a):"string"!=typeof w&&(f=5)):r.sr.test(e)?f=0:(-1===(v=e.indexOf("/",d+3))?e.length<w.length:e.charCodeAt(v+1)<33)?f=4:/[^a-z]/.test(e.slice(0,d))?f=(d=e.charCodeAt(d+3))>32&&47!==d?0:4:e.startsWith("file:")?f=0:e.startsWith("chrome:")?f=e.length<w.length&&e.includes("/")?4:0:t.we&&e.startsWith("read:")?f=!/^read:\/\/([a-z]+)_([.\da-z\-]+)(?:_(\d+))?\/\?url=\1%3a%2f%2f\2(%3a\3)?(%2f|$)/.test(e)||e.length<w.length?4:0:e=e.slice(d+3,v>=0?v:void 0):(-1!==d&&e.lastIndexOf("/",d)<0&&(f=o(w.toLowerCase(),d,e.length%w.length)),
c=2,
v=w.length,-1===f&&e.startsWith("//")&&(e=e.slice(2),c=1,v-=2),-1!==f?"about:blank/"===e&&(w="about:blank"):(d=e.indexOf("/"))<=0?(0===d||e.length<v)&&(f=4):e.length>=v||e.charCodeAt(d+1)>32?(p=e.length>d+1,
e=e.slice(0,d)):f=4),-1===f&&e.lastIndexOf("%")>=0&&(e=n.cn(e)).includes("/")&&(f=4),
-1===f&&e.startsWith(".")&&(e=e.slice(1)),
-1!==f||((b=r.lr.exec(e))?(e=b[3]).endsWith("]")?f=n.sn(e,6)?c:4:"localhost"===e||e.endsWith(".localhost")||n.sn(e,4)||b[4]&&p?f=c:(d=e.lastIndexOf("."))<0||0===(f=n.ln(e.slice(d+1)))?(d<0&&"__proto__"===e&&(e="."+e),
v=e.length-d-1,
f=2!==c&&(d<0||(0!==c?v>=3&&v<=5:v>=2&&v<=14)&&!/[^a-z]/.test(e.slice(d+1)))||s(e,b[4])>0?c:4):f=/[^.\da-z\-]|xn--|^-/.test(e)?e.startsWith("xn--")||e.includes(".xn--")||(e.length===d+3||1!==f?!c:s(e,b[4]))?c:4:2!==c||p?c:e.endsWith(".so")&&e.startsWith("lib")&&e.indexOf(".")===e.length-3?4:b[2]||b[4]||!b[1]||/^ftps?(\b|_)/.test(e)?2:e.startsWith("mail")||e.indexOf(".mail")>0||(v=e.indexOf("."))===d?4:e.indexOf(".",++v)!==d?2:e.length===d+3&&1===f&&n.ln(e.slice(v,d),true)?4:2:(f=4,
e.length===w.length&&n.sn(e="[".concat(e,"]"),6)&&(w=e,f=2))),n.wn(),u||(r.tr=false),r.nr=f,
0===f?/^extension:\/\//i.test(w)?"chrome-"+w:w:4===f?r.We(g.split(n.jn),i,a,u):f<=2?2===f&&l(w,e)||(2===s(e,b&&b[4])?"https:":"http:")+(2===f?"//":"")+w:w))
},s=function(e,r){var n=r&&t.G.ke.get(e+r)||t.G.ke.get(e);return n?n.or?2:1:0},l=function(e,r){
if(/^(?!www\.)[a-z\d-]+\.([a-z]{3}(\.[a-z]{2})?|[a-z]{2})\/?$/i.test(e)&&!s(r)){var n=t.G.ke.get("www."+r)
;if(n)return"".concat(n.or?"https":"http","://www.").concat(e.toLowerCase().replace("/",""),"/")}return""},
o=function(e,t,i){var a="/"===e.substr(t+1,1);switch(e.slice(0,t)){case"about":return a?4:i>0||e.includes("@",t)?-1:0
;case"blob":case"view-source":
return(e=e.slice(t+1)).startsWith("blob:")||e.startsWith("view-source:")?4:(r.rr(e,null,-2,1),r.nr<=2?0:4);case"data":
return a?4:(t=e.indexOf(",",t))<0||i>0&&i<t?-1:0;case"file":return 0;case"filesystem":return e=e.slice(t+1),
n.kn.test(e)?(r.rr(e,null,-2,1),0===r.nr&&/[^/]\/(?:persistent|temporary)(?:\/|$)/.test(e)?0:4):4;case"magnet":
return"?"!==e[t+1]?-1:0;case"mailto":return a?4:(t=e.indexOf("/",t))>0&&e.lastIndexOf("?",t)<0?-1:0;case"tel":
return/\d/.test(e)?0:4;default:return r.sr.test(e)?0:a?4:-1}},r.er=function(e){
var r=e.startsWith("filesystem:")?11:e.startsWith("view-source:")?12:0;return r?e.slice(r):e},r.Xe=function(e,r,n){
var a,s,l="",o="",f=e.trim();if(!f)return r?"":location.origin+"/pages/";if((a=f.indexOf(" ")+1)&&(o=f.slice(a).trim(),
f=f.slice(0,a-1)),(a=f.search(/[\/#?]/)+1)&&(l=f.slice(a-1).trim(),f=f.slice(0,a-1)),"display"===f&&(f="show"),
!/\.\w+$/.test(f))if(f=f.toLowerCase(),
null!=(s=u[f]))("release"===f||"releases"===f)&&(s+="#"+t.e.Oe.replace(/\D/g,"")),
s=f=s&&"/"!==s[0]&&"#"!==s[0]?s:t.e.Te+(s.includes(".")?"/blob/master"+s:s);else{if("newtab"===f)return t.newTabUrl_f
;if("/"===f[0]||i.indexOf(f)>=0)f+=".html";else{if(1===n||-1===n)return"vimium://"+e.trim()
;f="show.html#!url vimium://"+f}}return r||s&&s.includes("://")||(f=location.origin+("/"===f[0]?"":"/pages/")+f),
l&&(f+=l),f+(o&&(f.includes("#")?" ":"#!")+o)},r.We=function(e,n,i,a){var u,s
;return s=(u=t.se.map.get(n=n||"~"))?r.Ze(e,u.fr,u.C):e.join(" "),a||(r.tr=!!u&&"~"!==n),
"~"!==n?r.rr(s,null,i,(a||0)+1):(r.nr=4,s)},r.Ze=function(e,t,i,a){var u,s=0
;return t=0===e.length&&i?i:t.replace(r.ar,function(i,l,o,f){var c
;return i.endsWith("$")?"$":(l||(/^s:/i.test(o)?(l=o[0],o=null==o?void 0:o.slice(2)):l="s"),"S"===l?(c=e,
l=" "):(c=u||(u=e.map(n.rn)),l=n.dn(t)?"%20":"+"),0===c.length?"":(o=o&&o.includes("$")?o.replace(r.ir,function(e,r){
var t=parseInt(r,10);if(!t)return c.join(l);if(t<0)t+=c.length+1;else if("+"===r[0])return c.slice(t-1).join(l)
;return c[t-1]||""}):c.join(null!=o?o:l),null!=a&&(a.push(f+=s,f+o.length),s+=o.length-i.length),o))}),n.wn(),
null==a?t:{fr:t,cr:a}},f=function(e){var t,n,i=e.indexOf(":"),a=i;if(i<=0)return e
;if(r.sr.test(e.slice(0,i+1).toLowerCase()))return e.slice(0,i).toLowerCase()+e.slice(i)
;if("://"===e.substr(i,3))if((i=e.indexOf("/",i+3))<0)i=a,
a=-1;else if(7===i&&"file"===e.slice(0,4).toLowerCase())return"file:///"+((i=":"===e.charAt(9)?3:"%3a"===e.substr(9,3).toLowerCase()?5:0)?e[8].toUpperCase()+":/":"")+e.slice(i+8)
;return n=(t=e.slice(0,i)).toLowerCase(),-1===a&&/^(file|ftp|https?|rt[ms]p|wss?)$/.test(t)&&(e+="/"),
t!==n?n+e.slice(i):e},r.Ye=f,c=function(e){var r=n.cn(e);return/[^\w.$+-\x80-\ufffd]|\s/.test(r)?e.replace("%24","$"):r
},m=function(e){var r,t,i
;return(e=e.replace(/\\/g,"/")).startsWith("//")&&!e.startsWith("//./")?((r=(e=e.slice(2)).split("/",1)[0]).includes("%")&&(e=c(r)+e.slice(r.length)),
e.includes("/")||(e+="/")):(e.startsWith("//")&&(e=e.slice(4)),":"===e[1]&&(e=e[0].toUpperCase()+":/"+e.slice(3)),
"/"!==e[0]&&(e="/"+e)),
/[%?#&\s]/.test(e)?(t="",e.indexOf("#")&&((i=/\.[A-Za-z\d]{1,4}(\?[^#]*)?#/.exec(e))?t=(t=e.slice(i.index+i[0].length-1)).includes("=")||!t.includes("/")||t.includes(":~:")?i[1]?i[1]+t:t:"":(i=/#(\w+=|:~:)/.exec(e))&&(t=e.slice(i.index)),
t&&(e=e.slice(0,-t.length))),e="file://"+e.replace(/[?#&\s]/g,encodeURIComponent)+t.replace(/\s/g,encodeURIComponent),
n.wn(),e):(n.wn(),"file://"+e)},r.$e=function(e,r){var i,a,u,s,l,o,f,m,p;if(2===t.fe&&e.startsWith("file://")){
if((i=e.indexOf("/",7))<0||i===e.length-1)return i<0?e+"/":e
;u=(a=7===i?":"===e.charAt(9)?3:"%3a"===e.substr(9,3).toLowerCase()?5:0:0)?e[8].toUpperCase()+":":i>7?"\\\\"+c(e.slice(7,i)):"",
s=e.slice(a?a+7:i>7?i:0),
e=u+s,l=r?/[?#]/.exec(r):null,(f=(o=!r||l?/[?#]/.exec(s):null)?o.index:0)&&l&&(m=n.cn(r.slice(r.indexOf("/",a?9:i>7?8:0),l.index)))===s.slice(0,m.length)&&(f=m.length),
p=f?s.slice(f):"",e=u+(s=(s=f?s.slice(0,f):s).replace(/\/+/g,"\\"))+p}return e}});