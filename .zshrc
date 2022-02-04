#         _              
# _______| |__  _ __ ___ 
#|_  / __| '_ \| '__/ __|
# / /\__ \ | | | | | (__ 
#/___|___/_| |_|_|  \___|
# If not running interactively, don't do anything
TERM="rxvt-256color"
COLORTERM='rxvt-unicode-256color'
export EDITOR='nvim'
export BROWSER='qutebrowser'
autoload -U edit-command-line
zle -N edit-command-line
bindkey -M vicmd v edit-command-line

[[ $- != *i* ]] && return

#5 - pink
#4 - blue
#3 - yellow
#2 - green
#1 - red

pfetch
export PF_COL1=4
export P4_COL2=5
export PF_COL3=5
#neofetch #--chafa ~/Pictures/goCrazy.jpg

alias sudo='sudo '
source /usr/share/fzf/completion.zsh
#autoload -Uz promptinit
#promptinit
#prompt adam1
alias dell='n0ko@Dell'
alias s='scp'
alias sr='scp -r'
alias n='nmap'

export PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/local/games:/usr/bin/site_perl:/usr/bin/vendor_perl:/usr/bin/core_perl:~/go/src/scripts:~/go/bin:~/proto/prac2/

#           _            _     ____  
#  ___ ___ | | ___  _ __| |   / ___| 
# / __/ _ \| |/ _ \| '__| |   \___ \ 
#| (_| (_) | | (_) | |  | |___ ___) |
# \___\___/|_|\___/|_|  |_____|____/ 
#                                    

#alias ls='ls --color=auto'
alias lal='colorls -l'
alias cat='bat'
alias ls='colorls --sd'
alias lr='colorls -r'
alias tree='colorls --tree'
alias lgit='colorls --gs'
alias lgt='colorls --gs -t'
#set VIMODE according to the current mode (default “[i]”)
#VIMODE='[i]'
#function zle-keymap-select {
#VIMODE="${${KEYMAP/vicmd/[n]}/(main|viins)/[i]}"
# zle reset-prompt
#}
#
#zle -N zle-keymap-select
#PROMPT='$FG[163]%>>%{$reset_color}'
# Set the prompt to “[user]@[host[ [vi mode] $ ”
#PROMPT="%n@%m ${VIMODE} \\$ "
#PROMPT='>>'
#export PS1="\n\[\e[32;1m\]($USER)-($JOB)-(\[\e[37;1m\]\w\[\e[32;1m\])\n(\[\[\e[37;1m\]! \!\[\e[32;1m\])-> \[\e[0m\]"
export PS1="\n\[\e[32;1m\]($USER)-(\[\e[37;1m\]\w\[\e[32;1m\])\n(\[\[\e[37;1m\]! \!\[\e[32;1m\])-> \[\e[0m\]"
#export PS1=\n\[\e[32;1m\](\[\e[37;1m\]\u\[\e[32;1m\])-(\[\e[37;1m\]jobs:\j\[\e[32;1m\])-(\[\e[37;1m\]\w\[\e[32;1m\])\n(\[\[\e[37;1m\]! \!\[\e[32;1m\])-> \[\e[0m\]

#setopt promptsubst
#PS1=$'%U${(r:$COLUMNS:: :)}%u'$PS1
#
#precmd() {
#  LEFT="\n\[\e[32;1m\]($USER)-(\[\e[37;1m\]jobs:\j\[\e[32;1m\])-(\[\e[37;1m\]\w\[\e[32;1m\])\n(\[\[\e[37;1m\]! \!\[\e[32;1m\])-> \[\e[0m\]"
#  RIGHT="$(date) "
#  RIGHTWIDTH=$(($COLUMNS-${#LEFT}))
#  print $LEFT${(l:$RIGHTWIDTH::.:)RIGHT}
#}

#precmd() {
#  LEFT="$USER"
#  RIGHT="$(date) "
#  RIGHTWIDTH=$(($COLUMNS-${#LEFT}))
##  print $LEFT${(l:$RIGHTWIDTH::.:)RIGHT}
#}

#PS1="% > "
#RPS1="bar"

set -o vi

#Docker Tab Completion
#mkdir -p ~/.zsh/completion
#curl -L https://raw.githubusercontent.com/docker/machine/v0.16.0/contrib/completion/zsh/_docker-machine > ~/.zsh/completion/_docker-machine
fpath=(~/.zsh/completion $fpath)
autoload -Uz compinit && compinit -i

