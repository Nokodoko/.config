// Saves new whitelist item to chrome.storage.sync.
function addToWhitelist() {
  var domain = document.getElementById('new-item').value;
  SiteConf.add(domain, 'enabled', function(err) {
    if (err) {
      setStatus(err);
    } else {
      renderOptions();
    }
  });
}

// Set status message in options window
function setStatus(msg) {
  document.getElementById('status').innerText = msg
  setTimeout(function() {
    document.getElementById('status').innerText = ''
  }, 1500)
}

// Restores the current options to the default
function setDefaultOptions() {
  SiteConf.setToDefault(function() {
    renderOptions();
  });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function renderOptions() {
  // Use default value color = 'red' and likesColor = true.
  chrome.storage.sync.get({
    siteConf: SiteConf.DEFAULT_LIST
  }, function(result) {
    sites = result.siteConf;
    if (!sites) return;
    var optionsList = []
    sites.forEach(function(site) {
      // duck typing
      var dom = `
        <tr>
          <td>${site.domain}</td>
          <td><input class="site" type="radio" ${site.mode == 'enabled' ? 'checked' : ''} name="${site.domain}" value="enabled"></td>
          <td><input class="site" type="radio" ${site.mode == 'matchOnly' ? 'checked' : ''} name="${site.domain}" value="matchOnly"></td>
          <td><input class="site" type="radio" ${site.mode == 'disabled' ? 'checked' : ''} name="${site.domain}" value="disabled"></td>
        </tr>
      `
      optionsList.push(dom);
    });
    document.getElementById('sites').innerHTML = optionsList.join('')
  });
}

// This runs anytime a radio button is clicked.
// It updates all current items in the whitelist to reflect their current values
function saveCurrentEnabledStates(target) {
  var elements = document.querySelectorAll('.site');
  var modeMap = {};
  for (var i = 0; i < elements.length; i++) {
    var element = elements[i];
    if (element.checked) {
      modeMap[element.name] = element.value;
    }
  }
  SiteConf.update(modeMap, function() {
    renderOptions();
  });
}

document.addEventListener('DOMContentLoaded', renderOptions);
document.getElementById('add').addEventListener('click', addToWhitelist);
document.getElementById('restore').addEventListener('click', setDefaultOptions);
document.getElementById('sites').addEventListener('click', saveCurrentEnabledStates);
