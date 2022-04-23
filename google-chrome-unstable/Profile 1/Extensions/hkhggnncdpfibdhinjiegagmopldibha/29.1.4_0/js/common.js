// Copyright Jason Savard

// optional callback
function docReady(fn) {
    return new Promise((resolve, reject) => {
        fn ||= resolve;
        if (document.readyState === "interactive" || document.readyState === "complete") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", () => {
                fn();
            });
        }
    });
}

const htmlElement = document.documentElement;

function emptyNode(target) {
    parseTarget(target, el => {
        while(el.firstChild) el.removeChild(el.firstChild);
    });
}

function lastNode(targets) {
    const nodes = selectorAll(targets);
    if (nodes?.length) {
        return nodes[nodes.length - 1];
    }
}

function emptyAppend(target, node) {
    emptyNode(target);
    parseTarget(target, el => {
        el.append(node);
    });
}

function removeAllNodes(target) {
    parseTarget(target, el => {
        el.remove();
    });
}

function byId(id) {
    return document.getElementById(id);
}

function css(target, styles) {
    parseTarget(target, element => {
        Object.assign(element.style, styles);
    });
}

function selector(selector) {
    return document.querySelector(selector);
}

function selectorAll(targets) {
    if (typeof targets === "string") {
        targets = document.querySelectorAll(targets);
    }

    if (!targets.forEach) {
        targets = [targets];
    }

    return targets;
}

function parseTarget(target, handleElement) {
    if (!target) {
        return [];
    }

    target = selectorAll(target);

    target.forEach(e => {
        handleElement(e);
    });
}

function getDefaultDisplay( elem ) {
    globalThis.defaultDisplayMap ||= {};

	var temp,
		doc = elem.ownerDocument,
		nodeName = elem.nodeName,
        display = globalThis.defaultDisplayMap[ nodeName ];

    if ( display ) {
        return display;
    }

	temp = doc.body.appendChild( doc.createElement( nodeName ) );
	display = getComputedStyle(temp).display;
	temp.parentNode.removeChild( temp );

	if ( display === "none" ) {
		display = "block";
	}

    globalThis.defaultDisplayMap[ nodeName ] = display;

	return display;
}

function isHiddenWithTree(el) {
    return el.style.display === "none" ||
		el.style.display === "" &&
		getComputedStyle(el).display === "none";
}

function show(target) {
    parseTarget(target, element => {
        if (element.hidden) {
            element.hidden = false;
        }

        if (element.style.display == "none") {
            element.style.display = "";
        }
        if (element.style.display === "" && isHiddenWithTree(element)) {
            element.style.display = getDefaultDisplay(element);
        }
    });
}

function hide(target) {
    parseTarget(target, element => {
        element.hidden = true;

        if (getComputedStyle(element).display !== "none") {
            element.style.display = "none";
        }
    });
}

function showHide(target, display) {
    if (display) {
        show(target);
    } else {
        hide(target);
    }
}

// targets is optional
const getNodeIndex = (el, targets) => {
	if (targets) {
  	    return Array.from(selectorAll(targets)).findIndex(relativeEl => relativeEl === el);
    } else {
  	    return [...el.parentNode.children].indexOf(el);
    }
}

/* SLIDE UP */
var slideUp = (targets, duration=500) => {
    if (duration == "fast") {
        duration = 200;
    } else if (duration == "slow") {
        duration = 600;
    }

    return new Promise((resolve, reject) => {
        parseTarget(targets, target => {
            target.style.transitionProperty = 'height, margin, padding, opacity';
            target.style.transitionDuration = duration + 'ms';

            const prevBoxsizing = target.style.boxSizing;
            target.style.boxSizing = 'border-box';

            target.style.height = target.offsetHeight + 'px';

            target.offsetHeight;

            const prevOverflow = target.style.overflow;
            target.style.overflow = 'hidden';

            target.style.height = 0;

            const previousPT = target.style.paddingTop;
            target.style.paddingTop = 0;

            const previousPB = target.style.paddingBottom;
            target.style.paddingBottom = 0;

            const previousMT = target.style.marginTop
            target.style.marginTop = 0;

            const previousMB = target.style.marginBottom;
            target.style.marginBottom = 0;

            setTimeout(() => {
                hide(target);
                target.style.removeProperty('height');

                target.style.boxSizing = prevBoxsizing;
                target.style.overflow = prevOverflow;

                target.style.paddingTop = previousPT;
                target.style.paddingBottom = previousPB;
                target.style.marginTop = previousMT;
                target.style.marginBottom = previousMB;

                target.style.removeProperty('transition-duration');
                target.style.removeProperty('transition-property');
            }, duration);
        });

        setTimeout(() => {
            resolve();
        }, duration);
    });
}

/* SLIDE DOWN */
var slideDown = (targets, duration=500) => {
    if (duration == "fast") {
        duration = 200;
    } else if (duration == "slow") {
        duration = 600;
    }

    return new Promise((resolve, reject) => {
        parseTarget(targets, target => {
            const currentHeight = target.clientHeight;
            target.style.removeProperty('display');
            let display = window.getComputedStyle(target).display;
            if (display === 'none') display = 'block';
            target.style.display = display;
            target.hidden = false;

            if (!currentHeight) {

                const prevOverflow = target.style.overflow;
                target.style.overflow = 'hidden';

                target.style.height = "auto"
                let height = target.clientHeight + "px";
                target.style.height = 0;

                //target.style.paddingTop = 0;
                //target.style.paddingBottom = 0;
                //target.style.marginTop = 0;
                //target.style.marginBottom = 0;

                target.offsetHeight;

                const prevBoxsizing = target.style.boxSizing;
                target.style.boxSizing = 'border-box';

                target.style.transitionProperty = "height";
                target.style.transitionDuration = duration + 'ms';
            
                /** Do this after the 0px has applied. */
                /** It's like a delay or something. MAGIC! */
                setTimeout(() => {
                    target.style.height = height
                }, 0) 
            
                //target.style.removeProperty('padding-top');
                //target.style.removeProperty('padding-bottom');
                //target.style.removeProperty('margin-top');
                //target.style.removeProperty('margin-bottom');
                setTimeout(() => {
                    target.style.removeProperty('height');

                    target.style.overflow = prevOverflow;
                    target.style.boxSizing = prevBoxsizing;

                    target.style.removeProperty('transition-duration');
                    target.style.removeProperty('transition-property');
                }, duration);
            }
        });

        setTimeout(() => {
            resolve();
        }, duration);
    });
}

var slideToggle = (targets, duration = 500) => {
    if (duration == "fast") {
        duration = 200;
    } else if (duration == "slow") {
        duration = 600;
    }

    return new Promise((resolve, reject) => {
        parseTarget(targets, target => {
            if (window.getComputedStyle(target).display === 'none') {
                return slideDown(target, duration);
            } else {
                return slideUp(target, duration);
            }
        });
    
        setTimeout(() => {
            resolve();
        }, duration);
    });
}

var fadeIn = (targets, duration=500) => {
    if (duration == "fast") {
        duration = 200;
    } else if (duration == "slow") {
        duration = 600;
    }

    return new Promise((resolve, reject) => {
        parseTarget(targets, target => {
            if (!isVisible(target) || window.getComputedStyle(target).opacity == "0") {
                target.style.opacity = "0";
                show(target);

                target.style.transitionProperty += ",opacity";
                target.style.transitionDuration = duration + 'ms';

                /** Do this after the 0px has applied. */
                /** It's like a delay or something. MAGIC! */
                setTimeout(() => {
                    target.style.opacity = "1";
                }, 0) 
            
                setTimeout(() => {
                    target.style.removeProperty('transition-duration');
                    target.style.removeProperty('transition-property');
                }, duration);
            }
        });

        setTimeout(() => {
            resolve();
        }, duration);
    });
}

var fadeOut = (targets, duration=500) => {
    if (duration == "fast") {
        duration = 200;
    } else if (duration == "slow") {
        duration = 600;
    }

    return new Promise((resolve, reject) => {
        parseTarget(targets, target => {
            if (isVisible(target) || window.getComputedStyle(target).opacity == "1") {
                //target.style.transitionProperty = "opacity";
                target.style.transitionDuration = duration + 'ms';

                /** Do this after the 0px has applied. */
                /** It's like a delay or something. MAGIC! */
                setTimeout(() => {
                    target.style.opacity = "0";
                }, 0);

                setTimeout(() => {
                    hide(target);
                    target.style.removeProperty('transition-duration');
                    target.style.removeProperty('transition-property');
                }, duration);
            }
        });

        setTimeout(() => {
            resolve();
        }, duration);
    });
}

function isVisible(target) {
    if (typeof target === "string") {
        target = document.querySelector(target);
    }

    return (target.offsetParent !== null)
}

function importTemplateNode(target, allFlag) {
    let nodes = null;
    parseTarget(target, el => {
        if (nodes) {
            return;
        } else {
            const fragment = document.importNode(el.content, true);
            if (allFlag) {
                nodes = Array.from(fragment.children);
            } else {
                nodes = fragment.firstElementChild;
            }
        }
    })
    return nodes;
}

function addEventListeners(target, type, fn, namespace, listenerOptions) {
    parseTarget(target, el => {
       	let thisListenerOptions = false;
        if (namespace) {
        	const abortControllerFnName = `_myAbortController_${namespace}_${type}`;
        	if (el[abortControllerFnName]) {
          	    console.log("abort")
          	    el[abortControllerFnName].abort();
            }
            el[abortControllerFnName] = new AbortController();
          
            if (listenerOptions === true) {
                thisListenerOptions = {
                	capture: true,
                    signal: el[abortControllerFnName].signal
                }
            } else if (typeof listenerOptions === 'object') {
                thisListenerOptions = Object.assign({}, listenerOptions);
                thisListenerOptions.signal = el[abortControllerFnName].signal;
            } else {
              	thisListenerOptions = {
                	signal: el[abortControllerFnName].signal
                }
            }
        } else if (listenerOptions) {
            thisListenerOptions = listenerOptions;
        }
        el.addEventListener(type, fn, thisListenerOptions);
    });
};

function replaceEventListeners(target, type, fn, namespace = "default", listenerOptions) {
	addEventListeners(target, type, fn, namespace, listenerOptions);
}

function onClick(target, fn, namespace, listenerOptions = false) {
    addEventListeners(target, "click", fn, namespace, listenerOptions);
}

function onClickReplace(target, fn, namespace = "default", listenerOptions = false) {
    onClick(target, fn, namespace, listenerOptions);
}

function onDelegate(node, type, selector, fn, listenerOptions = false) {
    node.addEventListener(type, function(e) {
        for (var target=e.target; target && target!=this; target=target.parentNode) {
            // loop parent nodes from the target to the delegation node
            if (target.matches(selector)) {
                fn.call(target, e);
                break;
            }
        }
    }, listenerOptions);
}

function toggleAttr(target, attr, value) {
    parseTarget(target, el => {
        if (value === false) {
            el.removeAttribute(attr);
        } else {
            if (el.getAttribute(attr) == undefined || value === true) {
                el.setAttribute(attr, "");
            } else {
                el.removeAttribute(attr);
            }
        }
    });
}

class DetectClientClass {

    constructor() {
        this.platform = "Windows"; // patch had to declaire it here instead of above to pass firefox extension compilation warning
    }

    async init() {
        if (navigator.userAgentData) {
            this.platform = (await navigator.userAgentData.getHighEntropyValues(["platform"])).platform;
        }
    }
  
    findBrand(brandString) {
        return navigator.userAgentData?.brands.some(brands => brands.brand == brandString);
    }
    
    isChrome() {
        return this.findBrand("Google Chrome");
    }

    isChromium() {
        return this.findBrand("Chromium")
             && !this.isFirefox()
             && !this.isSafari()
        ;
    }

    isEdge() {
        return this.findBrand("Microsoft Edge");
    }

    isOpera() {
        return this.findBrand("Opera");
    }

    isFirefox() {
        return /firefox/i.test(navigator.userAgent);
    }

    isSafari() {
        return /safari/i.test(navigator.userAgent) && !/chrome/i.test(navigator.userAgent);
    }

    isWindows() {
        if (navigator.userAgentData) {
            return this.platform == "Windows";
        } else {
            return /windows/i.test(navigator.userAgent);
        }
    }

    isAndroid() {
        if (navigator.userAgentData) {
            return this.platform == "Android";
        } else {
            return /android/i.test(navigator.userAgent);
        }
    }

    isMac() {
        if (navigator.userAgentData) {
            return this.platform == "macOS";
        } else {
            return /mac/i.test(navigator.userAgent);
        }
    }

    is_iPhone() {
        if (navigator.userAgentData) {
            return this.platform == "iOS";
        } else {
            return /iPhone/i.test(navigator.userAgent);
        }
    }

    isLinux() {
        if (navigator.userAgentData) {
            return this.platform == "Linux";
        } else {
            return /linux/i.test(navigator.userAgent);
        }
    }

    isChromeOS() {
        return this.platform == "Chrome OS";
    }

    async getChromeChannel() {
        
        if (this.isChrome() || this.isChromeOS()) {
            const data = await fetchJSON("https://omahaproxy.appspot.com/all.json");
            var versionDetected;
            var stableDetected = false;
            var stableVersion;

            for (let a = 0; a < data.length; a++) {
                const thisData = data[a];

                var osMatched = false;
                // patch because Chromebooks/Chrome OS has a platform value of "Linux i686" but it does say CrOS in the useragent so let's use that value
                if (this.isChromeOS()) {
                    if (thisData.os == "cros") {
                        osMatched = true;
                    }
                } else { // the rest continue with general matching...
                    if (thisData.os == "win" && this.isWindows()) {
                        osMatched = true;
                    } else if (thisData.os == "mac" && this.isMac()) {
                        osMatched = true;
                    } else if (thisData.os == "linux" && this.isLinux()) {
                        osMatched = true;
                    } else if (thisData.os == "cros" && this.isChromeOS()) {
                        osMatched = true;
                    } else if (thisData.os == "android" && this.isAndroid()) {
                        osMatched = true;
                    }
                }

                if (osMatched) {
                    let browserVersion = (await navigator.userAgentData.getHighEntropyValues(["uaFullVersion"])).uaFullVersion;
                    // use only major and minor
                    if (browserVersion) {
                        const versionSplit = browserVersion.split(".");
                        browserVersion = `${versionSplit[0]}.${versionSplit[1]}`;
                    }

                    for (var b = 0; b < thisData.versions.length; b++) {
                        const thisVersion = thisData.versions[b];

                        if (thisVersion.channel == "stable") {
                            stableVersion = thisVersion;
                        }
                        if (thisVersion.previous_version.indexOf(browserVersion) == 0
                            || thisVersion.version.indexOf(browserVersion) == 0) {
                            // it's possible that the same version is for the same os is both beta and stable???
                            versionDetected = thisVersion;
                            if (thisVersion.channel == "stable") {
                                stableDetected = true;
                                return versionDetected;
                            }
                        }
                    }

                    if (browserVersion) {
                        var currentVersionObj = parseVersionString(browserVersion);
                        var stableVersionObj = parseVersionString(stableVersion.previous_version);
                        if (currentVersionObj.major < stableVersionObj.major) {
                            return { oldVersion: true, reason: "major diff" };
                        } else if (currentVersionObj.major == stableVersionObj.major) {
                            if (currentVersionObj.minor < stableVersionObj.minor) {
                                return { oldVersion: true, reason: "minor diff" };
                            } else if (currentVersionObj.minor == stableVersionObj.minor) {
                                /*
                                if (currentVersionObj.patch < stableVersionObj.patch) {
                                    return { oldVersion: true, reason: "patch diff" };
                                    return;
                                }
                                */
                                // commented above to ignore patch differences
                                stableDetected = true;
                                return stableVersion;
                            }
                        }
                    }						
                }
            }

            // probably an alternative based browser like RockMelt because I looped through all version and didn't find any match
            if (data.length && !versionDetected) {
                return { channel: "alternative based browser" };
            } else {
                return versionDetected;
            }
        } else {
            throw Error("Not Chrome");
        }
    }

    getFirefoxDetails() {
        return fetchJSON("https://jasonsavard.com/getBrowserDetails");
    }
}

const DetectClient = new DetectClientClass();

function getInternalPageProtocol() {
	var protocol;
	if (DetectClient.isFirefox()) {
		protocol = "moz-extension:";
	} else {
		protocol = "chrome-extension:";
	}
	return protocol;
}

function isInternalPage(url) {
	if (arguments.length == 0) {
		url = location.href;
	}
	return url && url.indexOf(getInternalPageProtocol()) == 0;
}

function customShowError(error) {
    if (globalThis.document) {
        docReady(() => {
            show(document.body);
            document.body.style.opacity = "1";

            const div = document.createElement("div");
            div.style.cssText = "background:red;color:white;padding:5px;z-index:999";
            div.textContent = error;

            document.body.prepend(div);
        });
    } else {
        showCouldNotCompleteActionNotification(error);
    }
}
    
function displayUncaughtError(errorStr) {
	if (globalThis.polymerPromise2?.then) {
		polymerPromise2.then(() => {
			if (globalThis.showError) {
                document.body.style.opacity = "1";
                // must catch errors here to prevent onerror loop
                showError(errorStr).catch(e => {
                    console.error(e);
                    customShowError(errorStr);
                });
			} else {
				customShowError(errorStr);
			}
		}).catch(error => {
			customShowError(errorStr);
		});
	} else {
		customShowError(errorStr);
	}
}

globalThis.onerror = function(msg, url, line) {
	var thisUrl = removeOrigin(url).substring(1); // also remove beginning slash '/'
	var thisLine;
	if (line) {
		thisLine = " (" + line + ") ";
	} else {
		thisLine = " ";
	}
	var action = thisUrl + thisLine + msg;
	
	sendGAError(action);
	
    var errorStr = msg + " (" + thisUrl + " " + line + ")";
    displayUncaughtError(errorStr);
	
	//return false; // false prevents default error handling.
};

globalThis.addEventListener('unhandledrejection', function (event) {
    const error = event.reason.stack ?? event.reason;
    console.error("unhandledrejection", error);
    displayUncaughtError(error);
  
    // Prevent the default handling (error in console)
    //event.preventDefault();
});

// usage: [url] (optional, will use location.href by default)
function removeOrigin(url) {
	var linkObject;
	if (arguments.length && url) {
		try {
			linkObject = document.createElement('a');
			linkObject.href = url;
		} catch (e) {
			console.error("jerror: could not create link object: " + e);
		}
	} else {
		linkObject = location;
	}
	
	if (linkObject) {
		return linkObject.pathname + linkObject.search + linkObject.hash;
	} else {
		return url;
	}
}

// anonymized email by using only 3 letters instead to comply with policy
async function getUserIdentifier() {
    try {
        if (globalThis.storage) {
            const email = await storage.get("email")
            if (email) {
                return email.split("@")[0].substring(0,3);
            }
        }
    } catch (error) {
        console.warn("Could not getUserIdentifier: " + error);
    }
}

