let dataURL = localStorage.getItem("storedEasel");

if (dataURL != null && dataURL != "") {
  console.log("loading canvas");
  spawnPersistedCanvas(dataURL);
}

function spawnPersistedCanvas(dataURL) {
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
  canvas.style.boxSizing = "border-box";
  canvas.setAttribute("data-layer-number", 0);

  // Add the canvas
  document.body.appendChild(canvas);

  let img = new Image();
  img.src = dataURL;
  let ctx = canvas.getContext("2d");
  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let imageX = 0;
  let imageY = 0;
  img.onload = () => {
    console.log(img);
    ctx.drawImage(img, 0, 0);

    canvas.addEventListener("mousedown", (event) => {
      isDragging = true;
      startX = event.clientX - canvas.offsetLeft;
      startY = event.clientY - canvas.offsetTop;
    });

    canvas.addEventListener("mousemove", (event) => {
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

    canvas.addEventListener("mouseup", () => {
      isDragging = false;
      saveCanvas(canvas);
    });
  };
}

function saveCanvas(canvas) {
  localStorage.setItem("storedEasel", canvas.toDataURL());
}
