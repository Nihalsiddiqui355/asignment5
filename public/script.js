let stream; // Global variable for the video stream

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

// Function to remove image preview
function removeImage() {
  const preview = document.getElementById('preview-img');
  const video = document.getElementById('camera-stream');
  const captureBtn = document.getElementById('capture-btn');

  preview.src = '';
  preview.style.display = 'none';
  video.style.display = 'none';
  captureBtn.style.display = 'none';
  document.getElementById('file-upload').value = '';

  if (stream) {
    stream.getTracks().forEach(track => track.stop());
    stream = null;
  }
}

// Drag-and-drop functionality for uploading images
const uploadContainer = document.querySelector('.upload-container');

document.querySelector('.upload-btn').addEventListener('click', () => {
  document.getElementById('file-upload').click();
});

uploadContainer.addEventListener('dragover', (e) => {
  e.preventDefault();
  const isValid = e.dataTransfer.items[0].type.startsWith("image/");
  uploadContainer.classList.toggle('invalid', !isValid);
});

uploadContainer.addEventListener('dragleave', () => {
  uploadContainer.classList.remove('dragging');
});

uploadContainer.addEventListener('drop', (e) => {
  e.preventDefault();
  uploadContainer.classList.remove('dragging');

  const file = e.dataTransfer.files[0];
  if (file && (file.type === "image/png" || file.type === "image/jpeg" || file.type === "image/gif")) {
    document.getElementById('file-upload').files = e.dataTransfer.files;
    previewImage({ target: document.getElementById('file-upload') });
  } else {
    alert("Only PNG, JPG, or GIF files are accepted.");
  }
});

// Camera Functions

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

// Function to capture photo and turn off the camera
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

// API functions

// Function to upload and process the image, then display the result
async function uploadAndProcessImage(imageUrl) {
  const api_key = "SG_b09009ee752d4891"; // Replace with your actual API key
  const url = "https://api.segmind.com/v1/live-portrait";

  try {
    // Convert image URL to base64
    const faceImageBase64 = await imageUrlToBase64(imageUrl);

    // Prepare the data to send to the API
    const data = {
      face_image: faceImageBase64,
      driving_video: "https://segmind-sd-models.s3.amazonaws.com/display_images/liveportrait-video.mp4", // Replace with actual video URL if needed
      live_portrait_dsize: 512,
      live_portrait_scale: 2.3,
      video_frame_load_cap: 128,
      live_portrait_lip_zero: true,
      live_portrait_relative: true,
      live_portrait_vx_ratio: 0,
      live_portrait_vy_ratio: -0.12,
      live_portrait_stitching: true,
      video_select_every_n_frames: 1,
      live_portrait_eye_retargeting: false,
      live_portrait_lip_retargeting: false,
      live_portrait_lip_retargeting_multiplier: 1,
      live_portrait_eyes_retargeting_multiplier: 1
    };

    // Send the data to the API
    const response = await axios.post(url, data, { headers: { 'x-api-key': api_key } });

    // Log the entire response to see its structure
    console.log('API Response:', response.data);

    // Handle the API response (generated video or image)
    displayGeneratedPreview(response.data);  // Function to display the result
  } catch (error) {
    // Log error response to inspect the error message
    console.error('Error:', error.response ? error.response.data : error.message);
  }
}

// Function to display the generated preview
function displayGeneratedPreview(responseData) {
  const previewContainer = document.getElementById('preview-container');

  // Log the response data for debugging
  console.log('Generated data:', responseData);

  // Check if the response has generated image or video and display it
  if (responseData.generated_image) {
    const imgElement = document.createElement('img');
    imgElement.src = `data:image/png;base64,${responseData.generated_image}`;
    previewContainer.innerHTML = ''; // Clear previous content
    previewContainer.appendChild(imgElement);
  } else if (responseData.generated_video) {
    const videoElement = document.createElement('video');
    videoElement.src = responseData.generated_video; // Replace with actual video URL if provided in the response
    videoElement.controls = true;
    previewContainer.innerHTML = ''; // Clear previous content
    previewContainer.appendChild(videoElement);
  } else {
    previewContainer.innerHTML = 'Error: No valid response received.';
  }
}

// Trigger the upload and process image on the Generate button click
function generateImage() {
  const imageUrl = 'https://segmind-sd-models.s3.amazonaws.com/display_images/liveportrait-input.jpg';  // Replace with the actual image URL or image from user upload
  uploadAndProcessImage(imageUrl);
}

// Convert image URL to Base64 format
async function imageUrlToBase64(url) {
  const response = await fetch(url);
  const blob = await response.blob();
  const reader = new FileReader();

  return new Promise((resolve, reject) => {
    reader.onloadend = () => resolve(reader.result.split(',')[1]); // Return only Base64 string
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
