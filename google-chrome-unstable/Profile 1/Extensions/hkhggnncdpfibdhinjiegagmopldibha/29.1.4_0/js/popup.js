var openingSite = false;
var autoSaveInterval;

var eventTitle = null;
var description = null;
var descriptionFromPage;

// bgobjects
var email;
var cachedFeeds;
var colors;
var writeableCalendars = [];

var betaCalendarFirstLoad = true;
var inWidget;
var fromToolbar;
var isDetached;
var fromGrantedAccess;
var skinsSettings;
var calendarShowingCurrentDate = true;
var scrollTarget;
const ffPatchForResizeAndMorePopoutDisappearing = DetectClient.isFirefox();
var WHEEL_THRESHOLD = DetectClient.isFirefox() ? 3 : 100;
var contactsData;
let calendarMap;
const FULL_CALENDAR_SOURCE_ID = "main-source";
let fullCalendar;
var fetchingAgendaEvents;
var previousScrollTop = 0;

chrome.runtime.onMessage.addListener(/* DONT USE ASYNC HERE because of return true */function(message, sender, sendResponse) {
    console.log("onMessage.addListener", message);
    if (message.command == "grantPermissionToCalendarsAndPolledServer") {
        storage.disable("loggedOut").then(() => {
            location.reload();
        })
    } else if (message.command == "grantPermissionToTasksAndPolledServer") {
        postGrantPermissionToTasksAndPolledServer();
    } else if (message.command == "grantPermissionToContacts") {
        hideLoading();
        const $inviteGuestsDialog = byId("inviteGuestsDialog");
        if ($inviteGuestsDialog) {
            $inviteGuestsDialog.close();
        }
        byId("inviteGuests")?.click();
        sendResponse();
    } else if (message.command == "gcmUpdate") {
        console.log("gcm update");
        // required to re-initialize variable events
        getBGObjects().then(() => {
            fullCalendar?.refetchEvents();
        });
    } else if (message.command == "getPopupDetails") {
        sendResponse({
            fromToolbar: fromToolbar
        });
    }
});

if (location.href.includes("source=widget")) {
	inWidget = true;
} else if (location.href.includes("source=toolbar")) {
	fromToolbar = true;
} else if (location.href.includes("source=grantedAccess")) {
	fromGrantedAccess = true;
} else {
	isDetached = true;
}

function postGrantPermissionToTasksAndPolledServer() {
    location.reload();
}

async function getEventsWrapper() {
    const events = await getEvents();

    if (!window.cacheEventsForGettingSnoozers) {
        window.cacheEventsForGettingSnoozers = true;
        const futureSnoozes = await getFutureSnoozes(await getSnoozers(events), {email:await storage.get("email")});
        if (futureSnoozes.length) {
            console.log("snozzes", futureSnoozes);
    
            onClick(".openSnoozedEvents", function() {
                openReminders({notifications:futureSnoozes.shallowClone()}).then(() => {
                    close();
                });
            });
        } else {
            const $openSnoozedEvents = selector(".openSnoozedEvents");
            const $sep = $openSnoozedEvents.previousElementSibling;
            if ($sep?.matches(".separator")) {
                hide($sep);
            }
            hide($openSnoozedEvents);
        }
    }

    return events;
}

function closeWindow() {
	if (fromToolbar) {
		window.close();
	}
}

function showSaving() {
	byId("progress").style.opacity = "1";
}

function hideSaving() {
	byId("progress").style.opacity = "0";
}

function showLoadingError(error) {
	polymerPromise2.then(() => {
		if (error.stack) {
			showError(error + " " + error.stack);
		} else {
			showError(error);
		}
	});
}

function showCalendarError(error) {
	// todo need to show a link to re-grant
    console.error("showCalendarError", error);

    if (!isOnline() || error.code == 0) { // must check this before access errors below
        showError(getMessage("yourOffline"));
    } else if (error.toString().includes("401")
        || error.toString().includes("OAuth2 not granted or revoked")
        || error.code == 401) { // invalid grant
		storage.enable("loggedOut");
		showError(getMessage("accessNotGrantedSeeAccountOptions", ["", getMessage("accessNotGrantedSeeAccountOptions_accounts")]), {
			text: getMessage("accounts"),
			onClick: function() {
				openUrl("options.html?accessNotGranted=true#accounts");
			}
		});
	} else {
		showError(error);
	}
}

function generateAccountStub(email) {
	return {
		getAddress: function() {
			return email;
		}
	}
}

async function cacheContactsData() {
    if (!globalThis.cacheContactsDataPromise || !contactsData) {
        globalThis.cacheContactsDataPromise = new Promise(async (resolve, reject) => {
            if (!contactsData) {
                contactsData = await storage.get("contactsData");
            }
            contactsTokenResponse = await oAuthForContacts.findTokenResponse({ userEmail: email });
            resolve();
        });
    }
    return globalThis.cacheContactsDataPromise;
}

async function getBGObjects() {
    console.time("getBGObjects");
    
    await initUI();
    
    email = await storage.get("email");
    cachedFeeds = await storage.get("cachedFeeds");
    colors = cachedFeeds["colors"];
    calendarMap = await initCalendarMap();
    
    console.timeEnd("getBGObjects");
        
    skinsSettings = await storage.get("skins");

    window.blackFontEvents = skinsSettings.some(skin => {
        if (skin.id == SkinIds.BLACK_FONT_EVENTS) {
            return true;
        }
    });
    window.matchFontColorWithEventColor = skinsSettings.some(skin => {
        if (skin.id == SkinIds.MATCH_FONT_COLOR_WITH_EVENT_COLOR) {
            return true;
        }
    });
}

async function getCalendarView() {
	let calendarView;

	/* must match min-width 500 */
	if (!document.body || document.body.clientWidth >= 500) {
        calendarView = getUrlValue(location.href, "calendarView") ?? await storage.get("calendarView");
	} else {
		calendarView = CalendarView.AGENDA;
	}
	
	return calendarView;
}

function shouldWatermarkImage(skin) {
	if (skin.image && skin.author != "Jason") {
		return true;
	}
}

function addSkinPiece(id, css) {
	polymerPromise.then(() => {
		byId(id).append(css);
	});
}