#    _    _ _                     
#   / \  | (_) __ _ ___  ___  ___ 
#  / _ \ | | |/ _` / __|/ _ \/ __|
# / ___ \| | | (_| \__ \  __/\__ \
#/_/   \_\_|_|\__,_|___/\___||___/
#
#Paths
##alias -g (enter) '""'
alias -s {html,go,css}=nvim
alias x='startx'
alias ddwm='cd ~/Programs/dwm/ && ls'
alias swapped='rm ~/.local/share/nvim/swap//%home%n0ko%.config%nvim%init.vim.swp'
alias swap='rm ~/.local/share/nvim/swap//%home%n0ko%.zsh.swp'
alias vb='nvim ~/.zshrc'
alias e='exit'
alias sb='source ~/.zshrc'
alias dunstrc='nvim ~/.config/dunst/dunstrc'
alias plug='cd ~/.config/nvim/plugged'
#alias lal='ls -al'
alias v='nvim'
alias clock='tty-clock -c'
alias god='sudo'
alias add='sudo pacman -S'
alias build='pacman -U'
alias Q='cd ..'
alias cls='clear ; sb'
function m() {
  /usr/bin/man $* | \
    col -b | \
    vim -R -c 'set ft=man nomod nolist' -
}
alias xp='xprop'
alias reset='make clean && rm -f config.h && git reset --hard origin/master'
alias making='make && sudo make clean install'
alias gp='rg'
function c(){
    cd $1 
    ls
}
alias md='mkdir'
alias t='touch'
alias makeit='makepkg -si'
alias ex='export'
alias evil='airmon-ng start wlp2s0mon'
alias evilt='airmon-ng --test wlp2s0mon'
alias ns='notify-send hello'
alias nsc='notify-send -u critical hello'
alias zip='tar -xf'
alias uzip='tar -xvf'
alias fc='fc-cache -f -v'
alias fig='figlet'
alias mk='mkdir'
function mkc(){
    mkdir -p $1
    cd $1
}
alias mkd='mkdir'
alias delete='rm  - rf'
alias sshConnect='ssh -T -p 443 git@ssh.github.com'
alias ar='arandr'


#  ____  ___  
# / ___|/ _ \ 
#| |  _| | | |
#| |_| | |_| |
# \____|\___/ 
#             

function g1(){
  go run $1 | column
}
alias g='go run'
alias gg='go get -u'
alias gb='go build'
alias gf='go fmt'
alias gl='go list -m all'
#alias gmi='go mod .init'
alias gmt='go mod tidy'
alias gmv='go mod vendor'
alias rs='cd ~/go/resources'
function pro(){
    protoc -I ${PWD} --go_out=. $1
    #mv \~/${PWD}/$1.pb.go ${PWD}
    #rm -rf \~/
    #protoc --go_out=. $1
}

function gmi(){
    go mod init github/Nokodoko/$1
}

# ____             _             
#|  _ \  ___   ___| | _____ _ __ 
#| | | |/ _ \ / __| |/ / _ \ '__|
#| |_| | (_) | (__|   <  __/ |   
#|____/ \___/ \___|_|\_\___|_|   
                                

alias d='docker'
alias dstop='docker stop'
alias dr='docker run -dit'
alias drun='docker run --rm'
alias ds='docker stop'
alias darch='docker run -dit archlinux/base'
alias dp='docker ps'
alias dpa='docker ps -a'
alias dpl='docker ps -l'
alias dnl='docker network ls'
alias di='docker images'
alias dni='docker network inspect'
alias dpull='docker pull'
alias dh='docker history'
alias dt='docker tag'
#alias df='docker system df'
alias db='docker build -t'
alias drmi='docker rmi'
alias drm='docker rm'
alias dprune='docker image prune'
alias dsysp='docker system prune -a'
alias dlog='docker logs -t'
alias dfollow='docker logs -f'
alias did='docker login'
alias dvol-c='docker volume create'
alias dvol-l='docker volume ls'
alias dvol-r='docker volume rm'
alias dvol-i='docker volume inspect'
alias dvol-p='docker volume prune'
alias ds='dockerscan'
alias dswarm='docker swarm init'
alias swarmjoin='docker swarm join-token'

