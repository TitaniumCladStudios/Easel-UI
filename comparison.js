// Initialize Figma API with stored settings
let api = null;
let figmaFileKey = null;

// Load settings and initialize
async function initializeSettings() {
  try {
    const result = await chrome.storage.sync.get(['figmaToken', 'figmaFileKey']);
    
    if (!result.figmaToken || !result.figmaFileKey) {
      console.error('Figma settings not configured. Please set your token and file key in the extension popup.');
      return false;
    }
    
    // Initialize Figma API with stored token
    api = new Figma.Api({
      personalAccessToken: result.figmaToken,
    });
    
    figmaFileKey = result.figmaFileKey;
    return true;
  } catch (error) {
    console.error('Error loading Figma settings:', error);
    return false;
  }
}

function findComponentsByName(components, searchString) {
  const matchingComponents = {};

  for (const [key, component] of Object.entries(components)) {
    if (
      component.name &&
      component.name.toLowerCase().includes(searchString.toLowerCase())
    ) {
      matchingComponents[key] = component;
    }
  }

  return matchingComponents;
}

// Helper function to convert canvas to ArrayBuffer
function canvasToBuffer(canvas) {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result); // This will be an ArrayBuffer
      };
      reader.readAsArrayBuffer(blob);
    });
  });
}

