"use strict"
;__filename="background/settings.js",define(["require","exports","./store","./utils","./browser","./normalize_urls","./parse_urls","./ports"],function(e,o,t,a,n,s,c,i){
var r,l,h,m,w,p,u,b,g,d,f,k;Object.defineProperty(o,"__esModule",{value:true
}),o.eo=o.oo=o.to=o.ao=o.no=o.so=o.co=o.io=o.ro=o.lo=o.ho=o.mo=void 0,r=null,l=null,o.mo=localStorage,
o.ho=n.Cn.storage.local,o.lo=Promise.all([0,n.In(n.Cn.runtime.getPlatformInfo).then(function(e){
var o=e.os.toLowerCase(),a=n.Cn.runtime.PlatformOs,s=o===a.WIN?2:o===a.MAC?0:1;t.e.Je=o,t.ae.o=t.ue.o=s,t.fe=s
}),n.In(o.ho.get.bind(o.ho)).then(function(e){var a,n,s,c,i,r,l,h,m,w=t.ce;for(a of(Object.assign(w,o.to),e=e||{},
Object.entries(e)))a[0]in o.to?w[a[0]]=a[1]:t.ie.set(a[0],a[1]);if(n=0,o.mo)for(n=o.mo.length,s=0;s<n;s++)c=o.mo.key(s),
i=o.mo.getItem(c),c in o.to?(l="string"==typeof(r=o.to[c])?i:false===r||true===r?"true"===i:JSON.parse(i),
w[c]=l):t.ie.set(c,i);for(m in h=n+Object.keys(e).length,t.me=0===h,t.ue.g=w.grabBackFocus,o.eo)o.ao(o.eo[m],w[m],t.ue)
;return h})]).then(function(e){return o.ao("i",t.ce.ignoreCapsLock,t.ue),t.W=2|t.W,e[2]}),o.lo.then(function(){
t.Q&&t.Q()}),h=function(e,n){var s,c;if(t.ce[e]=n,l||(l=a.pn(),setTimeout(m,0)),s=o.to[e],o.mo.removeItem(e),
l[e]=n!==s?n:null,t.w(e,n),e in o.eo&&o.ao(o.eo[e],n,t.ue),c=t.F[e])return c(n,e)},o.ro=h,o.io=function(e,o){
var n=t.ie.get(e);(void 0!==n?n:null)!==o&&(l||(l=a.pn(),setTimeout(m,0)),l[e]=o,null!==o?t.ie.set(e,o):t.ie.delete(e))
},m=function(){var e,t,a=l,n=[];for(e of(l=null,Object.entries(a)))t=e[0],null===e[1]&&(n.push(t),delete a[t])
;o.ho.remove(n),o.ho.set(a)},o.co=function(e,o){return t.F[e](void 0!==o?o:t.ce[e],e)},o.so=function(e){
if(6!==e.N)w(e);else if(null==e.d.length)w(e);else{var o=e.d;r?o=o.concat(r):a.d(w.bind(null,e)),r=o,e.d=null}},
w=function(e){var o,a,n;if(6===e.N&&!e.d){for(n of(o=r,a=e.d={},o))a[n]=t.ue[n];r=null}i.wo(function(o){
for(var t of o.po)t.postMessage(e)})},o.no=function(e){a.m(t.U.slice(0),function(o){
return t.U.includes(o)&&o.postMessage(e),1})},o.ao=function(e,o,a){switch(e){case"c":case"n":
o=o.toLowerCase().toUpperCase();break;case"i":o=o===!!o?o:o>1||o>0&&!t.fe;break;case"l":o=o===!!o?o?2:0:o;break;case"d":
o=o?" D":""}return a?a[e]=o:o},Object.assign(t.F,{extAllowList:function(e){var o,a,n,s=t.X;if(s.forEach(function(e,o){
false!==e&&s.delete(o)
}),e)for(a=(o=e.split("\n")).length,n=/^[\da-z_]/i;0<=--a;)(e=o[a].trim())&&n.test(e)&&s.set(e,true)},
grabBackFocus:function(e){t.ue.g=e},newTabUrl:function(e){
e=/^\/?pages\/[a-z]+.html\b/i.test(e)?n.Cn.runtime.getURL(e):n.qn(s.rr(e)),t.newTabUrl_f=e,o.io("newTabUrl_f",e)},
searchEngines:function(){
t.se.map.clear(),t.se.keywords=null,t.se.rules=c.uu("~:"+t.ce.searchUrl+"\n"+t.ce.searchEngines,t.se.map).reverse()},
searchUrl:function(e){var a=t.se.map;if(e)c.uu("~:"+e,a);else if(a.clear(),a.set("~",{ou:"~",C:"",
fr:t.ce.searchUrl.split(" ",1)[0]}),t.se.rules=[],t.newTabUrl_f=t.ie.get("newTabUrl_f")||"",t.newTabUrl_f)return
;o.co("newTabUrl")},mapModifier:function(e){o.no({N:47,d:{a:e}})},vomnibarPage:function(e){
var a=t.ie.get("vomnibarPage_f")
;!a||e?((e=e?n.qn(e):t.ce.vomnibarPage)===o.to.vomnibarPage?e=t.e.Fe:e.startsWith("front/")?e=n.Cn.runtime.getURL(e):(e=s.rr(e),
e=s.Ye(e),e=t.de<50&&!e.startsWith(t.e.Re)?t.e.Fe:e.replace(":version","".concat(parseFloat(t.e.Oe)))),
t.vomnibarPage_f=e,o.io("vomnibarPage_f",e)):t.vomnibarPage_f=a}}),o.to={__proto__:null,allBrowserUrls:false,
autoDarkMode:2,autoReduceMotion:0,
clipSub:"p=^git@([^/:]+):=https://$1/=\ns@^https://(?:www\\.)?google\\.com(?:\\.[^/]+)?/url\\?(?:[^&#]+&)*?url=([^&#]+)@$1@,matched,decodecomp\np@^https://item\\.m\\.jd\\.com/product/(\\d+)\\.html\\b@https://item.jd.com/$1.html@",
exclusionListenHash:true,exclusionOnlyFirstMatch:false,exclusionRules:[{pattern:":https://mail.google.com/",passKeys:""
}],
extAllowList:"# modified versions of X New Tab and PDF Viewer,\n# NewTab Adapter, and Shortcuts Forwarding Tool\nhdnehngglnbnehkfcidabjckinphnief\nnacjakoppgmdcpemlfnfegmlhipddanj\ncglpcedifkgalfdklahhcchnjepcckfn\nclnalilglegcjmlgenoppklmfppddien\n# EdgeTranslate\nbocbaocobfecmglnmeaeppambideimao\nbfdogplmndidlpjfhoijckpakkdjkkil\n# SalaDict\ncdonnmffkdaoajfknoeeecmchibpmkmg\nidghocbbahafpfhjnfhpbfbmpegphmmp",
filterLinkHints:false,grabBackFocus:false,hideHud:false,ignoreCapsLock:0,ignoreKeyboardLayout:0,keyboard:[560,33],
keyupTime:120,keyMappings:"",linkHintCharacters:"sadjklewcmpgh",linkHintNumbers:"0123456789",localeEncoding:"gbk",
mapModifier:0,mouseReachable:true,newTabUrl:"",
nextPatterns:"\u4e0b\u4e00\u5c01,\u4e0b\u9875,\u4e0b\u4e00\u9875,\u4e0b\u4e00\u7ae0,\u540e\u4e00\u9875,\u4e0b\u4e00\u5f20,next,more,newer,>,\u203a,\u2192,\xbb,\u226b,>>",
omniBlockList:"",passEsc:"[aria-controls],[role=combobox],#kw.s_ipt",
previousPatterns:"\u4e0a\u4e00\u5c01,\u4e0a\u9875,\u4e0a\u4e00\u9875,\u4e0a\u4e00\u7ae0,\u524d\u4e00\u9875,\u4e0a\u4e00\u5f20,prev,previous,back,older,<,\u2039,\u2190,\xab,\u226a,<<",
regexFindMode:false,scrollStepSize:100,
searchUrl:navigator.language.startsWith("zh")?"https://www.baidu.com/s?ie=utf-8&wd=%s \u767e\u5ea6":"https://www.google.com/search?q=%s Google",
searchEngines:navigator.language.startsWith("zh")?"b|ba|baidu|Baidu|\u767e\u5ea6: https://www.baidu.com/s?ie=utf-8&wd=%s \\\n  blank=https://www.baidu.com/ \u767e\u5ea6\nbi: https://www.bing.com/search?q=$s\nbi|bing|Bing|\u5fc5\u5e94: https://cn.bing.com/search?q=%s \\\n  blank=https://cn.bing.com/ \u5fc5\u5e94\ng|go|gg|google|Google|\u8c37\u6b4c: https://www.google.com/search?q=%s\\\n  www.google.com re=/^(?:\\.[a-z]{2,4})?\\/search\\b.*?[#&?]q=([^#&]*)/i\\\n  blank=https://www.google.com/ Google\nbr|brave: https://search.brave.com/search?q=%s Brave\nd|dd|ddg|duckduckgo: https://duckduckgo.com/?q=%s DuckDuckGo\nec|ecosia: https://www.ecosia.org/search?q=%s Ecosia\nqw|qwant: https://www.qwant.com/?q=%s Qwant\nya|yd|yandex: https://yandex.com/search/?text=%s Yandex\nyh|yahoo: https://search.yahoo.com/search?p=%s Yahoo\n\nb.m|bm|map|b.map|bmap|\u5730\u56fe|\u767e\u5ea6\u5730\u56fe: \\\n  https://api.map.baidu.com/geocoder?output=html&address=%s&src=vimium-c\\\n  blank=https://map.baidu.com/\ngd|gaode|\u9ad8\u5fb7\u5730\u56fe: https://www.gaode.com/search?query=%s \\\n  blank=https://www.gaode.com\ng.m|gm|g.map|gmap: https://www.google.com/maps?q=%s \\\n  blank=https://www.google.com/maps \u8c37\u6b4c\u5730\u56fe\nbili|bilibili|bz|Bili: https://search.bilibili.com/all?keyword=%s \\\n  blank=https://www.bilibili.com/ \u54d4\u54e9\u54d4\u54e9\ny|yt: https://www.youtube.com/results?search_query=%s \\\n  blank=https://www.youtube.com/ YouTube\n\nw|wiki: https://www.wikipedia.org/w/index.php?search=%s Wikipedia\nb.x|b.xs|bx|bxs|bxueshu: https://xueshu.baidu.com/s?ie=utf-8&wd=%s \\\n  blank=https://xueshu.baidu.com/ \u767e\u5ea6\u5b66\u672f\ngs|g.s|gscholar|g.x|gx|gxs: https://scholar.google.com/scholar?q=$s \\\n  scholar.google.com re=/^(?:\\.[a-z]{2,4})?\\/scholar\\b.*?[#&?]q=([^#&]*)/i\\\n  blank=https://scholar.google.com/ \u8c37\u6b4c\u5b66\u672f\n\nt|tb|taobao|ali|\u6dd8\u5b9d: https://s.taobao.com/search?ie=utf8&q=%s \\\n  blank=https://www.taobao.com/ \u6dd8\u5b9d\nj|jd|jingdong|\u4eac\u4e1c: https://search.jd.com/Search?enc=utf-8&keyword=%s\\\n  blank=https://jd.com/ \u4eac\u4e1c\naz|amazon: https://www.amazon.com/s?k=%s \\\n  blank=https://www.amazon.com/ \u4e9a\u9a6c\u900a\n\n\\:i: vimium://sed/s/^//,lower\\ $S re= Lower case\nv.m|math: vimium://math\\ $S re= \u8ba1\u7b97\u5668\nv.p: vimium://parse\\ $S re= Redo Search\ngh|github: https://github.com/search?q=$s \\\n  blank=https://github.com/ GitHub \u4ed3\u5e93\nge|gitee: https://search.gitee.com/?type=repository&q=$s \\\n  blank=https://gitee.com/ Gitee \u4ed3\u5e93\njs\\:|Js: javascript:\\ $S; JavaScript":"bi: https://cn.bing.com/search?q=$s\nbi|bing: https://www.bing.com/search?q=%s \\\n  blank=https://www.bing.com/ Bing\nb|ba|baidu|\u767e\u5ea6: https://www.baidu.com/s?ie=utf-8&wd=%s \\\n  blank=https://www.baidu.com/ \u767e\u5ea6\ng|go|gg|google|Google: https://www.google.com/search?q=%s \\\n  www.google.com re=/^(?:\\.[a-z]{2,4})?\\/search\\b.*?[#&?]q=([^#&]*)/i\\\n  blank=https://www.google.com/ Google\nbr|brave: https://search.brave.com/search?q=%s Brave\nd|dd|ddg|duckduckgo: https://duckduckgo.com/?q=%s DuckDuckGo\nec|ecosia: https://www.ecosia.org/search?q=%s Ecosia\nqw|qwant: https://www.qwant.com/?q=%s Qwant\nya|yd|yandex: https://yandex.com/search/?text=%s Yandex\nyh|yahoo: https://search.yahoo.com/search?p=%s Yahoo\n\ng.m|gm|g.map|gmap: https://www.google.com/maps?q=%s \\\n  blank=https://www.google.com/maps Google Maps\nb.m|bm|map|b.map|bmap|\u767e\u5ea6\u5730\u56fe: \\\n  https://api.map.baidu.com/geocoder?output=html&address=%s&src=vimium-c\ny|yt: https://www.youtube.com/results?search_query=%s \\\n  blank=https://www.youtube.com/ YouTube\nw|wiki: https://www.wikipedia.org/w/index.php?search=%s Wikipedia\ng.s|gs|gscholar: https://scholar.google.com/scholar?q=$s \\\n  scholar.google.com re=/^(?:\\.[a-z]{2,4})?\\/scholar\\b.*?[#&?]q=([^#&]*)/i\\\n  blank=https://scholar.google.com/ Google Scholar\n\na|ae|ali|alie|aliexp: https://www.aliexpress.com/wholesale?SearchText=%s \\\n  blank=https://www.aliexpress.com/ AliExpress\nj|jd|jb|joy|joybuy: https://www.joybuy.com/search?keywords=%s \\\n  blank=https://www.joybuy.com/ Joybuy\naz|amazon: https://www.amazon.com/s?k=%s \\\n  blank=https://www.amazon.com/ Amazon\n\n\\:i: vimium://sed/s/^//,lower\\ $S re= Lower case\nv.m|math: vimium://math\\ $S re= Calculate\nv.p: vimium://parse\\ $S re= Redo Search\ngh|github: https://github.com/search?q=$s \\\n  blank=https://github.com/ GitHub Repo\nge|gitee: https://search.gitee.com/?type=repository&q=$s \\\n  blank=https://gitee.com/ Gitee \u4ed3\u5e93\njs\\:|Js: javascript:\\ $S; JavaScript",
showActionIcon:true,showAdvancedCommands:true,showAdvancedOptions:true,showInIncognito:false,notifyUpdate:true,
smoothScroll:true,vomnibarOptions:{maxMatches:10,queryInterval:333,sizes:"77,3,44,0.8",styles:"mono-url",actions:""},
userDefinedCss:"",vimSync:null,vomnibarPage:"front/vomnibar.html",waitForEnter:true},o.oo=["showAdvancedCommands"],
o.eo={__proto__:null,filterLinkHints:"f",ignoreCapsLock:"i",ignoreKeyboardLayout:"l",mapModifier:"a",mouseReachable:"e",
keyboard:"k",keyupTime:"u",linkHintCharacters:"c",linkHintNumbers:"n",passEsc:"p",regexFindMode:"r",smoothScroll:"s",
scrollStepSize:"t",waitForEnter:"w"},t.W<6&&(p=n.Cn.runtime.getManifest(),u=location.origin,b=u+"/",
g=p.content_scripts[0].js,d=t.e,f=t.Y,k=function(e){return(47===e.charCodeAt(0)?u:e.startsWith(b)?"":b)+e},
o.to.newTabUrl=t.we?"edge://newtab":"chrome://newtab",f.set("about:newtab",1),f.set("about:newtab/",1),
f.set("chrome://newtab",1),f.set("chrome://newtab/",1),t.we&&(f.set("edge://newtab",1),f.set("edge://newtab/",1)),
f.set("chrome://new-tab-page",2),f.set("chrome://new-tab-page/",2),d.Ue=Object.keys(p.commands||{}).map(function(e){
return"quickNext"===e?"nextTab":e}),d.Oe=p.version,d.qe=p.version_name||p.version,d.Ee=k(p.options_page||d.Ee),
d.xe=null!=p.permissions&&p.permissions.indexOf("clipboardRead")>=0,d.ze=k(d.ze),d.Fe=k(o.to.vomnibarPage),d.Qe=k(d.Ke),
d.Te=p.homepage_url||d.Te,d.Ae=k(d.Ae),g.push("content/injected_end.js"),d.He=g.map(k))});