async function sendGAError(action) {
	// google analytics
	var JS_ERRORS_CATEGORY = "JS Errors";
	if (typeof sendGA != "undefined") {
		// only action (no label) so let's use useridentifier
		var userIdentifier = await getUserIdentifier();
		if (arguments.length == 1 && userIdentifier) {
			sendGA(JS_ERRORS_CATEGORY, action, userIdentifier);
		} else {
			// transpose these arguments to sendga (but replace the 1st arg url with category ie. js errors)
			// use slice (instead of sPlice) because i want to clone array
			var argumentsArray = [].slice.call(arguments, 0);
			// transpose these arguments to sendGA
			var sendGAargs = [JS_ERRORS_CATEGORY].concat(argumentsArray);
			sendGA.apply(this, sendGAargs);
		}
	}
	//return false; // false prevents default error handling.
}

function logError(action) {
	// transpose these arguments to console.error
	// use slice (instead of sPlice) because i want to clone array
	var argumentsArray = [].slice.call(arguments, 0);
	// exception: usually 'this' is passed but instead its 'console' because console and log are host objects. Their behavior is implementation dependent, and to a large degree are not required to implement the semantics of ECMAScript.
	console.error.apply(console, argumentsArray);
	
	sendGAError.apply(this, arguments);
}

var ONE_SECOND = 1000;
var ONE_MINUTE = 60000;
var ONE_HOUR = ONE_MINUTE * 60;
var ONE_DAY = ONE_HOUR * 24;

var WEEK_IN_MINUTES = 10080;
var DAY_IN_MINUTES = 1440;
var HOUR_IN_MINUTES = 60;

// copy all the fields (not a clone, we are modifying the target so we don't lose a any previous pointer to it
function copyObj(sourceObj, targetObj) {
    for (var key in sourceObj) {        
    	targetObj[key] = sourceObj[key];
    }
}

function hasVerticalScrollbar(node, buffer = 0) {
    if (node.scrollHeight > node.clientHeight + buffer) {
        return true;
    } else {
        return false;
    }
}

function hasHorizontalScrollbar(node, buffer) {
    if (node.scrollWidth > node.clientWidth + buffer) {
        return true;
    } else {
        return false;
    }
}

function seconds(seconds) {
	return seconds * ONE_SECOND;
}

function minutes(mins) {
	return mins * ONE_MINUTE;
}

function hours(hours) {
	return hours * ONE_HOUR;
}

function days(days) {
	return days * ONE_DAY;
}

function shallowClone(obj) {
    return Object.assign({}, obj);
}

function deepClone(obj) {
    if (obj) {
        return JSON.parse(JSON.stringify(obj), dateReviver);
    }
}

//remove entity codes
function htmlToText(html) {
    html = html
            .replace(/<br\s?\/?>/ig,"\n")
            .replace(/<(?:.|\n)*?>/gm, '')
    ;
    const doc = new DOMParser().parseFromString(html, "text/html");
    return doc.documentElement.textContent;
}

async function readMessagesFile(lang, region) {
    var folderName;
    if (region) {
        folderName = lang + "_" + region.toUpperCase();
    } else {
        folderName = lang;
    }

    return fetchJSON(chrome.runtime.getURL("_locales/" + folderName + "/messages.json"));
}

async function _loadLocaleMessagesFile() {
    const localeFormatted = locale.replace("-", "_");
    const lang = localeFormatted.split("_")[0].toLowerCase();
    const region = localeFormatted.split("_")[1];
        
    try {
        localeMessages = await readMessagesFile(lang, region);
    } catch (error) {
        // if we had region then try lang only
        if (region) {
            console.log("Couldn't find region: " + region + " so try lang only: " + lang);
            try {
                localeMessages = await readMessagesFile(lang);
            } catch (error) {
                // always resolve
                console.warn(error);
            }
        } else {
            console.warn("Lang not found: " + lang);
        }
    }
}

async function loadLocaleMessages() {
    // only load locales from files if they are not using their browser language (because i18n.getMessage uses the browser language) 
    if (chrome.i18n.getUILanguage && (locale == chrome.i18n.getUILanguage() || locale == chrome.i18n.getUILanguage().substring(0, 2))) {
        // for english just use native calls to get i18n messages
        localeMessages = null;
    } else {
        //console.log("loading locale: " + locale);
        
        // i haven't created a en-US so let's avoid the error in the console and just push the callback
        if (locale != "en-US") {
            await _loadLocaleMessagesFile();
        }
    }		
}

function getMessage(messageID, args) {
	if (messageID) {

        if (messageID == "tomorrow") {
            return getTomorrowMessage();
        } else if (messageID == "yesterday") {
            return getYesterdayMessage();
        } else if (messageID == "today") {
            return getTodayMessage();
        }

		if (typeof localeMessages != 'undefined' && localeMessages != null) {
			var messageObj = localeMessages[messageID];	
			if (messageObj) { // found in this language
				var str = messageObj.message;
				
				// patch: replace escaped $$ to just $ (because chrome.i18n.getMessage did it automatically)
				if (str) {
					str = str.replace(/\$\$/g, "$");
				}
				
				if (args != null) {
					if (args instanceof Array) {
						for (var a=0; a<args.length; a++) {
							str = str.replace("$" + (a+1), args[a]);
						}
					} else {
						str = str.replace("$1", args);
					}
				}
				return str;
			} else { // default to default language
				return chromeGetMessage(messageID, args);
			}
		} else {
			return chromeGetMessage(messageID, args);
		}
	}
}

//patch: chrome.i18n.getMessage does pass parameter if it is a numeric - must be converted to str
function chromeGetMessage(messageID, args) {
	if (args != null && !isNaN(args)) {
		args = args + "";
	}
	return chrome.i18n.getMessage(messageID, args);
}

function getUniqueId() {
	return Math.floor(Math.random() * 100000);
}

var dateFormat = function () {
	var	token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g,
		timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,
		timezoneClip = /[^-+\dA-Z]/g,
		pad = function (val, len) {
			val = String(val);
			len = len || 2;
			while (val.length < len) val = "0" + val;
			return val;
		};

	// Regexes and supporting functions are cached through closure
	return function (date, mask, options) { //utc, forceEnglish
		if (!options) {
			options = {};
		}
		
		var dF = dateFormat;
		var i18n = options.forceEnglish ? dF.i18nEnglish : dF.i18n;

		// You can't provide utc if you skip other args (use the "UTC:" mask prefix)
		if (arguments.length == 1 && Object.prototype.toString.call(date) == "[object String]" && !/\d/.test(date)) {
			mask = date;
			date = undefined;
		}

		// Passing date through Date applies Date.parse, if necessary
		date = date ? new Date(date) : new Date;
		if (isNaN(date)) throw SyntaxError("invalid date");

		mask = String(dF.masks[mask] || mask || dF.masks["default"]);

		// Allow setting the utc argument via the mask
		if (mask.slice(0, 4) == "UTC:") {
			mask = mask.slice(4);
			options.utc = true;
		}

		var	_ = options.utc ? "getUTC" : "get",
			d = date[_ + "Date"](),
			D = date[_ + "Day"](),
			m = date[_ + "Month"](),
			y = date[_ + "FullYear"](),
			H = date[_ + "Hours"](),
			M = date[_ + "Minutes"](),
			s = date[_ + "Seconds"](),
			L = date[_ + "Milliseconds"](),
			o = options.utc ? 0 : date.getTimezoneOffset(),
			flags = {
				d:    d,
				dd:   pad(d),
				ddd:  i18n.dayNamesShort[D],
				dddd: i18n.dayNames[D],
				m:    m + 1,
				mm:   pad(m + 1),
				mmm:  i18n.monthNamesShort[m],
				mmmm: i18n.monthNames[m],
				yy:   String(y).slice(2),
				yyyy: y,
				h:    H % 12 || 12,
				hh:   pad(H % 12 || 12),
				H:    H,
				HH:   pad(H),
				M:    M,
				MM:   pad(M),
				s:    s,
				ss:   pad(s),
				l:    pad(L, 3),
				L:    pad(L > 99 ? Math.round(L / 10) : L),
				t:    H < 12 ? "a"  : "p",
				tt:   H < 12 ? "am" : "pm",
				T:    H < 12 ? "A"  : "P",
				TT:   H < 12 ? "AM" : "PM",
				Z:    options.utc ? "UTC" : (String(date).match(timezone) || [""]).pop().replace(timezoneClip, ""),
				o:    (o > 0 ? "-" : "+") + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
				S:    ["th", "st", "nd", "rd"][d % 10 > 3 ? 0 : (d % 100 - d % 10 != 10) * d % 10]
			};

		var ret = mask.replace(token, function ($0) {
			return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
		});

		if (options.noZeros) {
			ret = ret.replace(":00", "");
		}
		
		return ret;
	};
}();

// Some common format strings
dateFormat.masks = {
	"default":      "ddd mmm dd yyyy HH:MM:ss",
	shortDate:      "m/d/yy",
	mediumDate:     "mmm d, yyyy",
	longDate:       "mmmm d, yyyy",
	fullDate:       "dddd, mmmm d, yyyy",
	shortTime:      "h:MM TT",
	mediumTime:     "h:MM:ss TT",
	longTime:       "h:MM:ss TT Z",
	isoDate:        "yyyy-mm-dd",
	isoTime:        "HH:MM:ss",
	isoDateTime:    "yyyy-mm-dd'T'HH:MM:ss",
	isoUtcDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'"
};

// Internationalization strings
dateFormat.i18n = {
	dayNamesShort: [],
	dayNames: [],
	monthNamesShort: [],
	monthNames: []
};

dateFormat.i18nEnglish = shallowClone(dateFormat.i18n);
dateFormat.i18nCalendarLanguage = shallowClone(dateFormat.i18n);

function initCalendarNames(obj) {
    let date = new DateZeroTime();
    date.setDate(date.getDate() - date.getDay()); // set to Sunday

    while (obj.dayNamesShort.length < 7) {
        obj.dayNamesShort.push(date.toLocaleString(locale, {
            weekday: "short"
        }));

        obj.dayNames.push(date.toLocaleString(locale, {
            weekday: "long"
        }));

        date.setDate(date.getDate() + 1);
    }

    date = new DateZeroTime(new Date().getFullYear(), 0, 1);

    // weird bug with feb repeated when using setDate in for loop, so had to use while loop instead
    while (obj.monthNamesShort.length < 12) {
        obj.monthNamesShort.push(date.toLocaleString(locale, {
            month: "short"
        }));

        obj.monthNames.push(date.toLocaleString(locale, {
            month: "long"
        }));

        date.setMonth(date.getMonth() + 1);
    }
}

Date.prototype.addSeconds = function(seconds, cloneDate) {
	var date;
	if (cloneDate) {
		date = new Date(this);		
	} else {
		date = this;
	}
	date.setSeconds(date.getSeconds() + seconds, date.getMilliseconds());
	return date;
}

Date.prototype.subtractSeconds = function(seconds, cloneDate) {
	return this.addSeconds(-seconds, cloneDate);
}

Date.prototype.addMinutes = function(mins) {
	return new Date(this.getTime() + minutes(mins));
}

Date.prototype.addHours = function(hrs) {
	return new Date(this.getTime() + hours(hrs));
}

Date.prototype.addDays = function(days) {
	var newDate = new Date(this);
	newDate.setDate(newDate.getDate() + parseInt(days));
	return newDate;
}

Date.prototype.subtractDays = function(days) {
	return this.addDays(days * -1);
}

function getHourCycle() {
    return twentyFourHour ? "h23" : "h12";
}

function getDateFormatOptions() {
    return {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
    }
}

function getTimeFormatOptions() {
    return {
        hour: 'numeric',
        minute: 'numeric',
        hourCycle: getHourCycle()
    }
}

function getDateAndTimeFormatOptions() {
    return {...getDateFormatOptions(), ...getTimeFormatOptions()};
}

Object.defineProperty(Date.prototype, "toLocaleDateStringJ", {
    value: function () {
        return this.toLocaleDateString(locale, getDateFormatOptions());
    }
});

Object.defineProperty(Date.prototype, "toLocaleTimeStringJ", {
    value: function (removeTrailingZeroes) {
        let str = this.toLocaleTimeString(locale, getTimeFormatOptions());

        str = str.replace(" AM", "am");
        str = str.replace(" PM", "pm");

        str = str.replace(" da manhã", "am");
        str = str.replace(" da tarde", "pm");

        if (removeTrailingZeroes && !twentyFourHour) {
			str = str.replace(":00", "");
		}
        return str;
    }
});

Object.defineProperty(Date.prototype, "toLocaleStringJ", {
    value: function () {
        return this.toLocaleString(locale, getDateAndTimeFormatOptions());
    }
});

// For convenience...
Date.prototype.format = function (mask, options) {
	return dateFormat(this, mask, options);
};

function resetTime(date) {
    date.setHours(0, 0, 0, 0);
    return date;
}

class DateZeroTime extends Date {
    constructor(...dateFields) {
        super(...dateFields);
        resetTime(this);
    }
}

Date.prototype.toRFC3339 = function() {
	//var gmtHours = -d.getTimezoneOffset()/60;
	return this.getUTCFullYear() + "-" + pad(this.getUTCMonth()+1, 2, '0') + "-" + pad(this.getUTCDate(), 2, '0') + "T" + pad(this.getUTCHours(), 2, '0') + ":" + pad(this.getUTCMinutes(), 2, '0') + ":00Z";
}

function today() {
	return new DateZeroTime();
}

function yesterday() {
	const yest = new DateZeroTime();
	yest.setDate(yest.getDate()-1);
	return yest;
}

function tomorrow() {
	var tom = new DateZeroTime();
	tom.setDate(tom.getDate()+1);
	return tom;
}

function isToday(date) {
	var todayDate = today();
	return date.getFullYear() == todayDate.getFullYear() && date.getMonth() == todayDate.getMonth() && date.getDate() == todayDate.getDate();
}

function isTomorrow(date) {
	var tom = tomorrow();
	return date.getFullYear() == tom.getFullYear() && date.getMonth() == tom.getMonth() && date.getDate() == tom.getDate();
}

function isYesterday(date) {
	var yest = yesterday();
	return date.getFullYear() == yest.getFullYear() && date.getMonth() == yest.getMonth() && date.getDate() == yest.getDate();
}

function getRelativeDayMessage(dayOffset) {
    const formatter = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
    let relativeDay = formatter.format(dayOffset, 'day');
    if (locale.includes("en")) {
        relativeDay = relativeDay.capitalize();
    }
    return relativeDay;
}

function getTodayMessage() {
    return getRelativeDayMessage(0);
}

function getYesterdayMessage() {
    return getRelativeDayMessage(-1);
}

function getTomorrowMessage() {
    return getRelativeDayMessage(+1);
}

Date.prototype.isToday = function () {
	return isToday(this);
};

Date.prototype.isTomorrow = function () {
	return isTomorrow(this);
};

Date.prototype.isYesterday = function () {
	return isYesterday(this);
};

Date.prototype.isSameDay = function (otherDay) {
	return this.getFullYear() == otherDay.getFullYear() && this.getMonth() == otherDay.getMonth() && this.getDate() == otherDay.getDate();
};

Date.prototype.isBefore = function(otherDate) {
	var paramDate;
	if (otherDate) {
		paramDate = new Date(otherDate);
	} else {
		paramDate = new Date();
	}	
	var thisDate = new Date(this);
	return thisDate.getTime() < paramDate.getTime();
};

Date.prototype.isBeforeToday = function() {
	return !this.isToday() && this.isBefore();
};

Date.prototype.isEqual = function(otherDate) {
	return this.getTime() == otherDate.getTime();
};

Date.prototype.isEqualOrBefore = function(otherDate) {
	return this.isBefore(otherDate) || (otherDate && this.getTime() == otherDate.getTime());
};

Date.prototype.isAfter = function(otherDate) {
	return !this.isEqualOrBefore(otherDate);
};

Date.prototype.isEqualOrAfter = function(otherDate) {
	return !this.isBefore(otherDate);
};

Date.prototype.diffInMillis = function(otherDate) {
	var d1;
	if (otherDate) {
		d1 = new Date(otherDate);
	} else {
		d1 = new Date();
	}	
	var d2 = new Date(this);
	return (d2.getTime() - d1.getTime());
};

Date.prototype.diffInSeconds = function(otherDate) {
    return this.diffInMillis(otherDate) / ONE_SECOND;
};

Date.prototype.diffInMinutes = function(otherDate) {
    return this.diffInMillis(otherDate) / ONE_MINUTE;
};

Date.prototype.diffInHours = function(otherDate) {
    return this.diffInMillis(otherDate) / ONE_HOUR;
};

Date.prototype.diffInDays = function(otherDate, forHumans) {
	var d1;
	if (otherDate) {
		d1 = new Date(otherDate);
	} else {
		d1 = new Date();
	}
	var d2 = new Date(this);
	if (forHumans) {
		resetTime(d1);
		resetTime(d2);
	}
	let diffInTime = d2.getTime() - d1.getTime();
	if (forHumans) {
		// require ceil because date could have different timezones and not return even numbers
		return Math.ceil(diffInTime / ONE_DAY);
	} else {
		return diffInTime / ONE_DAY;
	}
};

Date.prototype.diffInDaysForHumans = function(otherDate) {
	return this.diffInDays(otherDate, true);
};

Date.prototype.getDayOfYear = function() {
    const start = new Date(this.getFullYear(), 0, 0);
    const diff = this - start;
    return Math.floor(diff / ONE_DAY);
}

// Note: this is shallow clone if the array contains objects they will remain referenced ie. [{key:value}, ...]
Array.prototype.shallowClone = function() {
	return this.slice(0);
};

Array.prototype.first = function() {
	return this[0];
};
Array.prototype.last = function() {
	return this[this.length-1];
};
Array.prototype.isEmpty = function() {
	return this.length == 0;
};
Array.prototype.swap = function (x,y) {
	var b = this[x];
	this[x] = this[y];
	this[y] = b;
	return this;
}

Array.prototype.addItem = function(key, value) {
	for (var i=0, l=this.length; i<l; ++i) {
		if (this[i].key == key) {
			// found key so update value
			this[i].value = value;
			return;
		}
	}
	this.push({key:key, value:value});
}
Array.prototype.getItem = function(key) {
	for (var i=0, l=this.length; i<l; ++i) {
		if (this[i].key == key) {			
			return this[i].value;
		}
	}
}

String.prototype.replaceAll = function(find, replace) {
	var findEscaped = escapeRegExp(find);
	return this.replace(new RegExp(findEscaped, 'g'), replace);
}

String.prototype.chunk = function(size) {
	return this.match(new RegExp('.{1,' + size + '}', 'g'));
}

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

String.prototype.equalsIgnoreCase = function(str) {
	if (this && str) {
		return this.toLowerCase() == str.toLowerCase();
	}
}

String.prototype.hasWord = function(word) {
	return new RegExp("\\b" + word + "\\b", "i").test(this);
}

String.prototype.startsWith = function (str) {
	return this.indexOf(str) == 0;
};

String.prototype.endsWith = function (str){
	return this.slice(-str.length) == str;
};

String.prototype.summarize = function(maxLength, EOM_Message) {
	if (!maxLength) {
		maxLength = 101;
	}
	var summary = this;
	if (summary.length > maxLength) {
		summary = summary.substring(0, maxLength);
		var lastSpaceIndex = summary.lastIndexOf(" ");
		if (lastSpaceIndex != -1) {
			summary = summary.substring(0, lastSpaceIndex);
			summary = summary.trim();
		}
		summary += "...";
	} else {
		if (EOM_Message) {
			summary += EOM_Message;
		}
	}
	
	// patch: do not why: but it seem that unless i append a str to summary, it returns an array of the letters in summary?
	return summary + "";
}

