# YTFocus Development Guide

Chrome Extension (Manifest V3) hiding YouTube Shorts, comments, feed, recommendations. Vanilla JS.

## Structure
```
manifest.json   # MV3 config
popup.html/js  # Settings UI
content.js     # Injected into YouTube
styles.css     # Dark theme
```

## Commands

### Dev: Load unpacked at chrome://extensions → Developer mode → Load unpacked
### Reload: chrome://extensions → reload YTFocus → refresh YouTube
### Package: `npm i -g crx && crx pack . -p private_key.pem -o extension.crx`
### Release: `git tag v1.x.x && git push origin v1.x.x` (triggers CI)
### Lint: `npm i eslint && npx eslint .` (not configured)

## Code Style

**Formatting**: 2 spaces, no semicolons, single quotes, LF endings

| Type | Convention | Example |
|------|------------|---------|
| Vars/functions | camelCase | `hideShorts` |
| CSS classes | `ytfocus-*` | `ytfocus-shorts` |
| Constants | UPPER_SNAKE | `DEFAULT_SETTINGS` |
| DOM IDs | camelCase | `masterToggle` |

## Patterns

### popup.js
```javascript
const DEFAULT_SETTINGS = { masterEnabled: true, hideShorts: true, hideComments: true, hideHomeFeed: true, hideRecommendations: true };

document.addEventListener('DOMContentLoaded', () => {
  const el = document.getElementById('id');
  chrome.storage.local.get(DEFAULT_SETTINGS, (s) => { el.checked = s.key; });
  el.addEventListener('change', () => { chrome.storage.local.set({ key: el.checked }); });
});
```

### content.js (always IIFE)
```javascript
(function() {
  const DEFAULT_SETTINGS = { /* same as popup.js */ };
  let settings = DEFAULT_SETTINGS;

  function hideShorts() {
    if (!settings.masterEnabled || !settings.hideShorts) return;
    document.querySelectorAll('selector').forEach((el) => el.classList.add('ytfocus-shorts'));
    document.querySelectorAll('.ytfocus-shorts').forEach((el) => el.style.display = 'none');
  }

  loadSettings();
  chrome.storage.onChanged.addListener(/* ... */);
  new MutationObserver(/* ... */);
})();
```

### Adding Features
1. popup.html: add toggle with unique ID
2. popup.js: add to DEFAULT_SETTINGS, init state, listener, update `updateToggleStates()`
3. content.js: add to DEFAULT_SETTINGS, create hide function, update apply/clear filters, storage listener, MutationObserver

See ADDING_FEATURES.md for full steps.

## YouTube Selectors

| Element | Selector |
|---------|----------|
| Video grid | `ytd-grid-video-renderer` |
| Rich item | `ytd-rich-item-renderer` |
| Shelf/section | `ytd-shelf-renderer` |
| Guide entry | `ytd-guide-entry-renderer` |
| Comments | `ytd-comments, #comments` |
| Sidebar | `#secondary` |

## Error Handling

**ALWAYS null-check `.closest()`:**
```javascript
// BAD
el.closest('selector').classList.add('ytfocus-shorts');

// GOOD
const parent = el.closest('selector');
if (parent) parent.classList.add('ytfocus-shorts');
```

Use optional chaining: `title?.textContent?.includes('Shorts')`

## Reactivity (keep in sync)
1. `chrome.storage.onChanged` - popup settings changes
2. `MutationObserver` (DOM) - dynamic content
3. `MutationObserver` (URL) - SPA navigation

## Storage Flow
```
popup.js                    content.js
    │                            │
    ├── chrome.storage.local.set┤
    │                            │
    │                     chrome.storage.local.get
    │                            │
    └────────────────────────────┘
```

## Settings Keys
- `masterEnabled` (bool) - master toggle
- `hideShorts` (bool) - hide Shorts
- `hideComments` (bool) - hide comments
- `hideHomeFeed` (bool) - hide home feed
- `hideRecommendations` (bool) - hide sidebar recommendations

## Testing Checklist
1. Load unpacked, toggle master, toggle each feature
2. Navigate: Home → Watch → Channel → Shorts
3. Check sidebar, verify icon changes
4. Test on fresh profile

## Known Issues

**content.js:54** - Missing null check on `.closest()` - will throw if null. Fix: add null check before calling `.classList.add()`

**Performance** - Two MutationObservers watching same target; could combine

## Release Process
1. Bump version in manifest.json
2. Create git tag: `git tag v1.x.x`
3. Push: `git push origin v1.x.x`
4. CI packages .crx and creates GitHub release

## CSS Guidelines

- Use dark theme: background `#1a1a1a`, text `#fff`, accent `#f00`
- Switch toggle: 40x22px, 3px border-radius, 16px knob
- Container width: 288px, padding: 16px
- Disabled state: opacity 0.5, cursor not-allowed

## Common Gotchas

1. YouTube changes selectors frequently - test on multiple pages
2. SPA navigation: MutationObserver catches most, but some delays needed
3. Duplicate DEFAULT_SETTINGS - always update both files together
4. Class-based hiding - don't mix with inline style manipulation

## Dependencies
None. Only: `chrome.storage.local`, `chrome.action.setIcon`, `chrome.storage.onChanged`
