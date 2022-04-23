var inReminderWindow = true;
var windowOpenedTime = new Date();
var notifications;

var email;
let calendarMap;

/*
// patch for window not set to visible, only happens when Chrome is not in focus
if (document.visibilityState == "hidden") {
    // delay required or else it would close current Chrome window??
    setTimeout(async () => {
        const windowId = await storage.get("reminderWindowId");
        chrome.windows.update(windowId, {focused: false}, function(response) {
            chrome.windows.update(windowId, {focused: true}, function(response) {});
        });
    }, 100);
}
*/

async function closeWindow() {
    await storage.enable("_remindersWindowClosedByDismissingEvents");
	chrome.windows.getCurrent(function(thisWindow) {
		chrome.windows.remove(thisWindow.id);
	});
}

function dismissNotification(notifications, $event, allNotificationsFlag) {
    chrome.runtime.sendMessage({
        command: "closeNotifications",
        notifications: notifications
    });
    
	hideNotification($event, allNotificationsFlag);
}

async function snoozeAndClose(snoozeParams, allNotificationsFlag) {
    // must execute snoozenotifications in bg because window closes and stops exec
    const notifications = allNotificationsFlag ? getRemainingNotifications() : [snoozeParams.$event._notification];
    console.log("snoozeAndClose", snoozeParams, notifications);

    // remove to continue avoid serialize issue with sendMessage;
    const $event = snoozeParams.$event;
    delete snoozeParams.$event;

    chrome.runtime.sendMessage({
        command: "snoozeNotifications",
        snoozeParams: snoozeParams,
        notifications: notifications
    });

	hideNotification($event, allNotificationsFlag);
}

function hideNotification($events, allNotificationsFlag) {
	
	var hidingAll = false;
	
	if (allNotificationsFlag) {
		$events = selectorAll(".event");
	} else {
        $events = selectorAll($events);
    }

	
	if (selectorAll(".event").length - $events.length == 0) {
		hidingAll = true;
	}
	
	var transitionType = hidingAll ? "fadeOut" : "slideUp";
	
	var hadVerticalScrollBar;
	if (byId("events").scrollHeight > byId("events").clientHeight) {
		hadVerticalScrollBar = true;
	}
	
    $events.forEach($event => {
        globalThis[transitionType]($event, "fast").then(() => {
            $event.remove();
            const $currentEvents = selectorAll(".event");
            const eventsCount = $currentEvents.length;
            if (eventsCount == 0) {
                closeWindow();
            } else {
                const $lastEvent = Array.from($currentEvents).last();
                if (hadVerticalScrollBar) {
                    // has scroll bar do nothing
                } else {
                    const resizeHeight = $lastEvent.clientHeight;
                    chrome.windows.getCurrent(thisWindow => {
    
                        const windowParams = {};
    
                        windowParams.height = thisWindow.height - resizeHeight + 1;
                        
                        if (DetectClient.isWindows()) {
                            // only happens laptop so commented for now???
                            /*
                            windowParams.width = thisWindow.width - 2;
                            windowParams.left = thisWindow.left + 1;
                            windowParams.top = thisWindow.top;
                            if (!window.resizedOnce && eventsCount <= 1) {
                                windowParams.top += 1;
                            }
                            window.resizedOnce = true;
                            */
                        }
    
                        chrome.windows.update(thisWindow.id, windowParams);
                    });
                }
            }
            
            const notifications = [];
            $currentEvents.forEach(eventNode => {
                const notification = eventNode._notification;
                if (notification) {
                    notifications.push(notification);
                }
            });
            generateWindowTitle(notifications);
        });
    });
}

function get$Event(o) {
	return o.closest(".event");
}

function get$EventById(id) {
	return Array.from(selectorAll(".event")).find($event => $event._notification.event.id == id);
}

