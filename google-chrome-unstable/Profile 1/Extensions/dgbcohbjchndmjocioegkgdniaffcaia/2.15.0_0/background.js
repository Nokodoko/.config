// Scripts are cached in memory in the background page
var routes = [];
var contentScripts = {};
var loaded = null;
// Map of tabId -> panelUrl
var PARSED_TABS = {};
// Check for updates a maximum of once a minute, when the user navigates
var UPDATE_INTERVAL = 1 * 60 * 1000;
var lastUpdatedAt = 0;

// initialize badge;
initializeBadge();
bindBadgeListener();

LeverOrigin.setFromTabs();

// Load scripts from the server when the extension first loads
loadScripts();
checkAccountFlags(function (err, shouldRefresh) {
  if (err) return console.error("Error while checking account flags", err);
  if (!shouldRefresh) return;
  reset();
  chrome.runtime.reload();
});

// Bind navigation handlers
chrome.webNavigation.onCommitted.addListener(
  onNavigate.bind(null, "onCommitted")
);
chrome.webNavigation.onTabReplaced.addListener(
  onNavigate.bind(null, "onTabReplaced")
);
chrome.webNavigation.onHistoryStateUpdated.addListener(
  onNavigate.bind(null, "onHistoryStateUpdated")
);
chrome.webNavigation.onReferenceFragmentUpdated.addListener(
  onNavigate.bind(null, "onReferenceFragmentUpdated")
);

chrome.webNavigation.onBeforeNavigate.addListener(function (details) {
  // Don't check any more frequently than once every five seconds
  if (details.timeStamp < lastUpdatedAt + UPDATE_INTERVAL) return;
  lastUpdatedAt = details.timeStamp;
  // Load the latest scripts from the server, and reload the navigating
  // tab if they have changed
  loadScripts(function (err, isUpdated) {
    if (!isUpdated) return;
    chrome.tabs.reload(details.tabId);
  });

  checkAccountFlags(function (err, shouldRefresh) {
    if (err) return console.error("Error while checking account flags", err);
    if (!shouldRefresh) return;
    reset();
  });
});

chrome.runtime.onMessage.addListener(function (message, sender, cb) {
  if (!(sender && sender.tab)) return;
  var tabId = sender.tab.id;
  if (!tabId) throw new Error("Expected tabId");
  LeverOrigin.set(CURRENT_URLS[tabId]);
  switch (message.type) {
    // TODO: Change name from setPopup
    case "setPopup":
      if (typeof message.value !== "string") return;
      var parsed = JSON.parse(decodeURIComponent(message.value));
      PARSED_TABS[tabId] = parsed;
      WaitingForParsedData.drain(tabId);
      var profile = parsed.data;
      if (SiteConf.isMatchEnabled(CURRENT_URLS[tabId])) {
        setAction(profile, tabId);
      }
      return;
    case "toggleToast":
      toggleToast(null, tabId);
      return;
    case "getTabId":
      cb({ tabId: tabId });
      return;
    case "getParsedData":
      if (PARSED_TABS[tabId]) {
        cb(PARSED_TABS[tabId]);
      } else {
        // If the parsed data has not been returned by the content script yet,
        // add the callback
        WaitingForParsedData.add(tabId, cb);
      }
      // Returning true tells Chrome that the callback will be called
      // in the future. If true is not returned from this listener,
      // Chrome will close the communication channel between the
      // backround page and the "sender" and the callback will no-op.
      return true;
    case "disableCurrentSite":
      SiteConf.disableToastForUrl(CURRENT_URLS[tabId]);
      return;
    case "getLeverOrigin":
      cb(getLeverOrigin());
      return;
    case "newPanel":
    case "profileReady":
    case "toggleHideDialogue":
    case "togglePanel":
      chrome.tabs.sendMessage(tabId, message);
      return;
    case "log":
      console.log.apply(
        console,
        ["tabId:", tabId, " -> "].concat(message.value)
      );
      return;
  }
});

// WaitingForParsed data is a singleton that is meant to
// simply hold waiting callbacks. This is needed when
// we are trying to respond to the getParsedData event
// from panel.js before our content script has had a chance
// to return the parsed data.
var WaitingForParsedData = (function () {
  var callbacks = {};

  function add(tabId, cb) {
    if (!tabId && cb) return;
    var pending = { cb: cb, timeout: -1 };
    pending.timeout = setTimeout(function () {
      var payload = PARSED_TABS[tabId] || {
        error: "NO_PARSED_DATA",
        currentUrl: CURRENT_URLS[tabId],
      };
      cb(payload);
      var pendingIndex = callbacks[tabId].indexOf(pending);
      if (pendingIndex > -1) callbacks[tabId].splice(pendingIndex, 1);
    }, 15000);
    callbacks[tabId] = callbacks[tabId] || [];
    callbacks[tabId].push(pending);
  }

  function drain(tabId) {
    var pendingCallbacks = callbacks[tabId];
    if (!pendingCallbacks) return;
    pendingCallbacks.forEach(function (pending) {
      pending.cb(PARSED_TABS[tabId]);
      if (pending.timeout) clearTimeout(pending.timeout);
    });
    reset(tabId);
  }

  function reset(tabId) {
    if (!tabId) return;
    callbacks[tabId] = [];
  }

  return {
    add: add,
    drain: drain,
    reset: reset,
    _callbacks: callbacks,
  };
})();

