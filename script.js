const buttons = document.getElementsByClassName("play-radio"),
    audios = document.getElementsByClassName("audio"),
    volumeControls = document.getElementsByClassName("volume-control");

let activeAudio = null;

function pauseAllExcept(t) {
    for (let e of audios) {
        if (e !== t) {
            e.pause();

            const index = Array.from(audios).indexOf(e);

            if (!buttons[index].disabled) {
                buttons[index].innerHTML =
                    '<sl-icon id="icon" slot="prefix" name="play-circle-fill"></sl-icon> Play';

                buttons[index].setAttribute("variant", "primary");
                volumeControls[index].style.display = "none";
            }

            if (activeAudio === e) {
                activeAudio = null;

                if ("mediaSession" in navigator) {
                    navigator.mediaSession.playbackState = "paused";
                }
            }
        }
    }
}

if ("mediaSession" in navigator) {
    navigator.mediaSession.setActionHandler("play", () => {
        if (activeAudio) {
            activeAudio.play().catch(() => {});
        }
    });

    navigator.mediaSession.setActionHandler("pause", () => {
        if (activeAudio) {
            activeAudio.pause();
        }
    });
}

for (let t = 0; t < buttons.length; t++) {
    const e = buttons[t],
        l = audios[t],
        n = volumeControls[t],
        i = l.getAttribute("data-src");

    let o = null;

    e.addEventListener("click", () => {
        if (l.paused) {
            e.innerHTML =
                '<sl-spinner style="--indicator-color: var(--sl-color-neutral-0); --track-color: var(--sl-color-neutral-300);"></sl-spinner>';

            pauseAllExcept(l);

            if (i && i.endsWith(".m3u8")) {
                if (Hls.isSupported()) {
                    if (o) {
                        l.play()
                            .then(() => {
                                e.innerHTML =
                                    '<sl-icon id="icon" slot="prefix" name="stop-circle-fill"></sl-icon> Stop';

                                e.setAttribute("variant", "danger");
                                n.style.display = "inline-block";
                                l.volume = n.value / 100;

                                activeAudio = l;

                                if ("mediaSession" in navigator) {
                                    navigator.mediaSession.metadata =
                                        new MediaMetadata({
                                            title: e.closest("sl-card")
                                                .querySelector("strong")
                                                .textContent,
                                            artist: "Akashvani Malayalam",
                                            album: "Live Radio"
                                        });

                                    navigator.mediaSession.playbackState =
                                        "playing";
                                }
                            })
                            .catch(() => {
                                disableButton(e);
                            });
                    } else {
                        o = new Hls();

                        o.loadSource(i);
                        o.attachMedia(l);

                        o.on(
                            Hls.Events.MANIFEST_PARSED,
                            () => {
                                l.play()
                                    .then(() => {
                                        e.innerHTML =
                                            '<sl-icon id="icon" slot="prefix" name="stop-circle-fill"></sl-icon> Stop';

                                        e.setAttribute(
                                            "variant",
                                            "danger"
                                        );

                                        n.style.display = "inline-block";
                                        l.volume = n.value / 100;

                                        activeAudio = l;

                                        if ("mediaSession" in navigator) {
                                            navigator.mediaSession.metadata =
                                                new MediaMetadata({
                                                    title: e.closest("sl-card")
                                                        .querySelector("strong")
                                                        .textContent,
                                                    artist:
                                                        "Akashvani Malayalam",
                                                    album: "Live Radio"
                                                });

                                            navigator.mediaSession.playbackState =
                                                "playing";
                                        }
                                    })
                                    .catch(() => {
                                        disableButton(e);
                                    });
                            }
                        );

                        // Log fatal HLS errors
                        o.on(Hls.Events.ERROR, (event, data) => {
                            console.error("HLS error:", data);

                            if (data.fatal) {
                                disableButton(e);
                            }
                        });
                    }
                } else if (
                    l.canPlayType("application/vnd.apple.mpegurl")
                ) {
                    l.src = i;

                    l.play()
                        .then(() => {
                            e.innerHTML =
                                '<sl-icon id="icon" slot="prefix" name="stop-circle-fill"></sl-icon> Stop';

                            e.setAttribute("variant", "danger");
                            n.style.display = "inline-block";
                            l.volume = n.value / 100;

                            activeAudio = l;

                            if ("mediaSession" in navigator) {
                                navigator.mediaSession.metadata =
                                    new MediaMetadata({
                                        title: e.closest("sl-card")
                                            .querySelector("strong")
                                            .textContent,
                                        artist: "Akashvani Malayalam",
                                        album: "Live Radio"
                                    });

                                navigator.mediaSession.playbackState =
                                    "playing";
                            }
                        })
                        .catch(() => {
                            disableButton(e);
                        });
                }
            }
        } else {
            l.pause();

            e.innerHTML =
                '<sl-icon id="icon" slot="prefix" name="play-circle-fill"></sl-icon> Play';

            e.setAttribute("variant", "primary");
            n.style.display = "none";

            if (activeAudio === l) {
                activeAudio = null;

                if ("mediaSession" in navigator) {
                    navigator.mediaSession.playbackState = "paused";
                }
            }
        }
    });

    n.addEventListener("input", () => {
        l.volume = n.value / 100;
    });

    l.addEventListener("play", () => {
        activeAudio = l;

        if ("mediaSession" in navigator) {
            navigator.mediaSession.playbackState = "playing";
        }
    });

    l.addEventListener("pause", () => {
        if (activeAudio === l) {
            if ("mediaSession" in navigator) {
                navigator.mediaSession.playbackState = "paused";
            }
        }
    });

    l.addEventListener("waiting", () => {
        console.log("Audio waiting:", e.closest("sl-card")
            .querySelector("strong")
            .textContent);
    });

    l.addEventListener("stalled", () => {
        console.log("Audio stalled:", e.closest("sl-card")
            .querySelector("strong")
            .textContent);
    });

    l.addEventListener("playing", () => {
        console.log("Audio playing:", e.closest("sl-card")
            .querySelector("strong")
            .textContent);
    });

    l.addEventListener("error", () => {
        console.error("Audio error:", l.error);
        disableButton(e);
    });
}

function disableButton(t) {
    t.innerHTML =
        '<sl-icon slot="prefix" name="slash-circle"></sl-icon> Inactive';

    t.setAttribute("variant", "default");
    t.disabled = true;
}