document.getElementById("newCanvas").addEventListener("click", newCanvas);

function newCanvas() {
  (async () => {
    const response = await chrome.runtime.sendMessage({ newCanvas: true });
    // do something with response here, not outside the function
    console.log(response);
  })();
}
