'use strict';

(async () => {
  const p = new Promise((resolve, reject) => {
    chrome.storage.sync.get({hosts: []}, item => {
      resolve(item.hosts);
    });
  });
  const hosts = await p;
  console.debug('keyboard-event: hosts = ', hosts);

  // Filter out the actually effective rules.
  const hostname = document.location.hostname;
  const rules = [];
  hosts.forEach(item => {
    if (item.hostname === hostname) {
      rules.push(item);
    }
  });

  if (rules.length === 0) {
    return;
  }
  console.debug('keyboard-event: rules = ', rules);

  document.addEventListener('keyup', ev => {
    // Ignore input & textarea.
    const ae = document.activeElement.tagName.toLowerCase();
    if ('input' === ae || 'textarea' === ae) {
      return;
    }

    const k = ev.key;
    rules.forEach(rule => {
      // XXX performance
      if (!document.location.pathname.match(rule.path)) {
        return;
      }

      if (k === rule.key) {
        console.log(`keyboard-event: detected defined key "${k}"`);

        const el = document.querySelector(rule.element);

        if ('click()' === rule.event) {
          el?.click();
        } else {
          const ev = new Event(rule.event);
          el?.dispatchEvent(ev);
        }
      }
    });
  }, {
    capture: true,
  });
})();
