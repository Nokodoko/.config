// Reference: https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/extension/getBackgroundPage
// extension.getBackgroundPage() cannot be used in Private Browsing mode. However it doesn't seem
// like the options page can be opened in Private Browsing, so it should be fine.

// We concatenate 2 difference nonces for security purposes - one generated at build time (so it
// will be tied to a version), one generated at installation to make sure that the full nonce
// cannot be fully accessed at runtime and cannot be fully understood ahead of time.
const { MAGICAL_CSP_NONCE_SUFFIX, MAGICAL_CSP_BUILD_ENV } = chrome.extension.getBackgroundPage();
const MAGICAL_CSP_NONCE_PREFIX = '073d942443fdb09efee5a73849dd0a852b89b3303873ccce155e8f748581809fe134a59c1826a603a63c1accd509bff2327c791922ff88bfdceb25b362c43b76';

/**
 * * `img-src data:` is used by TinyMCE.
 * * script-src 'sha256-…' is for parent.postMessage for auto-height calculation and focus
 * detection. If the contents of the <iframe srcdoc>'s <script> are changed, use the updated
 * sha256- value from build/${BUILD_APP}/manifest.json.
 */

let apiFrameSrc = 'https://api.getmagical.io/';
switch (MAGICAL_CSP_BUILD_ENV) {
  case 'dev': {
    apiFrameSrc = 'https://localhost/';
    break;
  }
  case 'staging': {
    apiFrameSrc = 'https://api-staging.getmagical.net/';
    break;
  }
}
/**
 * Options page Content-Security-Policy.
 * Allow all images to be loaded by not specifying a default-src or img-src.
 */
const CSP_POLICY = `
script-src 'self' 'sha256-n0WpPxlH+CxLONQZqQUV5xQsnvfnajj4/ZRL2AhXy68='; 
style-src 'self' 'nonce-${MAGICAL_CSP_NONCE_PREFIX + MAGICAL_CSP_NONCE_SUFFIX}'; 
frame-src data: https://www.getmagical.com ${apiFrameSrc}; 
connect-src https://www.getmagical.com https://o1092989.ingest.sentry.io; 
`;

document.write(`<meta http-equiv="Content-Security-Policy" content="${CSP_POLICY}">`);
