// background.js

function toggleCanvas() {
  let canvas = document.getElementById("overlayCanvas");

  if (canvas.style.display != "none") {
    canvas.style.display = "none";
  } else {
    canvas.style.display = "block";
  }
}

function toggleUploadModal() {
  let modal = document.getElementById("uploadModal");
  modal.showModal();
}

function changeOpacity(opacity) {
  let layer = document.getElementById("overlayCanvas");
  if (layer == null) return;
  layer.style.opacity = opacity * 0.01;
}

chrome.runtime.onMessage.addListener(
  async function (request, sender, sendResponse) {
    let queryOptions = { active: true, lastFocusedWindow: true };
    // `tab` will either be a `tabs.Tab` instance or `undefined`.
    let [tab] = await chrome.tabs.query(queryOptions);

    if (request.newEasel) {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["newCanvas.js"],
      });
    } else if (request.toggleCanvas) {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: toggleCanvas,
      });
    } else if (request.loadImage) {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: toggleUploadModal,
      });
    } else if (request.changeOpacity) {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: changeOpacity,
        args: [request.opacity],
      });
    } else {
      console.error("Message failed to process");
    }

    return true;
  },
);

function deleteImage() {
  let canvas = document.getElementById("overlayCanvas");
  if (canvas != null) {
    let ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
}

chrome.commands.onCommand.addListener(async (command) => {
  let queryOptions = { active: true, lastFocusedWindow: true };
  // `tab` will either be a `tabs.Tab` instance or `undefined`.
  let [tab] = await chrome.tabs.query(queryOptions);

  if (command == "delete-image") {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: deleteImage,
    });
  }
});
