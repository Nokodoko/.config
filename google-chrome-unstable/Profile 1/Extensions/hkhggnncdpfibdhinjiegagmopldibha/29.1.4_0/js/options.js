var playing;
var justInstalled = getUrlValue(location.href, "action") == "install";
var userResponsedToPermissionWindow;
var donationClickedFlagForPreventDefaults;
let calendarMap;

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    console.info("message rec", message);
    if (message.command == "featuresProcessed") {
        donationClickedFlagForPreventDefaults = true;
        document.querySelectorAll("[mustDonate]").forEach(el => {
            el.removeAttribute("mustDonate");
        });
        sendResponse();
    } else if (message.command == "grantPermissionToCalendars") {
        showLoading();
        userResponsedToPermissionWindow = true;
        sendResponse();
    } else if (message.command == "grantPermissionToCalendarsAndPolledServer") {
        postGrantedPermissionsToCalendarsAndPolledServer(message.email);
        sendResponse();
    }
});

function reloadExtension() {
	if (chrome.runtime.reload) {
		chrome.runtime.reload();
	} else {
		niceAlert("You must disable/re-enable the extension in the extensions page or restart the browser");
	}
}

async function waitForStorageSync() {
    await sleep(200);
}

async function initPage(tabName) {
	console.log("initPage: " + tabName);
	if (!byId(tabName + "Page")) {
		initTemplate(tabName + "PageTemplate");

		// patch for mac: because polymer dropdowns default values were not correctly populating
		setTimeout(() => {
            initPaperElement(selectorAll("#" + tabName + "Page [storage], #" + tabName + "Page [permissions]"));
        }, 1);

        onClickReplace(".grantAccessButton, #grantAccessAgain", async () => {
			if (supportsChromeSignIn()) {
				await openPermissionsDialog();
                postGrantedPermissionsToCalendarsAndPolledServer(await storage.get("email"));
			} else {
                requestPermission({ useGoogleAccountsSignIn: true });
			}
		});

		if (tabName == "welcome") {
			const navLang = await storage.get("language");
            const $lang = byId("lang");
            if ($lang.querySelector("[value='" + navLang + "']")) {
				$lang.selected = navLang;
			} else if ($lang.querySelector(`[value='${navLang.substring(0, 2)}']`)) {
                $lang.selected = navLang.substring(0, 2);
			} else {
				$lang.value = "en";
			}

			onClick("#lang paper-item", async function () {
                try {
                    delete window.initMiscPromise;
                    await initUI();
                    await sendMessageToBG("resetInitMiscWindowVars");
                    await sendMessageToBG("checkEvents", {ignoreNotifications: true});
                } catch (error) {
                    showError(error);
                }
			});

			onClick("#notificationsGuide", function() {
				showOptionsSection("notifications");
				sendGA("guide", "notifications");
			});
		} else if (tabName == "notifications") {

			loadVoices();
			// seems we have to call chrome.tts.getVoices twice at a certain 
			if (DetectClient.isLinux()) {
				setTimeout(function () {
					loadVoices();
				}, seconds(1));
			}
			
			// placeholder for calendar-reminders

			if (await storage.get("notificationVoice")) {
				show("#voiceOptions");
			} else {
				hide("#voiceOptions");
			}

            const $notificationVoice = byId("notificationVoice");
            if ($notificationVoice) {
                onDelegate($notificationVoice, "click", "paper-item", function () {
                    const voiceName = byId("voiceMenu").selected;
                    //var voiceName = $(this).val(); // commented because .val would not work for non-dynamically values like addVoice etc.

                    if (voiceName) {
                        if (voiceName == "addVoice") {
                            openUrl("https://jasonsavard.com/wiki/Voice_Notifications");
                        } else {

                            if (voiceName.includes("Multilingual TTS Engine")) {
                                byId("pitch").setAttribute("disabled", "true");
                                byId("rate").setAttribute("disabled", "true");
                            } else {
                                byId("pitch").removeAttribute("disabled");
                                byId("rate").removeAttribute("disabled");
                            }

                            playVoice();
                        }
                        fadeIn("#voiceOptions");
                    } else {
                        hide("#voiceOptions");
                    }
                });
            }

			onClick("#playVoice", function () {
				chrome.runtime.sendMessage({command: "chromeTTS", isSpeaking:true}, isSpeaking => {
                    if (isSpeaking) {
                        chrome.runtime.sendMessage({command: "chromeTTS", stop:true});
                        byId("playVoice").setAttribute("icon", "av:stop");
                    } else {
                        playVoice();
                    }
                });
			});

			addEventListeners("#voiceOptions paper-slider", "change", async function () {
				await waitForStorageSync();
                playVoice();
			});

			onClick("#runInBackground", function () {
				var that = this;
				// timeout to let permissions logic determine check or uncheck the before
				setTimeout(function () {
					if (that.checked) {
						openDialog("runInBackgroundDialogTemplate");
					}
				}, 1);
			});

			if (await storage.get("notificationSound")) {
				show("#soundOptions");
			} else {
				hide("#soundOptions");
			}

			onClick("#notificationSound paper-item", function () {
				const soundName = this.getAttribute("value");

				byId("playNotificationSound").style.display = "block";

				if (soundName == "custom") {
					byId("notificationSoundInputButton").click();
				} else {
					playSound(soundName);
				}

				if (soundName) {
					fadeIn("#soundOptions");
				} else {
					hide("#soundOptions");
				}
			});

			onClick("#playNotificationSound", function () {
				if (playing) {
                    sendMessageToBG("stopNotificationSound");
                    playing = false;
                    this.setAttribute("icon", "av:play-arrow");
				} else {
					playSound();
				}
			});

			addEventListeners("#notificationSoundVolume", "change", async function () {
				setTimeout(function () {
					playSound();
				}, 100);
			});

            addEventListeners("#notificationSoundInputButton", "change", function () {
				var file = this.files[0];
				var fileReader = new FileReader();

				fileReader.onloadend = function () {
					storage.set("notificationSoundCustom", this.result).then(() => {
						playSound();
					}).catch(error => {
						openGenericDialog({ content: "The file you have chosen is too large, please select a shorter sound alert." });
						storage.remove("notificationSoundCustom");
					});
				}

				fileReader.onabort = fileReader.onerror = function () {
					niceAlert("Problem loading file");
				}

				console.log("file", file)
				fileReader.readAsDataURL(file);
			});

			async function initNotifications(startup) {
				let showMethod;
				let hideMethod;
				if (startup) {
					showMethod = "show";
					hideMethod = "hide";
				} else {
					showMethod = "slideDown";
					hideMethod = "slideUp";
				}

				const desktopNotification = await storage.get("desktopNotification");
				if (desktopNotification == "") {
                    globalThis[hideMethod](byId("desktopNotificationOptions"));
				} else if (desktopNotification == "text") {
					globalThis[showMethod](byId("desktopNotificationOptions"));
					globalThis[hideMethod](byId("richNotificationOptions"));
					globalThis[hideMethod](byId("showCalendarNames"));
					globalThis[hideMethod](byId("popupWindowNotificationOptions"));
				} else if (desktopNotification == "rich") {
					globalThis[showMethod](byId("desktopNotificationOptions"));
					globalThis[showMethod](byId("richNotificationOptions"));
					globalThis[showMethod](byId("showCalendarNames"));
					globalThis[hideMethod](byId("popupWindowNotificationOptions"));
				} else if (desktopNotification == "popupWindow") {
					globalThis[showMethod](byId("desktopNotificationOptions"));
					globalThis[hideMethod](byId("richNotificationOptions"));
					globalThis[showMethod](byId("showCalendarNames"));
					globalThis[showMethod](byId("popupWindowNotificationOptions"));
				}
			}

			initNotifications(true);

			function requestTextNotificationPermission(showTest) {
				Notification.requestPermission(permission => {
					if (permission == "granted") {
						if (showTest) {
                            sendMessageToBG("testNotification", { testType: "text" }).catch(error => {
                                showError("Error: " + error);
                            });
						}
					} else {
						openNotificationPermissionIssueDialog(permission);
					}
				});
			}

			onClick("#desktopNotification paper-item", async () => {
				initNotifications();
				if (await storage.get("desktopNotification") == "text") {
					requestTextNotificationPermission();
				}
			});

			onClick("#testNotification", async function () {
                const desktopNotification = await storage.get("desktopNotification");
				if (desktopNotification == "text") {
					requestTextNotificationPermission(true);
				} else {
                    sendMessageToBG("testNotification", { testType: desktopNotification }).catch(error => {
                        console.log("notifresponse: ", error)
                        openNotificationPermissionIssueDialog(error);
                    });
				}
			});

			addEventListeners("#pendingNotificationsInterval", "change", async function () {
				sendMessageToBG("forgottenReminder.stop");
			});

			onClick("#testPendingReminder", async function () {
                await openGenericDialog({ content: "Click OK to see the toolbar button animate :)" });
                sendMessageToBG("forgottenReminder.execute", {test: true }).catch(error => {
                    alert(error);
                });
			});

			selectorAll(".snoozeOption").forEach(option => {
				option.textContent = getMessage("snooze") + " " + option.textContent.replaceAll("\n", "").trim();
			});

			onClick("#refresh", async function () {
                showLoading();
                await sendMessageToBG("pollServer", {
                    source:	"refresh",
                    bypassCache: true,
                });
                location.reload();
			});

		} else if (tabName == "button") {
			addEventListeners("#showEventTimeOnBadge, #showEventTimeOnBadgeOptions paper-checkbox, #showDayOnBadge, #showDayOnBadgeOptions paper-checkbox, #excludeRecurringEventsButtonIcon, #excludeHiddenCalendarsFromButton, #showButtonTooltip, #showBusyEvents, #time-remaining-for-current-event", "change", async function () {
                await waitForStorageSync();
                await sendMessageToBG("checkEvents", { ignoreNotifications: true });
			});

			addEventListeners("#showTimeSpecificEventsBeforeAllDay", "change", async function () {
                await waitForStorageSync();
                await sendMessageToBG("pollServer", { source: "showTimeSpecificEventsBeforeAllDay" });
			});

			onClick("#browserButtonAction paper-item", async function () {
                await waitForStorageSync();
                initPopup();
			});

			if (await storage.get("showEventTimeOnBadge")) {
				show("#showEventTimeOnBadgeOptions");
			} else {
				hide("#showEventTimeOnBadgeOptions");
			}

			addEventListeners("#showEventTimeOnBadge", "change", function () {
				if (this.checked) {
					slideDown("#showEventTimeOnBadgeOptions");
				} else {
					slideUp("#showEventTimeOnBadgeOptions");
				}
			});

			if (await storage.get("showDayOnBadge")) {
				show("#showDayOnBadgeOptions");
			} else {
				hide("#showDayOnBadgeOptions");
			}

			addEventListeners("#showDayOnBadge", "change", function () {
				if (this.checked) {
					slideDown("#showDayOnBadgeOptions");
				} else {
					slideUp("#showDayOnBadgeOptions");
				}
			});

			byId("currentBadgeIcon").setAttribute("src", await getBadgeIconUrl("", true));
			onClick("#badgeIcon paper-icon-item", async () => {
                byId("currentBadgeIcon").setAttribute("src", await getBadgeIconUrl("", true));
                sendMessageToBG("updateBadge", { forceRefresh: true });
			});
		} else if (tabName == "general") {
			setTimeout(function () {
				if (location.href.match("highlight=customView")) {
					byId("customView").classList.add("highlight");
				}
			}, 500);

            const listbox = await initCalendarDropDown("defaultCalendarTemplate");
            initPaperElement(selector("#defaultCalendar paper-listbox"));

			onClick("#maxDaysAhead paper-item, #twentyFourHourMode", async function () {
                await waitForStorageSync();
                twentyFourHour = await storage.get("24hourMode");
                await sendMessageToBG("resetInitMiscWindowVars");
                sendMessageToBG("checkEvents", { ignoreNotifications: true });
			});

			addEventListeners("#showContextMenuItem", "change", function (e) {
				if (this.checked) {
                    show("#showOnlyQuickWhenTextSelected");
                    sendMessageToBG("addChangeContextMenuItems");
				} else {
                    hide("#showOnlyQuickWhenTextSelected");
					chrome.contextMenus.removeAll();
				}
            });

            if (!await storage.get("showContextMenuItem")) {
                hide("#showOnlyQuickWhenTextSelected");
            }

            addEventListeners("#showOnlyQuickWhenTextSelected", "change", function (e) {
                sendMessageToBG("addChangeContextMenuItems");
            });
            
            async function initFirstDay() {
                const customView = await storage.get("customView");
                showHide("#firstDay", !isCustomViewInDays(customView));
            }

            initFirstDay();

			onClick("#customView paper-item", async function () {
                await storage.set("calendarView", CalendarView.CUSTOM);
                initFirstDay();
			});

			if (await storage.get("openExistingCalendarTab")) {
				byId("openExistingCalendarTab").checked = true;
			}

			onClick("#openExistingCalendarTab", function () {
				var that = this;
				if (that.checked) {
					chrome.permissions.request({ origins: [Origins.OPEN_EXISTING_TABS] }, granted => {
						if (granted) {
							storage.enable("openExistingCalendarTab");
						} else {
							that.checked = false;
						}
					});
				} else {
					storage.disable("openExistingCalendarTab");
				}
            });
        } else if (tabName == "skinsAndThemes") {

            const $skinsListing = byId("skinsAndThemesListing");

            showLoading();
            try {
                const skins = await Controller.getSkins();
                skins.forEach(skin => {
                    const $row = document.createElement("tr");
                    $row.classList.add("skinLine");

                    const $name = document.createElement("td");
                    $name.classList.add("name");
                    $name.textContent = skin.name;

                    const $skinImageWrapper = document.createElement("td");
                    $skinImageWrapper.classList.add("skinImageWrapper");

                    const $skinImageLink = document.createElement("a");
                    $skinImageLink.classList.add("skinImageLink");

                    const $skinImage = document.createElement("img");
                    $skinImage.classList.add("skinImage");

                    $skinImageLink.append($skinImage);
                    $skinImageWrapper.append($skinImageLink);

                    const $author = document.createElement("td");
                    $author.classList.add("author");

                    const $installs = document.createElement("td");
                    $installs.textContent = skin.installs;

                    const $addSkinWrapper = document.createElement("td");

                    const $addSkin = document.createElement("paper-icon-button");
                    $addSkin.classList.add("addSkin");
                    $addSkin.setAttribute("icon", "add");

                    $addSkinWrapper.append($addSkin);

                    $row.append($name, $skinImageWrapper, $author, $installs, $addSkinWrapper);

                    $row._skin = skin;

                    if (skin.image) {
                        $skinImage.src = skin.image;
                        $skinImageLink.href = skin.image;
                        $skinImageLink.target = "_previewWindow";
                    }
    
                    const $authorLink = document.createElement("a");
                    $authorLink.textContent = skin.author;
                    if (skin.author_url) {
                        $authorLink.href = skin.author_url;
                        $authorLink.target = "_preview";
                        $skinImage.style["cursor"] = "pointer";
                    }
                    $author.append( $authorLink );
                    onClick($addSkin, () => {
                        window.open("https://jasonsavard.com/wiki/Skins_and_Themes?ref=skinOptionsTab", "emptyWindow");
                    });
    
                    $skinsListing.append($row);
                });
            } catch (error) {
                $skinsListing.append("Problem loading skins: " + error);
            }

            hideLoading();            
		} else if (tabName == "accounts") {
			onClick("#revokeAccess", async function () {
                const email = await storage.get("email");
				storage.remove("snoozers");
                storage.remove("cachedFeeds");
                storage.remove("cachedFeedsDetails");
                
                resetTemporaryData();

                async function revokeAccess(oAuthForMethod, lastRevoke) {
                    const tokenResponse = await oAuthForMethod.findTokenResponse({ userEmail: email })
                    if (tokenResponse) {
                        removeCachedAuthToken(tokenResponse.access_token);
    
                        await oAuthForMethod.removeAllTokenResponses();
        
                        if (lastRevoke) {
                            emptyNode("#emailsGrantedPermissionToContacts");
                            byId("defaultAccountEmail").textContent = email;
                            show("#oauthNotGranted");
                            hide("#oauthOptions");
                        }

                        return fetchJSON("https://jasonsavard.com/revokeOauthAccess?token=" + tokenResponse.access_token);
                    }
                }

                try {
                    await revokeAccess(oAuthForTasks);
                } catch (error) {
                    console.warn("Ignore task error", error);
                }

                revokeAccess(oAuthForDevices, true).then(() => {
					showLoggedOut();
					showMessage(getMessage("done"));
				}).catch(error => {
					console.error(error);
					niceAlert("Could not revoke access, revoke it manually more info: https://support.google.com/accounts/answer/3466521");
				});
			});
		} else if (tabName == "admin") {
			if (await storage.get("email") == "test@gmail.com") {
				onClick("#exportLocalStorage", function () {
					downloadObject(localStorage);
				})
				onClick("#importLocalStorage", function () {
					var localStorageText = byId("localStorageText").value;
					if (localStorageText) {
						var localStorageImportObj = JSON.parse(localStorageText);
						localStorage.clear();
						for (item in localStorageImportObj) {
							localStorage.setItem(item, localStorageImportObj[item]);
						}
						openGenericDialog({ title: "Done. Reload the extension to use these new settings!" });
					} else {
						openGenericDialog({ title: "Must enter localStorage JSON string!" });
					}
				})

				show("#testSection");
			}

			addEventListeners("#showConsoleMessages", "change", async () => {
                await waitForStorageSync();
                await niceAlert("Click OK to restart the extension");
				reloadExtension();
			});

			onClick("#fetchCalendarSettings", async () => {
                sendMessageToBG("fetchCalendarSettings", { bypassCache: true, email: await storage.get("email") }).then(response => {
					alert("Done");
				}).catch(error => {
					alert("problem: " + error)
				});
			});

			onClick("#clearData", async () => {
				const snoozers = await getFutureSnoozes(await getSnoozers(), {email: await storage.get("email")});
				if (snoozers.length) {
					openGenericDialog({
						content: "You have some snoozed events which will be fogotten after clearing the data.<br><br>Do you want to take note of them?",
						okLabel: getMessage("snoozedEvents"),
						cancelLabel: "Ignore"
					}).then(response => {
						if (response == "ok") {
							openReminders({ notifications: snoozers.shallowClone() });
						} else {
							clearData();
						}
					});
				} else {
					clearData();
				}
			});

            onClick("#reset-dismissed-notifications", async () => {
                await storage.remove("eventsShown");
                await niceAlert("Click OK to restart the extension");
				reloadExtension();
            });

			onClick("#saveSyncOptions", function () {
				syncOptions.save("manually saved").then(function () {
					openGenericDialog({
						title: "Done",
						content: "Make sure you are signed into the browser for the sync to complete",
						cancelLabel: getMessage("moreInfo")
					}).then(response => {
						if (response == "cancel") {
							if (DetectClient.isFirefox()) {
								openUrl("https://support.mozilla.org/kb/access-mozilla-services-firefox-accounts");
							} else {
								openUrl("https://support.google.com/chrome/answer/185277");
							}
						}
					});
				}).catch(function (error) {
					showError("Error: " + error);
				});
			});

			onClick("#loadSyncOptions", function () {
				syncOptions.fetch(function (response) {
					// do nothing last fetch will 
					console.log("syncoptions fetch response", response);
				}).catch(response => {
					console.log("catch response", response);
					// probably different versions
					if (response?.items) {
						return new Promise(function (resolve, reject) {
							openGenericDialog({
								title: "Problem",
								content: response.error + "<br><br>" + "You can force it but it might create issues in the extension and the only solution will be to re-install without loading settings!",
								okLabel: "Force it",
								showCancel: true
							}).then(function (dialogResponse) {
								if (dialogResponse == "ok") {
									resolve(response.items);
								} else {
									reject("cancelledByUser");
								}
							});
						});
					} else {
						throw response;
					}
				}).then(items => {
					console.log("syncoptions then");
					return syncOptions.load(items);
				}).then(() => {
					openGenericDialog({
						title: "Click OK to restart the extension!"
					}).then(response => {
						if (response == "ok") {
							reloadExtension();
						}
					});
				}).catch(error => {
					console.log("syncoptions error: " + error);
					if (error != "cancelledByUser") {
						openGenericDialog({
							content: "error loading options: " + error
						});
					}
				});
			});
		}

		// must be at end (at least after all templates have been exposed like default calendar dropdown)
		if (await storage.get("donationClicked")) {
            document.querySelectorAll("[mustDonate]").forEach(el => {
                el.removeAttribute("mustDonate");
            });
		}
		
	}
}

