let newEaselBtn = document.getElementById("newEasel");
let toggleCanvasBtn = document.getElementById("toggleCanvas");
let loadImageBtn = document.getElementById("loadImage");
let opacitySlider = document.getElementById("opacity");

let layerCount = 0;

newEaselBtn.message = { newEasel: true };
toggleCanvasBtn.message = { toggleCanvas: true };
loadImageBtn.message = { loadImage: true };
newEaselBtn.addEventListener("click", sendMessage, false);
toggleCanvasBtn.addEventListener("click", sendMessage, false);
loadImageBtn.addEventListener("click", sendMessage, false);
opacitySlider.addEventListener("change", changeOpacity);

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
