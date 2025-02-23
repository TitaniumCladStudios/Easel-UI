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

function loadImage() {
  let canvas = document.getElementById('overlayCanvas');
  let ctx = canvas.getContext('2d');

  let reader = new FileReader();
  reader.onload = function (event) {
    let img = new Image();
    img.onload = function () {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
    }
    img.src = event.target.result;
  }
  reader.readAsDataURL(chrome.storage.local.fileToUpload);

}



chrome.runtime.onMessage.addListener(
  async function (request, sender, sendResponse) {

    let queryOptions = { active: true, lastFocusedWindow: true };
    // `tab` will either be a `tabs.Tab` instance or `undefined`.
    let [tab] = await chrome.tabs.query(queryOptions);

    if (request.newCanvas) {
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
      chrome.storage.local.set({
        fileToUpload: request.file,
      });
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: loadImage,
      });

      sendResponse({ message: "Image Loaded" });
    }
    else {
      sendResponse({ farewell: "Could not perform action" });
    }
  }
);
