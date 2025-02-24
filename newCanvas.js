// This script adds in a canvas element that overlays the entire page

// Check if the canvas exists and add it. Otherwise, remove it.
if (document.getElementById("overlayCanvas") === null) {
  spawnCanvas();
}
else {
  document.body.removeChild(document.getElementById("overlayCanvas"));
  if (window.confirm("Do you want to start a new canvas? Unsaved changes will be lost.")) {
    spawnCanvas();
  }
}

function spawnCanvas() {
  // Create the canvas
  let canvas = document.createElement("canvas");

  // Style the canvas
  canvas.id = "overlayCanvas";
  canvas.width = document.documentElement.clientWidth;
  canvas.height = document.documentElement.clientHeight;
  canvas.style.position = "fixed";
  canvas.style.top = "0";
  canvas.style.left = "0";
  canvas.style.zIndex = "1000";
  canvas.style.border = "1px solid red";
  canvas.style.boxSizing = "border-box";
  canvas.setAttribute("data-layer-number", 0)

  // Add the canvas
  document.body.appendChild(canvas);

  // Create an image uploader modal
  let uploadModal = document.createElement("dialog");
  uploadModal.id = "uploadModal";
  uploadModal.style.position = "fixed";
  uploadModal.style.top = "10%";
  uploadModal.style.border = "none";
  uploadModal.style.width = "500px";
  uploadModal.style.borderRadius = "15px";
  uploadModal.style.boxShadow = "box-shadow: 0px 10px 15px -3px rgba(0,0,0,0.1)"

  // Create the image uploader input
  let imageInput = document.createElement("input");

  imageInput.type = "file";
  imageInput.id = "imageLoader";
  imageInput.position = "absolute";
  imageInput.addEventListener("change", handleImage, false);

  // Add the input to the modal
  uploadModal.appendChild(imageInput);

  // Add the modal to the document
  document.body.appendChild(uploadModal);

}

function handleImage(e) {
  let canvas = document.getElementById('overlayCanvas');
  let ctx = canvas.getContext('2d');

  let isDragging = false;

  let startX = 0;

  let startY = 0;

  let imageX = 0;

  let imageY = 0;

  let reader = new FileReader();
  reader.onload = function (event) {
    let img = new Image();
    img.onload = () => {

      // Draw the image initially

      ctx.drawImage(img, imageX, imageY);



      canvas.addEventListener('mousedown', (event) => {

        isDragging = true;

        startX = event.clientX - canvas.offsetLeft;

        startY = event.clientY - canvas.offsetTop;

      });



      canvas.addEventListener('mousemove', (event) => {

        if (isDragging) {

          const deltaX = event.clientX - canvas.offsetLeft - startX;

          const deltaY = event.clientY - canvas.offsetTop - startY;

          imageX += deltaX;

          imageY += deltaY;



          // Clear canvas and redraw the image at new position

          ctx.clearRect(0, 0, canvas.width, canvas.height);

          ctx.drawImage(img, imageX, imageY);

          startX = event.clientX - canvas.offsetLeft;

          startY = event.clientY - canvas.offsetTop;

        }

      });



      canvas.addEventListener('mouseup', () => {

        isDragging = false;

      });

    };
    img.src = event.target.result;
  }
  reader.readAsDataURL(e.target.files[0]);
  document.getElementById("uploadModal").close();
}
