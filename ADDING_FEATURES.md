# Adding a New Feature to YTFocus

This guide explains how to add a new filtering functionality (e.g., hide live chats, hide recommendations) to the YTFocus Chrome extension.

## Overview

To add a new feature, you need to modify 3 files:
1. `popup.html` - Add the toggle UI
2. `popup.js` - Handle toggle state with `chrome.storage.local`
3. `content.js` - Add the hiding logic

---

## Step 1: Add Toggle in popup.html

Add a new toggle row in the popup HTML:

```html
<div class="toggle-row">
  <label class="switch">
    <input type="checkbox" id="hideYourFeature">
    <span class="slider"></span>
  </label>
  <span class="label">Hide Your Feature</span>
</div>
```

Place it after the existing toggles, before the closing `</div>` of the container.

---

## Step 2: Handle Toggle in popup.js

### 2.1 Add to DEFAULT_SETTINGS

Add your new setting to the default settings object:

```javascript
const DEFAULT_SETTINGS = {
  masterEnabled: true,
  hideShorts: true,
  hideComments: true,
  hideYourFeature: true  // Add this line
};
```

### 2.2 Add Element Reference

In the `DOMContentLoaded` event handler, add:

```javascript
const hideYourFeature = document.getElementById('hideYourFeature');
```

### 2.3 Initialize Toggle State

In the `chrome.storage.local.get` callback:

```javascript
hideYourFeature.checked = settings.hideYourFeature;
```

### 2.4 Add Event Listener

Add the change event handler:

```javascript
hideYourFeature.addEventListener('change', () => {
  chrome.storage.local.set({ hideYourFeature: hideYourFeature.checked });
});
```

### 2.5 Update Disabled State

In the `updateToggleStates` function:

```javascript
function updateToggleStates() {
  hideShorts.disabled = !masterToggle.checked;
  hideComments.disabled = !masterToggle.checked;
  hideYourFeature.disabled = !masterToggle.checked;  // Add this line
}
```

---

## Step 3: Add Hiding Logic in content.js

### 3.1 Add to DEFAULT_SETTINGS

```javascript
const DEFAULT_SETTINGS = {
  masterEnabled: true,
  hideShorts: true,
  hideComments: true,
  hideYourFeature: true  // Add this line
};
```

### 3.2 Add Hiding Function

Add a new function to hide your feature. Use a unique class name for your feature:

```javascript
function hideYourFeature() {
  if (!settings.masterEnabled || !settings.hideYourFeature) return;

  // Add your selectors here
  document.querySelectorAll('your-selector-here').forEach((el) => {
    el.classList.add('ytfocus-yourfeature');
  });

  // Apply hiding to all elements with this class
  document.querySelectorAll('.ytfocus-yourfeature').forEach((el) => {
    el.style.display = 'none';
  });
}
```

**Important:** Use a unique class name following the pattern `ytfocus-[featurename]`. This ensures each feature can be independently toggled without affecting other features.

### 3.3 Update applyFilters Function

Add calls to your new function:

```javascript
function applyFilters() {
  if (settings.hideShorts && settings.masterEnabled) {
    hideShorts();
  }
  if (settings.hideComments && settings.masterEnabled) {
    hideComments();
  }
  if (settings.hideHomeFeed && settings.masterEnabled) {
    hideHomeFeed();
  }
  if (settings.hideYourFeature && settings.masterEnabled) {
    hideYourFeature();  // Add this line
  }
}
```

### 3.4 Update clearFilter and clearAllFilters

The extension now uses a class-based system where each feature has its own class. You need to add your feature's class to the `clearAllFilters()` function.

First, ensure your class name is added to `clearAllFilters()`:

```javascript
function clearAllFilters() {
  clearFilter('ytfocus-shorts');
  clearFilter('ytfocus-comments');
  clearFilter('ytfocus-homefeed');
  clearFilter('ytfocus-yourfeature');  // Add this line
}
```

The `clearFilter(className)` function automatically removes the class and resets the display style for that feature only.

### 3.5 Update chrome.storage.onChanged

Update the listener to handle your new setting using the class-based system:

```javascript
chrome.storage.onChanged.addListener((changes) => {
  for (let key in changes) {
    settings[key] = changes[key].newValue;
  }
  if (!settings.masterEnabled) {
    clearAllFilters();
  } else {
    if (!settings.hideYourFeature) clearFilter('ytfocus-yourfeature');
    applyFilters();
  }
});
```

**How it works:**
- If master is turned off → clear all filters
- If a specific feature is turned off → only clear that feature's class
- Always call `applyFilters()` to re-apply enabled features

### 3.6 Update MutationObserver

```javascript
const observer = new MutationObserver(() => {
  if (settings.masterEnabled) {
    if (settings.hideShorts) hideShorts();
    if (settings.hideComments) hideComments();
    if (settings.hideYourFeature) hideYourFeature();  // Add this line
  }
});
```

---

## Step 4: Find the Right Selectors

### Finding YouTube Selectors

1. **Inspect Element**: Right-click on YouTube → Inspect
2. **Look for patterns**: Most YouTube elements use custom elements like `ytd-*`, `tp-yt-*`
3. **Check for dynamic content**: YouTube loads content dynamically, so you may need to use MutationObserver

### Common Selector Patterns

| Element Type | Selector Example |
|--------------|------------------|
| Video items | `ytd-grid-video-renderer`, `ytd-rich-item-renderer` |
| Sections | `ytd-rich-section-renderer`, `ytd-shelf-renderer` |
| Sidebar | `ytd-guide-entry-renderer`, `ytd-mini-guide-entry-renderer` |
| Tabs | `tp-yt-iron-tab`, `yt-tab-shape` |
| Comments | `ytd-comments`, `#comments` |

### Detecting by Content

For elements without unique selectors, check by text content:

```javascript
document.querySelectorAll('yt-formatted-string').forEach((el) => {
  if (el.textContent && el.textContent.trim().toLowerCase() === 'your text') {
    // Hide the element
  }
});
```

---

## Step 5: Test Your Feature

1. Go to `chrome://extensions/`
2. Click the reload button on the YTFocus extension
3. Visit YouTube and test your new feature
4. Toggle the master switch to verify it respects the master toggle

---

## Troubleshooting

### Feature not working after page navigation
- YouTube is a Single Page Application (SPA)
- The MutationObserver should handle this automatically
- If not, add explicit URL change handling like in the existing code

### Element appears after toggle is enabled
- Make sure MutationObserver is observing `childList: true` and `subtree: true`
- Add additional setTimeout calls on URL change for slow-loading content
