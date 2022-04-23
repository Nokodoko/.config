import { a } from './index-9d8fa28c.js';
import { U as Un, X as Xn, r, Q as Qn } from './json-rpc-bbea77b7.js';

const n="SID";function i(t){return Qn("authCookieBackup",t)}function s(e){const{name:a$1,value:r$1,domain:n,path:i,secure:s,httpOnly:c,sameSite:u,expirationDate:p,storeId:h}=e,m={url:`https://${e.domain}`,name:a$1,value:r$1,domain:n,path:i,secure:s,httpOnly:c,sameSite:u,expirationDate:p,storeId:h};return r.info("Restoring auth. cookie"),a.browser.cookies.set(m)}const c=(async()=>{try{if(!await a.browser.cookies.get({url:Un,name:"SID"}))try{const t=await Xn("authCookieBackup");t&&await s(t);}catch(t){r.error(t);}}catch(t){r.error("Cannot check if an existing auth. cookie is present",t);}})();a.browser.runtime.onStartup.addListener((async function(){try{const a$1=await a.browser.cookies.get({url:Un,name:"SID"});a$1&&i(a$1);}catch(t){r.error("Cannot backup auth. cookie:",t);}}));

export { c as AUTH_COOKIE_RESTORE_PROMISE, n as SESSION_COOKIE_NAME, i as backupAuthCookie, s as restoreAuthCookie };
