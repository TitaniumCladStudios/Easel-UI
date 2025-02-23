let newCanvasBtn = document.getElementById("newCanvas");

newCanvasBtn.addEventListener("click", newCanvas);

let canvasShown = false;

function newCanvas() {
  (async () => {
    const response = await chrome.runtime.sendMessage({ newCanvas: true });
    canvasShown = !canvasShown

    if (canvasShown) {
      newCanvasBtn.classList.add("red");
    }
    else {
      newCanvasBtn.classList.remove("red");
    }

    // do something with response here, not outside the function
    console.log(response);
  })();
}
