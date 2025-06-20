// Chrome Extension Screenshot Utilities
// CSP-compliant element capture using native Chrome APIs

/**
 * Captures a screenshot of a specific element using Chrome's native screenshot API
 * @param {HTMLElement} element - The element to capture
 * @param {Object} options - Options for capture
 * @returns {Promise<HTMLCanvasElement>} - Canvas containing the element screenshot
 */
async function captureElement(element, options = {}) {
  try {
    // Get element position and dimensions
    const rect = element.getBoundingClientRect();
    
    const scrollX = window.scrollX || window.pageXOffset;
    const scrollY = window.scrollY || window.pageYOffset;
    
    // Calculate viewport position (what we see on screen)
    const viewportBounds = {
      left: Math.max(0, rect.left),
      top: Math.max(0, rect.top),
      width: rect.width,
      height: rect.height
    };
    
    // Check if element is visible in viewport
    const isVisible = rect.top < window.innerHeight && 
                     rect.bottom > 0 && 
                     rect.left < window.innerWidth && 
                     rect.right > 0;
    
    if (!isVisible) {
      element.scrollIntoView({ behavior: 'instant', block: 'center', inline: 'center' });
      
      // Wait for scroll to complete
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Recalculate after scroll
      const newRect = element.getBoundingClientRect();
      
      viewportBounds.left = Math.max(0, newRect.left);
      viewportBounds.top = Math.max(0, newRect.top);
      viewportBounds.width = newRect.width;
      viewportBounds.height = newRect.height;
    }
    
    // Send message to background script to capture screenshot
    const response = await new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({
        action: 'captureTab',
        bounds: viewportBounds,
        devicePixelRatio: window.devicePixelRatio || 1
      }, (response) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else if (!response) {
          reject(new Error('No response received from background script'));
        } else {
          resolve(response);
        }
      });
    });
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to capture screenshot');
    }
    
    // Create canvas from the cropped image data
    const canvas = await createCanvasFromDataUrl(response.dataUrl);
    
    return canvas;
    
  } catch (error) {
    console.error('Error capturing element:', error);
    throw error;
  }
}

/**
 * Creates a canvas from a data URL
 * @param {string} dataUrl - The data URL of the image
 * @returns {Promise<HTMLCanvasElement>} - Canvas containing the image
 */
function createCanvasFromDataUrl(dataUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      canvas.width = img.width;
      canvas.height = img.height;
      
      ctx.drawImage(img, 0, 0);
      resolve(canvas);
    };
    img.onerror = reject;
    img.src = dataUrl;
  });
}

/**
 * Helper function to convert canvas to ArrayBuffer (same as before)
 * @param {HTMLCanvasElement} canvas - The canvas to convert
 * @returns {Promise<ArrayBuffer>} - ArrayBuffer of the canvas image
 */
function canvasToBuffer(canvas) {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result);
      };
      reader.readAsArrayBuffer(blob);
    });
  });
}

// Export functions to global scope
window.captureElement = captureElement;
window.canvasToBuffer = canvasToBuffer;
