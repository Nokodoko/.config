function t(t){const n={};for(const r of t)for(const t of r.snippetIds)n[t]||(n[t]=[]),n[t].push(r);return n}function n(t,n,r,e){let o=n[t]||[];if(e){const n=e[t];let f=[];n&&(f=r.filter((t=>n.includes(t.id)))),o=o.concat(f);}return o}function r(t){return !!t.label}function e(t){return !!t.teamId}function o(t){return t.filter(r)}function f(t){return t.filter(e)}

export { f, n, o, r, t };
