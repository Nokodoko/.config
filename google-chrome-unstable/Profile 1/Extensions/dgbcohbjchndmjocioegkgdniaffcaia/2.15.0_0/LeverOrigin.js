var LeverOrigin = {};

LeverOrigin.get = function () {
  const leverOrigin = localStorage.getItem("LEVER_ORIGIN");
  if (leverOrigin) {
    if (isLeverHire(leverOrigin)) return leverOrigin;

    // Remove non lever hire origin
    localStorage.removeItem("LEVER_ORIGIN");
  }

  return "https://hire.lever.co";
};

/**
 * Update `LEVER_ORIGIN` when ever the user navigates to `hire` on a lever.co domain.
 *
 * Examples of `LEVER_ORIGIN` include `https://hire.lever.co`, `https://hire.eu.lever.co`
 * and `https://hire.green.lever.co`
 *
 * Note [2020-10-15]: This was needed for the EU data center work [https://leverapp.atlassian.net/browse/ENT-195]
 * since we default `LEVER_ORIGIN` to `https://hire.lever.co` when not populated.
 *
 * @param {string} url
 */
LeverOrigin.set = function (url) {
  if (!url || !isLeverHire(url)) return;
  const domain = SiteConf.parseDomain(url);

  // Need to add port for lever dev
  const leverDomain = isLeverDev(domain) ? `${domain}:8000` : domain;

  localStorage.setItem("LEVER_ORIGIN", `https://${leverDomain}`);
};

function isLeverDev(domain) {
  return domain?.endsWith(".lever.dev");
}

function isLeverHire(url) {
  const domain = SiteConf.parseDomain(url);
  const isLeverDomain = domain?.endsWith(".lever.co") || isLeverDev(domain);
  const isHireApp = domain?.startsWith("hire."); // need to ignore our other apps eg jobs.lever.co
  return isLeverDomain && isHireApp;
}

/**
 * Check the tabs for a lever domain and set `LEVER_ORIGIN` to first lever domain tab if not populated already.
 */
LeverOrigin.setFromTabs = function () {
  // Only check when LEVER_ORIGIN is not populated with a valid hire lever url
  const leverOrigin = localStorage.getItem("LEVER_ORIGIN");
  if (leverOrigin) {
    if (isLeverHire(leverOrigin)) return;

    // Remove non lever hire origin
    localStorage.removeItem("LEVER_ORIGIN");
  }

  chrome.tabs.query({}, function (tabs) {
    if (!tabs || tabs.length == 0) return;

    for (const tab of tabs) {
      LeverOrigin.set(tab.url);

      const leverOrigin = localStorage.getItem("LEVER_ORIGIN");
      if (leverOrigin) return;
    }
  });
};
