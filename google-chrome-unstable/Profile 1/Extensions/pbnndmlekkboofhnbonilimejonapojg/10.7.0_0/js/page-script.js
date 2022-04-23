/******/ (() => { // webpackBootstrap
/******/ 	"use strict";

;// CONCATENATED MODULE: ./ts/PageScript/EditableContentManager.ts
const maxConsequentCalls = 2;
const maxConsequentCallsPeriodMs = 200;
const cacheLifetimeMs = 500;
class EditableContentManager {
    constructor() {
        this._newElementsObserverConfig = {
            subtree: true, childList: true
        };
    }
    beginEditableContentHandling(doc) {
        this.overrideCssStyleDeclaration(doc);
        doc.addEventListener("DOMContentLoaded", () => {
            doc.querySelectorAll('[contenteditable="true"]').forEach(tag => {
                this.overrideInnerHtml(tag);
            });
        });
        new MutationObserver(this.newElementsObserverCallback.bind(this))
            .observe(doc.documentElement, this._newElementsObserverConfig);
    }
    newElementsObserverCallback(mutations, observer) {
        for (const mutation of mutations) {
            if (mutation.target instanceof HTMLElement &&
                mutation.target.contentEditable === "true") {
                this.overrideInnerHtml(mutation.target);
            }
        }
    }
    overrideInnerHtml(tag) {
        if (!tag.innerHtmlGetter) {
            tag.innerHtmlGetter = tag.__lookupGetter__('innerHTML');
            Object.defineProperty(tag, "innerHTML", {
                get: this.getInnerHtml.bind(this, tag),
                set: tag.__lookupSetter__('innerHTML').bind(tag)
            });
        }
    }
    getInnerHtml(tag) {
        if (tag.innerHtmlCache &&
            tag.innerHtmlCache.consequentCalls > maxConsequentCalls &&
            Date.now() - tag.innerHtmlCache.timestamp < cacheLifetimeMs) {
            return tag.innerHtmlCache.value;
        }
        tag.dispatchEvent(new CustomEvent("before-get-inner-html", { bubbles: true }));
        const consequentCalls = tag.innerHtmlCache &&
            Date.now() - tag.innerHtmlCache.timestamp < maxConsequentCallsPeriodMs
            ? tag.innerHtmlCache.consequentCalls + 1 : 1;
        tag.innerHtmlCache = {
            value: tag.innerHtmlGetter(), timestamp: Date.now(),
            consequentCalls: consequentCalls
        };
        tag.dispatchEvent(new CustomEvent("after-get-inner-html", { bubbles: false }));
        return tag.innerHtmlCache.value;
    }
    overrideCssStyleDeclaration(doc) {
        Object.defineProperty(doc.body.style.__proto__, "color", {
            configurable: true,
            get: this.getColor,
            set: this.setColor
        });
    }
    setColor(value) {
        this.setProperty("color", value);
    }
    getColor() {
        return this.getPropertyValue("--original-color") ||
            this.getPropertyValue("color");
    }
}

;// CONCATENATED MODULE: ./ts/PageScript/QueryCommandManager.ts
class QueryCommandManager {
    overrideQueryCommandValue(doc) {
        if (!doc.originalQueryCommandValue) {
            doc.originalQueryCommandValue = doc.queryCommandValue.bind(doc);
            doc.queryCommandValue = this.queryCommandValue.bind(this, doc);
        }
    }
    queryCommandValue(doc, command) {
        if (command === "foreColor" || command === "backColor") {
            let selection = doc.defaultView.getSelection();
            if (selection) {
                let range = selection.getRangeAt(0);
                if (range && range.commonAncestorContainer) {
                    let curPosElement = range.commonAncestorContainer instanceof HTMLElement
                        ? range.commonAncestorContainer
                        : range.commonAncestorContainer.parentElement;
                    if (curPosElement) {
                        let result;
                        switch (command) {
                            case "foreColor":
                                if (result = curPosElement.style.getPropertyValue("--original-color")) {
                                    return result;
                                }
                                break;
                            case "backColor":
                                if (result = curPosElement.style.getPropertyValue("--original-background-color")) {
                                    return result;
                                }
                                break;
                            default:
                                break;
                        }
                    }
                }
            }
        }
        return doc.originalQueryCommandValue(command);
    }
}

;// CONCATENATED MODULE: ./ts/PageScript/PageScriptStarter.ts


new EditableContentManager().beginEditableContentHandling(document);
new QueryCommandManager().overrideQueryCommandValue(document);
document.documentElement.dispatchEvent(new CustomEvent("PageScriptLoaded"));

/******/ })()
;