function addSkin(skin, id) {
	if (!id) {
		id = "skin_" + skin.id;
	}
	byId(id)?.remove();
    
    const $body = document.body;
    
	$body.classList.add(id);
	
	let css = "";
	
	if (skin.image) {
		$body.classList.add("background-skin");

        let defaultBackgroundColorCSS = "";
		// normally default is black BUT if image exists than default is white, unless overwritten with text_color
		if (skin.text_color != "dark") {
            defaultBackgroundColorCSS = "background-color:black;";
			//css += " html:not(.searchInputVisible) [main] paper-toolbar paper-icon-button, #topLeft, #skinWatermark, .showMoreEmails iron-icon {color:white} ";
		}

		var resizedImageUrl;
		if (/blogspot\./.test(skin.image) || /googleusercontent\./.test(skin.image)) {
			resizedImageUrl = skin.image.replace(/\/s\d+\//, "\/s" + parseInt($body.clientWidth) + "\/");
		} else {
			resizedImageUrl = skin.image;
		}
		
		//css += "[main] {background-size:cover;background-image:url('" + resizedImageUrl + "');background-position-x:50%;background-position-y:50%} [main] paper-toolbar {background-color:transparent} .accountHeader {background-color:transparent}";
		// Loading the background image "after" initial load for 2 reasons: 1) make sure it loads after the mails. 2) to trigger opacity transition
        addSkinPiece(id, `
            app-header-layout::before {
                opacity: 0.5;
                background-size: cover;
                background-image: url('${resizedImageUrl}');
                ${defaultBackgroundColorCSS}
                background-position-x: 50%;
                background-position-y: 50%;
            }
            app-header-layout app-toolbar,
            .accountHeader {
                background-color:transparent !important
            }
        `);
		
		if (shouldWatermarkImage(skin)) {
            const $skinWatermark = byId("skinWatermark");
			$skinWatermark.classList.add("visible");
			$skinWatermark.textContent = skin.author;
			if (skin.author_url) {
				$skinWatermark.href = skin.author_url;
			} else {
				$skinWatermark.removeAttribute("href");
			}
		}
	}
	if (skin.css) {
		css += " " + skin.css;
	}
	
	addCSS(id, css);
}

function removeSkin(skin) {
    byId("skin_" + skin.id)?.remove();
    document.body.classList.remove("skin_" + skin.id);

	if (shouldWatermarkImage(skin)) {
		byId("skinWatermark").classList.remove("visible");
	}
}

function setSkinDetails($dialog, skin) {
	
    onClickReplace($dialog.querySelector("#skinCSS"), function(event) {
        const $textarea = document.createElement("textarea");
        $textarea.setAttribute("readonly", "");
        $textarea.style.cssText = "width:400px;height:200px";
		$textarea.textContent = skin.css;
		
		openGenericDialog({
			title: "Skin details",
			content: $textarea
		});

		event.preventDefault();
        event.stopPropagation();
	});

	show("#skinAuthorInner");

	if (skin.css) {
		$dialog.querySelector("#skinCSS").href = "#";
	} else {
		$dialog.querySelector("#skinCSS").removeAttribute("href");
	}
	
	$dialog.querySelector("#skinAuthor").textContent = skin.author;
	if (skin.author_url) {
		$dialog.querySelector("#skinAuthor").href = skin.author_url;
	} else {
		$dialog.querySelector("#skinAuthor").removeAttribute("href");
	}
}

async function isGmailCheckerInstalled(callback) {
	// use cached response for true
	if (await storage.get("gmailCheckerInstalled")) {
		callback(true);
	} else {
		sendMessageToGmailExtension({action:"getInfo"}).then(response => {
			var installed = false;
			if (response && response.installed) {
				installed = true;
				storage.enable("gmailCheckerInstalled");
			}
			callback(installed)
		}).catch(error => {
			callback();
		});
	}
}

function convertEventToFullCalendarEvent(params) {
    let fcEvent = {};
    
    const eventEntry = params.eventEntry;
	
	fcEvent.id = getEventID(eventEntry);
	
	fcEvent.title = eventEntry.title;
	if (!fcEvent.title) {
		fcEvent.title = getSummary(eventEntry);
	}
	
	//fcEvent.url = getEventUrl(eventEntry);

	if (hasUserDeclinedEvent(eventEntry, email)) {
		fcEvent.isDeclined = true;
	}
	
	if (params.snoozeTime) {		
		fcEvent.isSnoozer = true;
		fcEvent.id += "_snooze";
        
        // v2 let's force the snoozed event to allday - so that the time does not appear, v1 let's force the snoozed event to allday if not today
        if (params.snoozeTime.getHours() == 0 && params.snoozeTime.getMinutes() == 0) {
            fcEvent.allDay = true;
        }
		fcEvent.start = params.snoozeTime;
		fcEvent.end = params.snoozeTime.addDays(1);
		// required for fullcalendar or else it would spread the event across many days
		resetTime(fcEvent.end);
	} else {
        fcEvent.allDay = eventEntry.allDay;
        fcEvent.start = new Date(eventEntry.startTime);
        fcEvent.end = new Date(eventEntry.endTime);
	}

	const eventColors = getEventColors({
        event: eventEntry,
        cachedFeeds: params.cachedFeeds,
        arrayOfCalendars: params.arrayOfCalendars
    });
	fcEvent.textColor = eventColors.fgColor;
    fcEvent.color = eventColors.bgColor;
	fcEvent.jEvent = eventEntry;

	return fcEvent;
}

async function convertAllEventsToFullCalendarEvents(events) {
    const cachedFeeds = await storage.get("cachedFeeds");
    const arrayOfCalendars = await getArrayOfCalendars();
    const calendarSettings = await storage.get("calendarSettings");
    const showDeclinedEvents = calendarSettings.showDeclinedEvents;
    const hideInvitations = calendarSettings.hideInvitations;
    const selectedCalendars = await storage.get("selectedCalendars");

	const fullCalendarEvents = [];
	
	events.forEach(event => {
		let snoozeTime;
		if (event.isSnoozer) {
			jEvent = event.event;			
			snoozeTime = event.time;
		} else {
			jEvent = event;
		}
		
		const calendar = getEventCalendar(jEvent);

		const selected = isCalendarSelectedInExtension(calendar, email, selectedCalendars);
		if (selected && passedShowDeclinedEventsTest(jEvent, showDeclinedEvents, email) && passedHideInvitationsTest(jEvent, hideInvitations, email)) {
            const fcEvent = convertEventToFullCalendarEvent({
                eventEntry: jEvent,
                snoozeTime: snoozeTime,
                cachedFeeds: cachedFeeds,
                arrayOfCalendars: arrayOfCalendars
            });
			fullCalendarEvents.push(fcEvent);
		}
    });
	return fullCalendarEvents;
}

function openSiteInsteadOfPopup() {
	openingSite = true;
	openGoogleCalendarWebsite();
}

var tooLateForShortcut = false;
setInterval(function() {tooLateForShortcut=true}, 500);
window.addEventListener ("keydown", async e => {
	//console.log("activenode", document.activeElement.nodeName);
	// for bypassing popup and opening google calendar webpage
	if (fromToolbar && !tooLateForShortcut && isCtrlPressed(e)) {
		tooLateForShortcut = true;
		if (await donationClicked("CtrlKeyOnIcon")) {
			openSiteInsteadOfPopup();
			return;
		}
	}
	
	if (isCtrlPressed(e)) {
		byId("betaCalendar").classList.add("ctrlKey");
	}
	
	if (e.key === "Escape") {
		if (e.target.closest("paper-dialog")) {
            e.preventDefault();
        } else if (isVisible("#back")) {
            byId("back").click();
            e.preventDefault();
        } else if (htmlElement.classList.contains("quickAddVisible")) {
            closeQuickAdd();
            e.preventDefault();
		} else {
			// do nothing and let it chrome close it
		}
    } else if (isFocusOnInputElement()) {
        if (e.ctrlKey && e.key == "s") {
            if (isVisible("#saveEvent")) {
                byId("saveEvent").click();
                e.preventDefault();
            }
        }
	} else {
		if (e.key === "ArrowRight" || e.key === "ArrowDown") {
			fullCalendar?.next();
			e.preventDefault();
		} else if (e.key === "ArrowLeft" || e.key === "ArrowUp") { // up arrow or left arrrow
			fullCalendar?.prev();
			e.preventDefault();
		} else if (e.key === "Home") {
			fcChangeView(await getCalendarView());
			fullCalendar?.today();
            e.preventDefault();
        } else if (e.ctrlKey && e.key == "g") {
            openGoToDate();
            e.preventDefault();
        } else if (e.key == "/") {
            showSearch();
            e.preventDefault();
        } else if (isCtrlPressed(e) && e.key == "1") {
            changeCalendarView(CalendarView.DAY);
            e.preventDefault();
        } else if (isCtrlPressed(e) && e.key == "2") {
            changeCalendarView(CalendarView.WEEK);
            e.preventDefault();
        } else if (isCtrlPressed(e) && e.key == "3") {
            changeCalendarView(CalendarView.MONTH);
            e.preventDefault();
        } else if (isCtrlPressed(e) && e.key == "4") {
            changeCalendarView(CalendarView.CUSTOM);
            e.preventDefault();
        } else if (isCtrlPressed(e) && e.key == "5") {
            changeCalendarView(CalendarView.AGENDA);
            e.preventDefault();
        } else if (isCtrlPressed(e) && e.key == "6") {
            changeCalendarView(CalendarView.LIST_WEEK);
            e.preventDefault();
        } else if (e.key == "?") {
            openDialog("keyboardShortcutDialogTemplate");
		} else {
			if (!isCtrlPressed(e) && e.key != "Shift" && e.key != "Alt") {
				console.log("keydown", e);
				console.log("active", document.activeElement.nodeName);
                await initQuickAdd();
                byId("quickAddWrapper").classList.add("inputEntered");
				// patch because sometimes when the keydown happens to quickly while the popup/polymer is loading it would not be communicated to the input tag
				//$("#quickAdd").val( $("#quickAdd").val() + e.key );
				//return false;
			}
        }
	}
	
	// for Dismissing events
	if (e.altKey && e.key == "d") {
		chrome.runtime.sendMessage({action: "dismissAll"}, function() {
			closeWindow();
		});		
	}

}, false);

window.addEventListener ("keyup", function(e) {
	if (!isCtrlPressed(e)) {
		byId("betaCalendar").classList.remove("ctrlKey");
	}
}, false);

window.addEventListener("wheel", async e => {
    const inFullCalendar = e.target.closest("#betaCalendar");
    const calendarView = await getCalendarView();
    const customView = await storage.get("customView");
	if ((calendarView == CalendarView.MONTH || (calendarView == CalendarView.CUSTOM && isCustomViewInWeeks(customView))) && inFullCalendar) {
        if (!isFocusOnInputElement()
            && !hasVerticalScrollbar(e.target)
            && !hasHorizontalScrollbar(e.target)
            && !hasVerticalScrollbar(byId("mainContent"))) {
			if (e.deltaX <= -WHEEL_THRESHOLD || e.deltaY <= -WHEEL_THRESHOLD) {
				fullCalendar.prev();
			} else if (e.deltaX >= WHEEL_THRESHOLD || e.deltaY >= WHEEL_THRESHOLD) {
				fullCalendar.next();
			}
		}
	}
});

window.addEventListener('paste', event => {
    if (!isFocusOnInputElement()) {
        initQuickAdd();
        byId("quickAddWrapper").classList.add("inputEntered");
    }
});

async function reloadCalendar(params) {
    // default atleast in the context of this popup window is to ignorenotification for performance
    params.ignoreNotifications = true;
    
    try {
        const response = await sendMessageToBG("pollServer", params);
        console.log("pollserver response", response);
        await getBGObjects();
    } catch (error) {
        showCalendarError(error);
    } finally {
        if (htmlElement.classList.contains("searchInputVisible")) {
            searchEvents();
        } else {
            if (params.refetchEvents) {
                fullCalendar?.refetchEvents();
            }
            if (await getCalendarView() == CalendarView.AGENDA) {
                initAgenda();
                hideLoading();
            }
        }
    }
}

function setStatusMessage(params) {
	var $toast = byId("eventToast");
	var duration = params.onEditClick || params.onUndoClick ? 6 : 2;

	function processOnAction(clickHandler, toastButton) {
		const $toastButton = $toast.querySelector(toastButton);
		if (clickHandler) {
			$toastButton.removeAttribute("hidden");
            onClickReplace($toastButton, function() {
                $toast.hide();
                clickHandler();
            });
		} else {
			$toastButton.setAttribute("hidden", "");
		}
	}

	processOnAction(params.onEditClick, ".toastEditEvent");
	processOnAction(params.onUndoClick, ".toastUndoEvent");
	processOnAction(params.onSetAsDefaultCalendar, ".toastSetAsDefaultCalendar");
	
	showToast({toastId:"eventToast", text:params.message, duration:duration, keepToastLinks:true});
}

async function setEventDateMessage(eventEntry) {
	let $message;

	if (eventEntry.inputSource == InputSource.QUICK_ADD) {
		var message = await formatEventAddedMessage("<span class='eventTitle' style='color:#fff38a;font-size:120%'>" + eventEntry.summary.trim() + "</span>", eventEntry);
	
		// for safe Firefox DOM insertion
		var messageNode = new DOMParser().parseFromString(message, "text/html").body;
		$message = document.createElement("span");
		Array.from(messageNode.childNodes).forEach(node => {
			const $eventTitle = document.createElement("span");
			$eventTitle.textContent = node.textContent;
			if (node.className) {
				$eventTitle.classList.add(node.className);
			}
			if (node.style?.cssText) {
				$eventTitle.style.cssText = node.style.cssText;
			}
			$message.append( $eventTitle );
		});
	} else {
        let message;
        if (eventEntry.kind == TASKS_KIND) {
            message = getMessage("taskSaved");
        } else {
            message = getMessage("eventSaved");
        }
        $message = document.createElement("span");
        $message.style.cssText = "display:inline-block;min-width:100px";
        $message.textContent = message;
	}

	let statusMessageParams = {
		message: $message,
		eventEntry: eventEntry,
		onEditClick: function() {
			showCreateBubble({event:eventEntry, editing:true});
		},
		onUndoClick: function() {
			showSaving();
			deleteEvent(eventEntry).then(async response => {
                if (fullCalendar) {
                    if (eventEntry.recurrence) {
                        fullCalendar.getEvents().forEach(event => {
                            if (eventEntry.id == event.extendedProps.jEvent.recurringEventId) {
                                event.remove();
                            }
                        });
                    } else {
                        fullCalendar.getEventById(getEventID(eventEntry)).remove();
                    }
                }
				setStatusMessage({message:getMessage("eventDeleted")});
				
				if (await getCalendarView() == CalendarView.AGENDA) {
					initAgenda();
				}
			}).catch(error => {
				showError("Error deleting event: " + error);
			}).then(() => {
				hideSaving();
			});
		}
    }
    const arrayOfCalendars = await getArrayOfCalendars();
	if (eventEntry.kind != TASKS_KIND && eventEntry.calendarId != await getDefaultCalendarId(arrayOfCalendars)) {
		statusMessageParams.onSetAsDefaultCalendar = async () => {
			if (await donationClicked("defaultCalendar")) {
				await storage.set("defaultCalendarId", eventEntry.calendarId);

				let calendar = getCalendarById(eventEntry.calendarId);
				let calendarName = getCalendarName(calendar);

				setStatusMessage({message: getMessage("defaultCalendar") + ": " + calendarName});
			}
		}
	}
	
	setStatusMessage(statusMessageParams);
}

function maybePerformUnlock(processor, callback) {
	callback();
}

function cleanICal(str) {
	if (str) {
		return str.replace(/\\/g, "");
	}
}

function initReminderLine($createEventDialog, $calendarReminder, allDay) {
	const $eventReminders = $createEventDialog.querySelector("event-reminders").shadowRoot;

	const $reminderMinutes = $calendarReminder.querySelector(".reminderMinutes");
	const $reminderValuePerPeriod = $calendarReminder.querySelector(".reminderValuePerPeriod");
	const $reminderPeriod = $calendarReminder.querySelector(".reminderPeriod");

	initReminderPeriod($reminderValuePerPeriod, $reminderPeriod, $reminderMinutes, allDay);
	
    onClickReplace($calendarReminder.querySelectorAll("paper-item"), function() {
		updateReminderMinutes($reminderPeriod, $reminderMinutes, $reminderValuePerPeriod);
		$createEventDialog._remindersChanged = true;
	});
	
	replaceEventListeners($calendarReminder.querySelectorAll("paper-input"), "change", function() {
		updateReminderMinutes($reminderPeriod, $reminderMinutes, $reminderValuePerPeriod);
		$createEventDialog._remindersChanged = true;
	});
	
    onClickReplace($calendarReminder.querySelector(".deleteReminder"), function() {
        const index = getNodeIndex($calendarReminder, $eventReminders.querySelectorAll(".calendarReminder"))
		// patch using .splice would corectly remove right item in the polymer object but was visually removing the last node, so must call initAllReminders
		$createEventDialog.querySelector("event-reminders").splice("reminders", index, 1);
		initAllReminders($createEventDialog, allDay).then(() => {
			$createEventDialog._remindersChanged = true;
		});
	});
}

function initAllReminders($createEventDialog, allDay) {
	return new Promise((resolve, reject) => {
		setTimeout(function () {

			const $eventReminders = $createEventDialog.querySelector("event-reminders").shadowRoot;

			$createEventDialog._remindersChanged = false;
			$eventReminders.querySelectorAll(".calendarReminder").forEach($calendarReminder => {
				initReminderLine($createEventDialog, $calendarReminder, allDay);
			});

            onClickReplace($eventReminders.querySelector("#addReminder"), function () {
				var reminder;
				if (allDay) {
					reminder = { method: "popup", minutes: 1440 }; // 1 day
				} else {
					reminder = { method: "popup", minutes: 10 };
				}

				$createEventDialog.querySelector("event-reminders").push("reminders", reminder);
				$createEventDialog._remindersChanged = true;

				setTimeout(() => {
					initReminderLine($createEventDialog, lastNode($eventReminders.querySelectorAll(".calendarReminder")), allDay);
					$createEventDialog.querySelector("paper-dialog-scrollable").scrollTarget.scrollTop = 99999;
				}, 1)
			});

			resolve();
		}, 1);
	});
}

// created patch method to "change" reminders to maintain polymer array binding
function changeReminders(allDay, $createEventDialog, allDayReminders, timedReminders) {
    const $eventReminders = $createEventDialog.querySelector("event-reminders");
	if (allDay) {
		$eventReminders.splice("reminders", 0, 99);
		allDayReminders.forEach(reminder => {
			$eventReminders.push("reminders", reminder);
		});
		initAllReminders($createEventDialog, true);
		$createEventDialog._allDay = true;
	} else {
		$eventReminders.splice("reminders", 0, 99);
		timedReminders.forEach(reminder => {
			$eventReminders.push("reminders", reminder);
		});
		initAllReminders($createEventDialog, false);
		$createEventDialog._allDay = false;
	}
}

function initColorChoice($content, colorId, color) {
	const $color = document.createElement("div");
    $color.classList.add("colorChoice");
    $color.style.background = color;
    $color._colorId = colorId;
    onClick($color, function() {
        const $eventColor = byId("eventColor");
        if ($eventColor) {
            $eventColor.style.background = color;
            $eventColor._colorId = colorId;
        }
		byId("eventColorsDialog")?.close();
	});

    const $ripple = document.createElement("paper-ripple");
    $ripple.setAttribute("center", "");
    $ripple.style.color = "white";

    $color.append($ripple);
	$content.append($color);
}

function showEventColors(colors, calendar) {
	const $content = document.createElement("div");
	
	const bgColor = colors.calendar[calendar.colorId].background;
	initColorChoice($content, null, bgColor);
	
    const $color = document.createElement("div");
    $color.style.cssText = "background:#aaa;width:1px;height:16px;display:inline-block;margin-right:7px";
	$content.append($color);
	
	for (let a in colors.event) {
		initColorChoice($content, a, colors.event[a].background);
	}
	
	const $dialog = initTemplate("eventColorsDialogTemplate");
	$dialog.querySelector("h2").textContent = getMessage("eventColor");
    emptyAppend($dialog.querySelector(".dialogDescription"), $content);
	
	openDialog($dialog).then(response => {
		$dialog.close();
	});
	
	return $dialog;
}

function doesEventTitleHaveTime() {
	if (byId("detectTime").checked) {
		const text = byId("eventTitle").value;
		return text?.match(/\b\d/);
	}
}

function sortReminders(reminders) {
	reminders.sort(function(a, b) {
		if (parseInt(a.minutes) < parseInt(b.minutes)) {
			return -1;
		} else {
			return +1;
		}
	});
}

function isEventTimeSlotted(event) {
    const currentView = fullCalendar?.view.type;
	return !event.allDay && (currentView == getFCViewName(CalendarView.WEEK) || currentView == getFCViewName(CalendarView.DAY));
}

function showExtraFeaturesDialog() {
	return openGenericDialog({
		title: getMessage("extraFeatures"),
		content: "Creating events by clicking in the calendar is an extra feature.<br>Use the big red button instead to add events if you don't want to contribute.",
		otherLabel: getMessage("extraFeatures")
	}).then(response => {
		if (response == "other") {
			openUrl("contribute.html?action=createEvent");
		}
	});
}

function resetInviteGuestsDialog() {
    const $inviteGuestsDialog = byId("inviteGuestsDialog");
    if ($inviteGuestsDialog) {
        $inviteGuestsDialog._guestsLoaded = false;
    }
    removeAllNodes("#inviteGuestsDialog .chip");
}

async function grantContactPermission(event) {
    const tokenResponses = await storage.getEncryptedObj("tokenResponses", dateReviver);
    const tokenResponse = tokenResponses[0];
    if (tokenResponse.chromeProfile) {
        requestPermission({ email: tokenResponse.userEmail, initOAuthContacts:true }).then(() => {
            hideLoading();
            showInviteGuestsDialog(event);
        }).catch(error => {
            showError(error);
        });
    } else {
        requestPermission({ email: tokenResponse.userEmail, initOAuthContacts:true, useGoogleAccountsSignIn: true });
    }
}

async function showCreateBubble(params) {
	console.time("create");
    console.log("showCreateBubble", params);
    
    function autoSave() {
        const eventEntry = initEventEntry();
        if (eventEntry.summary || eventEntry.description) {
            //console.log("autosave set: " + new Date(), params);
            storage.set("autoSave", {
                autoRestore: true,
                event: eventEntry,
                editing: params.editing
            });
        }
    }

    clearInterval(autoSaveInterval);
    autoSaveInterval = setInterval(() => {
        if (isVisible("#createEventDialog")) {
            autoSave();
        } else {
            clearInterval(autoSaveInterval);
        }
    }, seconds(3));

    // reset guests dialog
    resetInviteGuestsDialog();

	var reminders;
	var event = params.event;

	var allDayReminders = [{
        method: "popup",
        minutes: 0
    }];

	var timedReminders = [];

	const $createEventDialog = initTemplate("createEventDialogTemplate");
	$createEventDialog._event = event;

	if (params.editing) {
		let calendar = getEventCalendar(event);
		if (calendar) {
			timedReminders = deepClone(calendar.defaultReminders);
		}
		byId("saveEvent").classList.remove("extraFeature");
	} else {
        const arrayOfCalendars = await getArrayOfCalendars();
		let calendar = getPrimaryCalendar(arrayOfCalendars)
		if (calendar) {
			timedReminders = deepClone(calendar.defaultReminders); // used to be writeableCalendars.first()
		}
		if (!await storage.get("donationClicked")) {
			byId("saveEvent").classList.add("extraFeature");
		}
	}

	function initAllDay(allDay) {
		if (allDay) {
			hide("#eventStartTime");
			hide("#eventEndTime");
		} else {
			show("#eventStartTime");
			show("#eventEndTime");
		}
	}
	
	function initEndTime(deltaMinutes) {
        const start = eventStartTimePicker.dateTime;
        
        const endTime = start.addMinutes(deltaMinutes);
        eventEndTimePicker.dateTime = endTime;
        
        // if duration times goes over the midnight then +1 to the end date
        if (!start.isSameDay(endTime)) {
            console.log("duration over midnight! add a day")
            eventEndDatePicker.dateTime = eventEndDatePicker.dateTime.addDays(1);
        }
	}
	
	function initEventRemindersNode() {
		if (params.editing) {
			if (!event.reminders || event.reminders.useDefault) {
				if (event.allDay) {
					reminders = deepClone(allDayReminders);
				} else {
					reminders = deepClone(timedReminders);
				}
			} else {
				reminders = event.reminders.overrides;
			}
		} else {
			if (event.allDay) {
				reminders = deepClone(allDayReminders);
			} else {
				reminders = deepClone(timedReminders);
			}
		}
		
		if (!reminders) {
			reminders = [];
		}
		
		sortReminders(reminders);
		
		$createEventDialog.querySelector("event-reminders").reminders = reminders;
	}

	// need to re-initialize Date object here because .format was not found
	event.startTime = new Date(event.startTime);

	let selectedCalendarId;

    if (params.autoRestore || !params.copying) {
        selectedCalendarId = getEventCalendarId(event);
    }
    await initCalendarDropDown("createEventCalendarTemplate", {selectedCalendarId: selectedCalendarId});

    async function initTaskLists(event) {
        const taskLists = cachedFeeds["taskLists"];
        let taskListToSelect = getTaskList(event);
        if (!taskListToSelect) {
            taskListToSelect = taskLists.items.first();
        }

        // template will only exist the first time because i overwrite it with the dom once initiated
        const taskListTemplateId = "createEventTaskListTemplate";
        const $template = byId(taskListTemplateId);
        if ($template) {
            listbox = $template.content.querySelector("paper-listbox");
            
            taskLists.items.forEach(taskList => {
                const paperItem = document.createElement("paper-item");
                const textNode = document.createTextNode(taskList.title);
                paperItem.appendChild(textNode);
                paperItem.setAttribute("value", taskList.id);
                listbox.appendChild(paperItem);
            });
    
            listbox.setAttribute("selected", taskListToSelect.id);
            
            const node = document.importNode($template.content, true);
            $template.replaceWith(node);
            // need to wait for dropdown to be inserted into DOM
            await sleep(1);
        } else {
            const divId = taskListTemplateId.replace("Template", "");
            const $div = byId(divId);
            const $listbox = $div.querySelector("paper-listbox");
            if ($listbox) {
                $listbox.selected = taskListToSelect.id;
            } else {
                throw new Error("initCalendarDropDown error: " + divId);
            }
        }
    }

    byId("createEventCalendar").setAttribute("label", getMessage("calendar"));
	onClickReplace("#createEventCalendar paper-item", function() {
        if (event.kind != TASKS_KIND) {
		    initEventColor(event);
        }
		
		// init reminders
		var allDay;
		if (params.editing) {
			allDay = byId("eventAllDay").checked;
		} else {
			if (isEventTimeSlotted(event)) {
				allDay = false;
			} else {
				allDay = !doesEventTitleHaveTime();
			} 
		}
		
		var calendarId = selector("#createEventCalendar paper-listbox").selected;
		var calendar = getCalendarById(calendarId);
		
        allDayReminders = [{
            method: "popup",
            minutes:0
        }];

		if (calendar.defaultReminders) {
			timedReminders = deepClone(calendar.defaultReminders);
		}
		
		console.log("timedReminders", timedReminders);
		
		sortReminders(timedReminders);
		
		initEventRemindersNode();
		
		changeReminders(allDay, $createEventDialog, allDayReminders, timedReminders);
	});
	
	$createEventDialog._allDay = event.allDay;

	let eventEndTime = event.endTime;
	if (!eventEndTime) {
		eventEndTime = new Date(event.startTime);
		if (event.allDay) {
            eventEndTime.setDate(event.startTime.getDate() + 1);
		} else {
			eventEndTime.setMinutes(eventEndTime.getMinutes() + await getDefaultEventLength());
		}
	}

	var deltaDays = Math.round(eventEndTime.diffInDays(event.startTime));
    var deltaMinutes = eventEndTime.diffInMinutes(event.startTime);
	if (deltaMinutes >= 60 * 24) { // if 1+ days then just use default length
        deltaMinutes = await getDefaultEventLength();
    }

    globalThis.eventStartDatePicker = new DatePicker(byId("eventStartDate"), {
        fullCalendarParams: await generateFullCalendarParams(),
        changeDate: function() {
            console.log("changedate", deltaDays, event, this.dateTime);
            const start = this.dateTime;
            const end = eventEndDatePicker.dateTime;
    
            // google calendar all day events actually end the next day, so for displaying purposes we display the day before
            const date = start.addDays(deltaDays);
            if (byId("eventAllDay")._originalAllDayFlag || byId("eventAllDay").checked) {
                date.setDate(date.getDate() - 1);
            }
            eventEndDatePicker.dateTime = date;
        }
    });
    eventStartDatePicker.dateTime = event.startTime;


	// must re-init (because we could have created dialog twice by clicking several events in the same popup window session and compounding datepicker calls)
	//$("#eventStartDate").datepicker("destroy");
	//$("#eventStartDate").datepicker(datePickerStartParams);
	//$("#eventStartDate").datepicker("setDate", event.startTime);

    globalThis.eventStartTimePicker = new TimePicker(byId("eventStartTime"), {
        changeTime: function() {
            console.log("changetime")
            if (!globalThis._changedEndTime && this.dateTime) {
                initEndTime(deltaMinutes);
            }
        }
    });
    if (event.allDay) {
        eventStartTimePicker.dateTime = getNearestHalfHour();
    } else {
        eventStartTimePicker.dateTime = event.startTime;
    }

    globalThis.eventEndDatePicker = new DatePicker(byId("eventEndDate"), {
        fullCalendarParams: await generateFullCalendarParams(),
        changeDate: () => {
            // assume user chose a different day then the start day and thus this will cancel durations and dropdown start time will reset to 12:00
            eventEndTimePicker.startTimePicker = null;
        }
    });

    let newEndDate;
	if (event.allDay) {
		// google calendar all day events actually end the next day, so for displaying purposes we display the day before
		const date = new Date(eventEndTime);
        date.setDate(date.getDate() - 1);
        newEndDate = date;
	} else {
        newEndDate = eventEndTime;
    }
    eventEndDatePicker.dateTime = newEndDate;
    eventEndDatePicker._originalDate = newEndDate;

    globalThis._changedEndTime = false;
    const endTimePickerParams = {
        changeTime: function() {
            console.log("changetime end");
            globalThis._changedEndTime = true;
        }
    };
    // only show durations if start and end day are same day
    if (!event.endTime || event.startTime.isSameDay(event.endTime)) {
        endTimePickerParams.startTimePicker = eventStartTimePicker;
    }

    globalThis.eventEndTimePicker = new TimePicker(byId("eventEndTime"), endTimePickerParams);

	if (event.allDay) {
		initEndTime(0);
	} else {
        eventEndTimePicker.dateTime = eventEndTime;
	}

	byId("eventAllDay").checked = event.allDay;
	initAllDay(event.allDay);

    byId("eventAllDay")._originalAllDayFlag = event.allDay;

    addEventListeners("#eventAllDay", "change", function () {
        if (params.editing) {
            const originalDate = eventEndDatePicker._originalDate;
            eventEndDatePicker.dateTime = originalDate;
        }

        event.allDay = byId("eventAllDay").checked;
        if (event.allDay) {
            initEndTime(0);
        } else {
            console.log("deltaminutes", deltaMinutes);
            initEndTime(deltaMinutes);
        }
		initAllDay(event.allDay);
		changeReminders(event.allDay, $createEventDialog, allDayReminders, timedReminders);
	});

	function initDetectTimeAndReminders(showDetectTime, skipReminders, skipRecurringInit) {
        let recurrenceDropdownValue;

        const $clickedEventDialog = byId("clickedEventDialog");
        
        if ($clickedEventDialog) {
            if (params.editing) {
                recurrenceDropdownValue = $clickedEventDialog._recurrenceDropdownValue;
            } else {
                $clickedEventDialog._recurrenceDropdownValue = "";
            }
        }

        if (!recurrenceDropdownValue) {
            recurrenceDropdownValue = "";
        }
        
        const $repeatDropdown = byId("repeat-dropdown-wrapper");
        const $other = $repeatDropdown.querySelector("paper-item[value='other']");
        if (recurrenceDropdownValue == "other") {
            show($other);
        } else {
            hide($other);
        }

        if (!skipRecurringInit) {
            console.log("recurrenceDropdownValue", recurrenceDropdownValue)
            $repeatDropdown.querySelector("paper-listbox").selected = recurrenceDropdownValue;
        }

		if (showDetectTime) {
            selector("#detectTimeWrapper .repeat-placeholder").append($repeatDropdown);

			hide("#eventStartEndTimeWrapper");
			show("#detectTimeWrapper");
			if (!skipReminders && $createEventDialog._allDay) {
				changeReminders(false, $createEventDialog, allDayReminders, timedReminders);
			}
		} else {
            selector("#eventStartEndTimeWrapper .repeat-placeholder").append($repeatDropdown);

			show("#eventStartEndTimeWrapper");
			hide("#detectTimeWrapper");
			if (!skipReminders && !$createEventDialog._allDay) {
				changeReminders(true, $createEventDialog, allDayReminders, timedReminders);
			}
		}
	}

	// remember this because we can't detect time using quickadd when spanning multiple days
    const spansMultipeDays = event.allDay && event.startTime && event.endTime && !event.startTime.isSameDay(event.endTime);
    const detectTime = await storage.get("detectTime") && !params.autoRestore;

	if (params.editing) {
		initDetectTimeAndReminders(false, true);
	} else {
		const detectTimeFlag = detectTime && !spansMultipeDays && !isEventTimeSlotted(event);
        initDetectTimeAndReminders(detectTimeFlag, true);

		// default to checked
		byId("detectTime").checked = true;
        addEventListeners("#detectTime", "change", function (e) {
			if (!this.checked) {
				byId("eventTitle").setAttribute("placeholder", getMessage("quickAddDefaultTextMultipleDays"));
				initDetectTimeAndReminders(false);
				byId("eventTitle").focus();
			}
		});
	}
	
	console.timeEnd("create")
	
    // must use keypress to detect enter (not keyup because ime japanense issue: https://jasonsavard.com/forum/discussion/comment/8236#Comment_8236)
    // v2 hopefully resolved by checking isComposing
    replaceEventListeners($createEventDialog.querySelector("#eventTitle"), "keyup", function(e) { // use keyup to detect backspace/cleared text
        if (e.key === "Escape") {
            $createEventDialog.close();
        } else {
            // check that we are not in weekview ie. must be a allDay event
            if (event.allDay && this.id == "eventTitle") {
                if (detectTime && !spansMultipeDays && doesEventTitleHaveTime()) {
                    initDetectTimeAndReminders(true, false, true);
                } else {
                    initDetectTimeAndReminders(false, false, true);
                }
            }
        }
    });

    replaceEventListeners($createEventDialog.querySelector("#eventTitle"), "keydown", function(e) { // use keyup to detect backspace/cleared text
        console.log("keydown", e);
        if (e.key === "Enter" && !e.isComposing) {
            $createEventDialog.querySelector("paper-button[dialog-confirm]").click();
            // patch: seems when select time slots in weekview and pressing enter, that the dialog would not close
            $createEventDialog.close();
        }
    });
	
    replaceEventListeners($createEventDialog, "iron-overlay-opened", function() {
		// patch: seems iron-overlay-opened was also being called after selecting a drop dron in the dialog (ie. the notifications)
		console.log("iron-overlay-opened");
		if (window.eventDialogStatus != "opened") {

            if (event.kind != TASKS_KIND) {
                initEventColor(event);
            }

			$createEventDialog.querySelector("#eventTitle").focus();
			window.eventDialogStatus = "opened";
		}
	});

    replaceEventListeners($createEventDialog, "iron-overlay-closed", function(e) {
		console.log("iron-overlay-closed", e.detail);
		// patch: refer to iron-overly-opened
		// detect that we really closed the overlay: canceled = false
		if (!e.detail.canceled) {
			window.eventDialogStatus = "closed";
        }
        storage.remove("autoSave");
	});

	function initEventEntry() {
		let eventEntry;

		if (isVisible("#detectTime") && doesEventTitleHaveTime()) {
			eventEntry = new EventEntry();
			eventEntry.startTime = event.startTime;
		} else {
            eventEntry = deepClone(event);
			eventEntry.allDay = byId("eventAllDay").checked;
			eventEntry.startTime = eventStartDatePicker.dateTime;
            if (!byId("createEventDialog").classList.contains("task-selected")) {
                eventEntry.endTime = eventEndDatePicker.dateTime;

                // google calendar all day events actually end the next day, so for displaying purposes we display the day before - now we must submit as next day
                if (byId("eventAllDay").checked) {
                    eventEntry.endTime.setDate(eventEntry.endTime.getDate() + 1);
                }
            }

			function mergeTime(date, time) {
                date.setHours(time.getHours());
                date.setMinutes(time.getMinutes());
                date.setSeconds(time.getSeconds());
                date.setMilliseconds(time.getMilliseconds());
			}
			// since timepicker always returns current date we must instead use the date from the date picked and merge the time from the time picked
            const startTime = eventStartTimePicker.dateTime;
            if (startTime) {
                mergeTime(eventEntry.startTime, startTime);
            }

            if (!byId("createEventDialog").classList.contains("task-selected")) {
                const endTime = eventEndTimePicker.dateTime;
                if (endTime) {
                    mergeTime(eventEntry.endTime, endTime);
                }
            }
        }
        
        eventEntry.summary = byId("eventTitle").value;

        const originalDescHtml = byId("eventDescription").innerHTML; //.replace(/<div>/gi,'<br>').replace(/<\/div>/gi,'')
        const descriptionWithNewLines = originalDescHtml.replace(/<br\s*[\/]?>/gi, "\n"); // replace BRs with newline
        if (hasHtml(descriptionWithNewLines)) { // if there is still html code than revert to original html with BRs
            eventEntry.description = originalDescHtml;
        } else {
            eventEntry.description = descriptionWithNewLines
        }
        
        if (byId("createEventDialog").classList.contains("task-selected")) {
            eventEntry.kind = TASKS_KIND;
            eventEntry.calendarId = TASKS_CALENDAR_OBJECT.id;
            eventEntry.taskListId = getDropDownValue(byId("createEventTaskList"));
        } else {
            eventEntry.calendarId = getDropDownValue(byId("createEventCalendar"));
        }
        
        const conferenceData = byId("eventConference")._conferenceData;
        if (conferenceData === null || conferenceData) {
            eventEntry.conferenceData = conferenceData;
        }

		eventEntry.location = byId("eventLocation").value;
        eventEntry.colorId = byId("eventColor")._colorId;

        const previousRecurrenceDropdownValue = byId("clickedEventDialog")?._recurrenceDropdownValue ?? "";
        const newRecurrenceDropdownValue = selector("#repeat-dropdown-wrapper paper-listbox").selected;

        if (previousRecurrenceDropdownValue != newRecurrenceDropdownValue) {
            if (newRecurrenceDropdownValue == "") {
                eventEntry.recurrence = [];
            } else if (newRecurrenceDropdownValue == "daily") {
                eventEntry.recurrence = ["RRULE:FREQ=DAILY"];
            } else if (newRecurrenceDropdownValue == "weekly") {
                eventEntry.recurrence = ["RRULE:FREQ=WEEKLY"];
            } else if (newRecurrenceDropdownValue == "monthly") {
                eventEntry.recurrence = ["RRULE:FREQ=MONTHLY"];
            } else if (newRecurrenceDropdownValue == "yearly") {
                eventEntry.recurrence = ["RRULE:FREQ=YEARLY"];
            } else if (newRecurrenceDropdownValue == "other") {
                // nothing
            }
        }

		return eventEntry;
	}
	
    onClickReplace($createEventDialog.querySelector("#saveEvent"), async () => {
		$createEventDialog.close();

        let eventEntry = initEventEntry();

        if (byId("createEventDialog").classList.contains("task-selected")) {
            if (params.editing) {
                showSaving();

                const updateEventParams = {
                    eventEntry: eventEntry,
                    event: event
                };

                try {

                    const taskList = getTaskList(eventEntry);

                    // Changing task list: since API doesn't support this action, we must delete and recreate it.
                    if (taskList.id != eventEntry.taskListId) {
                        await deleteEvent(eventEntry);
                        fullCalendar.getEventById(eventEntry.id).remove();
                        insertAndLoadInCalendar(eventEntry).catch(error => {
                            // do nothing already caught inside
                        });
                    } else {
                        const response = await updateEvent(updateEventParams);
                        if (!response.cancel) {
                            fullCalendar?.refetchEvents();
    
                            setStatusMessage({ message: getMessage("eventUpdated") });
        
                            // then must pass bypassCache or else we would override the updated event seconds later
                            // seems we need this line if we move and event and then edit it - or else the display is not refreshed in the betacalendar??
                            const reloadParams = {
                                source: "editEvent",
                                bypassCache: true,
                                refetchEvents: true,
                            }
        
                            reloadParams.skipSync = true;
        
                            await reloadCalendar(reloadParams);
                        }
                    }
                } catch (error) {
                    showCalendarError(error);
                } finally {
                    hideSaving();
                }
            } else {
                insertAndLoadInCalendar(eventEntry).catch(error => {
                    // do nothing already caught inside
                });
            }
        } else {
            const source = $createEventDialog._source;
            if (source) {
                eventEntry.source = source;
            }
    
            if ($createEventDialog._remindersChanged) {
                const reminders = $createEventDialog.querySelector("event-reminders").reminders;
                console.log("reminder: ", reminders);
                eventEntry.reminders = { useDefault: false, overrides: reminders };
            }
    
            if (byId("currentPage")._currentPageClicked) {
                const favIconUrl = byId("currentPage").getAttribute("src");
                if (favIconUrl) {
                    eventEntry.extendedProperties = {};
                    eventEntry.extendedProperties.private = { favIconUrl: favIconUrl };
                }
            }
    
            // guests
            const $inviteGuestsChips = selectorAll("#inviteGuestsDialog .chip");
            if ($inviteGuestsChips.length) {
                eventEntry.attendees = [];
                $inviteGuestsChips.forEach($chip => {
                    let attendeeChipData = $chip._attendee;
                    let attendee;
                    if (attendeeChipData) { // directly from google event data
                        attendee = attendeeChipData;
                    } else { // from contacts data object
                        attendeeChipData = $chip._data;
                        attendee = {
                            displayName: attendeeChipData.name,
                            email: attendeeChipData.email
                        }
                        if (attendeeChipData.organizer != undefined) {
                            attendee.organizer = attendeeChipData.organizer;
                        }
                        if (attendeeChipData.responseStatus != undefined) {
                            attendee.responseStatus = attendeeChipData.responseStatus;
                        }
                    }
                    eventEntry.attendees.push(attendee);
                });
            }
    
            console.log("evententry", eventEntry);
    
            const editing = params.editing && !params.copying;
            // passing eventEntry instead because want to detect attendee
            const sendNotificationsResponse = await ensureSendNotificationDialog({ event: eventEntry, action: editing ? SendNotificationsAction.EDIT : SendNotificationsAction.CREATE });
            if (!sendNotificationsResponse.cancel) {
                if (editing) {
                    showSaving();
    
                    let timeChanged = true;
    
                    if (byId("eventAllDay")._originalAllDayFlag == eventEntry.allDay) {
                        if (eventEntry.allDay) {
                            if (event.startTime.isSameDay(eventEntry.startTime) && event.endTime.isSameDay(eventEntry.endTime)) {
                                timeChanged = false;
                            }
                        } else {
                            if (event.startTime.isEqual(eventEntry.startTime) && event.endTime.isEqual(eventEntry.endTime)) {
                                timeChanged = false;
                            }
                        }
                    }
    
                    const updateEventParams = {
                        eventEntry: eventEntry,
                        event: event
                    };
    
                    // patch #1 to avoid deleting recurring events when specifying a start date, do not set dates and only PATCH other details
                    if (event.recurringEventId && !timeChanged) {
                        console.log("patch update for recurring events");
                        const patchFields = deepClone(eventEntry);
                        delete patchFields.start;
                        delete patchFields.end;
                        delete patchFields.recurringEventId;
                        delete patchFields.etag;
                        delete patchFields.originalStartTime;
        
                        updateEventParams.patchFields = patchFields;
                    }
    
                    updateEventParams.eventEntry.sendNotifications = sendNotificationsResponse.sendNotifications;
                    try {
                        const response = await updateEvent(updateEventParams);
                        if (!response.cancel) {
                            fullCalendar?.refetchEvents();
    
                            setStatusMessage({ message: getMessage("eventUpdated") });
        
                            // then must pass bypassCache or else we would override the updated event seconds later
                            // seems we need this line if we move and event and then edit it - or else the display is not refreshed in the betacalendar??
                            const reloadParams = {
                                source: "editEvent",
                                bypassCache: true,
                                refetchEvents: true,
                            }
        
                            // seems when modifying a recurring event to non-recurring that it would not refresh, possibly because the event id goes from id_instance to just id
                            if (eventEntry.recurrence?.length == 0) {
                                reloadParams.skipSync = true;
                            }
        
                            await reloadCalendar(reloadParams);
                        }
                    } catch (error) {
                        showCalendarError(error);
                    } finally {
                        hideSaving();
                    }
                } else {
                    eventEntry.sendNotifications = sendNotificationsResponse.sendNotifications;
    
                    insertAndLoadInCalendar(eventEntry).catch(error => {
                        // do nothing already caught inside
                    });
    
                    if (!await storage.get("donationClicked")) {
                        setTimeout(() => {
                            showExtraFeaturesDialog();
                        }, 2200);
                    }
                    storage.setDate("_createEventTested");
                }
            }
        }
	});

    onClickReplace($createEventDialog.querySelector("#openEventInCalendar"), async () => {
		const eventEntry = initEventEntry();

		if (params.editing) {
			openUrl(getEventUrl(event));
		} else {
            // user has NOT "selected" the time in the calendar - so parse the time from string
			if (isVisible("#detectTime") && doesEventTitleHaveTime()) {
                try {
                    const response = await googleCalendarParseString({
                        text: byId("eventTitle").value,
                        startTime: event.startTime,
                        endTime: event.endTime
                    });
                    eventEntry.summary = response.summary;
                    eventEntry.allDay = response.allDay;
                    if (response.startTime) {
                        eventEntry.startTime = response.startTime;
                        eventEntry.endTime = response.endTime;
                    }
                } catch (error) {
                    console.warn("googleCalendarParseString: " + error);
                    eventEntry.allDay = true;
                    eventEntry.startTime = event.startTime;
                }
			}
            openGoogleCalendarEventPage(eventEntry);
		}
	});

    onClickReplace($createEventDialog.querySelector("#inviteGuests"), async () => {
		const event = $createEventDialog._event;

        await cacheContactsData();
		if (contactsData && contactsTokenResponse) {
            showInviteGuestsDialog(event);
		} else {
            grantContactPermission(event);
		}
	});

    onClickReplace($createEventDialog.querySelector("#cancelEvent"), () => {
		$createEventDialog.close();
	});

    openDialog($createEventDialog);
    
    if (!params.editing && !await storage.get("donationClicked") && await storage.get("_createEventTested")) {
        showExtraFeaturesDialog().then(() => {
            $createEventDialog.close();
        });
    }
	
	initEventRemindersNode();
	initAllReminders($createEventDialog, event.allDay);
	
    $createEventDialog.querySelector("#eventTitle").value = event.summary;

    const selectedCalendars = await storage.get("selectedCalendars");
    const tasksSelected = isCalendarSelectedInExtension(TASKS_CALENDAR_OBJECT, email, selectedCalendars);
    
    if (tasksSelected && !params.editing) {
        show("#event-task-selection");
    } else {
        hide("#event-task-selection");
    }

    function selectEvent() {
        byId("createEventDialog").classList.remove("task-selected");
        byId("task-selection").removeAttribute("active");
        byId("event-selection").setAttribute("active", "");
    }

    function selectTask() {
        byId("createEventDialog").classList.add("task-selected");
        byId("event-selection").removeAttribute("active");
        byId("task-selection").setAttribute("active", true);
        byId("detectTime").checked = false;
        initDetectTimeAndReminders(false, true, true);
        initTaskLists(event);
    }

    if (event.kind == TASKS_KIND) {
        selectTask();
    } else {
        selectEvent();
    }

    onClickReplace("#event-selection", function() {
        selectEvent();
    });

    onClickReplace("#task-selection", function() {
        selectTask();
        byId("eventTitle").focus();
    });
    
    if (event.conferenceData?.conferenceSolution) {
        byId("event-conference-icon").removeAttribute("icon");
        byId("event-conference-icon").setAttribute("src", event.conferenceData.conferenceSolution.iconUri);

        const video = event.conferenceData.entryPoints.find(entryPoint => entryPoint.entryPointType == "video");
        const phone = event.conferenceData.entryPoints.find(entryPoint => entryPoint.entryPointType == "phone");
        const more = event.conferenceData.entryPoints.find(entryPoint => entryPoint.entryPointType == "more");

        if (video) {
            show("#eventConferenceWrapper");
            byId("eventConference").textContent = getMessage("joinWithX", event.conferenceData.conferenceSolution.name);
            byId("eventVideoLabel").textContent = video.label;

            onClickReplace(".copy-conference-link", () => {
                navigator.clipboard.writeText(video.uri);
                showMessage(getMessage("copiedToClipboard"));
            });
        } else {
            hide("#eventConferenceWrapper");
        }
    } else {
        hide("#eventVideoLabelWrapper");
    }

    $createEventDialog.querySelector("#eventLocation").value = event.location;
    let htmlDescription;
    if (event.description) {
        htmlDescription = prepareForContentEditable(event.description);
    } else {
        htmlDescription = "";
    }
    $createEventDialog.querySelector("#eventDescription").innerHTML = htmlDescription;

	function initEventColor(event) {
        const $eventColor = $createEventDialog.querySelector("#eventColor");
		if (params.editing && event.colorId) {
			var color = colors.event[event.colorId].background;
			$eventColor.style.background = color;
            $eventColor._colorId = event.colorId;
		} else {
			const calendar = getSelectedCalendar( byId("createEventCalendar") );
            const calendarColorObj = colors.calendar[calendar.colorId];
            if (calendarColorObj) {
                $eventColor.style.background = calendarColorObj.background;
                $eventColor._colorId = null;
            }
		}
	}

	const tab = await getActiveTab();

    const $currentPage = byId("currentPage");
    if (tab?.favIconUrl) {
        onClickReplace($currentPage, () => {
            // disable action
        });
        $currentPage.setAttribute("src", tab.favIconUrl);
    } else {
        $currentPage.setAttribute("icon", "link");
    }
    
    if (tab) {
        onClickReplace($currentPage, async () => {
            $currentPage._currentPageClicked = true;
            const response = await getEventDetailsFromPage(tab);
            byId("eventTitle").value ||= response.title;
            descriptionFromPage = response.description;
            const url = response.url ?? tab.url;
            byId("eventLocation").value = url;
            if (url != response.description) {
                byId("eventDescription").innerHTML = response.description;
            }
            $createEventDialog._source = {
                title: response.title,
                url: url
            };
        });
    }

	var placeHolder;
	if (event.endTime) {
		if (event.allDay) {
			placeHolder = getMessage("quickAddDefaultTextMultipleDays");
		} else {
			placeHolder = getMessage("quickAddDefaultTextMultipleHours");
		}
	} else {
		placeHolder = getMessage("quickAddDefaultText");
	}
	byId("eventTitle").setAttribute("placeholder", placeHolder);
	
    onClickReplace("#eventColor", function() {
		const calendar = getSelectedCalendar( byId("createEventCalendar") );
		showEventColors(colors, calendar);
    });

    function initConferenceDisplay(enabled, allowedConferenceType) {
        const $eventConference = byId("eventConference");

        if (enabled) {
            if (event.conferenceData) {
                // already created
                $eventConference._conferenceData = event.conferenceData;
                $eventConference.removeAttribute("disabled")
                $eventConference.setAttribute("raised", "");
                $eventConference.textContent = getMessage("joinWithX", event.conferenceData.conferenceSolution.name);

                const video = event.conferenceData.entryPoints.find(entryPoint => entryPoint.entryPointType == "video");
                show(".copy-conference-link");
                show("#eventVideoLabelWrapper");
                byId("eventVideoLabel").textContent = video.label;
            } else { // newly created
                $eventConference._conferenceData = {
                        createRequest: {
                            requestId: getUniqueId()
                        },
                        conferenceSolutionKey: {
                            type: allowedConferenceType
                        }
                    };
                $eventConference.setAttribute("disabled", "");
                $eventConference.removeAttribute("raised");
                $eventConference.textContent = getMessage("videoConferencingAdded");
                show(".copy-conference-link");
                hide("#eventVideoLabelWrapper");
            }
            
            show(".eventConferenceRemove");
        } else {
            $eventConference._conferenceData = null;
            $eventConference.removeAttribute("disabled");
            $eventConference.setAttribute("raised", "");
            $eventConference.textContent = getMessage("addVideoConferencing");
            hide(".copy-conference-link");
            hide(".eventConferenceRemove");
            hide("#eventVideoLabelWrapper");
        }
    }

    const calendar = getSelectedCalendar( byId("createEventCalendar") );
    const allowedConferenceType = calendar?.conferenceProperties?.allowedConferenceSolutionTypes?.[0];

    initConferenceDisplay(event.conferenceData?.conferenceSolution, allowedConferenceType);

    if (allowedConferenceType) {
        onClickReplace("#eventConference", function() {
            initConferenceDisplay(true, allowedConferenceType);
        });

        onClickReplace(".eventConferenceRemove", function() {
            initConferenceDisplay(false, allowedConferenceType);
        });

        show("#eventConferenceWrapper");
    } else {
        hide("#eventConferenceWrapper");
    }

    replaceEventListeners("#eventLocation", "focus", function() {
		console.log("focus location")
		if (!window.initWhereAutocomplete) {
			window.initWhereAutocomplete = function() {
				console.log("initWhereAutocomplete");
				autocomplete = new google.maps.places.Autocomplete((byId("eventLocation").inputElement.inputElement));
				
				// patch to activate autocomplete when focused is on input before loading code above.
				byId("eventLocation").focus();
				setTimeout(() => {
					byId("eventLocation").inputElement.inputElement.focus();
				}, 50);
				
			    // When the user selects an address from the dropdown, populate the address, fields in the form.
			    autocomplete.addListener('place_changed', function() {
					console.log("place_changed");
			    	// copy the native value to the paper-input value
					byId("eventLocation").value = byId("eventLocation").inputElement.inputElement.value;
			    });
			}

			if (!DetectClient.isFirefox()) {
                const script = document.createElement('script');
                script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyDXReaPD426Bgnt4Aw83HGKKDdpjDFHKiQ&libraries=places&callback=initWhereAutocomplete';
                script.async = true;
                document.head.appendChild(script);
			}
		}
    })
}

function fetchAndDisplayEvent(url) {
    fetchJSON(url).then(data => {
        console.log("fbdata", data);
        polymerPromise2.then(async () => {
            const $fbOverlay = initTemplate("fbOverlayTemplate");
        
            try {
                const iCalObj = new iCalendar();
                const ical = iCalObj.parse(data);
                console.log(ical, ical.vevent)
            
                const events = await getEventsWrapper();

                // look for specific event - might have several with same name, but just copies ref https://jasonsavard.com/forum/discussion/comment/23963
                let foundEvent = events.find(event => {
                    let fbUID;
                    if (event.extendedProperties && event.extendedProperties.private) {
                        fbUID = event.extendedProperties.private.fbUID;
                    }
                    if (ical.vevent.uid && ical.vevent.uid == fbUID) {
                        return event;
                    }
                });

                if (!foundEvent) {
                    foundEvent = events.find(event => event.summary == ical.vevent.summary);
                }

                console.log("parse fb event");
                var start = data.indexOf("DTSTART");
                var end = data.indexOf("DTEND");
                
                var dtStart;
                var startDateOnly;
                
                var eventEntry = new EventEntry();

                try {
                    dtStart = data.substring(start+8, end-2);
                    // date only found ie. DTSTART:20121016
                    if (dtStart.length <= 10) {
                        startDateOnly = parseDate(dtStart);
                        startDateOnly.setDate(startDateOnly.getDate() + 1);
                    }
                } catch (e) {
                    console.warn("coud not parse for dtstart: ", e);
                }
                
                byId("fbEventTitle").textContent = ical.vevent.summary;
                
                if (startDateOnly) {
                    ical.vevent.dtstart = startDateOnly;
                    ical.vevent.dtend = new Date(startDateOnly);
                    ical.vevent.dtend.setDate(ical.vevent.dtend.getDate() + 1);
                    eventEntry.allDay = true;
                }

                if (foundEvent) {
                    
                    console.log("foundEvent", foundEvent)
                    console.warn("facebook event already exists!")

                    if (foundEvent.startTime.toString() != ical.vevent.dtstart.toString()
                        || foundEvent.description != cleanICal(ical.vevent.description)
                        || foundEvent.location != cleanICal(ical.vevent.location)) {

                        const calendar = getEventCalendar(foundEvent);
                        if (isCalendarWriteable(calendar)) {
                            const $toast = byId("fbUpdateEvent");
                            const $toastButton = $toast.querySelector(".toastFBUpdateEvent");
                            
                            onClickReplace($toastButton, function() {
                                $toast.hide();

                                showSaving();
                                updateEvent({
                                    event: foundEvent,
                                    patchFields: {
                                        startTime: ical.vevent.dtstart,
                                        description: cleanICal(ical.vevent.description),
                                        location: cleanICal(ical.vevent.location)
                                    }
                                }).then(response => {
                                    hideSaving();
                                    if (!response.cancel) {
                                        showMessage(getMessage("done"));
                                    }
                                }).catch(error => {
                                    showError("Error: " + error);
                                    hideSaving();
                                });
                            });
                        
                            showToast({toastId:"fbUpdateEvent", text:"Facebook event details are different", duration:6, keepToastLinks:true});
                        } else {
                            console.warn("not showing fb update because calendar is not writeable")
                        }
                    }
                } else {
                    const $findDate = byId("fbFindDate");
                    if (await getCalendarView() == CalendarView.AGENDA) {
                        hide($findDate);
                    } else {
                        show($findDate);
                        onClickReplace($findDate, () => {
                            $fbOverlay.style.opacity = "0.9";
                            gotoDate({date: ical.vevent.dtstart});
                            setTimeout(() => {
                                window.recentlySelected = true;
                                fullCalendar?.select(ical.vevent.dtstart, ical.vevent.dtend);
                                window.recentlySelected = false;
                            }, 800);
                        });
                    }

                    byId("fbEventDate").textContent = startDateOnly ? ical.vevent.dtstart.toLocaleDateStringJ() : ical.vevent.dtstart.toLocaleStringJ();

                    await initCalendarDropDown("fbAddCalendarsTemplate");

                    openDialog($fbOverlay).then(function (response) {
                        if (response == "ok") {
                            eventEntry.quickAdd = false;
                            eventEntry.summary = cleanICal(ical.vevent.summary);
                            eventEntry.description = cleanICal(ical.vevent.description);
                            eventEntry.location = cleanICal(ical.vevent.location);

                            eventEntry.startTime = ical.vevent.dtstart;
                            eventEntry.endTime = ical.vevent.dtend;

                            eventEntry.calendarId = getDropDownValue(byId("fbAddCalendarsMenu"));

                            eventEntry.extendedProperties = {
                                private: {
                                    fbUID: ical.vevent.uid
                                }
                            };

                            insertAndLoadInCalendar(eventEntry).catch(error => {
                                // do nothing already caught inside
                            });
                        }
                    }).catch(error => {
                        console.error(error);
                        showError("error: " + error);
                    });
                }
            } catch (error) {
                console.error("fb fetch error: ", error);
                if (DetectClient.isFirefox()) {
                    showMessage("To detect Facebook events you need to disable third-party cookie blocking in Firefox", {
                        text: getMessage("moreInfo"),
                        onClick: function() {
                            openUrl("https://support.mozilla.org/kb/content-blocking");
                        }
                    });
                } else {
                    showError("Could not detect Facebook event");
                }
            }
        });
    });
}

async function insertAndLoadInCalendar(eventEntry) {
    fullCalendar?.unselect();

    console.log("insertAndLoadInCalendar: ", eventEntry);

    showSaving();
    try {
        const response = await saveEvent(eventEntry);

        setEventDateMessage(eventEntry);
        
        const $eventTitle = byId("eventTitle");
        if ($eventTitle) {
            $eventTitle.value = "";
        }

        // add to events
        //events.push(eventEntry);
        //await sortEvents(events);

        const cachedFeeds = await storage.get("cachedFeeds");
        const arrayOfCalendars = await getArrayOfCalendars();

        if (eventEntry.recurrence) {
            reloadCalendar({source:"recurringEventAdded", bypassCache:true, refetchEvents:true});
        } else {
            if (await getCalendarView() == CalendarView.AGENDA) {
                initAgenda();
            } else {
                const calendar = getEventCalendar(eventEntry);
                const fcEvent = convertEventToFullCalendarEvent({
                    eventEntry: eventEntry,
                    cachedFeeds: cachedFeeds,
                    arrayOfCalendars: arrayOfCalendars
                });
                fullCalendar.addEvent(fcEvent, FULL_CALENDAR_SOURCE_ID);
            }
            
            await updateCachedFeed(eventEntry, {
                operation: "add",
                cachedFeeds: cachedFeeds
            });
        }

        return response;
    } catch (error) {
        // seems like status 500 errors are not returning details about the error and so the oauth just returns the statusText "error"
        if (error == "error") {
            showError("Intermittent error, please try again!");
        } else {
            showCalendarError(error);
        }
        throw error;
    } finally {
        hideSaving();
    }
}

async function fetchEvents(events, start, end) {
    console.log("fetchEvents");
    if (events.length == 0 || start.isBefore(getStartDateBeforeThisMonth()) || end.isAfter(await getEndDateAfterThisMonth())) {
        showLoading();
        
        console.time("fetchAllCalendarEvents");
        try {
            const response = await sendMessageToBG("fetchAllCalendarEvents", {email:email, startDate:start, endDate:end, source:"popup", bypassCache:false});
            console.timeEnd("fetchAllCalendarEvents");
            var newEvents = [];
            if (response?.events) {
                newEvents = response.events.slice();
                newEvents.forEach(event => {
                    parseEventDates(event);
                });
            } else if (events) {
                newEvents = events.slice();
            }
            return newEvents;
        } catch (error) {
            hideLoading();
            showError("Try reload button or " + getMessage("accessNotGrantedSeeAccountOptions_accounts") + " options!", {
                text: getMessage("accessNotGrantedSeeAccountOptions_accounts"),
                onClick: function() {
                    openUrl("options.html?accessNotGranted=true#accounts");
                }
            });
            console.error("fetchEvents error", error);
        }
    } else {
        return events.shallowClone();
    }
}

function getDropDownValue($node) {
    return $node.selectedItem?.getAttribute("value");
}

function getSelectedCalendar($node) {
	var calendarId = getDropDownValue($node);
	return getCalendarById(calendarId);
}

function convertFullCalendarCurrentDateToDate() {
	const date = fullCalendar.getDate();
	return date.addMinutes( date.getTimezoneOffset() );
}

async function saveQuickAdd() {
	byId("save-quick-add").classList.add("disabled");

    const calendarId = getDropDownValue(byId("quickAddCalendarsMenu"));

	// Must match what timeFilte and formatContent returns
	const eventEntry = new EventEntry();
	
	if (await getCalendarView() == CalendarView.DAY) {
		// use currently selected day in day view
		eventEntry.startTime = convertFullCalendarCurrentDateToDate();
	} else if (calendarId == TASKS_CALENDAR_OBJECT.id) {
        eventEntry.startTime = new Date();

        const taskLists = cachedFeeds["taskLists"];
        eventEntry.taskListId = taskLists.items.first().id;
    }
	
	const summary = byId("quickAdd").value ?? getMessage("noTitle");
	eventEntry.summary = summary;
	eventEntry.userInputSummary = summary;
	eventEntry.allDay = true; // default to this
    eventEntry.calendarId = calendarId;
	eventEntry.inputSource = InputSource.QUICK_ADD;

	sendGA('quickadd', 'click');
	
	insertAndLoadInCalendar(eventEntry).then(response => {
		byId("quickAdd").setAttribute("placeholder", "");
        byId("quickAdd").value = "";
	}).catch(error => {
        // do nothing because error is handled in insertAndLoadInCalendar
        console.log("error", error);
	}).then(() => {
        closeQuickAdd();
	});
}

function closeQuickAdd() {
    byId("save-quick-add").classList.remove("disabled");
    htmlElement.classList.remove("quickAddVisible");
    byId("quickAddWrapper").classList.remove("inputEntered");
}

async function searchEvents() {
    showSaving();

    const searchStr = byId("searchInput").value;

    const calendarId = getDropDownValue(byId("searchCalendarsMenu"));

    let calendarIdsToSearch = [];
    if (calendarId == "active-calendars") {
        const calendars = await getSelectedCalendarsInGoogleCalendar();
        calendarIdsToSearch = calendars.map(calendar => calendar.id);
    } else if (calendarId == "all-calendars") {
        const arrayOfCalendars = await getArrayOfCalendars({excludeTasks: true});
        calendarIdsToSearch = arrayOfCalendars.map(calendar => calendar.id);
    } else {
        calendarIdsToSearch.push(calendarId);
    }

    const promises = calendarIdsToSearch.map(calendarId => {
        return oauthDeviceSend({
            userEmail: email,
            url: "/calendars/" + encodeURIComponent(calendarId) + "/events",
            data: {
                q: searchStr,
                singleEvents: true,
                orderBy: "startTime",
                maxResults: 1000
            }
        })
    });

    Promise.all(promises).then(async responses => {
        const searchResultEvents = [];

        // search tasks
        const selectedCalendars = await storage.get("selectedCalendars");
        const tasksSelected = isCalendarSelectedInExtension(TASKS_CALENDAR_OBJECT, email, selectedCalendars);

        if (tasksSelected) {
            const events = await getEvents();
            events.forEach(event => {
                if (event.kind == TASKS_KIND) {
                    const regex = new RegExp(searchStr, "i");
                    if (regex.test(event.summary) || regex.test(event.description)) {
                        searchResultEvents.push(event);
                    }
                }
            });
        }


        // regular events
        responses.forEach((response, index) => {
            if (response.items.length) {
                response.items.forEach(event => {
                    console.log("result", event);
                    initEventObj(event, calendarIdsToSearch[index]);
                    searchResultEvents.push(event);
                });
            }
        });
        
        if (searchResultEvents.length) {
            searchResultEvents.sort((eventA, eventB) => {
                return eventA.startTime - eventB.startTime;
            });
            displayAgenda({events:searchResultEvents, showPastEvents:true, hideMultipleDayEvents:true, hideCurrentDay:true, search:true});
        } else {
            showError("No results");
        }
    }).catch(error => {
		showCalendarError(error);
	}).then(() => {
		hideSaving();
	});
}

async function fetchAgendaEvents(params) {
	showLoading();
    console.log("start: " + params.start + " end: " + params.end);
    const events = await getEventsWrapper();
    let newEvents = await fetchEvents(events, params.start, params.end);
    if (newEvents) {
        // deep down ... fetchCalendarEvents could pull events (cached, invisible etc.) that are outside of the start/stop parameters here
        // so let's restrict it here
        var indexOfEventWhichObeysStartTime = null;
        newEvents.some(function(newEvent, index) {
            if (indexOfEventWhichObeysStartTime == null && (newEvent.startTime.toJSON() == params.start.toJSON() || newEvent.startTime.isAfter(params.start))) {
                indexOfEventWhichObeysStartTime = index;
                return true;
            }
        });
        
        console.log("indexOfEventWhichObeysStartTime: " + indexOfEventWhichObeysStartTime);
        if (indexOfEventWhichObeysStartTime != null) {
            newEvents = newEvents.slice(indexOfEventWhichObeysStartTime);
        }
        
        params.newEvents = newEvents;
        displayAgenda(params);
        hideLoading();
    }
}

async function initAgenda() {
    fetchingAgendaEvents = true;
    // tried using asyncs for displayAgenda but caused flicker issue when scrollToToday
	displayAgenda({showStartingToday:true});
	await polymerPromise2;
    // IF agenda has more events then load all the rest
    if (scrollTarget && scrollTarget.scrollHeight > window.innerHeight) {
        await displayAgenda({scrollToToday:true});
    }
    fetchingAgendaEvents = false;
}

async function displayAgenda(params = {}) {
   	// patch to prevent empty scrollbar in Chrome 72
	byId("mainContent").style.height = calculateCalendarHeight() + "px";

    const cachedFeeds = await storage.get("cachedFeeds");
	const selectedCalendars = await storage.get("selectedCalendars");
    const calendarSettings = await storage.get("calendarSettings");
    const showDeclinedEvents = calendarSettings.showDeclinedEvents;
    const hideInvitations = calendarSettings.hideInvitations;
    const arrayOfCalendars = await getArrayOfCalendars();
    const defaultCalendarId = await getDefaultCalendarId(arrayOfCalendars);
    const dimPastEvents = await storage.get("dimPastEvents");
    const showEventIcons = await storage.get("showEventIcons");

	console.log("displayagenda params", params);

	// to enable waterfall effect
	selector("app-header-layout app-header").scrollTarget = scrollTarget;
	
	var eventsToDisplay;
	var dateToDisplay;
	if (params.newEvents) {
		eventsToDisplay = params.newEvents;
		if (eventsToDisplay.length) {
			dateToDisplay = eventsToDisplay.first().startTime;
		} else {
			dateToDisplay = new Date();
		}
	} else {
		if (params.events) {
			eventsToDisplay = params.events;
		} else {
			/*
			eventsToDisplay = events.filter(function(event) {
				if (event.endTime.diffInDays() >= -2) { //  && event.endTime.diffInDays() <= 7
					return true;
				}
			});
			*/
			/*
			eventsToDisplay = [];
			events.some((event) => {
				if (event.startTime.diffInDays() >= -2) {
					eventsToDisplay.push(event);
				}
				if (eventsToDisplay.length > 50) {
					return true;
				}
			});
			*/
			eventsToDisplay = await getEventsWrapper();

            const DAYS_IN_THE_PAST = params.prepend ? 999 : 7;
            const DAYS_IN_THE_FUTURE = 20; // optimize speed cause was slow for recurring events, so only show up to x ahead
            eventsToDisplay = eventsToDisplay.filter((event) => {
				if (event.startTime.diffInDays() >= -DAYS_IN_THE_PAST && event.startTime.diffInDays() <= DAYS_IN_THE_FUTURE) {
					return true;
				}
			});
		}
		dateToDisplay = new Date();
	}

	displayAgendaHeaderDetails(dateToDisplay);
	
	byId("calendarTitleToolTip").textContent = "";
	
	const $agendaEvents = byId("agendaEvents");
	const $agendaEventsForThisFetch = document.createElement("div");

	if ((!params.append && !params.prepend) || params.forceEmpty) {
		emptyNode($agendaEvents);
	}
	
	var previousEvent;
	var $agendaDay;
	var $firstEventOfTheDay;
	var hasAnEventToday;
	var addedPlaceHolderForToday;

    if (dimPastEvents) {
        $agendaEvents.classList.add("dim-past-events");
    } else {
        $agendaEvents.classList.remove("dim-past-events");
    }

    function displayAgendaEvents(eventParams) {
        const events = eventParams.events;

        console.log("displayAgendaEvents", events);
        
        events.forEach((event, index) => {
			
			if (params.hideCurrentDay !== true && !params.newEvents && !hasAnEventToday && !addedPlaceHolderForToday && (event.startTime.isTomorrow() || event.startTime.isAfter(tomorrow()))) {
				addedPlaceHolderForToday = true;
				
				const placeHolderForTodayEvent = new EventEntry();
				placeHolderForTodayEvent.summary = getMessage("nothingPlanned");
				placeHolderForTodayEvent.startTime = today();
				placeHolderForTodayEvent.endTime = tomorrow();
				placeHolderForTodayEvent.allDay = true;
				placeHolderForTodayEvent.calendarId = defaultCalendarId;
				placeHolderForTodayEvent.placeHolderForToday = true;
				
				displayAgendaEvents({events:[placeHolderForTodayEvent]});
			}
			
			if (index >= 20) {
				//return false;
			}

            // just hide multi days on 1st load
            const multiDayEvent = event.endTime?.diffInDays(event.startTime) > 1;
			
			// optimize for speed by skipping over before today events
			if (params.showStartingToday && (event.endTime?.isEqualOrBefore(today()) || multiDayEvent)) {
                return true;
            } else {
                console.log("after", event.summary, event)
            }
			
			var calendarSelected;
			var calendar = getEventCalendar(event);
			var eventTitle = getSummary(event);
			
			calendarSelected = isCalendarSelectedInExtension(calendar, email, selectedCalendars);
			
			if ((eventTitle && (calendarSelected || params.search) && passedShowDeclinedEventsTest(event, showDeclinedEvents, email) && passedHideInvitationsTest(event, hideInvitations, email)) || event.placeHolderForToday) {

				if (event.startTime.isToday()) {
					hasAnEventToday = true;
				}
				
				if (!eventParams.multipleDayEventsFlag) {
					if (!previousEvent || event.startTime.toDateString() != previousEvent.startTime.toDateString()) {
						
						// different month detection
						if (!previousEvent) {
							if (!params.prepend) {
								const lastEventDataEvent = lastNode($agendaEvents.querySelectorAll(".agendaDay"))?._event;
								if (lastEventDataEvent) {
									previousEvent = lastEventDataEvent;
									console.log("previous event", previousEvent.summary);
								}
							}
						}
						
						if (previousEvent && previousEvent.startTime.isBefore(event.startTime) && (previousEvent.startTime.getMonth() != event.startTime.getMonth() || previousEvent.startTime.getYear() != event.startTime.getYear())) {
							console.log("prev event: ", previousEvent.summary, event.startTime.format("mmm"));
							
							const formatOptions = {
                                month: "short"
                            }

							if (event.startTime.getYear() != new Date().getYear()) {
								formatOptions.year = "numeric";
                            }
                            
                            const $agendaMonthHeader = document.createElement("div");
                            $agendaMonthHeader.classList.add("agendaMonthHeader");
                            $agendaMonthHeader.textContent = event.startTime.toLocaleDateString(locale, formatOptions);

                            $agendaEventsForThisFetch.append($agendaMonthHeader);
                        }
						
						const $agendaDateWrapper = document.createElement("div");
                        $agendaDateWrapper.classList.add("agendaDateWrapper");

                        const $agendaDate = document.createElement("div");
                        $agendaDate.classList.add("agendaDate");

						if (params.showPastEvents) {
							$agendaDate.textContent = event.startTime.format("d mmm yyyy, ddd");
							$agendaDateWrapper.append( $agendaDate );
						} else {
							$agendaDate.textContent = event.startTime.getDate();
							$agendaDateWrapper.append( $agendaDate );

							const $agendaDateDay = document.createElement("div");
                            $agendaDateDay.textContent = dateFormat.i18n.dayNamesShort[event.startTime.getDay()];

                            $agendaDateWrapper.append( $agendaDateDay );
						}
						
						$agendaDay = document.createElement("div");
                        $agendaDay.classList.add("agendaDay", "horizontal", "layout")
                        
                        $agendaDay.append($agendaDateWrapper);

                        const $agendaDayEvents = document.createElement("div");
                        $agendaDayEvents.classList.add("agendaDayEvents", "flex")

						$agendaDay.append( $agendaDayEvents );
						$agendaDay._event = event;
						if (event.startTime.isToday()) {
							$agendaDay.classList.add("today");
						} else if (event.startTime.isBefore() && !params.showPastEvents) {
							//$agendaDay.attr("hidden", "");
						}
						
						$agendaEventsForThisFetch.append($agendaDay);
						
						if (!params.hideMultipleDayEvents) {
							// find any previous multiple day events
							var multipleDayEvents = [];
							for (var a=index-1; a>=0; a--) {
								var thisEvent = events[a];
								if ((isCalendarSelectedInExtension(getEventCalendar(thisEvent), email, selectedCalendars) || params.search) && thisEvent.endTime?.isAfter(event.startTime)) {
									//console.log("multiple day: " + event.startTime.getDate() + " " + event.startTime + " " + thisEvent.summary + " " + thisEvent.startTime + " " + thisEvent.endTime);
									//console.log("same day: " + thisEvent.endTime.isSameDay(event.startTime) + " after endtime: " + thisEvent.endTime.isAfter(event.startTime))
									multipleDayEvents.push(thisEvent);
								}
							}
							displayAgendaEvents({events:multipleDayEvents, multipleDayEventsFlag:true});
						}
					}
				}
				
                const $agendaEventTitleWrapper = document.createElement("div");
                $agendaEventTitleWrapper.classList.add("agendaEventTitleWrapper");
                const $eventTitleOnly = document.createElement("div");

                const $eventIcon = document.createElement("span");
                $eventIcon.classList.add("eventIcon");
				
				if (event.startTime.diffInDays() >= 0 && event.startTime.diffInDays() <= 3) { // only 3 days because the regex filtering for words slows down the display
                    if (showEventIcons) {
                        setEventIcon({
                            event: event,
                            $eventIcon: $eventIcon,
                            cachedFeeds: cachedFeeds,
                            arrayOfCalendars: arrayOfCalendars
                        });
                    }
					$eventTitleOnly.append( $eventIcon );
				}
                
                const $agendaEventTitle = document.createElement("span");
                $agendaEventTitle.classList.add("agendaEventTitle");
                if (event.kind == TASKS_KIND) {
                    $agendaEventTitle.classList.add("task");
                }
                $agendaEventTitle.textContent = eventTitle;

				$eventTitleOnly.append( $agendaEventTitle );
				if (eventParams.multipleDayEventsFlag) {
                    const $cont = document.createElement("span");
                    $cont.style.cssText = "margin-left:5px";
                    $cont.textContent = `(${getMessage("cont")})`;

					$eventTitleOnly.append( $cont );
                }

                if (event.recurringEventId) {
                    const $recurringImg = document.createElement("img");
                    $recurringImg.classList.add("repeating");
                    $recurringImg.src = "images/repeating.png";
                    $recurringImg.title = getMessage("recurringEvent");
                    $eventTitleOnly.append( $recurringImg );
                }
                
                $agendaEventTitleWrapper.append($eventTitleOnly);
				
				if (event.allDay) {
					if (event.location) {
                        const $agendaEventLocation = document.createElement("div");
                        $agendaEventLocation.classList.add("agendaEventLocation");
                        $agendaEventLocation.textContent = event.location;
						$agendaEventTitleWrapper.append( $agendaEventLocation );
					}
				} else {
                    const $agendaEventTime = document.createElement("div");
                    $agendaEventTime.classList.add("agendaEventTime");
                    $agendaEventTime.textContent = generateTimeDurationStr({event:event, hideStartDay:true});

					$agendaEventTitleWrapper.append( $agendaEventTime );
					if (event.location) {
                        const $agendaEventLocation = document.createElement("div");
                        $agendaEventLocation.classList.add("agendaEventLocation");
                        $agendaEventLocation.textContent = event.location;

						$agendaEventTitleWrapper.append( $agendaEventLocation );
					}
				}
				if (event.hangoutLink || event.conferenceData) {
                    const $agendaEventVideo = document.createElement("div");
                    $agendaEventVideo.classList.add("agendaEventVideo");
                    $agendaEventVideo.textContent = getMessage("videoCall");

					$agendaEventTitleWrapper.append( $agendaEventVideo );
				}

                const $eventNode = document.createElement("div");

                if (event.status == TaskStatus.COMPLETED) {
                    $eventNode.classList.add("task-completed");
                }

                const currentUserAttendeeDetails = getCurrentUserAttendeeDetails(event, email);
                if (currentUserAttendeeDetails) {
                    const className = getClassForAttendingStatus(currentUserAttendeeDetails.responseStatus);
                    $eventNode.classList.add(className);
                }

				$eventNode.append( $agendaEventTitleWrapper );
				if (event.placeHolderForToday) {
					$eventNode.classList.add("placeHolderForToday");
					$eventNode.append(document.createElement("paper-ripple"));
				} else {
					const eventColors = getEventColors({
                        event: event,
                        cachedFeeds: cachedFeeds,
                        arrayOfCalendars: arrayOfCalendars
                    });

					$eventNode.classList.add("agendaEvent")
					css($eventNode, {
                        "color": eventColors.fgColor,
                        "background-color": eventColors.bgColor
                    });
				}

                onClick($eventNode, function() {
					if (event.placeHolderForToday) {
						var eventEntry = new EventEntry();
						eventEntry.allDay = true;
						eventEntry.startTime = today();
						showCreateBubble({event:eventEntry});
					} else {
						if (document.body.clientWidth >= 500) {
							showDetailsBubble({event:event, $eventNode:$eventNode});
						} else {
							openUrl(getEventUrl(event));
						}
					}
				})
                
				if (event.endTime?.isBefore()) {
                    $eventNode.classList.add("pastEvent");
				}
				
				$agendaDay.querySelector(".agendaDayEvents").append($eventNode);
				
				if (!$firstEventOfTheDay && (event.startTime.isToday() || event.startTime.isAfter())) {
					$firstEventOfTheDay = $agendaDay;
				}
				
				previousEvent = event;
			}
		});
	}
	
	console.time("displayAgendaEvents");
	displayAgendaEvents({events:eventsToDisplay});
	console.timeEnd("displayAgendaEvents");
	
	var BUFFER = 0;
	
	if (params.prepend) {
		$agendaEvents.prepend($agendaEventsForThisFetch);
		//scrollTarget.scrollTop += $agendaEventsForThisFetch.height() + BUFFER;
	} else {
		$agendaEvents.append($agendaEventsForThisFetch);
	}
	
	// only scroll into view first time (when no data().events) exist)
	if ((!$agendaEvents._events && $firstEventOfTheDay && $firstEventOfTheDay.length) || params.scrollToToday) {
		window.autoScrollIntoView = true;
		
		$firstEventOfTheDay.scrollIntoView();
		// patch: seems that .scrollIntoView would scroll the whole body up and out of frame a bit so had to execute a 2nd one on the panel
		selector("app-header-layout").scrollIntoView();
		
		// commented because using padding-top on .today event instead
		/*
		var currentScrollTop = $('[main]')[0].scroller.scrollTop;
		if (currentScrollTop >= BUFFER) {
			$('[main]')[0].scroller.scrollTop -= BUFFER;
		}
		*/
		
		// patch: seems that in the detached window the .scrollIntoView would scroll the whole body up and out of frame a bit, so just repaint the body after a little delay and the issue is fixed
		/*
		htmlElement.hide();
		setTimeout(function() {
			htmlElement.show();
		}, 1)
		*/
		
		// make sure the .scroll event triggers before i set it to false
		setTimeout(function() {
			window.autoScrollIntoView = false;
		}, 50);
	}
	
	$agendaEvents._events = eventsToDisplay;
}

function initCalendarView(viewName) {
	var calendarViewValue;
	
	if (viewName == CalendarView.AGENDA) {
		calendarViewValue = "agenda";
	} else {
		calendarViewValue = viewName;
	}
	htmlElement.setAttribute("calendarView", calendarViewValue);
}

function fcChangeView(viewName) {
    fullCalendar.changeView(getFCViewName(viewName));
}

async function changeCalendarView(viewName) {
	let previousCalendarView = await getCalendarView();

    // commented because user can now temporarily click day header to sneak preview day view without really wanteding to permenatly change the preset view ie. month
	//if (viewName != previousCalendarView) {
		await storage.set("calendarView", viewName);

        // set calendarView in url because it will be fetched faster at load than storage
        await initPopup();
        history.pushState({}, "", setUrlParam(location.href, "calendarView", viewName));
		
		// patch if previous view was basicDay (ie. my custom agenda view) then we must reload the betaCalendar because it was hidden and not properly initialized
		if ((previousCalendarView == CalendarView.AGENDA && viewName != CalendarView.AGENDA) || previousCalendarView == CalendarView.LIST_WEEK || viewName == CalendarView.LIST_WEEK) {
			location.reload();
		} else {
			
			initCalendarView(viewName);
			
			if (viewName == CalendarView.AGENDA) {
				initAgenda();
			} else {
				fcChangeView(viewName);
			}
		}
	//}
	
	initOptionsMenu();
}

async function initOptionsMenu() {
	selectorAll("#options-menu paper-icon-item").forEach(el => el.classList.remove("iron-selected"));
	
	const calendarView = await getCalendarView();
	
	if (calendarView == CalendarView.AGENDA) {
		byId("viewAgenda").classList.add("iron-selected");
	} else if (calendarView == CalendarView.LIST_WEEK) {
		byId("viewListWeek").classList.add("iron-selected");
	} else if (calendarView == CalendarView.DAY) {
		byId("viewDay").classList.add("iron-selected");
	} else if (calendarView == CalendarView.WEEK) {
		byId("viewWeek").classList.add("iron-selected");
	} else if (calendarView == CalendarView.MONTH) {
		byId("viewMonth").classList.add("iron-selected");
	} else if (calendarView == CalendarView.CUSTOM) {
		byId("viewCustom").classList.add("iron-selected");
	}
}

function hasHtml(str) {
    return str && (str.includes("<") || str.includes(">"));
}

function hasEmbeddedLinks(str) {
    return str.includes("<https:");
}

function prepareForContentEditable(str) {
    if (str) {
        if (hasHtml(str) && !hasEmbeddedLinks(str)) {
            return str;
        } else {
            str = str.replaceAll("\n", "<br>");

            if (hasEmbeddedLinks(str)) {
                const matches = str.match(/<https.+?>/g);
                console.log("matches", matches);

                matches?.forEach(match => {
                    let newStr;
                    
                    if (match.includes("<https: ")) {
                        // Search for Microsoft Teams links ie. Click here to join the meeting<https: teams.microsoft.com="" l="" meetup-join="" 19%3ameeting_njdimtfmyjytntfhmy00mdfklwexztutndjlzdgwzdu2m2i3%40thread.v2="" 0?context="%7b%22Tid%22%3a%2259185728-a5f6-4629-bfc4-3c833d60489a%22%2c%22Oid%22%3a%22e842bfbb-ca3b-4f1e-86c8-6646cca6751b%22%7d">
                        newStr = match.replace("<https: ", " -> <a href='https://");
                        newStr = newStr.replaceAll("=\"\" ", "/");
                        newStr = newStr.replaceAll("\"", "");
                        newStr = newStr.replace(/\>$/, "\'\>link</a>");
                    } else {
                        newStr = match.replace("<https:", " -> <a href='https://");
                        newStr = newStr.replace(/\>$/, "\'\>link</a>");
                    }

                    str = str.replaceAll(match, newStr);
                });
            }

            return str;
        }
    }
}

function sortAttendees(event) {
    event.attendees.sort((a, b) => {
        const displayName = a.displayName ?? a.email;
        const displayName2 = b.displayName ?? b.email;
        if (a.organizer && !b.organizer) {
            return -1;
        } else if (!a.organizer && b.organizer) {
            return +1;
        } else {
            return displayName.localeCompare(displayName2, locale, {ignorePunctuation: true});
        }
    });
}

async function getContactDisplayName(contact) {
    let displayName = contact.displayName;
    if (!displayName) {
        const account = generateAccountStub(email);
        if (typeof contacts === "undefined") {
            contacts = await getContacts({ account: account });
        }
        const contactData = await getContact({email: contact.email, account: account});
        if (contactData) {
            displayName = contactData.name;
        } else {
            displayName = contact.email;
        }
    }
    return displayName;
}

async function showDetailsBubble(params) {
	console.log("showdetailsbubble", params);
	
	var event = params.event;
	var calendar = getEventCalendar(event);
    var isSnoozer;
    
    const cachedFeeds = await storage.get("cachedFeeds");
    const arrayOfCalendars = await getArrayOfCalendars();
	
	if (params.calEvent?.extendedProps?.isSnoozer) {
		isSnoozer = true;
	}
	
    const $dialog = initTemplate("clickedEventDialogTemplate");
    const $scrollerArea = $dialog.querySelector("paper-dialog-scrollable")
    $scrollerArea?.updateScrollState();

	var title = getSummary(event);
	
	if (isSnoozer) {
		title += " (snoozed)";
	}

    if (calendar.id == TASKS_CALENDAR_OBJECT.id) {
        $dialog.classList.add("task-selected");
        $dialog.classList.toggle("task-completed", event.status == TaskStatus.COMPLETED);
    } else {
        $dialog.classList.remove("task-selected");
    }
	
	const $editingButtons = $dialog.querySelectorAll("#clickedEventDelete, #clickedEventEdit, #clickedEventColor, #clickedEventDuplicate");
	if (isCalendarWriteable(calendar)) {
		show($editingButtons);
		hide("#copyToMyCalendar");

        if (calendar.id == TASKS_CALENDAR_OBJECT.id) {
            hide("#clickedEventColor, #clickedEventDuplicate");
        }
	} else {
		hide($editingButtons);
		
		// exeption we can delete snoozes
		if (isSnoozer) {
			show($dialog.querySelector("#clickedEventDelete"));
		} else {
			show("#copyToMyCalendar");
		}
	}
	
	const $eventIcon = $dialog.querySelector(".eventIcon");
    emptyNode($eventIcon);
    if (await storage.get("showEventIcons")) {
        setEventIcon({
            event: event,
            $eventIcon: $eventIcon,
            cachedFeeds: cachedFeeds,
            arrayOfCalendars: arrayOfCalendars
        });
    }
	
    const $clickedEventTitle = $dialog.querySelector("#clickedEventTitle");
    $clickedEventTitle.style.color = getEventColors({
        event: event,
        darkenColorFlag: true,
        cachedFeeds: cachedFeeds,
        arrayOfCalendars: arrayOfCalendars
    });
    $clickedEventTitle.textContent = title;
    onClickReplace($clickedEventTitle, function() {
        if (isCalendarWriteable(calendar)) {
            $dialog.querySelector("#clickedEventEdit").click();
        } else {
            niceAlert("You can't edit this event!");
        }
    });

    const $clickedEventRecurring = $dialog.querySelector("#clickedEventRecurring");
    
    if (event.recurringEventId) {
        $clickedEventRecurring.innerHTML = "&nbsp;"; // placeholder
        show($clickedEventRecurring);

        oauthDeviceSend({
            userEmail: email,
            url: `/calendars/${encodeURIComponent(await getCalendarIdForAPIUrl(event))}/events/${event.recurringEventId}`
        }).then(response => {
            console.log("recurring event", response);
            const firstRule = response.recurrence?.[0];
            let recurrenceDropdownValue;
            if (firstRule?.includes("DAILY")) {
                recurrenceDropdownValue = "daily";
                $clickedEventRecurring.textContent = getMessage("daily");
            } else if (firstRule?.includes("WEEKLY")) {
                recurrenceDropdownValue = "weekly";
                $clickedEventRecurring.textContent = getMessage("weekly");
            } else if (firstRule?.includes("MONTHLY")) {
                recurrenceDropdownValue = "monthly";
                $clickedEventRecurring.textContent = getMessage("monthly");
            } else if (firstRule?.includes("YEARLY")) {
                recurrenceDropdownValue = "yearly";
                $clickedEventRecurring.textContent = getMessage("annually");
            } else { // might have more or different rules
                recurrenceDropdownValue = "other";
                $clickedEventRecurring.textContent = getMessage("recurringEvent");
            }

            $dialog._recurrenceDropdownValue = recurrenceDropdownValue;
        }).catch(error => {
            console.warn("issue fetching recurring event", error);
        });
    } else {
        $dialog._recurrenceDropdownValue = "";
        hide($clickedEventRecurring);
    }
    
	$dialog.querySelector("#clickedEventDate").textContent = generateTimeDurationStr({event:event});

	if (calendar.primary || event.kind == TASKS_KIND) {
		hide($dialog.querySelector("#clickedEventCalendarWrapper"));
	} else {
		$dialog.querySelector("#clickedEventCalendar").textContent = calendar.summary;
		show($dialog.querySelector("#clickedEventCalendarWrapper"));
	}

	if (!event.creator || event.creator.self) {
		hide($dialog.querySelector("#clickedEventCreatedByWrapper"));
	} else {
        cacheContactsData().then(async () => {
            console.log("creator", event);
            const displayName = await getContactDisplayName(event.creator);
            const $creator = document.createElement("a");
            $creator.textContent = displayName ?? event.creator.email;
            $creator.href = "mailto:" + event.creator.email;
            $creator.target = "_blank";
            $creator.title = event.creator.email;

            emptyAppend($dialog.querySelector("#clickedEventCreatedBy"), $creator);
            show($dialog.querySelector("#clickedEventCreatedByWrapper"));
        });
	}

	const eventSource = getEventSource(event, false);

	var locationUrl;
	var locationTitle;
	
	// if source and location are same then merge them
	if (eventSource?.url == event.location) {
		hide($dialog.querySelector("#clickedEventLocationWrapper"));
	} else {
		if (event.location) {
			locationUrl = event.location;
			locationTitle = event.location;

            const $clickedEventLocationMapLink = $dialog.querySelector("#clickedEventLocationMapLink");
			$clickedEventLocationMapLink.textContent = locationTitle;
            $clickedEventLocationMapLink.href = generateLocationUrl(event);
			show($dialog.querySelector("#clickedEventLocationWrapper"));
		} else {
			hide($dialog.querySelector("#clickedEventLocationWrapper"));
		}
	}
	
	if (eventSource) {
		// show logo for this type of source 
		var $fieldIcon = $dialog.querySelector("#clickedEventSourceWrapper .fieldIcon");
		$fieldIcon.removeAttribute("icon");
		$fieldIcon.removeAttribute("src");

		if (eventSource.isGmail) {
			$fieldIcon.setAttribute("icon", "mail");
		} else if (event.extendedProperties?.private?.favIconUrl) {
			$fieldIcon.setAttribute("src", event.extendedProperties.private.favIconUrl);
		} else {
			$fieldIcon.setAttribute("icon", "maps:place");
		}
		
		const $clickedEventSourceLink = $dialog.querySelector("#clickedEventSourceLink")
		$clickedEventSourceLink.textContent = eventSource.title;
        $clickedEventSourceLink.href = eventSource.url
        $clickedEventSourceLink.title = eventSource.url
		show($dialog.querySelector("#clickedEventSourceWrapper"));
	} else {
		hide($dialog.querySelector("#clickedEventSourceWrapper"));
	}

    const hangoutLink = event.hangoutLink;
    const zoomMeetingId = event.extendedProperties?.shared?.zmMeetingNum;

	if (hangoutLink) {
		$dialog.querySelector("#clickedEventVideoLink").href = hangoutLink;
        show($dialog.querySelector("#clickedEventVideoWrapper"));
    } else if (zoomMeetingId) {
		$dialog.querySelector("#clickedEventVideoLink").href = `https://zoom.us/j/${zoomMeetingId}`;
        byId("joinVideoCallButton").textContent = getMessage("joinWithX", "Zoom");
        show($dialog.querySelector("#clickedEventVideoWrapper"));
	} else {
		hide($dialog.querySelector("#clickedEventVideoWrapper"));
    }
    
    if (event.conferenceData?.createRequest?.status?.statusCode == "pending") {
        byId("joinVideoCallButton").textContent = "";
        byId("clickedEventVideoLabel").textContent = "Refresh to see conference data";
        show("#clickedEventVideoLinkWrapper");

        hide("#clickedEventVideoWrapper");
        hide("#clickedEventPhoneWrapper");
        hide("#clickedEventConferenceMoreWrapper");
    } else if (event.conferenceData?.conferenceSolution) {
        byId("conference-icon").removeAttribute("icon");
        byId("conference-icon").setAttribute("src", event.conferenceData.conferenceSolution.iconUri);
    
        const video = event.conferenceData.entryPoints.find(entryPoint => entryPoint.entryPointType == "video");
        const phone = event.conferenceData.entryPoints.find(entryPoint => entryPoint.entryPointType == "phone");
        const more = event.conferenceData.entryPoints.find(entryPoint => entryPoint.entryPointType == "more");

        function getConferenceCodes(entryPoint) {
            let str = "";
            if (entryPoint.meetingCode) {
                if (str) {
                    str += "<br>";
                }
                str += `ID: ${entryPoint.meetingCode}`;
            }
            if (entryPoint.accessCode) {
                if (str) {
                    str += "<br>";
                }
                str += `Access code: ${entryPoint.accessCode}`;
            }
            if (entryPoint.passcode) {
                if (str) {
                    str += "<br>";
                }
                str += `Passcode: ${entryPoint.passcode}`;
            }
            if (entryPoint.password) {
                if (str) {
                    str += "<br>";
                }
                str += `Password: ${entryPoint.password}`;
            }
            if (entryPoint.pin) {
                if (str) {
                    str += "<br>";
                }
                str += `${getMessage("PIN")}: ${phone.pin}`;
            }
            return str;
        }

        if (video) {
            show("#clickedEventVideoLinkWrapper");
            if (video.uri) {
                byId("clickedEventVideoLink").href = video.uri;
            }
            byId("joinVideoCallButton").textContent = getMessage("joinWithX", event.conferenceData.conferenceSolution.name);
            show("#clickedEventVideoWrapper");
            
            let label = video.label ?? "";

            // patch don't dislay zoom links they are long and ugly, but it's ok to display meets links (just like google calendar does)
            if (label.includes("zoom.")) {
                label = "";
            }

            label += getConferenceCodes(video);
            byId("clickedEventVideoLabel").innerHTML = label;

            onClickReplace(".copy-conference-link", () => {
                navigator.clipboard.writeText(video.uri);
                showMessage(getMessage("copiedToClipboard"));
            });
        } else {
            hide("#clickedEventVideoLinkWrapper");
        }

        if (phone) {
            show("#clickedEventPhoneWrapper");
            byId("clickedEventPhone").href = phone.uri;

            let label = phone.label ?? "";
            label += getConferenceCodes(phone);
            byId("clickedEventPhoneLabel").innerHTML = label;
        } else {
            hide("#clickedEventPhoneWrapper");
        }

        if (more) {
            show("#clickedEventConferenceMoreWrapper");
            byId("clickedEventConferenceMoreLabel").href = more.uri;
        } else {
            hide("#clickedEventConferenceMoreWrapper");
        }
    } else {
        hide("#clickedEventVideoLinkWrapper");
        hide("#clickedEventPhoneWrapper");
        hide("#clickedEventConferenceMoreWrapper");
    }

    if (event.conferenceData?.notes) {
        $dialog.querySelector("#clickedEventVideoNotes").innerHTML = event.conferenceData?.notes;
        show($dialog.querySelector("#clickedEventVideoNotesWrapper"));
    } else {
        hide($dialog.querySelector("#clickedEventVideoNotesWrapper"));
    }

	if (event.attendees) {
		const $attendees = $dialog.querySelector("#clickedEventAttendeesWrapper .clickedEventSubDetails");
        emptyNode($attendees);
        
        const attendeesCount = event.attendees?.length;
        if (attendeesCount) {
            const CHIP_HEIGHT = 28;
            $attendees.style["min-height"] = `${attendeesCount * CHIP_HEIGHT}px`;
        }

        cacheContactsData().then(() => {
            sortAttendees(event);
            asyncForEach(event.attendees, async (attendee) => {
                await addChip({
                    $container: 	$attendees,
                    attendee: 		attendee,
                    skipAddSelf: 	true
                });
            })
        });
		
		$dialog.querySelector("#clickedEventGoingWrapper .goingStatusHighlighted")?.classList.remove("goingStatusHighlighted");
		
		let eventAttendee;
		// fill out "Going" status etc.
		event.attendees.some(attendee => {
			console.log("attendee", attendee);
			if (attendee.email == email) {
				eventAttendee = attendee;
				if (attendee.responseStatus == AttendingResponseStatus.ACCEPTED) {
					$dialog.querySelector("#goingYes").classList.add("goingStatusHighlighted");
				} else if (attendee.responseStatus == AttendingResponseStatus.TENTATIVE) {
					$dialog.querySelector("#goingMaybe").classList.add("goingStatusHighlighted");
				} else if (attendee.responseStatus == AttendingResponseStatus.DECLINED) {
					$dialog.querySelector("#goingNo").classList.add("goingStatusHighlighted");
				}
				$dialog.querySelector("#clickedEventGoingWrapper").removeAttribute("hidden");
				return true;
			}
		});
		
        onClickReplace($dialog.querySelectorAll("#goingYes, #goingMaybe, #goingNo"), function() {
			const $goingNode = this;
			const responseStatus = $goingNode.getAttribute("responseStatus");
			eventAttendee.responseStatus = responseStatus;

			const patchFields = {
                attendeesOmitted: true,
                attendees: [eventAttendee]
            };
			
			console.log("patch fields", patchFields, eventAttendee);
			
			showSaving();
			updateEvent({event:event, patchFields:patchFields}).then(response => {
				// success
                if (!response.cancel) {
                    $dialog.querySelector("#clickedEventGoingWrapper .goingStatusHighlighted")?.classList.remove("goingStatusHighlighted");
                    $goingNode.classList.add("goingStatusHighlighted");
                    
                    if (params.jsEvent) {
                        params.jsEvent.target.classList.toggle("fcAcceptedEvent", responseStatus == AttendingResponseStatus.ACCEPTED);
                        params.jsEvent.target.classList.toggle("fcTentativeEvent", responseStatus == AttendingResponseStatus.TENTATIVE);
                        params.jsEvent.target.classList.toggle("fcDeclinedEvent", responseStatus == AttendingResponseStatus.DECLINED);
                    }
                    
                    selectorAll("#clickedEventAttendeesWrapper .chip").forEach(chip => {
                        const chipData = chip._data;
                        if (chipData.email == email) {
                            const $attendeeStatus = chip.querySelector(".attendee-status");
                            $attendeeStatus.classList.remove(getClassForAttendingStatus(AttendingResponseStatus.ACCEPTED))
                            $attendeeStatus.classList.remove(getClassForAttendingStatus(AttendingResponseStatus.TENTATIVE))
                            $attendeeStatus.classList.remove(getClassForAttendingStatus(AttendingResponseStatus.DECLINED))
                            $attendeeStatus.classList.remove(getClassForAttendingStatus(AttendingResponseStatus.NEEDS_ACTION))
                            $attendeeStatus.classList.add(getClassForAttendingStatus(responseStatus));
                        }
                    });

                    fullCalendar.render();
                }
                
				console.log(response);
				hideSaving();
			}).catch(error => {
				showError("Error: " + error);
				hideSaving();
			});

		});
	
		show($dialog.querySelector("#clickedEventAttendeesWrapper"));
	} else {
		hide($dialog.querySelector("#clickedEventAttendeesWrapper"));
		hide($dialog.querySelector("#clickedEventGoingWrapper"));
	}
	
	if (event.description) {
		var description = event.description;
		if (description) {
            description = prepareForContentEditable(description);
		}
		
		description = Autolinker.link(description, {
			//truncate: {length: 30},
			stripPrefix : false,
			email: false,
			twitter: false,
			phone: false,
			hashtag: false,
		    replaceFn : function( autolinker, match ) {
		        switch( match.getType() ) {
		            case 'url' :
		                var tag = autolinker.getTagBuilder().build( match ); 
		        		//return tag.innerHtml;
		                return tag;
		        }
			}
		});
        
        const $desc = $dialog.querySelector("#clickedEventDescriptionWrapper .clickedEventSubDetails");
		$desc.innerHTML = description;
        $desc.querySelectorAll("a").forEach(node => {
            node.setAttribute("target", "_blank");
        });
		show($dialog.querySelector("#clickedEventDescriptionWrapper"));
	} else {
		hide($dialog.querySelector("#clickedEventDescriptionWrapper"));
    }

    if (event.kind == TASKS_KIND) {
        if (event.links) {
            const $details = $dialog.querySelector("#clickedEventTaskLinkWrapper .clickedEventSubDetails");
            emptyNode($details);
            event.links.forEach(linkObj => {
                const $link = document.createElement("a");
                $link.classList.add("task-link");
                $link.href = linkObj.link;
                $link.target = "_blank";
                $link.textContent = linkObj.type == "email" ? getMessage("viewRelatedEmail") : linkObj.description;

                $details.append( $link );
            });
            show($dialog.querySelector("#clickedEventTaskLinkWrapper"));
        } else {
            hide($dialog.querySelector("#clickedEventTaskLinkWrapper"));
        }

        const taskList = getTaskList(event);
        if (taskList) {
            const $desc = $dialog.querySelector("#clickedEventTaskListWrapper .clickedEventSubDetails");
            $desc.innerHTML = taskList.title;
            show($dialog.querySelector("#clickedEventTaskListWrapper"));
        }
    } else {
        hide($dialog.querySelector("#clickedEventTaskLinkWrapper"));
        hide($dialog.querySelector("#clickedEventTaskListWrapper"));
    }

    if (event.attachments) {
        const $attachmentsNode = $dialog.querySelector("#clickedEventAttachmentsWrapper .clickedEventSubDetails");
        emptyNode($attachmentsNode);

        event.attachments.forEach(attachment => {
            const $link = document.createElement("a");
            $link.classList.add("attachment");
            $link.href = attachment.fileUrl;
            $link.target = "_blank";

            const $img = document.createElement("img");
            $img.src = attachment.iconLink;

            $link.append($img, " ", attachment.title);

            $attachmentsNode.append($link);
        });
        show($dialog.querySelector("#clickedEventAttachmentsWrapper"));
    } else {
        hide($dialog.querySelector("#clickedEventAttachmentsWrapper"));
    }

    const $clickedEventNotifications = byId("clickedEventNotifications");
    emptyNode($clickedEventNotifications);

    function addNotificationToLayout(str) {
        const $div = document.createElement("div");
        $div.textContent = str;
        $clickedEventNotifications.append($div);
    }
    
    const response = generateReminderTimes(event);
    response.reminderTimes.forEach(reminderTime => {
        addNotificationToLayout(reminderTime);
    });

    if (response.popupReminderFound) {
        show($dialog.querySelector("#clickedEventNotificationsWrapper"));
    } else {
        hide($dialog.querySelector("#clickedEventNotificationsWrapper"));
    }

    onClickReplace($dialog.querySelector("#clickedEventClose"), function() {
		$dialog.close();
	});

    onClickReplace($dialog.querySelector("#clickedEventDelete"), async function(e) {
		console.log("del event", e);
		
		$dialog.close();

		if (isSnoozer) {
			var snoozers = await getSnoozers();
			for (var a=0; a<snoozers.length; a++) {
				var snoozer = snoozers[a];
				console.log("snooze found")
				if (isSameEvent(event, snoozer.event)) {
					console.log("remove snooze");
					// remove it in local context here of popup
					snoozers.splice(a, 1);
					// remove it also from storage also!
					chrome.runtime.sendMessage({command:"removeSnoozer", eventId:snoozer.event.id}, function() {
                        if (fullCalendar) {
                            fullCalendar.getEventById(params.calEvent.id).remove();
                        }
					});
					break;
				}
			}
		} else {
			let response = await ensureSendNotificationDialog({ event: event, action: SendNotificationsAction.DELETE});
            if (!response.cancel) {
                showSaving();
                try {
                    response = await deleteEvent(event, response.sendNotifications);
                    if (!response.cancel) {
                        let message;
                        if (event.kind == TASKS_KIND) {
                            message = getMessage("taskDeleted");
                        } else {
                            message = getMessage("eventDeleted");
                        }
                        setStatusMessage({message: message});
    
                        if (response.changeAllRecurringEvents) {
                            reloadCalendar({source:"eventDeleted", bypassCache:true, refetchEvents:true});
                        } else if (fullCalendar) {
                            fullCalendar.getEventById(event.id).remove();
                        }
        
                        if (await getCalendarView() == CalendarView.AGENDA) {
                            initAgenda();
                        }
                        
                        if (htmlElement.classList.contains("searchInputVisible")) {
                            params.$eventNode.remove();
                        }
                    }
                } catch (error) {
                    showCalendarError(error);
                } finally {
                    hideSaving();
                }
            }
		}
	});

    async function changeTaskStatus(status, params) {
        $dialog.close();

        showSaving();

        await setTaskStatus(event, status);

        if (params.jsEvent) {
            const $fcEvent = params.jsEvent.target.closest(".fc-event")
            $fcEvent.classList.toggle("task-completed", status == TaskStatus.COMPLETED);
        }

        // clicked on agenda node
        if (params.$eventNode) {
            params.$eventNode.classList.toggle("task-completed", status == TaskStatus.COMPLETED);
        }

        hideSaving();

        const reloadParams = {
            source: "editEvent",
            bypassCache: true,
            refetchEvents: true,
        }

        reloadParams.skipSync = true;

        await reloadCalendar(reloadParams);
    }

    onClickReplace($dialog.querySelector("#clickedEventMarkCompleted"), async function(e) {
        changeTaskStatus(TaskStatus.COMPLETED, params);
    });

    onClickReplace($dialog.querySelector("#clickedEventMarkUncompleted"), async function(e) {
        changeTaskStatus(TaskStatus.NEEDS_ACTION, params);
    });

    onClickReplace($dialog.querySelector("#clickedEventColor"), function(e) {
		const $dialog = showEventColors(colors, getEventCalendar(event));

        addEventListeners($dialog, "iron-overlay-opened", function() {
            onClickReplace(".colorChoice", function() {
				const newColorId = this._colorId;

				const patchFields = {};
				patchFields.colorId = newColorId;
				
				if (newColorId) {
					event.colorId = newColorId;
				} else {
					delete event.colorId;
				}
				
				showSaving();
				updateEvent({event:event, patchFields:patchFields}).then(async response => {
                    if (!response.cancel) {
                        if (await getCalendarView() == CalendarView.AGENDA) {
                            initAgenda();
                        } else {
                            fullCalendar.refetchEvents();
                            await sleep(100);
                            reloadCalendar({source:"editEventColor", bypassCache:true, refetchEvents:true});
                        }
                    }
					hideSaving();
				}).catch(error => {
                    showCalendarError(error);
                });
			}, "fromEditEventDialog");
		});
	});

    onClickReplace($dialog.querySelector("#clickedEventEdit"), function(e) {
		$dialog.close();
		if (isSnoozer) {
			openReminders({notifications:[{event:event}]}).then(function() {
				close();
			});
		} else {
			showCreateBubble({event:event, editing:true});
		}
	});
	
    onClickReplace($dialog.querySelector("#clickedEventOpenInCalendar"), function() {
		if (isSnoozer) {
			openReminders({notifications:[{event:event}]}).then(function() {
				close();
			});
		} else {
			openUrl(getEventUrl(event));
		}
	});

    onClickReplace($dialog.querySelector("#copyToMyCalendar"), function() {
		$dialog.close();
		showCreateBubble({ event: event, editing: true, copying:true });
	});

    onClickReplace($dialog.querySelector("#clickedEventDuplicate"), function () {
		$dialog.close();
		showCreateBubble({ event: event, editing: true, copying: true });
	});
	
	openDialog($dialog);
}

function displayAgendaHeaderDetails(date) {
	byId("calendarTitle").textContent = date.toLocaleDateString(locale, {
        month: "long",
        year: "numeric"
    });
}

function popout(params) {
	let url = "popup.html";
	if (params) {
		url += "?" + params;
	}
	openUrl(url);
}

function openOptions() {
	openUrl("options.html?ref=popup");
}

function openContribute() {
	openUrl("contribute.html?ref=CalendarCheckerOptionsMenu");
}

function openHelp() {
	openUrl("https://jasonsavard.com/wiki/Checker_Plus_for_Google_Calendar?ref=CalendarCheckerOptionsMenu");
}

function calculateCalendarHeight() {
	const TOP_HEIGHT = DetectClient.isFirefox() ? 65 : 61;
    return document.body.clientHeight - TOP_HEIGHT;
    // v5 reverted v4 because clipping bottom events when calendar was full
    // v4 reduced chrome from 64 to 61 so I can modify eventLimit without scrollbar
    // v3: back to 64 - had empty space i could use at bottom
    // v2: 82 v1: zoom issue was stuck and i had to reload extension or else use 64??;
    // 82 = header       $("#main paper-toolbar").height() + 18
}

async function initQuickAdd() {
	// patch: because auto-bind did not work when loading polymer after the dom (and we I use a 1 millison second timeout before loading polymer to load the popup faster)
	// note: we are modifying the template and not the importedDom because that wouldn't work, polymer wouldn't process the paper-item nodes proplerly
	// note2: I moved this code from startup to the .click event because it was consuming more and more memory everytime I opened the popup window
	
	htmlElement.classList.add("quickAddVisible");
    byId("quickAdd").value = "";
    byId("quickAdd").focus();

    // after adding await, I had to move this below .focus() because it wasn't capturing first key press
    await initCalendarDropDown("quickAddCalendarsTemplate", {doNotExcludeTasks: true});
}

async function openGoogleCalendarEventPage(eventEntry) {
	var actionLinkObj = await generateActionLink("TEMPLATE", eventEntry);
	var url = actionLinkObj.url + "?" + actionLinkObj.data;
	openUrl(url);
}

function ensureSendNotificationDialog(params) {
	return new Promise((resolve, reject) => {
		if (params.event.attendees?.length) {
			if (params.action == SendNotificationsAction.CREATE || (params.event.organizer?.self)) {
				let content;
				if (params.action == SendNotificationsAction.CREATE) {
					content = getMessage("sendInviteToGuests");
				} else if (params.action == SendNotificationsAction.DELETE) {
					content = getMessage("sendUpdateAboutCancelingEvent");
				} else {
					content = getMessage("sendUpdateToExistingGuests");
				}
				openGenericDialog({
					content: content,
					okLabel: getMessage("send"),
					cancelLabel: getMessage("dontSend")
				}).then(response => {
					if (response == "ok") {
						resolve({ sendNotifications: true });
					} else {
						resolve({});
					}
				});
			} else {
				openGenericDialog({
					content: getMessage("changesOnlyReflectedOnCalendarX", getCalendarName(getEventCalendar(params.event))),
					okLabel: getMessage("continue"),
					showCancel: true
				}).then(response => {
					if (response == "ok") {
						resolve({});
					} else {
						resolve({ cancel: true });
					}
				});
			}
		} else {
			resolve({});
		}
	});
}

function getSkin(skins, $paperItem) {
	return skins.find(skin => skin.id == $paperItem.getAttribute("skin-id"));
}

function maybeRemoveBackgroundSkin(skinsSettings) {
	const oneSkinHasAnImage = skinsSettings.some(skin => {
	   if (skin.image) {
		   return true;
	   }
   });

   if (!oneSkinHasAnImage) {
	   document.body.classList.remove("background-skin");
   }
}

function showSkinsDialog() {
	showLoading();
	
	Controller.getSkins().then(async skins => {
        const donationClickedFlag = await storage.get("donationClicked");
		
		var attemptedToAddSkin = false;
		
		const $dialog = initTemplate("skinsDialogTemplate");
		const $availableSkins = $dialog.querySelector("#availableSkins");
        emptyNode($availableSkins);

        if (!$availableSkins._attachedEvents) {
            onDelegate($availableSkins, "click", ".addButton", function(e) {
				attemptedToAddSkin = true;

				const $addButton = e.target;
				const $paperItem = $addButton.closest("paper-item");
				const skin = getSkin(skins, $paperItem);

                function preventPreview() {
					$paperItem.removeAttribute("focused");
					$paperItem.blur();

					e.preventDefault();
					e.stopImmediatePropagation();
                }

				byId("previewSkin")?.remove();

				if ($addButton.classList.contains("selected")) {
					console.log("remove skin: ", skin);
					$addButton.classList.remove("selected");
					$addButton.setAttribute("icon", "add");
					removeSkin(skin);
					skinsSettings.some(function (thisSkin, index) {
						if (skin.id == thisSkin.id) {
							skinsSettings.splice(index, 1);
							return true;
						}
					});

					maybeRemoveBackgroundSkin(skinsSettings);

					storage.set("skins", skinsSettings).then(() => {
						Controller.updateSkinInstalls(skin.id, -1);
					}).catch(error => {
						showError(error);
					});

                    preventPreview();
				} else if (donationClickedFlag) {
                    console.log("add skin");
                    $addButton.classList.add("selected");
                    $addButton.setAttribute("icon", "check");
                    addSkin(skin);
                    skinsSettings.push(skin);
                    storage.set("skins", skinsSettings).then(() => {
                        Controller.updateSkinInstalls(skin.id, 1);
                    }).catch(error => {
                        showError(error);
                    });
				} else {
                    openContributeDialog("skins");
                    preventPreview();
                }
            });

            onDelegate($availableSkins, "click", "paper-item", function(e) {
                const $paperItem = e.target.closest("paper-item");
                // patch to remove highlighed gray
                $paperItem.removeAttribute("focused");
                $paperItem.blur();

                byId("skinWatermark").classList.remove("visible");
                const skin = getSkin(skins, $paperItem);
                console.log("$paperItem", $paperItem);
                addSkin(skin, "previewSkin");
                setSkinDetails($dialog, skin);
                e.preventDefault();
                e.stopPropagation();
            });

            $availableSkins._attachedEvents = true;
        }

		skins.forEach(skin => {
			const paperItem = document.createElement("paper-item");
            paperItem.setAttribute("skin-id", skin.id);
            
			const skinAdded = skinsSettings.some(thisSkin => skin.id == thisSkin.id);
			
			const addButton = document.createElement("paper-icon-button");
			let className = "addButton";
			if (skinAdded) {
				className += " selected";
				addButton.setAttribute("icon", "check");
			} else {
				addButton.setAttribute("icon", "add");
			}
			addButton.setAttribute("class", className);
			addButton.setAttribute("title", "Add it");
			paperItem.appendChild(addButton);

			const textNode = document.createTextNode(skin.name);
			paperItem.appendChild(textNode);

			$availableSkins.appendChild(paperItem);
        });
        
        onClickReplace($dialog.querySelector(".resetSkins"), async function() {
            await storage.remove("skins");
            await storage.remove("customSkin");
            await storage.remove("popup-bg-color");
            await niceAlert(getMessage("reset"));
			location.reload();
		});
		
        onClickReplace($dialog.querySelector(".updateSkins"), async function() {
			skinsSettings.forEach(function(skinSetting) {
				skins.forEach(function(skin) {
					if (skinSetting.id == skin.id) {
						copyObj(skin, skinSetting);
						
						// refresh skin
						addSkin(skin);
					}
				});
			});
			await storage.set("skins", skinsSettings);
			showMessage(getMessage("done"));
		});

        onClickReplace($dialog.querySelector(".customSkin"), async function() {
			byId("previewSkin")?.remove();
			
			const $dialog = initTemplate("customSkinDialogTemplate");

			const customSkin = await storage.get("customSkin");

			$dialog.querySelector("textarea").value = customSkin.css ||= "";
			$dialog.querySelector("#customBackgroundImageUrl").value = customSkin.image;

            onClickReplace($dialog.querySelector(".shareSkin"), function() {
				openUrl("https://jasonsavard.com/forum/categories/checker-plus-for-gmail-feedback?ref=shareSkin");
			});

            onClickReplace($dialog.querySelector(".updateSkin"), async function() {
				byId("customSkin")?.remove();
				addSkin({id:"customSkin", css: $dialog.querySelector("textarea").value, image: $dialog.querySelector("#customBackgroundImageUrl").value});
				if (!await storage.get("donationClicked")) {
					showMessage(getMessage("donationRequired"));
				}
			});
			
			openDialog($dialog).then(async function(response) {
				if (response == "ok") {
					if (donationClickedFlag) {
						customSkin.css = $dialog.querySelector("textarea").value;
						customSkin.image = $dialog.querySelector("#customBackgroundImageUrl").value;
						
						addSkin(customSkin);
						await storage.set("customSkin", customSkin);
					} else {
						$dialog.querySelector("textarea").value = "";
						removeSkin(customSkin);
						if (!donationClickedFlag) {
							showMessage(getMessage("donationRequired"));
						}
					}
					
					$dialog.close();
				}
			});
		});

		openDialog($dialog).then(async response => {
			if (response == "ok") {
				if (byId("previewSkin")) {
					byId("previewSkin").remove();

					maybeRemoveBackgroundSkin(skinsSettings);

					if (!attemptedToAddSkin) {
						openGenericDialog({
							content: "Use the <paper-icon-button style='vertical-align:middle' icon='add'></paper-icon-button> to add skins!"
						}).then(response => {
							if (response == "ok") {
								// make sure next time the skins dialog closes when clicking done
								$dialog.querySelector(".okDialog").setAttribute("dialog-confirm", "true");
							}
						});
						const $addButton = selector("#skinsDialog #availableSkins paper-item.iron-selected .addButton");
						$addButton.addEventListener("transitionend", () => {
							$addButton.classList.toggle("highlight");
						}, {once: true});
						$addButton.classList.toggle("highlight");
					} else {
						$dialog.close();
					}
					
				} else {
					$dialog.close();
				}
			}
		});

		hideLoading();

	}).catch(error => {
		console.error(error);
		showError("There's a problem, try again later or contact the developer!");
	});
}

function getClassForAttendingStatus(status) {
    let className;
    if (status == AttendingResponseStatus.ACCEPTED) {
        className = "going";
    } else if (status == AttendingResponseStatus.TENTATIVE) {
        className = "tentative";
    } else if (status == AttendingResponseStatus.DECLINED) {
        className = "declined";
    } else if (status == AttendingResponseStatus.NEEDS_ACTION) {
        className = "needs-action";
    }
    return className;
}

async function addChip(params) {
	let account = generateAccountStub(email);

    // first time must auto insert the organiser
	if (!selector("#inviteGuestsDialog .chip") && !params.addSelf && !params.skipAddSelf) {
		await addChip({
			$container: 	byId("chips"),
			$inputNode:		byId("addGuestInput"),
			$acSuggestions:	params.$acSuggestions,
			addSelf:		true
		});
	}

    const $chip = document.createElement("div");
    $chip.classList.add("chip", "layout", "horizontal", "center");

    const $attendeePhotoWrapper = document.createElement("div");
    $attendeePhotoWrapper.classList.add("attendee-photo-wrapper");

    const $contactPhoto = document.createElement("iron-image");
    $contactPhoto.classList.add("contactPhoto");
    $contactPhoto.setAttribute("sizing", "cover");
    $contactPhoto.setAttribute("preload", "");
    $contactPhoto.setAttribute("placeholder", '/images/noPhoto.svg');

    const $attendeeStatus = document.createElement("div");
    $attendeeStatus.classList.add("attendee-status");

    $attendeePhotoWrapper.append($contactPhoto, $attendeeStatus);

    const $chipName = document.createElement("span");
    $chipName.classList.add("chipName");

    const $chipDetails = document.createElement("span");
    $chipDetails.classList.add("chipDetails");

    const $removeChip = document.createElement("iron-icon");
    $removeChip.classList.add("removeChip");
    $removeChip.setAttribute("icon", "close");

    $chip.append($attendeePhotoWrapper, $chipName, " ", $chipDetails, " ", $removeChip);

	let chipData = {};

	if (params.attendee) {
		chipData.email = params.attendee.email;
		chipData.name = await getContactDisplayName(params.attendee);
		$chip._attendee = params.attendee;
	} else if (params.addSelf) {
		chipData.email = window.email;
		chipData.name = contactsTokenResponse.name ?? window.email;
		chipData.organizer = true;
		chipData.responseStatus = AttendingResponseStatus.ACCEPTED;
	} else if (params.$acSuggestions && isVisible(params.$acSuggestions) && params.$acSuggestions.querySelector(".selected")) {
		chipData = params.$acSuggestions.querySelector(".selected")._data;
		hide(params.$acSuggestions);
	} else {
		chipData.email = params.$inputNode.value;
	}

	$chip._data = chipData;

	const contactPhotoData = {
		account:	account,
		name:		chipData.name,
		email:		chipData.email,
		alwaysShow:	true
	};
	setContactPhoto(contactPhotoData, $contactPhoto);

	if (params.attendee) {
        const className = getClassForAttendingStatus(params.attendee.responseStatus);
        $attendeeStatus.classList.add(className);
	}

    $chipName.textContent = chipData.name ?? chipData.email;
    $chipName.title = chipData.email;

	if (params.attendee?.organizer) {
		$chipDetails.textContent = getMessage("organiser");
	}

    onClick($removeChip, function () {
		$chip.remove();
		byId("addGuestInput").focus();
	});

	params.$container.append($chip);
    
	if (!params.addSelf && params.$inputNode) {
		params.$inputNode.value = "";
		params.$inputNode.setAttribute("placeholder", "");
	}
}

function showInviteGuestsDialog(event) {
	const account = generateAccountStub(email);

	const $dialog = initTemplate("inviteGuestsDialogTemplate");
    replaceEventListeners($dialog, "iron-overlay-opened", function () {
		if (!$dialog._guestsLoaded) {
			if (event.attendees?.length) {
                const $acSuggestions = selector(".acSuggestions");
                sortAttendees(event);
				asyncForEach(event.attendees, async (attendee) => {
					await addChip({
						$container: 	byId("chips"),
						$inputNode:		byId("addGuestInput"),
						$acSuggestions:	$acSuggestions,
						attendee: 		attendee,
						skipAddSelf: 	true
					});
				});
			}
			$dialog._guestsLoaded = true;
		}

		byId("addGuestInput").focus();
    });
    
    onClickReplace($dialog.querySelector("#refresh-contacts"), async function() {
        showLoading();

        // remove contacts data
        const dataIndex = getContactDataItemIndexByEmail(contactsData, email);
        if (dataIndex != -1) {

            if (contactsData[dataIndex].version == CONTACTS_STORAGE_VERSION) {
                showLoading();
                try {
                    await sendMessageToBG("updateContacts");
                    contactsData = await storage.get("contactsData");
                    byId("inviteGuestsDialog").close();
                    byId("inviteGuests").click();
                } finally {
                    hideLoading();
                }
                return;
            }

            contactsData.splice(dataIndex, 1);
            await storage.set("contactsData", contactsData);
        }

        contactsData = null;

        const event = byId("createEventDialog")._event;
        grantContactPermission(event);
    });

	openDialog($dialog);

	const $fetchContacts = byId("fetchContacts");
    onClickReplace($fetchContacts, function () {
        requestPermission({ email: account.getEmail(), initOAuthContacts: true, useGoogleAccountsSignIn: true });
	});

	var MAX_SUGGESTIONS = 4;
	var MAX_SUGGESTIONS_BY_CLICK = 8;
	var performAutocomplete;
	var suggestions = [];
	var lastSuggestions = [];

	var $acSuggestions = selector(".acSuggestions");
	var contacts = [];

	function addSuggestion(params) {
        const $acItem = document.createElement("div");
        $acItem.classList.add("acItem", "layout", "horizontal", "center");

        const $contactPhoto = document.createElement("iron-image");
        $contactPhoto.classList.add("contactPhoto");
        $contactPhoto.setAttribute("sizing", "cover");
        $contactPhoto.setAttribute("preload", "");
        $contactPhoto.setAttribute("placeholder", '/images/noPhoto.svg');

        const $acName = document.createElement("div");
        $acName.classList.add("acName");
        $acName.textContent = params.name ||= params.email.split("@")[0];

        const $acEmail = document.createElement("div");
        $acEmail.classList.add("acEmail");
        $acEmail.textContent = params.email;

        $acItem.append($contactPhoto, $acName, $acEmail);

		$acItem._data = params;

        $acItem.addEventListener("mouseenter", function() {
            $acSuggestions.querySelector(".selected")?.classList.remove("selected");
            this.classList.add("selected");
        });

        $acItem.addEventListener("mouseleave", function() {
            this.classList.remove("selected");
        })

        onClick($acItem, function() {
            addChip({
                $container: 	byId("chips"),
                $inputNode:		byId("addGuestInput"),
                $acSuggestions: $acSuggestions
            });
            byId("addGuestInput").focus();
        });
		
		params.delay = 1; // I tried 100 before
		setContactPhoto(params, $contactPhoto);
		
		$acSuggestions.append($acItem);
	}

	function showSuggestions() {
		suggestions.forEach(function (suggestion) {
			addSuggestion(suggestion);
		});
		lastSuggestions.forEach(function (suggestion) {
			addSuggestion(suggestion);
		});

		$acSuggestions.querySelector(".acItem")?.classList.add("selected");
		show($acSuggestions);
	}

	function generateSuggestionDataFromContact(account, contact, emailIndex) {
		var email = contact.emails[emailIndex].address;
		var name = contact.name;
		var updated = contact.updatedDate;
		return { account: account, email: email, name: name, updated: updated };
	}

    // prefetch for speed
    cacheContactsData().then(async () => {
        contacts = await getContacts({ account: account });
    });

    const $addGuestInput = byId("addGuestInput");

    $addGuestInput.setAttribute("placeholder", getMessage("guests"));
    onClickReplace($addGuestInput, function(event) {
        suggestions = [];
        emptyNode($acSuggestions);
        contacts.every(function (contact, index) {
            if (index < MAX_SUGGESTIONS_BY_CLICK) {
                for (var b = 0; contact.emails && b < contact.emails.length; b++) {
                    var suggestion = generateSuggestionDataFromContact(account, contact, b);
                    if (contact.emails[b].primary) {
                        suggestions.push(suggestion);
                    }
                }
                return true;
            } else {
                return false;
            }
        });
        showSuggestions();
        event.preventDefault();
        event.stopPropagation();
    });

    replaceEventListeners($addGuestInput, function () {
        setTimeout(function () {
            hide("#fetchContacts");
        }, 200);
    });
    
    replaceEventListeners($addGuestInput, "keydown", function(e) {
        const key = e.key;
        if (key === "Tab" || (key === "Enter" && !e.isComposing)) { // tab/enter
            if (e.target.value) {
                addChip({
                    $container: 	byId("chips"),
                    $inputNode:		e.target,
                    $acSuggestions: $acSuggestions
                });
                e.preventDefault();
                e.stopPropagation();
            }
            performAutocomplete = false;
        } else if (key === "Backspace") {
            /*
            if ($(this).val() == "") {
                $(".chips").find(".chip").last().remove();
                performAutocomplete = false;
            } else {
                performAutocomplete = true;
            }
            */
        } else if (key === "ArrowUp") {
            const $current = $acSuggestions.querySelector(".selected");
            if ($current) {
                const $prev = $current.previousElementSibling;
                if ($prev) {
                    $current.classList.remove("selected");
                    $prev.classList.add("selected");
                }
            }
            performAutocomplete = false;
            e.preventDefault();
            e.stopPropagation();
        } else if (key === "ArrowDown") {
            var $current = $acSuggestions.querySelector(".selected");
            if ($current) {
                const $next = $current.nextElementSibling;
                if ($next) {
                    $current.classList.remove("selected");
                    $next.classList.add("selected");
                }
            }
            performAutocomplete = false;
            e.preventDefault();
            e.stopPropagation();
        } else {
            performAutocomplete = true;
        }
    });

    replaceEventListeners($addGuestInput, "keyup", function(e) {
        if (performAutocomplete) {
            if (contacts.length) {
                suggestions = [];
                lastSuggestions = [];
                emptyNode($acSuggestions);
                if (e.target.value) {
                    var firstnameRegex = new RegExp("^" + e.target.value, "i");
                    var lastnameRegex = new RegExp(" " + e.target.value, "i");
                    var emailRegex = new RegExp("^" + e.target.value, "i");
                    var matchedContacts = 0;
                    for (var a = 0; a < contacts.length; a++) {
                        var contact = contacts[a];
                        var firstnameFound = firstnameRegex.test(contact.name);
                        var lastnameFound;
                        if (!firstnameFound) {
                            lastnameFound = lastnameRegex.test(contact.name);
                        }
                        if (firstnameFound || lastnameFound) {
                            if (contact.emails && contact.emails.length) {
                                //console.log("contact", contact);
                                matchedContacts++;
                                for (var b = 0; b < contact.emails.length; b++) {
                                    var suggestion = generateSuggestionDataFromContact(account, contact, b);
                                    if (contact.emails[b].primary && firstnameFound) {
                                        suggestions.push(suggestion);
                                    } else {
                                        lastSuggestions.push(suggestion);
                                    }
                                }
                            }
                        } else {
                            if (contact.emails && contact.emails.length) {
                                for (var b = 0; b < contact.emails.length; b++) {
                                    if (emailRegex.test(contact.emails[b].address)) {
                                        //console.log("contact email", contact);
                                        matchedContacts++;
                                        var suggestion = generateSuggestionDataFromContact(account, contact, b);
                                        if (contact.emails[b].primary && contact.name) {
                                            suggestions.push(suggestion);
                                        } else {
                                            lastSuggestions.push(suggestion);
                                        }
                                    }
                                }
                            }
                        }

                        if (matchedContacts >= MAX_SUGGESTIONS) {
                            break;
                        }
                    }

                    showSuggestions();
                } else {
                    hide($acSuggestions);
                }
            } else {
                show($fetchContacts);
            }
        }
    });
}

async function setContactPhoto(params, imageNode) {

    function setNoPhoto() {
		imageNode.setAttribute("src", "images/noPhoto.svg");
		imageNode.classList.add("noPhoto");
	}

	// contact photo
	const contactPhoto = await getContactPhoto(params);
    imageNode.setAttribute("setContactPhoto", "true");

    if (params.useNoPhoto && !contactPhoto.realContactPhoto) {
        setNoPhoto();
    } else if (contactPhoto.photoUrl) {
        imageNode.addEventListener("error", function() {
            setNoPhoto();
        });

        // used timeout because it was slowing the popup window from appearing
        setTimeout(function () {
            if (params.alwaysShow || isVisible(imageNode)) {
                imageNode.setAttribute("src", contactPhoto.photoUrl);
            }
        }, params.delay ? params.delay : 20);
    } else {
        if (params.useNoPhoto) {
            setNoPhoto();
        } else {
            var name;
            if (params.name) {
                name = params.name;
            } else if (params.mail) {
                name = params.mail.getName();
            }

            var letterAvatorWord;
            if (name) {
                letterAvatorWord = name;
            } else {
                letterAvatorWord = params.email;
            }
            imageNode.removeAttribute("fade");
            imageNode.setAttribute("src", await letterAvatar(letterAvatorWord));
        }
    }
}

async function letterAvatar(name, color) {
	var colours = ["#1abc9c", "#2ecc71", "#3498db", "#9b59b6", "#34495e", "#16a085", "#27ae60", "#2980b9", "#8e44ad", "#2c3e50", "#f1c40f", "#e67e22", "#e74c3c", "#ecf0f1", "#95a5a6", "#f39c12", "#d35400", "#c0392b", "#bdc3c7", "#7f8c8d"];

	if (!name) {
		name = " ";
	}

	var letter = name.charAt(0).toUpperCase();
	var letterCode = letter.charCodeAt();

	var charIndex = letterCode - 64,
		colourIndex = charIndex % 20;

	var canvas;
	const CANVAS_XY = 256;
	if (typeof OffscreenCanvas != "undefined") {
		canvas = new OffscreenCanvas(CANVAS_XY, CANVAS_XY);
	} else if (typeof document != "undefined") {
		canvas = document.createElement("canvas");
		canvas.width = canvas.height = CANVAS_XY;
	}

	var context = canvas.getContext("2d");

	if (color) {
		context.fillStyle = color;
	} else {
		context.fillStyle = colours[colourIndex];
	}
	context.fillRect(0, 0, canvas.width, canvas.height);
	context.font = "128px Arial";
	context.textAlign = "center";
	context.fillStyle = "#FFF";
	context.fillText(letter, CANVAS_XY / 2, CANVAS_XY / 1.5);

	let dataUrl;
    try {
        dataUrl = await getDataUrl(canvas);
    } catch (error) {
        // refer to https://jasonsavard.com/forum/discussion/6072/error-when-reading-from-canvas-is-disabled
        console.warn("Canvas writing disabled for privacy so returning empty");
        dataUrl = "";
    }
	
	return dataUrl;
}

async function gotoDate(params) {
    const calendarView = await getCalendarView();
    if (calendarView == CalendarView.CUSTOM && /^4$|^5$|^6$/.test(await storage.get("customView")) && await storage.get("jumpToStartOfMonthForNextPrev")) {
        showLoading();
        await sleep(1);
        temporarilyDisableFetching(() => {
            let date;
            if (params.next) {
                date = fullCalendar.getDate();
                date.setMonth(date.getMonth() + 1);
            } else {
                date = params.date;
            }
            fullCalendar.gotoDate(date);
            // temporarily switch over to month view
            fcChangeView(CalendarView.MONTH);
        })
    } else if (calendarView == CalendarView.AGENDA) {
        var start = params.date;
        var end = start.addDays(21);
        
        displayAgendaHeaderDetails(start);
        
        window.autoScrollIntoView = true;
        fetchAgendaEvents({start:start, end:end, forceEmpty:true}).then(function() {
            // do nothing
            //window.autoScrollIntoView = false;
        });
        scrollTarget.scrollTop = 0;
    } else {
        if (params.next) {
            fullCalendar.next();
        } else {
            fullCalendar.gotoDate(params.date);
        }
    }
    calendarShowingCurrentDate = false;
}

function temporarilyDisableFetching(func) {
	// temporarily remove source and re-add it below because fullCalendar("gotoDate") below will fetch events
    window.disableHideLoading = true;
    const thisSource = fullCalendar.getEventSourceById(FULL_CALENDAR_SOURCE_ID); 
	thisSource.remove();

	func();

	window.disableHideLoading = false;
	fullCalendar.addEventSource(source);
}

async function setSelectedCalendars(calendar, arrayOfCalendars, displayThisOnly) {
    const excludedCalendars = await storage.get("excludedCalendars");
    const selectedCalendars = await storage.get("selectedCalendars");
    const desktopNotification = await storage.get("desktopNotification");
						
	if (!selectedCalendars[email]) {
		selectedCalendars[email] = {};
	}

	if (displayThisOnly) {
		arrayOfCalendars.forEach(thisCalendar => {
			let visibleFlag;
			if (calendar.id == thisCalendar.id) {
				visibleFlag = true;
			} else {
				visibleFlag = false;
			}
            selectedCalendars[email][thisCalendar.id] = visibleFlag;

            if (!visibleFlag && isCalendarExcludedForNotifsByOptimization(thisCalendar, excludedCalendars) && !isGadgetCalendar(thisCalendar)) {
                console.info("optimize and remove from cache: " + thisCalendar.id);
                delete cachedFeeds[thisCalendar.id];
            }
		});
	} else {
        selectedCalendars[email][calendar.id] = !isCalendarSelectedInExtension(calendar, email, selectedCalendars);
        
        if (!isCalendarUsedInExtension(calendar, email, selectedCalendars, excludedCalendars, desktopNotification)) {
            console.info("optimize and remove from cache: " + calendar.id);
            delete cachedFeeds[calendar.id];
        }
    }

    await storage.set("cachedFeeds", cachedFeeds);
    
    showLoading();
	storage.set("selectedCalendars", selectedCalendars).then(() => {
        reloadCalendar({
            source: "selectedCalendars",
            refetchEvents: true,
            reInitCachedFeeds: true // used because we might have removed unused calendars above
        });
    });
}

function openGoToDate() {
    const currentDate = fullCalendar.getDate();

    const $dialog = initTemplate("gotoDateDialogTemplate");
    $dialog.querySelectorAll("#gotoDate_month paper-item").forEach(el => {
        el.textContent = dateFormat.i18n.monthNamesShort[el.getAttribute("value")];
    });
    $dialog.querySelector("#gotoDate_month").selected = currentDate.getMonth();
    $dialog.querySelector("#gotoDate_day").selected = currentDate.getDate();
    $dialog.querySelector("#gotoDate_year").selected = currentDate.getFullYear();
    openDialog($dialog).then(response => {
        if (response == "ok") {
            const newDate = new Date($dialog.querySelector("#gotoDate_year").selected, $dialog.querySelector("#gotoDate_month").selected, $dialog.querySelector("#gotoDate_day").selected);
            gotoDate({date: newDate});
        }
    });
}

async function showSearch() {
    await initCalendarDropDown("searchCalendarsTemplate", {selectedCalendarId: "active-calendars"});
    
    emptyNode("#agendaEvents");
    htmlElement.classList.add("searchInputVisible");
    byId("searchInput").focus();
}

async function initVisibleCalendarsList() {
    const selectedCalendars = await storage.get("selectedCalendars");
    const arrayOfCalendars = await getArrayOfCalendars({
        includeTasks: true
    });
    writeableCalendars = getWriteableCalendars(arrayOfCalendars);
    const tasksUserEmails = await oAuthForTasks.getUserEmails();

    emptyNode("#visibleCalendars");
    arrayOfCalendars.forEach(calendar => {
        const calendarName = getCalendarName(calendar);
        
        if (isGadgetCalendar(calendar)) {
            // exclude the weather etc. because i am not integrating it into calendar display
        } else {
            const $checkbox = document.createElement("paper-checkbox");

            const $visibleCalendarLabel = document.createElement("div");
            $visibleCalendarLabel.classList.add("visibleCalendarLabel");
            $visibleCalendarLabel.title = calendarName;
            $visibleCalendarLabel.textContent = calendarName;

            $checkbox.append($visibleCalendarLabel);

            $checkbox._calendar = calendar;
            $checkbox.setAttribute("color-id", calendar.colorId);

            onClick($checkbox, async function(e) {
                console.log("checkbox", e);
                const calendar = e.target.closest("paper-checkbox")._calendar;

                if (calendar.id == TASKS_CALENDAR_OBJECT.id) {
                    if (await storage.firstTime("_tasksWarning")) {
                        await niceAlert(`
                            Due to popular requests I have integrated Google Tasks into this calendar extension to see them in the calendar and get notified on their due date. However, you can only create tasks by adding them to a calendar day.<br>
                            <br>
                            There are Google Tasks API limitations:<br>1) Real-time syncing is not supported for Tasks so the extension must poll every few hours to fetch tasks you may have created outside of the extension or you can simply click the Refresh button<br>2) Developers cannot set or get the specific time of tasks, only the day, so every task will be treated as an all day task. You can star the issue with Google <a target="_blank" href="https://issuetracker.google.com/issues/166896024">here</a>
                        `);
                    }
                    if (await donationClicked("tasks")) {
                        if (tasksUserEmails?.length) {
                            setSelectedCalendars(calendar, arrayOfCalendars);
                        } else {
                            const tokenResponses = await storage.getEncryptedObj("tokenResponses", dateReviver);
                            const tokenResponse = tokenResponses[0];
    
                            await openPermissionsDialog({
                                email: tokenResponse.userEmail,
                                initOAuthTasks: true,
                                useGoogleAccountsSignIn: !tokenResponse.chromeProfile
                            });

                            // we only get here if using synchronous chrome sign in, if using google account sign in then the onmessage GrantPermissionToTasksAndPolledServer
                            postGrantPermissionToTasksAndPolledServer();
                        }
                    } else {
                        this.checked = false;
                    }
                } else {
                    setSelectedCalendars(calendar, arrayOfCalendars);
                }
            });
            
            if (isCalendarSelectedInExtension(calendar, email, selectedCalendars)) {
                if (calendar.id == TASKS_CALENDAR_OBJECT.id) {
                    if (tasksUserEmails?.length) {
                        $checkbox.checked = true;
                    }
                } else {
                    $checkbox.checked = true;
                }
            }
            
            const $displayThisOnly = document.createElement("paper-icon-button");
            $displayThisOnly.classList.add("displayThisCalendarOnly");
            $displayThisOnly.title = getMessage("displayThisOnly");
            $displayThisOnly.setAttribute("icon", "image:remove-red-eye");
            onClick($displayThisOnly, function(e) {
                // remove all
                selectorAll("#visibleCalendars paper-checkbox").forEach(el => {
                    el.checked = false;
                });

                // recheck selected
                const $visibleCalendarCheckbox = this.closest(".visible-calendar").querySelector("paper-checkbox");
                $visibleCalendarCheckbox.checked = true;

                setSelectedCalendars($visibleCalendarCheckbox._calendar, arrayOfCalendars, true);

                e.preventDefault();
                e.stopPropagation();
            });

            const $visibleCalendar = document.createElement("div");
            $visibleCalendar.classList.add("visible-calendar");
            $visibleCalendar.append($checkbox);

            if (calendar.id == TASKS_CALENDAR_OBJECT.id) {
                const $changeColor = document.createElement("paper-swatch-picker");
                $changeColor.id = "task-color-picker";
                $visibleCalendar.append($changeColor);
                setTimeout(async () => {
                    $changeColor.setAttribute("color", "gray");
                    replaceEventListeners($changeColor, "color-changed", async e => {
                        showSaving();
                        const color = e.detail.value;
                        await storage.set("tasks-bg-color", color);
                        byId("drawerPanel").toggle();
                        await initTasksColor();
                        initCalendarColorsInCSS(arrayOfCalendars);
                        await sendMessageToBG("resetInitMiscWindowVars");
                        await reloadCalendar({
                            source: "changed-task-color",
                            //bypassCache: true,
                            refetchEvents: true
                        });
                        setTimeout(() => {
                            initVisibleCalendarsList();
                        }, 1000);
                        hideSaving();
                    });
                }, 1000);
            }

            $visibleCalendar.append($displayThisOnly);
            
            byId("visibleCalendars").append($visibleCalendar);
        }
    });
}

function initCalendarColorsInCSS(arrayOfCalendars) {
    const calendarColorsCSS = generateCalendarColors(cachedFeeds, arrayOfCalendars);
    pageVisible.then(() => {
        const ID = "calendarColors";
        removeNode(ID);

        const $customStyle = document.createElement("custom-style");
        $customStyle.id = ID;

        const $style = document.createElement('style');
        $style.setAttribute('type', 'text/css');
        $style.appendChild(document.createTextNode(calendarColorsCSS));

        $customStyle.append($style);

        (document.getElementsByTagName('head')[0] || document.documentElement).appendChild($customStyle);
    });
}

async function init() {

    let calendarView = await getCalendarView();
    initCalendarView(calendarView);

    await storage.iniStorageCache();

    pageVisible.then(async () => {
        await docReady();
        const skins = await storage.get("skins");
        skins.forEach(skin => {
            addSkin(skin);
        });
        addSkin(await storage.get("customSkin"));
    });

    await getBGObjects();
    await docReady();

    let fcLocale = locale.toLowerCase();
    if (fcLocale == "pt-pt") {
        fcLocale = "pt";
    }

    if (fcLocale != "en") {
        insertScript(`fullcalendar/locales/${fcLocale}.js`).catch(error => {});
    }

    // check again after body loaded to see if too narrow
    let calendarViewAgain = await getCalendarView();
    if (calendarView != calendarViewAgain) {
        calendarView = calendarViewAgain;
        initCalendarView(calendarView);
    }

    const arrayOfCalendars = await getArrayOfCalendars();
    
    htmlElement.lang = locale;

    if (DetectClient.isFirefox()) {
        onDelegate(document.body, "click", "a[target]", function(e) {
            openUrl(e.target.href);
            e.preventDefault();
            e.stopPropagation();
        });
    }

    oAuthForDevices.findTokenResponse({userEmail:email}).then(async tokenResponse => {
        if (tokenResponse) {
            if ((await getInstallDate()).isToday() && await storage.firstTime("changeViewGuide")) {
                openGenericDialog({
                    content: getMessage("useTheXToChangeViews", "<paper-icon-button style='vertical-align:middle' icon='more-vert'></paper-icon-button>")
                });
            }
            byId("bigAddEventButtonWrapper").classList.add("visible");
        } else {
            hide("app-drawer-layout");
            //$("#bigAddEventButtonWrapper").hide();
            
            if (DetectClient.isFirefox()) {
                polymerPromise.then(() => {
                    showError(getMessage("accessNotGrantedSeeAccountOptions", ["", getMessage("accessNotGrantedSeeAccountOptions_accounts")]), {
                        text: getMessage("accounts"),
                        onClick: function () {
                            openUrl("options.html?accessNotGranted=true#accounts");
                        }
                    });
                });
            } else {
                openPermissionsDialog().then(() => {
                    // nothing
                });
            }

            var tokenResponsesInterval = setInterval(async () => {
                const tokenResponses = await storage.getEncryptedObj("tokenResponses", dateReviver);
                if (tokenResponses?.length) {
                    clearInterval(tokenResponsesInterval);
                    
                    //showMessage(getMessage("loading"));
                    showLoading();
                    // wait another 2 seconds for polling to happen
                    setTimeout(async () => {
                        await storage.disable("loggedOut");
                        location.reload();
                    }, seconds(2))
                }
            }, seconds(5));
        }
    });    

    polymerPromise.then(async () => {
        
        if (isDetached && await storage.firstTime("popoutMessage") && !fromGrantedAccess) {
            polymerPromise2.then(() => {
                const $dialog = initTemplate("popoutDialogTemplate");
                openDialog($dialog).then(response => {
                    if (response == "ok") {
                        // nothing
                    } else if (response == "other") {
                        openUrl("https://jasonsavard.com/wiki/Popout?ref=calendarPopoutDialog");
                        $dialog.close();
                    }
                });
            });
        }
        
        onClick("#title, #menu, #closeDrawer", async () => {
            byId("drawerPanel").toggle();

            const $miniCalendar = byId("miniCalendar");
            
            if (!$miniCalendar.classList.contains("loaded")) {
                const params = await generateFullCalendarParams();
                params.dateClick = function (dateClickInfo) {
                    gotoDate({date: dateClickInfo.date});
                    byId("drawerPanel").toggle();
                }
                const miniCalendar = new FullCalendar.Calendar($miniCalendar, params);
                miniCalendar.render();

                formatMiniFullCalendar($miniCalendar);

                $miniCalendar.classList.add("loaded");
            }
        });

        initVisibleCalendarsList();
        
        if (await isDND()) {
            polymerPromise2.then(function() {
                showMessage(getMessage("DNDisEnabled"), {
                    text: getMessage("turnOff"),
                    onClick: function() {
                        sendMessageToBG("setDND_off");
                        hideMessage();
                    }
                });
            });
        }
    }).catch(error => {
        showLoadingError(error);
    });
    
    initCalendarColorsInCSS(arrayOfCalendars);

    if (openingSite) {
        return;
    } else {
        show(document.body);
    }

    if (inWidget) {
        htmlElement.classList.add("widget");
    }

    if (fromToolbar) {
        htmlElement.classList.add("fromToolbar");
    }
    
    var issueFixed = new Date(2014, 5, 29, 23);
    var maxDateToKeepNotice = issueFixed.addDays(5);
    // localStorage value was used for yay fixed issue "_quotaIssueDismissed"
    if (new Date().isBefore(maxDateToKeepNotice)) {
        if (!await storage.get("_quotaIssueDismissed") && (await getInstallDate()).isBefore(issueFixed)) {
            show("#notice");
            onClick("#dismissNotice", function() {
                storage.setDate("_quotaIssueDismissed");
                slideUp("#notice");
            });
        }
    } else {
        storage.remove("_quotaIssueDismissed");
    }
    
    var msgKey;
    if (Math.random() * 5 < 3) {
        msgKey = "quickAddDefaultText";
    } else {
        msgKey = "quickAddTitle";
    }
    byId("quickAdd").setAttribute("placeholder", getMessage(msgKey));

    if (await storage.get("dimPastEvents")) {
        byId("betaCalendar").classList.add("dim-past-events");
    }
    if (await storage.get("highlightWeekends")) {
        byId("betaCalendar").classList.add("highlightWeekends");
    }
    
    if (await storage.get("removeShareLinks") || calendarView == CalendarView.AGENDA) {
        // hide actual share button
        const shareButtons = selectorAll(".share-button");
        shareButtons.forEach(el => el.closest("paper-menu-button")?.remove());
        // hide share button (placeholder)
        removeAllNodes(shareButtons);
    }
    
    const loggedOut = await storage.get("loggedOut");
    console.log("logout state: " + loggedOut);
    if (typeof loggedOut === "undefined" || loggedOut) { // !loggedOut  - commented because issue occured when invalid creditials
        if (await oAuthForDevices.findTokenResponse({userEmail:email})) {
            showCalendarError("401");
        }
    } else if (!isOnline() && arrayOfCalendars.length == 0) {
        showError(getMessage("yourOffline"));
    } else if (arrayOfCalendars.length == 0) { // could be async issue after returning from authorization flow
        showError("Could not load calendars, try granting access again.");
    } else {
        show("#wrapper");
        hide("#calendarWrapper");
        
        const endDateAfterThisMonth = await getEndDateAfterThisMonth();
        const showEventIcons = await storage.get("showEventIcons");
        
        source = {
            id: FULL_CALENDAR_SOURCE_ID,
            events: function(fetchInfo, successCallback, failureCallback) {
                console.log("source.events");

                console.time("getEvents");
                getEventsWrapper().then(events => {
                    console.timeEnd("getEvents");
                    console.log("requested start/stop: " + events.length + " start: " + fetchInfo.start + " end: " + fetchInfo.end, fetchInfo);
                    console.log("current events: " + getStartDateBeforeThisMonth() + " " + endDateAfterThisMonth);
                    
                    fetchEvents(events, fetchInfo.start, fetchInfo.end).then(async allEvents => {
                        if (allEvents) {
                            //hideLoading();
                            
                            if (await storage.get("showSnoozedEvents")) {
                                console.time("showSnoozedEvents");
                                // includes snoozes
                                console.time("getfutureSnooze")
                                const futureSnoozes = await getFutureSnoozes(await getSnoozers(events), {
                                    includeAlreadyShown: true,
                                    excludeToday: true,
                                    email: await storage.get("email")
                                });
                                console.timeEnd("getfutureSnooze")
                                console.log("future snoozes", futureSnoozes);
                                allEvents = allEvents.concat(futureSnoozes);
                                console.timeEnd("showSnoozedEvents");
                            }
    
                            console.time("convertAllEventsToFullCalendarEvents");
                            var fcEvents = await convertAllEventsToFullCalendarEvents(allEvents);
                            console.timeEnd("convertAllEventsToFullCalendarEvents");
                            
                            //fcEvents = fcEvents.slice(-2);
                            successCallback(fcEvents);
                            if (!window.disableHideLoading) {
                                hideLoading();
                            }
                        }
                    });                    
                });
            }
        };

        let eventTimeFormat;
        let slotLabelFormat;
        
        if (twentyFourHour) {
            slotLabelFormat = eventTimeFormat = {
                hourCycle: getHourCycle(),
                hour: "numeric",
                minute: "numeric",
            }
        } else {
            slotLabelFormat = eventTimeFormat = {
                hourCycle: getHourCycle(),
                hour: "numeric",
                minute: "2-digit",
                omitZeroMinute: /de|zh/.test(locale) ? false : true, // patch for 1 Uhr being displayed
                meridiem: 'narrow',
            }
        }
        
        const calendarSettings = await storage.get("calendarSettings");
        
        var minTime;
        var maxTime;
        
        try {
            minTime = (await storage.get("hideMorningHoursBefore")).parseTime().format("HH:MM:00");
            var hideNightHoursAfter = await storage.get("hideNightHoursAfter");
            if (hideNightHoursAfter == "24") {
                hideNightHoursAfter = "23:59";
            }
            maxTime = hideNightHoursAfter.parseTime().format("HH:MM:00");
        } catch (e) {
            logError("could not parse 'hide morning' hours: " + e);
        }
        
        polymerPromise.then(async () => {
            if (calendarView == CalendarView.AGENDA) {
                initAgenda();
                hideLoading();
            } else {
                const views = {
                    day: {
                        dayHeaderFormat: {
                            weekday: 'long',
                            day: 'numeric',
                        },
                    },
                    week: {
                        dayHeaderFormat: {
                            weekday: 'short',
                            day: 'numeric',
                        },
                    },
                    customListWeek: {
                        type: 'list',
                        listDayFormat: {
                            weekday: 'long',
                            month: 'long',
                            day: 'numeric'
                        },
                        duration: {
                            weeks: LIST_VIEW_WEEKS
                        }
                    },
                }

                const customView = await storage.get("customView");
                if (isCustomViewInDays(customView)) {
                    views.custom = {
                        type: 'timeGridWeek',
                        duration: {
                            days: parseInt(await getValueFromCustomView())
                        },
                    }
                } else {
                    views.custom = {
                        type: 'dayGrid',
                        duration: {
                            weeks: parseInt(await storage.get("customView"))
                        }
                    }
                }
                
                const dimPastEvents = await storage.get("dimPastEvents");

                const showDayOfYear = await storage.get("showDayOfYear");

                const fullCalendarParams = {
                    locale: locale,
                    views: views,
                    initialView: getFCViewName(calendarView),
                    eventTimeFormat: eventTimeFormat,
                    nowIndicator: true,
                    headerToolbar: false,
                    handleWindowResize: ffPatchForResizeAndMorePopoutDisappearing ? false : true,
                    eventMinHeight: 20,
                    eventOrder: ["-allDay", "start", "-duration", function(a, b) {
                        var aCalendar = getEventCalendar(a.extendedProps.jEvent);
                        var bCalendar = getEventCalendar(b.extendedProps.jEvent);
                        if (aCalendar.primary && !bCalendar.primary) {
                            return -1;
                        } else if (!aCalendar.primary && bCalendar.primary) {
                            return +1;
                        } else {
                            let aCalendarName = getCalendarName(aCalendar);
                            let bCalendarName = getCalendarName(bCalendar);
                            if (aCalendarName == bCalendarName) {
                                return a.title.localeCompare(b.title);
                            } else {
                                if (aCalendar.id == TASKS_CALENDAR_OBJECT.id && bCalendar.id != TASKS_CALENDAR_OBJECT.id) {
                                    return -1;
                                } else if (aCalendar.id != TASKS_CALENDAR_OBJECT.id && bCalendar.id == TASKS_CALENDAR_OBJECT.id) {
                                    return +1;
                                } else if (aCalendarName) {
                                    return aCalendarName.localeCompare(bCalendarName);
                                }
                            }
                        }
                    }],
                    slotLabelFormat: slotLabelFormat,
                    fixedWeekCount: await storage.get("weeksInMonth") == "auto" || (calendarView == CalendarView.CUSTOM && isCustomViewInWeeks(customView)) ? false : true,
                    height: calculateCalendarHeight(),
                    eventMaxStack: await storage.get("maxEventsToStack"),
                    dayMaxEventRows: true,
                    slotDuration: "00:" + await storage.get("slotDuration") + ":00",
                    //snapDuration: "00:60:00",
                    defaultTimedEventDuration: "00:30:00",
                    weekends: !calendarSettings.hideWeekends,
                    selectable: true,
                    select: function(info) { // start, end, jsEvent, view
                        console.log("select", info);
                        // prevent double click
                        if (!window.recentlySelected) {
                            window.recentlySelected = new Date();
                            setTimeout(function() {
                                window.recentlySelected = null;									
                            }, 500);

                            console.log("local: ", info);
                            console.log("start date: ", info.start);

                            if (info.jsEvent.target.classList.contains("fc-daygrid-day-number")) {
                                fullCalendar.changeView('timeGridDay', info.start);
                            } else {
                                // patch because fc was set exclusive end date meaning if select only today the end date is tomorrow - so let's subtract 1 day
                                if (info.allDay && (info.end.getTime() - info.start.getTime() <= ONE_DAY)) { // means: all day and one day selection only (note: on DST day itself it seems i had to use <= ONE_DAY in the case of a rolling clock back 1 hour)
                                    const event = {startTime:info.start, allDay:info.allDay};
                                    showCreateBubble({event:event, jsEvent:info.jsEvent});
                                } else {
                                    const event = {startTime:info.start, endTime:info.end, allDay:info.allDay};
                                    showCreateBubble({event:event, jsEvent:info.jsEvent});
                                }
                            }
                        }
                    },
                    editable: true,
                    allDayContent: getMessage("allDayText"),
                    scrollTime: (new Date().getHours()-1) + ':00:00',
                    slotMinTime: minTime,
                    slotMaxTime: maxTime,
                    direction: getMessage("dir"),
                    weekNumbers: await storage.get("showWeekNumbers"),
                    datesSet: function(info) {
                        setTimeout(() => {
                            document.getElementById("calendarTitle").textContent = info.view.title;
                        }, 1);
                    },
                    dayCellDidMount: function(info) {
                        if (showDayOfYear) {
                            const a = document.createElement("a");
                            const text = document.createTextNode(info.date.getDayOfYear());
                            a.appendChild(text);
                            a.setAttribute("class", "day-of-year");

                            const top = info.el.querySelector(".fc-daygrid-day-top");
                            if (top) { // only do this for month view
                                top.classList.add("day-of-year-top");
                                top.append(a);
                            }
                        }
                    },
                    eventClassNames: function(info) {
                        const fcEvent = info.event;
                        const jEvent = fcEvent.extendedProps.jEvent;

                        const classNames = [];

                        if (fcEvent.extendedProps.isSnoozer) {
                            classNames.push("snoozedEvent");
                        } else if (jEvent.kind == TASKS_KIND) {
                            classNames.push("task");

                            if (jEvent.status == TaskStatus.COMPLETED) {
                                classNames.push("task-completed");
                            }
                        }

                        if (fcEvent.end?.isBefore()) {
                            if (dimPastEvents) {
                                classNames.push("pastEvent");
                            }
                        }

                        if (fcEvent.extendedProps.isDeclined) {
                            classNames.push("fcDeclinedEvent");
                        }

                        let needsAction;
                        jEvent.attendees?.some(attendee => {
                            if (attendee.email == email) {
                                if (attendee.responseStatus == AttendingResponseStatus.NEEDS_ACTION) {
                                    needsAction = true;
                                }
                                return true;
                            }
                        });
                        if (needsAction) {
                            classNames.push("needs-action");
                        }

                        return classNames;
                    },
                    eventDidMount: function(info) {
                        var calendar;
                        const fcEvent = info.event;
                        const element = info.el;
                        const jEvent = fcEvent.extendedProps.jEvent;

                        if (jEvent) {
                            calendar = getEventCalendar(jEvent);
                        }
                        
                        element.addEventListener('dblclick', function() {
                            if (isCalendarWriteable(calendar)) {
                                setTimeout(function () {
                                    byId("clickedEventDialog").close();
                                }, 500);
                                showCreateBubble({ event: jEvent, editing: true });
                            }
                        });
                        
                        let title;
                        if (fcEvent.extendedProps.isSnoozer) {
                            title = `${fcEvent.title} (snoozed)`;
                        } else if (jEvent.kind == TASKS_KIND) {
                            title = fcEvent.title;
                        } else {
                            title = fcEvent.title;
                        }
                        element.setAttribute("title", title);

                        // test for jEvent because when doing a drag & drop to creat an event in day view the jEvent does not exist.
                        if (jEvent) {
                            element.setAttribute("calendar", getCalendarName(calendar));

                            if (info.view.type == getFCViewName(CalendarView.DAY) && showEventIcons) {
                                const $eventIcon = document.createElement("span");
                                $eventIcon.classList.add("eventIcon");
                                if (setEventIcon({
                                        event: jEvent,
                                        $eventIcon: $eventIcon,
                                        cachedFeeds: cachedFeeds,
                                        arrayOfCalendars: arrayOfCalendars
                                    })) {
                                    element.querySelector(".fc-event-title").prepend($eventIcon);
                                }
                            }

                            if (window.matchFontColorWithEventColor && (info.view.type == getFCViewName(CalendarView.MONTH) || (info.view.type == getFCViewName(CalendarView.CUSTOM) && isCustomViewInWeeks(customView)))) {
                                if (!fcEvent.allDay && (!fcEvent.end || fcEvent.start.isSameDay(fcEvent.end))) {
                                    if (jEvent) {
                                        element.style.color = darkenColor(calendar.backgroundColor);
                                        //if (jEvent.colorId && colors) {
                                            //const color = colors.event[jEvent.colorId].background;
                                            //$(element).find(".fc-time").before("<span class='eventColorIndicator' style='background-color:" + color + "'>&nbsp;</span>");
                                        //}
                                    }
                                }
                            }
                        }
                    },
                    eventClick: function(info) {
                        console.log("eventClick", info);
                        showDetailsBubble({event:info.event.extendedProps.jEvent, calEvent:info.event, jsEvent:info.jsEvent});
                        // prevents href or url from clicked which caused issue in widget - more info: http://fullcalendar.io/docs/mouse/eventClick/
                        info.jsEvent.preventDefault();
                    },
                    eventDrop: async function(info) {
                        const fcEvent = info.event;
                        const jEvent = fcEvent.extendedProps.jEvent;
                        
                        if (fcEvent.extendedProps.isSnoozer) {
                            // do nothing seems to work because of rereence
                            console.log("snooze dropped");
                            
                            const snoozers = await getSnoozers();
                            snoozers.some(snoozer => {
                                if (snoozer.event.id == jEvent.id) {
                                    snoozer.time = fcEvent.start;
                                    chrome.runtime.sendMessage({command:"updateSnoozer", eventId:snoozer.event.id, time:fcEvent.start.toJSON()}, function() {});
                                    return true;
                                }
                            });
                        } else {
                            const eventEntry = deepClone(jEvent);

                            if (isCtrlPressed(info.jsEvent)) {
                                // copy event
                                info.revert();
                                
                                eventEntry.quickAdd = false;
                                eventEntry.startTime = fcEvent.start; // new Date(eventEntry.startTime.getTime() + info.delta.getTime());
                                if (eventEntry.endTime) {
                                    eventEntry.endTime = fcEvent.end; // new Date(eventEntry.endTime.getTime() + info.delta.getTime());
                                }
                                
                                insertAndLoadInCalendar(eventEntry).catch(error => {
                                    // do nothing already caught inside
                                });
                            } else {
                                eventEntry.allDay = fcEvent.allDay;
                                eventEntry.startTime = fcEvent.start;
                                eventEntry.endTime = fcEvent.end;
                                
                                ensureSendNotificationDialog({ event: jEvent, action: SendNotificationsAction.EDIT }).then(response => {
                                    if (response.cancel) {
                                        info.revert();
                                    } else {
                                        showSaving();

                                        const updateEventParams = {
                                            eventEntry: eventEntry,
                                            event: jEvent
                                        };
                                        updateEventParams.eventEntry.sendNotifications = response.sendNotifications;

                                        updateEvent(updateEventParams).then(async response => {
                                            if (response.cancel) {
                                                info.revert();
                                            } else {
                                                if (eventEntry.recurringEventId) {
                                                    reloadCalendar({
                                                        source: "recurringEventDragDrop",
                                                        bypassCache: true,
                                                        refetchEvents: true
                                                    });
                                                } else if (eventEntry.kind == TASKS_KIND) {
                                                    console.log("update task event", jEvent);
                                                    await updateCachedFeed(jEvent, {
                                                        operation: "update",
                                                    });
                                                } else {
                                                    reloadCalendar({
                                                        source: "dragDrop"
                                                    });
                                                }
                                                hideSaving();
                                                await sleep(500);
                                                setStatusMessage({ message: getMessage("eventUpdated") });
                                            }
                                        }).catch(error => {
                                            showCalendarError(error);
                                            info.revert();
                                        });
                                    }
                                });
                            }
                        }
                    },
                    eventResize: function(info) {
                        const fcEvent = info.event;
                        const jEvent = fcEvent.extendedProps.jEvent;

                        const eventEntry = {
                            allDay:		fcEvent.allDay,
                            startTime:	fcEvent.start,
                            endTime:	fcEvent.end,
                        };
                        
                        ensureSendNotificationDialog({
                            event: jEvent,
                            action: SendNotificationsAction.EDIT
                        }).then(response => {
                            if (response.cancel) {
                                info.revert();
                            } else {
                                const updateEventParams = {
                                    eventEntry: eventEntry,
                                    event: jEvent
                                };
                                updateEventParams.eventEntry.sendNotifications = response.sendNotifications;

                                updateEvent(updateEventParams).then(async response => {
                                    if (response.cancel) {
                                        info.revert();
                                    } else {
                                        reloadCalendar({ source: "eventResize" });
                                        await sleep(500);
                                        setStatusMessage({ message: getMessage("eventUpdated") });
                                    }
                                }).catch(error => {
                                    showCalendarError(error);
                                    info.revert();
                                });
                            }
                        });
                    },
                }

                const defaultDate = await storage.get("defaultDate")
                if (calendarView == CalendarView.CUSTOM && defaultDate) {
                    fullCalendarParams.initialDate = today().addDays(defaultDate);
                }

                let firstDay;
                if (calendarView == CalendarView.LIST_WEEK) {
                    firstDay = new Date().getDay();
                } else if (calendarView == CalendarView.CUSTOM && await storage.get("firstDay") != "") { // && isCustomViewInDays(customView))
                    firstDay = new Date().addDays(await storage.get("firstDay")).getDay();
                } else {
                    firstDay = calendarSettings.weekStart;
                }

                if (firstDay != undefined) { // must check or else got an error with fullcalendar
                    fullCalendarParams.firstDay = parseInt(firstDay);
                }


                const fullCalendarDiv = document.getElementById("betaCalendar");
                fullCalendar = new FullCalendar.Calendar(fullCalendarDiv, fullCalendarParams);
                fullCalendar.addEventSource(source);
                fullCalendar.render();

                // click day header to go to that day's view
                onClick(fullCalendarDiv, function(e) {
                    if (e.target.matches(".fc-timeGridWeek-view") || e.target.matches(".fc-col-header-cell.fc-day")) {
                        const date = this.getAttribute("data-date");
                        if (date) {
                            fullCalendar.changeView('timeGridDay', date);
                        }
                    }
                });

                addEventListeners("#betaCalendar", "mousedown", function(e) {
                    if (e.buttons == 1 && isCtrlPressed(e)) {
                        openGenericDialog({
                            content: "To copy an event drag first then hold Ctrl"
                        });
                    }
                });

                show("#betaCalendar");
            }
        }).catch(error => {
            showLoadingError(error);
        });

        onClick("#prev", function() {
            fullCalendar.prev();
            calendarShowingCurrentDate = false;
        });

        onClick("#next", function() {
            gotoDate({next:true});
        });
        
        onClick("#calendarTitle, #calendarTitleDropdown", async () => {
            const calendarView = await getCalendarView();
            if (calendarView == CalendarView.AGENDA) {

                let miniCalendar;
                
                if (!byId("datepicker").classList.contains("hasDatepicker")) {
                    const params = await generateFullCalendarParams();
                    params.dateClick = function (dateClickInfo) {
                        const eventEntry = {};
                        eventEntry.allDay = true;
                        eventEntry.startTime = dateClickInfo.date;
                        chrome.runtime.sendMessage({command:"generateActionLink", eventEntry:eventEntry}, function(response) {
                            showCreateBubble({event:eventEntry});
                        });
                    },
                    params.datesSet = function(info) {
                        if (globalThis.agendaDataPicker_datesSet_triggered) {
                            const date = new Date(info.start.getFullYear(), info.start.getMonth() + 1, 1);
                            gotoDate({date: date});
                        }
                        globalThis.agendaDataPicker_datesSet_triggered = true;
                    }

                    miniCalendar = new FullCalendar.Calendar(byId("datepicker"), params);
                }
                
                if (isVisible("#datepickerWrapper")) {
                    document.body.classList.remove("datePickerVisible");
                    hide("#datepickerToolbar");
                    hide("#datepickerWrapper");
                } else {
                    document.body.classList.add("datePickerVisible");
                    show("#datepickerToolbar");
                    fadeIn("#datepickerWrapper");
                    miniCalendar.render();

                    formatMiniFullCalendar(byId("datepicker"));
                }
                selector("app-drawer-layout").notifyResize();
                
            } else {
                if (calendarShowingCurrentDate) {
                    openGoToDate();
                } else {
                    temporarilyDisableFetching(() => {
                        fcChangeView(calendarView);
                    });

                    fullCalendar.today();
                    calendarShowingCurrentDate = true;
                }
            }
        });

        if (!isOnline()) {
            showError(getMessage("yourOffline"));
        }
    }
    
    onClick(".skins", function() {
        showSkinsDialog();
    });
    
    onClick(".options", function() {
        openOptions();
    });

    onClick(".contribute", function() {
        openContribute();
    });

    onClick(".help", function() {
        openHelp();
    });
    
    onClick("#goToToday", function() {
        const $today = selector(".today");
        if ($today) {
            $today.scrollIntoView();
            byId("drawerPanel").scrollIntoView();
        } else {
            gotoDate({date: today()});
        }
    });

    onClick("#showSearch", function() {
        showSearch();
    });
    
    onClick("#search", function() {
        searchEvents();
    });
    
    addEventListeners("#searchInput", "keydown", function(e) {
        // enter pressed
        if (e.key === "Enter" && !e.isComposing) {
            searchEvents();
        }
    });
    
    onClick("#back", async () => {
        htmlElement.classList.remove("searchInputVisible");
        
        if (await getCalendarView() == CalendarView.AGENDA) {
            initAgenda();
        } else {
            // patch: because a top margin would appear and create vertical scrollbars??
            fullCalendar.refetchEvents();
        }
    });

    onClick("#refresh", async function() {
        showSaving();

        const params = {
            source:	"refresh",
            bypassCache: true,
            refetchEvents: true
        };

        // double click
        if (window.lastRefresh && Date.now() - window.lastRefresh.getTime() <= 800) {
            params.skipSync = true;
        }

        await reloadCalendar(params);
        initVisibleCalendarsList();

        window.lastRefresh = new Date();

        hideSaving();
    });

    onClick(".close", function() {
        window.close();
    });

    async function openFBPermissionDialog(eventID) {
        if (!await storage.get("respondedNoToFBPermission")) {
            polymerPromise2.then(() => {
                const $dialog = initTemplate("fbPermissionOverlayTemplate");
                onClick($dialog.querySelector(".ok"), () => {
    
                    let url = "popup.html";
                    if (eventID) {
                        url = setUrlParam(url, "fb-event-id", eventID);
                    }
    
                    // patch: FF cannot request permission fromToolbar popup window, so must open detached popup and redo this
                    if (DetectClient.isFirefox() && fromToolbar) {
                        url = setUrlParam(url, "open-fb-permissions", "true");
                        openWindowInCenter(url, '', 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes', 800, 600);
                    } else {
                        chrome.permissions.request({
                            origins: [Origins.FACEBOOK]
                        }, function(granted) {
                            if (granted) {
                                location.href = url;
                            }
                        });
                    }
                });

                onClick($dialog.querySelector(".cancel"), () => {
                    storage.setDate("respondedNoToFBPermission");
                });

                onClick($dialog.querySelector(".fb-other"), () => {
                    openUrl("https://jasonsavard.com/wiki/Adding_Facebook_events_to_Google_Calendar");
                });

                openDialog($dialog);
            });
        }
    }

    let fbEventId = getUrlValue(location.href, "fb-event-id");

    if (location.href.includes("open-fb-permissions=true")) {
        openFBPermissionDialog(fbEventId);
    } else {
        if (!fbEventId) {
            const tab = await getActiveTab();
            if (tab && tab.url) {
                const matches = tab.url.match(/facebook\.com\/events\/(\d*)/i); 
                if (matches) {
                    fbEventId = matches[1];
                }
            }
        }

        if (fbEventId) {
            const fbEventUrl = `https://www.facebook.com/ical/event.php?eid=${fbEventId}`;
            if (DetectClient.isFirefox()) {
                if (chrome.permissions) {
                    chrome.permissions.contains({
                        origins: [Origins.FACEBOOK]
                    }, function(result) {
                        if (result) {
                            fetchAndDisplayEvent(fbEventUrl);
                        } else {
                            openFBPermissionDialog(fbEventId);
                        }
                    });
                }
            } else {
                fetchAndDisplayEvent(fbEventUrl);
            }
        }
    }
    
    onClick(".share-button", function() {
        storage.enable("followMeClicked");
        //var $shareMenu = initTemplate("shareMenuTemplate");
        
        onClick("#share-menu paper-item", function() {
            const value = this.id;
            sendGA('shareMenu', value);
            
            if (value == "facebook") {
                openUrl("https://www.facebook.com/thegreenprogrammer");
            } else if (value == "twitter") {
                openUrl("https://twitter.com/JasonSavard");
            } else if (value == "linkedin") {
                openUrl("https://www.linkedin.com/in/jasonsavard");
            } else if (value == "email-subscription") {
                openUrl("https://jasonsavard.com/blog/?show-email-subscription=true");
            }
        });
    }, null, {once: true});
    
    onClick("#quickAddGoBack", function() {
        htmlElement.classList.remove("quickAddVisible");
    });

    addEventListeners("#quickAdd", "keydown", function(e) {
        byId("quickAddWrapper").classList.add("inputEntered");

        // enter pressed
        if (e.key === "Enter" && !e.isComposing) {
            saveQuickAdd();
        }
    });

    addEventListeners("#quickAdd", "paste", function() {
        byId("quickAddWrapper").classList.add("inputEntered");
    });

    addEventListeners("#quickAdd", "blur", function(e) {
        console.log("blur", e)
        const $quickAddWrapper = e.relatedTarget?.closest("#quickAddWrapper");
        if ($quickAddWrapper || byId("quickAdd").value) {
            // do nothing
        } else {
            htmlElement.classList.remove("quickAddVisible");
        }
    });

    const notificationsOpened = await storage.get("notificationsOpened");
    if (notificationsOpened.length) {
        byId("pendingNotifications").style.display = "inline-block";
    } else {

        if (await daysElapsedSinceFirstInstalled() >= UserNoticeSchedule.DAYS_BEFORE_SHOWING_FOLLOW_ME && !await storage.get("followMeClicked")) {
            let expired = false;
            const followMeShownDate = await storage.get("followMeShownDate");
            if (followMeShownDate) {
                if (followMeShownDate.diffInDays() <= -UserNoticeSchedule.DURATION_FOR_SHOWING_FOLLOW_ME) {
                    expired = true;
                }
            } else {
                storage.setDate("followMeShownDate");
            }
            if (!expired) {
                selector(".share-button-real .share-button")?.classList.add("swing");
            }
        }
    }
    
    onClick("#pendingNotifications", function() {
        openReminders().then(() => {
            closeWindow();
        });
    });
    
    // need polyer promise because .show() was NOT working before outer paper-toolip was initialized
    polymerPromise.then(async () => {
        const $newsNotification = byId("newsNotification");
        const $newsNotificationReducedDonationMessage = byId("newsNotificationReducedDonationMessage")

        if (await shouldShowExtraFeature()) {
            $newsNotification.setAttribute("icon", "myIcons:theme");
            onClick($newsNotification, () => {
                showSkinsDialog();
            });
            show($newsNotification);
            $newsNotificationReducedDonationMessage.textContent = getMessage("addSkinsOrThemes");
            show($newsNotificationReducedDonationMessage);
        } else if (await shouldShowReducedDonationMsg(true)) {
            onClick($newsNotification, () => {
                openUrl("contribute.html?ref=reducedDonationFromPopup");
            });
            show($newsNotification);
            show($newsNotificationReducedDonationMessage);
        } else if (!await storage.get("tryMyOtherExtensionsClicked") && await daysElapsedSinceFirstInstalled() >= UserNoticeSchedule.DAYS_BEFORE_SHOWING_TRY_MY_OTHER_EXTENSION && await daysElapsedSinceFirstInstalled() < (UserNoticeSchedule.DAYS_BEFORE_SHOWING_TRY_MY_OTHER_EXTENSION + UserNoticeSchedule.DURATION_FOR_SHOWING_TRY_MY_OTHER_EXTENSION)) { // previous prefs: writeAboutMeClicked, tryMyOtherExtensionsClicked
            isGmailCheckerInstalled(function(installed) {
                if (!installed) {
                    show($newsNotification);
                    show("#newsNotificationGmailAdMessage");
                    onClick($newsNotification, async () => {
                        await storage.enable("tryMyOtherExtensionsClicked");
                        openUrl("https://jasonsavard.com/Checker-Plus-for-Gmail?ref=calpopup2");
                    })
                }
            });
		} else if (await storage.get("_lastBigUpdate")) {
            onClick($newsNotification, async () => {
                await storage.remove("_lastBigUpdate");
                openChangelog("bigUpdateFromPopupWindow")
            });
            show($newsNotification);
            show("#newsNotificationBigUpdateMessage");
        }
    });		
    
    onClick("#mainOptions", async () => {
        const $optionsMenu = byId("options-menu");
        
        initOptionsMenu();
        
        onClick("#viewAgenda", function() {
            changeCalendarView(CalendarView.AGENDA);
        });
        onClick("#viewListWeek", function() {
            changeCalendarView(CalendarView.LIST_WEEK);
        });
        onClick("#viewDay", function() {
            changeCalendarView(CalendarView.DAY);
        });
        onClick("#viewWeek", function() {
            changeCalendarView(CalendarView.WEEK);
        });
        onClick("#viewMonth", function() {
            changeCalendarView(CalendarView.MONTH);
        });
        
        const customView = await storage.get("customView");
        if (isCustomViewInDays(customView)) {
            byId("viewXWeeksLabel").textContent = getMessage("Xdays", await getValueFromCustomView());
        } else {
            byId("viewXWeeksLabel").textContent = getMessage("Xweeks", await getValueFromCustomView());
        }

        onClick("#viewCustomSettings", function(event) {
            openUrl("options.html?highlight=customView#general");
            event.preventDefault();
            event.stopPropagation();
        });
        
        onClick("#viewCustom", function() {
            changeCalendarView(CalendarView.CUSTOM);
        });
                    
        onClick($optionsMenu.querySelector(".popout"), function() {
            popout();
        });

        onClick($optionsMenu.querySelector(".changelog"), async function() {
            await storage.remove("_lastBigUpdate");
            openChangelog("CalendarCheckerOptionsMenu");
        });

        onClick($optionsMenu.querySelector(".discoverMyApps"), function() {
            openUrl("https://jasonsavard.com?ref=CalendarCheckerOptionsMenu");
        });

        onClick($optionsMenu.querySelector(".feedback"), function() {
            openUrl("https://jasonsavard.com/forum/categories/checker-plus-for-google-calendar-feedback?ref=CalendarCheckerOptionsMenu");
        });

        onClick($optionsMenu.querySelector(".followMe"), function() {
            openUrl("https://jasonsavard.com/?followMe=true&ref=CalendarCheckerOptionsMenu");
        });

        onClick($optionsMenu.querySelector(".aboutMe"), function() {
            openUrl("https://jasonsavard.com/about?ref=CalendarCheckerOptionsMenu");
        });
    }, null, {once: true});

    onClick("#bigAddEventButton", function() {
        
        initQuickAdd();

        var elem = document.querySelector("#quickAdd");
        var player = elem.animate([
            {opacity: "0.5", transform: "scale(1.2)"},
            {opacity: "1.0", transform: "scale(1)"}
        ], {
            duration: 200
        });

    });
    
    onClick("#save-quick-add", function() {
        saveQuickAdd();
    });
    
    const detachedPopupWidth = await storage.get("detachedPopupWidth");
    const detachedPopupHeight = await storage.get("detachedPopupHeight");
    // patch must use mousedown instead of click because it seems Chrome will open window as tab instead of detached popup window
    byId("maximize").addEventListener(DetectClient.isFirefox() ? "mouseup" : "mousedown", function(e) {
        if (isCtrlPressed(e)) {
            openWindowInCenter("popup.html", '', 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes', detachedPopupWidth, detachedPopupHeight);
            if (DetectClient.isChromium()) {
                closeWindow();
            }
        } else {
            openGoogleCalendarWebsite();
        }

        e.preventDefault();
        e.stopPropagation();
    });
    
    scrollTarget = byId('mainContent');
    scrollTarget.addEventListener("scroll", async e => {
        const target = e.target;
        console.log("scroll", target.scrollTop);
        
        // ignore this scroll event cause it was initiated automatically by scrollIntoView
        if (window.autoScrollIntoView || htmlElement.classList.contains("searchInputVisible")) {
            return;
        }
        
        if (await getCalendarView() == CalendarView.AGENDA) {
            
            if (target.scrollTop == 0) {
                const firstAgendaDayDateEvent = selector("#agendaEvents, .agendaDay")?._event;
                if (firstAgendaDayDateEvent) {
                    displayAgendaHeaderDetails(firstAgendaDayDateEvent.startTime);
                }
            }
            
            var BEFORE_END_Y_BUFFER = 800;
            
            if (!fetchingAgendaEvents) {
                if (target.scrollTop && target.scrollTop > target.scrollHeight - BEFORE_END_Y_BUFFER && globalThis.previousScrollTop < target.scrollTop) {
                    console.log("scroll down");
                    fetchingAgendaEvents = true;
                    
                    const $agendaEvents = byId("agendaEvents");
                    
                    if ($agendaEvents._events.length) {
                        let lastEventStartDate = $agendaEvents._events.last().startTime;

                        /*
                        // v2 commented because displayed unordered dates: https://jasonsavard.com/forum/discussion/comment/29481#Comment_29481
                        // v1 this logic added because last event might have been added dynamically via a gcm update and not represent all events fetched before that
                        let lastEventStartDate;
                        if (window.scrolledBefore) {
                            lastEventStartDate = $agendaEvents._events.last().startTime;
                        } else {
                            lastEventStartDate = await getEndDateAfterThisMonth();
                        }
                        window.scrolledBefore = true;
                        */
                        
                        const start = lastEventStartDate.addDays(1);
                        const end = lastEventStartDate.addDays(31);
                        fetchAgendaEvents({start:start, end:end, append:true}).then(() => {
                            fetchingAgendaEvents = false;
                        });
                    } else {
                        fetchingAgendaEvents = false;
                    }
                } else if (target.scrollTop < BEFORE_END_Y_BUFFER && globalThis.previousScrollTop > target.scrollTop) {
                    console.log("scroll up");
                    fetchingAgendaEvents = true;
                    
                    const $agendaEvents = byId("agendaEvents");
                    
                    if ($agendaEvents._events.length) {
                        const start = $agendaEvents._events.first().startTime.addDays(-31);
                        const end = $agendaEvents._events.first().startTime;
                        console.log("first event", $agendaEvents._events.first());
                        fetchAgendaEvents({start:start, end:end, prepend:true}).then(() => {
                            fetchingAgendaEvents = false;
                        });
                    } else {
                        fetchingAgendaEvents = false;
                    }
                }
            }
        }

        globalThis.previousScrollTop = target.scrollTop;
    });

    const autoSaveObj = await storage.get("autoSave");
	if (autoSaveObj?.event) {
		polymerPromise2.then(() => {
            showCreateBubble(autoSaveObj);
            showMessage("Restored unsaved event!");
        });
    }
    
    window.onresize = function(e) {
        if (!fromToolbar) {
            fullCalendar?.setOption('height', calculateCalendarHeight());

            storage.set("detachedPopupWidth", window.outerWidth);
            storage.set("detachedPopupHeight", window.outerHeight);
        }
    };
}

init();