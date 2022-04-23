const t="waffle-rich-text-editor",e="aria-label";function s(t){const e=t.match(/gsheets:\/\/([^/]+)\/([^/]+)/);return {spreadsheetId:e?.[1],sheetId:e?.[2]}}function a(t){return t.startsWith("gsheets://")}

export { a, e, s, t };
