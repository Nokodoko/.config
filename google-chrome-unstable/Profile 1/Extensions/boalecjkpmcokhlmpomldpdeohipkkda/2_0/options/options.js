const input = document.querySelector("input");
input.disabled = true;

chrome.permissions.contains({permissions: ["tabs"]}, granted => {
	input.checked = granted;
	input.disabled = false;
});

input.addEventListener("click", function() {
	input.disabled = true;
	if(this.checked) {
		chrome.permissions.request({permissions: ["tabs"]}, granted => {
			input.checked = granted;
			input.disabled = false;
		});
	} else {
		chrome.permissions.remove({permissions: ["tabs"]}, removed => {
			input.checked = !removed;
			input.disabled = false;
		});
	}
});

const a = document.querySelector("a");
a.addEventListener("click", () => {
	chrome.tabs.query({currentWindow: true, active: true}, tabs => {
		chrome.tabs.update(tabs[0].id, {
			url: `${a.href}#command-${chrome.runtime.id}-open-extensions-page`
		});
	});
});
