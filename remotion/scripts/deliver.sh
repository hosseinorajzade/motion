#!/usr/bin/env bash
# Muxes picture + score and encodes the web deliverables into the site's public/ folder.
# usage: scripts/deliver.sh [showreel|anar|tact|all]
set -euo pipefail
cd "$(dirname "$0")/.."
PUB=../public
OUT=out
X264="-c:v libx264 -preset slow -pix_fmt yuv420p -movflags +faststart"

mux() { # picture audio master
  ffmpeg -v error -y -i "$1" -i "$2" -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest -movflags +faststart "$3"
}
still() { # src frame size out
  ffmpeg -v error -y -i "$1" -vf "select=eq(n\,$2),scale=$3:flags=lanczos" -frames:v 1 -q:v 3 "$4"
}

showreel() {
  mux $OUT/showreel_picture.mp4 $OUT/audio/showreel.wav $OUT/showreel_master.mp4
  # full film for the lightbox player
  ffmpeg -v error -y -i $OUT/showreel_master.mp4 $X264 -crf 23 -maxrate 6M -bufsize 12M -c:a aac -b:a 192k $PUB/showreel/reel-2026.mp4
  # muted background loop (footage only, no titles)
  ffmpeg -v error -y -i $OUT/showreel_loop.mp4 -an $X264 -crf 27 -maxrate 3M -bufsize 6M $PUB/showreel/reel-preview.mp4
  still $OUT/showreel_loop.mp4 52 1920:1080 $PUB/showreel/reel-poster.jpg
}

anar() {
  local D=$PUB/projects/anar
  mkdir -p $D
  mux $OUT/anar_picture.mp4 $OUT/audio/anar.wav $OUT/anar_master.mp4
  ffmpeg -v error -y -i $OUT/anar_master.mp4 $X264 -crf 22 -c:a aac -b:a 160k $D/full.mp4
  ffmpeg -v error -y -ss 2.2 -t 6 -i $OUT/anar_picture.mp4 -an -vf scale=960:540:flags=lanczos $X264 -crf 28 $D/preview.mp4
  still $OUT/anar_picture.mp4 345 1280:720 $D/thumb.jpg
  still $OUT/anar_picture.mp4 58 1280:720 $D/still-1.jpg
  still $OUT/anar_picture.mp4 106 1280:720 $D/still-2.jpg
  still $OUT/anar_picture.mp4 262 1280:720 $D/still-3.jpg
  still $OUT/anar_picture.mp4 132 1280:720 $D/still-4.jpg
}

tact() {
  local D=$PUB/projects/tact-75
  mkdir -p $D
  mux $OUT/tact_picture.mp4 $OUT/audio/tact.wav $OUT/tact_master.mp4
  ffmpeg -v error -y -i $OUT/tact_master.mp4 $X264 -crf 22 -c:a aac -b:a 160k $D/full.mp4
  ffmpeg -v error -y -ss 4 -t 6 -i $OUT/tact_picture.mp4 -an -vf scale=540:960:flags=lanczos $X264 -crf 28 $D/preview.mp4
  still $OUT/tact_picture.mp4 440 720:1280 $D/thumb.jpg
  still $OUT/tact_picture.mp4 96 1080:1920 $D/still-1.jpg
  still $OUT/tact_picture.mp4 200 1080:1920 $D/still-2.jpg
  still $OUT/tact_picture.mp4 300 1080:1920 $D/still-3.jpg
  still $OUT/tact_picture.mp4 560 1080:1920 $D/still-4.jpg
}

case "${1:-all}" in
  showreel) showreel ;;
  anar) anar ;;
  tact) tact ;;
  all) showreel; anar; tact ;;
esac
ls -la $PUB/showreel $PUB/projects/anar $PUB/projects/tact-75 2>/dev/null | grep -v "^total" || true
