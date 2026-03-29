(function() {
  const DEFAULT_SETTINGS = {
    masterEnabled: true,
    hideShorts: true,
    hideComments: true,
    hideHomeFeed: true,
    hideRecommendations: true
  };

  let settings = DEFAULT_SETTINGS;

  function loadSettings() {
    chrome.storage.local.get(DEFAULT_SETTINGS, (result) => {
      settings = result;
      applyFilters();
    });
  }

  function hideShorts() {
    if (!settings.masterEnabled || !settings.hideShorts) return;

    document.querySelectorAll('ytd-rich-item-renderer, ytd-grid-video-renderer').forEach((el) => {
      const link = el.querySelector('a[href*="/shorts/"]');
      if (link) {
        el.classList.add('ytfocus-shorts');
      }
    });

    document.querySelectorAll('ytd-rich-section-renderer').forEach((el) => {
      const link = el.querySelector('a[href*="/shorts/"]');
      const title = el.querySelector('#title');
      if (link || (title && title.textContent && title.textContent.includes('Shorts'))) {
        el.classList.add('ytfocus-shorts');
      }
    });

    document.querySelectorAll('ytd-shelf-renderer').forEach((el) => {
      const title = el.querySelector('#title, #title-text');
      if (title && title.textContent && title.textContent.includes('Shorts')) {
        el.classList.add('ytfocus-shorts');
      }
    });

    document.querySelectorAll('grid-shelf-view-model').forEach((el) => {
      const title = el.querySelector('.yt-shelf-header-layout__title');
      if (title && title.textContent && title.textContent.includes('Shorts')) {
        el.classList.add('ytfocus-shorts');
      }
    });

    document.querySelectorAll('ytm-shorts-lockup-view-model-v2').forEach((el) => {
      el.classList.add('ytfocus-shorts');
    });

    document.querySelectorAll('ytd-guide-entry-renderer, ytd-mini-guide-entry-renderer').forEach((el) => {
      const title = el.getAttribute('title');
      const link = el.querySelector('a[href*="/shorts"]');
      const icon = el.querySelector('yt-icon');
      if (title === 'Shorts' || (link && link.getAttribute('href').includes('/shorts'))) {
        el.classList.add('ytfocus-shorts');
      }
    });

    document.querySelectorAll('a[title="Shorts"]').forEach((el) => {
      el.closest('ytd-guide-entry-renderer, ytd-mini-guide-entry-renderer').classList.add('ytfocus-shorts');
    });

    document.querySelectorAll('yt-formatted-string').forEach((el) => {
      if (el.textContent && el.textContent.trim().toLowerCase() === 'shorts') {
        const parent = el.closest('ytd-guide-entry-renderer, ytd-mini-guide-entry-renderer, ytd-guide-section-renderer');
        if (parent) parent.classList.add('ytfocus-shorts');
      }
    });

    document.querySelectorAll('ytd-watch-next-secondary-results-renderer, ytd-compact-video-renderer').forEach((el) => {
      const link = el.querySelector('a[href*="/shorts/"]');
      if (link) {
        el.classList.add('ytfocus-shorts');
      }
    });

    document.querySelectorAll('tp-yt-iron-tab, yt-tab-shape').forEach((el) => {
      const text = el.textContent || el.innerText;
      if (text && text.trim().toLowerCase() === 'shorts') {
        el.classList.add('ytfocus-shorts');
      }
    });

    document.querySelectorAll('.ytfocus-shorts').forEach((el) => {
      el.style.display = 'none';
    });
  }

  function hideComments() {
    if (!settings.masterEnabled || !settings.hideComments) return;

    document.querySelectorAll('ytd-comments, #comments').forEach((el) => {
      el.classList.add('ytfocus-comments');
    });

    document.querySelectorAll('.ytfocus-comments').forEach((el) => {
      el.style.display = 'none';
    });
  }

  function hideHomeFeed() {
    if (!settings.masterEnabled || !settings.hideHomeFeed) return;

    if (window.location.pathname === '/' || window.location.pathname === '/feed/home') {
      const homeFeed = document.querySelector('ytd-browse[page-subtype="home"]');
      if (homeFeed) {
        homeFeed.classList.add('ytfocus-homefeed');
      }
    }

    document.querySelectorAll('.ytfocus-homefeed').forEach((el) => {
      el.style.display = 'none';
    });
  }

  function hideRecommendations() {
    if (!settings.masterEnabled || !settings.hideRecommendations) return;

    if (window.location.pathname === '/watch') {
      document.querySelectorAll('#secondary, ytd-watch-next-secondary-results-renderer').forEach((el) => {
        el.classList.add('ytfocus-recommendations');
      });
    }

    document.querySelectorAll('.ytfocus-recommendations').forEach((el) => {
      el.style.display = 'none';
    });
  }

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
    clearFilter('ytfocus-homefeed');
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
      if (!settings.hideHomeFeed) clearFilter('ytfocus-homefeed');
      if (!settings.hideRecommendations) clearFilter('ytfocus-recommendations');
      applyFilters();
    }
  });

  const observer = new MutationObserver(() => {
    if (settings.masterEnabled) {
      if (settings.hideShorts) hideShorts();
      if (settings.hideComments) hideComments();
      if (settings.hideHomeFeed) hideHomeFeed();
      if (settings.hideRecommendations) hideRecommendations();
    }
  });

  observer.observe(document.body || document.documentElement, {
    childList: true,
    subtree: true
  });

  let lastUrl = location.href;
  new MutationObserver(() => {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      setTimeout(applyFilters, 1000);
      setTimeout(applyFilters, 3000);
    }
  }).observe(document.body || document.documentElement, { childList: true, subtree: true });
})();
