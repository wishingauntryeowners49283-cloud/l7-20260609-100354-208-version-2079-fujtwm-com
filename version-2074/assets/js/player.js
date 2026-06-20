(function () {
  function initPlayer(shell) {
    var video = shell.querySelector('video');
    var overlay = shell.querySelector('[data-player-overlay]');
    var status = shell.querySelector('[data-player-status]');
    var source = shell.getAttribute('data-video-source');
    var hlsInstance = null;

    if (!video || !source) {
      if (status) {
        status.textContent = '未找到播放源';
      }
      return;
    }

    function setStatus(message) {
      if (status) {
        status.textContent = message;
      }
    }

    function loadSource() {
      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });

        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);

        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          setStatus('播放源已就绪，点击画面开始播放');
        });

        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }

          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            setStatus('网络加载异常，正在重试');
            hlsInstance.startLoad();
            return;
          }

          if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            setStatus('媒体解码异常，正在恢复');
            hlsInstance.recoverMediaError();
            return;
          }

          setStatus('播放源暂时无法加载');
          hlsInstance.destroy();
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        setStatus('播放源已就绪，点击画面开始播放');
      } else {
        setStatus('当前浏览器不支持 HLS 播放');
      }
    }

    function playOrPause() {
      if (video.paused) {
        video.play().catch(function () {
          setStatus('浏览器阻止自动播放，请再次点击播放按钮');
        });
      } else {
        video.pause();
      }
    }

    video.addEventListener('play', function () {
      shell.classList.add('is-playing');
      setStatus('正在播放');
    });

    video.addEventListener('pause', function () {
      shell.classList.remove('is-playing');
      setStatus('已暂停，点击画面继续播放');
    });

    video.addEventListener('ended', function () {
      shell.classList.remove('is-playing');
      setStatus('播放结束，可重新点击播放');
    });

    video.addEventListener('click', playOrPause);

    if (overlay) {
      overlay.addEventListener('click', playOrPause);
    }

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });

    loadSource();
  }

  document.addEventListener('DOMContentLoaded', function () {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-video-source]'));
    players.forEach(initPlayer);
  });
})();
