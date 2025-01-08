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

// Handle MediaSource initialization
mediaSource.addEventListener('sourceopen', () => {
    console.log("Media source open.")
    if (!MediaSource.isTypeSupported('video/webm;codecs=vp8')) {
        console.error('VP8 is not supported on this browser.');
        alert('Your browser does not support the required video codec.');
    }

    try {
        sourceBuffer = mediaSource.addSourceBuffer('video/webm;codecs=vp8');
        console.log('SourceBuffer created successfully');
        
        sourceBuffer.mode = 'segments';  // Ensure we're using segmented mode
        sourceBuffer.addEventListener('updateend', () => {
            mediaSource.duration = 120;
            if (queue.length > 0 && !sourceBuffer.updating) {
                const chunk = queue.shift();
                sourceBuffer.appendBuffer(new Uint8Array(chunk));
            }
        });
    } catch (e) {
        console.error('Error creating sourceBuffer:', e);
    }
});

function appendToSourceBuffer(chunk) {
    if (!sourceBuffer || sourceBuffer.updating || !isInitialized) {
        queue.push(chunk);
        console.log("Source buffer unavailable")
        return;
    }
    
    try {
        // Check if chunk is ArrayBuffer or ArrayBufferView
        if (chunk instanceof ArrayBuffer || ArrayBuffer.isView(chunk)) {
            sourceBuffer.appendBuffer(new Uint8Array(chunk));
        } else {
            console.error('Invalid chunk type:', typeof chunk);
        }
    } catch (e) {
        console.error('Error appending buffer:', e);
        if (e.name === 'QuotaExceededError') {
            // If buffer is full, remove some data
            if (sourceBuffer.buffered.length) {
                sourceBuffer.remove(0, sourceBuffer.buffered.end(0) - 10);
            }
        }
    }
}

// Handle incoming video chunks
socket.on('video:chunk', (chunk, uuid) => {
    console.log('Received chunk:', chunk.byteLength);
    appendToSourceBuffer(chunk);
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

if (room) {
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