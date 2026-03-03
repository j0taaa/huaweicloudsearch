(function () {
  if (window.__huaweiQuickSearchLoaded) {
    return;
  }
  window.__huaweiQuickSearchLoaded = true;

  const services = window.HUAWEI_CLOUD_SERVICES || [];
  const regions = [
    { id: "af-south-1", name: "Johannesburg", keywords: ["south africa"] },
    { id: "ap-southeast-1", name: "Hong Kong", keywords: ["hk"] },
    { id: "ap-southeast-2", name: "Bangkok", keywords: ["thailand"] },
    { id: "ap-southeast-3", name: "Singapore", keywords: ["sg"] },
    { id: "cn-east-2", name: "Shanghai", keywords: ["china east"] },
    { id: "cn-east-3", name: "Shanghai 2", keywords: ["china east 2"] },
    { id: "cn-north-1", name: "Beijing", keywords: ["china north"] },
    { id: "cn-north-4", name: "Beijing 4", keywords: ["china north 4"] },
    { id: "eu-west-0", name: "Paris", keywords: ["france"] },
    { id: "la-south-2", name: "Santiago", keywords: ["chile"] },
    { id: "na-mexico-1", name: "Mexico City", keywords: ["mexico"] },
    { id: "sa-brazil-1", name: "Sao Paulo", keywords: ["brazil", "são paulo"] },
    { id: "sa-chile-1", name: "Santiago", keywords: ["chile"] },
    { id: "tr-west-1", name: "Istanbul", keywords: ["turkey"] }
  ];
  const maxResults = 8;
  const usageStorageKey = "hwQuickSearchUsage";
  const recentStorageKey = "hwQuickSearchRecent";

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
  const modal = overlay.querySelector(".hw-quicksearch-modal");

  let isOpen = false;
  let selectedIndex = 0;
  let filtered = [];
  const currentRegionContext = getCurrentRegionContext();

  function readJsonStorage(key, fallbackValue) {
    try {
      const rawValue = window.localStorage.getItem(key);
      if (!rawValue) return fallbackValue;
      const parsedValue = JSON.parse(rawValue);
      return parsedValue && typeof parsedValue === "object" ? parsedValue : fallbackValue;
    } catch (error) {
      return fallbackValue;
    }
  }

  function writeJsonStorage(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      // ignore storage write failures
    }
  }

  function getItemKey(item) {
    if (item.type === "region") {
      return `region:${item.region.id}`;
    }

    return `service:${item.service.shortName}`;
  }

  function getUsageMap() {
    return readJsonStorage(usageStorageKey, {});
  }

  function getRecentKeys() {
    const recentKeys = readJsonStorage(recentStorageKey, []);
    return Array.isArray(recentKeys) ? recentKeys : [];
  }

  function getUsageCount(item, usageMap = getUsageMap()) {
    return Number(usageMap[getItemKey(item)] || 0);
  }

  function trackItemUsage(item) {
    const itemKey = getItemKey(item);
    const usageMap = getUsageMap();
    usageMap[itemKey] = (usageMap[itemKey] || 0) + 1;
    writeJsonStorage(usageStorageKey, usageMap);

    const recentKeys = getRecentKeys().filter((key) => key !== itemKey);
    recentKeys.unshift(itemKey);
    writeJsonStorage(recentStorageKey, recentKeys.slice(0, maxResults));
  }

  function resolveItemFromKey(itemKey) {
    if (itemKey.startsWith("service:")) {
      const serviceShortName = itemKey.replace("service:", "");
      const service = services.find((entry) => entry.shortName === serviceShortName);
      return service ? { type: "service", score: 0, service } : null;
    }

    if (itemKey.startsWith("region:")) {
      if (!currentRegionContext.canSwitchRegion) return null;
      const regionId = itemKey.replace("region:", "");
      if (regionId === currentRegionContext.currentRegionId) return null;
      const region = regions.find((entry) => entry.id === regionId);
      if (!region) return null;
      const url = buildRegionSwitchUrl(region.id);
      return url ? { type: "region", score: 0, region, url } : null;
    }

    return null;
  }

  function getRecentItems() {
    return getRecentKeys().map(resolveItemFromKey).filter(Boolean).slice(0, maxResults);
  }

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

  function scoreRegion(region, query) {
    if (!query) return 0;

    const id = tokenize(region.id);
    const name = tokenize(region.name);
    const keywords = (region.keywords || []).map(tokenize).join(" ");

    let score = 0;
    if (name === query) score += 140;
    if (id === query) score += 130;
    if (name.startsWith(query)) score += 110;
    if (id.startsWith(query)) score += 90;
    if (name.includes(query)) score += 80;
    if (id.includes(query)) score += 70;
    if (keywords.includes(query)) score += 60;

    return score;
  }

  function getCurrentRegionContext() {
    const href = window.location.href;
    const knownRegion = regions.find((region) => href.includes(region.id));

    if (knownRegion) {
      return { currentRegionId: knownRegion.id, canSwitchRegion: true };
    }

    const genericRegionMatch = href.match(/[a-z]{2}-[a-z]+(?:-[a-z]+)?-\d+/i);
    if (genericRegionMatch) {
      return { currentRegionId: genericRegionMatch[0].toLowerCase(), canSwitchRegion: true };
    }

    return { currentRegionId: null, canSwitchRegion: false };
  }

  function buildRegionSwitchUrl(targetRegionId) {
    const { currentRegionId, canSwitchRegion } = currentRegionContext;
    if (!canSwitchRegion || !currentRegionId) return null;

    const currentUrl = window.location.href;
    return currentUrl.split(currentRegionId).join(targetRegionId);
  }

  function buildServiceUrl(serviceUrl) {
    const { currentRegionId, canSwitchRegion } = currentRegionContext;
    if (!canSwitchRegion || !currentRegionId) {
      return serviceUrl;
    }

    let parsedUrl;
    try {
      parsedUrl = new URL(serviceUrl);
    } catch (error) {
      return serviceUrl;
    }

    if (parsedUrl.hostname === "console.huaweicloud.com") {
      parsedUrl.hostname = `${currentRegionId}-console.huaweicloud.com`;
    } else if (/^[a-z0-9-]+-console\.huaweicloud\.com$/i.test(parsedUrl.hostname)) {
      parsedUrl.hostname = `${currentRegionId}-console.huaweicloud.com`;
    }

    parsedUrl.searchParams.set("region", currentRegionId);
    return parsedUrl.toString();
  }

  function findMatches(query) {
    const usageMap = getUsageMap();
    const serviceMatches = services
      .map((service) => ({ service, score: scoreService(service, query) }))
      .filter((entry) => entry.score > 0)
      .map((entry) => ({ type: "service", score: entry.score, service: entry.service }));

    const regionMatches = currentRegionContext.canSwitchRegion
      ? regions
          .filter((region) => region.id !== currentRegionContext.currentRegionId)
          .map((region) => {
            const score = scoreRegion(region, query);
            return {
              type: "region",
              score,
              region,
              url: buildRegionSwitchUrl(region.id)
            };
          })
          .filter((entry) => entry.score > 0 && entry.url)
      : [];

    return [...serviceMatches, ...regionMatches]
      .sort(
        (a, b) =>
          b.score - a.score ||
          getUsageCount(b, usageMap) - getUsageCount(a, usageMap) ||
          getItemLabel(a).localeCompare(getItemLabel(b))
      )
      .slice(0, maxResults);
  }

  function getItemLabel(item) {
    if (item.type === "region") {
      return `${item.region.name} ${item.region.id}`;
    }

    return item.service.name;
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

    filtered.forEach((itemEntry, index) => {
      const item = document.createElement("li");
      item.className = "hw-quicksearch-item";
      if (index === selectedIndex) {
        item.classList.add("selected");
      }
      item.setAttribute("role", "option");
      item.dataset.index = String(index);
      if (itemEntry.type === "region") {
        item.innerHTML = `
          <div class="hw-quicksearch-main">
            <span class="hw-quicksearch-icon-wrap">
              <span class="hw-quicksearch-icon-fallback">🌎</span>
            </span>
            <span class="hw-quicksearch-name">Switch region to ${itemEntry.region.name}</span>
            <span class="hw-quicksearch-shortname">${itemEntry.region.id}</span>
          </div>
          <span class="hw-quicksearch-arrow">↵</span>
        `;
      } else {
        const service = itemEntry.service;
        item.innerHTML = `
          <div class="hw-quicksearch-main">
            <span class="hw-quicksearch-icon-wrap">
              ${service.iconUrl ? `<img class="hw-quicksearch-service-icon" src="${service.iconUrl}" alt="${service.shortName} icon" loading="lazy" referrerpolicy="no-referrer" onerror="this.remove()" />` : ""}
              <span class="hw-quicksearch-icon-fallback">${service.shortName.slice(0, 1)}</span>
            </span>
            <span class="hw-quicksearch-name">${service.name}</span>
            <span class="hw-quicksearch-shortname">${service.shortName}</span>
          </div>
          <span class="hw-quicksearch-arrow">↵</span>
        `;
      }
      item.addEventListener("mouseenter", () => {
        selectedIndex = index;
        renderList();
      });
      item.addEventListener("mousedown", (event) => {
        event.preventDefault();
      });
      item.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        openItem(itemEntry);
      });
      list.appendChild(item);
    });
  }

  function openItem(itemEntry) {
    trackItemUsage(itemEntry);
    closePalette();
    if (itemEntry.type === "region") {
      window.location.href = itemEntry.url;
      return;
    }

    window.location.href = buildServiceUrl(itemEntry.service.url);
  }

  function openPalette() {
    isOpen = true;
    overlay.classList.add("open");
    input.value = "";
    selectedIndex = 0;
    filtered = getRecentItems();
    if (!filtered.length) {
      filtered = findMatches("");
    }
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
    filtered = query ? findMatches(query) : getRecentItems();
    if (!query && !filtered.length) {
      filtered = findMatches("");
    }
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
      openItem(filtered[selectedIndex]);
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

  modal.addEventListener("click", (event) => {
    event.stopPropagation();
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
