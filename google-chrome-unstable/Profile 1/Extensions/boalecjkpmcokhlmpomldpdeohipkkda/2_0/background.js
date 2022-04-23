const extensionsURL = "chrome://extensions";

function isDisposable(tab) {
	return tab && tab.url === "chrome://newtab/";
}

function getLastFocusedTabs() {
	return new Promise((resolve, reject) => {
		chrome.permissions.contains({permissions: ["tabs"]}, granted => {
			if(!granted) {
				return reject("permission-not-granted");
			}
			chrome.windows.getLastFocused({
				populate: true,
				windowTypes: ["normal"]
			}, lastFocused => {
				if(!lastFocused) {
					return reject("none-found");
				}
				return resolve(lastFocused.tabs);
			});
		});
	});
}

function createExtensionsTab() {
	chrome.tabs.create({url: extensionsURL}, ({windowId}) => {
		chrome.windows.update(windowId, {focused: true});
	});
}

function focusWindow(id) {
	chrome.windows.update(id, {focused: true});
}

function setToExtensionsPage({id, windowId}) {
	chrome.tabs.update(id, {url: extensionsURL});
	focusWindow(windowId);
}

function setActive({id, windowId}) {
	chrome.tabs.update(id, {active: true});
	focusWindow(windowId);
}

function actionFrom(tabs) {
	return new Promise((resolve, reject) => {
		const active = tabs.find(({active}) => active);
		const existing = tabs.find(({url}) => url.startsWith(extensionsURL));
		if(existing) {
			setActive(existing);
		} else if(isDisposable(active)) {
			setToExtensionsPage(active);
		} else {
			reject("no-tabs-found");
		}
	});
}

chrome.commands.onCommand.addListener(() => {
	// Can't query for the URL directly because it is considered malformed
	getLastFocusedTabs()
	.then(actionFrom)
	.catch(createExtensionsTab);
});

chrome.runtime.onInstalled.addListener(({reason}) => {
	if(reason === "install") {
		chrome.runtime.openOptionsPage();
	}
});
