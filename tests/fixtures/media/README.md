These silent one-second MP4s are synthetic test patterns, generated locally with
FFmpeg's `testsrc2` filter and H.264/yuv420p encoding. Their respective dimensions
are 160×90, 90×160, and 100×100. They exercise landscape, portrait, and square
metadata/playback without external services. `captions.vtt` is a timed WebVTT cue.

Copy fixtures into the disposable fixture build only. They are not site content
and must never be added to the production `public/` directory. Running CI does
not require FFmpeg.
