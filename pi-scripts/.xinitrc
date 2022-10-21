#!/bin/bash
# adapted from https://unix.stackexchange.com/a/515451

GEO="$(fbset -s | awk '$1 == "geometry" { print $2":"$3}')"
WIDTH=$(echo "$GEO" | cut -d: -f1)
HEIGHT=$(echo "$GEO" | cut -d: -f2)

echo "resolution $WIDTH x $HEIGHT" > x_debug_resolution.txt

xset -dpms
xset s off
xset s noblank

unclutter &

chromium \
	--start-fullscreen \
	--app https://www.olin.edu \
	--window-size=$WIDTH,$HEIGHT \
	--start-maximized \
	--window-position=0,0
	--noerrdialogs
	--disabletranslate
	--fast
	--fast-start
	--disable-features=TranslateUI
	--password-store=basic
