// The purpose of this file is to allow dragging and dropping files between
// two iframes with different origins. Chrome does not allow a "drag" that
// starts in Frame A to end in Frame B unless the frames have the same origin.
//
// In order to get around this limitation and enable users to drag a resume/file
// from the page they are browsing (frame A) onto our Lever extension (frame B),
// we must do three things:
//
// 1. Workaround the gnarly drag and drop API to get access to the events we care about
// 2. Proxy the relevant drag and drop events from Frame A to Frame B
// 3. Place an invisible "cover" over Frame B to prevent the drop event landing
//    within Frame B (which would result in Chrome silently swallowing the event).

// Binds the necessary event listeners to the target iframe and the current body.
// Also creates an "invisible" div element that is used to cover the target iframe.
// This div allows us to intercept any drag/drop events that are intended for our
// iframe and proxy them through our background page.
//
// Sends the following events to the background page:
//   'dragStarted' - Fired when a drag starts anywhere on the main page
//   'dragEnded' - Fired when a drag ends anywhere on the main page or over the iframe
//   'dragEnter' - Fired when a drag enters the target iframe
//   'dragLeave' - Fired when a drag leaves the target iframe
//   'dragDrop' - Fired when an item is dropped onto the iframe
//
// @param iframe [String] An iframe dom element
function CrossDomainDragAndDrop(iframe) {
  // We've already been created for this iframe, return it instead.
  if (iframe._CrossDomainDragAndDrop) {
    return iframe._CrossDomainDragAndDrop
  }
  iframe._CrossDomainDragAndDrop = this
  this.iframe = iframe
  this.parent = iframe.parentNode
  this.createCoverElement()
  this.addListenersToCoverElement()
  this.addListenersToBody()
}

// Create an invisible div that we place over the iframe.
CrossDomainDragAndDrop.prototype.createCoverElement = function() {
  this.coverDiv = document.createElement('div');
  this.coverDiv.style.position = 'fixed';
  // TODO: Calculate the following dynamically, based on the frame element
  // Currently, this will only work if the frame is positioned exactly under
  // cover div as defined below. The position of the frame itself is defined
  // by panel.html
  this.coverDiv.style.top = 0
  this.coverDiv.style.right = 0
  this.coverDiv.style.width = '402px'
  this.coverDiv.style.height = '100%'
  this.coverDiv.style.zIndex = 2147483647
  // Setting the background to transparent seems to allow
  // pointer events to passthrough the coverDiv. We need to avoid
  // this since if the mouse events passthrough the cover, they will
  // end up being captured by the iFrame itself. This sounds good, but
  // its actually bad because Chrome doesn't support drag events that
  // originate in one frame to terminate in another frame (with a different domain).
  this.coverDiv.style.background = 'white'
  this.coverDiv.style.opacity = 0.001
  this.coverDiv.style.display = 'none'
  this.parent.appendChild(this.coverDiv);
};

CrossDomainDragAndDrop.prototype.showCoverDiv = function() {
  this.coverDiv.style.display = 'block'
}

CrossDomainDragAndDrop.prototype.hideCoverDiv = function() {
  this.coverDiv.style.display = 'none'
}

// handle drag events on our coverDiv and proxy the
// events to our panel iframe via our background page
// NOTE: You must preventDefault() on dragenter and dragover
// to ensure the element appears droppable
CrossDomainDragAndDrop.prototype.addListenersToCoverElement = function() {
  this.coverDiv.addEventListener('dragenter', function(e) {
    e.preventDefault();
    sendEventToPanel('dragEnter')
  });
  this.coverDiv.addEventListener('dragover', function(e) {
    e.preventDefault();
  });
  this.coverDiv.addEventListener('dragleave', function() {
    sendEventToPanel('dragLeave')
  });
  this.coverDiv.addEventListener('drop', this.handleDrop);
}

CrossDomainDragAndDrop.prototype.handleDrop = function(e) {
  e.preventDefault();
  dataTransferToDataUri(e.dataTransfer, function(err, dataUri) {
    if (err) {
      console.error(err)
      return alert('Oops, something went wrong. Please contact support@lever.co.')
    }
    sendEventToPanel('dragDrop', dataUri)
  })
}