function updateTimeElapsed() {
    const dateOptions = {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
        hourCycle: getHourCycle()
    };

	selectorAll(".event").forEach(async $event => {
		const notification = $event._notification;
		const timeElapsedMsg = await getTimeElapsed(notification.event);
		
		var $timeElapsed = $event.querySelector(".timeElapsed");
		if (timeElapsedMsg) {
            let titleStr;
            if (notification.event.allDay) {
                titleStr = notification.event.startTime.toLocaleDateStringJ();
            } else {
                titleStr = notification.event.startTime.toLocaleTimeStringJ(true);
            }

            titleStr += `\n\n${getMessage("notifications")}:`;
            const response = generateReminderTimes(notification.event);
            response.reminderTimes.forEach(reminderTime => {
                titleStr += `\n${reminderTime}`;
            });

            $timeElapsed.title = titleStr;
            $timeElapsed.textContent = timeElapsedMsg;
		}
		
		if (notification.event.startTime.diffInMinutes() <= 30) {
			hide($event.querySelector("[snoozeInMinutes='-30']"));
		}
		if (notification.event.startTime.diffInMinutes() <= 15) {
			hide($event.querySelector("[snoozeInMinutes='-15']"));
		}
		if (notification.event.startTime.diffInMinutes() <= 10) {
			hide($event.querySelector("[snoozeInMinutes='-10']"));
		}
		if (notification.event.startTime.diffInMinutes() <= 5) {
			hide($event.querySelector("[snoozeInMinutes='-5']"));
        }
        if (notification.event.startTime.diffInMinutes() <= 2) {
			hide($event.querySelector("[snoozeInMinutes='-2']"));
		}
		if (notification.event.startTime.diffInMinutes() <= 1) {
			hide($event.querySelector("[snoozeInMinutes='-1']"));
		}
		if (notification.event.startTime.diffInMinutes() <= 0) {
			hide($event.querySelector("[snoozeInMinutes='0']"));
        }
        
        $event.classList.toggle("no-snooze-before", $event.querySelector(".snooze-before-wrapper").clientHeight == 0);
    });
}

function dismissFirstEvent() {
	selector("#events .dismiss")?.click();
}

document.addEventListener("keydown", function(e) {
    console.log("keydown", e);
    storage.get("disableKeys").then(disableKeys => {
        if (!disableKeys) {
            if (e.key === "Escape") {
                storage.get("reminderWindowId").then(reminderWindowId => {
                    if (reminderWindowId) {
                        chrome.windows.update(reminderWindowId, {state:"minimized"});
                    }
                })
            } else if (e.key === "d") {
                // add buffer to avoid accidental typing dismisals
                const DELAY_IN_MILLIS = 500;
                if (windowOpenedTime.diffInMillis() < -DELAY_IN_MILLIS) {
                    dismissFirstEvent();
                }
            }
        }
    });
});

window.addEventListener("blur", () => {
	if (selectorAll("#events .event").length == 1 && isVisible("#header")) {
		const headerHeight = byId("header").clientHeight;
		hide("#header");
		window.resizeBy(0, -(headerHeight));
	}
});

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    (async function() {
        if (message.action == "dismissAll") {
            byId("dismissAll").click();
        } else if (message.action == "removeNotifications") {
            const events = await getEvents();
            // remove any deleted events
            message.notifications.forEach(function(notification) {
                var event = notification.event;
                var foundEvent = findEventById(event.id, events);
                if (!foundEvent) {
                    console.log("remove event from notifications because it was probably deleted", event);
                    const $event = get$EventById(event.id);
                    if ($event) {
                        hideNotification($event);
                    }
                }
            });
        }
    })();
});

function getRemainingNotifications() {
	return Array.from(selectorAll(".event")).map(el => el._notification);
}

function resizeToMinimumHeight(height) {
	chrome.windows.getCurrent(function(thisWindow) {
		if (height > thisWindow.height) {
			chrome.windows.update(thisWindow.id, {height:height});
		}
	});
}

function generateWindowTitle(notifications) {
    const titles = notifications.map(notification => getSummary(notification.event));
    
    if ("Intl" in window && Intl.ListFormat) {
        const formatter = new Intl.ListFormat(locale, { style: 'short', type: 'unit' });
        document.title = formatter.format(titles);
    } else {
        document.title = titles.join(", ");
    }
}

