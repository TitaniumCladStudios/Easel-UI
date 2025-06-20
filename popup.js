// let newEaselBtn = document.getElementById("newEasel");
let deleteBtn = document.getElementById("deleteCanvas");
let toggleCanvasBtn = document.getElementById("toggleCanvas");
let loadImageBtn = document.getElementById("loadImage");
let opacitySlider = document.getElementById("opacity");
let scaleSlider = document.getElementById("scale");

// Settings elements
let figmaTokenInput = document.getElementById("figmaToken");
let figmaFileKeyInput = document.getElementById("figmaFileKey");
let saveSettingsBtn = document.getElementById("saveSettings");
let toggleTokenVisibilityBtn = document.getElementById("toggleTokenVisibility");

// Tab elements
let tabButtons = document.querySelectorAll(".tab-button");
let tabContents = document.querySelectorAll(".tab-content");

let layerCount = 0;

// Load saved settings on popup open
loadSettings();

// Tab event listeners
tabButtons.forEach(button => {
  button.addEventListener("click", () => switchTab(button.dataset.tab));
});

// newEaselBtn.message = { newEasel: true };
deleteBtn.message = { deleteEasel: true };
toggleCanvasBtn.message = { toggleCanvas: true };
loadImageBtn.message = { loadImage: true };
// newEaselBtn.addEventListener("click", sendMessage, false);
toggleCanvasBtn.addEventListener("click", sendMessage, false);
deleteBtn.addEventListener("click", sendMessage, false);
loadImageBtn.addEventListener("click", sendMessage, false);
opacitySlider.addEventListener("input", changeOpacity);
scaleSlider.addEventListener("input", changeScale);

// Settings event listeners
saveSettingsBtn.addEventListener("click", saveSettings);
toggleTokenVisibilityBtn.addEventListener("click", toggleTokenVisibility);

function switchTab(tabName) {
  // Remove active class from all tabs and contents
  tabButtons.forEach(btn => btn.classList.remove("active"));
  tabContents.forEach(content => content.classList.remove("active"));
  
  // Add active class to selected tab and content
  document.querySelector(`[data-tab="${tabName}"]`).classList.add("active");
  document.getElementById(`${tabName}-tab`).classList.add("active");
}

function sendMessage(e) {
  (async () => {
    const response = await chrome.runtime.sendMessage(e.currentTarget.message);
    console.log(response);
  })();
}

// Had to declare a special function here for the time being
function changeOpacity() {
  (async () => {
    const response = await chrome.runtime.sendMessage({
      changeOpacity: true,
      opacity: opacitySlider.value,
    });
    console.log(response);
  })();
}

function changeScale() {
  (async () => {
    const response = await chrome.runtime.sendMessage({
      changeScale: true,
      scale: scaleSlider.value,
    });
    console.log(response);
  })();
}

// Settings functions
async function loadSettings() {
  try {
    const result = await chrome.storage.sync.get(['figmaToken', 'figmaFileKey']);
    if (result.figmaToken) {
      figmaTokenInput.value = result.figmaToken;
    }
    if (result.figmaFileKey) {
      figmaFileKeyInput.value = result.figmaFileKey;
    }
  } catch (error) {
    console.error('Error loading settings:', error);
  }
}

async function saveSettings() {
  try {
    const settings = {
      figmaToken: figmaTokenInput.value.trim(),
      figmaFileKey: figmaFileKeyInput.value.trim()
    };
    
    await chrome.storage.sync.set(settings);
    
    // Visual feedback
    const originalText = saveSettingsBtn.querySelector('span').textContent;
    saveSettingsBtn.querySelector('span').textContent = 'Saved!';
    saveSettingsBtn.style.background = 'linear-gradient(to right, #28a745, #20c997)';
    
    setTimeout(() => {
      saveSettingsBtn.querySelector('span').textContent = originalText;
      saveSettingsBtn.style.background = 'linear-gradient(to right, #28a745, #20c997)';
    }, 2000);
    
    // Notify content scripts that settings have changed
    chrome.runtime.sendMessage({
      action: 'settingsUpdated',
      settings: settings
    });
    
  } catch (error) {
    console.error('Error saving settings:', error);
    
    // Error feedback
    const originalText = saveSettingsBtn.querySelector('span').textContent;
    saveSettingsBtn.querySelector('span').textContent = 'Error!';
    saveSettingsBtn.style.background = 'linear-gradient(to right, #dc3545, #c82333)';
    
    setTimeout(() => {
      saveSettingsBtn.querySelector('span').textContent = originalText;
      saveSettingsBtn.style.background = 'linear-gradient(to right, #28a745, #20c997)';
    }, 2000);
  }
}

function toggleTokenVisibility() {
  if (figmaTokenInput.type === 'password') {
    figmaTokenInput.type = 'text';
    toggleTokenVisibilityBtn.innerHTML = '&#x1F648;'; // see-no-evil monkey
    toggleTokenVisibilityBtn.title = 'Hide token';
  } else {
    figmaTokenInput.type = 'password';
    toggleTokenVisibilityBtn.innerHTML = '&#x1F441;'; // eye
    toggleTokenVisibilityBtn.title = 'Show token';
  }
}
