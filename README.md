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

### Hiding the Easel

The Easel has a very high z-index layer to ensure it goes overtop most webpages.
This can cause interactivity problems and even prevent scrolling at times. If
you need to hide the Easel to navigate around the page, but don't want to
deleted the Easel, you can toggle the Easel on and off using the toggle button
in the menu.

### Deleting the Easel

If you're done with the Easel and ready to get back to your webpage, simply
click the "delete" button in the bottom menu. This will remove the Easel from
your webpage and allow you to return to normal functionality.

## Keyboard Shortcuts

- **Ctrl+Shift+O**: Open the Easel Menu
- **Ctrl+Shift+D**: Remove image from the Easel

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
