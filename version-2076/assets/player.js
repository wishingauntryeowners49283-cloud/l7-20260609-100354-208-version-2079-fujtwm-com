import { H as Hls } from './hls-dru42stk.js';

const video = document.getElementById('movie-player');
const playButton = document.querySelector('[data-play-button]');
let playerReady = false;
let hlsInstance = null;

function attachVideo() {
  if (!video || playerReady) {
    return;
  }

  const sourceUrl = video.getAttribute('data-play');
  if (!sourceUrl) {
    return;
  }

  if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = sourceUrl;
  } else if (Hls.isSupported()) {
    hlsInstance = new Hls({
      enableWorker: true,
      lowLatencyMode: true,
      maxBufferLength: 30
    });
    hlsInstance.loadSource(sourceUrl);
    hlsInstance.attachMedia(video);
  } else {
    video.src = sourceUrl;
  }

  playerReady = true;
}

function startPlayback() {
  attachVideo();
  if (!video) {
    return;
  }
  if (playButton) {
    playButton.classList.add('is-hidden');
  }
  const playTask = video.play();
  if (playTask && typeof playTask.catch === 'function') {
    playTask.catch(() => {
      if (playButton) {
        playButton.classList.remove('is-hidden');
      }
    });
  }
}

if (playButton) {
  playButton.addEventListener('click', startPlayback);
}

if (video) {
  video.addEventListener('play', () => {
    if (playButton) {
      playButton.classList.add('is-hidden');
    }
  });

  video.addEventListener('click', () => {
    if (video.paused) {
      startPlayback();
    }
  });

  window.addEventListener('beforeunload', () => {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
