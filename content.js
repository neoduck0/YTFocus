(function() {
  const DEFAULT_SETTINGS = {
    masterEnabled: true,
    hideShorts: true,
    hideComments: true,
    hideRecommendations: true
  };

  const STYLE_ID = 'ytfocus-filter-styles';

  let settings = DEFAULT_SETTINGS;
  let filterScheduled = false;

  function ensureHideStyles() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = [
      '.ytfocus-shorts { display: none !important; }',
      '.ytfocus-comments { display: none !important; }',
      '.ytfocus-recommendations { display: none !important; }'
    ].join('\n');
    (document.head || document.documentElement).appendChild(style);
  }

  function scheduleApplyFilters(delay = 0) {
    if (delay > 0) {
      window.setTimeout(() => {
        scheduleApplyFilters();
      }, delay);
      return;
    }

    if (filterScheduled) return;
    filterScheduled = true;

    window.requestAnimationFrame(() => {
      filterScheduled = false;
      if (!settings.masterEnabled) return;
      applyFilters();
    });
  }

  function loadSettings() {
    chrome.storage.local.get(DEFAULT_SETTINGS, (result) => {
      settings = result;
      ensureHideStyles();
      applyFilters();
    });
  }

  function hideShorts() {
    if (!settings.masterEnabled || !settings.hideShorts) return;

    document.querySelectorAll('ytd-video-renderer:not(.ytfocus-shorts)').forEach((el) => {
      const link = el.querySelector('a[href*="/shorts/"]');
      const overlay = el.querySelector('ytd-thumbnail-overlay-time-status-renderer[overlay-style="SHORTS"]');
      if (link || overlay) {
        el.classList.add('ytfocus-shorts');
      }
    });

    document.querySelectorAll('ytd-rich-item-renderer:not(.ytfocus-shorts), ytd-grid-video-renderer:not(.ytfocus-shorts)').forEach((el) => {
      const link = el.querySelector('a[href*="/shorts/"]');
      if (link) {
        el.classList.add('ytfocus-shorts');
      }
    });

    document.querySelectorAll('ytd-rich-section-renderer:not(.ytfocus-shorts)').forEach((el) => {
      const link = el.querySelector('a[href*="/shorts/"]');
      const title = el.querySelector('#title');
      if (link || title?.textContent?.includes('Shorts')) {
        el.classList.add('ytfocus-shorts');
      }
    });

    document.querySelectorAll('ytd-shelf-renderer:not(.ytfocus-shorts)').forEach((el) => {
      const title = el.querySelector('#title, #title-text');
      if (title?.textContent?.includes('Shorts')) {
        el.classList.add('ytfocus-shorts');
      }
    });

    document.querySelectorAll('grid-shelf-view-model:not(.ytfocus-shorts)').forEach((el) => {
      const title = el.querySelector('.yt-shelf-header-layout__title');
      if (title?.textContent?.includes('Shorts')) {
        el.classList.add('ytfocus-shorts');
      }
    });

    document.querySelectorAll('ytm-shorts-lockup-view-model-v2:not(.ytfocus-shorts)').forEach((el) => {
      el.classList.add('ytfocus-shorts');
    });

    document.querySelectorAll('ytd-guide-entry-renderer:not(.ytfocus-shorts), ytd-mini-guide-entry-renderer:not(.ytfocus-shorts)').forEach((el) => {
      const title = el.getAttribute('title');
      const link = el.querySelector('a[href*="/shorts"]');
      if (title === 'Shorts' || (link && link.getAttribute('href').includes('/shorts'))) {
        el.classList.add('ytfocus-shorts');
      }
    });

    document.querySelectorAll('a[title="Shorts"]').forEach((el) => {
      const parent = el.closest('ytd-guide-entry-renderer, ytd-mini-guide-entry-renderer');
      if (parent) parent.classList.add('ytfocus-shorts');
    });

    document.querySelectorAll('yt-formatted-string').forEach((el) => {
      if (el.textContent && el.textContent.trim().toLowerCase() === 'shorts') {
        const parent = el.closest('ytd-guide-entry-renderer, ytd-mini-guide-entry-renderer, ytd-guide-section-renderer');
        if (parent) parent.classList.add('ytfocus-shorts');
      }
    });

    document.querySelectorAll('ytd-watch-next-secondary-results-renderer:not(.ytfocus-shorts), ytd-compact-video-renderer:not(.ytfocus-shorts)').forEach((el) => {
      const link = el.querySelector('a[href*="/shorts/"]');
      if (link) {
        el.classList.add('ytfocus-shorts');
      }
    });

    document.querySelectorAll('tp-yt-iron-tab:not(.ytfocus-shorts), yt-tab-shape:not(.ytfocus-shorts)').forEach((el) => {
      const text = el.textContent || el.innerText;
      if (text && text.trim().toLowerCase() === 'shorts') {
        el.classList.add('ytfocus-shorts');
      }
    });
  }

  function hideComments() {
    if (!settings.masterEnabled || !settings.hideComments) return;

    document.querySelectorAll('ytd-comments:not(.ytfocus-comments), #comments:not(.ytfocus-comments)').forEach((el) => {
      el.classList.add('ytfocus-comments');
    });
  }

  function hideRecommendations() {
    if (!settings.masterEnabled || !settings.hideRecommendations) return;

    if (window.location.pathname === '/' || window.location.pathname === '/feed/home') {
      const homeFeed = document.querySelector('ytd-browse[page-subtype="home"]');
      if (homeFeed) {
        homeFeed.classList.add('ytfocus-recommendations');
      }
    }

    if (window.location.pathname === '/watch') {
      document.querySelectorAll('#secondary:not(.ytfocus-recommendations), ytd-watch-next-secondary-results-renderer:not(.ytfocus-recommendations)').forEach((el) => {
        el.classList.add('ytfocus-recommendations');
      });
    }
  }

  function applyFilters() {
    ensureHideStyles();

    if (settings.hideShorts && settings.masterEnabled) {
      hideShorts();
    }
    if (settings.hideComments && settings.masterEnabled) {
      hideComments();
    }
    if (settings.hideRecommendations && settings.masterEnabled) {
      hideRecommendations();
    }
  }

  function clearFilter(className) {
    document.querySelectorAll('.' + className).forEach((el) => {
      el.classList.remove(className);
      el.style.display = '';
    });
  }

  function clearAllFilters() {
    clearFilter('ytfocus-shorts');
    clearFilter('ytfocus-comments');
    clearFilter('ytfocus-recommendations');
  }

  loadSettings();

  chrome.storage.onChanged.addListener((changes) => {
    for (let key in changes) {
      settings[key] = changes[key].newValue;
    }

    if (!settings.masterEnabled) {
      clearAllFilters();
    } else {
      if (!settings.hideShorts) clearFilter('ytfocus-shorts');
      if (!settings.hideComments) clearFilter('ytfocus-comments');
      if (!settings.hideRecommendations) clearFilter('ytfocus-recommendations');
      scheduleApplyFilters();
    }
  });

  const observer = new MutationObserver(() => {
    scheduleApplyFilters();
  });

  observer.observe(document.body || document.documentElement, {
    childList: true,
    subtree: true
  });

  let lastUrl = location.href;
  new MutationObserver(() => {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      scheduleApplyFilters();
      scheduleApplyFilters(1000);
      scheduleApplyFilters(3000);
    }
  }).observe(document.body || document.documentElement, { childList: true, subtree: true });
})();
