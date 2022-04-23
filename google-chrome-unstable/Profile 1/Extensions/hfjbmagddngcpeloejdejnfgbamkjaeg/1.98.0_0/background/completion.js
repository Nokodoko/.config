"use strict"
;__filename="background/completion.js",define(["require","exports","./store","./browser","./utils","./normalize_urls","./parse_urls","./completion_utils","./browsing_data_manager"],function(n,r,e,t,u,f,i,o,l){
var a,s,c,_,m,v,d,h,p,w,b,g,y,S,x,k,M,T,R,$,z,A,F,j,B,D,E,I;Object.defineProperty(r,"__esModule",{value:true}),u=u,a=0,
s=false,c=false,_=0,m=0,v=0,d=0,h=0,p=[""],w="",b="",g="",y="",S=0,x=false,k=false,M="",T="",R=0,$=true,
z=function(n,r,e,t,u,f){this.e=n,this.u=r,this.t=e,this.title=t,this.r=u(this,f),this.visit=0},A={_u:function(n,r){
if(0!==p.length&&1&R)2===e.H.ve?A.Su():l.Hr.ui=function(){n.o||A.Su()};else if(E.Mu([],1),r)return;0===e.H.ve&&l.Hr.ci()
},Su:function(){var n,r,t,u,f,i,a,s,c,v,w=p.some(function(n){return 47===n.charCodeAt(0)
}),b=null===(n=o._i.Tu)||void 0===n?void 0:n.be,g=o._i.Ru?[]:null,y=b&&b[0]===w?b[1]:e.H.be,S=y.length,x=[]
;for(t=0;t<S;t++)if(o.zu((u=y[t]).t,w?u.di:u.pi)&&($||u.Ti)){if(null!==g&&g.push(u),
T&&u.u.length<T.length+2&&T===(u.u.endsWith("/")?u.u.slice(0,-1):u.u))continue;x.push([-o.Au(u.t,u.pi),t])}
for(a of(g&&(o._i.Ru.be=[w,g]),d+=r=x.length,r?(x.sort(o.sortBy0),h>0&&!(6&R)?(x=x.slice(h,h+m),
h=0):r>h+m&&(x.length=h+m)):R^=1,f=[],i=64&_?-.666446:0,x))s=a[0],i&&(s=s<i?s:(s+i)/2),
c=new z("bookm",(u=y[t=a[1]]).u,u.t,w?u.di:u.pi,o.get2ndArg,-s),v=32&_&&l.qr.bi?l.qr.xi(u.u):-1,
c.visit=v<0?0:e.G.Se[v].Ii,f.push(c),null!==u.fo&&(c.u=u.fo,c.title=o.cutTitle(w?u.di:u.pi),
c.textSplit="javascript: \u2026",c.t=u.hi);E.Mu(f,1)}},F={_u:function(n,r){var t,u,f,i,a
;if(!p.length&&1024&_||!(2&R))return E.Mu([],2);if(t=p.length>0,e.G.Se){if(t)return void E.Mu(F.Su(),2)
;(e.G.Ve>10||e.G.Ne>0)&&l.qr.Ei()}else if(u=t?function(){n.o||E.Mu(F.Su(),2)}:null,
t&&(c||l.qr.yi)?(l.qr.yi>0&&clearTimeout(l.qr.yi),l.qr.yi=0,l.qr.Li(u)):(l.qr.yi||(l.qr.yi=setTimeout(function(){
l.qr.yi=0,l.qr.Li(u)},t?200:150)),t&&E.Fu((a=(i=(f=E.ju).length)>0)&&"search"===f[0].t?[f[0]]:[],s&&a,0,0,i,b,S)),
t)return;0===r?o.Bu(k,_,F.Du,n):l.Wr(h+m,$,F.Eu.bind(null,n))},Su:function(){
var n,r,t,u,i,a,s=1===p.length?p[0]:"",c=!!s&&("."===s[0]?/^\.[\da-zA-Z]+$/.test(s):(f.rr(s,null,-2),
f.nr<=2)),_=c?"."===s[0]||f.nr>0?o.Ou.Iu[0]:(o.Ou.Qu||o.Ou.Uu(),
o.Ou.Qu[0]):null,v=o._i.Ru?[]:null,w=[-1.1,-1.1],b=[],g=o.zu,y=c&&s.includes("%")&&!/[^\x21-\x7e]|%[^A-F\da-f]/.test(s),S=m+h,x=-1.1,k=0,T=0,A=0
;for(M&&S++,T=S;--T;)w.push(-1.1,-1.1)
;for(S=2*S-2,t=(r=(null===(n=o._i.Tu)||void 0===n?void 0:n.Se)||e.G.Se).length;k<t;k++)if(u=r[k],
(c?_.test(y?u.u:u.t):g(u.t,u.pi))&&($||u.Ti)&&(null!==v&&v.push(u),
A++,(i=c?o.ComputeRecency(u.Ii)||1e-16*Math.max(0,u.Ii):o.ComputeRelevancy(u.t,u.pi,u.Ii))>x)){
for(T=S-2;0<=T&&w[T]<i;T-=2)w[T+2]=w[T],w[T+3]=w[T+1];w[T+2]=i,w[T+3]=k,x=w[S]}for(v&&(o._i.Ru.Se=v),d+=A,A||(R^=2),
5&R?k=0:(k=2*h,
h=0);k<=S&&!((i=w[k])<=0);k+=2)(u=r[w[k+1]]).u!==M&&((a=new z("history",u.u,y?u.u:u.t,u.pi,o.get2ndArg,i)).visit=u.Ii,
b.push(a));return l.Pr.wi(),b},Du:function(n,r){var e,u,f,i;if(o._i.qi(r),!n.o){for(f of(e=new Set,u=0,
r))f.incognito&&o.tabsInNormal||(i=t.getTabUrl(f),e.has(i)||(e.add(i),u++));return F.Zu([],n,e,h,u)}},Eu:function(n,r){
var e,t,u;if(!n.o)return e=[],t=new Set,u=-h,r.some(function(n){var r,f=n.u;return!t.has(r=f+"\n"+n.pi)&&(t.add(r),
t.add(f),++u>0&&e.push(n),e.length>=m)})?F.qu(e):F.Zu(e,n,t,-u,0)},Zu:function(n,r,e,u,f){(0,t.Cn.history.search)({
text:"",maxResults:h+m*($?1:2)+f},function(t){if(!r.o){t=t.filter(function(n){var r=n.url
;return r.length>2e3&&(n.url=r=l.qr.ji(r,n)),!e.has(r)&&($||0!==l.Vr(n.url,n.title||""))}),
u<0?t.length=Math.min(t.length,m-n.length):u>0&&(t=t.slice(u,u+m));var f=t.map(function(n){return{u:n.url,
pi:n.title||"",Si:n.lastVisitTime,Bi:null}});u<0&&(f=n.concat(f)),F.qu(f)}})},qu:function(n){n.forEach(F.Cu),h=0,
l.Pr.wi(),E.Mu(n,2)},Cu:function(n,r,e){
var t=n.u,u=new z("history",t,l.Pr.ki(t,t),n.pi||"",o.get2ndArg,(99-r)/100),f=n.Bi;u.visit=n.Si,f&&(u.s=f,
u.label='<span class="undo">&#8630;</span>'),e[r]=u}},j={_u:function(n,r){
if(1!==p.length||!(16&R)||p[0].lastIndexOf("/",p[0].length-2)>=0)return E.Mu([],16);if(l.qr.Mi){
if(!e.G.Se)return r>0?E.Mu([],16):l.qr.Li(function(){n.o||j._u(n,0)});l.qr.Mi(e.G.Se)}return j.Su()},Su:function(){
var n,r,t,f,i,l,a,c,_,v,w,b=e.G.ke,g=o.Gu,y=16===R&&s?[]:null,S=p[0].replace("/","").toLowerCase(),x=S===p[0],k=[],M="",T=-1.1
;for(r of(o.Hu(3),b.keys()))r.includes(S)&&(n=b.get(r),($||n.Oi>0)&&(t=o.ComputeRelevancy(r,"",n.Ii),y?y.push({r:t,d:r,
m:n}):t>T&&(T=t,M=r)))
;if(f=M.length===S.length,M&&!f&&(M.startsWith("www.")||M.startsWith(S)||(i=M.slice(M.indexOf(".")+1)).includes(S)&&(l=void 0,
(l=b.get(i="www."+i))?($||l.Oi>0)&&(M=i,n=l):(l=b.get(i="m."+i))&&($||l.Oi>0)&&($||l.Oi>0)&&(M=i,n=l)),
(a=M.startsWith(S)?0:M.startsWith("www."+S)?4:-1)>=0&&(w=(_=(c=u.fn(M))[0]).length-1,
(v=c[1])>1&&(!(a=M.length-a-S.length-_[w].length-1)||3===v&&a===_[w-1].length+1)&&(f=true))),M)d++,s=!h&&f||s,
k=j.Nu(M,n,0,x);else if(y)for(w of(y.sort(j.Pu),(d=y.length)>h+m&&(y.length=h+m),y))k.push(j.Nu(w.d,w.m,w.r,x)[0])
;o.Hu(g),E.Mu(k,16)},Nu:function(n,r,t,f){var i,a,s,c,_,v,d,p,w=r.or>0,b=""
;return 2===e.H.ve&&(i=new RegExp("^https?://".concat(u.c(n),"/?$")),a=e.H.be.filter(function(n){
return i.test(n.u)&&($||n.Ti)}),a.length>0&&(s=a.filter(function(n){return"s"===n.u[4]}),
T=(c=(a=(w=s.length>0)?s:a)[0].u).endsWith("/")?c.slice(0,-1):c,b=a[0].pi)),_=(w?"https://":"http://")+n+"/",!t&&(M=_,
h>0)?(h--,[]):(v=new z("domain",_,f?n:n+"/","",o.get2ndArg,t||2),p=(d=l.qr.bi?l.qr.xi(_):-1)>0?e.G.Se[d]:null,o.Wu(v),
p&&($||p.Ti)&&(v.visit=p.Ii,b=b||p.pi),v.title=o.cutTitle(b,[]),--m,[v])},Pu:function(n,r){return r.r-n.r}},B={
_u:function(n,r){!(4&R)||r&&(!p.length||256&_)?E.Mu([],4):o.Bu(k,_,B.Su,n)},Su:function(n,r){
var f,i,a,s,w,b,g,y,S,x,M,T,$,A,F,j,D,I,O,Q,U,Z,q,C,G,H,N,P,W,J,K,L,V,X,Y,nn,rn;if(o._i.qi(r),!n.o){if(f=e.L,
i=p.length<=0,a=3&R,w=[],(s=!!(8&_)&&k&&i&&!c)&&!(128&_)&&r.length>h&&r.length>v){for(g of(b=new Map,r))b.set(g.id,g)
;for(M=(x=(S=(y=b.get(f))?y.openerTabId:0)?b.get(S):null)?r.indexOf(x):y?r.indexOf(y)-1:0,
T=x?0:v/2|0;1<--T&&M>0&&r[M-1].openerTabId===S;M--);r=M>0?r.slice(M).concat(r.slice(0,M)):r}for(g of($=[],A=[],
F=!i&&/^:[a-z]+/gm.test(p.join("\n")),r))!k&&o.tabsInNormal&&g.incognito||(j=t.getTabUrl(g),
D=g.text||(g.text=l.Pr.ki(j,g.incognito?"":j)),I=g.title,F&&(1===p.length&&(D=I=""),g.audible&&(I+=" :audible :audio",
I+=t.isTabMuted(g)?" :muted":" :unmuted"),g.discarded&&(I+=" :discarded"),g.incognito&&(I+=" :incognito"),
g.pinned&&(I+=" :pinned")),(i||o.zu(D,I))&&(O=g.windowId,!k&&A.lastIndexOf(O)<0&&A.push(O),$.push(g)))
;if(a&&1===$.length&&$[0].id===f&&($.length=0),d+=Q=$.length,Q||(R^=4),h>=Q&&!a)return h=0,E.Mu(w,4);if(A.sort(B.Ju),
U=i?s?B.Ku:B.Lu:o.ComputeWordRelevancy,
Z=s?u.pn():null,q=A.length>1?e.J:0,s)for(g of $)Z[g.id]=(G=(C=g.openerTabId)&&Z[C])?G<5?G+1:5:1
;for(H=32&_?1===e.fe?0:e.de<62?Date.now()-performance.now():performance.timeOrigin:0,N=0;N<$.length;)P=(g=$[N++]).id,
W=s?Z[P]:1,j=t.getTabUrl(g),J=e.T.get(P),K=new z("tab",j,g.text,g.title,U,s?N:P),
L=q&&g.windowId!==q?"".concat(A.indexOf(g.windowId)+1,":"):"",V="",L+=N,f===P?(s||(K.r=i?1<<31:0),
L="(".concat(L,")")):J||(L="**".concat(L,"**")),!o.tabsInNormal&&g.incognito&&(V+="*"),!!g.discarded&&(V+="~"),
g.audible&&(V+=t.isTabMuted(g)?"\u266a":"\u266c"),K.visit=J?J.t+H:0,K.s=P,K.label="#".concat(L).concat(V&&" "+V),
W>1&&(K.level=" level-"+W),w.push(K);if(w.sort(E.Vu),Y=h+m-(X=w.length),a||Y<0||!i)for(h>0&&!a?(w=w.slice(h,h+m),X=m,
h=0):X>h+m&&(w.length=X=h+m),T=a?0:X;T<X;T++)w[T].r*=8/(T/4+1);else if(h>0){for(rn of nn=w.slice(0,Y))rn.label+="[r]"
;for(X=(w=w.slice(h).concat(nn)).length,T=0;T<X;T++)w[T].r=X-T;h=0}l.Pr.wi(),E.Mu(w,4)}},Ju:function(n,r){return n-r},
Lu:function(n,r){var t=e.T.get(r);return t?t.i:4&_?2047+r:-r},Ku:function(n,r){return 1/r}},D={Xu:0,_u:e.C,
Yu:function(n,r,t){var u,i,s,c,_,m,v,d,w,b;if(!(8&R))return E.Mu([],8);if(s=(i=p).length>0?i[0]:"",0===i.length);else{
if(!r&&"\\"===s[0]&&"\\"!==s[1])return s.length>1?i[0]=s.slice(1):i.shift(),s=g.slice(1).trimLeft(),
$=!l.omniBlockList||$||l.Br.Vi([s]),h?(h--,E.Mu([],8)):(u=D.nf(s,t),E.Mu([u],8));c=e.se.map.get(s)}if(r){
if(!c)return true}else{if(!c&&!s.startsWith("vimium://"))return 0===a&&i.length<=1&&(a=i.length?o.ef.rf()?-2:0:-1),
E.Mu([],8);c&&y&&(i.push(y),h=0,g+=" "+y,y="",S&=-5),i.length>1||(a=-1)}if(i.length>1&&c?(i.shift(),
g.length>200&&(i=g.split(" ")).shift()):c&&(i=[]),$=!l.omniBlockList||$&&l.Br.Vi([s]),c?(v=_=(d=f.Ze(i,c.fr,c.C,[])).fr,
m=d.cr):(v=_=i.join(" "),m=[]),"~"===s);else if(_.startsWith("vimium://")){if(w=e.u(_.slice(9),1,true),
b=D.tf.bind(D,i,_,v,t||c,m),w instanceof Promise)return w.then(D.uf.bind(D,n,t||c,b))
;if(w instanceof Array)return D.uf(n,t||c,b,w);w&&(_=v=w,m=[])}else _=f.rr(_,null,-2);return u=D.tf(i,_,v,t||c,m),
E.Mu([u],8)},uf:function(n,r,e,t){var f,l,s,c,_;if(!n.o){switch(t[1]){case 5:case 7:if(a=7===t[1]&&p.length>1?a:-1,
!(l=t[0]))break
;return y="",(p=((g="\\ "+l).length<201?g:u.vn(g,0,200).trim()).split(" ")).length>1&&(p[1]=i.nu(p[1],p.length>2)),
o.ff(p),D.Yu(n,null,r);case 2:if(o.ff(p=(s=t[0]).length>1||1===s.length&&s[0]?s:p),(c=D.Xu++)>12)break
;if(_=D.Yu(n,true,r),c<=0&&(D.Xu=0),true!==_)return _;break;case 0:t[0]&&(f=D.if(e(),t))}E.Mu(f||[e()],8)}},
tf:function(n,r,e,t,f){var i=new z("search",r,e,(t?t.ou+": ":"")+n.join(" "),o.get2ndArg,9)
;return n.length>0&&t?(i.t=D.of(e,f),i.title=o.cutTitle(i.title,[t.ou.length+2,i.title.length]),
i.textSplit=o.highlight(i.t,f)):(i.t=u.cn(o.shortenUrl(e)),i.title=o.cutTitle(i.title,[]),i.textSplit=u.bn(i.t)),
i.v=c?"":t&&t.C||o.lf(r),i.p=c&&t?t.ou:"",i},if:function(n,r){
var e=r[0],t=new z("math","vimium://copy "+e,e,e,o.get2ndArg,9)
;return--t.r,t.title='<match style="text-decoration: none;">'.concat(o.cutTitle(t.title,[]),"<match>"),
t.textSplit=u.bn(r[2]),[n,t]},of:function(n,r){var e,t,f,i=r.length;if(t=u.cn(r.length>0?n.slice(0,r[0]):n),
(e=u.en(t))&&(t=t.slice(e),e=0),r.length<=0)return t;for(f=r[0];r[e]=t.length,i>++e;)t+=u.cn(n.slice(f,r[e])),f=r[e]
;return f<n.length&&(t+=u.cn(n.slice(f))),t},nf:function(n,r){
var t=f.rr(n,null,-2),i=4===f.nr,l=new z("search",t,u.cn(o.shortenUrl(t)),"",o.get2ndArg,9)
;return l.title=i?(r&&r.ou||"~")+": "+o.cutTitle(n,[0,n.length]):o.cutTitle(n,[]),l.textSplit=u.bn(l.t),
l.v=c?"":i&&r&&((r.C||r.fr).startsWith("vimium:")?e.e.Ee:r.C)||o.lf(t),l.p=c&&i?"~":"",l.n=1,l}},E={af:0,sf:0,ju:null,
cf:null,Fu:null,_u:function(n){var r,e,t,u;if(E.cf&&(E.cf.o=true),r=E.cf={o:false},E.sf=0,e=1,t=-9&(R&=n[0])?n.length:2,
E.ju=[],E.af=t-1,a=h&&-1,n[1]===D){if(u=D.Yu(r),t<3)return;if(u)return void u.then(E._f.bind(null,n,r,e));e=2}
E._f(n,r,e)},_f:function(n,r,e){for(o.mf(Date.now()-18144e5),o.Hu(3*p.length||.01),
p.indexOf("__proto__")>=0&&(p=p.join(" ").replace(/(^| )__proto__(?=$| )/g," __proto_").trimLeft().split(" "),o.ff(p)),
o._i.Or($),p.sort(E.vf),o.Ou.df();e<n.length;e++)n[e]._u(r,e-1)},vf:function(n,r){
return r.length-n.length||(n<r?-1:n===r?0:1)},Mu:function(n,r){var e=E.ju,t=n.length;if(t>0&&(E.sf|=r,
E.ju=0===e.length?n:e.concat(n),8===r&&(s=!0,m-=t,d+=t)),0==--E.af)return e=null,E.hf()},hf:function(){
var n,r,e,t,u,f,i,l,c,_,m,g,y=E.ju;return E.ju=null,y.sort(E.Vu),h>0?(y=y.slice(h,h+v),h=0):y.length>v&&(y.length=v),
o.Ou.pf=o.Ou.Qu=null,
p.length>0&&(r=o.shortenUrl(n=p[0]),((e=n.length!==r.length)||n.endsWith("/")&&n.length>1&&!n.endsWith("//"))&&(p[0]=e?r:n.slice(0,-1),
o.Ou.wf(p[0]))),
y.forEach(o.Wu),t=y.length>0,u=s&&t,f=d,i=":"===w,c=b,_=S,m=2!=(l=a<0?-2!==a||t||i?0:3:$?p.length<=0||x?0:t?2:i?0:1:0)||i?0:E.sf,
g=E.Fu,E.bf(),g(y,u,l,m,f,c,_)},bf:function(){E.cf=E.Fu=null,o.gf(),o.setupQueryTerms(p=[],c=false,0),w=b=g=y=M=T="",
o.Ou.Iu=null,o.Hu(3),o.mf(0),a=E.sf=_=m=v=d=0,R=0,S=0,s=false,x=k=false,$=true},yf:function(){var n,r,e=g;if(h=0,y="",
!(0===e.length||(n=(e=e.slice(-5)).lastIndexOf("+"))<0||0!==n&&32!==e.charCodeAt(n-1))){if(e=e.slice(n),
n=g.length-e.length,(r=parseInt(e,10))>=0&&"+"+r===e&&r<=(n>0?100:200))h=r;else if("+"!==e)return;g=g.slice(0,n&&n-1),
y=e,S|=4}},Vu:function(n,r){return r.r-n.r}},I={__proto__:null,bookm:[1,A],domain:[16,j],history:[2,F],
omni:[63,D,j,F,A,B],search:[8,D],tab:[4,B]};e.M._u=function(n,r,t){var f,a,h,y,M,T,z,A,F,j;n=n.trim(),x=false,
n&&2===e.fe&&(/^[A-Za-z]:[\\/]|^\\\\([\w$%.-]+([\\/]|$))?/.test(n)||"file:"===n.slice(0,5).toLowerCase())&&(":/\\".includes(n[1])&&(n=(":"===n[1]?"":"//")+n.slice(":"===n[1]?0:2).replace(/\\+/g,"/")),
(f=(n=n.replace(/\\/g,"/").toLowerCase()).indexOf("//")+2)>=2&&f<n.length&&"/"!==n[f]&&(a=n.slice(f).split("/",1)[0]).includes("%")&&(h=u.cn(a),
x=h===a,n=n.slice(0,f)+h+n.slice(f+a.length))),w=g=n&&n.replace(u.jn," "),b="",S=0,E.yf(),
p=(n=g)?(n=n.length<201?n:u.vn(n,0,200).trimRight()).split(" "):[],
(y=0|r.c||128)&&(y-=n.replace(/[\u2e80-\u2eff\u2f00-\u2fdf\u3000-\u303f\u31c0-\u31ef\u3200-\u9fbf\uf900-\ufaff\ufe30-\ufe4f\uff00-\uffef]/g,"aa").length-n.length),
y=Math.max(50,Math.min(y,320)),c=!!(1&(_=r.f)),v=m=Math.min(Math.max(3,0|r.r||10),25),d=0,E.Fu=t,M="bomni"===r.o?(_|=64,
I.omni):I[r.o],
z=r.t||63,A=r.e||63,M===I.tab&&(k=!!(2&_)),2===(T=p.length>=1?p[0]:"").length&&":"===T[0]&&(F="b"===(T=T[1])?I.bookm:"h"===T?I.history:"t"===T||"T"===T||"w"===T||"W"===T?(k="t"!==T&&"T"!==T,
_|=0,
_|="T"===T?2048:0,I.tab):"B"===T?(_|=64,I.omni):"H"===T?(_|=256,I.omni):"d"===T?I.domain:"s"===T?I.search:"o"===T?I.omni:null)&&(M=F,
b=p.shift(),
S|=1,g=g.slice(3),A=M[0]),p.length>0&&((T=p[0]).includes("\u3002")||T.includes("\uff1a"))&&!x&&((j=i.nu(T,x=p.length<2))!==T?(p[0]=j,
g=j+g.slice(T.length),
x=x&&!/^[.\u3002]\w+([.\u3002]\w*)?$/.test(T)):x=x&&T.includes("\uff1a")&&!/\uff1a([^\/\d]|\d[^\0-\xff])/.test(T)),
$=!l.omniBlockList||l.Br.Vi(p),R=z&A,s=2===M.length,g&&(S|=2),o.setupQueryTerms(p,c,y),E._u(M)}});