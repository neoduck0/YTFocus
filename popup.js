const DEFAULT_SETTINGS = {
  masterEnabled: true,
  hideShorts: true,
  hideComments: true,
  hideHomeFeed: true
};

document.addEventListener('DOMContentLoaded', () => {
  const masterToggle = document.getElementById('masterToggle');
  const hideShorts = document.getElementById('hideShorts');
  const hideComments = document.getElementById('hideComments');
  const hideHomeFeed = document.getElementById('hideHomeFeed');

  chrome.storage.local.get(DEFAULT_SETTINGS, (settings) => {
    masterToggle.checked = settings.masterEnabled;
    hideShorts.checked = settings.hideShorts;
    hideComments.checked = settings.hideComments;
    hideHomeFeed.checked = settings.hideHomeFeed;
    updateToggleStates();
  });

  masterToggle.addEventListener('change', () => {
    chrome.storage.local.set({ masterEnabled: masterToggle.checked });
    updateToggleStates();
  });

  hideShorts.addEventListener('change', () => {
    chrome.storage.local.set({ hideShorts: hideShorts.checked });
  });

  hideComments.addEventListener('change', () => {
    chrome.storage.local.set({ hideComments: hideComments.checked });
  });

  hideHomeFeed.addEventListener('change', () => {
    chrome.storage.local.set({ hideHomeFeed: hideHomeFeed.checked });
  });

  function updateToggleStates() {
    hideShorts.disabled = !masterToggle.checked;
    hideComments.disabled = !masterToggle.checked;
    hideHomeFeed.disabled = !masterToggle.checked;
  }
});
