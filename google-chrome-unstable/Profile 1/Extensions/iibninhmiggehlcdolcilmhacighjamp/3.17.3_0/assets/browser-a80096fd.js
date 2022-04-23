(function () {
	'use strict';

	const importPath = /*@__PURE__*/JSON.parse('"../content-scripts/browser.js"');

	import(chrome.runtime.getURL(importPath));

}());
