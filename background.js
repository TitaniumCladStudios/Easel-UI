// background.js

function toggleCanvas() {
  let canvas = document.getElementById("overlayCanvas");

  if (canvas.style.display != "none") {
    canvas.style.display = "none";
  } else {
    canvas.style.display = "block";
  }
}

function changeOpacity(opacity) {
  let layer = document.getElementById("overlayCanvas");
  if (layer == null) return;
  layer.style.opacity = opacity * 0.01;
}
function changeScale(scale) {
  let layer = document.getElementById("overlayCanvas");
  if (layer == null) return;
  layer.style.scale = 1 + scale / 100;
}

function deleteEasel() {
  document.body.removeChild(document.getElementById("overlayCanvas"));
  localStorage.removeItem("storedEasel");
}

/**
 * Crops an image to specified bounds
 * @param {string} dataUrl - The original image data URL
 * @param {Object} bounds - The bounds to crop to {left, top, width, height}
 * @param {number} devicePixelRatio - The device pixel ratio for scaling
 * @returns {Promise<string>} - Cropped image data URL
 */
async function cropImage(dataUrl, bounds, devicePixelRatio = 1) {
  try {
    // Convert data URL to blob
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    
    // Create ImageBitmap from blob (works in service workers)
    const imageBitmap = await createImageBitmap(blob);
    
    // Create OffscreenCanvas for cropping
    const canvas = new OffscreenCanvas(
      bounds.width * devicePixelRatio,
      bounds.height * devicePixelRatio
    );
    const ctx = canvas.getContext('2d');
    
    // Draw the cropped portion of the image
    ctx.drawImage(
      imageBitmap,
      bounds.left * devicePixelRatio,
      bounds.top * devicePixelRatio,
      bounds.width * devicePixelRatio,
      bounds.height * devicePixelRatio,
      0,
      0,
      bounds.width * devicePixelRatio,
      bounds.height * devicePixelRatio
    );
    
    // Convert back to blob then to data URL
    const croppedBlob = await canvas.convertToBlob({ type: 'image/png' });
    
    // Convert blob to data URL
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(croppedBlob);
    });
  } catch (error) {
    throw error;
  }
}

chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
    let queryOptions = { active: true, lastFocusedWindow: true };

    if (request.action === 'captureTab') {
      // Handle screenshot capture asynchronously
      (async () => {
        try {
          // `tab` will either be a `tabs.Tab` instance or `undefined`.
          let [tab] = await chrome.tabs.query(queryOptions);
          
          // Capture the visible tab
          const dataUrl = await chrome.tabs.captureVisibleTab(tab.windowId, {
            format: 'png',
            quality: 100
          });
          
          // Crop the image to the specified bounds
          const croppedDataUrl = await cropImage(dataUrl, request.bounds, request.devicePixelRatio);
          
          sendResponse({ success: true, dataUrl: croppedDataUrl });
        } catch (error) {
          sendResponse({ success: false, error: error.message });
        }
      })();
      
      return true; // Keep message channel open for async response
    } else {
      // Handle other requests synchronously
      chrome.tabs.query(queryOptions).then(([tab]) => {
        if (request.toggleCanvas) {
          chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: toggleCanvas,
          });
        } else if (request.loadImage) {
          chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ["newCanvas.js"],
          });
        } else if (request.changeOpacity) {
          chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: changeOpacity,
            args: [request.opacity],
          });
        } else if (request.changeScale) {
          chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: changeScale,
            args: [request.scale],
          });
        } else if (request.deleteEasel) {
          chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: deleteEasel,
          });
        } else {
          console.error("Message failed to process");
        }
      });
    }

    return false; // Don't keep channel open for non-async requests
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
  } else if (command == "open-menu") {
    chrome.action.openPopup();
  }
});
