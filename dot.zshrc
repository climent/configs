# Created by `pipx` on 2026-01-02 17:07:38
export PATH="$PATH:/Users/climent/.local/bin"
export PATH=$PATH:/usr/local/go/bin

# Added by Antigravity
export PATH="/Users/climent/.antigravity/antigravity/bin:$PATH"


eval "$(/opt/homebrew/bin/brew shellenv)"

## Aliases
alias l="ls"
alias ll='ls -l'
alias la="ls -la"

alias vnc="ssh -L 5901:localhost:5901 d"
alias code="/Applications/Visual\ Studio\ Code.app/Contents/Resources/app/bin/code"
alias t='tmux detach ; tmux attach || tmux'

alias  ytd='yt-dlp -t mp3 --no-keep-video --audio-quality 256K --embed-thumbnail --embed-metadata'
alias ytld='yt-dlp -t mp3 --no-keep-video --audio-quality 256K --embed-thumbnail --embed-metadata --parse-metadata "playlist_index:%(track_number)s" -o "%(playlist_autonumber)02d. %(title)s.%(ext)s"'

alias copy_mp3="rsync -av --progress --include='*.mp3' --include='*/' --exclude='*'"

# Download git-prompt from github/configs
#source ~/.git-prompt.sh

#export GIT_PS1_SHOWUPSTREAM=yes
#_homedir_chars=$(echo $HOME | wc -c)
#my_hostname=$(hostname)
#SHORTHOSTNAME=${my_hostname%%.corp.google.com}
## Set 32m:green 31m:red 33m:yellow 34m:blue 35m
#PROMPT_COMMAND='_RET=$?;PS1="> \[\e[32m\]\u\[\e[0m\]@\[\e[32m\]$SHORTHOSTNAME\[\e[0m\]:[ \`if echo \"$PWD\" | grep -q "^$HOME"; then echo \"~/${PWD:${_homedir_chars}}\" ; else echo \"$PWD\"; fi\` ]\n[`if [ ! "$_RET" == "0" ]; then echo "\[\e[31m\]" ; fi`$_RET\[\e[0m\]]\[\e[33m\]`__git_ps1 `\[\e[0m\] \$> "'

function mkcd ()
{
    mkdir -p -- "$1" && cd -P -- "$1"
}

eval "$(atuin init zsh)"

# ZSH plugins and configurations
source /opt/homebrew/share/zsh-syntax-highlighting/zsh-syntax-highlighting.zsh
# source /opt/homebrew/share/zsh-autosuggestions/zsh-autosuggestions.zsh  # commented out because it breaks yanking

source /opt/homebrew/share/powerlevel10k/powerlevel10k.zsh-theme

# Delete the word back the same way Bash does it.
zle -N backward-kill-space-word
backward-kill-space-word() {
  zle -f kill
  WORDCHARS="*?_-.[]~=/&:;\!'#$%^(){}<>" zle .backward-kill-word
}

zle -N backward-kill-bash-word
backward-kill-bash-word() {
  zle -f kill
  WORDCHARS='' zle .backward-kill-word
}

bindkey   '^W' backward-kill-space-word
bindkey '^[^?' backward-kill-bash-word
autoload -Uz compinit && compinit
autoload -U colors && colors

zstyle ':completion:*' special-dirs true

alias code='/Applications/Visual\ Studio\ Code.app/Contents/Resources/app/bin/code'

# alias starship='eval "$(starship init zsh)"'
alias agu='brew update && brew upgrade'

export GIT_PS1_SHOWUPSTREAM=yes
source ~/.git-prompt.sh
setopt PROMPT_SUBST ; PS1='> %{$fg[green]%}%n@%m%{$reset_color%}:[ %c ]'$'\n[%?]%{$fg[yellow]%}$(__git_ps1 " (%s)") %{$reset_color%}\$> '
setopt PROMPT_SUBST ; PS1='> %{$fg[green]%}%n@%m%{$reset_color%}:[ %(5~|%-1~/.../%3~|%4~) ]'$'\n[%?]%{$fg[yellow]%}$(__git_ps1 " (%s)") %{$reset_color%}\$> '

export PATH="/opt/homebrew/opt/arm-none-eabi-binutils/bin:$PATH"
export PATH="/opt/homebrew/opt/arm-none-eabi-gcc@8/bin:$PATH"