function initializeBadge(tabId) {
  var details = {};
  // if a tabId is provided, run set the badge for this tab
  if (tabId != null) details.tabId = tabId;
  details.path = {
    19: "icons/lever-chrome-icon-dark-19.png",
    38: "icons/lever-chrome-icon-dark-38.png",
  };
  chrome.browserAction.setIcon(details);
}

function bindBadgeListener() {
  // toggle the side panel whenever the browser action is clicked
  chrome.browserAction.onClicked.addListener(function (e) {
    sendMessageToActiveTab({ type: "togglePanel" });
  });
}

function reset() {
  for (tabId in CURRENT_URLS) {
    chrome.tabs.reload(+tabId);
  }
}

// Update the cache of scripts that get injected on navigation
function setup(options) {
  contentScripts = options.contentScripts;
  routes = options.contentRoutes.map(function (item) {
    return [new RegExp(item[0]), item[1], item[2]];
  });
}

function loadScripts(cb) {
  var origin = getLeverOrigin();
  request(origin + "/extension/chrome/bundle.json", function (err, bundle) {
    if (err) return cb && cb(err);
    if (loaded === bundle) return cb && cb(null, false);
    loaded = bundle;
    setup(JSON.parse(bundle));
    cb && cb(null, true);
  });
}

function checkAccountFlags(cb) {
  var origin = getLeverOrigin();
  request(origin + "/extension/api/flags", function (err, body) {
    if (err) return cb && cb(err);
    try {
      var flags = JSON.parse(body).flags;
    } catch (e) {
      return (
        cb && cb("Response could not be parsed as JSON. Probably logged out.")
      );
    }
    // Assign LEVER_DISABLE_PRELOAD
    if (flags.disableExtensionPreload != null) {
      localStorage.LEVER_DISABLE_PRELOAD = flags.disableExtensionPreload;
    }
  });
}

// AJAX get request
function request(url, cb) {
  var xhr = new XMLHttpRequest();
  xhr.open("GET", url, true);
  xhr.onreadystatechange = function () {
    if (xhr.readyState !== 4) return;
    if (xhr.status !== 200)
      return cb({ statusCode: xhr.status, message: xhr.statusText });
    cb(null, xhr.responseText);
  };
  xhr.send();
}

// AJAX Response helper
function parseResponse(err, data) {
  if (err) {
    return console.error("Error making request", err);
  } else if (typeof data !== "string") {
    return console.warn("Request got an empty response", data);
  }
  try {
    var parsed = JSON.parse(data);
  } catch (e) {
    return console.error("Error parsing response. Probably logged out.");
  }
  return parsed;
}

// Map of tabId -> url of current tab
var CURRENT_URLS = {};
function onNavigate(eventName, details) {
  // frameId will always be 0 for the root frame and we only care about the events
  // related to the root frame.
  if (details.frameId !== 0 || !details.url) return;
  // Sometimes the history state event will fire soon after the initial page load
  // with the same url (e.g Facebook). We want to ignore this particular case.
  if (
    eventName == "onHistoryStateUpdated" &&
    CURRENT_URLS[details.tabId] == details.url
  )
    return;
  chrome.tabs.sendMessage(details.tabId, { type: "reset" });
  for (var i = 0, len = routes.length; i < len; i++) {
    var route = routes[i];
    if (
      details.transitionType == "auto_subframe" ||
      !route[0].test(details.url)
    )
      continue;
    if (details.tabId) {
      // Store the current url for the tab
      CURRENT_URLS[details.tabId] = details.url;
      // Delete any of the data we had scraped for this tab
      delete PARSED_TABS[details.tabId];
      // Clear any waiting callbacks
      WaitingForParsedData.reset(details.tabId);
      // reset the badge state for this tab
      initializeBadge(details.tabId);
      // inject the scraping content script for the tab
      injectContentScript(details.tabId, route[1], route[2]);
    }
    break;
  }
}

// Inject applicable cached scripts immediately as the user navigates
function injectContentScript(tabId, scriptName, options) {
  if (options && options.jQuery) {
    chrome.tabs.executeScript(tabId, {
      file: "lib/jquery-1.9.1.min.js",
      runAt: "document_start",
    });
  }
  chrome.tabs.executeScript(tabId, {
    code: contentScripts[scriptName],
    runAt: "document_start",
  });
}

