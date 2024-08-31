let currentScreen = "uploadScreen";
let cropper = null;
let selectedFrame = null;
let croppedImageData = null;

function showScreen(screenId) {
  document
    .querySelectorAll(".screen")
    .forEach((screen) => screen.classList.remove("active"));
  document.getElementById(screenId).classList.add("active");
  currentScreen = screenId;
}

document
  .getElementById("imageUpload")
  .addEventListener("change", function (event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = function (e) {
      const img = document.getElementById("imagePreview");
      img.src = e.target.result;
      img.style.display = "block";
      showScreen("cropScreen");
      if (cropper) {
        cropper.destroy();
      }
      cropper = new Cropper(img, {
        aspectRatio: 1,
        viewMode: 1,
        minContainerWidth: 300,
        minContainerHeight: 300,
      });
    };
    reader.readAsDataURL(file);
  });

document.getElementById("cropBtn").addEventListener("click", function () {
  const croppedCanvas = cropper.getCroppedCanvas({
    width: 1000,
    height: 1000,
  });
  // const canvas = document.getElementById("canvas");
  const canvas = document.getElementById("framePreview");
  canvas.width = croppedCanvas.width;
  canvas.height = croppedCanvas.height;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(croppedCanvas, 0, 0);
  croppedImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  showScreen("frameScreen");
});

// from web app
function applyFrame(frameSrc) {
  selectedFrame = frameSrc;
  const canvas = document.getElementById("framePreview");
  const ctx = canvas.getContext("2d");
  // Redraw the cropped image first
  if (croppedImageData) {
    ctx.putImageData(croppedImageData, 0, 0);
  }

  // Draw the selected frame over the image
  const frameImage = new Image();
  frameImage.src = selectedFrame;
  frameImage.onload = function () {
    ctx.drawImage(frameImage, 0, 0, canvas.width, canvas.height);
  };
}

document
  .getElementById("confirmFrameBtn")
  .addEventListener("click", function () {
    if (!selectedFrame) {
      alert("Please select a frame first.");
      return;
    }
    const canvas = document.getElementById("framePreview");
    const ctx = canvas.getContext("2d");
    ctx.putImageData(croppedImageData, 0, 0);
    const frameImage = new Image();
    frameImage.src = selectedFrame;
    frameImage.onload = function () {
      ctx.drawImage(frameImage, 0, 0, canvas.width, canvas.height);
      const finalCanvas = document.getElementById("finalCanvas");
      finalCanvas.width = canvas.width;
      finalCanvas.height = canvas.height;
      finalCanvas.getContext("2d").drawImage(canvas, 0, 0);
      showScreen("downloadScreen");
    };
  });

document.getElementById("saveBtn").addEventListener("click", function () {
  const finalCanvas = document.getElementById("finalCanvas");
  const link = document.createElement("a");
  link.href = finalCanvas.toDataURL("image/png");
  link.download = "framed-image.png";
  link.click();
});
