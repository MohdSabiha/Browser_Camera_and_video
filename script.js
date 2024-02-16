const video = document.getElementById('video');
const audio = document.getElementById('audio');
const captureBtn = document.getElementById('capture-btn');
const recordBtn = document.getElementById('record-btn');
const recordTimeDisplay = document.getElementById('record-time');
let isRecording = false;
let mediaRecorder;
let recordedChunks = [];
let startTime;

// Access user's camera and microphone
navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    .then(stream => {
        video.srcObject = stream;
        audio.srcObject = stream;
        initializeMediaRecorder(stream);
    })
    .catch(error => console.error('Error accessing camera and microphone:', error));

function initializeMediaRecorder(stream) {
    const options = { mimeType: 'video/webm; codecs=vp9' };
    mediaRecorder = new MediaRecorder(stream, options);

    mediaRecorder.ondataavailable = event => {
        if (event.data.size > 0) {
            recordedChunks.push(event.data);
        }
    };

    mediaRecorder.onstart = () => {
        startTime = Date.now();
        updateRecordTime();
    };

    mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunks, { type: 'video/webm' });
        const downloadLink = document.createElement('a');
        downloadLink.href = URL.createObjectURL(blob);
        downloadLink.download = 'recorded_video.webm';
        downloadLink.click();
        isRecording = false;
        recordBtn.textContent = 'Record';
        recordTimeDisplay.textContent = 'Recording Time: 00:00';
        recordedChunks = [];
    };
}

// Capture Photo
function capturePhoto() {
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const downloadLink = document.createElement('a');
    downloadLink.href = canvas.toDataURL('image/png');
    downloadLink.download = 'captured_photo.png';
    downloadLink.click();
}

// Toggle Recording
function toggleRecording() {
    if (isRecording) {
        stopRecording();
    } else {
        startRecording();
    }
}

// Start Recording
function startRecording() {
    recordedChunks = [];
    mediaRecorder.start();
    isRecording = true;
    recordBtn.textContent = 'Stop';
}

// Stop Recording
function stopRecording() {
    if (mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
    }
    isRecording = false;
    recordBtn.textContent = 'Record';
    updateRecordTime();
}

// Update Recording Time
function updateRecordTime() {
    if (isRecording) {
        const currentTime = Math.floor((Date.now() - startTime) / 1000);
        const minutes = Math.floor(currentTime / 60).toString().padStart(2, '0');
        const seconds = (currentTime % 60).toString().padStart(2, '0');
        recordTimeDisplay.textContent = `${minutes}:${seconds}`;
        setTimeout(updateRecordTime, 1000);
    }
}