function showOptionsSection(tabName) {
	console.log("showtabName: " + tabName)
	byId("mainTabs").selected = tabName;
	byId("pages").selected = tabName;

    selectorAll(".page").forEach(el => el.classList.remove("active"));
	setTimeout(() => {
		selector(".page.iron-selected")?.classList.add("active");
	}, 1);

    //document.body.scrollTop = 0;
    selector("app-header-layout app-header").scrollTarget.scroll({top:0})

	initPage(tabName);
	// wait for tab animation
	setTimeout(() => {
		selector("app-header").notifyResize();
    }, 500);
    
    // timeout required because the pushstate created chopiness
    setTimeout(() => {
        history.pushState({}, "blah", "#" + tabName);
    }, 500)
}

function loadVoices() {
	console.log("loadVoices");
	if (chrome.tts) {
		chrome.tts.getVoices(function(voices) {
			
			var nativeFound = false;
			var options = [];
			
			for (var i=0; i<voices.length; i++) {
				if (voices[i].voiceName == "native") {
					nativeFound = true;
				} else {
					var optionsObj = {label:voices[i].voiceName, value:voices[i].voiceName};
					if (voices[i].extensionId) {
						optionsObj.value += "___" + voices[i].extensionId;
					}
					options.push(optionsObj);
				}
	      	}
			
			var t = document.querySelector('#t');
			// could only set this .data once and could not use .push on it or it breaks the bind
			
			if (t) {
				t.data = options;
			}
		});
	}
}

