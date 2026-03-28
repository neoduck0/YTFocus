const DEFAULT_SETTINGS = {
  masterEnabled: true,
  hideShorts: true,
  hideComments: true,
  hideHomeFeed: true,
  hideRecommendations: true
};

document.addEventListener('DOMContentLoaded', () => {
  const masterToggle = document.getElementById('masterToggle');
  const hideShorts = document.getElementById('hideShorts');
  const hideComments = document.getElementById('hideComments');
  const hideHomeFeed = document.getElementById('hideHomeFeed');
  const hideRecommendations = document.getElementById('hideRecommendations');

  chrome.storage.local.get(DEFAULT_SETTINGS, (settings) => {
    masterToggle.checked = settings.masterEnabled;
    hideShorts.checked = settings.hideShorts;
    hideComments.checked = settings.hideComments;
    hideHomeFeed.checked = settings.hideHomeFeed;
    hideRecommendations.checked = settings.hideRecommendations;
    updateToggleStates();
    updateIcon(settings.masterEnabled);
  });

  masterToggle.addEventListener('change', () => {
    chrome.storage.local.set({ masterEnabled: masterToggle.checked });
    updateToggleStates();
    updateIcon(masterToggle.checked);
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

  hideRecommendations.addEventListener('change', () => {
    chrome.storage.local.set({ hideRecommendations: hideRecommendations.checked });
  });

  function updateToggleStates() {
    hideShorts.disabled = !masterToggle.checked;
    hideComments.disabled = !masterToggle.checked;
    hideHomeFeed.disabled = !masterToggle.checked;
    hideRecommendations.disabled = !masterToggle.checked;
  }

  function updateIcon(enabled) {
    const prefix = enabled ? 'icon' : 'icon-grey';
    chrome.action.setIcon({
      path: {
        '16': `${prefix}-16.png`,
        '32': `${prefix}-32.png`,
        '48': `${prefix}-48.png`,
        '128': `${prefix}-128.png`
      }
    });
  }
});