function dcn() {
        docker network inspect bridge -f '{{ .Containers }}'
} 

function dipa() {
        docker inspect -f '{{ .NetworkSettings.IPAddress }}' $1
} 

function dserv() { # $1=serviceName; $2=portNumber; $3=imageName
        docker service create --name $1 -p $2 $3
        } 

function dic() { # $1= running containerName tw
        docker inspect $1 | gp Mount -A 10
        
        } 

function dmount() { # $1=containerName; $2=volumeName ; $3=containerPath to mount
        docker run -d --name $1 --mount source=$2,destination=$3
        
        } 

function dmountsize() { # $1=containerName; $2=volumeName ; $3=containerPath to mount
        docker run -d --name $1 --mount source=$2,$2-size=$3,destination=$4
        
        } 
function dcurl() {
        curl http://localhost:$1
        } 

function dstart() { # $1 = container sha or tag
        docker restart $1
        } 

#function dremount() {
#        docker run -d --name $1 mount $2 
#        
#}  

function dname() { # $1=name; $2=Image; 
        docker run -dit --name $1 $2 
        } 

function dport() { # $1=name; $2=ports; $3 = Image#
        docker run -dit --name $1 -p $2 $3
        }

function dshell() { # $1=name; $2=image; $3=shell interpreter
        docker run -it --name $1 $2 $3
        } 

function dexec() { # $1=shell interpreter
        dp > ~/running_containers
        local ID=$(awk 'FNR == 2 {print $1}' ~/running_containers) # ID = Container hash
        docker exec -it $ID $1 
        rm ~/running_containers
        } 

function dbuild() { # $1=
        docker build -t n0ko/$1 -f Dockerfile .
        }  

function dpush() {
        docker push n0ko/$1
        
        } 
# ____                                  
#|  _ \ __ _  ___ _ __ ___   __ _ _ __  
#| |_) / _` |/ __| '_ ` _ \ / _` | '_ \ 
#|  __/ (_| | (__| | | | | | (_| | | | |
#|_|   \__,_|\___|_| |_| |_|\__,_|_| |_|
                                       
alias remove='sudo pacman -Rns'
alias update='sudo pacman -Syu'
alias build='sudo pacman -U'
alias search='sudo pacman -Q'


# ____            _                 ____  
#/ ___| _   _ ___| |_ ___ _ __ ___ |  _ \ 
#\___ \| | | / __| __/ _ \ '_ ` _ \| | | |
# ___) | |_| \__ \ ||  __/ | | | | | |_| |
#|____/ \__, |___/\__\___|_| |_| |_|____/ 
#       |___/                             

alias order66='sudo systemctl enable'
alias dewit='sudo systemctl enable'
alias dewitnow='sudo systemctl start'
alias journal='journalctl -xe'
alias reload='sudo systemctl daemon-reload'
alias wiservoff='sudo ip link set wlp2s0 down'
alias wiservon='sudo systemctl start netctl'
alias ethservon='sudo systemctl start dhcpcd'
alias ethservoff='sudo systemctl stop dhcpcd'


# ____  _               _             _           
#|  _ \(_)_ __ ___  ___| |_ ___  _ __(_) ___  ___ 
#| | | | | '__/ _ \/ __| __/ _ \| '__| |/ _ \/ __|
#| |_| | | | |  __/ (__| || (_) | |  | |  __/\__ \
#|____/|_|_|  \___|\___|\__\___/|_|  |_|\___||___/
                                                 
alias conf='cd ~/.config; ls'
alias exe='cd /usr/local/bin && ls'
alias down='cd ~/Downloads && ls'
alias resume='cd ~/Downloads/resumes ;ls'
alias prog='cd ~/Programs; ls'
alias vid='cd ~/Videos; ls'
alias pic='cd ~/Pictures; ls'
alias udemy='cd ~/Videos/Udemy; ls'
alias goclass='cd ~/Videos/Udemy/Go/learn-how-to-code/'
alias mit='cd ~/MIT'
alias gosrc='cd ~/go/src'
alias gol='cd ~/go/src/ && ls'
alias proj='cd ~/project_1/ && ls'
alias serv='cd ~/go/src/service && ls -l' 
alias gtrain='cd ~/go/src/gotraining && ls'
alias pprof='go tool pprof'
alias xre='v ~/.Xresources'
alias change='xrdb ~/.Xresources'
alias vimrc='v ~/.config/nvim/init.vim'
alias sv='sudo nvim'
alias music='cd ~/music; ls'
alias ws='wiki-search'
alias arch='cd /usr/share/doc/arch-wiki/html/en/ && ls'


