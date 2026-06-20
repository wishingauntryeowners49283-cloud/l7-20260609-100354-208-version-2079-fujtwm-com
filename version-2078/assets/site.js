import { H as Hls } from "./hls-vendor-dru42stk.js";

const ready = (callback) => {
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", callback);
    } else {
        callback();
    }
};

ready(() => {
    document.querySelectorAll("img").forEach((image) => {
        image.addEventListener("error", () => {
            image.classList.add("is-missing");
        });
    });

    const menuButton = document.querySelector(".menu-toggle");
    const mobileNav = document.querySelector(".mobile-nav");
    if (menuButton && mobileNav) {
        menuButton.addEventListener("click", () => {
            const nextState = !mobileNav.classList.contains("is-open");
            mobileNav.classList.toggle("is-open", nextState);
            menuButton.setAttribute("aria-expanded", String(nextState));
        });
    }

    const slides = Array.from(document.querySelectorAll(".hero-slide"));
    const dots = Array.from(document.querySelectorAll(".hero-dot"));
    if (slides.length > 1) {
        let current = 0;
        const showSlide = (index) => {
            current = (index + slides.length) % slides.length;
            slides.forEach((slide, slideIndex) => {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach((dot, dotIndex) => {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        };
        dots.forEach((dot, index) => {
            dot.addEventListener("click", () => showSlide(index));
        });
        window.setInterval(() => showSlide(current + 1), 6200);
    }

    document.querySelectorAll(".player-shell").forEach((player) => {
        const video = player.querySelector("video");
        const startButton = player.querySelector(".player-start");
        const sourceTag = video ? video.querySelector("source") : null;
        const url = sourceTag ? sourceTag.getAttribute("src") : "";
        let attached = false;
        let hlsInstance = null;

        if (!video || !url) {
            return;
        }

        if (sourceTag) {
            sourceTag.remove();
        }
        video.removeAttribute("src");

        const attach = () => {
            if (attached) {
                return;
            }
            attached = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = url;
            } else if (Hls && Hls.isSupported()) {
                hlsInstance = new Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hlsInstance.loadSource(url);
                hlsInstance.attachMedia(video);
                player.hlsInstance = hlsInstance;
            } else {
                video.src = url;
            }
        };

        const play = () => {
            attach();
            player.classList.add("is-playing");
            video.play().catch(() => {
                player.classList.remove("is-playing");
            });
        };

        if (startButton) {
            startButton.addEventListener("click", play);
        }

        video.addEventListener("click", () => {
            if (!attached || video.paused) {
                play();
            } else {
                video.pause();
            }
        });

        video.addEventListener("play", () => {
            player.classList.add("is-playing");
        });

        video.addEventListener("pause", () => {
            if (video.currentTime === 0 || video.ended) {
                player.classList.remove("is-playing");
            }
        });
    });

    const cards = Array.from(document.querySelectorAll("[data-filter-card]"));
    const input = document.querySelector("[data-search-input]");
    const selects = Array.from(document.querySelectorAll("[data-filter-select]"));
    const empty = document.querySelector(".empty-result");

    if (cards.length && (input || selects.length)) {
        const normalize = (value) => String(value || "").toLowerCase().trim();
        const runFilter = () => {
            const query = normalize(input ? input.value : "");
            const selected = selects.map((select) => ({
                key: select.getAttribute("data-filter-key"),
                value: normalize(select.value)
            })).filter((item) => item.value);
            let shown = 0;

            cards.forEach((card) => {
                const haystack = normalize([
                    card.getAttribute("data-title"),
                    card.getAttribute("data-year"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-kind"),
                    card.getAttribute("data-genre"),
                    card.getAttribute("data-category")
                ].join(" "));
                const queryMatch = !query || haystack.includes(query);
                const selectMatch = selected.every((item) => normalize(card.getAttribute(`data-${item.key}`)).includes(item.value));
                const visible = queryMatch && selectMatch;
                card.hidden = !visible;
                if (visible) {
                    shown += 1;
                }
            });

            if (empty) {
                empty.hidden = shown !== 0;
            }
        };

        if (input) {
            input.addEventListener("input", runFilter);
        }
        selects.forEach((select) => select.addEventListener("change", runFilter));
    }
});
