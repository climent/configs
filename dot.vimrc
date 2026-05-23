" Vim configuration file

" Enable syntax highlighting
set nocompatible
filetype plugin indent on
syntax on

" Show always the last 4 lines at the bottom and top
set scrolloff=4

" Show line numbers
set number

" Ignore case when searching, use with care
set ignorecase

" Makes the cursor jump to and highlight search matches in real-time as you type
set incsearch

" Displays your position (line and column number) in the bottom right corner
set ruler

" Highlight the current line horizontally (where the cursor is)
set cursorline

" Visualize paired characters like parentheses ()
set showmatch

" Always show the status bar at the bottom
set laststatus=2
set statusline=
set statusline +=%1*\ %n\ %*            "buffer number
set statusline +=%5*\ %{&ff}\ %*        "file format
set statusline +=%3*\ %y\ %*            "file type
set statusline +=%4*\ %<%F\ %*          "full path
set statusline +=%2*%m%*                "modified flag
set statusline +=%1*%=%*                "spaces
set statusline +=%2*%l%*                "current line
set statusline +=%2*/%L%*               "total lines
set statusline +=%1*%4v\ %*             "virtual column number
set statusline +=%2*0x%04B\ %*          "character under cursor

" --- Colors ---
set background=dark

" --- Statusline Colors ---

" User1: Blue background, Black text (Buffer number, current line, v-col)
hi User1 ctermbg=darkblue ctermfg=white guibg=#005f87 guifg=#ffffff

" User2: Red background, White text (Modified flag, total lines, hex char)
hi User2 ctermbg=red ctermfg=white guibg=#af0000 guifg=#ffffff

" User3: Green background, Black text (File type)
hi User3 ctermbg=green ctermfg=black guibg=#87af5f guifg=#000000

" User4: Dark Grey background, White text (Full path)
hi User4 ctermbg=darkgrey ctermfg=white guibg=#4e4e4e guifg=#ffffff

" User5: Yellow background, Black text (File format)
hi User5 ctermbg=cyan ctermfg=black guibg=#d7af00 guifg=#000000


" Set some aliases so that we don't have to retype
map :Wq :wq
map :WQ :wq
map :wQ :wq
map :Q! :q!

"set colorcolumn=80
