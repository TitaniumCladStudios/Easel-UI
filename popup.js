let newEaselBtn = document.getElementById("newEasel");
// let toggleCanvasBtn = document.getElementById("toggleCanvas");
let loadImageBtn = document.getElementById("loadImage");
let opacitySlider = document.getElementById("opacity");

let layerCount = 0;

newEaselBtn.addEventListener("click", newEasel);
// toggleCanvasBtn.addEventListener("click", toggleCanvas);
loadImageBtn.addEventListener("click", loadImage, false);
opacitySlider.addEventListener("change", changeOpacity);

function newEasel() {
  (async () => {
    const response = await chrome.runtime.sendMessage({ newEasel: true });
    console.log(response);
  })();
}

function toggleCanvas() {
  (async () => {
    const response = await chrome.runtime.sendMessage({ toggleCanvas: true });
    console.log(response);
  })();
}

function loadImage() {
  (async () => {
    const response = await chrome.runtime.sendMessage({ loadImage: true });
  })();
}

function changeOpacity() {
  (async () => {
    const response = await chrome.runtime.sendMessage({
      changeOpacity: true,
      opacity: opacitySlider.value,
    });
    console.log(response);
  })();
}
