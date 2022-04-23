$(document).ready(function() {
  var $subdomain = $('#subdomain'),
      $oneLogin = $('#one_login'),
      $subdomainContainers = $('.subdomain-container'),
      $permission = $('#permission');

  init();

  function init() {
    $('#save').on('click', save);

    var selectedValue = fetchOneLoginSetting() ? 'true' : 'false';
    $oneLogin.find('option[value="' + selectedValue + '"]').attr('selected', 'selected');
    $oneLogin.on('change', updateForm).trigger('change');

    $subdomain.val(fetchSubdomain());

    $subdomain.on('keyup', updateGreenhouseHostname).trigger('keyup');

    $permission.prop('checked', localStorage['permission']);
  }

  function save() {
    var newSubdomain = $subdomain.val();
    if (showingOneLogin() && newSubdomain.length > 0) {
      persistSubdomain(newSubdomain);
    } else {
      removeSubdomain();
    }

    persistOneLogin($oneLogin.val());

    savePermission();
    message('Saved!');
  }

  function savePermission() {
    var permission = $permission.is(':checked');
    chrome.extension.sendRequest({ permission: permission });

    if (permission) {
      localStorage['permission'] = true;
    } else {
      localStorage.removeItem('permission');
    }
  }

  function updateForm() {
    $subdomainContainers.toggle(showingOneLogin());
  }

  function updateGreenhouseHostname() {
    var subdomain = $subdomain.val();
    if (subdomain.length > 0) {
      $('#greenhouse_hostname').val(subdomain + '.greenhouse.io')
    }
  }

  function fetchOneLoginSetting() {
    if (localStorage["greenhouse_onelogin"]) {
      return localStorage["greenhouse_onelogin"] === "true";
    }

    return fetchSubdomain();
  }

  function persistOneLogin(isUsingSSO) {
    localStorage["greenhouse_onelogin"] = isUsingSSO;
  }

  function showingOneLogin() {
    return $oneLogin.val() === "true";
  }

  function message(msg) {
    var $message = $('#message');

    $message.html(msg);

    setTimeout(function() {
      $message.html('');
    }, 5000);
  }

  function fetchSubdomain() {
    return localStorage['greenhouse_subdomain'];
  }

  function persistSubdomain(subdomain) {
    localStorage['greenhouse_subdomain'] = subdomain;
  }

  function removeSubdomain() {
    localStorage.removeItem('greenhouse_subdomain');
  }
});
