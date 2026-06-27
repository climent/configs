# Created by `pipx` on 2026-01-02 17:07:38
export PATH="$PATH:/Users/climent/.local/bin"
export PATH=$PATH:/usr/local/go/bin

export PATH="/opt/homebrew/opt/arm-none-eabi-binutils/bin:$PATH"
export PATH="/opt/homebrew/opt/arm-none-eabi-gcc@8/bin:$PATH"

# Added by Antigravity
export PATH="/Users/climent/.antigravity/antigravity/bin:$PATH"

eval "$(/opt/homebrew/bin/brew shellenv)"

#-----------------------------------------------------------------------------#
## Aliases
alias l="ls"
alias ll='ls -lF'
alias la="ls -lAF"
alias lr='ls -lrt'

alias t='tmux detach ; tmux attach || tmux'

alias  ytd='yt-dlp -t mp3 --no-keep-video --audio-quality 256K --embed-thumbnail --embed-metadata'
alias ytld='yt-dlp -t mp3 --no-keep-video --audio-quality 256K --embed-thumbnail --embed-metadata --parse-metadata "playlist_index:%(track_number)s" -o "%(playlist_autonumber)02d. %(title)s.%(ext)s"'
alias   bu='brew upgrade'
alias   zz='vi ~/.zshrc && source ~/.zshrc'

# alias starship='eval "$(starship init zsh)"'
#-----------------------------------------------------------------------------#

# Download git-prompt from github/configs
#source ~/.git-prompt.sh

#export GIT_PS1_SHOWUPSTREAM=yes
#_homedir_chars=$(echo $HOME | wc -c)
#my_hostname=$(hostname)
#SHORTHOSTNAME=${my_hostname%%.corp.google.com}
## Set 32m:green 31m:red 33m:yellow 34m:blue 35m
#PROMPT_COMMAND='_RET=$?;PS1="> \[\e[32m\]\u\[\e[0m\]@\[\e[32m\]$SHORTHOSTNAME\[\e[0m\]:[ \`if echo \"$PWD\" | grep -q "^$HOME"; then echo \"~/${PWD:${_homedir_chars}}\" ; else echo \"$PWD\"; fi\` ]\n[`if [ ! "$_RET" == "0" ]; then echo "\[\e[31m\]" ; fi`$_RET\[\e[0m\]]\[\e[33m\]`__git_ps1 `\[\e[0m\] \$> "'

#setopt PROMPT_SUBST ; PS1='> %{$fg[green]%}%n@%m%{$reset_color%}:[ %c ]'$'\n[%?]%{$fg[yellow]%}$(__git_ps1 " (%s)") %{$reset_color%}\$> '
#setopt PROMPT_SUBST ; PS1='> %{$fg[green]%}%n@%m%{$reset_color%}:[ %(5~|%-1~/.../%3~|%4~) ]'$'\n[%?]%{$fg[yellow]%}$(__git_ps1 " (%s)") %{$reset_color%}\$> '

#-----------------------------------------------------------------------------#
# ZSH plugins and configurations
source /opt/homebrew/share/zsh-syntax-highlighting/zsh-syntax-highlighting.zsh
# Ignore widget interactions that break yanking
source /opt/homebrew/share/zsh-autosuggestions/zsh-autosuggestions.zsh
ZSH_AUTOSUGGEST_IGNORE_WIDGETS+=(yank yank-pop backward-kill-word backward-kill-space-word backward-kill-bash-word)

############## ^R historical ##############
eval "$(atuin init zsh --disable-up-arrow)"

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
#source /usr/local/share/powerlevel10k/powerlevel10k.zsh-theme

