import { a } from '../index-9d8fa28c.js';

const n=`cleanup_${a.browser.runtime.id}`;function t(e){document.addEventListener(n,e);}document.dispatchEvent(new CustomEvent(n));

export { t as addToDeconstructorListener };
