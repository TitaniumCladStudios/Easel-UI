let newEaselBtn = document.getElementById("newEasel");
// let toggleCanvasBtn = document.getElementById("toggleCanvas");
let loadImageBtn = document.getElementById("loadImage");


newEaselBtn.addEventListener("click", newEasel);
// toggleCanvasBtn.addEventListener("click", toggleCanvas);
loadImageBtn.addEventListener("click", loadImage, false);

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
    console.log(response);
  })();
}
