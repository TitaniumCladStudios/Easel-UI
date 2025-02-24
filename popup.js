let newCanvasBtn = document.getElementById("newCanvas");
let toggleCanvasBtn = document.getElementById("toggleCanvas");
let loadImageBtn = document.getElementById("loadImage");


newCanvasBtn.addEventListener("click", newCanvas);
toggleCanvasBtn.addEventListener("click", toggleCanvas);
loadImageBtn.addEventListener("click", loadImage, false);

function newCanvas() {
  (async () => {
    const response = await chrome.runtime.sendMessage({ newCanvas: true });
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
