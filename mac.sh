# Although not Alt + left-click-drag but this would give you Ctrl + Cmd + Click natively (High Sierra or later), no 3rd party app required:
#sourced from http://www.mackungfu.org/UsabilityhackClickdraganywhereinmacOSwindowstomovethem

#Run this command in terminal to enable Ctrl + Cmd + Click in any window to move. Restart after.
# to add
defaults write -g NSWindowShouldDragOnGesture -bool true   
# to remove
defaults delete -g NSWindowShouldDragOnGesture

