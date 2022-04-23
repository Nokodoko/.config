(function () {
	'use strict';

	const importPath = /*@__PURE__*/JSON.parse('"../content-scripts/destroy.js"');

	import(chrome.runtime.getURL(importPath));

}());
