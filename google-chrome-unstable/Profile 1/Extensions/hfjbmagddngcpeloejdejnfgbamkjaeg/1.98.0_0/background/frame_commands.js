"use strict"
;__filename="background/frame_commands.js",define(["require","exports","./store","./utils","./browser","./normalize_urls","./ports","./ui_css","./i18n","./key_mappings","./run_commands","./open_urls","./tools"],function(n,e,t,l,i,o,u,r,a,f,s,c,m){
var v,d,p,g,h;Object.defineProperty(e,"__esModule",{value:true
}),e.focusFrame=e.framesGoNext=e.toggleZoom=e.mainFrame=e.framesGoBack=e.openImgReq=e.captureTab=e.enterVisualMode=e.showVomnibar=e.initHelp=e.performFind=e.parentFrame=e.nextFrame=void 0,
l=l,v=function(){var n,l=t.N,i=-1,o=t.z.get(l.s.Hn),u=o&&o.po;if(u&&u.length>1){for(i=u.indexOf(l),
n=Math.abs(t.V);n>0;n--)(i+=t.V>0?1:-1)===u.length?i=0:i<0&&(i=u.length-1);l=u[i]}
e.focusFrame(l,0===l.s.Dn,l!==t.N&&o&&l!==o.Qn?3:2,t.Be)},e.nextFrame=v,d=function(){
var n=t.N.s,l=n.Hn>=0&&t.z.get(n.Hn)?null:"Vimium C can not access frames in current tab";l&&u.showHUD(l),
u.getParentFrame(n.Hn,n.Dn,t.V).then(function(n){n?e.focusFrame(n,true,4,t.Be):e.mainFrame()})},e.parentFrame=d,
e.performFind=function(){
var n=t.N.s,e=t.V<0?-t.V:t.V,l=t.Be.index,i=l?"other"===l?e+1:"count"===l?e:l>=0?-1-(0|l):0:0,o=!!i||!t.Be.active,u=null
;32&n.Ln||(n.Ln|=32,u=r.ni(n)),s.sendFgCmd(1,true,s.wrapFallbackOptions({c:i>0?t.V/e:t.V,l:o,f:u,m:!!t.Be.highlight,
n:!!t.Be.normalize,r:true===t.Be.returnToViewport,s:!i&&e<2&&!!t.Be.selected,p:!!t.Be.postOnEsc,e:!!t.Be.restart,
q:t.Be.query?t.Be.query+"":o||t.Be.last?m.Ct._r(n.Un,"",i<0?-i:i):""}))},e.initHelp=function(n,e){var o=t.Z||[]
;return Promise.all([i.import2(t.e.HelpDialogJS),null!=o[0]?null:l.l("help_dialog.html"),null!=o[1]?null:a.getI18nJson("help_dialog"),null!=o[2]?null:a.getI18nJson("params.json")]).then(function(l){
var i,o,u=l[0],r=l[1],a=l[2],c=l[3],m=n.w&&(null===(i=t.z.get(e.s.Hn))||void 0===i?void 0:i.Sn)||e,v=m.s.fr.startsWith(t.e.Ee),d=n.a||{}
;m.s.Ln|=64,t.N=m,o=t.Z||(t.Z=[null,null,null]),r&&(o[0]=r),a&&(o[1]=a),c&&(o[2]=c),s.sendFgCmd(17,true,{
h:u.nl(v,d.commandNames),o:t.e.Ee,f:n.f,e:!!d.exitOnClick,c:v&&!!f.pt||t.ce.showAdvancedCommands})},null)},
e.showVomnibar=function(n){var e,i,o,u,r,a,f,c,m,v,d=t.N,p=t.Be.url;if(null!=p&&true!==p&&"string"!=typeof p&&(p=null,
delete t.Be.url),!d){if(!(d=(null===(e=t.z.get(t.L))||void 0===e?void 0:e.Sn)||null))return;t.N=d}
"bookmark"===t.Be.mode&&s.overrideOption("mode","bookm"),o=d.s.fr,u=!(i=t.vomnibarPage_f).startsWith(t.e.Re),
r=o.startsWith(t.e.Re),
a=n||!i.startsWith(location.origin+"/")?t.e.Fe:i,n=n||(u?r||i.startsWith("file:")&&!o.startsWith("file:///")||i.startsWith("http:")&&!/^http:/.test(o)&&!/^http:\/\/localhost[:/]/i.test(i):d.s.Un||r&&!i.startsWith(o.slice(0,o.indexOf("/",o.indexOf("://")+3)+1))),
m=t.Be.trailing_slash,null==(v=s.copyCmdOptions(l.mn({v:(f=n||i===a||d.s.Hn<0)?a:i,i:f?null:a,t:f?0:u?2:1,
s:null!=(c=t.Be.trailingSlash)?!!c:null!=m?!!m:null,j:f?"":t.e.Qe,e:!!t.Be.exitOnClick,k:l.a(true)
}),t.Be)).icase&&t.ce.vomnibarOptions.actions.includes("icase")&&(v.icase=true),s.portSendFgCmd(d,6,true,v,t.V),
v.k="omni",t.Be=v},e.enterVisualMode=function(){var n,e,i,o,u,a,c,m;e="string"==typeof(n=t.Be.mode)?n.toLowerCase():"",
o=null,u="",a=null,c=null,16&~(i=t.N.s).Ln&&(u=t.ee,32&i.Ln||(i.Ln|=32,o=r.ni(i)),a=f.et,c=f.at,i.Ln|=16),
delete(m=l.yn({m:"caret"===e?3:"line"===e?2:1,f:o,g:c,k:a,t:!!t.Be.richText,s:!!t.Be.start,w:u},t.Be)).mode,
delete m.start,delete m.richText,s.sendFgCmd(5,true,m)},e.captureTab=function(n,e){
var l=t.Be.show,o=false===t.Be.download,u=!!t.Be.png||false?0:Math.min(Math.max(0|t.Be.jpeg,0),100),r=n&&n[0],a=r?r.id:t.L,f=r?r.title:""
;f="title"===t.Be.name||!f||a<0?f||""+a:a+"-"+f,f+=u>0?".jpg":".png",i.Bn.captureVisibleTab(r?r.windowId:t.J,u>0?{
format:"jpeg",quality:u}:{format:"png"},function(n){var u,r,a;if(!n)return e(0),i.On();u=function(n){
var u,s,c=o&&!l?null:"string"!=typeof n?URL.createObjectURL(n):n;if(c&&c.startsWith("blob:")&&(p&&(clearTimeout(p[0]),
URL.revokeObjectURL(p[1])),p=[setTimeout(function(){p&&URL.revokeObjectURL(p[1]),p=null},l?5e3:3e4),c]),l)return r(c),
void e(1);o||(s=t.N&&(null===(u=t.z.get(t.N.s.Hn))||void 0===u?void 0:u.Sn)||t.N,
i.downloadFile(c,f,s?s.s.fr:null,function(n){n||a(c),e(n)}))},r=function(n){t.K[23]({t:"pixel=1&",u:n,f:f,a:false,m:36,
o:{r:t.Be.reuse,m:t.Be.replace,p:t.Be.position,w:t.Be.window}},t.N)},a=function(n){
var e=globalThis.document.createElement("a");e.href=n,e.download=f,e.target="_blank",e.click()},
n.startsWith("data:")?fetch(n).then(function(n){return n.blob()}).then(u):u(n)})},e.openImgReq=function(n,e){
var i,r,f,m,v,d,p,g,h,_,b=n.u;if(/^<svg[\s>]/i.test(b)){
if(r=(new DOMParser).parseFromString(b,"image/svg+xml").firstElementChild)for(f of(r.removeAttribute("id"),
r.removeAttribute("class"),[].slice.call(r.querySelectorAll("script,use"))))f.remove()
;if(!r||!r.lastElementChild)return t.N=e,void u.showHUD(a.Yn("invalidImg"))
;r.setAttribute("xmlns","http://www.w3.org/2000/svg"),b="data:image/svg+xml,"+encodeURIComponent(r.outerHTML),
n.f=n.f||"SVG Image"}if(!l.in(b))return t.N=e,void u.showHUD(a.Yn("invalidImg"));m=t.e.ze+"#!image ",
n.f&&(m+="download="+l.rn(n.f)+"&"),false!==n.a&&(m+="auto=once&"),n.t&&(m+=n.t),d=(v=n.o||l.pn()).k,
p=null!==(i=v.t)&&void 0!==i?i:!d,h=(g=v.s?t.i(b,32768,v.s):b)!==b,b=g,s.replaceCmdOptions({opener:true,
reuse:null!=v.r?v.r:16&n.m?-2:-1,replace:v.m,position:v.p,window:v.w
}),t.V=1,_=d||h?p?o.rr(b,d,2):o.We(b.trim().split(l.jn),d,2):b,
c.openUrlWithActions("string"!=typeof _||!p||_.startsWith(location.protocol)&&!_.startsWith(location.origin+"/")?_:m+_,9)
},g=function(n,l,o){var r,f,m,v,d,p,g,h,_,b=!!i.Bn.goBack
;if(!b&&(o?i.getTabUrl(o):(l.s.Dn?t.z.get(l.s.Hn).Sn:l).s.fr).startsWith(t.e.Re)&&true)return t.N=l,
u.showHUD(a.Yn("noTabHistory")),void s.runNextCmd(0);if(r=s.hasFallbackOptions(n.o)?(s.replaceCmdOptions(n.o),
s.getRunNextCmdBy(0)):i.On,f=function(n,e){i.Bn.executeScript(n.id,{code:"history.go(".concat(e,")"),
runAt:"document_start"},r)},m=o?o.id:l.s.Hn,v=n.s,d=c.parseReuse(n.o.reuse||0))p=n.o.position,
i.Bn.duplicate(m,function(t){var l,o,u;if(!t)return r()
;-2===d&&i.selectTab(m),b?((l=s.parseFallbackOptions(n.o)||{}).reuse=0,e.framesGoBack({s:v,o:l},null,t)):f(t,v),
o=t.index--,null!=(u="end"===p?3e4:c.newTabIndex(t,p,false,true))&&u!==o&&i.Bn.move(t.id,{index:u},i.On)
});else if(g=v>0?i.Bn.goForward:i.Bn.goBack,b||g)for(h=0,_=v>0?v:-v;h<_;h++)g(m,h?i.On:r);else f(o,v)},e.framesGoBack=g,
h=function(){var n=t.z.get(t.N?t.N.s.Hn:t.L),l=n&&n.Sn
;l&&l===n.Qn&&t.Be.$else&&"string"==typeof t.Be.$else?s.runNextCmd(0):l&&e.focusFrame(l,true,l===n.Qn?2:4,t.Be)},
e.mainFrame=h,e.toggleZoom=function(n){i.Wn(i.Bn.getZoom).then(function(e){var l,o,u,r,a,f,s,c,m,v,d;if(e){
if(l=t.V<-4?-t.V:t.V,(t.Be.in||t.Be.out)&&(l=0,t.V=t.Be.in?t.V:-t.V),u=t.Be.level,r=Math,
t.Be.reset)o=1;else if(null!=u&&!isNaN(+u)||l>4)a=r.max(.1,r.min(0|t.Be.min||.25,.9)),
f=r.max(1.1,r.min(0|t.Be.min||5,100)),o=null==u||isNaN(+u)?l>1e3?1:l/(l>49?100:10):1+u*t.V,o=r.max(a,r.min(o,f));else{
for(s=0,
c=9,m=[.25,1/3,.5,2/3,.75,.8,.9,1,1.1,1.25,1.5,1.75,2,2.5,3,4,5],v=0,d=0;v<m.length&&(d=Math.abs(m[v]-e))<c;v++)s=v,c=d
;o=m[s+t.V<0?0:r.min(s+t.V,m.length-1)]}Math.abs(o-e)>.005?i.Bn.setZoom(o,i.Pn(n)):n(0)}else n(0)})},
e.framesGoNext=function(n,e){var l,i,o,u,r=t.Be.patterns,a=false
;if(r&&r instanceof Array||(r=(r=r&&"string"==typeof r?r:(a=true,
n?t.ce.nextPatterns:t.ce.previousPatterns)).split(",")),a||!t.Be.$fmt){for(i of(l=[],
r))if((i=i&&(i+"").trim())&&l.push(".#[".includes(i[0])?i:i.toLowerCase()),200===l.length)break;r=l,
a||(s.overrideOption("patterns",r),s.overrideOption("$fmt",1))}o=r.map(function(n){
return Math.max(n.length+12,4*n.length)}),u=Math.max.apply(Math,o),s.sendFgCmd(10,true,s.wrapFallbackOptions({
r:t.Be.noRel?"":e,n:n,exclude:t.Be.exclude,match:t.Be.match,evenIf:t.Be.evenIf,p:r,l:o,m:u>0&&u<99?u:32}))},
e.focusFrame=function(n,e,l,i){n.postMessage({N:7,H:e?u.ensureInnerCSS(n.s):null,m:l,k:t.B,c:0,
f:i&&s.parseFallbackOptions(i)||{}})}});