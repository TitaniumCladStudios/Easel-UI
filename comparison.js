const api = new Figma.Api({
  personalAccessToken: "**PAT**",
});

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

// Get the Easel components
api
  .getFile({ file_key: "IzcoLf3zv0AQuLc0KkvJBA" })
  .then(async (file) => {
    let figmaComponents = document.querySelectorAll("[data-figma-component]");
    const searchTerm = figmaComponents[0]?.getAttribute("data-figma-component");
    const matchingComponents = findComponentsByName(
      file.components,
      searchTerm
    );

    // Wait for captureElement to complete and get the local image
    const canvas = await captureElement(figmaComponents[0]);
    const localImageBuffer = await canvasToBuffer(canvas);
    
    console.log("Local image buffer:", localImageBuffer);

    const componentIds = Object.keys(matchingComponents);
    console.log("Component IDs:", componentIds);
    console.log("Component IDs length:", componentIds.length);
    console.log("First component ID:", componentIds[0]);

    if (componentIds.length === 0) {
      console.log("No matching components found, skipping image fetch");
      return;
    }

    // Debug: Let's see what we're actually passing
    const imageParams = {
      file_key: "IzcoLf3zv0AQuLc0KkvJBA",
      ids: componentIds.join(","), // Join IDs with comma as string
      format: "png",
    };
    console.log("Image API params:", imageParams);

    // Try to get images for these component IDs
    return api
      .getImages(
        { file_key: "IzcoLf3zv0AQuLc0KkvJBA" },
        { ids: imageParams.ids }
      )
      .then(async (images) => {
        console.log("Images:", images.images[componentIds[0]]);
        
        // Fetch the Figma image from the URL and convert to buffer
        const figmaImageUrl = images.images[componentIds[0]];
        if (!figmaImageUrl) {
          console.error("No image URL found for component:", componentIds[0]);
          return;
        }
        
        try {
          const response = await fetch(figmaImageUrl);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const figmaImageBuffer = await response.arrayBuffer();
          console.log("Figma image buffer:", figmaImageBuffer);
          
          // Convert ArrayBuffers to Image objects for pixelmatch comparison
          const localImageBlob = new Blob([localImageBuffer], { type: 'image/png' });
          const figmaImageBlob = new Blob([figmaImageBuffer], { type: 'image/png' });
          
          // Create image URLs for loading
          const localImageObjectUrl = URL.createObjectURL(localImageBlob);
          const figmaImageObjectUrl = URL.createObjectURL(figmaImageBlob);
          
          // Load both images
          const localImg = new Image();
          const figmaImg = new Image();
          
          const loadImage = (img, src) => {
            return new Promise((resolve, reject) => {
              img.onload = () => resolve(img);
              img.onerror = reject;
              img.src = src;
            });
          };
          
          try {
            await Promise.all([
              loadImage(localImg, localImageObjectUrl),
              loadImage(figmaImg, figmaImageObjectUrl)
            ]);
            
            // Create canvases to get image data
            const localCanvas = document.createElement('canvas');
            const figmaCanvas = document.createElement('canvas');
            const localCtx = localCanvas.getContext('2d');
            const figmaCtx = figmaCanvas.getContext('2d');
            
            // Calculate the target dimensions (use the smaller of the two)
            const targetWidth = Math.min(localImg.width, figmaImg.width);
            const targetHeight = Math.min(localImg.height, figmaImg.height);
            
            console.log('Original dimensions:');
            console.log(`Local: ${localImg.width}x${localImg.height}`);
            console.log(`Figma: ${figmaImg.width}x${figmaImg.height}`);
            console.log(`Target: ${targetWidth}x${targetHeight}`);
            
            // Set both canvases to the same target dimensions
            localCanvas.width = targetWidth;
            localCanvas.height = targetHeight;
            figmaCanvas.width = targetWidth;
            figmaCanvas.height = targetHeight;
            
            // Draw images to canvases, resizing them to fit the target dimensions
            localCtx.drawImage(localImg, 0, 0, targetWidth, targetHeight);
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
              
              console.log('Diff image download link created and added to page');
              
              // Optional: Auto-click to download immediately
              // link.click();
              
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
            URL.revokeObjectURL(localImageObjectUrl);
            URL.revokeObjectURL(figmaImageObjectUrl);
            
          } catch (imageLoadError) {
            console.error('Error loading images for comparison:', imageLoadError);
          }
          
        } catch (error) {
          console.error("Error fetching Figma image:", error);
        }
        
      })
      .catch((error) => {
        console.error("Error fetching images:", error);
        console.error("Error details:", error.response?.data || error.message);
      });
  })
  .catch((error) => {
    console.error("Error fetching file:", error);
  });