async function playSound(soundName) {
	if (!soundName) {
		soundName = await storage.get("notificationSound");
	}
	byId("playNotificationSound")?.setAttribute("icon", "av:stop");
    playing = true;
    try {
        await sendMessageToBG("playNotificationSoundFile", soundName);
        playing = false;
        byId("playNotificationSound")?.setAttribute("icon", "av:play-arrow");
    } catch (error) {
        console.warn("might have clicked play multiple times", error);
    }
}

function playVoice() {
	byId("playVoice").setAttribute("icon", "av:stop");
    
    chrome.runtime.sendMessage({command: "chromeTTS", text: byId("voiceTestText").value}, response => {
        byId("playVoice").setAttribute("icon", "av:play-arrow");
        if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError.message);
            showError(chrome.runtime.lastError.message);
        }
	});
}

function initSelectedTab() {
	var tabId = location.href.split("#")[1];
	
	if (tabId) {
		showOptionsSection(tabId);
	} else {
		showOptionsSection("notifications");
	}
}

async function initGrantedAccountDisplay(startup) {
    console.log("initGrantedAccountDisplay");
    let showMethod;
    let hideMethod;
    if (startup) {
        showMethod = "show";
        hideMethod = "hide";
    } else {
        showMethod = "slideDown";
        hideMethod = "slideUp";
    }
    
    calendarMap = await initCalendarMap();

	initPage("welcome");
	initPage("notifications");
	initPage("accounts");

    const email = await storage.get("email");
    const loggedOut = await storage.get("loggedOut");
	if (!email || loggedOut) {
		hideMessage();
		globalThis[showMethod](byId("guideGrantAccessButton"));
		globalThis[hideMethod](byId("guides"));
		globalThis[showMethod](byId("oauthNotGranted"));
	} else if (!await oAuthForDevices.findTokenResponse({userEmail:email})) {	
		// only show warning if we did not arrive from popup warning already
		if (getUrlValue(location.href, "accessNotGranted")) {
			hideMessage();
		} else {
			if (!justInstalled && location.hash != "#accounts") {
				showMessage(getMessage("accessNotGrantedSeeAccountOptions", ["", getMessage("accessNotGrantedSeeAccountOptions_accounts")]), {
					text: getMessage("accounts"),
					onClick: function() {
						showOptionsSection("accounts");
						hideMessage();
					}
				});
			} else {
				hideMessage();
			}
		}
		
		setTimeout(() => {
			byId("defaultAccountEmail").textContent = email;
		}, 1);
		show("#defaultAccount");
		
		globalThis[showMethod](byId("guideGrantAccessButton"));
		globalThis[hideMethod](byId("guides"));
		globalThis[showMethod](byId("oauthNotGranted"));
	} else {
		hideMessage();
		globalThis[hideMethod](byId("guideGrantAccessButton"));
		globalThis[showMethod](byId("guides"));
		globalThis[hideMethod](byId("oauthNotGranted"));
	}

    const userEmails = await oAuthForDevices.getUserEmails();
    
    if (userEmails.length && !loggedOut) {
        emptyNode("#emailsGrantedPermissionToContacts");
        userEmails.forEach(userEmail => {
            byId("emailsGrantedPermissionToContacts").append(userEmail, " ");
        });
        globalThis[showMethod](byId("oauthOptions"));
        loadCalendarReminders();
    } else {
        globalThis[hideMethod](byId("oauthOptions"));
    }
}

