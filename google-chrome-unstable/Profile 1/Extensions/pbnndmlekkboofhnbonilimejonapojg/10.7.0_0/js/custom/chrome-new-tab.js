/******/ (() => { // webpackBootstrap
/******/ 	"use strict";

document.addEventListener("DOMContentLoaded", focusOnSearchBar);
function focusOnSearchBar() {
    const searchBar = document.getElementById("q");
    if (searchBar) {
        const mouseDown = new MouseEvent('mousedown', {
            view: window,
            bubbles: true,
            cancelable: true
        });
        searchBar.dispatchEvent(mouseDown);
    }
}

/******/ })()
;