// We want to disable pointer events on all iframes except our own.
// If we don't do this and a user drags an element over an ad's iframe,
// the ad will end up capturing the subsequent drag events, thus
// preventing us from handling them. By ensuring all other iframes
// ignore pointer events, we avoid this issue
CrossDomainDragAndDrop.prototype.suppressOtherIframes = function() {
  self = this
  Array.from(document.querySelectorAll('iframe')).forEach(function (frame) {
    // Return if its ourselves
    if (frame == self.iframe) return
    // Return if its another XDomainDnd iframe
    if (frame._CrossDomainDragAndDrop) return
    // Store the original pointer-events value so we can reset it later
    if (frame.originalPointerEventsStyle == null) {
      frame.originalPointerEventsStyle = frame.style.pointerEvents
    }
    frame.style.pointerEvents = 'none'
  });
}

CrossDomainDragAndDrop.prototype.resetOtherIframes = function() {
  self = this
  Array.from(document.querySelectorAll('iframe')).forEach(function (frame) {
    // Return if its ourselves
    if (frame == self.iframe) return
    // Return if its another CrossDomainDragAndDrop iframe
    if (frame._CrossDomainDragAndDrop) return
    // Return if we've never suppressed this iframe
    if (frame.originalPointerEventsStyle == null) return
    frame.style.pointerEvents = frame.originalPointerEventsStyle
  });
}

CrossDomainDragAndDrop.prototype.addListenersToBody = function() {
  var self = this
  var showDrag = false
  var timeout = -1
  var dragCount = 0

  function onDragStart() {
    sendEventToPanel('dragStarted')
    if (!isFrameOpen(self.iframe)) return;
    self.suppressOtherIframes()
    self.showCoverDiv()
    return true
  }
  function onDragEnd() {
    sendEventToPanel('dragEnded')
    self.resetOtherIframes()
    self.hideCoverDiv()
    return true
  }
  function onDragEnter() {
    if (dragCount === 0) onDragStart()
    dragCount++;
    showDrag = true;
  }
  function onDragOver() {
    showDrag = true
  }
  function onDragLeave(e) {
    showDrag = false;
    dragCount--;
    clearTimeout(timeout);
    if (dragCount === 0) return onDragEnd()
    // Add timeout to catch edge cases when dragCount
    // is > 0 but the drag has actually ended.
    timeout = setTimeout(function(){
      if (!showDrag) {
        onDragEnd();
      }
    }, 100);
  }
  // Ignore drop events that occur on the body. We are only
  // interested in drop events that occur on our coverDiv
  function onDrop() {
    dragCount = 0;
    onDragEnd();
  }

  document.body.addEventListener('dragstart', onDragStart);
  document.body.addEventListener('dragend', onDragEnd);
  document.body.addEventListener('dragenter', onDragEnter);
  document.body.addEventListener('dragover', onDragOver);
  document.body.addEventListener('dragleave', onDragLeave);
  document.body.addEventListener('drop', onDrop);
}

// Sends the event to the hire2 iframe defined within panel.html.
// In order to communicate with that iframe, we must send the event
// through our background page. panel.js then listeners for these
// messages and sends them through to the iframe via window.postMessage.
function sendEventToPanel(type, content) {
  chrome.runtime.sendMessage({type: type, value: content, source: 'host-page'})
}

// Converts a DataTransfer object into a data url. If the DataTransfer
// object points to a url, we retrieve the resource and convert its contents
// into a data uri.
//
// @param transfer [DataTransfer] https://developer.mozilla.org/en-US/docs/Web/API/DataTransfer
// @callback(err, dataUrl)
function dataTransferToDataUri(transfer, cb) {
  if (!transfer) {
    return cb(new Error('Dropped data was neither a file nor a url and could not be parsed.'))
  }
  if (transfer.files && transfer.files.length > 0) {
    return blobToDataURL(transfer.files[0], cb);
  }
  var droppedUrl = transfer.getData('URL')
  // If the url is already a data uri, simply continue
  if (droppedUrl.indexOf('data:') == 0) return cb(null, droppedUrl);
  // Otherwise, we retrieve the resource behind the url and convert
  // its contents into a data uri
  var request = new XMLHttpRequest()
  request.open('GET', droppedUrl, true)
  request.responseType = 'blob'
  request.onload = function() {
    var blob = request.response
    if (!blob) return cb(new Error('Error: URL resource could not be found'))
    blobToDataURL(blob, cb)
  }
  request.send()
}

function blobToDataURL(blob, cb) {
  var reader = new FileReader()
  reader.onload = function() { cb(null, reader.result) }
  reader.readAsDataURL(blob)
}