function getCalendarFromNode(node) {
    const calendars = selector("calendar-reminders").calendars;
    const calendarId = node.closest("[calendar-id]").getAttribute("calendar-id");
    return calendars.find(calendar => calendar.id == calendarId);
}

async function sendPatchCommand(calendarReminderModified) {
    console.log("saving: ", calendarReminderModified.defaultReminders)
    
    const sendParams = {
        userEmail: await storage.get("email"),
        type: "patch",
        url: "/users/me/calendarList/" + encodeURIComponent(calendarReminderModified.id),
        data: {
            defaultReminders: calendarReminderModified.defaultReminders
        }
    };
    
    oauthDeviceSend(sendParams).then(async response => {
        await storage.remove("cachedFeeds");
        showMessage("Synced with Google Calendar");
        return sendMessageToBG("pollServer", {reInitCachedFeeds: true});
    }).catch(error => {
        showError("Error saving: " + error, {
            text: getMessage("refresh"),
            onClick: function() {
                showLoading();
                sendMessageToBG("pollServer", {source: "refresh"}).then(() => {
                    location.reload();
                });
            }
        });
    });        
}

var saveCalendarRemindersTimeout;

function saveCalendarReminders(node) {
    if (hasCalendarReadWritePermissions()) {
        clearTimeout(saveCalendarRemindersTimeout);
	
        saveCalendarRemindersTimeout = setTimeout(function() {
            var $reminderMinutes = node.querySelector(".reminderMinutes");
            var $reminderValuePerPeriod = node.querySelector(".reminderValuePerPeriod");
            var $reminderPeriod = node.querySelector(".reminderPeriod");
            var $lastUpdated = node.querySelector(".lastUpdated");
            
            updateReminderMinutes($reminderPeriod, $reminderMinutes, $reminderValuePerPeriod)
            
            $lastUpdated.value = new Date();
            
            var calendarReminderModified = getCalendarFromNode(node);
            
            console.log("calendarReminderModified", calendarReminderModified);
    
            sendPatchCommand(calendarReminderModified);
        }, seconds(2));
    }
}

