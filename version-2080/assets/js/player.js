function initializePlayer(source) {
    var frame = document.querySelector('[data-player]');
    if (!frame) {
        return;
    }

    var video = frame.querySelector('video');
    var cover = frame.querySelector('.player-cover');
    var button = frame.querySelector('.play-button');
    var message = frame.querySelector('.player-message');
    var ready = false;
    var hls = null;

    function setMessage(text) {
        if (message) {
            message.textContent = text || '';
        }
    }

    function prepare() {
        if (ready || !video) {
            return;
        }

        ready = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            return;
        }

        setMessage('播放暂时无法加载，请稍后重试。');
    }

    function start() {
        prepare();
        if (!video) {
            return;
        }
        if (cover) {
            cover.classList.add('is-hidden');
        }
        video.controls = true;
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
            promise.catch(function () {
                if (cover) {
                    cover.classList.remove('is-hidden');
                }
                video.controls = true;
            });
        }
    }

    if (button) {
        button.addEventListener('click', function (event) {
            event.stopPropagation();
            start();
        });
    }

    if (cover) {
        cover.addEventListener('click', start);
    }

    if (video) {
        video.addEventListener('click', function () {
            if (!ready) {
                start();
            }
        });
    }

    window.addEventListener('beforeunload', function () {
        if (hls) {
            hls.destroy();
        }
    });
}
