function addStream() {
    const url = document.getElementById('streamUrl').value;
    if (url) {
        const videoContainer = document.getElementById('videos');

        // Create a new video element
        const video = document.createElement('video');
        video.setAttribute('width', '720');
        video.setAttribute('height', '560');
        video.setAttribute('autoplay', '');
        video.setAttribute('controls', '');

        // Setup the video stream
        if (url.startsWith('http')) {
            // If the URL is direct video stream
            video.src = url;
        } else {
            // Use WebRTC or other technologies to set up the stream
            console.error('Invalid URL or setup required for WebRTC or similar technology');
        }

        videoContainer.appendChild(video);
    } else {
        console.error('No URL provided');
    }
}