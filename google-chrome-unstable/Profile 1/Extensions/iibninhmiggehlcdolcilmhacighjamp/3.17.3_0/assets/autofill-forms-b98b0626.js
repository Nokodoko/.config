(function () {
	'use strict';

	const importPath = /*@__PURE__*/JSON.parse('"../content-scripts/autofill/autofill-forms.js"');

	import(chrome.runtime.getURL(importPath));

}());
