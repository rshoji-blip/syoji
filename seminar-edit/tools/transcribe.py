"""セミナー動画の文字起こし（6秒チャンク・タイムコード付き）。

事前準備:
  pip install sherpa-onnx imageio-ffmpeg numpy
  curl -LO https://github.com/k2-fsa/sherpa-onnx/releases/download/asr-models/sherpa-onnx-zipformer-ja-reazonspeech-2024-08-01.tar.bz2
  tar xjf sherpa-onnx-zipformer-ja-reazonspeech-2024-08-01.tar.bz2

使い方:
  python transcribe.py MODEL_DIR OUT_DIR video1.MOV video2.MOV ...
"""
import pathlib
import subprocess
import sys

import imageio_ffmpeg
import numpy as np
import sherpa_onnx

CHUNK_SEC = 6
OVERLAP_SEC = 0.5
SR = 16000


def load_audio(path):
    cmd = [imageio_ffmpeg.get_ffmpeg_exe(), "-loglevel", "error", "-i", str(path),
           "-ac", "1", "-ar", str(SR), "-f", "s16le", "-"]
    pcm = subprocess.run(cmd, check=True, capture_output=True).stdout
    return np.frombuffer(pcm, dtype=np.int16).astype(np.float32) / 32768


def main(model_dir, out_dir, *videos):
    d = pathlib.Path(model_dir)
    rec = sherpa_onnx.OfflineRecognizer.from_transducer(
        encoder=str(d / "encoder-epoch-99-avg-1.int8.onnx"),
        decoder=str(d / "decoder-epoch-99-avg-1.int8.onnx"),
        joiner=str(d / "joiner-epoch-99-avg-1.int8.onnx"),
        tokens=str(d / "tokens.txt"),
        num_threads=4,
    )
    out = pathlib.Path(out_dir)
    out.mkdir(parents=True, exist_ok=True)
    for v in map(pathlib.Path, videos):
        audio = load_audio(v)
        lines = [f"# {v.name}（{len(audio) / SR:.1f}秒）"]
        step = CHUNK_SEC * SR
        for i in range(0, len(audio), step):
            s = rec.create_stream()
            s.accept_waveform(SR, audio[i:i + step + int(OVERLAP_SEC * SR)])
            rec.decode_stream(s)
            t = i // SR
            lines.append(f"[{t // 60}:{t % 60:02d}] {s.result.text}")
        (out / f"{v.stem}.txt").write_text("\n".join(lines) + "\n", encoding="utf-8")
        print("\n".join(lines))


if __name__ == "__main__":
    main(*sys.argv[1:])
