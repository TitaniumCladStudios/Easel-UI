// This script adds in a canvas element that overlays the entire page
let canvas = document.createElement("canvas");
canvas.id = "overlayCanvas";
canvas.style.width = "100%";
canvas.style.height = "100vh";
canvas.style.position = "fixed";
canvas.style.top = "0";
canvas.style.left = "0";
canvas.style.backgroundColor = "red";
canvas.style.opacity = ".5";
canvas.style.zIndex = "1000";
document.body.appendChild(canvas);
