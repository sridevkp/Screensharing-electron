// Connect to WebSocket server
const socket = io("/");

// Get DOM elements and initialize MediaSource
const videoElement = document.getElementById("screen");
const mediaSource = new MediaSource();
let sourceBuffer;
let queue = [];
let isInitialized = false;

// Set up video source
videoElement.src = URL.createObjectURL(mediaSource);

mediaSource.addEventListener("sourceopen", () => {
    sourceBuffer = mediaSource.addSourceBuffer("video/webm; codecs=vp9");

    socket.on('video:chunk', async (chunk, uuid) => {
        console.log('Received chunk:', chunk.byteLength);
        const videoBlob = new Blob([chunk], { type: "video/webm" });
        const arrayBuffer = await videoBlob.arrayBuffer();

        if (sourceBuffer && !sourceBuffer.updating) {
            sourceBuffer.appendBuffer(arrayBuffer);
        } else {
            console.warn("SourceBuffer is busy");
        }
    });
    
    videoElement.src = URL.createObjectURL(mediaSource);
});

mediaSource.addEventListener("sourceended", () => {
    console.log("MediaSource has ended.");
    mediaSource = new MediaSource(); // Recreate MediaSource
    videoElement.src = URL.createObjectURL(mediaSource); // Reassign video source
});

// Room handling
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
let room = urlParams.get("id");

if (!room) {
    room = prompt("Enter room ID");
    if (room) {
        window.location = `/view/?id=${encodeURIComponent(room)}`;
    } else {
        console.error("Room ID is required");
    }
}
else{
    socket.emit("join", room);
    console.log(`Joined room: ${room}`);
}

// Add debug logging
socket.on('connect', () => {
    console.log('Connected to server');
});

socket.on('connect_error', (error) => {
    console.error('Connection error:', error);
});

socket.on('disconnect', () => {
    console.log('Disconnected from server');
});

// Video element event handlers
videoElement.addEventListener('error', (e) => {
    console.error('Video element error:', e);
});

videoElement.addEventListener('waiting', () => {
    console.log('Video is waiting for data');
});

videoElement.addEventListener('playing', () => {
    console.log('Video is playing');
});