#!/usr/bin/env bash
# Regenera las láminas de la presentación de /plataforma (public/plataforma/*.webp)
# a partir de scenes.html, con Chrome headless + Pillow.
set -euo pipefail
cd "$(dirname "$0")"
tmp=$(mktemp -d)
names=(menu-digital pedidos-qr domicilios tiqueteras estadisticas)
for i in 1 2 3 4 5; do
  google-chrome --headless=new --disable-gpu --hide-scrollbars --window-size=1920,1080 \
    --virtual-time-budget=4000 --screenshot="$tmp/s$i.png" "file://$PWD/scenes.html#s$i" 2>/dev/null
  python3 -c "from PIL import Image; Image.open('$tmp/s$i.png').convert('RGB').save('../../public/plataforma/${names[$((i-1))]}.webp', 'WEBP', quality=82, method=6)"
done
rm -rf "$tmp"
echo "Listo: public/plataforma/"