function setAction(extracted, tabId) {
  if (!extracted)
    return console.error("Extracted data not provided to setAction");
  var query = {
    publicProfileUrl: extracted.publicProfileUrl,
    name: extracted.names && extracted.names[0] && extracted.names[0].value,
    email: extracted.emails && extracted.emails[0] && extracted.emails[0].value,
    gmailThreadId: extracted.gmailThreadId,
  };
  var url = getLeverOrigin() + "/extension/api/match?" + stringifyQuery(query);
  request(url, function (err, data) {
    var response = parseResponse(err, data);
    if (response) handleResponse(response);
  });

  function handleResponse(response) {
    if (response.error && response.error == "no access as interviewer") {
      refer();
    } else if (response.match) {
      match();
    } else if (response.searchTotal > 0) {
      link();
    } else if (response.searchTotal === 0) {
      create();
    } else {
      return console.warn(
        "Profile Query returned an unexpected response",
        response,
        url
      );
    }
  }

  function refer() {
    PARSED_TABS[tabId].action = "refer";
    setReferBadge(tabId);
    if (query.name || query.gmailThreadId) toggleToast(tabId);
  }
  function match() {
    PARSED_TABS[tabId].action = "match";
    setMatchBadge(tabId);
    toggleToast(tabId);
  }
  function link() {
    PARSED_TABS[tabId].action = "link";
    setLinkBadge(tabId);
    toggleToast(tabId);
  }
  function create() {
    PARSED_TABS[tabId].action = "create";
    // only show the create toast if we were able to parse out a name
    setCreateBadge(tabId);
    if (query.name || query.gmailThreadId) toggleToast(tabId);
  }
}

function setCreateBadge(tabId) {
  chrome.browserAction.setTitle({ title: "Create candidate", tabId: tabId });
}

function setLinkBadge(tabId) {
  chrome.browserAction.setTitle({ title: "Link candidate", tabId: tabId });
}

function setReferBadge(tabId) {
  chrome.browserAction.setTitle({ title: "Refer candidate", tabId: tabId });
}

function setMatchBadge(tabId) {
  chrome.browserAction.setTitle({
    title: "Open candidate in Lever",
    tabId: tabId,
  });
  chrome.browserAction.setIcon({
    path: {
      19: "icons/lever-blue-icon-19.png",
      38: "icons/lever-blue-icon-38.png",
    },
    tabId: tabId,
  });
}

function toggleToast(action, tabId) {
  if (arguments.length == 1) {
    tabId = action;
    action = PARSED_TABS[tabId].action;
  }
  var message = {
    type: "toggleToast",
    value: action,
    // NOTE: shouldPreload is a temporary flag that controls whether the extension
    // should preload the profile. Implemented incase the additional load of
    // open pages results in degraded app performance.
    shouldPreload: localStorage.LEVER_DISABLE_PRELOAD !== "true",
    shouldDisplayToast: SiteConf.isToastEnabled(CURRENT_URLS[tabId]),
  };
  // HACK: Disable the create toast for gmail until we get the flow correct
  var isGmail =
    SiteConf._findSiteByDomain(CURRENT_URLS[tabId]).domain ===
    "mail.google.com";
  if (isGmail && ["create", "refer"].includes(action)) {
    message.shouldDisplayToast = false;
  }
  chrome.tabs.sendMessage(tabId, message);
}

function sendMessageToActiveTab(message) {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    if (!tabs || !tabs[0]) return;
    chrome.tabs.sendMessage(tabs[0].id, message);
  });
}

function getLeverOrigin() {
  return LeverOrigin.get();
}

// Taken from: https://github.com/sindresorhus/query-string
function stringifyQuery(obj) {
  function strictUriEncode(str) {
    return encodeURIComponent(str).replace(/[!'()*]/g, function (c) {
      return "%" + c.charCodeAt(0).toString(16).toUpperCase();
    });
  }
  return obj
    ? Object.keys(obj)
        .sort()
        .map(function (key) {
          var val = obj[key];
          if (val === undefined) {
            return "";
          }
          if (val === null) {
            return key;
          }
          if (Array.isArray(val)) {
            var result = [];
            val
              .slice()
              .sort()
              .forEach(function (val2) {
                if (val2 === undefined) {
                  return;
                }
                if (val2 === null) {
                  result.push(strictUriEncode(key));
                } else {
                  result.push(
                    strictUriEncode(key) + "=" + strictUriEncode(val2)
                  );
                }
              });
            return result.join("&");
          }
          return strictUriEncode(key) + "=" + strictUriEncode(val);
        })
        .filter(function (x) {
          return x.length > 0;
        })
        .join("&")
    : "";
}
