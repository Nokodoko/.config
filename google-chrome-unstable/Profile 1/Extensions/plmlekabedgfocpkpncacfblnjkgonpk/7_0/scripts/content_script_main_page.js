function ProspectingPlugin() {
  var TYPE_TO_SCRAPER = {
    'github' : personFromGithub
  };

  /*  It's possible that 2+ 'show' events are sent when a tab is loaded but before the sidebar is added.
      Without keeping track of the visible state, 2 sidebars get added which interferes with event registration.
   */
  var visible = false;

  /* Messages FROM iframe */
  $(window).on('message', function (event) {
    event = event.originalEvent;
    if (event.data === 'clear') {
      sendMessage({ clear: true });
    } else if (event.data === 'hide') {
      sendMessage({ hide: true });
    } else if (event.data.import) {
      postToIframe({ person: personFromPage() });
    } else if (event.data === 'toggle') {
      sendMessage({ toggle: true });
    } else if (event.data.success) {
      var response = event.data.success;
      if (response.save_status === 'created') {
        showConfirmationPage(response)
      } else if (response.save_status === 'duplicate_found') {
        showDuplicateFoundPage(response)
      }
    } else if (event.data === 'site') {
      postToIframe({ site: site() });
    } else if (event.data.save || event.data.send) {
      sendMessage(event.data);
    } else if (event.data === 'open-config') {
      sendMessage({ config: true });
    } else if (event.data.hostname) {
      var subdomain = event.data.hostname.replace('.greenhouse.io', '');
      sendMessage({ lastVisitedSubdomain: subdomain });
    }
  });

  /* Messages FROM background.js TO iframe */
  messageHandler().addListener(function (msg) {
    if (msg.expand) {
      postToIframe('expand');
      $('iframe.greenhouse-iframe').addClass('expanded');
    } else if (msg.shrink) {
      postToIframe('shrink');
      $('iframe.greenhouse-iframe').removeClass('expanded');
    } else if (msg.hide) {
      hide();
    } else if (msg.show) {
      show(msg.show);
    } else if (msg.confirmation) {
      showConfirmationPage(msg.confirmation, msg.isMerge);
    } else if (msg.duplicateError) {
      showFlashError();
    } else if (msg.restore) {
      postToIframe({person: msg.restore});
    }
  });

  var efficientScan = debounce(function() {
    if (visible) {
      var selected = highlightedText();

      if (selected.length > 0) {
        var wordCount = selected.split(' ').length;

        if (wordCount > 0 && wordCount <= 2) {
          postToIframe({ selectedTerms: selected });
        }
      } else {
        postToIframe('clearMatches');
      }
    }
  }, 500);

  document.addEventListener('mouseup', efficientScan);

  function debounce(func, wait) {
    var timeout;

    return function() {
      var context = this, args = arguments;
      var later = function() {
        timeout = null;
        func.apply(context, args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  function show(hostname) {
    if (!visible) {
      visible = true;

      createSideBar(hostname);
    }
  }

  function createSideBar(hostname) {
    var $sidebar = $('#greenhouse_sidebar');

    if ($sidebar.length === 0) {
      $sidebar = $('<div/>').attr('id', 'greenhouse_sidebar');
      $('body').append($sidebar);

      $.get(chrome.extension.getURL('/views/sidebar.html'), function(data) {
        $sidebar.append($(data));

        var $iframe = $sidebar.find('iframe.greenhouse-iframe');
        var manifestVersion = chrome.runtime.getManifest().version;

        $iframe.on('load', function() {
          $('#gh_loading_spinner').remove();
        });

        $iframe.attr('src', '//' + hostname + '/plugin/prospecting/people/new?version=' + manifestVersion);

        registerSidebarEvents();
      });
    }

    $sidebar.show();
  }

  function registerSidebarEvents() {
    var $sidebar = $('#greenhouse_sidebar');

    $sidebar.find('#close_plugin_button').on('click', function() {
      sendMessage({ hide: true });
    });

    $sidebar.find('.gh-back-to-form:not(".gh-action")').on('click', function() {
      showIframe();
    });
  }

  function showScreen(screenSelector, direction) {
    if (!$(screenSelector).hasClass('active')) {
      $('.gh-plugin-screen.active').animate({ [direction]: "300px" }, 300, function() {
        $(this).removeClass('active');
        $(this).css(direction, '');
      });

      $(screenSelector).css(direction, '-300px');
      $(screenSelector).addClass('active');
      $(screenSelector).animate({ [direction]: "0px" }, 300, function() {
        $(this).css(direction, '');
      });
    }
  }

  function showIframe() {
    showScreen('#gh_iframe_screen', "left");
  }

  function showConfirmationPage(response, isMerge) {
    var selector = '#gh_confirmation_screen';

    if (!$(selector).hasClass('active')) {
      showScreen(selector, "right");

      $('#gh_full_name').text(response.full_name);
      $('#gh_confirmation_text').text(isMerge ? 'has been merged into an existing candidate!' : 'has been saved as a prospect on Greenhouse');

      if (response.candidate_profile_url) {
        $('#gh_view_in_greenhouse').attr('href', response.candidate_profile_url).show();
      } else {
        $('#gh_view_in_greenhouse').hide();
      }
    }
  }

  function showFlashError() {
    $('.gh-action').removeClass('disable');
  }

  function showDuplicateFoundPage(response) {
    var selector = '#gh_merge_screen';

    if (!$(selector).hasClass('active')) {
      showScreen(selector, "right");

      $('.gh-action').removeClass('disable');

      buildPersonCard('#gh_new_person_card', response.new_person);
      buildPersonCard('#gh_existing_person_card', response.existing_person);

      $('#gh_merge_reason').text(response.duplicate_reason);

      $('#gh_add_new_candidate').off('click').on('click', function() {
        if ($(this).hasClass('disable')) {
          return;
        }

        post(response.create_url, false);
      });

      $('#gh_merge_existing_candidate:not(".disable")').off('click').on('click', function() {
        if ($(this).hasClass('disable')) {
          return;
        }

        post(response.merge_url, true);
      });
    }
  }

  function buildPersonCard(selector, data) {
    var $body = $(selector).find('.gh-merge-card-body');
    $body.empty();

    if (data.person_url) {
      var $name = $('<a/>').attr({ href: data.person_url, target: '_target' }).addClass('gh-card-name').text(data.full_name);
      $body.append($name);
    } else {
      var $name = $('<div/>').addClass('gh-card-name').text(data.full_name);
      $body.append($name);
    }

    if (data.title) {
      $body.append($('<div/>').text(data.title));
    }

    if (data.email_address) {
      $body.append($('<div/>').addClass('gh-card-email').text(data.email_address));
    }

    if (data.candidate_applications.length > 0) {
      $body.append($('<div/>').addClass('gh-card-applications-header').text('Applied To:'));
      var $applicationSection = $('<div/>').addClass('gh-card-applications');
      $body.append($applicationSection);

      data.candidate_applications.forEach(function(application) {
        var $application = $('<div/>').addClass('gh-card-application');
        $applicationSection.append($application);

        $application.append($('<div/>').text(application.hiring_plan_name));
        $application.append($('<div/>').text(application.created_at));

        if (application.source) {
          $application.append($('<div/>').text(application.source));
        }

        if (application.status === 'active') {
          $application.append($('<div/>').text(application.stage_name));
        } else if (application.status === 'hired') {
          $application.append($('<div/>').text('Hired'));
        } else if (application.status === 'rejected') {
          $application.append($('<div/>').text('Rejected, ' + application.rejected_at + " REASON: " + application.rejection_reason));
        }
      });
    }

    if (data.prospect_applications.length > 0) {
      $body.append($('<div/>').addClass('gh-card-applications-header').text('Prospect For:'));
      var $applicationSection = $('<div/>').addClass('gh-card-applications');
      $body.append($applicationSection);

      data.prospect_applications.forEach(function(application) {
        if (application.hiring_plan_names.length > 0) {
          application.hiring_plan_names.forEach(function(name) {
            $applicationSection.append($('<div/>').addClass('gh-card-application').text(name));
          });
        } else {
          $applicationSection.append($('<div/>').addClass('gh-card-application').text('Any Job'));
        }
      });
    }
  }

  function post(url, isMerge) {
    $('.gh-action').addClass('disable');
    sendMessage({ post: url, isMerge: isMerge });
  }

  function hide() {
    visible = false;
    var $sidebar = $('#greenhouse_sidebar');
    $sidebar.hide();
  }

  function postToIframe(message) {
    var $iframe = $('#greenhouse_sidebar iframe.greenhouse-iframe');
    if ($iframe.length > 0) {
      $iframe[0].contentWindow.postMessage(message, '*');
    }
  }

  function site() {
    if (/github.com\/[^]*\/?$/.test(document.URL)) {
      return 'github';
    } else {
      return null;
    }
  }

  function personFromPage() {
    var type = site(),
        scraperFunction = TYPE_TO_SCRAPER[type];

    if (typeof scraperFunction === 'undefined') {
      throw 'Cannot import from unrecognized URL: ' + document.URL;
    }

    var person = scraperFunction();

    for (var field in person) {
      if (person.hasOwnProperty(field) && person[field]) {
        person[field] = person[field].trim();
      }
    }

    return person;
  }

  function personFromGithub() {
    var names = firstAndLastName($('.vcard-fullname').text());

    return {
      "person[first_name]": names[0],
      "person[last_name]": names[1],
      "person[company]": $('li[itemprop="worksFor"]').text(),
      "photo": $('img.avatar').attr('src'),
      "website": $('li[itemprop="url"] a').attr('href'),
      "social_media": document.URL
    };
  }

  function highlightedText() {
    return window.getSelection().toString().trim();
  }

  function sendMessage(msg) {
    chrome.runtime.sendMessage(msg);
  }

  function messageHandler() {
    return chrome.runtime.onMessage;
  }
}

ProspectingPlugin();
