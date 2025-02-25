# Easel UI Checker

This Google Chrome extension allows you to generate a transparent canvas on top
of any webpage. You can then upload an image to that canvas and drag and drop it
anywhere on the page. You can then manipulate the canvas opacity to compare the
image to what is underneath it on the page. This allows developers to compare
their live elements directly to components that they have exported from design
software like Figma.

## Installation

- Download the source code by cloning this repository, or by downloading an
  extracting a zip of the repo.

- On Google chrome or a chromium based
  browser, click the "manage extensions" button in your toolbar.

- In the top right, check "developer mode".

- In the top left, click "load unpacked".

- Select the directory that you cloned or downloaded earlier.

- Optionally, pin the extension to your toolbar to make it easier to use.

## Usage

### Creating a new Easel

To place a new canvas on the Easel, click on the Easel icon in your toolbar to
bring up the Easel menu. Then click "New". You'll know it worked because you'll
see a 1 pixel wide red border on the edges of your screen.

If you click "New" again after creating an Easel, you'll be prompted if you want
to start over.

### Adding an Image to the Easel

To upload your Figma component, export it in its standard size as a PNG. Then,
click "Import" on the Easel menu. This will pop up the image uploader in the
middle of your screen. Select your image file, and watch the component appear on
your screen.

### Manipulating the Image

You may freely drag and drop the image around on the screen to position it where
needed. To delete the image, either import a new one, or press "Ctrl+Shift+D" to
clear the Easel.

### Manipulating Opacity

The Easel menu has a "visibility" slider that will allow you to set the opacity
of the canvas that is on the Easel. This will allow you to compare elements laid
on top of one another.

## Road Map

This was a weekend project that I threw together quickly to create a free
alternative to other tools that allow you to "onion skin" your figma components.
With that said, I ran out of time to make it do everything I wanted. I may add
these features in the future:

- The ability to save and load canvases
- More keyboard shortcuts
- Context menu actions
- A layer system to support multiple images
- The ability to persist the canvas automatically across refreshes
- Export-Easel-As-Image functionality
