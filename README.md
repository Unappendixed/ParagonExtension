# ParagonExtension
A Chrome extension to improve Paragon data inputting for board admins.

## Installing unpacked
Chrome by default only allows extensions from the official Chrome Web Store for security reasons. To test this extension locally, you will need to enable Developer Mode and load it unpacked. See [this link for instructions](https://webkul.com/blog/how-to-install-the-unpacked-extension-in-chrome/).

## Customizing settings
Once the extension is loaded, an icon will appear in the extensions tray at the top right of the browser. Clicking on this icon will open the extension's settings.

<img src="https://i.imgur.com/NPbJdxJ.png" width="500px"/>

## Code contents
The only code that's relevant to Paragon itself is in content.js. Manifest.json declares the extention's permissions. All  other files including hotkeys.js, background.js, options.html, and all style/image files are for the settings page or general theming. JQuery is the only dependency, and it could be removed in future versions.