// match only url and path (NOT query parameters)
String.prototype.urlOrPathContains = function(str) {
	var strIndex = this.indexOf(str);
	if (strIndex != -1) {		
		var queryParamsStart = this.indexOf("?");
		// if query make sure that we don't match the str inside query params
		if (queryParamsStart != -1) {
			if (strIndex < queryParamsStart) {
				return true;
			} else {
				return false;
			}
		} else {
			return true;
		}
	} else {
		return false;
	}
}

String.prototype.parseTime = function(defaultDate) {
	var d;
	if (defaultDate) {
		d = new Date(defaultDate);
	} else {
		d = new Date();
	}
	
    let thisDate = this;

    // french canadian language parsing ie. 08 h 30
    thisDate = thisDate.replace(/(\d+) ?h ?(\d+)/i, '$1:$2');

	let pieces;
	if (thisDate.includes(":")) { // "17 September 2015 at 20:56"
		pieces = thisDate.match(/(\d+)([:|\.](\d\d))\s*(a|p)?/i);
	} else { // "2pm"
		pieces = thisDate.match(/(\d+)([:|\.](\d\d))?\s*(a|p)?/i);
	}

	if (pieces?.length >= 5) {
		// patch: had to use parseFloat instead of parseInt (because parseInt would return 0 instead of 9 when parsing "09" ???		
        var hoursStr = pieces[1];
		var hours = parseFloat(hoursStr);
        var sep = pieces[2];
        var minutes = parseFloat(pieces[3]) || 0;
		var ampm = pieces[4];
        //console.log("hours", hours);
        //console.log("sep", sep);
        //console.log("minutes", minutes);

        if (hours >= 100) { // ie. 0900
            if (hoursStr.length <= 3) { // ### ie 3 digits long
                hours = hoursStr.substring(0, 1);
                minutes = hoursStr.substring(1);
            } else { // #### 4 digits long
                hours = hoursStr.substring(0, 2);
                minutes = hoursStr.substring(2);
            }
        }

        console.log("ampm", ampm);
		
		// patch for midnight because 12:12am is actually 0 hours not 12 hours for the date object
		if (hours == 12) {
			if (ampm?.toLowerCase().startsWith("a")) {
				hours = 0;
			}
		} else if (ampm?.toLowerCase().startsWith("p")) {
			hours += 12;
		}
		d.setHours(hours);		
		d.setMinutes(minutes);
		d.setSeconds(0, 0);
		return d;
	}
}

