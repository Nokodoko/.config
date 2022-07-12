#!/bin/bash   

export EDITOR=nvim
export TERMCMD=kitty
export BROWSER=google-chrome
export XDG_CONFIG_DIRS/autostart="~/.config/autostart/"

#-----Keyboard Settings-----#
kmonad ~/.config/kmonad/config.kbd &
kmonad ~/.config/kmonad/sculpt.kbd &
kmonad ~/.config/kmonad/anne.kbd &
kmonad ~/.config/kmonad/widow.kbd &


#-----Screen-----#
exec ~/.screenlayout/1big.sh
picom -b --config ~/.config/.picom.conf
feh --bg-scale ~/Pictures/j20.jpg

#-----Services-----#
sxhkd &
slstatus &
unclutter --timeout 2 &
dunst -config ~/.config/dunst/dunstrc &
buds.sh &

#-----Ram Disk-----#
cacheStart.zsh &

#-----Starting Programs-----#
slack &
android-messages-desktop &

#-----Disable Touch Pad-----#
xinput set-prop 13 "Device Enabled" 0 &

#-----Window Manager-----#
welcome.sh
exec dwm 