function setDefaultSnoozeTime($snooze, snoozeValue) {
    let timePeriodSymbol;
    let title;
    let snoozeValueToDisplay;

    if (snoozeValue) {
        if (String(snoozeValue).indexOf("d") != -1) {
            snoozeValue = String(snoozeValue).replace("d", "");
            snoozeValueToDisplay = snoozeValue;
            timePeriodSymbol = TimePeriodSymbol.DAY;
            title = getMessage(snoozeValue == 1 ? "Xday" : "Xdays", snoozeValue);
        } else if (snoozeValue < 60) {
            snoozeValueToDisplay = snoozeValue;
            timePeriodSymbol = TimePeriodSymbol.MINUTE;
            title = getMessage(snoozeValue == 1 || snoozeValue == -1 ? "Xminute" : "Xminutes", snoozeValue);
        } else {
            snoozeValueToDisplay = snoozeValue / 60;
            timePeriodSymbol = TimePeriodSymbol.HOUR;
            title = getMessage(snoozeValueToDisplay == 1 ? "Xhour" : "Xhours", snoozeValueToDisplay);
        }
    }

    const $snoozeText = $snooze.querySelector(".text");
    $snooze._defaultSnoozeTime = snoozeValue;
    $snooze._defaultSnoozeTimePeriod = timePeriodSymbol;
    if (snoozeValue) {
        $snooze.classList.add("has-text");
        $snooze.title = `${getMessage("snooze")} ${title}`;
        $snoozeText.textContent = snoozeValueToDisplay + getMessage(timePeriodSymbol);
    } else {
        $snooze.classList.remove("has-text");
        $snooze.title = "";
        $snoozeText.textContent = "";
    }
}
docReady(async () => {

    await storage.iniStorageCache();
    
    await initUI();

    email = await storage.get("email");
    calendarMap = await initCalendarMap();

    // patch: reload window because sometimes polymer code would not load and the buttons were not showing - refer to May 16th emails from mecouture
    let POLYMER_PATCH_URL_PARAM = "reloadedForPolymerPatch";
    if (!location.href.includes(POLYMER_PATCH_URL_PARAM)) {
        polymerPromise.then(() => {
            Array.from(selectorAll("paper-icon-button")).some(el => {
                if (isVisible(el)) {
                    // issue identified by visible button having no width
                    if (el.clientWidth == 0) {
                        setTimeout(() => {
                            location.href = setUrlParam(location.href, POLYMER_PATCH_URL_PARAM, "true");
                        }, 500);
                        sendGA('reminders', "reloadedForPolymerPatch");
                    }
                    return true;
                }
            });
        });
    }
    
    document.body.classList.toggle("hideDelete", await getHideDeleteFlag());
    
    notifications = await storage.get("_reminderWindowNotifications");

    for (let a=0; a<notifications.length; a++) {
        if (!notifications[a].event.startTime) {
            customShowError(`Event does not have a start time: ${notifications[a].event.title} .. ${notifications[a].event.summary} .. ${notifications[a].event.start}`);
            console.error("Event does not have a start time", notifications[a]);
            notifications.splice(a, 1);
            a--;
        }
    }
    
    if (await shouldShowReducedDonationMsg(true)) {
        show("#newsNotificationReducedDonationMessage");
        show("#newsNotification");
        onClick("#newsNotification", function() {
            openUrl("contribute.html?ref=reducedDonationFromReminders");
        });
    }
    
    if (await hasRemindersHeader(notifications)) {
        // commented because it "sometimes" wouldn't show??? so using class instead
        //$("#header").show();
        if (notifications.length <= 1) {
            hide("#headerButtons");
        }
        
        byId("header").classList.add("visible");
    }
    
    notifications.sort((a, b) => {
        if (a.recent && !b.recent) {
            return -1;
        } else if (!a.recent && b.recent) {
            return +1;
        } else {
            if (!a.event.allDay && b.event.allDay) {
                return -1;
            } else if (a.event.allDay && !b.event.allDay) {
                return +1;
            } else {
                if (a.event.startTime.getTime() > b.event.startTime.getTime()) {
                    return -1;
                } else {
                    return +1;
                }
            }
        }
    });
    
    const HEADER_SELECTOR = "#header";
    const EVENT_SELECTOR = ".event";

    function getClosestSnoozeWrapper(el) {
        return el.closest(EVENT_SELECTOR) ?? el.closest(HEADER_SELECTOR);
    }

    onDelegate(document.body, "click", ".snooze", function(event) {
        const el = event.target.closest(".snooze");
        const defaultSnoozeTime = el._defaultSnoozeTime;
        if (defaultSnoozeTime) {
            let attribute;
            if (el._defaultSnoozeTimePeriod == TimePeriodSymbol.DAY) {
                attribute = "snoozeInDays";
            } else {
                attribute = "snoozeInMinutes";
            }
            const button = getClosestSnoozeWrapper(el).querySelector(`paper-button[${attribute}='${defaultSnoozeTime}']`);
            if (button) {
                button.click();
            } else {
                customShowError("Snooze time does not have a corresponding button");
            }
        }
    });

    document.body.addEventListener("mouseenter", async function(event) {
        console.log("mouseenter", event.target);
        if (event.target.matches(".snooze")) {
            const $snooze = event.target.closest(".snooze");
            getClosestSnoozeWrapper($snooze).classList.add("snoozeButtonsVisible");
    
            const notification = $snooze.closest(".event")?._notification;
            const defaultSnoozeBeforeTime = await storage.get("defaultSnoozeBeforeTime");
            const defaultSnoozeTime = await storage.get("defaultSnoozeTime");
    
            if (notification) {
                const diffInMinutes = new Date().diffInMinutes(notification.event.startTime);
                
                // event has passed
                if (diffInMinutes > 0) {
                    setDefaultSnoozeTime($snooze, defaultSnoozeTime);
                } else { // event is coming up
                    if (!notification.event.allDay && diffInMinutes <= defaultSnoozeBeforeTime) {
                        setDefaultSnoozeTime($snooze, defaultSnoozeBeforeTime);
                    } else {
                        setDefaultSnoozeTime($snooze, defaultSnoozeTime);
                    }
                }
            } else {
                // possibly snooze all
                setDefaultSnoozeTime($snooze, defaultSnoozeTime);
            }
        } else if (event.target.matches(".dismiss") || event.target.matches(".delete")) {
            getClosestSnoozeWrapper(event.target).classList.remove("snoozeButtonsVisible");
        }
    }, true);

    document.body.addEventListener("mouseleave", async function(event) {
        console.log("mouseleave", event.target)

        if (event.target.matches(".snoozeButtons")) {
            getClosestSnoozeWrapper(event.target.closest(".snoozeButtons")).classList.remove("snoozeButtonsVisible");
        } else if (event.target.matches(HEADER_SELECTOR)) {
            event.target.closest(HEADER_SELECTOR).classList.remove("snoozeButtonsVisible");
        } else if (event.target.matches(EVENT_SELECTOR)) {
            event.target.closest(EVENT_SELECTOR).classList.remove("snoozeButtonsVisible");
        }
    }, true);

    onClick("#settings", function() {
        openUrl(chrome.runtime.getURL("options.html#notifications"), {urlToFind:chrome.runtime.getURL("options.html")});
    });
    
    insertScript("js/custom-icons.js", "custom-icons"); // used to be in reminder.html but didn't work in FF ... <link id="custom-icons" rel="import" href="custom-icons.html">
    byId("custom-icons").addEventListener("load", async function() {
        var $events = byId("events");
        
        if (window.innerHeight != 0 && await hasRemindersHeader(notifications)) {
            //$events.height($(window).height() - $("#header").outerHeight());
            //if (notifications.length > ReminderWindow.MAX_NOTIFICATIONS) { // had scrollbar issue when https://jasonsavard.com/forum/discussion/comment/21025#Comment_21025
                $events.style.height = `${Math.min(ReminderWindow.MAX_NOTIFICATIONS, notifications.length) * ReminderWindow.NOTIFICATION_HEIGHT}px`;
            //}
        }
        
        // ff patch for empty paper-icon-button: seems when had 3+ test events and calling .clone() on eventTemplate below it was creating the issue - so added a 1ms timeout
        await sleep(1);

        const cachedFeeds = await storage.get("cachedFeeds");
        const arrayOfCalendars = await getArrayOfCalendars();
        const showEventIcons = await storage.get("showEventIcons");

        let documentTitleSet = false;
        await asyncForEach(notifications, async (notificationOpened, index) => {
            
            var event = notificationOpened.event;
            
            var $event = selector(".eventTemplate").cloneNode(true);
            $event.classList.remove("eventTemplate");
            $event.classList.add("event");
            $event._notification = notificationOpened;
            initMessages($event.querySelectorAll("*"));

            if (showEventIcons) {
                setEventIcon({
                    event: event,
                    $eventIcon: $event.querySelector(".eventIcon"),
                    cachedFeeds: cachedFeeds,
                    arrayOfCalendars: arrayOfCalendars
                });
            }
            
            const eventNotificationDetails = await getEventNotificationDetails(event, {ignoreDuration: true});
            const summary = eventNotificationDetails.title;
            var title;
            var sourceUrl;
            
            var eventSource = getEventSource(event);
            var $sourceWrapper = $event.querySelector(".sourceWrapper");
            let sourceVisible = true;
            
            if (eventSource) {
                // if event source has same title as event then let's use the link url instead
                if (summary == eventSource.title) {
                    title = eventSource.url;
                } else {
                    title = eventSource.title;
                }
                sourceUrl = eventSource.url;
                
                if (event.extendedProperties?.private?.favIconUrl) {
                    const $linkImage = $sourceWrapper.querySelector(".linkImage");
                    $linkImage.removeAttribute("icon");
                    $linkImage.setAttribute("src", event.extendedProperties.private.favIconUrl);
                } else {
                    hide($sourceWrapper.querySelector(".linkImageWrapper"));
                }
            }
            
            // source
            if (title) {
                const $link = $sourceWrapper.querySelector(".link");
                $link.href = sourceUrl;
                $link.title = sourceUrl;
                $link.textContent = title;
            } else {
                hide($sourceWrapper);
                sourceVisible = false;
            }

            // location
            const $locationWrapper = $event.querySelector(".locationWrapper");
            let locationVisible = true;

            if (event.location) {
                title = event.location;
                locationUrl = generateLocationUrl(event);
                if (sourceUrl == locationUrl) {
                    hide($locationWrapper);
                    locationVisible = false;
                } else {
                    const $link = $locationWrapper.querySelector(".link");
                    $link.href = locationUrl;
                    $link.title = locationUrl;
                    $link.textContent = title;
                }
            } else {
                hide($locationWrapper);
                locationVisible = false;
            }

            // too much, so remove one item, refer: https://bitbucket.org/jasonsav/checker-plus-for-google-calendar/issues/156/better-reminders-spacing
            if (summary.length > 25 && sourceVisible && locationVisible) {
                hide($sourceWrapper);
            }
            
            // video
            const $videoWrapper = $event.querySelector(".videoWrapper");
            if (event.hangoutLink || event.conferenceData?.conferenceSolution) {

                let video;
                let joinVideoStr;

                if (event.conferenceData?.conferenceSolution) {
                    const $linkImage = $videoWrapper.querySelector(".linkImage");
                    $linkImage.removeAttribute("icon");
                    $linkImage.setAttribute("src", event.conferenceData.conferenceSolution.iconUri);

                    video = event.conferenceData.entryPoints.find(entryPoint => entryPoint.entryPointType == "video");

                    if (event.conferenceData.conferenceSolution.name) {
                        joinVideoStr = getMessage("joinWithX", event.conferenceData.conferenceSolution.name);
                    }
                }

                if (!joinVideoStr) {
                    joinVideoStr = getMessage("joinVideoCall");
                }

                const videoLink = $videoWrapper.querySelector(".link");
                videoLink.href = event.hangoutLink ?? video?.uri;
                videoLink.textContent = joinVideoStr;
                onClick(videoLink, async () => {
                    if (await storage.get("dismissEventAfterClickingJoinVideo")) {
                        dismissNotification([notificationOpened], $event);
                    }
                });
            } else {
                hide($videoWrapper);
            }
            
            if (notifications.length == 1 && eventNotificationDetails.calendarName) {
                document.title = `${summary} (${eventNotificationDetails.calendarName})`;
                documentTitleSet = true;
            }
            
            var eventHoverTitle = summary;
            if (event.description) {
                eventHoverTitle += `\n\n${htmlToText(event.description)}`;
            }
            
            const eventColor = getEventColors({
                event: event,
                darkenColorFlag: true,
                cachedFeeds: cachedFeeds,
                arrayOfCalendars: arrayOfCalendars
            });

            const $title = $event.querySelector(".title");
            $title.style.color = eventColor;
            $title.title = eventHoverTitle;
            $title.textContent = summary;
            onClick($title, function(e) {
                console.log("event", e);
                if (isCtrlPressed(e) || event.button == 1) {
                    chrome.tabs.create({url:getEventUrl(event), active:false});
                } else {
                    openUrl(getEventUrl(event), {urlToFind:event.id});
                }
                sendGA('reminders', "title");
            });
            
            const $calendarName = $event.querySelector(".calendar-name");
            if (eventNotificationDetails.calendarName) {
                $calendarName.style.color = eventColor;
                $calendarName.textContent = `(${eventNotificationDetails.calendarName})`;
                show($calendarName);
            } else {
                hide($calendarName);
            }
            
            // init snooze buttons
            if (event.allDay) {
                hide($event.querySelector(".snoozeBefore"));
            }
            
            if (event.recurringEventId) {
                $event.classList.add("repeatingEvent");
                const $repeating = $event.querySelector(".repeating");
                onClick($repeating, function() {
                    alert("This is a recurring event")
                });
                show($repeating);
                
                hide($event.querySelector(".delete"));
            }
            
            onClick($event.querySelector(".delete"), async e => {
                sendGA('reminders', "delete");
                if (event.test) {
                    // do nothing - just dismiss
                    dismissNotification([notificationOpened], $event);
                } else {
                    // don't worry about recurring events - we don't display delete buttons for them
                    sendMessageToBG("deleteEvent", event);
                    dismissNotification([notificationOpened], $event);
                }
            });
            
            onClick($event.querySelector(".dismiss"), function(e) {
                sendGA('reminders', "dismiss", "individual", 1);

                dismissNotification([notificationOpened], $event);
            });
            
            $events.append($event);
            $event.removeAttribute("hidden");
        });

        if (!documentTitleSet) {
            generateWindowTitle(notifications);
        }

        updateTimeElapsed();

        setInterval(function() {
            updateTimeElapsed();
        }, minutes(1));

        selectorAll("paper-button[snoozeInDays]").forEach(el => {
            let snoozeInDays = el.getAttribute("snoozeInDays");
            let snoozeDate = new Date().addDays(snoozeInDays);
            let tooltipStr;
            if (snoozeInDays == "7") {
                tooltipStr = snoozeDate.toLocaleDateStringJ();
            } else {
                tooltipStr = snoozeDate.toLocaleDateString(locale, {
                    weekday: 'long'
                });
            }
            const $paperTooltip = el.querySelector("paper-tooltip");
            if ($paperTooltip) {
                $paperTooltip.textContent = tooltipStr;
            }
        });

        if (!await storage.get("donationClicked")) {
            selectorAll("paper-button[snoozeInDays], .more").forEach(el => {
                el.classList.add("mustDonate");
                el.title = getMessage("donationRequired");
            });
        }

        onClick("paper-button[snoozeInMinutes], paper-button[snoozeInDays]", async function(event) {
            let $event;
            const snoozeAllFlag = this.closest("#header");
            if (!snoozeAllFlag) {
                $event = get$Event(this);
            }
            const snoozeParams = {
                $event: $event,
                inMinutes: this.getAttribute("snoozeInMinutes"),
                inDays: this.getAttribute("snoozeInDays")
            };

            if (snoozeParams.inDays && !await storage.get("donationClicked")) {
                const $dialog = initTemplate("contributeDialogTemplate");
                openDialog($dialog).then(response => {
                    if (response == "cancel") {
                        openUrl("contribute.html?action=snooze");
                    }
                });
            } else {
                await snoozeAndClose(snoozeParams, snoozeAllFlag);
                if (snoozeParams.inMinutes) {
                    sendGA('reminders', "snooze", `minutes_${snoozeParams.inMinutes}`, 1);
                } else {
                    sendGA('reminders', "snooze", `days_${snoozeParams.inDays}`, 1);
                }
            }
        });

        onClick(".more", async function() {
            if (await storage.get("donationClicked")) {
                const $event = get$Event(this);
                resizeToMinimumHeight(370);
                
                byId("dateSnooze").value = "";
                byId("timeSnooze").value = "";

                document.body.classList.add("dateTimePickerVisible");
                byId("dateTimeSnoozeWrapper")._$event = $event;
            } else {
                const $dialog = initTemplate("contributeDialogTemplate");
                openDialog($dialog).then(response => {
                    if (response == "cancel") {
                        openUrl("contribute.html?action=snoozeMore");
                    }
                });
            }
        });

        onClick(".closeButton", function() {
            document.body.classList.remove("dateTimePickerVisible");
            byId("dateSnooze").value = "";
            byId("timeSnooze").value = "";
        });

        onClick("#dateTimeSnoozeButton", async () => {
            if (await donationClicked("snoozeDateTime")) {

                if (!byId("dateSnooze").value.trim() && !byId("timeSnooze").value.trim()) {
                    alert("Must enter either a date and/or time!");
                    return;
                }

                const snoozeParams = {
                    $event: byId("dateTimeSnoozeWrapper")._$event
                };

                const snoozeTime = dateSnoozePicker.dateTime ?? today();

                if (byId("timeSnooze").value.trim()) {
                    var time;

                    // see if ie. 24min was entered
                    const eventEntry = await getEventEntryFromQuickAddText(byId("timeSnooze").value);
                    if (eventEntry.startTime) {
                        time = eventEntry.startTime;
                    } else { // else get time from dropdown
                        time = snoozeTimePicker.dateTime;
                    }
                    snoozeTime.setHours(time.getHours());
                    snoozeTime.setMinutes(time.getMinutes());
                    snoozeTime.setSeconds(0, 0);
                    
                    snoozeParams.snoozeTime = snoozeTime;
                } else {
                    resetTime(snoozeTime);
                    snoozeParams.inDays = snoozeTime.diffInDaysForHumans();
                }

                await snoozeAndClose(snoozeParams, byId("dateTimeSnoozeButton").classList.contains("ctrlKey"));

                document.body.classList.remove("dateTimePickerVisible");
                byId("dateSnooze").value = "";
                byId("timeSnooze").value = "";

                sendGA('reminders', "more");
            }
        });

        if (!globalThis.dateSnoozePicker) {

            insertStylesheet("fullcalendar/main.css");
            await insertScript("fullcalendar/main.js");

            globalThis.dateSnoozePicker = new DatePicker(byId("dateSnooze"), {
                fullCalendarParams: await generateFullCalendarParams(),
            });
        }

        globalThis.snoozeTimePicker = new TimePicker(byId("timeSnooze"));
        
        addEventListeners('#timeSnooze', "keydown", function(e) {
            console.log("timesnooze", e)
            if (e.key == "Enter") {
                console.log("enter");
                byId("dateTimeSnoozeButton").click();
            }
        });

        onClick("#dismissAll", function() {
            const notifications = getRemainingNotifications();

            // cpu intensive so let's delay the execution til after we close the window
            chrome.runtime.sendMessage({
                command: "closeNotificationsDelayed",
                notifications: notifications
            });

            sendGA('reminders', "dismiss", "dismissAll");
            closeWindow();
        });

        if (getUrlValue(location.href, "closeWindowGuide")) {
            const $dialog = initTemplate("closeWindowDialogTemplate");
            openDialog($dialog);
        }

        console.log("remove cache")
        storage.clearCache();
    });
});