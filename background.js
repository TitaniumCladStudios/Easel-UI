// background.js

chrome.runtime.onMessage.addListener(
  async function (request, sender, sendResponse) {
    if (request.newCanvas) {
      let queryOptions = { active: true, lastFocusedWindow: true };
      // `tab` will either be a `tabs.Tab` instance or `undefined`.
      let [tab] = await chrome.tabs.query(queryOptions);

      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js']
      });

      sendResponse({ farewell: "New canvas spawned" });
    }
    else {
      sendResponse({ farewell: "Could not create canvas" });
    }
  }
);
