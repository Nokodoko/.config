"use strict"
;__filename="background/all_commands.js",define(["require","exports","./utils","./store","./browser","./normalize_urls","./parse_urls","./settings","./ports","./ui_css","./i18n","./key_mappings","./run_commands","./run_keys","./clipboard","./open_urls","./frame_commands","./filter_tabs","./tab_commands","./tools"],function(n,e,o,t,r,i,u,f,a,l,c,s,d,v,m,p,b,h,k,y){
Object.defineProperty(e,"__esModule",{value:true
}),o=o,f=f,t.S=[0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,1,2,0,1,0,0,0,0,2,0,1,0,2,2,0,0,1,0,0,1,0,0,1,0,2,1,1,0,0,0,0,0],
t.P=[function(){var n,e=t.Be.for||t.Be.wait
;"ready"!==e?(e=e?Math.abs("count"===e||"number"===e?t.V:0|e):d.hasFallbackOptions(t.Be)?Math.abs(t.V):0)&&(e=Math.max(34,e),
(n=null!=(n=t.Be.block)?!!n:e>17&&e<=1e3)&&t.N&&t.N.postMessage({N:16,t:e+50
}),d.runNextCmdBy(t.V>0?1:0,t.Be,e)):d.runNextOnTabLoaded({},null,function(){d.runNextCmdBy(1,t.Be,1)})},function(){
var n=t.Be.rel,e=n?(n+"").toLowerCase():"next",o=null!=t.Be.isNext?!!t.Be.isNext:!e.includes("prev")&&!e.includes("before"),r=m.xr(t.Be)
;m.doesNeedToSed(8192,r)?Promise.resolve(a.Rn(t.z.get(t.N.s.Hn).Sn)).then(function(n){
var i=o?t.V:-t.V,u=n&&t.i(n,8192,r),f=u?p.goToNextUrl(u,i,!t.Be.absolute||"absolute"):[false,n],a=f[1];f[0]&&a?(t.V=i,
null==t.Be.reuse&&d.overrideOption("reuse",0),d.overrideCmdOptions({url_f:a,goNext:false}),
p.openUrl()):b.framesGoNext(o,e)}):b.framesGoNext(o,e)},function(){
var n,e=t.Be.key,o=null!=(n=t.Be.hideHUD)||null!=(n=t.Be.hideHud)?!n:!t.ce.hideHud,r=e&&"string"==typeof e?s.mt(e).trim():""
;r=r.length>1||1===r.length&&!/[0-9a-z]/i.test(r)&&r===r.toUpperCase()&&r===r.toLowerCase()?r:"",
Promise.resolve(o?c.Yn("globalInsertMode",[r&&": "+(1===r.length?'" '.concat(r,' "'):"<".concat(r,">"))]):null).then(function(n){
d.sendFgCmd(7,o,{h:n,k:r||null,i:!!t.Be.insert,p:!!t.Be.passExitKey,r:+!!t.Be.reset,t:d.parseFallbackOptions(t.Be),
u:!!t.Be.unhover})})},b.nextFrame,b.parentFrame,b.performFind,function(n){
var e=(t.Be.key||"")+"",o="darkMode"===e?"d":"reduceMotion"===e?"m":f.eo[e],r=o?t.ue[o]:0,i=c.Yn("quoteA",[e]),u=t.Be.value,l="boolean"==typeof u,s=null,v=""
;o?"boolean"==typeof r?l||(u=null):l||void 0===u?s=l?"notBool":"needVal":typeof u!=typeof r&&(v=JSON.stringify(r),
s="unlikeVal",v=v.length>10?v.slice(0,9)+"\u2026":v):s=e in f.to?"notFgOpt":"unknownA",
Promise.resolve(i).then(function(e){var r,i,l,m;if(s)a.showHUD(c.Yn(s,[e,v]));else{for(l of(u=f.ao(o,u),
i=(r=t.z.get(t.N.s.Hn)).Qn,r.po))d.portSendFgCmd(l,8,m=l===i,{k:o,n:m?e:"",v:u},1);n(1)}})},function(){
0!==t.N.s.Dn||64&t.N.s.Ln?(new Promise(function(e,o){n([t.e.HelpDialogJS],e,o)}).then(n=>n),
d.sendFgCmd(17,true,t.Be)):b.initHelp({a:t.Be},t.N)},function(){
var n,e,r,i,u,f,l,c,s,v,m,p,b,h,k,y,w,M,g,_,x=d.copyCmdOptions(o.pn(),t.Be);if(!x.esc){if(n=x.key,
e=(x.type||(n?"keydown":""))+"",
i=x.delay,u=x.xy,f=x.direct,l=x.directOptions,r=(r=x.class)&&"$"===r[0]?r.slice(1):(r&&r[0].toUpperCase()+r.slice(1)||"Keyboard").replace(/event$/i,"")+"Event",
u=/^(Mouse|Pointer|Wheel)/.test(r)&&null==u?[.5,.5]:u,(u=x.xy=o.t(u))&&!u.n&&(u.n=t.V,t.V=1),
x.click)e="click";else if(t.V<0)for(c of"down up;enter leave;start end;over out".split(";"))s=c.split(" "),
e=e.replace(s[0],s[1]);if(!e)return a.showHUD('Require a "type" parameter'),void d.runNextCmd(0)
;for(b of(m=(v=x.init)&&"object"==typeof v?v:x,p={},i=i&&+i>=0?Math.max(0|+i,1):null,
["bubbles","cancelable","composed"]))p[b]=false!==m[b]||false!==x[b];for(k of(h={e:1,class:1,type:1,key:1,return:1,
delay:1,esc:1,click:1,init:1,xy:1,match:1,direct:1,directOptions:1,clickable:1,exclude:1,evenIf:1,scroll:1,typeFilter:1,
textFilter:1},Object.entries(m)))w=k[1],(y=k[0])&&"$"!==y[0]&&!h.hasOwnProperty(y)&&(p[y]=w,m===x&&delete x[y])
;n&&","!==n&&("object"==typeof n||n.includes(","))&&(M="object"==typeof n?n:n.split(",")).length>=2&&(!M[1]||+M[1]>=0)&&(_=0|M[1],
p.key="Space"===(g=M[0])?" ":"Comma"===g?",":"$"===g&&g.length>1?g=g.slice(1):g,_&&null==m.keyCode&&(p.keyCode=+M[1]),
_&&null==m.which&&(p.which=+M[1]),M.length>=3&&null==m.code&&(p.code=M[2]||M[0])),x.type=e,x.class=r,x.init=p,x.delay=i,
x.direct=f&&"string"==typeof f?f:"element,hover,scroll,focus",l&&!l.search&&(l.search="doc"),x.directOptions=l||{
search:"doc"},x.e="Can't create \"".concat(r,"#").concat(e,'"')}d.portSendFgCmd(t.N,16,false,x,t.V)},function(){
b.showVomnibar()},b.enterVisualMode,function(n){var e=t.Be.folder||t.Be.path,o=!!t.Be.all
;if(!e||"string"!=typeof e)return a.showHUD('Need "folder" to refer a bookmark folder.'),void n(0)
;t.findBookmark(1,e).then(function(e){
if(!e||null!=e.u)return n(0),void a.showHUD(false===e?'Need valid "folder".':null===e?"The bookmark folder is not found.":"The bookmark is not a folder.")
;(!o&&t.V*t.V<2?r.getCurTab:r.Mn)(function i(u){var f,l,c,s,v,m,p;if(!u||!u.length)return n(0),r.On()
;if(l=u[f=r.selectIndexFrom(u)],c=o?[0,u.length]:h.getTabRange(f,u.length),s=t.Be.filter,v=u,u=u.slice(c[0],c[1]),
!s||(u=h.mu(l,u,s)).length)if((m=u.length)>20&&d.vu())d.cu("addBookmark",m).then(i.bind(0,v));else{
for(p of u)r.Cn.bookmarks.create({parentId:e.uo,title:p.title,url:r.getTabUrl(p)},r.On)
;a.showHUD("Added ".concat(m," bookmark").concat(m>1?"s":"",".")),n(1)}else n(0)})})},function(n){
false!==t.Be.copied?(d.overrideCmdOptions({copied:true}),p.openUrl()):n(0)},b.captureTab,function(n){
n(y.St.At(t.Be,t.N))},function(n){var e=t.N?t.N.s.Un:2===t.A
;y.Ct.pr(e),Promise.resolve(e?c.Yn("incog"):"").then(function(e){a.showHUD(c.Yn("fhCleared",[e])),n(1)})},function(n){
var e=t.Be.local?t.Be.all?y.It.Et("#"):a.Nn({H:19,u:"",a:2},true):y.It.Et();e&&e instanceof Promise?e.then(function(e){
e&&n(1)}):n(1)},k.copyWindowInfo,function n(e,o,i){var u,f,a=t.Be.$pure
;null==a&&d.overrideOption("$pure",a=!Object.keys(t.Be).some(function(n){
return"opener"!==n&&"position"!==n&&"evenIncognito"!==n&&"$"!==n[0]
})),a?!(u=e&&e.length>0?e[0]:null)&&t.L>=0&&!r.On()&&"dedup"!==i?r.Wn(r.tabsGet,t.L).then(function(e){
n(e&&[e],0,"dedup")}):(f=true===t.Be.opener,r.openMultiTabs(u?{active:true,windowId:u.windowId,
openerTabId:f?u.id:void 0,index:p.newTabIndex(u,t.Be.position,f,true)}:{active:true
},t.V,t.Be.evenIncognito,[null],true,u,function(n){n&&r.selectWndIfNeed(n),d.getRunNextCmdBy(3)(n)})):p.openUrl(e)
},function(n,e){if(t.de<54)return a.showHUD(c.Yn("noDiscardIfOld",[54])),void e(0);h.xu(true,1,function n(e,o,i,u){
var f,l,s,v,m,p,b,k,y,w=o[0],M=o[1],g=o[2];if(u&&(w=(f=h.getTabRange(M,e.length,0,1))[0],g=f[1]),l=t.Be.filter,s=e,
e=e.slice(w,g),
v=r.selectFrom(e),m=(e=l?h.mu(v,e,l):e).includes(v)?e.length-1:e.length)if(m>20&&d.vu())d.cu("discardTab",m).then(n.bind(null,s,[w,M,g],i));else{
for(y of(b=[],
(k=!(p=e[h.getNearArrIndex(e,v.index+(t.V>0?1:-1),t.V>0)]).discarded)&&(m<2||false!==p.autoDiscardable)&&b.push(r.Wn(r.Bn.discard,p.id)),
e))y===v||y===p||y.discarded||(k=true,false!==y.autoDiscardable&&b.push(r.Wn(r.Bn.discard,y.id)))
;b.length?Promise.all(b).then(function(n){var e=n.filter(function(n){return void 0!==n}),o=e.length>0
;a.showHUD(o?"Discarded ".concat(e.length," tab(s)."):c.Yn("discardFail")),i(o)
}):(a.showHUD(k?c.Yn("discardFail"):"Discarded."),i(0))}else i(0)},n,e)},function(n){var e,o=t.N?t.N.s.Hn:t.L
;if(o<0)return a.complainLimits(c.Yn("dupTab")),void n(0);e=false===t.Be.active,r.Wn(r.Bn.duplicate,o).then(function(i){
if(i){if(e&&r.selectTab(o,r.On),e?n(1):d.runNextOnTabLoaded(t.Be,i),!(t.V<2)){var u=function(n){r.openMultiTabs({
url:r.getTabUrl(n),active:false,windowId:n.windowId,pinned:n.pinned,index:n.index+2,openerTabId:n.id
},t.V-1,true,[null],true,n,null)};t.de>=52||0===t.A||t.e.Ge?r.tabsGet(o,u):r.getCurWnd(true,function(e){
var i,f=e&&e.tabs.find(function(n){return n.id===o});if(!f||!e.incognito||f.incognito)return f?u(f):r.On()
;for(i=t.V;0<--i;)r.Bn.duplicate(o);n(1)})}}else n(0)}),e&&r.selectTab(o,r.On)},function(n){n.length&&b.framesGoBack({
s:t.V,o:t.Be},null,n[0])},function(n){var e=!!t.Be.absolute,o=t.Be.filter,i=function(i){
var u,f,a,l,c,s,d=t.V,v=r.selectFrom(i),m=i.length;if(!o||(i=h.mu(v,i,o)).length){if(u=i.length,
f=h.getNearArrIndex(i,v.index,d<0),
a=(a=e?d>0?Math.min(u,d)-1:Math.max(0,u+d):Math.abs(d)>2*m?d>0?u-1:0:f+d)>=0?a%u:u+(a%u||-u),
i[0].pinned&&t.Be.noPinned&&!v.pinned&&(d<0||e)){for(l=1;l<u&&i[l].pinned;)l++;if((u-=l)<1)return void n(0)
;e||Math.abs(d)>2*m?a=e?Math.max(l,a):a||l:(a=(a=f-l+d)>=0?a%u:u+(a%u||-u),a+=l)}
(s=!(c=i[a]).active)&&r.selectTab(c.id),n(s)}else n(0)},u=function(e){h.xu(true,1,i,e||[],n,null)}
;e?1!==t.V||o?u():r.Wn(r.Bn.query,{windowId:t.J,index:0}).then(function(n){n&&n[0]&&r.Fn(n[0])?i(n):u()
}):1===Math.abs(t.V)?r.Wn(r.getCurTab).then(u):u()},function(){var n,e,o
;"frame"!==t.Be.type&&t.N&&t.N.s.Dn&&(t.N=(null===(n=t.z.get(t.N.s.Hn))||void 0===n?void 0:n.Sn)||t.N),e={H:3,u:"",
p:t.V,t:t.Be.trailingSlash,r:t.Be.trailing_slash,s:m.xr(t.Be),e:false!==t.Be.reloadOnRoot},o=a.Nn(e),
Promise.resolve(o||"url").then(function(){"object"==typeof e.e&&d.getRunNextCmdBy(2)(null!=e.e.p||void 0)})
},k.joinTabs,b.mainFrame,function(n,e){var o,i,u=r.selectIndexFrom(n)
;n.length>0&&(t.V<0?0===(t.V<-1?u:n[u].index):t.V>1&&u===n.length-1)?e(0):h.xu(true,1,function(o){
for(var u,f,a=r.selectIndexFrom(o),l=o[a],c=l.pinned,s=Math.max(0,Math.min(o.length-1,a+t.V));c!==o[s].pinned;)s-=t.V>0?1:-1
;if(s!==a&&i&&(u=r.getGroupId(l),
(f=r.getGroupId(o[s]))!==u&&(1===Math.abs(t.V)||u!==r.getGroupId(o[t.V>0?s<o.length-1?s+1:s:s&&s-1])))){
for(null!==u&&(a>0&&r.getGroupId(o[a-1])===u||a+1<o.length&&r.getGroupId(o[a+1])===u)&&(s=a,
f=u);0<=(s+=t.V>0?1:-1)&&s<o.length&&r.getGroupId(o[s])===f;);s-=t.V>0?1:-1}
s===a&&l.active?e(0):r.Bn.move((l.active?l:n[0]).id,{index:o[s].index},r.Pn(e))
},n,e,(i="ignore"!==(o=t.Be.group)&&false!==o)?function(e){return r.getGroupId(n[0])===r.getGroupId(e)}:null)
},k.moveTabToNewWindow,k.moveTabToNextWindow,function(){p.openUrl()},function(n,e){h.xu(!t.Be.single,0,k.reloadTab,n,e)
},function(n,e){h.xu(false,1,function(n,e,o){r.Bn.remove(n[e[0]].id,r.Pn(o))},n,e)},k.removeTab,function(n){
var e=t.Be.other?0:t.V;h.gu(e,function o(i){var u,f,a,l,c,s=i;if(!s||0===s.length)return r.On();u=r.selectIndexFrom(s),
f=t.Be.noPinned,
a=t.Be.filter,l=s[u],e>0?(++u,s=s.slice(u,u+e)):(f=null!=f?f&&s[0].pinned:u>0&&s[0].pinned&&!s[u-1].pinned,
e<0?s=s.slice(Math.max(u+e,0),u):s.splice(u,1)),f&&(s=s.filter(function(n){return!n.pinned})),a&&(s=h.mu(l,s,a)),
(c=t.Be.mayConfirm)&&s.length>("number"==typeof c?Math.max(c,5):20)&&d.vu()?d.cu("closeSomeOtherTabs",s.length).then(o.bind(null,i)):s.length>0?r.Bn.remove(s.map(function(n){
return n.id}),r.Pn(n)):n(0)})},function(n,e){if(n.length<=0)e(0);else{var o=n[0],i=false!==t.Be.group
;t.de>=52||0===t.A||t.e.Ge||!r._n(r.getTabUrl(o))?k.Ft(o,void 0,void 0,i):r.An.get(o.windowId,function(n){
n.incognito&&!o.incognito&&(o.openerTabId=o.windowId=void 0),k.Ft(o,void 0,void 0,i)})}},function(n){
var e,o,i,u,f,l,s,v,m,p=r.$n();if(!p)return n(0),a.complainNoSession();if(e=!!t.Be.one,
o=Math.min(+p.MAX_SESSION_RESULTS||25,25),(i=Math.abs(t.V))>o){if(e)return n(0),void a.showHUD(c.Yn("indexOOR"));i=o}
if(!e&&i<2&&(t.N?t.N.s.Un:2===t.A)&&!t.Be.incognito)return n(0),a.showHUD(c.Yn("notRestoreIfIncog"))
;if(u=false===t.Be.active,f=t.N?t.N.s.Hn:t.L,l=t.J,s=d.getRunNextCmdBy(0),v=function(e){var o,i,a,c
;e&&(e.window||e.tab&&e.tab.windowId!==l&&0===e.tab.index)&&(o=e.window?r.selectFrom(e.window.tabs):e.tab,
(a=/^(file|ftps?|https?)/.test(i=o.url)||i.startsWith(location.origin+"/"))||!i.startsWith(location.protocol)||i.startsWith(location.origin+"/")||(a=!!(c=new URL(i).host)&&true===t.X.get(c)),
a&&(e.window?Promise.resolve(e.window):r.Wn(r.Bn.query,{windowId:o.windowId,index:1}).then(function(n){
return n&&n.length?null:r.Wn(r.An.get,o.windowId)})).then(function(n){
n&&"popup"!==n.type&&Promise.all([r.Wn(r.Bn.create,{url:"about:blank",windowId:n.id
}),r.Wn(r.Bn.remove,o.id)]).then(function(n){var e=n[0];p.restore(),e&&r.Bn.remove(e.id)})})),
r.On()?n(0):u?r.selectTab(f,s):n(1)},e&&i>1)p.getRecentlyClosed({maxResults:i},function(e){
if(!e||i>e.length)return n(0),a.showHUD(c.Yn("indexOOR"));var o=e[i-1],t=o&&(o.tab||o.window)
;t?p.restore(t.sessionId,v):n(0)});else if(1===i)p.restore(null,v);else{for(m=[];0<=--i;)m.push(r.Wn(p.restore,null))
;Promise.all(m).then(function(e){void 0===e[0]?n(0):u?r.selectTab(f,s):n(1)})}u&&r.selectTab(f,r.On)},function(){
null==t.Be.$seq?v.runKeyWithCond():v.runKeyInSeq(t.Be.$seq,t.V,t.Be.$f,null)},function(n){
var e,o,f,l=(t.Be.keyword||"")+"",s=u.fu({u:r.getTabUrl(n[0])});s&&l?(e=m.xr(t.Be),s.u=t.i(s.u,0,e),
o=i.We(s.u.split(" "),l,2),d.overrideCmdOptions({url_f:o,reuse:null!=(f=t.Be.reuse)?f:0,opener:true,keyword:""}),
p.openUrl(n)):d.runNextCmd(0)||a.showHUD(c.Yn(l?"noQueryFound":"noKw"))},function(n){var e,o,i=t.Be.id,u=t.Be.data
;if(!(i&&"string"==typeof i&&void 0!==u))return a.showHUD('Require a string "id" and message "data"'),void n(0)
;e=Date.now(),o=function(e){e=e&&e.message||e+"",console.log("Can not send message to the extension %o:",i,e),
a.showHUD("Error: "+e),n(0)};try{r.Cn.runtime.sendMessage(i,t.Be.raw?u:{handler:"message",from:"Vimium C",count:t.V,
keyCode:t.B,data:u},function(t){var i=r.On();return i?o(i):"string"==typeof t&&Math.abs(Date.now()-e)<1e3&&a.showHUD(t),
i||n(false!==t),i})}catch(n){o(n)}},function(n){var e,o=t.Be.text
;o||!t.Be.$f||(o=(e=t.Be.$f)&&e.t?c.gr("".concat(e.t)):"")?(a.showHUD(o?o instanceof Promise?o:o+"":c.Yn("needText")),
n(!!o)):n(false)},function(n,e){y.St.Pt(t.Be,t.V,n,e)},k.toggleMuteTab,function(n,e){h.xu(true,0,k.togglePinTab,n,e)
},k.toggleTabUrl,function(n,e){var o,r=n[0].id,i=((t.Be.style||"")+"").trim(),u=!!t.Be.current
;if(!i)return a.showHUD(c.Yn("noStyleName")),void e(0);for(o of t.U)if(o.s.Hn===r)return o.postMessage({N:46,t:i,c:u}),
void setTimeout(e,100,1);u||l.ii({t:i,o:1}),setTimeout(e,100,1)},b.toggleZoom,function(n){
var e,o=!!t.Be.acrossWindows,i=!!t.Be.onlyActive,u=t.Be.filter,f={},l=function(e){var o,f,l,s,d
;if(e.length<2)return i&&a.showHUD("Only found one browser window"),n(0),r.On();o=t.N?t.N.s.Hn:t.L,
l=(f=e.findIndex(function(n){return n.id===o}))>=0?e[f]:null,f>=0&&e.splice(f,1),
!u||(e=h.mu(l,e,u)).length?(s=e.filter(function(n){return t.T.has(n.id)}).sort(y._t.Nr),
(d=(e=i&&0===s.length?e.sort(function(n,e){return e.id-n.id
}):s)[t.V>0?Math.min(t.V,e.length)-1:Math.max(0,e.length+t.V)])?i?r.An.update(d.windowId,{focused:true
},r.Pn(n)):c(d.id):n(0)):n(0)},c=function(e){r.selectTab(e,function(e){return e&&r.selectWndIfNeed(e),r.Pn(n)()})}
;1===t.V&&!i&&-1!==t.L&&(e=h.wu())>=0?Promise.all([r.Wn(r.tabsGet,e),h.getNecessaryCurTabInfo(u)]).then(function(n){
var e=n[0],i=n[1];e&&(o||e.windowId===t.J)&&r.Fn(e)&&(!u||h.mu(i,[e],u).length>0)?c(e.id):o?r.Bn.query(f,l):r.Mn(l)
}):o||i?r.Bn.query(i?{active:true}:f,l):r.Mn(l)},function(n){var e=t.Be.newWindow
;true!==e&&true?r.Wn(r.Cn.permissions.contains,{permissions:["downloads.shelf","downloads"]}).then(function(o){var i,u
;if(o){i=r.Cn.downloads.setShelfEnabled,u=void 0;try{i(false),setTimeout(function(){i(true),n(1)},256)}catch(n){
u=(n&&n.message||n)+""}a.showHUD(u?"Can not close the shelf: "+u:"The download bar has been closed"),u&&n(0)
}else false===e&&t.N?(a.showHUD("No permissions to close download bar"),n(0)):t.P[27](n)}):t.P[27](n)},function(n){
var e,o=t.z.get(t.N?t.N.s.Hn:t.L);for(e of o?o.po:[])d.portSendFgCmd(e,7,false,{r:1},1);o&&o.Qn.postMessage({N:16,t:150
}),n(1)},function(n){var e,o,r,i,u,f,l,c=t.Be.$cache;if(null!=c&&((o=t.H.be.find(function(n){return n.uo===c
}))?e=Promise.resolve(o):d.overrideOption("$cache",null)),r=!!e,i=t.V,u=false,!e){
if(!(f=t.Be.path||t.Be.title)||"string"!=typeof f)return a.showHUD("Invalid bookmark "+(t.Be.path?"path":"title")),
void n(0)
;if(!(l=d.fillOptionWithMask(f,t.Be.mask,"name",["path","title","mask","name","value"],i)).ok)return void a.showHUD((l.result?"Too many potential names":"No name")+" to find bookmarks")
;u=l.useCount,e=t.findBookmark(0,l.result)}e.then(function(e){e&&null!=e.u?(r||u||d.overrideOption("$cache",e.uo),
d.overrideCmdOptions({url:e.fo||e.u
},true),t.V=u?1:i,p.openUrl()):(n(0),a.showHUD(false===e?'Need valid "title" or "title".':null===e?"The bookmark node is not found.":"The bookmark is a folder."))
})}]});