String.prototype.htmlEntities = function() {
	return String(this).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function parseDate(dateStr) {
    if (typeof dateStr != "string") {
        return dateStr;
    }

	/*
	// bug patch: it seems that new Date("2011-09-21") return 20th??? but if you use slashes instead ie. 2011/09/21 then it works :)
	if (this.length <= 10) {
		return new Date(Date.parse(this.replace("-", "/")));
	} else {
		return new Date(Date.parse(this));
	}
	*/
	var DATE_TIME_REGEX = /^(\d\d\d\d)-(\d\d)-(\d\d)T(\d\d):(\d\d):(\d\d)(\.\d+)?(\+|-)(\d\d):(\d\d)$/;
	var DATE_TIME_REGEX_Z = /^(\d\d\d\d)-(\d\d)-(\d\d)T(\d\d):(\d\d):(\d\d)\.\d+Z$/;
	var DATE_TIME_REGEX_Z2 = /^(\d\d\d\d)-(\d\d)-(\d\d)T(\d\d):(\d\d):(\d\d)+Z$/;
	var DATE_MILLI_REGEX = /^(\d\d\d\d)(\d\d)(\d\d)T(\d\d)(\d\d)(\d\d)$/;
	var DATE_REGEX = /^(\d\d\d\d)-(\d\d)-(\d\d)$/;
	var DATE_NOSPACES_REGEX = /^(\d\d\d\d)(\d\d)(\d\d)$/;

	/* Convert the incoming date into a javascript date
	 * 2012-09-26T11:42:00-04:00
	 * 2006-04-28T09:00:00.000-07:00
	 * 2006-04-28T09:00:00.000Z
	 * 2010-05-25T23:00:00Z (new one from jason)
	 * 2006-04-19
	 */

	  var parts = DATE_TIME_REGEX.exec(dateStr);
	  
	  // Try out the Z version
	  if (!parts) {
	    parts = DATE_TIME_REGEX_Z.exec(dateStr);
	  }
	  if (!parts) {
		parts = DATE_TIME_REGEX_Z2.exec(dateStr);
	  }
	  
	  if (exists(parts) && parts.length > 0) {
	    var d = new Date();
	    d.setUTCFullYear(parts[1], parseInt(parts[2], 10) - 1, parts[3]);
	    d.setUTCHours(parts[4]);
	    d.setUTCMinutes(parts[5]);
	    d.setUTCSeconds(parts[6]);
		d.setUTCMilliseconds(0);

	    var tzOffsetFeedMin = 0;
	    if (parts.length > 8) {
	      tzOffsetFeedMin = parseInt(parts[9],10) * 60 + parseInt(parts[10],10);
	      if (parts[8] != '-') { // This is supposed to be backwards.
	        tzOffsetFeedMin = -tzOffsetFeedMin;
	      }
	    }
	    return new Date(d.getTime() + tzOffsetFeedMin * ONE_MINUTE);
	  }
	  
	  parts = DATE_MILLI_REGEX.exec(dateStr);
	  if (exists(parts)) {
			var d = new Date();
			d.setFullYear(parts[1], parseInt(parts[2], 10) - 1, parts[3]);
		    d.setHours(parts[4]);
		    d.setMinutes(parts[5]);
		    d.setSeconds(parts[6]);
			d.setMilliseconds(0);
			return d;
	  }
	  if (!parts) {
		  parts = DATE_REGEX.exec(dateStr);
	  }
	  if (!parts) {
		  parts = DATE_NOSPACES_REGEX.exec(dateStr);
	  }
	  if (exists(parts) && parts.length > 0) {
	    return new Date(parts[1], parseInt(parts[2],10) - 1, parts[3]);
	  }
	  if (!isNaN(dateStr)) {
		  return new Date(dateStr);
	  }
	  return null;
}

function initAnalytics() {
	if (DetectClient.isChrome()) {
		console.log("initAnalytics");
		// load this immediately if in background
		var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
		ga.src = '/js/analytics.js';
		var s = document.getElementsByTagName('script')[0];
		if (s) {
			s.parentNode.insertBefore(ga, s);
		}
		
		$(document).ready(function() {
			$(document).on("click", "a, input, button", function() {
				var id = $(this).attr("ga");
				var label = null;
				if (id != "IGNORE") {
					if (!id) {
						id = $(this).attr("id");
					}
					if (!id) {
						id = $(this).attr("snoozeInMinutes");
						if (id) {
							label = "in minutes: " + id; 
							id = "snooze";
						}
						if (!id) {
							id = $(this).attr("snoozeInDays");
							if (id) {
								label = "in days: " + id; 
								id = "snooze";
							}
						}
						if (!id) {
							id = $(this).attr("msg");
						}
						if (!id) {
							id = $(this).attr("msgTitle");
						}
						if (!id) {
							id = $(this).attr("href");
							// don't log # so dismiss it
							if (id == "#") {
								id = null;
							}
						}
						if (id) {
							id = id.replace(/javascript\:/, "");
							// only semicolon so remove it and keep finding other ids
							if (id == ";") {
								id = "";
							}
						}
						if (!id) {
							id = $(this).parent().attr("id");
						}
						if (!id) {
							id = $(this).attr("class");
						}
					}
					if ($(this).attr("type") != "text") {
						if ($(this).attr("type") == "checkbox") {
							if (this.checked) {
								label = id + "_on";
							} else {
								label = id + "_off";
							}
						}
						var category = $(this).closest("*[gaCategory]");
						var action = null;
						// if gaCategory specified
						if (category.length != 0) {
							category = category.attr("gaCategory");
							action = id;
						} else {
							category = id;
							action = "click";
						}
						
						if (label != null) {
							sendGA(category, action, label);
						} else {
							sendGA(category, action);
						}
					}
				}
			});
		});
	}
}

// usage: sendGA('category', 'action', 'label');
// usage: sendGA('category', 'action', 'label', value);  // value is a number.
// usage: sendGA('category', 'action', {'nonInteraction': 1});
function sendGA(category, action, label, etc) {
	console.log("%csendGA: " + category + " " + action + " " + label, "font-size:0.6em");

	// patch: seems arguments isn't really an array so let's create one from it
	var argumentsArray = [].slice.call(arguments, 0);

	var gaArgs = ['send', 'event'];
	// append other arguments
	gaArgs = gaArgs.concat(argumentsArray);
	
	// send to google
	if (globalThis.ga) {
		ga.apply(this, gaArgs);
	}
}

function isAsianLangauge() {
	return /ja|zh|ko/.test(locale);
}

async function initMessagesInTemplates(templates) {
    if (templates) {
        for (let a=0; a<templates.length; a++) {
            let node = templates[a].content.firstElementChild;
            if (node) {
                initMessages(node, true);
                initMessages(node.querySelectorAll("*"), true);
                let innerTemplates = templates[a].content.querySelectorAll("template");
                initMessagesInTemplates(innerTemplates);
            }
        }
    } else {
        templates = document.querySelectorAll("template");
        if (templates.length) {
            initMessagesInTemplates(templates);
        }
    }
}

if (typeof($) != "undefined") {
    (async function() {
        // For some reason including scripts for popup window slows down popup window reaction time, so only found that settimeout would work
        if (location.href.includes("popup.") || location.href.includes("options.")) {
            await sleep(seconds(4));
        }
        initAnalytics();
    })();
}

async function initUI() {
    await initMisc({UIonly: true});
    initMessages();
    initMessagesInTemplates();
}

async function initMisc(params = {}) {
    if (!globalThis.initMiscPromise) {
        console.info("initMisc");
        globalThis.initMiscPromise = new Promise(async (resolve, reject) => {
            
            await DetectClient.init();

            if (!await storage.get("console_messages")) {
                console.log = console.debug = function () {};
            }

            locale = await storage.get("language");
            twentyFourHour = await storage.get("24hourMode");
            await loadLocaleMessages();
            initCalendarNames(dateFormat.i18n);
            await initOauthAPIs();
            Controller();
            initTasksColor();

            if (!params.UIonly) {
                console.info("initWindowBGVars");
    
                eventsShown = await storage.get("eventsShown");
                notificationsQueue = await storage.get("notificationsQueue");
                notificationsOpened = await storage.get("notificationsOpened");
                cachedFeeds = await storage.get("cachedFeeds");
                cachedFeedsDetails = await storage.get("cachedFeedsDetails");
    
                forgottenReminder = ForgottenReminder();
                ChromeTTS();
    
                await initPopup();
            
                initEventDates(eventsShown);
    
                calendarMap = await initCalendarMap();
    
                console.time("feeds");
                const arrayOfCalendars = await getArrayOfCalendars();
                const feeds = arrayOfCalendars.map(calendar => cachedFeeds[calendar.id]);
                console.time("mergeevents");
                events = await mergeEvents(feeds);
                console.timeEnd("mergeevents");
                console.timeEnd("feeds");
            }
            resolve();
        });
    }
    return globalThis.initMiscPromise;
}

function openContributeDialog(key) {
	openGenericDialog({
		title: getMessage("extraFeatures"),
		content: getMessage("extraFeaturesPopup1") + "<br>" + getMessage("extraFeaturesPopup2"),
		otherLabel: getMessage("contribute")
	}).then(function(response) {
		if (response == "other") {
			openUrl("contribute.html?action=" + key);
		}
	});
}

async function setStorage(element, params) {
	var OFF_OR_DEFAULT = DEFAULT_SETTINGS_ALLOWED_OFF.includes(params.key) && (!params.value || STORAGE_DEFAULTS[params.key] == params.value);
	if ((element.closest("[mustDonate]") || params.mustDonate) && !donationClickedFlagForPreventDefaults && !OFF_OR_DEFAULT) {
		params.event.preventDefault();
		openContributeDialog(params.key);
		return Promise.reject(JError.DID_NOT_CONTRIBUTE);
	} else {
		return storage.set(params.key, params.value);
	}
}

function initPaperElement($nodes, params = {}) {
	$nodes = selectorAll($nodes);
	$nodes.forEach(async element => {		
		const key = element.getAttribute("storage");
		element.removeAttribute("storage");
		var permissions;
		if (DetectClient.isChromium()) {
			permissions = element.getAttribute("permissions");
			element.removeAttribute("permissions");
		}

		if (key && key != "language") { // ignore lang because we use a specific logic inside the options.js
            let value = await storage.get(key);

            // exception
            if (key == "hideDelete") {
                value = await getHideDeleteFlag();
            }

            if (element.nodeName.equalsIgnoreCase("paper-checkbox")) {
                element.checked = toBool(value);
			} else if (element.nodeName.equalsIgnoreCase("paper-listbox")) {
                element.setAttribute("selected", value ?? "");
			} else if (element.nodeName.equalsIgnoreCase("paper-radio-group")) {
				element.setAttribute("selected", value ?? "");
			} else if (element.nodeName.equalsIgnoreCase("paper-slider")) {
				element.setAttribute("value", value);
			}
		} else if (permissions) {
			chrome.permissions.contains({permissions: [permissions]}, function(result) {
				element.checked = result;
			});
		}

        // need a 1ms pause or else setting the default above would trigger the change below?? - so make sure it is forgotten
        await sleep(500);

        var eventName;
        if (element.nodeName.equalsIgnoreCase("paper-checkbox")) {
            eventName = "change";
        } else if (element.nodeName.equalsIgnoreCase("paper-listbox")) {
            eventName = "iron-activate";
        } else if (element.nodeName.equalsIgnoreCase("paper-radio-group")) {
            eventName = "paper-radio-group-changed";
        } else if (element.nodeName.equalsIgnoreCase("paper-slider")) {
            eventName = "change";
        }
        
        element.addEventListener(eventName, function(event) {
            if (key || params.key) {
                
                var value;
                if (element.nodeName.equalsIgnoreCase("paper-checkbox")) {
                    value = element.checked;
                } else if (element.nodeName.equalsIgnoreCase("paper-listbox")) {
                    value = event.detail.selected;
                } else if (element.nodeName.equalsIgnoreCase("paper-radio-group")) {
                    value = element.selected;
                } else if (element.nodeName.equalsIgnoreCase("paper-slider")) {
                    value = element.getAttribute("value");
                } else if (element.nodeName.equalsIgnoreCase("paper-input")) {
                    value = element.value;
                }

                let storagePromise;
                
                if (key) {
                    storagePromise = setStorage(element, {event:event, key:key, value:value});
                } else if (params.key) {
                    params.event = event;
                    params.value = value;
                    storagePromise = setStorage(element, params);
                }
                
                storagePromise.catch(error => {
                    console.error("could not save setting: " + error);
                    if (element.nodeName.equalsIgnoreCase("paper-checkbox")) {
                        element.checked = !element.checked;
                    } else if (element.nodeName.equalsIgnoreCase("paper-listbox")) {
                        element.closest("paper-dropdown-menu").close();
                    }
                    
                    if (error != JError.DID_NOT_CONTRIBUTE) {
                        showError(error);
                    }
                });
            } else if (permissions) {
                if (element.checked) {
                    chrome.permissions.request({permissions: [permissions]}, function(granted) {
                        if (granted) {
                            element.checked = granted;
                        } else {
                            element.checked = false;
                            niceAlert("Might not be supported by this OS");
                        }
                    });
                } else {			
                    chrome.permissions.remove({permissions: [permissions]}, function(removed) {
                        if (removed) {
                            element.checked = false;
                        } else {
                            // The permissions have not been removed (e.g., you tried to remove required permissions).
                            element.checked = true;
                            niceAlert("These permissions could not be removed, they might be required!");
                        }
                    });
                }
            }
        });
	});
}

function _changeMessages(selectorOrNode) {
	// options page only for now..
    if (location.href.includes("options.html")
        || location.href.includes("reminders.html")
        || location.href.includes("contribute.html")) {
		htmlElement.dir = getMessage("dir");
	}

	var selector;
	if (selectorOrNode) {
		selector = selectorOrNode;
	} else {
		selector = "*";
	}

	selectorAll(selector).forEach(el => {
		let attr = el.getAttribute("msg");
		if (attr) {
            const msgArg1 = el.getAttribute("msgArg1");
			if (msgArg1) {
                el.textContent = getMessage( attr, msgArg1 )
                const msgArg2 = el.getAttribute("msgArg2");
				if (msgArg2) {
                    el.textContent = getMessage(attr, [msgArg1, msgArg2]);
				}
			} else {
				// look for inner msg nodes to replace before...
                const innerMsg = el.querySelectorAll("*[msg]");
				if (innerMsg.length) {
					_changeMessages(innerMsg);
                    const msgArgs = Array.from(innerMsg).map(msg => msg.outerHTML);
                    el.innerHTML = getMessage(attr, msgArgs);
				} else {
					if (el.nodeName == "PAPER-TOOLTIP") {
						const $innerNode = el.querySelector(".paper-tooltip");
						if ($innerNode) {
                            $innerNode.textContent = getMessage(attr);
						} else {
                            el.textContent = getMessage(attr);
						}
					} else {
                        el.textContent = getMessage(attr);
					}
				}
			}
		}

        function processAttribute(sourceAttr, sourceAttrArg1, destAttr) {
            const attr = el.getAttribute(sourceAttr);
            if (attr) {
                const msgArg1 = sourceAttrArg1 &&= el.getAttribute(sourceAttrArg1);
                if (msgArg1) {
                    el.setAttribute(destAttr, getMessage(attr, msgArg1));
                } else {
                    el.setAttribute(destAttr, getMessage(attr));
                }
            }
        }

        processAttribute("msgTitle", "msgTitleArg1", "title");
        processAttribute("msgLabel", "msgLabelArg1", "label");
        processAttribute("msgText", "msgTextArg1", "text");
        processAttribute("msgValue", "msgValueArg1", "value");
        processAttribute("msgPlaceholder", "msgPlaceholderArg1", "placeholder");

        attr = el.getAttribute("msgSrc");
		if (attr) {
			el.src = getMessage(attr);
		}

        attr = el.getAttribute("msgHTML");
		if (attr) {
			const msgArg1 = el.getAttribute("msgArg1");
			if (msgArg1) {
				const args = [msgArg1];

				const msgArg2 = el.getAttribute("msgArg2");
				if (msgArg2) {
					args.push(msgArg2);
				}

				el.innerHTML = getMessage(el.getAttribute("msgHTML"), args);
			} else {
				// look for inner msg nodes to replace before...
                const innerMsg = el.querySelectorAll("*[msg]");
				if (innerMsg.length) {
					_changeMessages(innerMsg);
                    const msgArgs = Array.from(innerMsg).map(msg => msg.outerHTML);
                    el.innerHTML = getMessage(attr, msgArgs);
				} else {
                    el.innerHTML = getMessage(attr);
				}
			}
		}
		attr = el.getAttribute("msgPosition");
		if (attr) {
			if (htmlElement.dir == "rtl" && attr == "left") {
				el.setAttribute("position", "right");
			} else if (htmlElement.dir == "rtl" && attr == "right") {
				el.setAttribute("position", "left");
			} else {
				el.setAttribute("position", attr);
			}
		}

		attr = el.getAttribute("msgTime");
		if (attr) {
			el.textContent = attr.parseTime().toLocaleTimeStringJ();
		}
	});

	function addWarning(attrName) {
        const WARNING_MESSAGE = "Not supported by this browser!";
		const $nodes = selectorAll(`[${attrName}]`);

        $nodes.forEach(el => {
            if (!el._warningAdded) {
                el._warningAdded = true;
                el.querySelector("paper-tooltip")?.remove();
    
                el.setAttribute("disabled", "");
                el.style.opacity = "0.5";
                
                const paperTooltip = document.createElement("paper-tooltip");
                paperTooltip.textContent = WARNING_MESSAGE;
                el.append(paperTooltip);
                onClick(el, function (e) {
                    openGenericDialog({ content: WARNING_MESSAGE });
                    e.preventDefault();
                    e.stopPropagation();
                });
		    }
        });
	}

	if (!DetectClient.isChromium()) {
		addWarning("chromium-only");
    }

    if (DetectClient.isFirefox()) {
        addWarning("not-firefox");
        removeAllNodes("[hide-from-firefox]")
    }

    if (DetectClient.isOpera()) {
        addWarning("not-opera");
        removeAllNodes("[hide-from-opera]");
    }
    
    if (DetectClient.isEdge()) {
        addWarning("hide-from-edge");
        removeAllNodes("[hide-from-edge]");
    }
    
    if (!DetectClient.isWindows()) {
        removeAllNodes("[windows-only]");
    }
}

async function initMessages(selectorOrNode, beforePolymer) { // beforePolymer useful for replacing msgs inside templates before polymer
	// patch for mac small popup issue: needed a delay or wait for polymer to load before replacing html?
	// v2 introduced macPopupException
	// v1 only used beforePolymer
    const macPopupException = DetectClient.isMac() && globalThis.fromToolbar;
    if (globalThis.polymerPromise && (!beforePolymer || macPopupException)) {
        await polymerPromise;
        if (DetectClient.isMac()) {
            await sleep(150);
        }
    }

    _changeMessages(selectorOrNode);
}

async function donationClicked(action) {
	if (await storage.get("donationClicked")) {
		return true;
	} else {
		openContributeDialog(action);
		return false;
	}
}

function getChromeWindows() {
	return new Promise((resolve, reject) => {
		chrome.windows.getAll(windows => {
			// keep only normal windows and not app windows like debugger etc.
			var normalWindows = windows.filter(thisWindow => {
				return thisWindow.type == "normal";
			});
			resolve(normalWindows);
		});
	});
}

function findTab(url) {
	return new Promise((resolve, reject) => {
		chrome.tabs.query({url:url + "*"}, tabs => {
			if (chrome.runtime.lastError){
	            console.error(chrome.runtime.lastError.message);
	            resolve();
			} else {
				if (tabs.length) {
					var tab = tabs.last();
					chrome.tabs.update(tab.id, {active:true}, () => {
						if (chrome.runtime.lastError) {
							resolve();
						} else {
							// must do this LAST when called from the popup window because if set focus to a window the popup loses focus and disappears and code execution stops
							chrome.windows.update(tab.windowId, {focused:true}, () => {
								resolve({found:true, tab:tab});
							});
						}
					});
				} else {
					resolve();
				}
			}
		});
	});
}

//usage: openUrl(url, {urlToFind:""})
function openUrl(url, params = {}) {
	return new Promise((resolve, reject) => {
		if (globalThis.inWidget) {
			top.location.href = url;
		} else {
			getChromeWindows().then(normalWindows => {
				if (normalWindows.length == 0) { // Chrome running in background
					var createWindowParams = {url:url};
					if (DetectClient.isChromium()) {
						createWindowParams.focused = true;
					}
					chrome.windows.create(createWindowParams, createdWindow => {
						findTab(url).then(response => {
							resolve(response);
						});
					});
				} else {
					new Promise((resolve, reject) => {
						if (params.urlToFind) {
							findTab(params.urlToFind).then(response => {
								resolve(response);
							});
						} else {
							resolve();
						}
					}).then(response => {
						if (response && response.found) {
							//chrome.tabs.update(response.tab.id, {url:url});
							return Promise.resolve(response);
						} else {
							return createTabAndFocusWindow(url);
						}
					}).then(response => {
						if (location.href.includes("source=toolbar") && DetectClient.isFirefox() && params.autoClose !== false) {
							globalThis.close();
						}
						resolve();
					});
				}
			});			
		}
	});
}

function createTabAndFocusWindow(url) {
	return new Promise((resolve, reject) => {
		new Promise((resolve, reject) => {
			if (DetectClient.isFirefox()) { // required for Firefox because when inside a popup the tabs.create would open a tab/url inside the popup but we want it to open inside main browser window 
				chrome.windows.getCurrent(thisWindow => {
					if (thisWindow && thisWindow.type == "popup") {
						chrome.windows.getAll({windowTypes:["normal"]}, windows => {
							if (windows.length) {
								resolve(windows[0].id)
							} else {
								resolve();
							}
						});
					} else {
						resolve();
					}
				});
			} else {
				resolve();
			}		
		}).then(windowId => {
			var createParams = {url:url};
			if (windowId != undefined) {
				createParams.windowId = windowId;
			}
			chrome.tabs.create(createParams, tab => {
				chrome.windows.update(tab.windowId, {focused:true}, () => {
					resolve(tab);
				});						
			});
		});
	});
}

function removeNode(id) {
	var o = document.getElementById(id);
	if (o) {
		o.parentNode.removeChild(o);
	}
}

function addCSS(id, css) {
	removeNode(id);
	const s = document.createElement('style');
	s.id = id;
	s.setAttribute('type', 'text/css');
	s.appendChild(document.createTextNode(css));
	(document.getElementsByTagName('head')[0] || document.documentElement).appendChild(s);
	return s;
}

function pad(str, times, character) { 
	var s = str.toString();
	var pd = '';
	var ch = character ? character : ' ';
	if (times > s.length) { 
		for (var i=0; i < (times-s.length); i++) { 
			pd += ch; 
		}
	}
	return pd + str.toString();
}

function toBool(str) {
	if ("false" === str || str == undefined) {
		return false;
	} else if ("true" === str) {
		return true;
	} else {
		return str;
	}
}

function getUrlValue(url, name, unescapeFlag) {
	if (url) {
	    var hash;
	    url = url.split("#")[0];
	    var hashes = url.slice(url.indexOf('?') + 1).split('&');
	    for(var i=0; i<hashes.length; i++) {
	        hash = hashes[i].split('=');
	        // make sure no nulls
	        if (hash[0] && name) {
				if (hash[0].toLowerCase() == name.toLowerCase()) {
					if (unescapeFlag) {
						return decodeURIComponent(hash[1]);
					} else {
						return hash[1];
					}
				}
	        }
	    }
	    return null;
	}
}

function setUrlParam(url, param, value) {
	var params = url.split("&");
	for (var a=0; a<params.length; a++) {
		var idx = params[a].indexOf(param + "=");
		if (idx != -1) {
			var currentValue = params[a].substring(idx + param.length + 1);
			
			if (value == null) {
				return url.replace(param + "=" + currentValue, "");
			} else {
				return url.replace(param + "=" + currentValue, param + "=" + value);
			}
		}
	}
	
	// if there is a hash tag only parse the part before;
	var urlParts = url.split("#");
	var newUrl = urlParts[0];
	
	if (!newUrl.includes("?")) {
		newUrl += "?";
	} else {
		newUrl += "&";
	}
	
	newUrl += param + "=" + value;
	
	// we can not append the original hashtag (if there was one)
	if (urlParts.length >= 2) {
		newUrl += "#" + urlParts[1];
	}
	
	return newUrl;
}

function exists(o) {
	if (o) {
		return true;
	} else {
		return false;	
	}	
}

function getExtensionIDFromURL(url) {
	//"chrome-extension://dlkpjianaefoochoggnjdmapfddblocd/options.html"
	return url.split("/")[2]; 
}

function findTag(str, name) {
	if (str) {
		var index = str.indexOf("<" + name + " ");
		if (index == -1) {
			index = str.indexOf("<" + name + ">");
		}
		if (index == -1) {
			return null;
		}
		var closingTag = "</" + name + ">";
		var index2 = str.indexOf(closingTag);
		return str.substring(index, index2 + closingTag.length);
	}
}

function trim(str) {
    if (str) {
        str = str.trim();
    }
    return str;
}

function trimLineBreaks(str) {
	if (str) {
		str = str.replace(/^\n*/g, "");
		str = str.replace(/\n*$/g, "");
	}
	return str;
}

function cleanEmailSubject(subject) {
	if (subject) {
		subject = subject.replace(/^re: ?/i, "");
		subject = subject.replace(/^fwd: ?/i, "");
	}
	return subject;	
}

function extractEmails(text) {
	if (text) {
		return text.match(/([a-zA-Z0-9.!#$%^_+-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi);
	}
}

function obscureEmails(str) {
    let matches = extractEmails(str);
    if (matches) {
        matches.forEach (email => {
            console.log(email);
            str = str.replace(email, email.split("@")[0].substring(0,3) + "...@cutoff.com");
        });
    }
    return str;
}

function getHost(url) {
	if (url) {
		var matches = url.match(/:\/\/([^\/?#]*)/);
		if (matches?.length >=2) {
			return matches[1];
		}
	}
}

function ellipsis(str, cutoffLength) {	
	if (str && str.length > cutoffLength) {
		str = str.substring(0, cutoffLength) + " ...";
	}
	return str;
}

function DetectSleepMode(wakeUpCallback) {
	var PING_INTERVAL = 60; // 1 minute
	var PING_INTERVAL_BUFFER = 15;
	
	var lastPingTime = new Date();
	var lastWakeupTime = new Date(1); // make the last wakeup time really old because extension starting up does not equal a wakeup 
	
	function lastPingIntervalToolLong() {
		return lastPingTime.diffInSeconds() < -(PING_INTERVAL+PING_INTERVAL_BUFFER);
	}
	
	this.ping = function() {
		if (lastPingIntervalToolLong()) {
			console.log("DetectSleepMode.wakeup time: " + new Date());
			lastWakeupTime = new Date();
			if (wakeUpCallback) {
				wakeUpCallback();
			}
		}
		lastPingTime = new Date();
	}

	this.isWakingFromSleepMode = function() {
		console.log("DetectSleepMode.last ping: " + lastPingTime);
		console.log("last wakeuptime: " + lastWakeupTime);
		console.log("current time: " + new Date())
		// if last wakeup time was recently set than we must have awoken recently
		if (lastPingIntervalToolLong() || lastWakeupTime.diffInSeconds() >= -(PING_INTERVAL+PING_INTERVAL_BUFFER)) {
			return true;
		} else {
			return false;
		}
	}
}

function Controller() {

	// apps.jasonsavard.com server
	Controller.FULLPATH_TO_PAYMENT_FOLDERS = "https://apps.jasonsavard.com/";
	
	// jasonsavard.com server
	//Controller.FULLPATH_TO_PAYMENT_FOLDERS = "https://jasonsavard.com/apps.jasonsavard.com/";

	// internal only for now
	function callAjaxController(params) {
        return fetchJSON(Controller.FULLPATH_TO_PAYMENT_FOLDERS + "controller.php", params.data, {
            method: params.method ? params.method : "GET",
            headers: {
                misc: location.href
            }
        });
	}

	Controller.verifyPayment = function(itemID, emails) {
		const data = {
            action: "verifyPayment",
            name: itemID,
            email: emails
        };
		return callAjaxController({data:data});
	}

	Controller.getSkins = function(ids, timeMin) {
		const data = {
            action: "getSkins",
            extension: "calendar",
            misc: location.href
        };

        if (ids) {
            data.ids = ids;
        }

		if (timeMin) {
			data.timeMin = Math.round(new Date().diffInSeconds(timeMin)); // seconds elapsed since now
		}
		
		return callAjaxController({data:data});
	}

	Controller.updateSkinInstalls = function(id, offset) {
		const data = {
            action: "updateSkinInstalls",
            id: id,
            offset: offset,
            misc: location.href
        };
		
		// had to pass misc as parameter because it didn't seem to be passed with header above
		return callAjaxController({data:data});
	}
	
	Controller.processFeatures = async () => {
		await storage.enable("donationClicked");
		chrome.runtime.sendMessage({command: "featuresProcessed"}, function(response) {});
	}

}

function getActiveTab() {
	return new Promise((resolve, reject) => {
		chrome.tabs.query({active: true, lastFocusedWindow: true}, function(tabs) {
			if (chrome.runtime.lastError) {
				reject(chrome.runtime.lastError.message);
			} else {
				if (tabs?.length >= 1) {
					resolve(tabs[0]);
				} else {
					resolve();
				}
			}
		});
	});
}

function ChromeTTS() {
	
	var chromeTTSMessages = [];
	var speaking = false;
	
	ChromeTTS.queue = function(msg, params = {}) {
		// this might have fixed the endless loop
		if (msg != null && msg != "") {
			params.utterance = msg;
			chromeTTSMessages.push(params);
			return play();
		} else {
			return Promise.resolve();
		}
	};

	ChromeTTS.stop = function() {
		if (chrome.tts) {
			chrome.tts.stop();
		}
		chromeTTSMessages = [];
		speaking = false;
	};

	ChromeTTS.isSpeaking = function() {
		return speaking;
	}

	function setVoiceByLang(chromeTTSMessage, lang, voices) {
		var voiceFound = voices.find(voice => {
			return voice.lang && voice.lang.match(lang);
		});
		
		if (voiceFound) {
			chromeTTSMessage.voiceName = voiceFound.voiceName;
			chromeTTSMessage.extensionId = voiceFound.extensionId;
		}
	}

	function play() {
		return new Promise(async (resolve, reject) => {

            // must declare these here because chrome.tts.* had issues with async callbacks and trying to queue several phrases
            const voiceParams = await storage.get("notificationVoice");
            const volume = await storage.get("voiceSoundVolume") / 100;
            const pitch = parseFloat(await storage.get("pitch"));
            const rate = parseFloat(await storage.get("rate"));

			if (chromeTTSMessages.length) {
				chrome.tts.isSpeaking(speakingParam => {
					console.log(speaking + " : " + speakingParam);
					if (!speaking && !speakingParam) {
						
						var chromeTTSMessage = chromeTTSMessages[0];
						
						if (chromeTTSMessage.utterance) {
							// decoded etity codes ie. &#39; is ' (apostrohpe)
							chromeTTSMessage.utterance = htmlToText(chromeTTSMessage.utterance);
						} else {
							chromeTTSMessage.utterance = "";
						}

						chromeTTSMessage.voiceName = voiceParams.split("___")[0];
						chromeTTSMessage.extensionId = voiceParams.split("___")[1];

						console.log("speak: " + chromeTTSMessage.utterance);
						speaking = true;
						chrome.tts.stop();
						
						chrome.i18n.detectLanguage(chromeTTSMessage.utterance, result => {
							chrome.tts.getVoices(voices => {
								var voiceUserChose = voices.find(voice => {
									return voice.voiceName == chromeTTSMessage.voiceName && voice.extensionId == chromeTTSMessage.extensionId;
								});
								
								if (!voiceUserChose || !voiceUserChose.lang) {
									// user chose voice with a lang (ie. native) don't use auto-detect because it does not have a fallback lang attribute
								} else if (chromeTTSMessage.forceLang) {
									if (voiceUserChose && voiceUserChose.lang && voiceUserChose.lang.match(chromeTTSMessage.forceLang)) {
										// since forced lang is same a user chosen lang then do nothing and use the user default
									} else {
										setVoiceByLang(chromeTTSMessage, chromeTTSMessage.forceLang, voices);
									}
								} else if (result.isReliable) {
									var detectedLang = result.languages.first().language;
									console.log("detectedLang: " + detectedLang);
									if (voiceUserChose && voiceUserChose.lang && voiceUserChose.lang.match(detectedLang)) {
										// do nothing
									} else {
										setVoiceByLang(chromeTTSMessage, detectedLang, voices);
									}
								} else if (chromeTTSMessage.defaultLang) {
									setVoiceByLang(chromeTTSMessage, chromeTTSMessage.defaultLang, voices);
								}
								
								// check the time between when we executed the speak command and the time between the actual "start" event happened (if it doesn't happen then let's break cause we could be stuck)
								var speakNotStartedTimer = setTimeout(function() {
									console.log("start event never happened: so stop voice");
									// stop will invoke the "interuppted" event below and it will process end/next speak events
									chrome.tts.stop();
								}, seconds(4));
								
								chrome.tts.speak(chromeTTSMessage.utterance, {
									voiceName: chromeTTSMessage.voiceName,
									extensionId : chromeTTSMessage.extensionId,
                                        //enqueue : true,
                                        volume: volume,
                                        pitch: pitch,
                                        rate: rate,
										onEvent: function(event) {
											console.log('event: ' + event.type);			
											if (event.type == "start") {
												clearTimeout(speakNotStartedTimer);
											} else if (event.type == "interrupted" || event.type == 'error' || event.type == 'end' || event.type == 'cancelled') {
												clearTimeout(speakNotStartedTimer);
												chromeTTSMessages.shift();
												speaking = false;

                                                // delay between plays
                                                setTimeout(function() {
                                                    play().then(() => {
                                                        resolve();
                                                    }).catch(error => {
                                                        reject(error);
                                                    });
                                                }, chromeTTSMessage.noPause ? 1 : 150);
											}
										}
									}, function() {
										if (chrome.runtime.lastError) {
									        logError('speech error: ' + chrome.runtime.lastError.message);
										}
									});
							});
						});
					} else {
						console.log("already speaking, wait before retrying...");
						setTimeout(function() {
							play().then(() => {
								resolve();
							}).catch(error => {
								reject(error);
							});
						}, seconds(1));
					}
				});
			} else {
				resolve();
			}
		});
	}
}

async function fetchWrapper(url, options) {
    try {
        return await fetch(url, options);
    } catch (error) {
        console.error("fetch error: " + error);
        if (isOnline()) {
            const customError = Error(getMessage("networkProblem"));
            customError.originalError = error;
            customError.jError = JError.NETWORK_ERROR;
            throw customError;
        } else {
            throw getMessage("yourOffline");
        }
    }
}

async function fetchText(url, searchStreamFunction) {
    const response = await fetchWrapper(url);
    if (response.ok) {
        if (searchStreamFunction) {
            const reader = response.body.getReader();
            const utf8decoder = new TextDecoder();
            let data = "";
            let searchResult;

            console.log("start")
            return reader.read().then(function processText({ done, value }) {
                if (done) {
                    console.log("Stream complete");
                    return;
                } else {
                    console.log("Stream read");
                }
            
                data += utf8decoder.decode(value, {stream: true});

                searchResult = searchStreamFunction(data);
                console.log("search result: ", searchResult);
                if (searchResult) {
                    console.log("found");
                    reader.cancel("searchFound");
                    return;
                } else {
                    return reader.read().then(processText);
                }
            }).then(() => {
                console.log("end: ", searchResult);
                return searchResult;
            });
        } else {
        return response.text();
        }
    } else {
        const error = Error(response.statusText);
        error.status = response.status;
        throw error;
    }
}

async function fetchJSON(url, data, options = {}) {
    if (options.method) {
        options.method = options.method.toUpperCase();
    }

    if (data) {
        // default is get
        if (!options.method || /GET/i.test(options.method)) {
            if (!url.searchParams) {
                url = new URL(url);
            }

            // formdata should not be passed as GET (actually fails) but if we let's convert it to url parameters
            if (data instanceof FormData) {
                for (const pair of data.entries()) {
                    url.searchParams.append(pair[0], pair[1]);
                }
            } else {            
                Object.keys(data).forEach(key => {
                    if (Array.isArray(data[key])) {
                        data[key].forEach(value => {
                            url.searchParams.append(key + "[]", value);
                        });
                    } else {
                        url.searchParams.append(key, data[key]);
                    }
                });
            }
        } else { // must be post, patch, delete etc..
            if (!options.headers) {
                options.headers = {};
            }

            const contentType = options.headers["content-type"] || options.headers["Content-Type"];
            if (contentType && contentType.includes("application/json")) {
                options.body = JSON.stringify(data);
            } else if (contentType && contentType.includes("multipart/mixed")) {
                options.body = data;
            } else if (data instanceof FormData) {
                options.body = data;
            } else {
                var formData = new FormData();
                Object.keys(data).forEach(key => formData.append(key, data[key]));
                options.body = formData;
            }
        }
    }
    
    //console.log("fetchJSON", url, options);
    const response = await fetchWrapper(url, options);
    //console.log("response", response);

    let responseData = await response.text();
    if (responseData) {
        try {
            responseData = JSON.parse(responseData);
        } catch (error) {
            console.warn("Response probaby text only: " + error);
        }
    }
    if (response.ok) {
        return responseData;
    } else {
        if (responseData) {
            if (typeof responseData.code === "undefined") { // code property alread exists so let's use fetchReturnCode
                responseData.code = response.status;
            } else {
                responseData.fetchReturnCode = response.status;
            }
            throw responseData;
        } else {
            throw response.statusText;
        }
    }
}

function openWindowInCenter(url, title, specs, popupWidth, popupHeight) {
	var left = (screen.width/2)-(popupWidth/2);
	var top = (screen.height/2)-(popupHeight/2);
	return globalThis.open(url, title, specs + ", width=" + popupWidth + ", height=" + popupHeight + ", top=" + top + ", left=" + left)
}

function OAuthForDevices(defaultParams) {

	var that = this;

	const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
	const GOOGLE_CLIENT_ID = "74919836968-1vv8gkse5mjv8ppr8qnjdms2hd6ot4sv.apps.googleusercontent.com";
    const GOOGLE_REDIRECT_URI = "https://apps.jasonsavard.com/oauth2callback";
    
	const BASE_URI = "https://www.googleapis.com/calendar/v3";

    async function getTokenResponses() {
        return await storage.getEncryptedObj(defaultParams.storageKey, dateReviver) || [];
    }

    async function setTokenResponses(tokenResponses) {
        await storage.setEncryptedObj(defaultParams.storageKey, tokenResponses);
    }

    async function sequentialFunction(fn) {
        return new Promise(async (resolve, reject) => {
            if (that.sequentialFunctionPromise) {
                await that.sequentialFunctionPromise;
                await fn();
                that.sequentialFunctionPromise = null;
                resolve();
            } else {
                that.sequentialFunctionPromise = new Promise(async (resolve, reject) => {
                    await fn();
                    resolve();
                }).then(() => {
                    that.sequentialFunctionPromise = null;
                    resolve();
                })
            }
        });
    }

    async function updateToken(tokenResponse) {
        await sequentialFunction(async () => {
            const tokenResponses = await getTokenResponses();
            const index = await that.findTokenResponseIndex(tokenResponse);
            tokenResponses[index] = tokenResponse;
            await setTokenResponses(tokenResponses);
        });
    }

    this.getSecurityToken = async () => {
		return storage.get(defaultParams.securityTokenKey);
    }

	this.generateSecurityToken = async () => {
        const securityToken = getUniqueId();
        await storage.set(defaultParams.securityTokenKey, securityToken);
        return securityToken;
    }
    
    this.removeSecurityToken = async () => {
        return storage.remove(defaultParams.securityTokenKey);
    }
	
	this.getUserEmails = async function() {
        return (await getTokenResponses()).map(tokenResponse => tokenResponse.userEmail);
	}

	if (defaultParams.getUserEmail) {
		// override default with this method
		this.getUserEmail = defaultParams.getUserEmail;
	} else {
		// return just the emailid
		this.getUserEmail = function(tokenResponse) {
			return new Promise((resolve, reject) => {
				// were using the contacts url because it's the only one we request permission to and it will give us the email id (so only fetch 1 result)
				// send token response since we don't have the userEmail
				sendOAuthRequest({tokenResponse:tokenResponse, url: "/calendars/primary"}).then(data => {
                    resolve({
                        userEmail: data.id
                    });
				}).catch(error => {
					// redirectUrl not being triggered? refer to https://jasonsavard.com/forum/discussion/comment/19484#Comment_19484
					/*
					if (error.redirectUrl) {
						error += " A corporate firewall is possibly blocking calls: " + error.redirectUrl;
					} else {
						error += " (Could not get userinfo - you might by re-trying to fetch the userEmail for the non default account)";
					}
					*/
					error += " You might have a Single Sign-On corporate account or using the non default account.";
					reject(error);
				});
			});
		}
	}

	function onTokenErrorWrapper(tokenResponse, response) {
		// 400 is returned when refresing token and 401 when .send returns... // means user has problably revoked access: statusText = Unauthorized message = Invalid Credentials
        console.log("tokenonerror response", response);
		if (response.oauthAction == "refreshToken" && (response.code == 400 || response.code == 401)) {
			console.error("user probably revoked access so removing token:", response);
			that.removeTokenResponse(tokenResponse);			
		}
	}	

    function setExpiryDate(tokenResponse) {
        // expires_in params is in seconds (i think)
        tokenResponse.expiryDate = new Date(Date.now() + (tokenResponse.expires_in * 1000));
    }
    
	this.openPermissionWindow = function(params = {}) {
		return new Promise(async (resolve, reject) => {
            const scopes = params.scopes || defaultParams.scope;
            const stateParams = `${chrome.runtime.getURL(`oauth2callback.html?security_token=${await that.generateSecurityToken()}`)}&scopes=${scopes}`;

			var url = `${GOOGLE_AUTH_URL}?response_type=code&client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${GOOGLE_REDIRECT_URI}&scope=${encodeURIComponent(scopes)}&state=${encodeURIComponent(stateParams)}`;
			
			var prompt = "consent";
			
			if (params.email) {
				url += `&login_hint=${encodeURIComponent(params.email)}`;
			} else {
				prompt += " select_account";
			}
			
			url += `&prompt=${encodeURIComponent(prompt)}`;
            url += "&access_type=offline"; // required when I used https://www.googleapis.com/oauth2/v4/token (instead of the old way https://accounts.google.com/o/oauth2/v2/auth) or else refresh_token was not returned
            url += "&include_granted_scopes=true";

			var width = 600;
			var height = DetectClient.isFirefox() ? 750 : 900;
			var left = (screen.width/2)-(width/2);
			var top = (screen.height/2)-(height/2);
			
			if (chrome.windows) {
				chrome.windows.create({url:url, width:width, height:height, left:Math.round(left), top:Math.round(top), type:"popup"}, function(newWindow) {
					resolve(newWindow);
				});
			} else {
				const newWindow = openWindowInCenter(url, 'oauth', 'toolbar=0,scrollbars=0,menubar=0,resizable=0', width, height);
				resolve(newWindow);
			}
			
		});
	}
	
    async function oauthFetch(url, data, options = {}) {
        try {
            return await fetchJSON(url, data, options);
        } catch (response) {
            let error;
            if (response.error) {
                if (response.error.message) {
                    error = Error(response.error.message);
                    error.code = response.error.code;
                } else { // token errors look like this {"error": "invalid_grant", "error_description": "Bad Request"}
                    error = Error(response.error);
                    error.code = response.code;
                }
            } else if (typeof response == "object") {
                error = Error(response.statusText);
                error.code = response.status;
                if (response.jError) {
                    error.jError = response.jError;
                }
            } else {
                error = response;
            }

            if (error == "invalid_grant" || error == "invalid_request" || error.code == 401) { // i removed 400 because it happens when entering invalid data like a quick add of "8pm-1am Test 1/1/19"
                error.message = "You need to re-grant access, it was probably revoked";
            }

            console.error("error in oauthFetch: " + error);
            throw error;
        }
    }    

	this.generateURL = async function (userEmail, url) {
        const tokenResponse = await that.findTokenResponse({ userEmail: userEmail });
        if (tokenResponse) {
            const response = await ensureToken(tokenResponse);
            // before when calling refreshtoken we used to call this method, notice the tokenResponse came from the response and not that one passed in... params.generatedURL = setUrlParam(url, "access_token", params.tokenResponse.access_token);
            response.generatedURL = setUrlParam(url, "access_token", tokenResponse.access_token);
            return response;
        } else {
            throw new Error("No tokenResponse found!");
        }
	}
	
	async function sendOAuthRequest(params) {
        let url;
        if (params.url.indexOf("http") == 0) { // absolute
			url = new URL(params.url);
		} else { // relative
			url = new URL(BASE_URI + params.url); // couldn't use base as 2nd parameter because BASE_URI contains itself a path
		}

		let accessToken;
		if (params.tokenResponse) {
			accessToken = params.tokenResponse.access_token;
		} else if (params.userEmail) {
			var tokenResponse = await that.findTokenResponse(params);
			accessToken = tokenResponse.access_token;
        }
        
		if (params.appendAccessToken) {
			params.data = initUndefinedObject(params.data);
			params.data.access_token = accessToken;
		}
			
		if (/delete/i.test(params.type)) {
			params.data = null;
        }
        
        const options = {
            headers: {
                Authorization: "Bearer " + accessToken,
            },
        }

        if (params.headers) {
            options.headers = {...options.headers, ...params.headers};
        }

        if (params.type) {
            options.method = params.type.toUpperCase(); // was getting CORS and Access-Control-Allow-Origin errors!!
        }

        if (params.noCache) {
            options.cache = "no-cache";
        }

        options.headers["content-type"] = params.contentType || "application/json; charset=utf-8";

        options.mode = "cors";

        try {
            const data = await oauthFetch(url, params.data, options);
            // empty data happens when user does a method like DELETE where this no content returned
            return data || {};
        } catch (error) {
            copyObj(params, error);
            throw error;
        }
	}
	
	async function ensureToken(tokenResponse) {
        if (tokenResponse.chromeProfile) {
            const getAuthTokenParams = {
                interactive: false,
                scopes: (tokenResponse.scopes || Scopes.CALENDARS_READ_WRITE).split(" ") // legacy default to initial full scope (before i reduced them)
            };
            try {
                tokenResponse.access_token = await getAuthToken(getAuthTokenParams);
                await updateToken(tokenResponse);
                return {};
            } catch (errorMessage) {
                const error = Error(errorMessage);
                error.tokenResponse = tokenResponse;
                error.oauthAction = "refreshToken";

                if (error.toString().includes("OAuth2 not granted or revoked")) {
                    error.code = 401;
                }
                throw error;
            }
        } else if (isExpired(tokenResponse)) {
            console.log("token expired: ", tokenResponse);
            return refreshToken(tokenResponse);
        } else {
            return {};
        }
	}
	
	async function refreshToken(tokenResponse) {
		console.log("refresh token: " + tokenResponse.userEmail + " now time: " + Date.now().toString());
		
		let data = {
            refresh_token: tokenResponse.refresh_token,
            extension: ITEM_ID,
        };

		// old OAuth client ID (in new way, I save the client id in tokenresponse)
		if (!tokenResponse.clientId) {
            data.old_client_id = true;
        }
        
        try {
            data = await getAuthTokenFromServer(data);
        } catch (error) {
            error.tokenResponse = tokenResponse;
            error.oauthAction = "refreshToken";
            throw error;
        }

        tokenResponse.access_token = data.access_token;
        tokenResponse.token_type = data.token_type;
        tokenResponse.expires_in = data.expires_in;
        setExpiryDate(tokenResponse);

        // patch #1 of 2 for access revoke concurrency issue, because array items were being overwritten : https://jasonsavard.com/forum/discussion/5171/this-access-was-revoked-error-keeps-happening-even-after-reinstalling-etc#latest
        // you can reproduce this by setting expired access tokens to ALL accounts and using old expiry dates and then reload the extension, it's intermittent
        await updateToken(tokenResponse);

        return {tokenResponse:tokenResponse};
	}
	
	// private isExpired
	function isExpired(tokenResponse) {
		var SECONDS_BUFFER = -300; // 5 min. yes negative, let's make the expiry date shorter to be safe
		return !tokenResponse.expiryDate || new Date().isAfter(tokenResponse.expiryDate.addSeconds(SECONDS_BUFFER, true));
    }
    
    function getAuthToken(params) {
        return new Promise((resolve, reject) => {
            chrome.identity.getAuthToken(params, token => {
                if (chrome.runtime.lastError) {
                    console.info("getAuthToken error: " + chrome.runtime.lastError.message, token);
                    reject(chrome.runtime.lastError.message);
                } else {
                    resolve(token);
                }
            });
        });
    }

    function eStr(raw, offset = 1) {
        let str = "";
        for (let i = 0; i < raw.length; i++) {
            str += String.fromCharCode(raw.charCodeAt(i) + offset);
        }
        return str;
    }

    function dStr(raw, offset = -1) {
        return eStr(raw, offset);
    }

    async function getAuthTokenFromServer(data) {
        data.version = "3";

        if (data.refresh_token) {
            data.ert = eStr(data.refresh_token);
            delete data.refresh_token;
        }

        const rawResponse =  await oauthFetch("https://extensions-auth.uc.r.appspot.com/oauthToken", data, {
            method: "post",
            headers: {
                "content-type": "application/json" // required for golang or would come in as ==part form-data ...
            },
        });
        
        const response = dStr(rawResponse);
        return JSON.parse(response);
    }

	// public method, should be called before sending multiple asynchonous requests to .send
	this.ensureTokenForEmail = async function(userEmail) {
        var tokenResponse = await that.findTokenResponse({userEmail:userEmail});
        if (tokenResponse) {
            try {
                return await ensureToken(tokenResponse);
            } catch (error) {
                onTokenErrorWrapper(tokenResponse, error);
                throw error;
            }
        } else {
            const error = Error("no token for: " + userEmail + ": might have not have been granted access");
            error.jerror = JError.NO_TOKEN;
            console.error(error);
            throw error;
        }
	}		
	
	this.send = async function(params) {
        var tokenResponse = await that.findTokenResponse(params);		
        if (tokenResponse) {
            try {
                await ensureToken(tokenResponse);
                const response = await sendOAuthRequest(params);
                response.roundtripArg = params.roundtripArg;
                return response;
            } catch (error) {
                onTokenErrorWrapper(tokenResponse, error);
                error.roundtripArg = params.roundtripArg;
                throw error;
            }
        } else {
            const error = new Error("no token response found for email: " + params.userEmail);
            error.jerror = JError.NO_TOKEN;
            console.warn(error, params);
            throw error;
        }
	}

	this.findTokenResponseIndex = async function(params) {
        const tokenResponses = await getTokenResponses();
        return tokenResponses.findIndex(element => element.userEmail == params.userEmail);
	}

	this.findTokenResponse = async function(params) {
		var index = await that.findTokenResponseIndex(params);
		if (index != -1) {
            const tokenResponses = await getTokenResponses();
			return tokenResponses[index];
		}
	}
	
	this.removeTokenResponse = async function(params) {
        const index = await that.findTokenResponseIndex(params);
        if (index != -1) {
            const tokenResponses = await getTokenResponses();
            tokenResponses.splice(index, 1);
            await setTokenResponses(tokenResponses);
        }
	}

	this.removeAllTokenResponses = async function() {
        await setTokenResponses([]);
	}

	this.removeAllCachedTokens = async function() {
        const tokenResponses = await getTokenResponses();
        const removeTokenPromises = tokenResponses.map(tokenResponse => removeCachedAuthToken(tokenResponse.access_token));
        return alwaysPromise(removeTokenPromises);
	}

	this.getAccessToken = async function(params) {
		that.code = params.code;
        console.log("get access token");
        let tokenResponse;
        
        if (params.code) {

            tokenResponse = await getAuthTokenFromServer({
                code: params.code,
                extension: ITEM_ID,
            });

            that.removeSecurityToken();
        } else {
            if (params.refetch) {
                if (params.userEmail) {
                    const tokenResponse = await that.findTokenResponse({ userEmail: userEmail });
                    try {
                        await removeCachedAuthToken(tokenResponse.access_token);
                    } catch (error) {
                        // nothing
                        console.warn(error);
                    }
                } else {
                    await that.removeAllCachedTokens();
                }
            }

            tokenResponse = {
                chromeProfile: true
            };
            
            const getAuthTokenParams = {
                interactive: true,
                scopes: (params.scopes || defaultParams.scope).split(" ")
            };

            let token;
            try {
                token = await getAuthToken(getAuthTokenParams);
            } catch (error) {
                // patch seems even on success it would return an error, but calling it 2nd time would get the token
                getAuthTokenParams.interactive = false;
                token = await getAuthToken(getAuthTokenParams);
            }
            tokenResponse.access_token = token;
        }

        const response = await that.getUserEmail(tokenResponse, sendOAuthRequest);
        if (response.userEmail) {
            // add this to response
            tokenResponse.userEmail = response.userEmail;
            if (response.name) {
                tokenResponse.name = response.name;
            }
            if (response.photoUrl) {
                tokenResponse.photoUrl = response.photoUrl;
            }
            tokenResponse.clientId = GOOGLE_CLIENT_ID;
            tokenResponse.scopes = params.scopes || defaultParams.scope;

            if (tokenResponse.expires_in) {
                setExpiryDate(tokenResponse);
            }

            const tokenResponses = await getTokenResponses();
            const index = await that.findTokenResponseIndex(response);
            if (index != -1) {
                // update if exists
                tokenResponses[index] = tokenResponse;
            } else {
                // add new token response
                tokenResponses.push(tokenResponse);
            }
            await setTokenResponses(tokenResponses);
            return { tokenResponse: tokenResponse };
        } else {
            throw new Error("Could not fetch email");
        }
	} 
}

function ChromeStorage(params = {}) {
	let that = this;
    let cachedItems;
	
	let storageArea;
	if (params.storageArea == "sync" && chrome.storage.sync) {
		storageArea = chrome.storage.sync;
	} else {
		storageArea = chrome.storage.local;
	}

    // Chrome 88 seems it was faster to retrieve all items instead of one by one
    // note, it's important to remove the cache after loading the page, I enforce this with a timeout
    this.iniStorageCache = async function () {
        return new Promise((resolve, reject) => {
            chrome.storage.local.get(null, items => {
                cachedItems = items;

                // as a fail safe I remove the cache after a 2 seconds
                setTimeout(() => {
                    if (cachedItems) {
                        console.log("fail safe remove cache")
                        cachedItems = null;
                    }
                }, seconds(2));
                
                resolve(items);
            });
        });
    }

    this.clearCache = function () {
        console.log("fail safe remove cache")
        cachedItems = null;
    }

    function getItem(items, key, raw) {
        if (items[key] === undefined) {
            if (!raw) {
                return STORAGE_DEFAULTS[key];
            }
        } else {
            if (!raw) {
                items[key] = JSON.parse(JSON.stringify(items[key]), dateReviver);
            }
            return items[key];
        }
    }

	this.get = function(key, raw = null) {
        return new Promise((resolve, reject) => {
            if (cachedItems) {
                //console.log("from cache: " + key);
                resolve(getItem(cachedItems, key, raw));
            } else {
                //console.log("NOT cache: " + key);
                storageArea.get(key, items => {
                    if (chrome.runtime.lastError) {
                        reject(chrome.runtime.lastError.message);
                    } else {
                        resolve(getItem(items, key, raw));
                    }
                });
            }
        });
    }

    this.getRaw = function(key) {
        return that.get(key, true);
    }

    this.getEncodedUint8Array = async function(key) {
        const value = await that.getRaw(key);

        if (typeof value !== "undefined") {
            const ary = value.split(',');
            return Uint8Array.from(ary);
        }
    }

    this.getEncodedArrayBuffer = async function(key) {
        const uint8array = await that.getEncodedUint8Array(key);
        return uint8array?.buffer;
    }
	
	this.set = function(key, value) {
		return new Promise((resolve, reject) => {
			if (value === undefined) {
				var error = "value not set for key: " + key;
				console.error(error);
				reject(error);
			}
			
			let storageValue;

			// clone any objects/dates etc. or else we could modify the object outside and the cache will also be changed
			if (value instanceof Date) {
				storageValue = value.toJSON(); // must stringify this one because chrome.storage does not serialize
            } else if (value instanceof Uint8Array) {
                storageValue = value.toString();
            } else if (value instanceof ArrayBuffer) {
                const uint8array = new Int8Array(value);
                storageValue = uint8array.toString();
			} else if (value !== null && typeof value === 'object') {
                storageValue = JSON.parse(JSON.stringify(value));
			} else {
				storageValue = value;
			}
			
			let item = {};
			item[key] = storageValue;
			storageArea.set(item, function() {
				if (chrome.runtime.lastError) {
					var error = "Error with saving key: " + key + " " + chrome.runtime.lastError.message;
					console.error(error);
					reject(error);
				} else {
                    if (cachedItems) {
                        cachedItems[key] = storageValue;
                    }
					resolve();
				}
			});
		});
	}
    
    this.setEncryptedObj = async function (key, value, replacer = null) {
        const encryptedObj = await Encryption.encryptObj(value, replacer);
        return that.set(key, encryptedObj);
    };

    this.getEncryptedObj = async function(key, reviver = null) {
        const value = await that.getEncodedArrayBuffer(key);
        try {
            return await Encryption.decryptObj(value, reviver);
        } catch (error) {
            console.log("Use default value probably not enc or first time: ", key, error);
            return STORAGE_DEFAULTS[key];
        }
    }
    
	this.enable = function(key) {
		return that.set(key, true);
	}

	this.disable = function(key) {
		return that.set(key, false);
	}
	
	this.setDate = function(key) {
		return that.set(key, new Date());
	}
	
	this.toggle = async function(key) {
    	if (await that.get(key)) {
    		return that.remove(key);
    	} else {
    		return that.set(key, true);
    	}
	}
	
	this.remove = function(key) {
		return new Promise((resolve, reject) => {
			storageArea.remove(key, function() {
				if (chrome.runtime.lastError) {
					var error = "Error removing key: " + key + " " + chrome.runtime.lastError.message;
					console.error(error);
					reject(error);
				} else {
                    if (cachedItems) {
                        delete cachedItems[key];
                    }
					resolve();
				}
			});
		});
	}
	
	this.clear = function() {
		return new Promise((resolve, reject) => {
			storageArea.clear(function() {
				if (chrome.runtime.lastError) {
					var error = "Error clearing cache: " + chrome.runtime.lastError.message;
					console.error(error);
					reject(error);
				} else {
                    cachedItems = null;
					resolve();
				}
			});
		});
	}
	
	this.firstTime = async function(key) {
		if (await that.get("_" + key)) {
			return false;
		} else {
			await that.set("_" + key, new Date());
			return true;
		}
	}
}

var storage = new ChromeStorage();

function lightenDarkenColor(col, amt) {
	if (col) {
	    var usePound = false;
	    if ( col[0] == "#" ) {
	        col = col.slice(1);
	        usePound = true;
	    }
	
	    var num = parseInt(col,16);
	
	    var r = (num >> 16) + amt;
	
	    if ( r > 255 ) r = 255;
	    else if  (r < 0) r = 0;
	
	    var b = ((num >> 8) & 0x00FF) + amt;
	
	    if ( b > 255 ) b = 255;
	    else if  (b < 0) b = 0;
	
	    var g = (num & 0x0000FF) + amt;
	
	    if ( g > 255 ) g = 255;
	    else if  ( g < 0 ) g = 0;
	
	    var hex = (g | (b << 8) | (r << 16)).toString(16);
	    
	    // seems if color was already dark then making it darker gave us an short and invalid hex so let's make sure its 6 long
	    if (hex.length == 6) {
	    	return (usePound?"#":"") + hex;
	    } else {
	    	// else return same color
	    	return col;
	    }
	}
}

function hexToRgb(hex) {
	var c;
	if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
		c = hex.substring(1).split('');
		if (c.length == 3) {
			c = [c[0], c[0], c[1], c[1], c[2], c[2]];
		}
		c = '0x' + c.join('');
		return [(c >> 16) & 255, (c >> 8) & 255, c & 255];
	}
	//throw new Error('Bad Hex: ' + hex);
}

function rgbToHsv(r, g, b) {
	r /= 255, g /= 255, b /= 255;

	var max = Math.max(r, g, b), min = Math.min(r, g, b);
	var h, s, v = max;

	var d = max - min;
	s = max == 0 ? 0 : d / max;

	if (max == min) {
		h = 0; // achromatic
	} else {
		switch (max) {
			case r: h = (g - b) / d + (g < b ? 6 : 0); break;
			case g: h = (b - r) / d + 2; break;
			case b: h = (r - g) / d + 4; break;
		}

		h /= 6;
	}

	return [h, s, v];
}

function rgbToHsl(r, g, b) {
	r /= 255, g /= 255, b /= 255;
	var max = Math.max(r, g, b), min = Math.min(r, g, b);
	var h, s, l = (max + min) / 2;

	if (max == min) {
		h = s = 0; // achromatic
	} else {
		var d = max - min;
		s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
		switch (max) {
			case r: h = (g - b) / d + (g < b ? 6 : 0); break;
			case g: h = (b - r) / d + 2; break;
			case b: h = (r - g) / d + 4; break;
		}
		h /= 6;
	}

	return [h, s, l];
}

function setRgbOpacity(rgbString, opacity) {
	rgbString = rgbString.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
	return "rgba(" + rgbString[1] + "," + rgbString[2] + "," + rgbString[3] + "," + opacity + ")";
}

function hsvToRgb(h, s, v) {
	var r, g, b;

	var i = Math.floor(h * 6);
	var f = h * 6 - i;
	var p = v * (1 - s);
	var q = v * (1 - f * s);
	var t = v * (1 - (1 - f) * s);

	switch (i % 6) {
		case 0: r = v, g = t, b = p; break;
		case 1: r = q, g = v, b = p; break;
		case 2: r = p, g = v, b = t; break;
		case 3: r = p, g = q, b = v; break;
		case 4: r = t, g = p, b = v; break;
		case 5: r = v, g = p, b = q; break;
	}

	return [parseInt(r * 255), parseInt(g * 255), parseInt(b * 255)];
}

// for 2nd parmeter of JSON.parse(... , dateReviver);
function dateReviver(key, value) {
    if (isStringDate(value)) {
        return new Date(value);
    } else {
    	return value;
    }
}

function dateReplacer(key, value) {
    if (value instanceof Date) {
        return value.toJSON();
    } else {
    	return value;
    }
}

function isStringDate(str) {
	return typeof str == "string" && str.length == 24 && /\d{4}-\d{2}-\d{2}T\d{2}\:\d{2}\:\d{2}\.\d{3}Z/.test(str);
}

//used to reduce load or requests: Will randomy select a date/time between now and maxdaysnfrom now and return true when this date/time has passed 
async function passedRandomTime(name, maxDaysFromNow) {
	var randomTime = await storage.get(name);
	
	// already set a random time let's if we passed it...
	if (randomTime) {
		randomTime = new Date(randomTime);
		// this randomtime is before now, meaning it has passed so return true
		if (randomTime.isBefore()) {
			return true;
		} else {
			return false;
		}
	} else {
		// set a random time
		if (!maxDaysFromNow) {
			maxDaysFromNow = 5; // default 5 days
		}
		var maxDate = new Date();
		maxDate = maxDate.addDays(maxDaysFromNow);
		
		var randomeMilliSecondsFromNow = parseInt(Math.random() * (maxDate.getTime() - Date.now()));
		randomTime = Date.now() + randomeMilliSecondsFromNow;
		randomTime = new Date(randomTime);
		
		console.log("Set randomtime: " + randomTime);
		await storage.set(name, randomTime);
		return false;
	}
}

function IconAnimation(iconUrl) {
    var that = this;
	var iconLoaded;
    var imageBitmap;

    getImageBitmapFromUrl(iconUrl).then(thisImageBitmap => {
        iconLoaded = true;
        imageBitmap = thisImageBitmap;
        if (that.animateCalled) {
            //console.log("this.animate called");
            that.animate(that.animateCallback);
        }
    });

	var canvas;
	const CANVAS_XY = 19;
	if (typeof OffscreenCanvas != "undefined") {
		canvas = new OffscreenCanvas(CANVAS_XY, CANVAS_XY);
	} else if (typeof document != "undefined") {
		canvas = document.createElement("canvas");
		canvas.width = canvas.height = CANVAS_XY;
	}

	var canvasContext = canvas.getContext('2d');

	var rotation = 1;
	var factor = 1;
	var animDelay = 35;
    var animActive;
	
	this.stop = function() {
		rotation = 1;
		factor = 1;

        animActive = false;
	}

	this.animate = function(callback) {
		//console.log("in this.animate");
		that.stop();
		that.animateCalled = true;
		that.animateCallback = callback;
		if (iconLoaded) {
			//console.log("draw image");
			
			chrome.browserAction.getBadgeText({}, async function(previousBadgeText) {
				chrome.browserAction.setBadgeText({text : ""});
				//canvasContext.drawImage(imageBitmap, -Math.ceil(canvas.width / 2), -Math.ceil(canvas.height / 2));
				
                animActive = true;

                // start animation - used interval in the past but might have created endless animation due to inactive background ref: https://jasonsavard.com/forum/discussion/comment/28390#Comment_28390
                const ANIMATION_DURATION = 2500;
                for (let a = 0; a * animDelay < ANIMATION_DURATION; a++) {
                    await sleep(animDelay);

                    // in case of race condition stop previous animation
                    if (!animActive) {
                        break;
                    }

					canvasContext.save();
					canvasContext.clearRect(0, 0, canvas.width, canvas.height);
					canvasContext.translate(Math.ceil(canvas.width / 2), Math.ceil(canvas.height / 2));
					canvasContext.rotate(rotation * 2 * Math.PI);
					canvasContext.drawImage(imageBitmap, -Math.ceil(canvas.width / 2), -Math.ceil(canvas.height / 2));
					
					// inverts images
					/*
					var imageData = canvasContext.getImageData(0, 0, imageBitmap.width, imageBitmap.height);
			        var data = imageData.data;

			        for(var i = 0; i < data.length; i += 4) {
			          // red
			          data[i] = 255 - data[i];
			          // green
			          data[i + 1] = 255 - data[i + 1];
			          // blue
			          data[i + 2] = 255 - data[i + 2];
			        }

			        // overwrite original image
			        canvasContext.putImageData(imageData, 0, 0);
			        */
					
					canvasContext.restore();
					
					rotation += 0.03 * factor;
					
					if (rotation <= 0.8 && factor < 0) {
						factor = 1;
					}
					else if (rotation >= 1.2 && factor > 0) {
						factor = -1;
					}
					
					chrome.browserAction.setIcon({
						imageData: canvasContext.getImageData(0, 0, canvas.width, canvas.height)
				   	});
                }

				// stop animation
                that.stop();
                callback(previousBadgeText);
			});
		}
	}
}

var syncOptions = (function() {
	var MIN_STORAGE_EVENTS_COUNT_BEFORE_SAVING = 4;
	var LOCALSTORAGE_CHUNK_PREFIX = "localStorageChunk";
	var INDEXEDDB_CHUNK_PREFIX = "indexedDBChunk";
	var paused;
	
	// ex. syncChunks(deferreds, localStorageChunks, "localStorageChunk", setDetailsSeparateFromChunks);
	function syncChunks(deferreds, chunks, chunkPrefix, details, setDetailsSeparateFromChunks) {
		
		var previousDeferredsCount = deferreds.length;
		
		chunks.forEach((chunk, index) => {
			var itemToSave = {};
			
			// let's set details + chunk together
			if (!setDetailsSeparateFromChunks) {
				itemToSave["details"] = details;
			}
			
			itemToSave[chunkPrefix + "_" + index + "_" + details.chunkId] = chunk;
			
			console.log("trying to sync.set json length: ", chunkPrefix + "_" + index + "_" + details.chunkId, chunk.length + "_" + JSON.stringify(chunk).length);
            
            const promise = new Promise((resolve, reject) => {
				// firefox
				if (!chrome.storage.sync.MAX_SUSTAINED_WRITE_OPERATIONS_PER_MINUTE) {
					chrome.storage.sync.MAX_SUSTAINED_WRITE_OPERATIONS_PER_MINUTE = 1000000;
				}
				
				// to avoid problems with MAX_SUSTAINED_WRITE_OPERATIONS_PER_MINUTE let's spread out the calls
				var delay;
				var SYNC_OPERATIONS_BEFORE = 1; // .clear were done before
				if (SYNC_OPERATIONS_BEFORE + previousDeferredsCount + chunks.length > chrome.storage.sync.MAX_SUSTAINED_WRITE_OPERATIONS_PER_MINUTE) {
					delay = (previousDeferredsCount+index) * seconds(4); // v2: chnaged 4s becaue of persitent false v1: 10s makes only 6 calls per minute
				} else {
					delay = 0;
				}
				setTimeout(function() {					
					chrome.storage.sync.set(itemToSave, function() {
						if (chrome.runtime.lastError) {
							var error = "sync error: " + chrome.runtime.lastError.message;
							logError(error);
							reject(error);
						} else {											
							console.log("saved " + chunkPrefix + " " + index);
							resolve("success");
						}
					});
				}, delay);
			});
			deferreds.push(promise);
		});
	}
	
	// usage: compileChunks(details, items, details.localStorageChunksCount, LOCALSTORAGE_CHUNK_PREFIX) 
	function compileChunks(details, items, chunkCount, prefix) {
		var data = "";
		for (var a=0; a<chunkCount; a++) {
			data += items[prefix + "_" + a + "_" + details.chunkId];
		}
		return JSON.parse(data);
	}
	
	function isSyncable(key) {
		return !key.startsWith("_") && !syncOptions.excludeList.includes(key);
	}
	
	return { // public interface
		init: function(excludeList) {
			if (!excludeList) {
				excludeList = [];
			}
			
			// all private members are accesible here
			syncOptions.excludeList = excludeList;
		},
		storageChanged: async params => {
			if (!paused) {
				if (isSyncable(params.key)) {
					// we don't want new installers overwriting their synced data from previous installations - so only sync after certain amount of clicks by presuming their just going ahead to reset their own settings manually
					let _storageEventsCount = await storage.get("_storageEventsCount");
                    if (!_storageEventsCount) {
						_storageEventsCount = 0;
					}
					_storageEventsCount++;
                    await storage.set("_storageEventsCount", _storageEventsCount);
					
					// if loaded upon new install then we can proceed immediately to save settings or else wait for minimum storage event
					if (await storage.get("lastSyncOptionsLoad") || await storage.get("lastSyncOptionsSave") || _storageEventsCount >= MIN_STORAGE_EVENTS_COUNT_BEFORE_SAVING) {
                        //console.log("storage event: " + params.key + " will sync it soon...");
                        chrome.alarms.create(Alarms.SYNC_DATA, {delayInMinutes: 1});
					} else {
						//console.log("storage event: " + params.key + " waiting for more storage events before syncing");
					}
				} else {
					//console.log("storage event ignored: " + params.key);
				}
			}
		},
		pause: function() {
			paused = true;
		},
		resume: function() {
			paused = false;
		},
		save: function(reason) {
			return new Promise(function(resolve, reject) {
				if (chrome.storage.sync) {
					// firefox
					if (!chrome.storage.sync.QUOTA_BYTES_PER_ITEM) {
						chrome.storage.sync.QUOTA_BYTES_PER_ITEM = 8192;
					}
					// split it up because of max size per item allowed in Storage API
					// because QUOTA_BYTES_PER_ITEM is sum of key + value STRINGIFIED! (again)
					// watchout because the stringify adds quotes and slashes refer to https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify
					// so let's only use 80% of the max and leave the rest for stringification when the sync.set is called
					var MAX_CHUNK_SIZE = Math.floor(chrome.storage.sync.QUOTA_BYTES_PER_ITEM * 0.80);
		
					console.log("syncOptions: saving data reason: " + reason + "...");
					
					chrome.storage.local.get(null, function(chromeStorageItems) {
						if (chrome.runtime.lastError) {
							console.error("could not fetch chrome.storage for sync: " + chrome.runtime.lastError.message);
						} else {
							try {
								// process chrome.storage.local
								var localStorageItemsToSave = {};
								for (key in chromeStorageItems) {
									// don't incude storage options starting with _blah and use exclude list
									if (isSyncable(key)) {
										//console.log(key + ": " + chromeStorageItems[key]);
										localStorageItemsToSave[key] = chromeStorageItems[key];
									}
								}
								//localStorageItemsToSave = JSON.stringify(localStorageItemsToSave);
								
								// remove all items first because we might have less "chunks" of data so must clear the extra unsused ones now
								syncOptions.clear().then(() => {
									if (chrome.runtime.lastError) {
										var error = "sync error: " + chrome.runtime.lastError.message;
										logError(error);
										reject(error);
									} else {
										var deferreds = [];
										var deferred;
										
										var chunkId = getUniqueId();

										var localStorageChunks = chunkObject(localStorageItemsToSave, MAX_CHUNK_SIZE);
										//var indexedDBChunks = chunkObject(exportIndexedDBResponse.data, MAX_CHUNK_SIZE);
										
										var details = {chunkId:chunkId, localStorageChunksCount:localStorageChunks.length, extensionVersion:chrome.runtime.getManifest().version, lastSync:new Date().toJSON(), syncReason:reason};
										
										// can we merge details + first AND only chunk into one .set operation (save some bandwidth)
										var setDetailsSeparateFromChunks;
										
										if (localStorageChunks.length == 1 && JSON.stringify(details).length + localStorageChunks.first().length < MAX_CHUNK_SIZE) {
											setDetailsSeparateFromChunks = false;
										} else {
											setDetailsSeparateFromChunks = true;

											// set sync header/details...
											deferred = new Promise((resolve, reject) => {
												chrome.storage.sync.set({details:details}, function() {
													console.log("saved details");
													resolve("success");
												});
											});
											deferreds.push(deferred);
										}
										
										// in 1st call to syncChunks let's pass the last param setDetailsSeparateFromChunks
										// in 2nd call to syncChunks let's hard code setDetailsSeparateFromChunks to true
										syncChunks(deferreds, localStorageChunks, LOCALSTORAGE_CHUNK_PREFIX, details, setDetailsSeparateFromChunks);
										//syncChunks(deferreds, indexedDBChunks, INDEXEDDB_CHUNK_PREFIX, details, true);
                                        
                                        Promise.all(deferreds).then(async () => {
                                            await storage.setDate("lastSyncOptionsSave");
                                            console.log("sync done");
                                            resolve();
                                        })
                                        .catch(() => {
                                            console.log(arguments);
                                            // error occured so let's clear storage because we might have only partially written data
                                            syncOptions.clear().catch(error => {
                                                // do nothing
                                            }).then(() => { // acts as a finally
                                                reject("jerror with sync deferreds");
                                            });
                                        });
									}
								}).catch(error => {
									reject(error);
								});
							} catch (error) {
								reject(error);
							}
						}
					});
				} else {
					reject(new Error("Sync is not supported!"));
				}
			});
		},
		fetch: function() {
			return new Promise(function(resolve, reject) {
				if (chrome.storage.sync) {
					console.log("syncOptions: fetch...");
					chrome.storage.sync.get(null, function(items) {
						if (chrome.runtime.lastError) {
							var error = "sync last error: " + chrome.runtime.lastError.message;
							reject(error);
						} else {
							console.log("items", items);
							if (isEmptyObject(items)) {
								reject("Could not find any synced data!<br><br>Make sure you sign in to Chrome on your other computer AND this one <a target='_blank' href='https://support.google.com/chrome/answer/185277'>More info</a>");
							} else {
								var details = items["details"];
								if (details.extensionVersion != chrome.runtime.getManifest().version) {
									reject({items:items, error:"Versions are different: " + details.extensionVersion + " and " + chrome.runtime.getManifest().version});
								} else {
									resolve(items);
								}
							}
						}
					});
				} else {
					reject(new Error("Sync is not supported!"));
				}
			});
		},
		load: function(items) {
			console.log("syncOptions: load...");
			return new Promise(function(resolve, reject) {
				if (chrome.storage.sync) {
					if (items) {
						var details = items["details"]; 
						if (details) {
							// process chrome.storage.local					
							var dataObj = compileChunks(details, items, details.localStorageChunksCount, LOCALSTORAGE_CHUNK_PREFIX);
							console.log("dataObj", dataObj);
							console.log("dataObj", typeof dataObj);
							console.log("dataObj", dataObj.length);
							console.log("dataObj", dataObj.details);
							chrome.storage.local.set(dataObj, async () => {
								if (chrome.runtime.lastError) {
									var error = "set storage error: " + chrome.runtime.lastError.message;
									console.error(error);
									reject(error);
								} else {
									// finish stamp
                                    await storage.setDate("lastSyncOptionsLoad");
									console.log("done");
									resolve(dataObj);
								}							
							});
						}
					} else {
						reject("No items found");
					}
				} else {
					reject(new Error("Sync is not supported!"));
				}
			});
		},
		exportIndexedDB: function(params = {}, callback) {
		    if (!db) {
		    	callback({error: "jerror db not declared"});
		    	return;
		    }

		    //Ok, so we begin by creating the root object:
		    var data = {};
		    var promises = [];
		    for(var i=0; i<db.objectStoreNames.length; i++) {
		        //thanks to http://msdn.microsoft.com/en-us/magazine/gg723713.aspx
		        promises.push(

		            new Promise((resolve, reject) => {

		                var objectstore = db.objectStoreNames[i];
		                console.log("objectstore: " + objectstore);

		                var transaction = db.transaction([objectstore], "readonly");  
		                var content = [];

		                transaction.oncomplete = function(event) {
		                    console.log("trans oncomplete for " + objectstore + " with " + content.length + " items");
		                    resolve({name:objectstore, data:content});
		                };

		                transaction.onerror = function(event) {
		                	// Don't forget to handle errors!
		                	console.dir(event);
		                };

		                var handleResult = function(event) {  
		                	var cursor = event.target.result;  
		                	if (cursor) {
		                		//console.log(cursor.key + " " + JSON.stringify(cursor.value).length);
		                		
		                		// don't incude storage options starting with _blah and use exclud list
		                		if (cursor.key.startsWith("_") || (!params.exportAll && syncOptions.excludeList.includes(cursor.key))) {
		                			// exclude this one and do nothing
		                			console.log("excluding this key: " + cursor.key);
		                		} else {
		                			content.push({key:cursor.key,value:cursor.value});
		                		}
		                		
		                		cursor.continue();  
		                	}
		                };  

		                var objectStore = transaction.objectStore(objectstore);
		                objectStore.openCursor().onsuccess = handleResult;

		            })

		        );
		    }

		    Promise.all(promises)
		    	.then(dataToStore => {
			        // arguments is an array of structs where name=objectstorename and data=array of crap
			        // make a copy cuz I just don't like calling it argument
			        //var dataToStore = arguments;
			        //serialize it
			        var serializedData = JSON.stringify(dataToStore);
			        console.log("datastore:", dataToStore);
			        console.log("length: " + serializedData.length);
			        
			        callback({data:dataToStore});
			        
			        //downloadObject(dataToStore, "indexedDB.json");
			        
			        //The Christian Cantrell solution
			        //var link = $("#exportLink");
			        //document.location = 'data:Application/octet-stream,' + encodeURIComponent(serializedData);
			        //link.attr("href",'data:Application/octet-stream,'+encodeURIComponent(serializedData));
			        //link.trigger("click");
			        //fakeClick(link[0]);
		   		})
		   		.catch(error => {
		   			console.error(error);
		   			callback({error:"jerror when exporting"});
		   		})
		    ;
		},
		importIndexedDB: function(obj) {
			return new Promise(function(resolve, reject) {
				// first (and only) item in array should be the "settings" objectstore that i setup when using the indexedb with this gmail checker
				var settingsObjectStore = obj[0];
				if (settingsObjectStore.name == "settings") {
					
					var deferreds = [];
					
					for (var a=0; a<settingsObjectStore.data.length; a++) {
						var key = settingsObjectStore.data[a].key;
						var value = settingsObjectStore.data[a].value.value;
						console.log(key + ": " + value);
						var deferred = Settings.store(key, value);
						deferreds.push(deferred);
					}
					
				    Promise.all(deferreds)
				    	.then(() => {
					        resolve();
				   		})
				   		.catch(() => {
				   			console.log(arguments)
				   			reject("jerror when importing");
				   		})
				    ;
				} else {
					reject("Could not find 'settings' objectstore!");
				}
			});
		},
		// only clears syncOptions data ie. chunks_ and details etc.
		clear: function() {
			return new Promise((resolve, reject) => {
				if (chrome.storage.sync) {
					chrome.storage.sync.get(null, items => {
						if (chrome.runtime.lastError) {
							var error = "clear sync error: " + chrome.runtime.lastError.message;
							console.error(error);
							reject(error);
						} else {
							var itemsToRemove = [];
							for (key in items) {
								if (key == "details" || key.startsWith(LOCALSTORAGE_CHUNK_PREFIX) || key.startsWith("chunk_") /* old prefix */) {
									itemsToRemove.push(key);
								}
							}
							chrome.storage.sync.remove(itemsToRemove, () => {
								if (chrome.runtime.lastError) {
									var error = "remove sync items error: " + chrome.runtime.lastError.message;
									console.error(error);
									reject(error);
								} else {
									resolve();
								}
							});
						}
					});
				} else {
					reject(new Error("Sync is not supported!"));
				}
			});
		}
	};
})();

syncOptions.init([
    "version",
    "reminderWindowId",
	"notificationsOpened",
	"notificationsQueue",
	"lastSyncOptionsSave",
	"lastSyncOptionsLoad",
	"detectedChromeVersion",
	"installDate",
	"installVersion",
	"DND_endTime",
	"eventsShown",
	"contactsData",
	"cachedFeeds",
	"cachedFeedsDetails",
	"lastOptionStatsSent",
    "notificationSoundCustom",
    "tokenResponses",
	"tokenResponsesContacts"
]);


function downloadObject(data, filename) {
    if (!data) {
        console.error('No data')
        return;
    }

    if(!filename) filename = 'object.json'

    if(typeof data === "object"){
        data = JSON.stringify(data, undefined, 4)
    }

    var blob = new Blob([data], {type: 'text/json'}),
        e    = document.createEvent('MouseEvents'),
        a    = document.createElement('a')

    a.download = filename
    a.href = globalThis.URL.createObjectURL(blob)
    a.dataset.downloadurl =  ['text/json', a.download, a.href].join(':')
    e.initMouseEvent('click', true, false, globalThis, 0, 0, 0, 0, 0, false, false, false, false, 0, null)
    a.dispatchEvent(e)
}

function initUndefinedObject(obj) {
    if (typeof obj == "undefined") {
        return {};
    } else {
        return obj;
    }
}

function initUndefinedCallback(callback) {
    if (callback) {
        return callback;
    } else {
        return function() {};
    }
}

function chunkObject(obj, chunkSize) {
	var str = JSON.stringify(obj);
	return str.chunk(chunkSize);
}

function parseVersionString(str) {
    if (typeof(str) != 'string') { return false; }
    var x = str.split('.');
    // parse from string or default to 0 if can't parse
    var maj = parseInt(x[0]) || 0;
    var min = parseInt(x[1]) || 0;
    var pat = parseInt(x[2]) || 0;
    return {
        major: maj,
        minor: min,
        patch: pat
    }
}

function cmpVersion(a, b) {
    var i, cmp, len, re = /(\.0)+[^\.]*$/;
    a = (a + '').replace(re, '').split('.');
    b = (b + '').replace(re, '').split('.');
    len = Math.min(a.length, b.length);
    for( i = 0; i < len; i++ ) {
        cmp = parseInt(a[i], 10) - parseInt(b[i], 10);
        if( cmp !== 0 ) {
            return cmp;
        }
    }
    return a.length - b.length;
}

function gtVersion(a, b) {
    return cmpVersion(a, b) >= 0;
}

// syntax: ltVersion(details.previousVersion, "7.0.15")
function ltVersion(a, b) {
    return cmpVersion(a, b) < 0;
}

function escapeRegExp(str) {
	return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}

function openTemporaryWindowToRemoveFocus() {
	// open a window to take focus away from notification and there it will close automatically
	var win = globalThis.open("about:blank", "emptyWindow", "width=1, height=1, top=-500, left=-500");
	win.close();
}

function isOnline() {
	// patch because some distributions of linux always returned false for is navigator.online so let's force it to true
	if (DetectClient.isLinux()) {
		return true;
	} else {
		return navigator.onLine;
	}
}

//cross OS used to determine if ctrl or mac key is pressed
function isCtrlPressed(e) {
	return e.ctrlKey || e.metaKey;
}

// make sure it's not a string or empty because it will equate to 0 and thus run all the time!!!
// make sure it's not too small like 0 or smaller than 15 seconds
function setIntervalSafe(func, time) {
	if (isNaN(time) || parseInt(time) < 1000) {
		throw Error("jerror with setinterval safe: " + time + " is NAN or too small");
	} else {
		return setInterval(func, time); 
	}
}

async function sleep(delay) {
    return new Promise(resolve => setTimeout(resolve, delay));
}

function isDomainEmail(email) {
	if (email) {
		email = email.toLowerCase();
		var POPULAR_DOMAINS = ["zoho", "aim", "videotron", "icould", "inbox", "yandex", "rambler", "ya", "sbcglobal", "msn", "me", "facebook", "twitter", "linkedin", "email", "comcast", "gmx", "aol", "live", "google", "outlook", "yahoo", "gmail", "mail", "comcast", "googlemail", "hotmail"];
		
		var foundPopularDomainFlag = POPULAR_DOMAINS.some(function(popularDomain) {
			if (email.includes("@" + popularDomain + ".")) {
				return true;
			}
		});
		
		return !foundPopularDomainFlag;
	}
}

function loadImage($image, callback) {
	return new Promise(function(resolve, reject) {
		$image
			.load(function() {
				resolve($image);
			})
			.error(function(e) {
				reject(e);
			})
		;
	});
}

// syntax: alwaysPromise(Promise)
// syntax: alwaysPromies(Promise[])
function alwaysPromise(promises) {
	return new Promise((resolve, reject) => {
        var successfulPromises = [];
        var failedPromises = [];

        // if param is single promise then push it into an array
        if (typeof promises.then == 'function') {
        	promises = [promises];
        }
        
        function checkIfAllComplete() {
        	if (successfulPromises.length + failedPromises.length == promises.length) {
               	resolve({successful:successfulPromises, failures:failedPromises});
            }
        }
        
        if (promises.length) {
            promises.forEach(promise => {
                promise.then(response => {
                    successfulPromises.push(response);
                    checkIfAllComplete();
                }).catch(error => {
                    failedPromises.push(error);
                    checkIfAllComplete();
                });
            });        
        } else {
        	checkIfAllComplete();
        }
    });
}

function showMessageNotification(title, message, error) {
    console.error(error);

   const options = {
        type: "basic",
        title: title,
        message: message,
        iconUrl: "images/icons/icon-128.png",
        priority: 1
   }
   
   var notificationId;
   if (error) {
	   notificationId = "error";
	   if (DetectClient.isChromium()) {
		   options.contextMessage = "Error: " + error;
		   options.buttons = [{title:"If this is frequent then click here to report it", iconUrl:"images/open.svg"}];
	   } else {
		   options.message += " Error: " + error;
	   }
   } else {
	   notificationId = "message";
   }
   
   chrome.notifications.create(notificationId, options, async function(notificationId) {
	   if (chrome.runtime.lastError) {
		   console.error(chrome.runtime.lastError.message);
	   } else {
           if (!error) {
               await sleep(seconds(4));
               chrome.notifications.clear(notificationId);
           }
	   }
   });
}

function showCouldNotCompleteActionNotification(error) {
	showMessageNotification("Error with last action.", "Try again or sign out and in.", error);
}

class ProgressNotification {
	constructor() {
	    this.PROGRESS_NOTIFICATION_ID = "progress";
	}
	
	show(delay) {
		var that = this;
		this.delayTimeout = setTimeout(() => {
			if (DetectClient.isChromium()) {
				var options = {
					type: "progress",
					title: getMessage("processing"),
					message: "",
					iconUrl: "images/icons/icon-128.png",
					requireInteraction: !DetectClient.isMac(),
					progress: 0
				}
				
				chrome.notifications.create(that.PROGRESS_NOTIFICATION_ID, options, function(notificationId) {
					if (chrome.runtime.lastError) {
						console.error(chrome.runtime.lastError.message);
					} else {
						// commented because issue with native notification not disappearing after calling .update
						/*
						that.progressInterval = setInterval(() => {
							options.progress += 20;
							if (options.progress > 100) {
								options.progress = 0;
							}
							chrome.notifications.update(that.PROGRESS_NOTIFICATION_ID, options);
						}, 1000);
						*/
					}
				});
			}
		}, delay);
	}
	
	cancel() {
		clearInterval(this.delayTimeout);
		clearInterval(this.progressInterval);
		chrome.notifications.clear(this.PROGRESS_NOTIFICATION_ID);
	}

	async complete(title) {
		var that = this;
		clearInterval(this.delayTimeout);
        clearInterval(this.progressInterval);
        await sleep(200);
        chrome.notifications.clear(that.PROGRESS_NOTIFICATION_ID, () => {
            showMessageNotification(title ? title : "Complete", getMessage("clickToolbarIconToContinue"));
        });
	}
}

async function getInstallDate() {
	let installDate = await storage.get("installDate");
	if (!installDate) {
		installDate = new Date();
	}
	return installDate;
}

// usage: getAllAPIData({oauthForDevices:oAuthForPeople, userEmail:userEmail, url:"https://people.googleapis.com/v1/people/me/connections?pageSize=100&requestMask.includeField=" + encodeURIComponent("person.emailAddresses,person.names"), itemsRootId:"connections"}) 
async function getAllAPIData(params) {
    if (params.pageToken) {
        params.url = setUrlParam(params.url, "pageToken", params.pageToken);
    }

    const responseObj = await params.oauthForDevices.send(params);
    console.log("params, responseObj", params, responseObj)
    if (!params.items) {
        params.items = [];
    }

    if (!params.itemsRootId) {
        throw "itemsRootId is required";
    }

    const moreItems = responseObj[params.itemsRootId];
    if (moreItems) {
        params.items = params.items.concat(moreItems);
    }
    if (responseObj.nextPageToken) {
        params.pageToken = responseObj.nextPageToken;
        return await getAllAPIData(params);
    } else {
        responseObj.email = params.userEmail;
        responseObj.items = params.items;

        if (responseObj.nextSyncToken) {
            responseObj.syncToken = responseObj.nextSyncToken;
        }

        return responseObj;
    }
}

function convertPlainTextToInnerHtml(str) {
	if (str) {
		return str.htmlEntities().replace(/\n/g, "<br/>");
	}
}

function insertStylesheet(url, id) {
    return new Promise((resolve, reject) => {
        const link = document.createElement('link');
        if (id) {
            link.id = id;
        }
        link.rel = 'stylesheet'; 
        link.href = url;
        link.onload = e => {
            resolve(e);
        };
		link.onerror = function (e) {
			reject(e);
		};
        (document.getElementsByTagName('head')[0]||document.getElementsByTagName('body')[0]).appendChild(link);
    });
}

function insertScript(url, id) {
    return new Promise((resolve, reject) => {
        var script = document.createElement('script');
        if (id) {
            script.id = id;
        }
        script.async = true;
        script.src = url;
        script.onload = e => {
            resolve(e);
        };
		script.onerror = function (e) {
			reject(e);
		};
        (document.getElementsByTagName('head')[0]||document.getElementsByTagName('body')[0]).appendChild(script);
    });
}

function findIndexById(ary, id) {
	return ary.findIndex(aryItem => {
		return aryItem.id == id;
	});
}

function removeItemById(ary, id) {
	var index = ary.findIndex(item => {
		return item.id == id;
	});
	
	if (index != -1) {
		ary.splice(index, 1);
		return true;
	}
}

function getUUID() {
	function _p8(s) {
		var p = (Math.random().toString(16) + "000000000").substring(2, 10);
		return s ? "-" + p.substring(0, 4) + "-" + p.substring(4, 8) : p;
	}
	return _p8() + _p8(true) + _p8(true) + _p8();
}

function getPreferredLanguage() {
	if (navigator.languages && navigator.languages.length) {
		return navigator.languages[0];
	} else {
		return navigator.language;
	}
}

async function getInstanceToken() {
    return new Promise((resolve, reject) => {
        if (chrome.instanceID) {
            chrome.instanceID.getToken({
                authorizedEntity: GCM_SENDER_ID,
                scope: "GCM"
            }, async token => {
                clearTimeout(globalThis.instanceIdTimeout);
                if (chrome.runtime.lastError) {
                    console.error(chrome.runtime.lastError.message);
                    reject(chrome.runtime.lastError.message);
                } else {
                    console.log("token", token);
                    resolve(token);
                }
            });
            
            // seems Brave browser doesn't respond to success or failure
            globalThis.instanceIdTimeout = setTimeout(() => {
                const error = new Error("instanceID not responding");
                reject(error);
            }, seconds(2));
        } else {
            const error = new Error("GCM not supported");
            console.warn(error);
            reject(error);
        }
    });
}

async function ensureGCMRegistration() {
    const registrationId = await storage.get("registrationId");
    if (registrationId) {
        console.log("reusing gcm regid");
        return registrationId;
    } else {
        const token = await getInstanceToken();
        await storage.set("registrationId", token);
        return token;
    }
}

function removeCachedAuthToken(token) {
	return new Promise((resolve, reject) => {
        if (chrome.identity) {
            chrome.identity.removeCachedAuthToken({ token: token }, () => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError.message);
                } else {
                    resolve();
                }
            });
        } else {
            resolve();
        }
	});
}

function getDataUrl(canvas) {
	return new Promise(async (resolve, reject) => {
		if ('toDataURL' in canvas) { // regular canvas element
			resolve(canvas.toDataURL());
		} else { // OffscreenCanvas
			const blob = await canvas.convertToBlob();
			const reader = new FileReader();
			reader.addEventListener('load', () => {
				resolve(reader.result);
			});
			reader.addEventListener('error', error => {
				reject(error);
			});
			reader.readAsDataURL(blob);
		}
	});
}

async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
}

function getInstanceId() {
    return new Promise(async (resolve, reject) => {
        const instanceId = await storage.get("instanceId");
        if (instanceId) {
            resolve(instanceId);
        } else {
            if (chrome.instanceID) {
                chrome.instanceID.getID(instanceId => {
                    if (chrome.runtime.lastError) {
                        const error = new Error("Problem getting instanceid: " + chrome.runtime.lastError.message);
                        console.error(error);
                        reject(error)
                    } else {
                        clearTimeout(globalThis.instanceIdTimeout);
                        resolve(instanceId);
                    }
                });
            } else {
                reject("chrome.instanceId not supported");
            }
    
            // seems Brave browser doesn't respond to success or failure
            globalThis.instanceIdTimeout = setTimeout(() => {
                reject("instanceId not responding");
            }, seconds(2));
        }
    }).catch(error => {
        console.warn("Generating instanceId");
        const instanceId = getUUID();
        storage.set("instanceId", instanceId);
        return instanceId;
    });
}

function getNearestHalfHour() {
    const date = new Date();
    date.setMinutes(Math.ceil(date.getMinutes() / 30) * 30);
    return date;
}

function isEmptyObject(obj) {
    return Object.entries(obj).length === 0 && obj.constructor === Object;
}

function supportsChromeSignIn() {
    if (DetectClient.isFirefox() || DetectClient.isEdge()) {
        return false;
    } else {
        return true;
    }
}

async function supportsRealtime() {
    try {
        const token = await getInstanceToken();
        if (token) {
            return token;
        }
    } catch (error) {
        console.warn("could not get instancetoken", error);
    }

    return false;
}

class Encryption {

    static async generateAesGcmParams() {
        let iv = await storage.getEncodedUint8Array(this.IV_STORAGE_KEY);
        if (!iv) {
            iv = globalThis.crypto.getRandomValues(new Uint8Array(12));
            storage.set(this.IV_STORAGE_KEY, iv);
        }
        return {
            name: this.ALGORITHM,
            iv: iv
        }
    }

    static async generateAndExportKey() {
        const key = await globalThis.crypto.subtle.generateKey(
            {
                name: this.ALGORITHM,
                length: 256,
            },
            true,
            ["encrypt", "decrypt"]
        )

        const exportedKey = await globalThis.crypto.subtle.exportKey(
            this.KEY_FORMAT,
            key
        );
        await storage.set(this.EXPORTED_STORAGE_KEY, exportedKey);
        return key;
    }
    
    static async getAesGcmKey() {
        const exportedKey = await storage.getEncodedArrayBuffer(this.EXPORTED_STORAGE_KEY);
        let key;
        if (exportedKey) {
            try {
                key = await globalThis.crypto.subtle.importKey(
                    this.KEY_FORMAT,
                    exportedKey,
                    this.ALGORITHM,
                    true,
                    ["encrypt", "decrypt"]
                );
            } catch (error) {
                console.warn("Problem importing key so recreating it: ", error);
                key = await this.generateAndExportKey();
            }
        } else {
            key = await this.generateAndExportKey();
        }
    
        return key;
    }
    
    static async encrypt(message) {
        const enc = new TextEncoder();
        const encoded = enc.encode(message);

        return globalThis.crypto.subtle.encrypt(
            await this.generateAesGcmParams(),
            await this.getAesGcmKey(),
            encoded
        );
    }

    static async encryptObj(obj, replacer) {
        const message = JSON.stringify(obj, replacer);
        return Encryption.encrypt(message);
    }

    static async decrypt(ciphertext) {
        if (await storage.getEncodedArrayBuffer(this.EXPORTED_STORAGE_KEY)) {
            const decrypted = await globalThis.crypto.subtle.decrypt(
                await this.generateAesGcmParams(),
                await this.getAesGcmKey(),
                ciphertext
            );
        
            const dec = new TextDecoder();
            return dec.decode(decrypted);
        } else {
            throw Error("Encryption keys not present - might be first install or restored options");
        }
    }

    static async decryptObj(ciphertext, reviver) {
        const obj = await Encryption.decrypt(ciphertext);
        return JSON.parse(obj, reviver);
    }
}

Encryption.ALGORITHM = "AES-GCM";
Encryption.KEY_FORMAT = "raw";
Encryption.IV_STORAGE_KEY = "_aesGcmIv"; // must start with _ to be ignored by sync because it's a type "Uint8Array" that can't be sycned properly
Encryption.EXPORTED_STORAGE_KEY = "_aesGcmExportedKey";

async function getImageBitmapFromUrl(url) {
    const response = await fetch(url);
    const blob = await response.blob();
    return createImageBitmap(blob);
}

class Picker {
    _selectedDateTime = new DateZeroTime();
    _options

    constructor(inputElement, options = {}) {
        const self = this;
        this.inputElement = inputElement;
        this._options = options;

        if (inputElement._pickerObj) {
            inputElement._pickerObj.reset();
        }
        inputElement._pickerObj = this;

        inputElement.addEventListener("focus", this);
        inputElement.addEventListener("mousedown", this);
        inputElement.addEventListener("blur", this);
        inputElement.addEventListener("keydown", this);
        inputElement.addEventListener("keyup", this);
    }

    get dateTime() {
        return this.toString();
    }

    toString() {
        if (this._selectedDateTime) {
            return new Date(this._selectedDateTime.getTime());
        }
    }

    set dateTime(date) {
        this._setDateTime(new Date(date.getTime()));
    }

    positionLayer() {
        this.pickerLayer.style.top = `${this.inputElement.getBoundingClientRect().top + this.inputElement.getBoundingClientRect().height + 4}px`;
        this.pickerLayer.style.left = `min( calc(100vw - ${this.pickerLayer.getBoundingClientRect().width}px) , ${this.inputElement.getBoundingClientRect().left}px`;
    }

    removeListeners() {
        console.log("removing listeners");
        this.inputElement.removeEventListener("focus", this);
        this.inputElement.removeEventListener("mousedown", this);
        this.inputElement.removeEventListener("blur", this);
        this.inputElement.removeEventListener("keydown", this);
        this.inputElement.removeEventListener("keyup", this);
    }
}

class TimePicker extends Picker {
    constructor(inputElement, options = {}) {
        super(inputElement, options);
        if (!options.changeTime) {
            options.changeTime = function () {};
        }
        options.changeTime = options.changeTime.bind(this);
        this.startTimePicker = options.startTimePicker; /* make it accessible so we can cancel it from outside */
    }

    handleEvent(event) {
        if (event.type === 'focus' || event.type == "mousedown") {
            if (!this.pickerLayer || this.pickerLayer?.hidden) {
                this.showTimes();
            }
        } else if (event.type == "blur") {
            console.log("blur", this.inputElement.value, this._selectedDateTime);
            if (this.inputElement.value) {
                this._setDateTime(this._selectedDateTime);
                this._options.changeTime();
                //event.target.dispatchEvent(new Event("changeTime"));
            }
            this.pickerLayer.hidden = true;
        } else if (event.type == "keydown") {
            const $selected = this.pickerLayer.shadowRoot.querySelector(".selected");
            console.log("selected", $selected);
            if ($selected) {
                if (event.key == "ArrowDown") {
                    this.pickerLayer.hidden = false;
                    if ($selected.nextSibling) {
                        $selected.classList.remove("selected");
                        $selected.nextSibling.classList.add("selected");

                        if (this.pickerLayer.scrollTop + (this.pickerLayer.clientHeight - (2 * $selected.nextSibling.offsetHeight)) < $selected.nextSibling.offsetTop) {
                            this.pickerLayer.scrollTop += $selected.nextSibling.offsetHeight;
                        }
                    }
                    event.preventDefault();
                } else if (event.key == "ArrowUp") {
                    this.pickerLayer.hidden = false;
                    if ($selected.previousSibling) {
                        $selected.classList.remove("selected");
                        $selected.previousSibling.classList.add("selected");

                        if (this.pickerLayer.scrollTop + ($selected.previousSibling.offsetHeight) > $selected.previousSibling.offsetTop) {
                            this.pickerLayer.scrollTop -= $selected.previousSibling.offsetHeight;
                        }
                    }
                    event.preventDefault();
                } else if (event.key == "Enter" || event.key == "Tab") {
                    $selected.dispatchEvent(new Event("mousedown"));
                    this.pickerLayer.hidden = true;
                }
            } else {
                if (event.key == "Enter") {
                    this.inputElement.dispatchEvent(new Event("blur"));
                }
                //this.inputElement.dispatchEvent(new Event("focus"));
            }

            if (event.key == "Escape") {
                this.pickerLayer.hidden = true;
            }
        } else if (event.type == "keyup") {
            console.log("keyup", event);
            if (["Shift", "Control", "ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight", "Enter", "Escape", "Tab"].includes(event.key)) {
                return;
            }
            console.log("parsetime");
            if (locale == "fa" && event.target.value.includes('۰'))  {
                niceAlert("Could not parse time, use international syntax ie. 6:00pm");
            } else {
                const time = event.target.value.parseTime();
                this._selectedDateTime = time;
                this.scrollToTime(time);
            }
        }
    }

    reset() {
        this.removeListeners();
    }

    _setDateTime(date) {
        this._selectedDateTime = date;
        if (date) { // might not be parseable via free input
            this.inputElement.value = date.toLocaleTimeStringJ();
        } else {
            this.pickerLayer.hidden = true;
            niceAlert("Could not parse time, use international syntax ie. 6:00pm");
        }
    }

    showTimes() {
        const self = this;

        document.getElementById("time-dropdown")?.remove();

        this.pickerLayer = document.createElement("div");
        this.pickerLayer.id = "time-dropdown";
        this.pickerLayer.classList.add("time-dropdown");
        this.pickerLayer.style.cssText = `
            position: absolute;
            overflow-y: auto;
            min-width: var(--time-picker-min-width, 60px);
            max-height: 150px;
            z-index: 1000;
            color: var(--input-text-color);
            background-color: var(--secondary-background-color);
            box-shadow: 0 5px 10px rgb(0 0 0 / 20%);
        `;

        if (DetectClient.isFirefox()) {
            this.pickerLayer.style.cssText += `
                overflow-x: hidden;
                min-width: 80px;
            `;
        }

        this.pickerLayer.attachShadow({mode: 'open'});

        const style = document.createElement('style');
        style.textContent = `
            .time-dropdown-item {
                padding: 3px 5px;
                cursor: pointer;
                white-space: nowrap;
            }
        
            .time-dropdown-item.selected {
                background-color: #1980EC;
                color: white;
            }
        
            .time-dropdown-duration {
                padding-inline-start: 5px;
            }
        `;

        this.pickerLayer.shadowRoot.append(style);

        let time;

        if (this.startTimePicker) {
            time = new Date(this.startTimePicker.dateTime.getTime());
        } else {
            time = new DateZeroTime();
        }
        
        let minutesDuration = 0;

        for (let a=0; a<50; a++) {
            const $time = document.createElement("div");
            $time.classList.add("time-dropdown-item");
            $time.textContent = time.toLocaleTimeStringJ();

            if (this.startTimePicker) {
                const $duration = document.createElement("span");
                $duration.classList.add("time-dropdown-duration");

                if (minutesDuration < 60) {
                    $duration.textContent = `(${getMessage("Xmins", minutesDuration)})`;
                } else if (minutesDuration == 60) {
                    $duration.textContent = `(${getMessage("Xhr", minutesDuration / 60)})`;
                } else {
                    $duration.textContent = `(${getMessage("Xhrs", minutesDuration / 60)})`;
                }
                
                $time.append($duration);
            }

            $time.setAttribute("h", time.getHours());
            $time.setAttribute("m", time.getMinutes());

            $time.addEventListener("mousedown", function(e) {
                self._selectedDateTime = new DateZeroTime();
                self._selectedDateTime.setHours(this.getAttribute("h"));
                self._selectedDateTime.setMinutes(this.getAttribute("m"));
                self.inputElement.value = self._selectedDateTime.toLocaleTimeStringJ();
                self.pickerLayer.hidden = true;
                //self.inputElement.dispatchEvent(new Event("changeTime"));
                self._options.changeTime();
                e.preventDefault();
            });

            $time.addEventListener("mouseenter", function() {
                this.classList.add("selected");
            });

            $time.addEventListener("mouseleave", function() {
                this.classList.remove("selected");
            });

            this.pickerLayer.shadowRoot.append($time);

            let increment;
            if (a < 4) {
                increment = 15;
            } else {
                increment = 30;
            }
            time = time.addMinutes(increment);
            minutesDuration += increment;
        }

        document.body.append(this.pickerLayer);

        this.positionLayer();

        if (self.inputElement.value) {
            this.scrollToTime(this._selectedDateTime);
        } else {
            this.scrollToTime();
        }
    }    

    scrollToTime(date = getNearestHalfHour()) {
        const hourSelector = date.getHours();

        let minSelector;
        if (date.getMinutes() >= 30) {
            minSelector = "30";
        } else {
            minSelector = "0";
        }

        const $selectedTime = this.pickerLayer.shadowRoot.querySelector(`[h='${hourSelector}'][m='${minSelector}']`);

        if ($selectedTime) {
            $selectedTime.scrollIntoView();

            if (globalThis.inReminderWindow) {
                document.body.scrollIntoView();
            } else {
                // patch had to execute a 2nd time below
                document.querySelector("app-header-layout")?.scrollIntoView();
            }
        }

        this.pickerLayer.shadowRoot.querySelector(".selected")?.classList.remove("selected");
        if (date.getMinutes() == 0 || date.getMinutes() == 30) {
            if ($selectedTime) {
                $selectedTime.classList.add("selected");
            }
        }
    }
}

class DatePicker extends Picker {
    constructor(inputElement, options = {}) {
        super(inputElement, options);
        if (!options.changeDate) {
            options.changeDate = function () {};
        }
        options.changeDate = options.changeDate.bind(this);
    }
   
    handleEvent(event) {
        if (event.type === 'focus' || event.type == "mousedown") {
            if (!this.pickerLayer || this.pickerLayer?.hidden) {
                this.showCalendar();
            }
        } else if (event.type == "blur") {
            console.log("blur", this.inputElement.value, this._selectedDateTime);
            if (this.inputElement.value) {
                this._setDateTime(this._selectedDateTime);
                this._options.changeDate();
                //event.target.dispatchEvent(new Event("changeDate"));
            }
            this.pickerLayer.hidden = true;
        } else if (event.type == "keydown") {
            if (event.key == "Escape") {
                this.pickerLayer.hidden = true;
            }
        }
    }

    reset() {
        this.removeListeners();
        this.fullCalendar?.destroy();
    }

    _setDateTime(date) {
        this._selectedDateTime = date;
        if (date) { // might not be parseable via free input
            this.inputElement.value = date.toLocaleDateString(locale, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
            });
        } else {
            this.pickerLayer.hidden = true;
            niceAlert("Could not parse time, use international syntax ie. 6:00pm");
        }
    }

    showCalendar() {
        const self = this;

        this.fullCalendar?.destroy();
        document.getElementById("date-dropdown")?.remove();

        this.pickerLayer = document.createElement("div");
        this.pickerLayer.id = "date-dropdown";
        this.pickerLayer.classList.add("date-dropdown", "mini-calendar");
        this.pickerLayer.style.cssText = `
            position: absolute;
            width: 240px;
            xxheight: 225px;
            z-index: 1000;
            background-color: var(--secondary-background-color);
            box-shadow: 0 5px 10px rgb(0 0 0 / 20%);
        `;

        if (this._selectedDateTime) {
            this._options.fullCalendarParams.initialDate = this._selectedDateTime;
        }
        
        this._options.fullCalendarParams.selectable = true;
        this._options.fullCalendarParams.select = function (info) {
            self._setDateTime(info.start);
            self.pickerLayer.hidden = true;
            self._options.changeDate();
        }

        this.fullCalendar = new FullCalendar.Calendar(this.pickerLayer, this._options.fullCalendarParams);

        document.body.append(this.pickerLayer);

        this.fullCalendar.render();

        console.log("this._selectedDateTime", this._selectedDateTime)
        if (this._selectedDateTime) {
            const $selectedDate = this.pickerLayer.querySelector(`[data-date='${this._selectedDateTime.getFullYear()}-${new String(this._selectedDateTime.getMonth()+1).padStart(2, '0')}-${new String(this._selectedDateTime.getDate()).padStart(2, '0')}']`);
            console.log("$selectedDate", $selectedDate);
            if ($selectedDate) {
                $selectedDate.classList.add("selected");
            }
        }

        this.pickerLayer.addEventListener("mousedown", event => {
            event.preventDefault();
            event.stopPropagation();
        })

        this.pickerLayer.querySelectorAll(".fc-button-group button").forEach(el => {
            const ripple = document.createElement("paper-ripple");
            el.append(ripple);

            el.addEventListener("mousedown", event => {
                //event.preventDefault();
                //event.stopPropagation();
            });
        });

        this.positionLayer();
    }
}

async function generateFullCalendarParams() {
    const calendarSettings = await storage.get("calendarSettings");
    
    const params = {
        locale: locale,
        direction: getMessage("dir"),
        dayHeaderFormat: {
            weekday: 'narrow'
        },
        height: DetectClient.isFirefox() ? "auto" : 240,
        headerToolbar: {
            end: "prev,next"
        },
    };

    if (isAsianLangauge()) {
        const passedInDatesSet = params.datesSet;

        params.datesSet = info => {
            // workaround to remove chacters from date in asian languages ie. 23日 > 23
            info.view.calendar.el.querySelectorAll(".fc-daygrid-day").forEach(el => {
                const date = new Date(Date.parse(el.getAttribute("data-date")));
                el.querySelector(".fc-daygrid-day-number").textContent = date.getDate();
            });

            // call any user defined functions afterwards
            if (passedInDatesSet) {
                passedInDatesSet();
            }
        }
    }

    if (calendarSettings.weekStart != undefined) { // must check or else got an error with fullcalendar
        params.firstDay = parseInt(calendarSettings.weekStart);
    }

    return params;
}

function formatMiniFullCalendar(node) {
    node.querySelectorAll(".fc-button-group button").forEach(el => {
        const ripple = document.createElement("paper-ripple");
        el.append(ripple);
    });
}