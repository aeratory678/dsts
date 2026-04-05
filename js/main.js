import { setupAudioFromFile } from './audio.js';
import { DotVisualizer } from './dotVisualizer.js';

const fadeGroup = document.getElementById('bottom-left-controls');
const songNameSpan = document.getElementById('song-name');
const playerControls = document.getElementById('player-controls');
const playPauseBtn = document.getElementById('play-pause-btn');
const playIcon = document.getElementById('play-icon');
const pauseIcon = document.getElementById('pause-icon');
const fullscreenBtn = document.getElementById('fullscreen-btn');
const customFileLabel = document.getElementById('custom-file-label');
const audioFileInput = document.getElementById('audio-file');
const audioElement = document.getElementById('audio-player');
const nextBtn = document.getElementById('next-btn');
const prevBtn = document.getElementById('prev-btn');
const tracklistBtn = document.getElementById('tracklist-btn');
const tracklistModal = document.getElementById('tracklist-modal');
const tracklistUl = document.getElementById('tracklist-ul');
const closeTracklistBtn = document.getElementById('close-tracklist-btn');
let audioReady = false;
let isPlaying = false;
let visualizer;
let fadeTimeout = null;
let audioFiles = [];
let currentFileIndex = 0;

// Only show controls after song is loaded
function showControlsBar() {
    fadeGroup.style.display = '';
}

function showSongName() {
    songNameSpan.classList.add('active');
    playerControls.classList.remove('active');
}
function showControls() {
    songNameSpan.classList.remove('active');
    playerControls.classList.add('active');
}
function fadeLogicOnSongLoad() {
    showSongName();
    if (fadeTimeout) clearTimeout(fadeTimeout);
    fadeTimeout = setTimeout(() => {
        showControls();
    }, 5000);
}
fadeGroup.addEventListener('mouseenter', () => {
    showControls();
    if (fadeTimeout) clearTimeout(fadeTimeout);
});
fadeGroup.addEventListener('mouseleave', () => {
    showSongName();
    if (fadeTimeout) clearTimeout(fadeTimeout);
    fadeTimeout = setTimeout(() => {
        showControls();
    }, 2000);
});

function loadAudioFile(index) {
    const file = audioFiles[index];
    if (file) {
        audioElement.src = URL.createObjectURL(file);
        audioElement.load();
        audioReady = true;
        songNameSpan.textContent = file.name.toLowerCase();
        playIcon.style.display = '';
        pauseIcon.style.display = 'none';
        isPlaying = false;
        showControlsBar();
        fadeLogicOnSongLoad();
        // Setup analyser and visualizer
        setupAudioFromFile(audioElement).then(({ analyser, dataArray }) => {
            visualizer = new DotVisualizer(document.getElementById('dot-canvas'), analyser, dataArray, audioElement);
        });
    }
}

audioFileInput.addEventListener('change', async (e) => {
    audioFiles = Array.from(e.target.files);
    currentFileIndex = 0;
    if (audioFiles.length > 0) {
        loadAudioFile(currentFileIndex);
    }
});

playPauseBtn.addEventListener('click', () => {
    if (!audioReady) return;
    if (audioElement.paused) {
        audioElement.play();
    } else {
        audioElement.pause();
    }
});

audioElement.addEventListener('play', () => {
    playIcon.style.display = 'none';
    pauseIcon.style.display = '';
    isPlaying = true;
    if (visualizer) {
        visualizer.animate();
    }
});
audioElement.addEventListener('pause', () => {
    playIcon.style.display = '';
    pauseIcon.style.display = 'none';
    isPlaying = false;
    // Smooth morph to wave
    if (visualizer && visualizer.morphToWave) {
        visualizer.morphToWave();
    }
});

audioElement.addEventListener('ended', () => {
    playIcon.style.display = '';
    pauseIcon.style.display = 'none';
    isPlaying = false;
    if (visualizer && visualizer.morphToWave) {
        visualizer.morphToWave();
    }
});

fullscreenBtn.addEventListener('click', () => {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
    } else {
        document.exitFullscreen();
    }
});

window.addEventListener('DOMContentLoaded', () => {
    // Hide controls bar until a song is loaded
    fadeGroup.style.display = 'none';
});

function resizeCanvas() {
    const canvas = document.getElementById('dot-canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    if (visualizer) visualizer.resize();
}
window.addEventListener('resize', resizeCanvas);
document.addEventListener('fullscreenchange', resizeCanvas);
resizeCanvas();

function setFullscreenUI(hidden) {
    const controls = document.getElementById('bottom-left-controls');
    const fileLabel = document.getElementById('custom-file-label');
    // Do NOT hide the clock overlay
    if (controls) controls.style.display = hidden ? 'none' : '';
    if (fileLabel) fileLabel.style.display = hidden ? 'none' : '';
    // const clock = document.getElementById('custom-clock-overlay');
    // if (clock) clock.style.display = '';
}
document.addEventListener('fullscreenchange', () => {
    if (document.fullscreenElement) {
        setFullscreenUI(true);
    } else {
        setFullscreenUI(false);
    }
});

function updateTracklistUI() {
    tracklistUl.innerHTML = '';
    audioFiles.forEach((file, idx) => {
        const li = document.createElement('li');
        li.textContent = file.name;
        li.style.cursor = 'pointer';
        li.style.padding = '6px 0';
        if (idx === currentFileIndex) {
            li.style.color = '#c45252';
            li.style.fontWeight = 'bold';
        }
        li.addEventListener('click', () => {
            currentFileIndex = idx;
            loadAudioFile(currentFileIndex);
            tracklistModal.style.display = 'none';
        });
        tracklistUl.appendChild(li);
    });
}

nextBtn.addEventListener('click', () => {
    if (!audioReady || audioFiles.length < 2) return;
    currentFileIndex = (currentFileIndex + 1) % audioFiles.length;
    loadAudioFile(currentFileIndex);
});
prevBtn.addEventListener('click', () => {
    if (!audioReady || audioFiles.length < 2) return;
    currentFileIndex = (currentFileIndex - 1 + audioFiles.length) % audioFiles.length;
    loadAudioFile(currentFileIndex);
});
tracklistBtn.addEventListener('click', () => {
    if (!audioReady || audioFiles.length === 0) return;
    updateTracklistUI();
    tracklistModal.style.display = 'flex';
});
closeTracklistBtn.addEventListener('click', () => {
    tracklistModal.style.display = 'none';
});
// Hide modal on background click
tracklistModal.addEventListener('click', (e) => {
    if (e.target === tracklistModal) tracklistModal.style.display = 'none';
});

// Keyboard shortcuts: N for next, P for previous
window.addEventListener('keydown', (e) => {
    if (!audioReady || audioFiles.length < 2) return;
    if (e.key.toLowerCase() === 'n') {
        currentFileIndex = (currentFileIndex + 1) % audioFiles.length;
        loadAudioFile(currentFileIndex);
    } else if (e.key.toLowerCase() === 'p') {
        currentFileIndex = (currentFileIndex - 1 + audioFiles.length) % audioFiles.length;
        loadAudioFile(currentFileIndex);
    }
});
