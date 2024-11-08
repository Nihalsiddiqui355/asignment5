function previewImage(event) {
    const file = event.target.files[0];
    const preview = document.getElementById('preview-img');

    if (file) {
      const reader = new FileReader();
      reader.onload = function(e) {
        preview.src = e.target.result;
        preview.style.display = 'block';
      }
      reader.readAsDataURL(file);
    }
  }

  function removeImage() {
    const preview = document.getElementById('preview-img');
    preview.src = '';
    preview.style.display = 'none';
    document.getElementById('file-upload').value = '';
  }


  // Camera 

  let stream;

// Function to preview uploaded image
function previewImage(event) {
  const file = event.target.files[0];
  const preview = document.getElementById('preview-img');
  const video = document.getElementById('camera-stream');

  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      preview.src = e.target.result;
      preview.style.display = 'block';
      video.style.display = 'none';
    };
    reader.readAsDataURL(file);
  }
}

// Function to open the front camera
async function openCamera() {
  const preview = document.getElementById('preview-img');
  const video = document.getElementById('camera-stream');
  const captureBtn = document.getElementById('capture-btn');

  try {
    // Request access to the camera, using the front camera if available
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user' }
    });
    video.srcObject = stream;
    video.style.display = 'block';
    preview.style.display = 'none';
    captureBtn.style.display = 'block';  // Show the capture button
  } catch (error) {
    console.error("Camera access denied or not available", error);
  }
}

// Function to capture photo and turn off camera
function capturePhoto() {
  const video = document.getElementById('camera-stream');
  const preview = document.getElementById('preview-img');
  const captureBtn = document.getElementById('capture-btn');
  
  // Create a canvas to capture a frame from the video
  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
  
  // Get the image data URL and display it in the preview
  preview.src = canvas.toDataURL('image/png');
  preview.style.display = 'block';
  video.style.display = 'none';
  captureBtn.style.display = 'none';

  // Stop the video stream immediately after capturing the photo
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
    stream = null;  // Clear the stream variable to avoid reusing the stopped stream
  }
}

// Function to remove the image preview
function removeImage() {
  const preview = document.getElementById('preview-img');
  const video = document.getElementById('camera-stream');
  const captureBtn = document.getElementById('capture-btn');
  
  preview.src = '';
  preview.style.display = 'none';
  video.style.display = 'none';
  captureBtn.style.display = 'none';
  document.getElementById('file-upload').value = '';
  
  // Stop the video stream if it is active
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
    stream = null;
  }
}


function generateImage() {
  // Example functionality: Show an alert
  alert("Generate button clicked! Add your custom generation logic here.");
  
  // Add more functionality here, like calling an API, modifying the preview, etc.
}