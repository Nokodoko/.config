var iframe = document.getElementsByTagName("iframe")[0];
var iframeUrl;
var hashData = null;
var tabId = null;

window.addEventListener("message", onIframeMessage, false);
chrome.runtime.onMessage.addListener(onBackgroundMessage);

chrome.runtime.sendMessage({ type: "getTabId" }, function (info) {
  tabId = info.tabId;
});

// Only send this message once the DOM is loaded, otherwise Chrome
// may cancel the request and leave the user hanging on the loading screen.
window.addEventListener("load", function (e) {
  chrome.runtime.sendMessage({ type: "getParsedData" }, function (parsed) {
    if (parsed && !parsed.error) {
      iframeUrl = parsed.iframeUrl;
      hashData = parsed.data;
      if (parsed.action) {
        iframeUrl += "&action=" + parsed.action;
      }
    } else if (parsed && parsed.error) {
      log("Received parse error", parsed);
      iframeUrl =
        getDefaultPanelUrl() +
        "?parseError=SCRAPE_FAILED&sourceUrl=" +
        parsed.currentUrl;
      hashData = { error: "SCRAPE_FAILED" };
    } else {
      log("Did not receive any parsed data", parsed);
      iframeUrl = getDefaultPanelUrl() + "?parseError=SCRAPE_FAILED";
      hashData = { error: "SCRAPE_FAILED" };
    }
    iframe.src = iframeUrl;
  });
});

function sendIframe(message) {
  iframe.contentWindow.postMessage(message, "*");
}
function sendBackground(message) {
  chrome.runtime.sendMessage(message);
}

// TODO: Ensure that event is coming from our own page
function onIframeMessage(e) {
  if (!e.data) return;
  switch (e.data.type) {
    case "getHashData":
      sendIframe({ type: "hashData", value: hashData });
      return;
    case "newPanel":
    case "profileReady":
    case "setBadge":
    case "togglePanel":
      sendBackground(e.data);
      return;
  }
}

function onBackgroundMessage(message, sender, cb) {
  if (!sender.tab || sender.tab.id !== tabId) return;
  switch (message.type) {
    case "dragStarted":
    case "dragEnded":
    case "dragEnter":
    case "dragDrop":
    case "dragLeave":
    case "dragOver":
      return onDragMessage(message);
  }
}

// Note: Read the comments at the top of dragdrop.js first before reading this.
//
// In Chrome 72+, this iframe (outer iframe) will receive pointer events like drag events,
// even though it's at a lower z-index than the "cover div" on the host page (see dragdrop.js).
// Because of this, we have listeners below on this outer iframe to capture drag events
// over the iframe.
//
// However, now, events come from both from the host page and from this outer iframe. If you
// drag a file from the host page and keep it hovered over the extension iframe, the event order
// looks like this, where it enters this outer iframe before leaving the host page:
//
//   {type: "dragStarted", source: "host-page"}
//   {type: "dragEnter", source: "host-page"}
//   {type: "dragStarted", source: "outer-iframe"}
//   {type: "dragEnter", source: "outer-iframe"}
//   {type: "dragLeave", source: "host-page"}
//   {type: "dragEnded", source: "host-page"}
//
// If we passed these events straight through to the inner iframe, the inner iframe would believe
// that we're no longer dragging, because the last events it gets are dragLeave and dragEnded.
//
// To work around this event ordering, we count up and down as we receive started/ended and
// enter/leave event pairs. We only send events to the inner iframe when we count up from 0,
// or when we count back down to 0.

var dragCounters = {
  started: 0, // dragStarted, dragEnded
  enter: 0, // dragEnter, dragLeave
};

function onDragStateChange(message, counterName, direction) {
  if (direction === "increment") {
    if (dragCounters[counterName] === 0) {
      sendIframe(message);
    }
    dragCounters[counterName]++;
  } else if (direction === "decrement") {
    dragCounters[counterName]--;
    if (dragCounters[counterName] === 0) {
      sendIframe(message);
    }
  }
}

