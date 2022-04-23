import { D, O, g as at, N } from './json-rpc-bbea77b7.js';

function t(){for(var t=[],p=0;p<arguments.length;p++)t[p]=arguments[p];var a=Number.POSITIVE_INFINITY,l=null,s=t[t.length-1];return D(s)?(l=t.pop(),t.length>1&&"number"==typeof t[t.length-1]&&(a=t.pop())):"number"==typeof s&&(a=t.pop()),null===l&&1===t.length&&t[0]instanceof O?t[0]:at(a)(N(t,l))}

export { t };
