var SiteConf = function () {};
SiteConf.DEFAULT_LIST = [
  // Enabled sites (sorted alphabetically)
  {
    domain: "angel.co",
    mode: "enabled",
  },
  {
    domain: "github.com",
    mode: "enabled",
  },
  {
    domain: "linkedin.com",
    mode: "enabled",
  },
  {
    domain: "mail.google.com",
    mode: "enabled",
  },
  {
    domain: "xing.com",
    mode: "enabled",
  },
  {
    domain: "piazza.com",
    mode: "enabled",
  },
  // Disabled sites (sorted alphabetically)
  {
    domain: "coderwall.com",
    mode: "disabled",
  },
  {
    domain: "dribbble.com",
    mode: "disabled",
  },
  {
    domain: "facebook.com",
    mode: "disabled",
  },
  {
    domain: "hired.com",
    mode: "disabled",
  },
  {
    domain: "news.ycombinator.com",
    mode: "disabled",
  },
  {
    domain: "plus.google.com",
    mode: "disabled",
  },
  // Temporarily drop support for jobr and sourcing.io
  // due to lack of demand and user value relative to
  // the cost of maintenance.
  // {
  //   domain: 'recruiter.jobrapp.com',
  //   mode: 'disabled',
  // },
  // {
  //   domain: 'sourcing.io',
  //   mode: 'disabled',
  // },
  {
    domain: "stackoverflow.com",
    mode: "disabled",
  },
  {
    domain: "twitter.com",
    mode: "disabled",
  },
  {
    domain: "quora.com",
    mode: "disabled",
  },
];

// Runs everytime chrome storage is modified
SiteConf._updateCache = function () {
  chrome.storage.sync.get(
    {
      siteConf: SiteConf.DEFAULT_LIST,
    },
    function (result) {
      SiteConf._cache = result.siteConf;
    }
  );
};

// Cache the SiteConf so we don't need an async call
// to chrome.storage everytime we need it
SiteConf._updateCache();
// Update local cache whenever chrome.storage is updated
chrome.storage.onChanged.addListener(SiteConf._updateCache);

SiteConf.getCached = function (cb) {
  return SiteConf._cache;
};

SiteConf.isMatchEnabled = function (url) {
  var found = SiteConf._findSiteByDomain(url);
  return found && (found.mode == "enabled" || found.mode == "matchOnly");
};

SiteConf.isToastEnabled = function (url) {
  var found = SiteConf._findSiteByDomain(url);
  return found && found.mode == "enabled";
};

SiteConf._findSiteByDomain = function (url) {
  var targetDomain = parseDomain(url);
  if (!targetDomain) return;
  var found = SiteConf.getCached().find(function (site) {
    return site.mode && targetDomain.includes(site.domain);
  });
  return found;
};

SiteConf.disableToastForUrl = function (url) {
  var targetDomain = parseDomain(url);
  if (!targetDomain) return;
  var setMap = {};
  setMap[targetDomain] = "matchOnly";
  SiteConf.update(setMap);
};

// Update mode values for sites in SiteConf
SiteConf.update = function (updateMap, cb) {
  for (var domain in updateMap) {
    var mode = updateMap[domain];
    site = SiteConf._findSiteByDomain(domain);
    if (site) {
      site.mode = mode;
    } else {
      SiteConf.getCached().push({ domain: domain, mode: mode });
    }
  }
  SiteConf._persist(cb);
};

SiteConf.add = function (domain, mode, cb) {
  domain = parseDomain(domain);
  if (!domain) return;
  var exists = SiteConf._findSiteByDomain(domain);
  if (exists) return cb("Domain already exists");
  SiteConf.getCached().push({ domain: domain, mode: mode });
  SiteConf._persist(cb);
};

SiteConf._persist = function (cb) {
  chrome.storage.sync.set(
    {
      siteConf: SiteConf.getCached(),
    },
    function () {
      if (cb) return cb();
    }
  );
};

SiteConf.setToDefault = function (cb) {
  chrome.storage.sync.set(
    {
      siteConf: SiteConf.DEFAULT_LIST,
    },
    cb
  );
};

// Runs once for every extension install/update
// We should not use the cache since we don't know if it will
// be loaded at the time the onInstalled listener is called
SiteConf._mergeDefaultConf = function () {
  chrome.storage.sync.get("siteConf", function (result) {
    siteConf = result.siteConf;
    // if there is no existing siteConf, set it to the default
    if (!siteConf || siteConf.length === 0) {
      return SiteConf.setToDefault();
    }
    SiteConf.DEFAULT_LIST.forEach(function (defaultSite) {
      var found = siteConf.find(function (site) {
        return site.domain === defaultSite.domain;
      });
      var didUpdate = false;
      if (found && defaultSite.forceUpdate === true) {
        // Explicitly copy over the fields we want to override
        found.mode = defaultSite.mode;
        didUpdate = true;
      } else if (!found) {
        // Add the newly defined domain to the config
        siteConf.push(defaultSite);
        didUpdate = true;
      }
      if (didUpdate) chrome.storage.sync.set({ siteConf: siteConf });
    });
  });
};

chrome.runtime.onInstalled.addListener(SiteConf._mergeDefaultConf);

// Returns null if the domain is invalid
function parseDomain(domain) {
  if (typeof domain !== "string") return null;
  var parsed = null;
  try {
    parsed = new URL(domain);
    return parsed.hostname || null;
  } catch (e) {
    // URL constructor requires a protocol specified, so we add one
    // if it errors out and we don't see one provided
    if (!domain.includes("http")) {
      return parseDomain("http://" + domain);
    }
  }
}

SiteConf.parseDomain = parseDomain;
