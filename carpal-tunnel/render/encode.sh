#!/usr/bin/env bash
# Encodes the rendered PNG frames into the delivery MP4:
# 1080x1920, 30 fps, H.264 High, yuv420p, BT.709, faststart, exactly 40.000 s (1200 frames).
# usage: render/encode.sh [frames_dir] [output.mp4]
set -euo pipefail
cd "$(dirname "$0")/.."
FRAMES="${1:-out/frames}"
OUT="${2:-out/carpal-tunnel.mp4}"

n=$(ls "$FRAMES"/f_*.png 2>/dev/null | wc -l)
if [ "$n" -ne 1200 ]; then
  echo "expected 1200 frames in $FRAMES, found $n" >&2
  exit 1
fi

ffmpeg -v error -y -framerate 30 -start_number 0 -i "$FRAMES/f_%05d.png" \
  -vf "scale=in_range=full:out_range=tv:out_color_matrix=bt709,format=yuv420p" \
  -c:v libx264 -preset slow -crf 18 -maxrate 16M -bufsize 32M -profile:v high -level:v 4.1 \
  -g 60 -bf 2 -pix_fmt yuv420p \
  -color_primaries bt709 -color_trc bt709 -colorspace bt709 -color_range tv \
  -r 30 -movflags +faststart -an \
  "$OUT"

ffprobe -v error -select_streams v:0 \
  -show_entries stream=codec_name,profile,width,height,r_frame_rate,nb_frames,pix_fmt,color_space \
  -show_entries format=duration,size -of default=noprint_wrappers=1 "$OUT"
