var toast = document.getElementById('toast-content')
var iconSrc = chrome.runtime.getURL('icons/lever-chrome-icon-light-48.png');

// We get the action type from the query params
// It comes in as "#match" so we take off the first character
var action = window.location.hash
action = action.slice(1)
toast.innerHTML = renderToast({
  imgSrc: iconSrc,
  action: action
});

toast.onclick = function(e) {
  e.preventDefault();
  sendBackground({type: 'togglePanel'})
};

toast.querySelector('a.l-close').onclick = function(e) {
  e.preventDefault();
  e.stopPropagation();
  toggleHideDialogue();
  sendBackground({type: 'toggleHideDialogue'})
}

function toggleHideDialogue() {
  toast.innerHTML = renderToast({
    imgSrc: iconSrc,
    action: 'toggle-hide-dialogue'
  });
  //reset click handlers
  toast.onclick = function(e) {
    e.preventDefault();
  }

  toast.querySelector('a.l-close').onclick = function(e) {
    e.preventDefault();
    e.stopPropagation();
    sendBackground({type: 'toggleToast'})
  }

  toast.querySelector('a.l-hide-forever').onclick = function(e) {
    e.preventDefault();
    e.stopPropagation();
    clearTimeout(delay);
    sendBackground({type: 'disableCurrentSite'});
    toast.innerHTML = renderToast({
      imgSrc: iconSrc,
      action: 'confirm-hide'
    });
    setTimeout(function() {
      sendBackground({type: 'toggleToast'})
    }, 1000)
  }

  var delay = setTimeout(function() {
    sendBackground({type: 'toggleToast'})
  }, 6000)
}

function getActionText(action) {
  if (action === 'match') return 'Open';
  if (action === 'link') return 'Add link?';
  if (action === 'create') return 'Create';
  if (action === 'refer') return 'Refer';
}

function renderToast(ctx) {
  actionText = getActionText(ctx.action)
  var actionLink;
  if (ctx.action === 'create' || ctx.action === 'refer')
    actionLink = `<button>${actionText}</button>`
  else if (ctx.action === 'toggle-hide-dialogue')
    actionLink = "<span>We'll get out of the way!</span><a class='l-hide-forever'>Never show on this site</a>"
  else if (ctx.action === 'confirm-hide')
    actionLink = `<span>Got it!</span>`
  else
    actionLink = `<span>${actionText}</span>`

  var toastSrc = `
    <div class="lever-hire-toast ${ctx.action}">
      <div>
        <div class="l-action ${ctx.action}">${actionLink}</div>
        <img src="${ctx.imgSrc}">
      </div>
      <a class="l-close">&times;</a>
    </div>
  `
  return toastSrc
}

function sendBackground(message) {
  chrome.runtime.sendMessage(message);
}
