(async () => {
  const preset_hosts = [
    {
      element: 'button[aria-label="Next"]',
      event: 'click()',
      hostname: 'www.linkedin.com',
      key: '>',
      path: '.*',
    },
    {
      element: 'button[aria-label="Previous"]',
      event: 'click()',
      hostname: 'www.linkedin.com',
      key: '<',
      path: '.*',
    },
  ];

  function bindDelete() {
    const tbody = document.querySelector('tbody');

    tbody.addEventListener('click', ev => {
      const el = ev.target;
      if (el.getAttribute('x-action') === 'delete') {
        el.closest('tr').remove();
        syncHosts();
      }
    });
  }

  function bindReset() {
    const el = document.querySelector('button[x-action="reset"]');
    el.addEventListener('click', ev => {
      if (false === confirm("Do you really want to delete all rules?")){
        return;
      }
      chrome.storage.sync.clear().then(() => {
        document.location.reload();
      });
    });
  }

  function bindLoadPreset() {
    const el = document.querySelector('button[x-action="load_preset"]');
    el.addEventListener('click', ev => {
      if (false === confirm("Do you really want to override with the preset?")){
        return;
      }
      chrome.storage.sync.set({hosts: preset_hosts}).then(() => {
        document.location.reload();
      });
    });
  }

  function bindSubmit() {
    const f = document.querySelector('form');

    f.addEventListener('submit', ev => {
      ev.preventDefault();

      const tr = generateTr({
        element: document.querySelector('input[name="element"]').value,
        event: document.querySelector('input[name="event"]').value,
        hostname: document.querySelector('input[name="hostname"]').value,
        key: document.querySelector('input[name="key"]').value,
        path: document.querySelector('input[name="path"]').value,
      });
      const tbody = document.querySelector('tbody');
      tbody.appendChild(tr);

      syncHosts();
    });
  }

  function generateTr(rule) {
    const tr = document.createElement('tr');
    tr.data = rule;

    const td_icon = document.createElement('td');
    td_icon.innerHTML = '<img src="drag_handle.png" />';
    tr.appendChild(td_icon);

    const td_hostname = document.createElement('td');
    td_hostname.innerText = rule.hostname;
    tr.appendChild(td_hostname);

    const td_path = document.createElement('td');
    td_path.innerText = rule.path;
    tr.appendChild(td_path);

    const td_key = document.createElement('td');
    td_key.innerText = rule.key;
    tr.appendChild(td_key);

    const td_element = document.createElement('td');
    td_element.innerText = rule.element;
    tr.appendChild(td_element);

    const td_event = document.createElement('td');
    td_event.innerText = rule.event;
    tr.appendChild(td_event);

    const td_actions = document.createElement('td');
    td_actions.innerHTML = '<button x-action="delete" class="btn btn-danger">Delete</button>';
    tr.appendChild(td_actions);

    return tr;
  }

  function render(hosts) {
    // Rendering
    const tbody = document.querySelector('tbody');
    hosts.forEach(host => {
      const tr = generateTr(host);
      tbody.appendChild(tr);
    });

    jQuery('tbody').sortable({
      handle: 'td:first-of-type',
      items: '> tr',
      update: syncHosts,
    });
  }

  function syncHosts() {
    const hosts = [];
    const trs = document.querySelectorAll('tbody > tr');
    trs.forEach(tr => {
      hosts.push(tr.data);
    });

    chrome.storage.sync.set({hosts: hosts}).then(() => {
      document.location.reload();
    });
  }

  const p = new Promise((resolve, reject) => {
    chrome.storage.sync.get({hosts: []}, item => {
      resolve(item.hosts);
    });
  });
  const hosts = await p;
  console.debug(hosts);

  bindDelete();
  bindLoadPreset();
  bindReset();
  bindSubmit();

  render(hosts);
})();