#  ____ _ _   
# / ___(_) |_ 
#| |  _| | __|
#| |_| | | |_ 
# \____|_|\__|
#             
alias lg="lazygit"
alias gref='git reflog'
alias gshow='git show'
alias gtag='git tag'
alias glog="git log --graph --abbrev-commit --decorate --format=format:'%C(bold green)%h%C(reset) - %C(bold cyan)%aD%C(reset) %C(bold yellow)(%ar)%C(reset)%C(auto)%d%C(reset)%n''          %C(white)%s%C(reset) %C(dim white)- %an%C(reset)' --all"
alias gc='git clone'
alias gi='git init'
alias gcom='git commit -m'
alias gcomx='git commit -am'
alias gd='git difftool'
alias gdiff='git diff'
alias gdh='git difftool HEAD'
alias gstat='git status'
alias gstatf='git status | fzf'
alias gadd='git add'
alias ga='git add --all'
alias gl='git log'
alias gpush='git push'
alias gcout='git checkout'
alias gcheck='git checkout -b'
alias gbranch='git branch'
function gremote(){
    git remote add origin git@github.com:Nokodoko/$1.git
}


# ____                                          
#|  _ \ _ __ ___   __ _ _ __ __ _ _ __ ___  ___ 
#| |_) | '__/ _ \ / _` | '__/ _` | '_ ` _ \/ __|
#|  __/| | | (_) | (_| | | | (_| | | | | | \__ \
#|_|   |_|  \___/ \__, |_|  \__,_|_| |_| |_|___/
#                 |___/                         

function sx(){
    cd ~/Pictures && fzf | xargs sxiv
}
alias qute='qutebrowser'

export FZF_COMPLETION_TRIGGER='**'

# Options to fzf command
export FZF_COMPLETION_OPTS='+c -x'

export FZF_CTRL_T_COMMAND="$FZF_DEFAULT_COMMAND"
export FZF_DEFAULT_COMMAND='fd --type f'

_fzf_compgen_path() {
  fd --hidden --follow --exclude ".git" . "$1"
}

# Use fd to generate the list for directory completion
_fzf_compgen_dir() {
  fd --type d --hidden --follow --exclude ".git" . "$1"
}

_fzf_comprun() {
  local command=$1
  shift

  case "$command" in
    cd)           fzf "$@" --preview 'tree -C {} | head -200' ;;
    export|unset) fzf "$@" --preview "eval 'echo \$'{}" ;;
    ssh)          fzf "$@" --preview 'dig {}' ;;
    *)            fzf "$@" ;;
  esac
}

function lsf(){
    fzf | xargs mplayer
}

alias yt='youtube-dl'
function ud(){
    udemy-dl $1 -k ~/Videos/at.txt
}
alias mail='neomutt'
alias mp='mplayer'
alias z='zathura'
alias mu='mupdf'
alias f='fzf'
#alias st='slack-term'



#  ____             __ _         _____ _ _           
# / ___|___  _ __  / _(_) __ _  |  ___(_) | ___  ___ 
#| |   / _ \| '_ \| |_| |/ _` | | |_  | | |/ _ \/ __|
#| |__| (_) | | | |  _| | (_| | |  _| | | |  __/\__ \
# \____\___/|_| |_|_| |_|\__, | |_|   |_|_|\___||___/
#                        |___/                       

alias i3='v ~/.config/i3/config'
alias pi='v ~/.config/.picom.conf'
alias xds='xdg-settings'
alias xo='xdg-open'

