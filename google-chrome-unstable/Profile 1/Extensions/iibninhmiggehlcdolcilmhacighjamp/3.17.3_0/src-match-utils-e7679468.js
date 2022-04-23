import { p as pe, o } from './json-rpc-bbea77b7.js';

function t(e,t){const c=e.reduce(((e,r)=>{const c=t(r);return c?.srcSelector?.metadata?.parentSourceId&&e.add(c.srcSelector.metadata.parentSourceId),e}),new Set),n=e.filter((e=>{const r=t(e);return r&&c.has(r.srcSelector.id)}));return o.uniqBy(n.concat(e),(e=>{const r=t(e);return r?[r.label?.id,r.richTextValue].join():e}))}function c(t){const c=o.cloneDeep(t),n=pe();return {...c,id:n,paths:c.paths.map((r=>({...r,id:pe(),sourceId:n})))}}function n(e){const t=o.cloneDeep(e);return {...t,srcSelector:c(t.srcSelector)}}

export { n, t };
