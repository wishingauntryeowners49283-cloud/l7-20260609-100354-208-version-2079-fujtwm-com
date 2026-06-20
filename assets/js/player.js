(function () {
  function ready(callback) {
    if (document.readyState !== 'loading') {
      callback();
      return;
    }
    document.addEventListener('DOMContentLoaded', callback);
  }

  ready(function () {
    const video = document.getElementById('movie-player');
    const trigger = document.getElementById('play-trigger');
    if (!video || !trigger) {
      return;
    }
    const stream = video.getAttribute('data-stream');
    let attached = false;
    let hls = null;

    function attachStream() {
      if (attached || !stream) {
        return;
      }
      attached = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
        return;
      }
      video.src = stream;
    }

    function playMovie() {
      attachStream();
      trigger.classList.add('is-hidden');
      const attempt = video.play();
      if (attempt && typeof attempt.catch === 'function') {
        attempt.catch(function () {
          trigger.classList.remove('is-hidden');
        });
      }
    }

    trigger.addEventListener('click', playMovie);
    video.addEventListener('click', function () {
      if (!attached || video.paused) {
        playMovie();
      }
    });
    video.addEventListener('play', function () {
      trigger.classList.add('is-hidden');
    });
    video.addEventListener('pause', function () {
      if (attached && video.currentTime === 0) {
        trigger.classList.remove('is-hidden');
      }
    });
    window.addEventListener('pagehide', function () {
      if (hls && typeof hls.destroy === 'function') {
        hls.destroy();
      }
    });
  });
})();