# _   _      _                      _    _             
#| \ | | ___| |___      _____  _ __| | _(_)_ __   __ _ 
#|  \| |/ _ \ __\ \ /\ / / _ \| '__| |/ / | '_ \ / _` |
#| |\  |  __/ |_ \ V  V / (_) | |  |   <| | | | | (_| |
#|_| \_|\___|\__| \_/\_/ \___/|_|  |_|\_\_|_| |_|\__, |
#                                                |___/ 
alias wifi='sudo netctl start'
alias here='sudo netctl start homebase'
alias here2='sudo netctl start homie'
alias nothere='sudo netctl stop homebase'
alias nothere2='sudo netctl stop homie'
alias there='sudo netctl start mobileC'
alias northere='sudo netctl stop mobileC'
alias why='sudo wifi-menu'
alias air='aircrack-ng'
alias blue='~/buds.sh'
#alias here='~/here.sh'


# galaxybuds 7C:38:AD:B8:59:82
# power on
# agent on
# default-agent
# connect [insert galaxybuds number]



# ____  _           _                 
#|  _ \(_)___ _ __ | | __ _ _   _ ___ 
#| | | | / __| '_ \| |/ _` | | | / __|
#| |_| | \__ \ |_) | | (_| | |_| \__ \
#|____/|_|___/ .__/|_|\__,_|\__, |___/
#            |_|            |___/     

alias x1='xrandr --output DP-1 --mode 3840x2160 --output eDP-1 --off'
alias xt='xrandr --output DP-1 --mode 1920x1080 --output eDP-1 --off'
alias x2kh='xrandr --output HDMI-1 --mode 1920x1080 --output eDP-1 --off'
alias x2khr='xrandr --output HDMI-1 --mode 1920x1080 --rotate right --output eDP-1 --off'
alias x3='xrandr --auto --output DP-1 --mode 1920x1080 --above eDP-1' 
alias xtop='xrandr --auto --output HDMI-1 --mode 1920x1080 --above eDP-1' 
alias xtopr='xrandr --auto --output HDMI-1 --mode 1920x1080 --rotate right --above eDP-1'
alias xtoprl='xrandr --auto --output HDMI-1 --mode 1920x1080 --rotate right --left-of eDP-1'
alias xon='xrandr --output eDP-1 --mode 1920x1080'
alias xoff='xrandr --output eDP-1 --mode 1920x1080 --output DP-1 --off --output HDMI-1 --off'
alias x4khr='xrandr --output HDMI-1 --mode 3840x2160 --rotate right --output eDP-1 --off'
alias x4khl='xrandr --output HDMI-1 --mode 3840x2160 --rotate left --output eDP-1 --off'
alias x4kh='xrandr --output HDMI-1 --mode 3840x2160 --output eDP-1 --off'
alias x4kd='xrandr --output DP-1 --mode 3840x2160 --output eDP-1 --off'
alias xd='xrandr --output HDMI-1 --mode 3840x2160 --output eDP-1 --off'
alias xb='xrandr --output HDMI-1 --mode 3840x1080 --output eDP-1 --off'
alias xbt='xrandr --output HDMI-1 --mode 3840x1080 --above eDP-1' 
alias xbd='xrandr --output DP-1 --mode 3840x1080 --output eDP-1 --off'
alias xb2='xrandr --output HDMI-1 --mode 3840x2160 --output eDP-1 --off'
alias x2='xrandr --output HDMI-1 --mode 1920x1080 --output eDP-1 --off'
alias x3='xrandr --output HDMI-1 --mode 3840x1080 --output DP-1 --mode 1920x1080 --left-of HDMI-1 --output eDP-1 --off'
alias x3r='xrandr --output HDMI-1 --mode 3840x1080 --output DP-1 --rotate right --left-of HDMI-1 --output eDP-1 --off'
alias x3f='xrandr --output HDMI-1 --mode 3840x1080 --output DP-1 --left-of HDMI-1 --output eDP-1 --off'
alias xbt='xrandr --output HDMI-1 --mode 3840x1080 --above eDP-1' 


# _____                 _   _                 
#|  ___|   _ _ __   ___| |_(_) ___  _ __  ___ 
#| |_ | | | | '_ \ / __| __| |/ _ \| '_ \/ __|
#|  _|| |_| | | | | (__| |_| | (_) | | | \__ \
#|_|   \__,_|_| |_|\___|\__|_|\___/|_| |_|___/



function get-source() {
    asp export $1 && \
    pushd $1 && \
    makepkg -do --skippgpcheck && \
    pushd src
}

alias ncu='npm-check-updates'
function kakashi() {
        meson build
        cd build
        ninja 
        sudo ninja install
} 

bindkey '^ ' forward-word

