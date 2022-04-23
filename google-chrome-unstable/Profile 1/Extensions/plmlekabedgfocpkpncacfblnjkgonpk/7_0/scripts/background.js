function GreenhouseTab(tabId) {
  var visible = false,
      formData = null,
      stickyData = {},
      stickyFields = ['prospective_department_id', 'prospective_seniority_id', 'prospective_hiring_plan_ids[]'],
      expanded = false;

  function isVisible() {
    return visible;
  }

  function toggleSidebar() {
    if (visible) {
      hide();
    } else {
      show();
    }
  }

  function show() {
    visible = true;
    chrome.browserAction.setBadgeText({ tabId: tabId, text: badgeText() });
    sendMessage(tabId, { show: getHostname() })
  }

  function hide() {
    visible = false;
    chrome.browserAction.setBadgeText({ tabId: tabId, text: '' });
    sendMessage(tabId, { hide: true })
  }

  function receiveMessage(msg) {
    if (msg.save) {
      saveFormData(msg.save);
    } else if (msg.post) {
      postToGreenhouse(msg.post, msg.isMerge);
    } else if (msg.send) {
      sendFormData();
      resize();
    } else if (msg.clear) {
      clearFormData();
    } else if (msg.hide) {
      hide();
    } else if (msg.toggle) {
      expanded = !expanded;
      resize();
    } else if (msg.lastVisitedSubdomain) {
      storeLastVisitedSubdomain(msg.lastVisitedSubdomain);
    }
  }

  function postToGreenhouse(url, isMerge) {
    $.ajax({
      type: "POST",
      url: url,
      data: {
        version: chrome.runtime.getManifest().version
      },
      success: function(response) {
        sendMessage(tabId, { confirmation: response, isMerge: isMerge });
      },
      error: function() {
        sendMessage(tabId, { duplicateError: true });
      },
      dataType: 'json'
    });
  }

  function storeLastVisitedSubdomain(lastVisitedSubdomain) {
    if (subdomain() !== lastVisitedSubdomain) {
      localStorage['greenhouse_subdomain'] = lastVisitedSubdomain;
    }
  }

  function saveFormData(data) {
    formData = data;
    for (var i = 0; i < stickyFields.length; i++) {
      var stickyField = stickyFields[i],
          stickyValue = data[stickyField];

      if (typeof stickyValue !== 'undefined') {
        stickyData[stickyField] = stickyValue;
      }
    }
  }

  function clearFormData() {
    /* Don't clear sticky data */
    formData = null;
  }

  function resize() {
    if (expanded) {
      sendMessage(tabId, { expand: true });
    } else {
      sendMessage(tabId, { shrink: true });
    }
  }

  function sendFormData() {
    var dataWithStickyValues = $.extend(null, stickyData, formData);
    sendMessage(tabId, { restore: dataWithStickyValues });
  }

  function badgeText() {
    var hostname = getHostname();
    if (hostname.indexOf('localhost-app') >= 0) {
      return 'LCL';
    } else if (hostname.indexOf('dev-app') >= 0 || hostname.indexOf('app.dev') >= 0) {
      return 'DEV'
    } else if (hostname.indexOf('uat-app') >= 0) {
      return 'UAT';
    } else {
      return '';
    }
  }

  function getHostname() {
    return subdomain() + '.greenhouse.io';
  }

  function subdomain() {
    return localStorage['greenhouse_subdomain'] || 'app';
  }

  return {
    isVisible: isVisible,
    toggleSidebar: toggleSidebar,
    show: show,
    receiveMessage: receiveMessage
  }
}

function TabManager() {
  var KNOWN_TABS = {};

  function tabFor(tabId, callback) {
    if (!tabId || tabId < 0) {
      return;
    }

    var greenhouseTab = KNOWN_TABS[tabId];

    if (!greenhouseTab) {
      greenhouseTab = GreenhouseTab(tabId);
      KNOWN_TABS[tabId] = greenhouseTab;
    }

    callback(greenhouseTab);
  }

  return {
    tabFor: tabFor
  };

}

var tabManager = TabManager();

messageHandler().addListener(function(msg, sender) {
  if (msg.config) {
    chrome.tabs.create({ 'url': chrome.extension.getURL('/views/options.html') });
  } else {
    tabManager.tabFor(sender.tab.id, function (greenhouseTab) {
      greenhouseTab.receiveMessage(msg);
    });
  }
});

// When the plugin button is clicked, load the css/js and then toggle the extension
chrome.browserAction.onClicked.addListener(function(tab) {
  injectAssets(function() {
    tabManager.tabFor(tab.id, function (greenhouseTab) {
      greenhouseTab.toggleSidebar();
    });
  });
});

/*
Listener when the page/url is changing so will need to show the extension again if it was opened
Without the all_url permission, you are unable to send the page a message without clicking on the button
So it is not possible to show the bar without the permission on
 */
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo) {
  // This listener gets called a few times. We only want to send a message to the page
  // when it's done loading so it can pick up the message
  if (changeInfo.status !== 'complete') {
    return;
  }

  injectAssets(function() {
    tabManager.tabFor(tabId, function (greenhouseTab) {
      if (greenhouseTab.isVisible()) {
        // Unless the user grants the extension all access via the "<all_urls>" permission,
        // the extension will stop working once the user navigates away from the current page.
        chrome.permissions.contains({ origins: ["<all_urls>"] }, function(result) {
          if (result) {
            greenhouseTab.show();
          } else {
            greenhouseTab.toggleSidebar();
          }
        });
      }
    });
  });
});

chrome.webRequest.onBeforeSendHeaders.addListener(
  fingerprint,
  { urls: ['<all_urls>'] },
  ['requestHeaders', 'blocking']
);

/*
This is set from the options page to update the permission preference
 */
chrome.extension.onRequest.addListener(function(request) {
  if (request.permission) {
    chrome.permissions.request({ origins: ["<all_urls>"] });
  } else {
    chrome.permissions.remove({ origins: ["<all_urls>"] });
  }
});

/*
 Before, we loaded this in the content_scripts in the manifest but that needs the <all_urls> permission
 So we have to load the css/js when you do any action
 */
function injectAssets(callback) {
  chrome.tabs.insertCSS(null, { file: 'stylesheets/sidebar.css' });

  chrome.tabs.executeScript(null, { file: 'scripts/jquery-3.4.1.min.js' }, function() {
    chrome.tabs.executeScript(null, { file: 'scripts/content_script_main_page.js' }, function() {
      callback();
    });
  });
}

/*
Sets the header when talking to Greenhouse server. Look at Controller::PluginsHelper
 */
function fingerprint(details) {
  tabManager.tabFor(details.tabId, function(greenhouseTab) {
    if (greenhouseTab.isVisible()) {
      details.requestHeaders.push({
        name: 'Greenhouse-Plugin',
        value: 'PROSPECTING ' + chrome.runtime.getManifest().version
      });
    }
  });

  return { requestHeaders: details.requestHeaders };
}

function sendMessage(tabId, msg) {
  chrome.tabs.sendMessage(tabId, msg);
}

function messageHandler() {
  return chrome.runtime.onMessage;
}
