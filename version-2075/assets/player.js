(function () {
  'use strict';

  const video = document.querySelector('[data-player]');
  const playButton = document.querySelector('[data-play-button]');
  const status = document.querySelector('[data-player-status]');

  if (!video || !playButton) {
    return;
  }

  const source = video.dataset.src;
  let isLoaded = false;
  let hlsInstance = null;

  function updateStatus(message) {
    if (status) {
      status.textContent = message;
    }
  }

  async function attachSource() {
    if (isLoaded) {
      return;
    }

    if (!source) {
      updateStatus('当前影片没有可用播放源。');
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      isLoaded = true;
      updateStatus('已使用浏览器原生 HLS 能力加载播放源。');
      return;
    }

    try {
      const module = await import('./hls-dru42stk.js');
      const Hls = module.H || module.default;

      if (Hls && Hls.isSupported()) {
        hlsInstance = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        isLoaded = true;
        updateStatus('已通过 HLS 播放库加载 m3u8 播放源。');
        return;
      }

      video.src = source;
      isLoaded = true;
      updateStatus('已尝试直接加载播放源。');
    } catch (error) {
      console.error(error);
      updateStatus('播放库加载失败，请通过 HTTP 服务访问本站后重试。');
    }
  }

  async function playVideo() {
    playButton.classList.add('is-hidden');
    await attachSource();

    try {
      await video.play();
      updateStatus('正在播放。');
    } catch (error) {
      playButton.classList.remove('is-hidden');
      updateStatus('浏览器阻止了自动播放，请再次点击播放器播放。');
    }
  }

  playButton.addEventListener('click', playVideo);
  video.addEventListener('click', () => {
    if (!isLoaded) {
      playVideo();
    }
  });
  video.addEventListener('play', () => playButton.classList.add('is-hidden'));
  video.addEventListener('pause', () => {
    if (video.currentTime === 0) {
      playButton.classList.remove('is-hidden');
    }
  });

  window.addEventListener('beforeunload', () => {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
})();
