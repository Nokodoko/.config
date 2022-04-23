import { a } from '../index-9d8fa28c.js';
import { addToDeconstructorListener as t$1 } from './destroy.js';

async function t(e){if(e)switch(e.action){case"dispatchWindowEvent":!function(e,n){const t=new CustomEvent(e,{detail:n});window.dispatchEvent(t);}(e.eventName,e.detail);}}!async function(){a.browser.runtime.onMessage.addListener(t),t$1((()=>{a.browser.runtime.onMessage.removeListener(t);}));}();