async function hasCalendarReadWritePermissions() {
    const tokenResponse = await oAuthForDevices.findTokenResponse({ userEmail: await storage.get("email") });
    const oldUsersWithFullPermissions = !tokenResponse.scopes;

    if (oldUsersWithFullPermissions || tokenResponse.scopes.split(" ").includes(Scopes.CALENDARS_READ_WRITE)) {
        return true;
    } else {
        await niceAlert(getMessage("permissionIsRequired"));
        try {
            requestPermission({
                email: tokenResponse.userEmail,
                useGoogleAccountsSignIn: !tokenResponse.chromeProfile,
                scopes: Scopes.CALENDARS_READ_WRITE
            });    
        } catch (error) {
            showError(error);
        } finally {
            hideLoading();
        }
    }
}

function initCalendarReminders() {
	selector("calendar-reminders").shadowRoot.querySelectorAll(".calendarReminder").forEach($calendarReminder => {
		var $reminderMethod = $calendarReminder.querySelector(".reminderMethod");
		var $reminderMinutes = $calendarReminder.querySelector(".reminderMinutes");
		var $reminderValuePerPeriod = $calendarReminder.querySelector(".reminderValuePerPeriod");
		var $reminderPeriod = $calendarReminder.querySelector(".reminderPeriod");
		var $deleteReminder = $calendarReminder.querySelector(".deleteReminder");

		initReminderPeriod($reminderValuePerPeriod, $reminderPeriod, $reminderMinutes);
		
		// MUST USE .off for all events here

        onClickReplace($reminderMethod.querySelectorAll("paper-item"), function() {
			saveCalendarReminders($calendarReminder);
		});

        replaceEventListeners($reminderValuePerPeriod, "keyup", function() {
			saveCalendarReminders($calendarReminder);
		});

        onClickReplace($reminderPeriod.querySelectorAll("paper-item"), function() {
			saveCalendarReminders($calendarReminder);
		});
		
        onClickReplace($deleteReminder, function() {
            if (hasCalendarReadWritePermissions()) {
                // must fetch this reminderMinutes because the varaiable above is passed by value and not reference so it might have changes ince
                const reminderMinutes = this.closest(".calendarReminder").querySelector(".reminderMinutes").value;
                
                const calendarReminderModified = getCalendarFromNode($calendarReminder);
                calendarReminderModified.defaultReminders.some(function(defaultReminder, index) {
                    if (defaultReminder.method == $reminderMethod.selected && defaultReminder.minutes == reminderMinutes) {
                        calendarReminderModified.defaultReminders.splice(index, 1);
                        return true;
                    }
                });
                
                slideUp($calendarReminder);
                
                sendPatchCommand(calendarReminderModified);
            }
		});
		
	});
	
    onClickReplace(selector("calendar-reminders").shadowRoot.querySelectorAll(".calendarReminderLineCheckbox"), async function() {
		const calendar = getCalendarFromNode(this);
		const excludedCalendars = await storage.get("excludedCalendars");
		
		if (this.checked) {
            excludedCalendars[calendar.id] = false;
			this.closest(".calendarReminderLine").removeAttribute("excluded");

			showMessage("Note: To see this calendar use the ≡ menu in the popup", 5);
		} else {
            excludedCalendars[calendar.id] = true;
			this.closest(".calendarReminderLine").setAttribute("excluded", true);
			
            showMessage("Notifications removed! To hide this calendar use the ≡ menu in the popup", 5);
            
            const email = await storage.get("email");
            const selectedCalendars = await storage.get("selectedCalendars");

            if (!isCalendarSelectedInExtension(calendar, email, selectedCalendars)) {
                console.info("optimize and remove from cache: " + calendar.id);
                const cachedFeeds = await storage.get("cachedFeeds");
                delete cachedFeeds[calendar.id];
                await storage.set("cachedFeeds", cachedFeeds);
                await sendMessageToBG("reInitCachedFeeds");
            }
		}

        await storage.set("excludedCalendars", excludedCalendars);

        await sendMessageToBG("checkEvents", {ignoreNotifications: true});
	});
}

