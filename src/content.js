(function () {
  if (window.__huaweiQuickSearchLoaded) {
    return;
  }
  window.__huaweiQuickSearchLoaded = true;

  const services = window.HUAWEI_CLOUD_SERVICES || [];
  const maxResults = 8;

  const overlay = document.createElement("div");
  overlay.className = "hw-quicksearch-overlay";
  overlay.innerHTML = `
    <div class="hw-quicksearch-modal" role="dialog" aria-label="Huawei Cloud service search">
      <div class="hw-quicksearch-search-row">
        <span class="hw-quicksearch-search-icon">⌕</span>
        <input type="text" class="hw-quicksearch-input" placeholder="Search Huawei Cloud services..." aria-label="Search Huawei Cloud services" />
      </div>
      <ul class="hw-quicksearch-list" role="listbox"></ul>
      <div class="hw-quicksearch-footer">Use ↑ ↓ to navigate • Enter to open • Esc to close</div>
    </div>
  `;

  document.documentElement.appendChild(overlay);

  const input = overlay.querySelector(".hw-quicksearch-input");
  const list = overlay.querySelector(".hw-quicksearch-list");

  let isOpen = false;
  let selectedIndex = 0;
  let filtered = [...services];

  function tokenize(text) {
    return (text || "").toLowerCase().trim();
  }

  function scoreService(service, query) {
    if (!query) return 1;

    const name = tokenize(service.name);
    const shortName = tokenize(service.shortName);
    const keywords = (service.keywords || []).map(tokenize).join(" ");

    let score = 0;
    if (shortName === query) score += 120;
    if (name === query) score += 100;
    if (shortName.startsWith(query)) score += 90;
    if (name.startsWith(query)) score += 75;
    if (name.includes(query)) score += 50;
    if (shortName.includes(query)) score += 40;
    if (keywords.includes(query)) score += 20;

    return score;
  }

  function findMatches(query) {
    return services
      .map((service) => ({ service, score: scoreService(service, query) }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score || a.service.name.localeCompare(b.service.name))
      .slice(0, maxResults)
      .map((entry) => entry.service);
  }

  function renderList() {
    list.innerHTML = "";

    if (!filtered.length) {
      const empty = document.createElement("li");
      empty.className = "hw-quicksearch-item hw-quicksearch-empty";
      empty.textContent = "No matching services";
      list.appendChild(empty);
      return;
    }

    filtered.forEach((service, index) => {
      const item = document.createElement("li");
      item.className = "hw-quicksearch-item";
      if (index === selectedIndex) {
        item.classList.add("selected");
      }
      item.setAttribute("role", "option");
      item.dataset.index = String(index);
      item.innerHTML = `
        <div class="hw-quicksearch-main">
          <span class="hw-quicksearch-name">${service.name}</span>
          <span class="hw-quicksearch-shortname">${service.shortName}</span>
        </div>
        <span class="hw-quicksearch-arrow">↵</span>
      `;
      item.addEventListener("mouseenter", () => {
        selectedIndex = index;
        renderList();
      });
      item.addEventListener("click", () => openService(service));
      list.appendChild(item);
    });
  }

  function openService(service) {
    closePalette();
    window.location.href = service.url;
  }

  function openPalette() {
    isOpen = true;
    overlay.classList.add("open");
    input.value = "";
    selectedIndex = 0;
    filtered = [...services].slice(0, maxResults);
    renderList();
    setTimeout(() => input.focus(), 0);
  }

  function closePalette() {
    isOpen = false;
    overlay.classList.remove("open");
    input.blur();
  }

  input.addEventListener("input", (event) => {
    const query = tokenize(event.target.value);
    filtered = findMatches(query);
    selectedIndex = 0;
    renderList();
  });

  input.addEventListener("keydown", (event) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (!filtered.length) return;
      selectedIndex = (selectedIndex + 1) % filtered.length;
      renderList();
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (!filtered.length) return;
      selectedIndex = (selectedIndex - 1 + filtered.length) % filtered.length;
      renderList();
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      if (!filtered.length) return;
      openService(filtered[selectedIndex]);
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      closePalette();
    }
  });

  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) {
      closePalette();
    }
  });

  document.addEventListener("keydown", (event) => {
    const isCtrlK = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k";

    if (isCtrlK) {
      event.preventDefault();
      if (isOpen) {
        closePalette();
      } else {
        openPalette();
      }
      return;
    }

    if (isOpen && event.key === "Escape") {
      event.preventDefault();
      closePalette();
    }
  });
})();
