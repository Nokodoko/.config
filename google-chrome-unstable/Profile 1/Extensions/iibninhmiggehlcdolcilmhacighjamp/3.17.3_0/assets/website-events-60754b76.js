(function () {
	'use strict';

	const importPath = /*@__PURE__*/JSON.parse('"../content-scripts/website-events.js"');

	import(chrome.runtime.getURL(importPath));

}());