async function loadCalendarReminders() {
	console.log("loadCalendarReminders");
	//var t = document.querySelector('#calendarRemindersBind');
	// could only set this .data once and could not use .push on it or it breaks the bind
	
	const calendars = await getArrayOfCalendars();
	
	if (calendars.length == 0) {
		console.log("no calendars found");
		return;
	}
	
	calendars.forEach(calendar => {
		calendar.defaultReminders?.sort((a, b) => {
			if (parseInt(a.minutes) < parseInt(b.minutes)) {
				return -1;
			} else {
				return +1;
			}
		});
	});

	const calendarColorsCSS = generateCalendarColors(await storage.get("cachedFeeds"), calendars);
	selector("calendar-reminders").shadowRoot.querySelector("style").append(calendarColorsCSS);

    window.excludedCalendars = await storage.get("excludedCalendars");
	selector("calendar-reminders").calendars = calendars;
	
	setTimeout(() => {
		initCalendarReminders();
	}, 1);
}

function openNotificationPermissionIssueDialog(error) {
	openGenericDialog({
		title: "Permission denied!",
		content: "You might have disabled the notifications. Error: " + error,
		cancelLabel: getMessage("moreInfo")
	}).then(response => {
		if (response != "ok") {
			openUrl("https://support.google.com/chrome/answer/3220216");
		}
	});

}