// Main comparison function
async function runComparison(componentIndex = 0) {
  // Initialize settings first
  const settingsLoaded = await initializeSettings();
  if (!settingsLoaded) {
    return;
  }

  // Get the Easel components
  api
    .getFile({ file_key: figmaFileKey })
    .then(async (file) => {
      let figmaComponents = document.querySelectorAll("[data-figma-component]");
      
      // Use the specified component index, or default to first component
      if (componentIndex >= figmaComponents.length) {
        console.error(`Component index ${componentIndex} is out of range. Found ${figmaComponents.length} components.`);
        return;
      }
      
      const selectedComponent = figmaComponents[componentIndex];
      const searchTerm = selectedComponent?.getAttribute("data-figma-component");
      
      if (!searchTerm) {
        console.error('No component found or no data-figma-component attribute');
        return;
      }
      
      console.log(`Comparing component: "${searchTerm}" (index: ${componentIndex})`);
      
      const matchingComponents = findComponentsByName(
        file.components,
        searchTerm
      );

      // Wait for captureElement to complete and get the local image canvas
      const localCanvas = await captureElement(selectedComponent);

      const componentIds = Object.keys(matchingComponents);

      if (componentIds.length === 0) {
        return;
      }

      // Debug: Let's see what we're actually passing
      const imageParams = {
        file_key: figmaFileKey,
        ids: componentIds.join(","), // Join IDs with comma as string
        format: "png",
      };

      // Try to get images for these component IDs
      return api
        .getImages(
          { file_key: figmaFileKey },
          { ids: imageParams.ids }
        )
        .then(async (images) => {
          
          // Fetch the Figma image from the URL and convert to buffer
          const figmaImageUrl = images.images[componentIds[0]];
          if (!figmaImageUrl) {
            return;
          }

          try {
            const response = await fetch(figmaImageUrl);
            const figmaImageBuffer = await response.arrayBuffer();
            
            // Only need to convert Figma image from buffer to Image object
            const figmaImageBlob = new Blob([figmaImageBuffer], { type: 'image/png' });
            const figmaImageObjectUrl = URL.createObjectURL(figmaImageBlob);
            
            // Load Figma image
            const figmaImg = new Image();
            
            const loadImage = (img, src) => {
              return new Promise((resolve, reject) => {
                img.onload = () => resolve(img);
                img.onerror = reject;
                img.src = src;
              });
            };
            
            try {
              // Only need to load the Figma image
              await loadImage(figmaImg, figmaImageObjectUrl);
              
              // Create canvases to get image data
              const comparisonLocalCanvas = document.createElement('canvas');
              const localCtx = comparisonLocalCanvas.getContext('2d');
              const figmaCanvas = document.createElement('canvas');
              const figmaCtx = figmaCanvas.getContext('2d');
              
              // Calculate the target dimensions (use the smaller of the two)
              const targetWidth = Math.min(localCanvas.width, figmaImg.width);
              const targetHeight = Math.min(localCanvas.height, figmaImg.height);
              
              // Set canvas dimensions to target size
              comparisonLocalCanvas.width = targetWidth;
              comparisonLocalCanvas.height = targetHeight;
              figmaCanvas.width = targetWidth;
              figmaCanvas.height = targetHeight;
              
              // Draw images at target size
              localCtx.drawImage(localCanvas, 0, 0, targetWidth, targetHeight);
              figmaCtx.drawImage(figmaImg, 0, 0, targetWidth, targetHeight);
              
              // Get image data (now both will be the same size)
              const localImageData = localCtx.getImageData(0, 0, targetWidth, targetHeight);
              const figmaImageData = figmaCtx.getImageData(0, 0, targetWidth, targetHeight);
              
              // Create diff canvas with the same dimensions
              const diffCanvas = document.createElement('canvas');
              diffCanvas.width = targetWidth;
              diffCanvas.height = targetHeight;
              const diffCtx = diffCanvas.getContext('2d');
              const diffImageData = diffCtx.createImageData(targetWidth, targetHeight);
              
              // Perform pixelmatch comparison (now with guaranteed same dimensions)
              const numDiffPixels = pixelmatch(
                localImageData.data,
                figmaImageData.data,
                diffImageData.data,
                targetWidth,
                targetHeight,
                { threshold: 0.1 }
              );
              
              // Calculate similarity percentage
              const totalPixels = targetWidth * targetHeight;
              const similarityPercentage = ((totalPixels - numDiffPixels) / totalPixels * 100).toFixed(2);
              
              // Log results
              console.log('=== PIXELMATCH COMPARISON RESULTS ===');
              console.log('Comparison dimensions:', `${targetWidth}x${targetHeight}`);
              console.log('Different pixels:', numDiffPixels);
              console.log('Total pixels compared:', totalPixels);
              console.log('Similarity percentage:', `${similarityPercentage}%`);
              console.log('Images match:', numDiffPixels === 0 ? 'YES' : 'NO');
              
              // Put the diff image data onto the canvas and create download link
              diffCtx.putImageData(diffImageData, 0, 0);
              
              // Create download link for the diff image
              diffCanvas.toBlob((blob) => {
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `image-diff-${Date.now()}.png`;
                link.textContent = 'Download Image Diff';
                link.style.cssText = `
                  display: block;
                  margin: 10px 0;
                  padding: 10px 15px;
                  background: #007bff;
                  color: white;
                  text-decoration: none;
                  border-radius: 5px;
                  font-family: Arial, sans-serif;
                  width: fit-content;
                  position: fixed;
                  top: 20px;
                  right: 20px;
                  z-index: 10000;
                  box-shadow: 0 2px 10px rgba(0,0,0,0.3);
                `;
                
                // Add the download link to the page
                document.body.appendChild(link);
                
                // Clean up the object URL after a delay
                setTimeout(() => {
                  URL.revokeObjectURL(url);
                  // Remove the link after 30 seconds
                  if (link.parentNode) {
                    link.parentNode.removeChild(link);
                  }
                }, 30000); // Clean up after 30 seconds
              }, 'image/png');
              
              // Clean up object URLs
              URL.revokeObjectURL(figmaImageObjectUrl);
              
            } catch (imageLoadError) {
              console.error('Error loading images:', imageLoadError);
            }
          } catch (fetchError) {
            console.error('Error fetching Figma image:', fetchError);
          }
        })
        .catch((error) => {
          console.error("Error fetching images:", error);
        });
    })
    .catch((error) => {
      console.error("Error fetching file:", error);
    });
}

// Listen for settings updates
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'settingsUpdated') {
    // Reinitialize with new settings
    initializeSettings();
  } else if (request.action === 'runComparison') {
    // Handle comparison request from popup
    const componentIndex = request.componentIndex || 0;
    runComparison(componentIndex);
    sendResponse({ success: true });
  }
});

// Initialize settings when the script loads
initializeSettings();
