let newCanvasBtn = document.getElementById("newCanvas");
let toggleCanvasBtn = document.getElementById("toggleCanvas");


newCanvasBtn.addEventListener("click", newCanvas);
toggleCanvasBtn.addEventListener("click", toggleCanvas);

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