function postGrantedPermissionsToCalendarsAndPolledServer(email) {
    const $div = byId("emailsGrantedPermissionToContacts");
	if (!$div.innerHTML.includes(email)) {
		$div.append(" ", email);
	}

	initGrantedAccountDisplay();

	hideLoading();
	showMessage(getMessage("accessGranted"));
}

async function clearData() {
	localStorage.clear();
	await storage.clear();

	storage.setDate("installDate");
	storage.set("installVersion", chrome.runtime.getManifest().version);

	openGenericDialog({
		title: "Data cleared!",
		content: "You will have to re-exclude your excluded calendars again!<br><br>Click OK to restart extension.",
	}).then(response => {
		if (response == "ok") {
			reloadExtension();
		}
	});
}

docReady(async () => {

    await initUI();
    await polymerPromise;

    donationClickedFlagForPreventDefaults = await storage.get("donationClicked");
    
    onClick("#mainTabs paper-tab", function(e) {
        const tabName = this.getAttribute("value");
        showOptionsSection(tabName);
    });
    
    window.addEventListener("focus", function(event) {
        console.log("window.focus");
        // reload voices
        loadVoices();
    });

    if (justInstalled || (!await storage.get("_optionsOpened") && gtVersion(await storage.get("installVersion"), "26.2"))) {
        storage.setDate("_optionsOpened");
        showOptionsSection("welcome");
        
        if (DetectClient.isOpera()) {
            if (!window.Notification) {
                openGenericDialog({title: "Desktop notifications are not yet supported in this browser!"});
            }
            if (window.chrome && !window.chrome.tts) {
                openGenericDialog({title: "Voice notifications are not yet supported in this browser!"});
            }
            openGenericDialog({
                title: "You are not using the stable channel of Chrome!",
                content:"Bugs might occur, you can use this extension, however, for obvious reasons,<br>these bugs and reviews will be ignored unless you can replicate them on stable channel of Chrome.",
                cancelLabel:getMessage("moreInfo")
            }).then(response => {
                if (response != "ok") {
                    openUrl("https://jasonsavard.com/wiki/Unstable_browser_channel");
                }
            });
        }

        // check for sync data
        syncOptions.fetch().then(function(items) {
            console.log("fetch response", items);
            openGenericDialog({
                title: "Restore settings",
                content: "Would you like to use your previous extension options? <div style='margin-top:4px;font-size:12px;color:gray'>(If you had previous issues you should do this later)</div>",
                showCancel: true
            }).then(function(response) {
                if (response == "ok") {
                    syncOptions.load(items).then(function(items) {
                        openGenericDialog({
                            title: "Options restored!",
                            okLabel: "Restart extension"
                        }).then(response => {
                            reloadExtension();
                        });
                    }).catch(function(error) {
                        openGenericDialog({
                            title: "Error loading settings", 
                            content: error
                        });
                    });
                }
            });
        }).catch(error => {
            console.error("error fetching: ", error);
        });
    } else {
        initSelectedTab();
    }
    
    window.onpopstate = function(event) {
        console.log(event);
        initSelectedTab();
    }
    
    initGrantedAccountDisplay(true);
    
    addEventListeners("#logo", "dblclick", async function() {
        await storage.toggle("donationClicked");
        location.reload();
    });
    
    byId("version").textContent = `v.${chrome.runtime.getManifest().version}`;
    onClick("#version", function() {
        showLoading();
        if (chrome.runtime.requestUpdateCheck) {
            chrome.runtime.requestUpdateCheck(function(status, details) {
                hideLoading();
                console.log("updatechec:", details)
                if (status == "no_update") {
                    openGenericDialog({title:"No update!", otherLabel: "More info"}).then(function(response) {
                        if (response == "other") {
                            location.href = "https://jasonsavard.com/wiki/Extension_Updates";
                        }
                    })
                } else if (status == "throttled") {
                    openGenericDialog({title:"Throttled, try again later!"});
                } else {
                    openGenericDialog({title:"Response: " + status + " new version " + details.version});
                }
            });
        } else {
            location.href = "https://jasonsavard.com/wiki/Extension_Updates";
        }
    });

    onClick("#changelog", function(event) {
        openChangelog("CalendarOptions");
        event.preventDefault();
        event.stopPropagation();
    });

    // detect x
    addEventListeners("#search", "search", function(e) {
        if (!this.value) {
            selectorAll("*").forEach(el => el.classList.remove("search-result"));
        }
    });

    function highlightTab(node) {
        console.log("node", node);
        let page;
        if (node.closest) {
            page = node.closest(".page");
        } else {
            page = node.parentElement.closest(".page");
        }
        
        if (page) {
            const tabName = page.getAttribute("value");
            // :not(.iron-selected)
            selector(`paper-tab[value='${tabName}']`).classList.add("search-result");
        }
    }

    function highlightPriorityNode(highlightNode) {
        return [
            "paper-dropdown-menu",
            "paper-button",
            "paper-checkbox",
            "select"
        ].some(priorityNodeName => {
            const $priorityNode = highlightNode.closest(priorityNodeName);
            if ($priorityNode) {
                $priorityNode.classList.add("search-result");
                return true;
            }
        });
    }

    async function search(search) {
        if (!window.initTabsForSearch) {
            await asyncForEach(document.querySelectorAll("paper-tab"), async (tab) => {
                await initPage(tab.getAttribute("value"));
            });
            window.initTabsForSearch = true;
        }

        selectorAll("*").forEach(el => el.classList.remove("search-result"));
        if (search.length >= 2) {
            search = search.toLowerCase();
            var elms = document.getElementsByTagName("*"),
            len = elms.length;
            for(var ii = 0; ii < len; ii++) {

                let label = elms[ii].getAttribute("label");
                if (label && label.toLowerCase().includes(search)) {
                    elms[ii].classList.add("search-result");
                    highlightTab(elms[ii]);
                }

                var myChildred = elms[ii].childNodes;
                len2 = myChildred.length;
                for (var jj = 0; jj < len2; jj++) {
                    if (myChildred[jj].nodeType === 3) {
                        if (myChildred[jj].nodeValue.toLowerCase().includes(search)) {
                            let highlightNode = myChildred[jj].parentNode;
                            if (highlightNode.nodeName != "STYLE") {
                                let foundPriorityNode = highlightPriorityNode(highlightNode);
                                if (!foundPriorityNode) {
                                    const $priorityNode = highlightNode.closest("paper-tooltip");
                                    if ($priorityNode) {
                                        foundPriorityNode = highlightPriorityNode($priorityNode.target);
                                        if (!foundPriorityNode) {
                                            $priorityNode.target.classList.add("search-result");
                                        }
                                    } else {
                                        highlightNode.classList.add("search-result");
                                    }
                                }

                                console.log("highlightNode", highlightNode);
                                
                                highlightTab(myChildred[jj]);
                            }
                        }
                    }
                }
            }
        }
    }
    
    addEventListeners("#search", "keyup", function(e) {
        const searchValue = this.value;
        clearTimeout(window.searchTimeout);
        searchTimeout = setTimeout(() => {
            search(searchValue);
        }, window.initTabsForSearch ? 0 : 300);

        clearTimeout(window.analyticsTimeout);
        analyticsTimeout = setTimeout(async () => {
            while (!window.initTabsForSearch) {
                await sleep(200);
            }
            if (searchValue) {
                sendGA("optionsSearch", searchValue);
                if (!selector(".search-result")) {
                    openGenericDialog({
                        title: "No results found in options",
                        showCancel: true,
                        okLabel: "Search FAQ & Forum"
                    }).then(response => {
                        if (response == "ok") {
                            window.open("https://jasonsavard.com/search?q=" + encodeURIComponent(searchValue), "emptyWindow");
                        }
                    });
                }
            }
        }, 1000);
    });

    setTimeout(function() {
        document.body.removeAttribute("jason-unresolved");
        document.body.classList.add("explode");
    }, 200)
});