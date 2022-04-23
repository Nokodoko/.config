(function () {
	'use strict';

	const importPath = /*@__PURE__*/JSON.parse('"../content-scripts/template-source.js"');

	import(chrome.runtime.getURL(importPath));

}());