function onDragMessage(message) {
  message.source = message.source || "outer-iframe";
  if (message.type === "dragStarted") {
    onDragStateChange(message, "started", "increment");
  } else if (message.type === "dragEnded") {
    onDragStateChange(message, "started", "decrement");
  } else if (message.type === "dragEnter") {
    onDragStateChange(message, "enter", "increment");
  } else if (message.type === "dragLeave") {
    onDragStateChange(message, "enter", "decrement");
  } else {
    sendIframe(message);
  }
}

// UPDATE 2/13/19: After Chrome updated to version 72, the drag and drop functionality broke in our Lever extension.
// Due to the urgency of getting a fix out, we duplicated functions from dragdrop.js. The duplicated functions
// will be called out below. For reference: https://github.com/lever/hire-chrome/pull/20
// TODO: Find a way to share this code between the inner and outer iframes
//
// Why we need to duplicate code from dragdrop.js:
// 1. The drag events used to go to the cover div in the host page, which has a very high z-index. The host page code
//    in dragdrop.js would then proxy the events to the extension's outer iframe in this file.
//
// 2. The new Chrome behavior is that the drag events go straight to the extension's outer iframe, and don't get
//    noticed by the cover div at all. So we need to also detect many of the same events in the outer iframe here too.
//
// 3. Longer-term, if the new behavior sticks, we could potentially remove the cover div entirely, and a lot of the
//    event handling that's been duplicated into here. But in the shorter term, adoption of new Chrome versions isn't
//    instant, so we need to keep the old way around too.

document.body.addEventListener("dragstart", () =>
  onDragMessage({ type: "dragStarted" })
);
document.body.addEventListener("dragend", () =>
  onDragMessage({ type: "dragEnded" })
);
document.body.addEventListener("dragenter", function (event) {
  event.preventDefault();
  onDragMessage({ type: "dragStarted" });
  onDragMessage({ type: "dragEnter" });
});
document.body.addEventListener("dragover", function (event) {
  event.preventDefault();
});
document.body.addEventListener("dragleave", function (event) {
  onDragMessage({ type: "dragLeave" });
  onDragMessage({ type: "dragEnded" });
});
document.body.addEventListener("drop", handleDrop);

function getDefaultPanelUrl() {
  return LeverOrigin.get() + "/extension/chrome/new/profile";
}

function log() {
  var args = 1 <= arguments.length ? [].slice.call(arguments, 0) : [];
  sendBackground({ type: "log", value: args });
}

// THIS FUNCTION IS COPIED OVER FROM dragdrop.js!
function dataTransferToDataUri(transfer, cb) {
  if (!transfer) {
    return cb(
      new Error(
        "Dropped data was neither a file nor a url and could not be parsed."
      )
    );
  }
  if (transfer.files && transfer.files.length > 0) {
    return blobToDataURL(transfer.files[0], cb);
  }
  var droppedUrl = transfer.getData("URL");
  // If the url is already a data uri, simply continue
  if (droppedUrl.indexOf("data:") == 0) return cb(null, droppedUrl);
  // Otherwise, we retrieve the resource behind the url and convert
  // its contents into a data uri
  var request = new XMLHttpRequest();
  request.open("GET", droppedUrl, true);
  request.responseType = "blob";
  request.onload = function () {
    var blob = request.response;
    if (!blob) return cb(new Error("Error: URL resource could not be found"));
    blobToDataURL(blob, cb);
  };
  request.send();
}

// THIS FUNCTION IS COPIED OVER FROM dragdrop.js!
function blobToDataURL(blob, cb) {
  var reader = new FileReader();
  reader.onload = function () {
    cb(null, reader.result);
  };
  reader.readAsDataURL(blob);
}

// THIS FUNCTION IS COPIED OVER FROM dragdrop.js!
function handleDrop(e) {
  e.preventDefault();
  onDragMessage({ type: "dragLeave" });
  onDragMessage({ type: "dragEnded" });
  dataTransferToDataUri(e.dataTransfer, function (err, dataUri) {
    if (err) {
      console.error(err);
      return alert(
        "Oops, something went wrong. Please contact support@lever.co."
      );
    }
    onDragMessage({ type: "dragDrop", value: dataUri });
  });
}
