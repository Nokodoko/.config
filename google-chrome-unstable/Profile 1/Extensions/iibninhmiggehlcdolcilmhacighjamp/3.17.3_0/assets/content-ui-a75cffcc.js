(function () {
	'use strict';

	const importPath = /*@__PURE__*/JSON.parse('"../content-scripts/content-ui.js"');

	import(chrome.runtime.getURL(importPath));

}());