# ____                        _                _  ___  _    
#|  _ \ _____      _____ _ __| | _____   _____| |/ _ \| | __
#| |_) / _ \ \ /\ / / _ \ '__| |/ _ \ \ / / _ \ | (_) | |/ /
#|  __/ (_) \ V  V /  __/ |  | |  __/\ V /  __/ |\__, |   < 
#|_|   \___/ \_/\_/ \___|_|  |_|\___| \_/ \___|_|  /_/|_|\_\






POWERLEVEL9K_MODE='nerdfont-complete'
POWERLEVEL9K_PROMPT_ON_NEWLINE=true
POWERLEVEL9K_RPROMPT_ON_NEWLINE=true
POWERLEVEL9K_HOME_SUB_ICON=$'\UE18D '
POWERLEVEL9K_LINUX_ICON='\uf300'
# #zsh_wifi_signal(){
#    local signal=$(nmcli device wifi | grep yes | awk '{print $8}')
#    local color='%F{yellow}'
#    [[ $signal -gt 75 ]] && color='%F{green}'
#    [[ $signal -lt 50 ]] && color='%F{red}'
#    echo -n "%{$color%}\uf230  $signal%{%f%}" # \uf230 is 
#}
#
#POWERLEVEL9K_CUSTOM_WIFI_SIGNAL="zsh_wifi_signal"
#POWERLEVEL9K_LEFT_PROMPT_ELEMENTS=(context time battery dir vcs virtualenv custom_wifi_signal)

export ZSH_THEME="powerlevel9k/powerlevel9k"                       
source ~/.config/powerlevl9k/powerlevel9k.zsh-theme
source ~/.zsh/zsh-autosuggestions/zsh-autosuggestions/zsh-autosuggestions.zsh 
source ~/.zsh/zsh-syntax-highlighting/zsh-syntax-highlighting.zsh

POWERLEVEL9K_LEFT_PROMPT_ELEMENTS=(context dir vi_mode vcs)
POWERLEVEL9K_VI_MODE_NORMAL_BACKGROUND='000'
POWERLEVEL9K_VI_MODE_NORMAL_FOREGROUND='201'
POWERLEVEL9K_VI_MODE_INSERT_BACKGROUND='000'
POWERLEVEL9K_VI_MODE_INSERT_FOREGROUND='046'
POWERLEVEL9K_VI_MODE_VISUAL_BACKGROUND='000'
POWERLEVEL9K_VI_MODE_VISUAL_FOREGROUND='171'
POWERLEVEL9K_USER_DEFAULT_BACKGROUND='000'
POWERLEVEL9K_USER_DEFAULT_FOREGROUND='093'
POWERLEVEL9K_HOST_LOCAL_BACKGROUND='055'
POWERLEVEL9K_HOST_LOCAL_FOREGROUND='015'
POWERLEVEL9K_HOST_REMOTE_BACKGROUND='015'
POWERLEVEL9K_HOST_REMOTE_FOREGROUND='009'
POWERLEVEL9K_USER_SUDO_BACKGROUND='166'
POWERLEVEL9K_USER_SUDO_FOREGROUND='015'
POWERLEVEL9K_USER_ROOT_BACKGROUND='009'
POWERLEVEL9K_USER_ROOT_FOREGROUND='015'
POWERLEVEL9K_CONTEXT_DEFAULT_BACKGROUND='000'
POWERLEVEL9K_CONTEXT_DEFAULT_FOREGROUND='129'
POWERLEVEL9K_DIR_HOME_BACKGROUND='199'
POWERLEVEL9K_DIR_HOME_FOREGROUND='239'
POWERLEVEL9K_DIR_HOME_SUBFOLDER_FOREGROUND='051'
POWERLEVEL9K_DIR_HOME_SUBFOLDER_BACKGROUND='234'
POWERLEVEL9K_VCS_CLEAN_FOREGROUND='000'
POWERLEVEL9K_VCS_CLEAN_BACKGROUND='166'
POWERLEVEL9K_VCS_UNTRACKED_FOREGROUND='015'
POWERLEVEL9K_VCS_UNTRACKED_BACKGROUND='160'
POWERLEVEL9K_VCS_MODIFIED_FOREGROUND='000'
POWERLEVEL9K_VCS_MODIFIED_BACKGROUND='178'


