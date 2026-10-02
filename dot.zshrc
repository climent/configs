export PATH="$HOME/.local/bin:$PATH"
export PATH="${KREW_ROOT:-$HOME/.krew}/bin:$PATH"
export PATH=/opt/homebrew/share/google-cloud-sdk/bin:"$PATH"

source /Users/jeclimen/.colima/macos_config/macos_ulimit.conf

# Homebrew
#source "$(brew --prefix)/opt/fzf/shell/completion.zsh"
#source "$(brew --prefix)/opt/fzf/shell/key-bindings.zsh"

eval "$(atuin init zsh --disable-up-arrow)"

#-----------------------------------------------------------------------------#
## Aliases
alias l="ls"
alias ll='ls -lF'
alias la="ls -lAF"
alias lr='ls -lrt'
alias cd..='cd ..'

alias rgrep='grep -r'
alias rfind='find . | grep'

alias t='tmux detach ; tmux attach || tmux'

alias  ytd='yt-dlp -t mp3 --no-keep-video --audio-quality 256K --embed-thumbnail --embed-metadata'
alias ytld='yt-dlp -t mp3 --no-keep-video --audio-quality 256K --embed-thumbnail --embed-metadata --parse-metadata "playlist_index:%(track_number)s" -o "%(playlist_autonumber)02d. %(title)s.%(ext)s"'
alias   bu='brew upgrade'
alias   zz='vi ~/.zshrc && source ~/.zshrc'
alias   nv='nvim'
alias    v='nvim'

alias bu='brew upgrade'

alias zz='vi ~/.zshrc && source ~/.zshrc'
alias cw='~/.local/bin/claude-wt'

alias kc=kubectl
alias kx=kubectx

alias gu='for i in ~/Sources/* ~/Sources/shop/* ; do (cd "$i" && [[ -d .git ]] && echo " ======= " $(pwd) " ====== "  && git status && git fetch --all && git pull ) ; done'

export EDITOR=vim
#-----------------------------------------------------------------------------#
# ZSH plugins and configurations
source /opt/homebrew/share/zsh-syntax-highlighting/zsh-syntax-highlighting.zsh
# Ignore widget interactions that break yanking
source /opt/homebrew/share/zsh-autosuggestions/zsh-autosuggestions.zsh
ZSH_AUTOSUGGEST_IGNORE_WIDGETS+=(yank yank-pop backward-kill-word backward-kill-space-word backward-kill-bash-word)

zstyle ':completion:*' special-dirs true
fpath=(~/.local/share/zsh/site-functions $fpath)
autoload -Uz compinit
compinit


############## Prompt ##############
# brew gitstatus
#source /usr/local/opt/gitstatus/gitstatus.prompt.zsh

# brew powerlevel10k
# To customize prompt, run `p10k configure` or edit ~/.p10k.zsh.
# Don't load p10k in the subshell that midnight commander runs under.
if [[ -z "$MC_SID" ]]; then
  # To customize prompt, run `p10k configure` or edit ~/.p10k.zsh.
  [[ ! -f ~/.p10k.zsh ]] || source ~/.p10k.zsh
  source /opt/homebrew/share/powerlevel10k/powerlevel10k.zsh-theme
fi

if [[ "-$TERM" == "-tmux-256color" ]] || [[ $HERDR_SOCKET_PATH ]] ; then
  bindkey -e
fi

# Load version control information
#autoload -Uz vcs_info
#precmd() { vcs_info }

# Format the vcs_info_msg_0_ variable
#zstyle ':vcs_info:git:*' formats '%b'

# Set up the prompt (with git branch name)
#setopt PROMPT_SUBST

#PROMPT='[%n@%m] [%1~]
#%F{green}(${vcs_info_msg_0_})%F{white}$ '
#-----------------------------------------------------------------------------#

#-----------------------------------------------------------------------------#
# Behave more like bash does
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

bindkey "^[[1;3C" forward-word
bindkey "^[[1;3D" backward-word

autoload -U select-word-style
select-word-style bash

autoload -Uz compinit && compinit
autoload -U colors && colors

zstyle ':completion:*' special-dirs true
#-----------------------------------------------------------------------------#

function mkcd ()
{
    mkdir -p -- "$1" && cd -P -- "$1"
}

setopt HIST_IGNORE_ALL_DUPS
