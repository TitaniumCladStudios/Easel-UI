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

// Components elements
let componentsList = document.getElementById("componentsList");
let refreshComponentsBtn = document.getElementById("refreshComponents");

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

// Components event listeners
refreshComponentsBtn.addEventListener("click", scanForComponents);

// Initialize components scan when popup opens
scanForComponents();

function switchTab(tabName) {
  // Remove active class from all tabs and contents
  tabButtons.forEach(btn => btn.classList.remove("active"));
  tabContents.forEach(content => content.classList.remove("active"));
  
  // Add active class to selected tab and content
  document.querySelector(`[data-tab="${tabName}"]`).classList.add("active");
  document.getElementById(`${tabName}-tab`).classList.add("active");
  
  // If switching to components tab, refresh the component list
  if (tabName === 'components') {
    scanForComponents();
  }
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

// Components functionality
async function scanForComponents() {
  try {
    // Show loading state
    componentsList.innerHTML = `
      <div class="loading-message">
        <p>Scanning page for components...</p>
      </div>
    `;

    // Query the active tab for components
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    // Inject script to find components
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: findComponentsOnPage,
    });

    const components = results[0].result;
    displayComponents(components);
    
  } catch (error) {
    console.error('Error scanning for components:', error);
    componentsList.innerHTML = `
      <div class="no-components-message">
        <p>Error scanning for components</p>
        <small>Make sure you're on a page with Figma components</small>
      </div>
    `;
  }
}

function findComponentsOnPage() {
  // This function runs in the context of the web page
  const components = [];
  const elements = document.querySelectorAll('[data-figma-component]');
  
  elements.forEach((element, index) => {
    const componentName = element.getAttribute('data-figma-component');
    const tagName = element.tagName.toLowerCase();
    const className = element.className || '';
    const id = element.id || '';
    
    // Create a simple selector for the element
    let selector = tagName;
    if (id) {
      selector += `#${id}`;
    } else if (className) {
      const firstClass = className.split(' ')[0];
      if (firstClass) {
        selector += `.${firstClass}`;
      }
    }
    
    components.push({
      index,
      componentName,
      selector,
      tagName,
      className,
      id
    });
  });
  
  return components;
}

function displayComponents(components) {
  if (components.length === 0) {
    componentsList.innerHTML = `
      <div class="no-components-message">
        <p>No components found on this page</p>
        <small>Add data-figma-component attributes to elements you want to compare</small>
      </div>
    `;
    return;
  }

  const componentsHTML = components.map(component => `
    <div class="component-item">
      <div class="component-info">
        <div class="component-name">${component.componentName}</div>
        <div class="component-selector">${component.selector}</div>
      </div>
      <button class="component-compare-btn" data-component-index="${component.index}">
        Compare
      </button>
    </div>
  `).join('');

  componentsList.innerHTML = componentsHTML;

  // Add event listeners to compare buttons
  const compareButtons = componentsList.querySelectorAll('.component-compare-btn');
  compareButtons.forEach(button => {
    button.addEventListener('click', () => {
      const componentIndex = parseInt(button.getAttribute('data-component-index'));
      triggerComparison(componentIndex);
    });
  });
}

async function triggerComparison(componentIndex) {
  try {
    // Get the active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    // Send message to trigger comparison for specific component
    await chrome.tabs.sendMessage(tab.id, {
      action: 'runComparison',
      componentIndex: componentIndex
    });
    
    // Visual feedback
    const button = document.querySelector(`[data-component-index="${componentIndex}"]`);
    const originalText = button.textContent;
    button.textContent = 'Comparing...';
    button.disabled = true;
    
    setTimeout(() => {
      button.textContent = originalText;
      button.disabled = false;
    }, 3000);
    
  } catch (error) {
    console.error('Error triggering comparison:', error);
  }
}
