#!/bin/bash

# Ensure the Dynamic Profiles directory exists
mkdir -p "$HOME/Library/Application Support/iTerm2/DynamicProfiles"

# Create a profile patch that includes our Ctrl+Backspace hex code binding
cat << 'EOF' > "$HOME/Library/Application Support/iTerm2/DynamicProfiles/tmux_bindings.json"
{
  "Profiles": [
    {
      "Name": "Default",
      "Guid": "Default-Profile-Patch",
      "Custom Key Mappings": {
        "0x7f-0x100000": {
          "Action": 11,
          "Text": "0x1f"
        }
      }
    }
  ]
}
EOF

echo "iTerm2 key binding profile installed successfully!"

