# Easel UI Checker

![An Easel that has a code symbol on it](./images/Easel_Icon.png "Easel UI Logo")

This Google Chrome extension allows you to generate a transparent canvas on top
of any webpage. You can then upload an image to that canvas and drag and drop it
anywhere on the page. You can also automatically compare your live web components
to Figma designs using the new integrated Figma API functionality. This allows
developers to compare their live elements directly to components exported from
design software like Figma, either manually or through automated pixel-by-pixel
comparison.

## Installation

Get this extension from the Chrome Web Store, or build it yourself.

### From the Chrome Web Store

- Click the "Add to Chrome" button on the [Chrome Web Store page](https://chromewebstore.google.com/detail/hjkaadbjjgegojhnoeohniflnidgajkc?utm_source=item-share-cb).

- Optionally, pin the extension to your toolbar to make it easier to use.

### From Source

- Download the source code by cloning this repository, or by downloading an
  extracting a zip of the repo.

- On Google chrome or a chromium based
  browser, click the "manage extensions" button in your toolbar.

- In the top right, check "developer mode".

- In the top left, click "load unpacked".

- Select the directory that you cloned or downloaded earlier.

- Optionally, pin the extension to your toolbar to make it easier to use.

## Figma Integration Setup

### 1. Generate a Figma Personal Access Token

To use the automatic component comparison features, you'll need to set up Figma integration:

1. Go to your [Figma Account Settings](https://www.figma.com/settings)
2. Scroll down to "Personal Access Tokens"
3. Click "Create a new personal access token"
4. Give it a descriptive name (e.g., "Easel UI Checker")
5. Copy the generated token (you won't be able to see it again)

### 2. Get Your Figma File Key

1. Open your Figma file in the browser
2. Copy the file key from the URL: `https://www.figma.com/file/[FILE_KEY]/...`
3. The file key is the long string of characters after `/file/` and before the next `/`

### 3. Configure Easel Settings

1. Click the Easel extension icon in your browser toolbar
2. Navigate to the "Settings" tab
3. Enter your Personal Access Token in the password field
4. Enter your Figma File Key
5. Click "Save Settings"

## Usage

### Manual Image Comparison

#### Adding an Image to the Easel

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

### Automatic Component Comparison

#### Marking Components for Testing

To enable automatic comparison between your web components and Figma designs:

1. Add the `data-figma-component` attribute to any HTML element you want to test
2. Set the attribute value to match the exact name of your component in Figma

**Example:**

```html
<button data-figma-component="Primary Button" class="btn btn-primary">
  Click Me
</button>

<div data-figma-component="Navigation Card" class="nav-card">
  <!-- card content -->
</div>
```

#### Using the Components Tab

1. Click the Easel extension icon in your browser toolbar
2. Navigate to the "Components" tab
3. The extension will automatically scan the current page for elements with `data-figma-component` attributes
4. Click "Refresh Components" to rescan the page after making changes
5. Select any detected component to automatically compare it with the corresponding Figma design

**Important Notes:**

- Component names in the `data-figma-component` attribute must exactly match the component names in your Figma file
- The extension performs pixel-by-pixel comparison between your live component and the Figma design
- Make sure your Figma settings are properly configured before using this feature

## Keyboard Shortcuts

- **Ctrl+Shift+O**: Open the Easel Menu
- **Ctrl+Shift+D**: Remove image from the Easel

## Road Map

This was a weekend project that I threw together quickly to create a free
alternative to other tools that allow you to "onion skin" your figma components.
With that said, I ran out of time to make it do everything I wanted. I may add
these features in the future:

- [ ] More keyboard shortcuts
- [ ] Context menu actions
- [x] The ability to persist the canvas automatically across refreshes
- [x] Figma API integration for automatic component comparison
- [x] Component detection and marking system
- [ ] Export-Easel-As-Image functionality
- [ ] Batch component comparison
- [x] Visual diff highlighting for component mismatches
