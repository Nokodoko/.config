(function () {
	'use strict';

	const importPath = /*@__PURE__*/JSON.parse('"../content-scripts/site-overrides/linkedin.js"');

	import(chrome.runtime.getURL(importPath));

}());
