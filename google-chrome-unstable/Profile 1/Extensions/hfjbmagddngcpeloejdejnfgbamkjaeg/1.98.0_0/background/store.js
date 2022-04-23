"use strict";__filename="background/store.js",define(["require","exports"],function(e,n){var l,r,t,o,a
;Object.defineProperty(n,"__esModule",{value:true
}),n.e=n.r=n.o=n.u=n.i=n.p=n.f=n.h=n.w=n.b=n.getNextFakeTabId=n.M=n.C=n.j=n.S=n.P=n.V=n.N=n.B=n.I=n.R=n.x=n.y=n.findBookmark=n.D=n.G=n.H=n.O=n.q=n.A=n.E=n.J=n.L=n.T=n.U=n.z=n.F=n.K=n.Q=n.W=n.X=n.Y=n.Z=n.$=n.ee=n.ne=n.le=n.re=n.te=n.oe=n.ae=n.se=n.ue=n.vomnibarPage_f=n.newTabUrl_f=n.ie=n.ce=n._e=n.me=n.pe=n.fe=n.he=n.de=n.we=n.OnSafari=n.OnEdge=n.OnFirefox=n.OnChrome=n.IsLimited=n.ge=void 0,
n.ge=1,n.IsLimited=!!0,n.OnChrome=!0,n.OnFirefox=!!0,n.OnEdge=!!0,n.OnSafari=!!0,l=navigator.userAgentData,
n.we=(r=l&&(l.brands||l.uaList))?!!r.find(function(e){return e.brand.includes("Edge")||e.brand.includes("Microsoft")
}):matchMedia("(-ms-high-contrast)").matches,n.de=r?(t=r.find(function(e){return e.brand.includes("Chromium")
}))?t.version:83:(a=navigator.userAgent.match(/\bChrom(?:e|ium)\/(\d+)/))?75==+a[1]&&matchMedia("(prefers-color-scheme)").matches?81:0|a[1]:998,
n.he=999,n.fe=2,n.me=false,n._e=false,n.ce={},n.ie=new Map,n.newTabUrl_f="",n.vomnibarPage_f="",n.ue={v:n.de,d:"",
g:false,m:false},n.se={map:new Map,rules:[],keywords:null},n.ae={v:n.de,a:0,c:"",l:"",k:null,n:0,s:"",t:0},n.oe=false,
n.ne=false,n.Y=new Map,n.X=new Map,n.W=0,n.F={},n.z=new Map,n.U=[],n.T=new Map,n.L=-1,n.J=-1,n.E=-1,n.A=1,n.q=null,
n.O=null,n.H={be:[],Me:[],ve:0,Ce:0,je:false},n.G={Se:null,ke:new Map,Pe:0,Ve:0,Ne:0},n.D=new Map,n.y=null,n.x=null,
n.I=0,n.B=0,n.N=null,n.V=1;n.Be=null,n.Ie=null,n.C=function(){},n.M={},o=-4,n.getNextFakeTabId=function(){return o--},
n.b=n.C,n.w=n.C,n.h=null,n.f=function(){return""},n.p=function(){return""},n.i=function(e){return e},n.u=function(){
return null},n.o=null,n.r=null,n.e={Re:"chrome",xe:true,ye:0,
De:n.we?/^https:\/\/(ntp|www)\.msn\.\w+\/(edge|spartan)\/ntp\b/:"chrome-search://local-ntp/local-ntp.html",Ge:false,
He:null,Oe:"",qe:"",GitVer:"3da8b68",Ae:"/lib/injector.js",HelpDialogJS:"/background/help_dialog.js",
Ee:"pages/options.html",Je:"browser",Le:"",Te:"https://github.com/gdh1995/vimium-c",Ue:null,ze:"pages/show.html",Fe:"",
Ke:"/front/vomnibar.js",Qe:""}});