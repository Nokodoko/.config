"use strict"
;__filename="background/tab_commands.js",define(["require","exports","./store","./utils","./browser","./normalize_urls","./parse_urls","./ports","./i18n","./run_commands","./clipboard","./open_urls","./frame_commands","./filter_tabs","./tools"],function(n,e,r,u,t,i,o,f,l,c,a,d,s,v,w){
var m,p,b,I,g,_,x,h,T;Object.defineProperty(e,"__esModule",{value:true
}),e.Ft=e.toggleTabUrl=e.togglePinTab=e.toggleMuteTab=e.removeTab=e.reloadTab=e.moveTabToNextWindow=e.moveTabToNewWindow=e.joinTabs=e.copyWindowInfo=void 0,
u=u,m=Math.abs,p=function(){r.N&&s.focusFrame(r.N,false,0)},b=function(n){
return r.Be.end?null:null!=r.Be.position?d.newTabIndex(n,r.Be.position,false,false):null!=r.Be.rightInOld?n.index+(r.Be.rightInOld?0:1):n.index+(false!==r.Be.right?1:0)
},e.copyWindowInfo=function(n){
var e,i=r.Be.filter,o=r.Be.keyword,c=!!r.Be.decoded,d=r.Be.format,s=r.Be.type,w="tab"===s&&(m(r.V)>1||!!i),p=a.xr(r.Be),b={
d:c,s:p,k:o};if("frame"===s&&r.N&&!d)return e=void 0,128&r.N.s.Ln?(r.N.postMessage({N:3,H:16,o:b}),e=1):e=f.Nn({H:16,
u:"",o:b}),void(1!==e&&(e&&e instanceof Promise?e.then(function(){n(1)}):n(1)));t.Bn.query("browser"===s?{
windowType:"normal"}:{active:"window"!==s&&!w||void 0,currentWindow:true},function(e){var a,m,I,g,_,x,h,T,k,y,j,M
;if(!(s&&"title"!==s&&"frame"!==s&&"url"!==s&&"host"!==s||d))return m="title"===s?e[0].title:"host"!==s?t.getTabUrl(e[0]):(null===(a=u.in(t.getTabUrl(e[0])))||void 0===a?void 0:a.host)||"",
r.K[16]("title"===s?{s:m,o:b}:{u:m,o:b},r.N),void n(1);I=r.N?r.N.s.Un:2===r.A,g=""+(d||"${title}: ${url}"),
x="json"===(_=r.Be.join)&&!d,w?(h=e.length<2?0:t.selectIndexFrom(e),T=v.getTabRange(h,e.length),
e=e.slice(T[0],T[1])):e=e.filter(function(n){return n.incognito===I}),i&&(k=r.N?r.N.s.Hn:r.L,y=e.find(function(n){
return n.id===k}),e=v.mu(y,e,i)),e.length?("browser"===s&&e.sort(function(n,e){
return n.windowId-e.windowId||n.index-e.index}),j=e.map(function(n){return x?{title:n.title,
url:c?u.un(t.getTabUrl(n)):t.getTabUrl(n)}:g.replace(/\$\{([^}]+)}/g,function(e,r){
return r.split("||").reduce(function(e,r){var i
;return e||(c&&"url"===r?u.un(t.getTabUrl(n)):"host"===r?(i=u.in(t.getTabUrl(n)))&&i.host||"":"__proto__"!==r&&((i=n[r])&&"object"==typeof i?JSON.stringify(i):i||""))
},"")})}),M=r.f(j,_,p,o),f.showHUD("tab"===s&&e.length<2?M:l.Yn("copiedWndInfo"),15),n(1)):n(0)})},
e.joinTabs=function(n){var e,u=null!=r.Be.order?r.Be.order:r.Be.sort,i=r.Be.windows,o="current"===i;e=function(e){
var f,l,c,a,d;f=2===r.A,e=o?e:e.filter(function(n){return n.incognito===f}),l=o?e:e.filter(function(n){return n.id===r.J
}),o||l.length?(c=function(i){var f,l,c,a,d,s,w,p,b,I,g=[],_=function(n){g.push(n)};if(e.sort(function(n,e){
return n.id-e.id}).forEach(function(n){n.tabs.forEach(_)}),g.length)if(f=r.Be.filter,l=i?i.id:r.J,c=g.find(function(n){
return n.id===r.L})||(i?t.selectFrom(i.tabs):g[0]),o&&m(r.V)>1&&g.length>1&&(a=g.findIndex(function(n){
return n.id===c.id}),d=v.getTabRange(a,g.length),g=g.slice(d[0],d[1])),f&&(g=v.mu(c,g,f,s={}),f=s.known?f:null),
g.length){for(I of(g=u?v.hu(g,u):g,p="before"===(w=r.Be.position)||(w+"").startsWith("prev"),
f&&i?w&&"string"==typeof w&&"keep"!==w?"begin"===w||"start"===w?b=i.tabs.filter(function(n){return n.pinned
}).length:"end"!==w?(g.includes(c)&&g.splice(g.indexOf(c),1),p?g.push(c):g.unshift(c),
b=Math.max(0,i.tabs.findIndex(function(n){return n.id===r.L})-g.filter(function(n){
return n.windowId===l&&n.index<c.index}).length)):b=i.tabs.length:b=g.reduce(function(n,e){
return e.windowId===l?Math.min(e.index,n):n},g.length):b=i?i.tabs.length:0,g))t.Bn.move(I.id,I.windowId!==l?{windowId:l,
index:b++}:{index:b++});for(I of g)I.pinned&&I.windowId!==l&&t.tabsUpdate(I.id,{pinned:true});n(1)}else n(0);else n(0)},
(a=l.length?l[0]:null)&&"popup"===a.type&&a.tabs.length?(d=t.selectFrom(a.tabs).id,a.tabs=a.tabs.filter(function(n){
return n.id!==d}),t.makeWindow({tabId:d,incognito:a.incognito},a.state,function(n){n&&(r.J=n.id,
n.tabs[0]&&(r.L=n.tabs[0].id)),c(n)})):(e=o||!a||"all"===i?e:e.filter(function(n){return n.id!==a.id}),c(a))):n(0)},
o?t.getCurWnd(true,function(n){return n?e([n]):t.On()}):(r.V=1,t.An.getAll({populate:true,windowTypes:["normal","popup"]
},e))},I=function(n){var u="hasIncog",i=!!r.Be.all,o=function(e){
var u,a,d,s,w,I,g,_,x,h,T,k=e.tabs,y=k.length,j=false!==r.Be.focused,M=t.selectIndexFrom(k),O=k[M]
;if(!i&&y<=1&&(!y||0===O.index&&m(r.V)>1))n(0);else{if(i){
for(d of k)if(null!=t.getGroupId(d))return f.showHUD("Can not keep groups info during this command"),void n(0);a=[0,y]
}else a=1===y?[0,1]:v.getTabRange(M,y);if(s=r.Be.filter,w=k.slice(a[0],a[1]),(w=s?v.mu(O,w,s):w).length){if(!i){
if((I=w.length)>=y&&y>1)return n(0),void f.showHUD(l.Yn("moveAllTabs"))
;if(I>30&&c.vu())return void c.cu("moveTabToNewWindow",I).then(o.bind(null,e))
;if(1===y&&0===O.index&&1===m(r.V))return void t.Wn(t.Bn.query,{windowId:e.id,index:1}).then(function(r){
if(!r||!r.length)return n(0),void f.showHUD(l.Yn("moveAllTabs"));e.tabs=[e.tabs[0],r[0]],o(e)})}g=O.incognito,
_=w.includes(O)?O:w[0],x=(null!==(u=b(O))&&void 0!==u?u:3e4)<=O.index,h={tabId:_.id,incognito:g,focused:j},
T="normal"===e.type?e.state:"",v.ku(w[x?w.length-1:0],x,k).then(function(u){j||u&&t.selectTab(u.id),
t.makeWindow(h,T,function(i){var o,f,l,c,a,d,s,v;if(i){for(v of(p(),j&&u&&t.selectTab(u.id),o=w.indexOf(_),
f=w.slice(0,o),l=w.slice(o+1),e.incognito&&r.de<52&&(f=f.filter(c=function(n){return n.incognito===g}),l=l.filter(c)),
d=l.length,s=function(n){return n.id},(a=f.length)&&(t.Bn.move(f.map(s),{index:0,windowId:i.id},t.On),
a>1&&t.Bn.move(w[o].id,{index:a})),d&&t.Bn.move(l.map(s),{index:a+1,windowId:i.id},t.On),
w))v.pinned&&t.tabsUpdate(v.id,{pinned:true});n(1)}else n(0)})})}else n(0)}},a=function(i){
var o,a,s,v=t.selectFrom(i.tabs);if(i.incognito&&v.incognito)return n(0),f.showHUD(l.Yn(u));if(o=v.id,a={incognito:true
},s=t.getTabUrl(v),v.incognito);else{if(i.incognito)return t._n(s)?(n(0),f.showHUD(l.Yn(u))):e.Ft(v)
;if(t._n(s))return n(0),f.complainLimits(l.Yn("openIncog"));a.url=s}i.tabs=null,t.An.getAll(function(e){
var u,f,l=false!==r.Be.focused;(e=e.filter(function(n){return n.incognito&&"normal"===n.type})).length?t.Bn.query({
windowId:d.preferLastWnd(e).id,active:true},function(n){var e=n[0];t.tabsCreate({url:s,windowId:e.windowId,
active:false!==r.Be.active,index:d.newTabIndex(e,r.Be.position,false,false)},c.getRunNextCmdBy(3)),l&&t.selectWnd(e),
t.Bn.remove(o)}):(u="normal"===i.type?i.state:"",(f=null!=a.url)?r.e.Ge&&(l=true,u=""):a.tabId=o,a.focused=l,
t.makeWindow(a,u,function(e){f||e&&p(),f&&e?c.getRunNextCmdBy(0)(e.tabs&&e.tabs[0]||null):n(!!e)}),f&&t.Bn.remove(o))})
},s=!!r.Be.incognito
;s&&(r.N?r.N.s.Un:2===r.A)?(f.showHUD(l.Yn(u)),n(0)):(i||1!==m(r.V)&&!s?t.Wn(t.getCurWnd,true):t.Wn(t.getCurWnd,false).then(function(n){
return n&&t.Wn(t.Bn.query,{windowId:n.id,active:true}).then(function(e){return n.tabs=e,e&&e.length?n:void 0})
})).then(function(e){e?(s?a:o)(e):n(0)})},e.moveTabToNewWindow=I,g=function(n,u){var i=n[0];t.An.getAll(function(n){
var o,f,l,c,a,d,s,w=false===r.Be.minimized||false===r.Be.min,I=false!==r.Be.focused,g=n.filter(function(n){
return n.incognito===i.incognito&&"normal"===n.type&&(!w||"minimized"!==n.state)});if(g.length>0){
if(o=g.map(function(n){return n.id}),f=o.indexOf(i.windowId),o.length>=2||f<0)return l=r.Be.filter,c=!!(r.Be.tabs||l),
a=o.indexOf(r.E),d=r.Be.last&&a>=0?a:f>=0?f+1:0,void t.Bn.query({
windowId:o[s=((s=(s=((s=c?d:r.V>0?d+r.V-1:d+r.V)%o.length+o.length)%o.length)!==f?s:s+(r.V>0?1:-1))%o.length+o.length)%o.length],
active:true},function(n){var e=n[0],o=b(e),a=null==o||o>e.index,d=null,s=false,w=null,g=function(){
false!==s?(I||s&&t.selectTab(s.id),t.Bn.move(i.id,{index:null!=o?o:-1,windowId:e.windowId},function(n){var e,o
;if(t.On())return u(0),t.selectWnd(i),t.On();if(d)for(e=d.findIndex(function(e){return e.id===n.id}),
o=0;o<d.length;o++)o!==e&&t.Bn.move(d[o].id,{index:n.index+o,windowId:n.windowId},t.On);r.N&&r.N.s.Hn===n.id&&p()}),
I&&t.selectWnd(e),false!==r.Be.active&&t.selectTab(i.id,t.Pn(u)),I&&s&&t.selectTab(s.id)):v.ku(i,!a,w).then(function(n){
s=n,g()})};c&&(f>=0||r.de>=52)&&(l||1!==m(r.V))?v.xu(true,0,function(n,e){if(w=n.slice(),i=n[e[1]],n=n.slice(e[0],e[2]),
r.de<52&&(n=n.filter(function(n){return n.incognito===i.incognito})),l){if(!(n=v.mu(i,n,l)).length)return void u(0)
;i=n.includes(i)?i:n[0]}s=(1!==(d=n).length||!d[0].active)&&null,g()},[],u):f>=0||r.de>=52?g():(s=null,
t.makeTempWindow_r(i.id,i.incognito,g))})}else g=n.filter(function(n){return n.id===i.windowId})
;m(r.V)>1?e.moveTabToNewWindow(u):v.ku(i,false).then(function(n){I||n&&t.selectTab(n.id),t.makeWindow({tabId:i.id,
incognito:i.incognito,focused:I},1===g.length&&"normal"===g[0].type?g[0].state:"",function(e){e&&(p(),
I&&n&&t.selectTab(n.id)),u(!!e)})})})},e.moveTabToNextWindow=g,_=function(n,u,i,o){var f,l,a,d=u[0],s=u[1],w=u[2],p={
bypassCache:true===(r.Be.hard||r.Be.bypassCache)},b=t.Bn.reload,I=n
;if(m(r.V)<2||r.Be.single)b(n[o?s:d].id,p,c.getRunNextCmdBy(0));else{if(f=n[s],l=r.Be.filter,n=n.slice(d,w),l){
if(!(n=v.mu(f,n,l)).length)return void i(0);f=n.includes(f)?f:n[0]}
if(n.length>20&&c.vu())c.cu("reloadTab",n.length).then(e.reloadTab.bind(null,I,[d,s,w],i));else for(a of(b(f.id,p,c.getRunNextCmdBy(0)),
n))a!==f&&b(a.id,p)}},e.reloadTab=_,x=function(n,u,i){
var o,f,l,a,d,s,p,b,I,g,_,x,k,y,j,M,O=r.Be.highlighted,P=r.Be.goto||(r.Be.left?"left":""),A=(P+"").split(/[\/,;\s]/),N=A.length>1?A[m(r.V)>1?1:0]:P+"",R="near"===N||"reverse"===N||N.startsWith("back"),W=N.startsWith("forw"),$=R?r.V>0:W?r.V<0:"left"===N,z=R?r.V<0:W?r.V>0:"right"===N,C=N.includes("previous"),H=C&&N.includes("only")
;if(u){if(!i||!i.length)return n(0),t.On();if(f=i.length,l=t.selectIndexFrom(i),a=i[l],d=1,s=l,p=l+1,m(r.V)>1&&f>1){
if(b=0,i[0].pinned!==a.pinned&&!(r.V<0&&i[l-1].pinned))for(;i[b].pinned;)b++
;if((d=(I=v.getTabRange(l,f-b,f))[1]-I[0])>20&&c.vu()&&u<3)return void c.cu("removeTab",d).then(e.removeTab.bind(null,n,2,i))
;d>1&&(s=b+I[0],p=b+I[1])}else if(O){if(_="no-current"===O,(d=(g=i.filter(function(n){return n.highlighted&&n!==a
})).length+1)>1&&(_||d<f)&&t.Bn.remove(g.map(function(n){return n.id}),t.On),_)return void n(d>1)
}else if(r.Be.filter&&0===v.mu(a,[a],r.Be.filter).length)return void n(0)
;if(!s&&d>=f&&true!==(null!=r.Be.mayClose?r.Be.mayClose:r.Be.allow_close))u<2?t.getCurTabs(e.removeTab.bind(null,n,3)):t.An.getAll(h.bind(null,n,a,i));else if(u<2&&(H?(k=v.wu())>=0&&(x=t.Wn(t.tabsGet,k)):(z||$&&s>0)&&(x=t.Wn(t.Bn.query,{
windowId:a.windowId,index:$?s-1:s+1}).then(function(n){return n&&n[0]})),x))x.then(function(r){
r&&r.windowId===a.windowId&&t.Fn(r)?(t.selectTab(r.id),
t.Bn.remove(a.id,t.Pn(n))):t.getCurTabs(e.removeTab.bind(null,n,3))});else{if(y=f,
d>=f);else if(C)y=(j=!H&&p<f&&!r.T.has(i[p].id)?i[p]:i.filter(function(n,e){return(e<s||e>=p)&&r.T.has(n.id)
}).sort(w._t.Nr)[0])?i.indexOf(j):f;else if($||z){
for(M=y=$?s>0?s-1:p:p<f?p:s-1;M>=0&&M<f&&(M<s||M>=p)&&!t.Fn(i[M]);)M+=M<s?-1:1;y=M>=0&&M<f?M:y}
y>=0&&y<f&&t.selectTab(i[y].id),T(a,i,s,p,n)}
}else((o=m(r.V)>1||O||C&&!H)?t.getCurTabs:t.getCurTab)(e.removeTab.bind(null,n,o?2:1))},e.removeTab=x,
h=function(n,e,u,i){var o,f,l=false;i=i.filter(function(n){return"normal"===n.type}),
"always"===r.Be.keepWindow?l=!i.length||i.some(function(n){return n.id===e.windowId}):i.length<=1?(l=true,
(f=i[0])&&(f.id!==e.windowId?l=false:f.incognito&&!t._n(r.newTabUrl_f)&&(o=f.id))):e.incognito||1===(i=i.filter(function(n){
return!n.incognito})).length&&i[0].id===e.windowId&&(o=i[0].id,l=true),l&&t.tabsCreate({index:u.length,url:"",windowId:o
},c.getRunNextCmdBy(3)),T(e,u,0,u.length,l?null:n)},T=function(n,e,u,i,o){var f,l,c,a=Math.max(0,e.indexOf(n))
;t.Bn.remove(n.id,o?t.Pn(o):t.On),l=e.slice(a+1,i),c=e.slice(u,a),r.V<0&&(l=(f=[c,l])[0],c=f[1]),
l.length>0&&t.Bn.remove(l.map(function(n){return n.id}),t.On),c.length>0&&t.Bn.remove(c.map(function(n){return n.id
}),t.On)},e.toggleMuteTab=function(n){var e,u,i,o;e=r.Be.filter,r.Be.all||e||r.Be.other||r.Be.others?(i=function(i){
var o,c,a,d=r.Be.other||r.Be.others?r.N?r.N.s.Hn:r.L:-1,s=0===i.length||-1!==d&&1===i.length&&i[0].id===d
;if(null!=r.Be.mute)s=!!r.Be.mute;else for(o of i)if(o.id!==d&&!t.isTabMuted(o)){s=true;break}
if(!e||(i=v.mu(u,i,e)).length){for(o of(c={muted:s},i))o.id!==d&&s!==t.isTabMuted(o)&&t.tabsUpdate(o.id,c)
;a=-1===d?"All":"Other",Promise.resolve(l.Yn(a)).then(function(e){f.showHUD(l.Yn(s?"mute":"unmute",[e||a])),n(1)})
}else n(0)},(o=v.getNecessaryCurTabInfo(e))?o.then(function(n){u=n,t.Bn.query({audible:true},i)}):t.Bn.query({
audible:true},i)):t.getCurTab(function(e){var u=e[0],i=!t.isTabMuted(u),o=null!=r.Be.mute?!!r.Be.mute:i
;o===i&&t.tabsUpdate(u.id,{muted:o}),f.showHUD(l.Yn(o?"muted":"unmuted")),n(1)})},e.togglePinTab=function(n,e,u){
var i,o,f,l,a,d,s,w,p=r.Be.filter,b=e[1],I=n[b];if(n=p?v.mu(I,n,p):n,i=!p||n.includes(I)?!I.pinned:!!n.find(function(n){
return!n.pinned}),o={pinned:i},f=i?0:1,l=0,m(r.V)>1&&i)for(;n[l].pinned;)l++
;for(d=l+(a=v.getTabRange(b-l,n.length-l,n.length))[f]-f,
s=l+a[1-f]-f,w=[];d!==s;d+=i?1:-1)(i||n[d].pinned)&&w.push(n[d])
;(s=w.length)?(s<=30||!c.vu()?Promise.resolve(false):c.cu("togglePinTab",s)).then(function(n){n&&(w.length=1)
}).then(function(){var n,e=w.includes(I)?I.id:w[0].id;for(n of w)t.tabsUpdate(n.id,o,n.id===e?t.Pn(u):t.On)}):u(0)},
e.toggleTabUrl=function(n,e){var a,s=t.getTabUrl(n[0]),v=r.Be.reader,w=r.Be.keyword
;if(s.startsWith(r.e.Re))return f.complainLimits(l.Yn(v?"noReader":"openExtSrc")),void e(0);v&&w?(a=o.fu({u:s
}))&&a.k===w?(c.overrideCmdOptions({keyword:""}),d.openUrlWithActions(a.u,0,true,n)):(s=i.rr(a&&r.Be.parsed?a.u:s,w),
d.openUrlWithActions(s,9,true,n)):v?r.we&&u.kn.test(s)?(s=s.startsWith("read:")?u.cn(s.slice(s.indexOf("?url=")+5)):"read://".concat(new URL(s).origin.replace(/:\/\/|:/g,"_"),"/?url=").concat(u.rn(s)),
d.openUrlWithActions(s,9,true,n)):(f.complainLimits(l.Yn("noReader")),
e(0)):(s=s.startsWith("view-source:")?s.slice(12):"view-source:"+s,d.openUrlWithActions(s,9,true,n))},
e.Ft=function(n,e,u,i){var o,f,l,a,d,s,v=n.id,w=1===e;if(e&&t.$n()&&(false!==i||null==t.getGroupId(n)))return o=0,f=-1,
l=function(){var n=t.On();if(n)return t.$n().restore(null,c.getRunNextCmdBy(0)),f>=0&&t.Bn.remove(f),f=0,n
;(o+=1)>=5||setTimeout(function(){t.tabsGet(v,l)},50*o*o)},w&&t.tabsCreate({url:"about:blank",active:false,
windowId:n.windowId},function(n){f?f=n.id:t.Bn.remove(n.id)}),void t.Bn.remove(v,function(){return t.tabsGet(v,l),t.On()
});d=t.isTabMuted(n),a=function(n){d!==t.isTabMuted(n)&&t.tabsUpdate(n.id,{muted:d})},s={windowId:n.windowId,
index:n.index,url:t.getTabUrl(n),active:n.active,pinned:n.pinned,openerTabId:n.openerTabId},u&&(s=Object.assign(u,s)),
null!=s.index&&s.index++,t.openMultiTabs(s,1,true,[null],i,n,function(n){n&&a&&a(n),
n?c.runNextOnTabLoaded(r.Be,n):c.runNextCmd(0)}),t.Bn.remove(v)}});