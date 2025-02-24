// background.js

function toggleCanvas() {
  let canvas = document.getElementById("overlayCanvas");

  if (canvas.style.display != "none") {
    canvas.style.display = "none";
  }
  else {
    canvas.style.display = "block";
  }
}

function toggleUploadModal() {
  let modal = document.getElementById("uploadModal");
  modal.showModal();
}

chrome.runtime.onMessage.addListener(
  async function (request, sender, sendResponse) {

    let queryOptions = { active: true, lastFocusedWindow: true };
    // `tab` will either be a `tabs.Tab` instance or `undefined`.
    let [tab] = await chrome.tabs.query(queryOptions);

    if (request.newEasel) {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['newCanvas.js']
      });

      sendResponse({ message: "New canvas spawned" });
    }
    else if (request.toggleCanvas) {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: toggleCanvas,
      });

      sendResponse({ message: "Canvas toggled" });
    }
    else if (request.loadImage) {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: toggleUploadModal,
      });

      sendResponse({ message: "Image Loaded" });
    }
    else {
      sendResponse({ farewell: "Could not perform action" });
    }
  }
);
