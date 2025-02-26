let newEaselBtn = document.getElementById("newEasel");
let toggleCanvasBtn = document.getElementById("toggleCanvas");
let loadImageBtn = document.getElementById("loadImage");
let opacitySlider = document.getElementById("opacity");
let scaleSlider = document.getElementById("scale");

let layerCount = 0;

newEaselBtn.message = { newEasel: true };
toggleCanvasBtn.message = { toggleCanvas: true };
loadImageBtn.message = { loadImage: true };
newEaselBtn.addEventListener("click", sendMessage, false);
toggleCanvasBtn.addEventListener("click", sendMessage, false);
loadImageBtn.addEventListener("click", sendMessage, false);
opacitySlider.addEventListener("input", changeOpacity);
scaleSlider.addEventListener("input", changeScale);

function sendMessage(e) {
  (async () => {
    const response = await chrome.runtime.sendMessage(e.currentTarget.message);
    console.log(response);
  })();
}

// Had to declare a special function here for the time being
function changeOpacity() {
  (async () => {
    const response = await chrome.runtime.sendMessage({
      changeOpacity: true,
      opacity: opacitySlider.value,
    });
    console.log(response);
  })();
}

function changeScale() {
  (async () => {
    const response = await chrome.runtime.sendMessage({
      changeScale: true,
      scale: scaleSlider.value,
    });
    console.log(response);
  })();
}
