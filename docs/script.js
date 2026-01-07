/* -------------------------
   DataUtility Docs Interactions
-------------------------- */
(function () {
  const $ = (id) => document.getElementById(id);

  const menuToggle = $("menuToggle");
  const sidebar = $("sidebar");
  const overlay = $("overlay");
  const closeSidebar = $("closeSidebar");

  const searchInput = $("searchInput");
  const clearSearch = $("clearSearch");
  const clearSearchBtn = $("clearSearchBtn");
  const searchMeta = $("searchMeta");

  const navMenu = $("navMenu");
  const tagsContainer = $("tagsContainer");
  const sectionsContainer = $("sectionsContainer");

  const expandBtn = $("expandBtn");
  const collapseBtn = $("collapseBtn");
  const themeBtn = $("themeBtn");

  const fab = $("fab");
  const toast = $("toast");
  const readingProgress = $("readingProgress");
  const emptyState = $("emptyState");
  const emptyStateText = $("emptyStateText");

  const copyCmdBtn = $("copyCmdBtn");

  // ---------------------------
  // Demo data (REMOVE if you already generate your docs from your library)
  // ---------------------------
  const DEMO_SECTIONS = [
    {
      id: "missing-values",
      title: "Missing Values",
      subtitle: "Count, drop, fill, and audit missing data safely",
      tag: "Cleaning",
      methods: [
        { name: "missingRows()", desc: "Return rows that contain at least one missing value." },
        { name: "missingColumns()", desc: "Return columns that contain at least one missing value." },
        { name: "fillMissingValues(strategy='mean')", desc: "Fill missing values using mean/median/mode or custom value." },
      ],
    },
    {
      id: "duplicates",
      title: "Duplicates",
      subtitle: "Detect and remove duplicates with control",
      tag: "Cleaning",
      methods: [
        { name: "duplicateRows()", desc: "Return duplicated rows (keep='first'/'last'/False)." },
        { name: "dropDuplicates()", desc: "Drop duplicates with subset columns support." },
      ],
    },
    {
      id: "outliers",
      title: "Outliers",
      subtitle: "IQR / z-score detection + safe reporting",
      tag: "EDA",
      methods: [
        { name: "detectOutliersIQR(k=1.5)", desc: "Return rows containing outliers by IQR threshold." },
        { name: "outlierSummary()", desc: "Summary table of outlier counts per numeric column." },
      ],
    },
    {
      id: "encoding",
      title: "Encoding",
      subtitle: "Categorical encoding helpers",
      tag: "Features",
      methods: [
        { name: "oneHotEncode(cols)", desc: "One-hot encode selected columns safely." },
        { name: "labelEncode(col)", desc: "Label encode a single column with mapping output." },
      ],
    },
  ];

  // ---------------------------
  // Helpers
  // ---------------------------
  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add("show");
    window.clearTimeout(showToast._t);
    showToast._t = window.setTimeout(() => toast.classList.remove("show"), 1600);
  }

  function slugify(s) {
    return String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  }

  function escapeHtml(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function highlight(text, q) {
    if (!q) return escapeHtml(text);
    const safe = escapeHtml(text);
    const re = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "ig");
    return safe.replace(re, "<mark>$1</mark>");
  }

  // ---------------------------
  // Build UI from sections
  // ---------------------------
  let sections = DEMO_SECTIONS; // replace with your real data if you have it
  let activeTag = null;

  function buildNav() {
    navMenu.innerHTML = "";
    sections.forEach((s) => {
      const a = document.createElement("a");
      a.href = `#${s.id}`;
      a.className = "nav-link";
      a.dataset.target = s.id;
      a.innerHTML = `<span>${escapeHtml(s.title)}</span><small>${escapeHtml(s.tag)}</small>`;
      a.addEventListener("click", () => closeSidebarUI(true));
      navMenu.appendChild(a);
    });
  }

  function buildTags() {
    const tags = [...new Set(sections.map((s) => s.tag))].sort();
    tagsContainer.innerHTML = "";

    const all = document.createElement("button");
    all.className = "tag" + (!activeTag ? " active" : "");
    all.textContent = "All";
    all.addEventListener("click", () => {
      activeTag = null;
      buildTags();
      renderSections();
    });
    tagsContainer.appendChild(all);

    tags.forEach((t) => {
      const b = document.createElement("button");
      b.className = "tag" + (activeTag === t ? " active" : "");
      b.textContent = t;
      b.addEventListener("click", () => {
        activeTag = (activeTag === t) ? null : t;
        buildTags();
        renderSections();
      });
      tagsContainer.appendChild(b);
    });
  }

  function renderSections() {
    const q = searchInput.value.trim();
    const filtered = sections.filter((s) => !activeTag || s.tag === activeTag);

    sectionsContainer.innerHTML = "";
    let visibleCount = 0;
    let totalMatches = 0;

    filtered.forEach((s) => {
      // compute match
      const hay = (s.title + " " + s.subtitle + " " + s.methods.map(m => m.name + " " + m.desc).join(" ")).toLowerCase();
      const isMatch = !q || hay.includes(q.toLowerCase());

      if (!isMatch) return;

      visibleCount++;

      const sectionEl = document.createElement("article");
      sectionEl.className = "doc-section open";
      sectionEl.id = s.id;

      // count matches (simple)
      if (q) {
        const re = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "ig");
        const matches = hay.match(re);
        totalMatches += matches ? matches.length : 0;
      }

      sectionEl.innerHTML = `
        <div class="section-header" role="button" aria-expanded="true" tabindex="0">
          <div class="section-left">
            <h3 class="section-title">${highlight(s.title, q)}</h3>
            <p class="section-sub">${highlight(s.subtitle, q)}</p>
          </div>
          <div class="section-right">
            <span class="badge">${escapeHtml(s.tag)}</span>
            <div class="chev" aria-hidden="true">⌄</div>
          </div>
        </div>

        <div class="section-body">
          <div class="methods">
            ${s.methods.map(m => `
              <p><code>${highlight(m.name, q)}</code> — ${highlight(m.desc, q)}</p>
            `).join("")}
          </div>
        </div>
      `;

      // toggle open/close
      const header = sectionEl.querySelector(".section-header");
      header.addEventListener("click", () => toggleSection(sectionEl));
      header.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          toggleSection(sectionEl);
        }
      });

      sectionsContainer.appendChild(sectionEl);
    });

    // empty state
    const any = visibleCount > 0;
    emptyState.style.display = any ? "none" : "block";
    if (!any) {
      emptyStateText.textContent = q
        ? `No results for "${q}". Try a different keyword or clear search.`
        : `No sections to show.`;
    }

    // meta
    if (!q) {
      searchMeta.textContent = "";
    } else {
      searchMeta.textContent = `${visibleCount} section(s), ~${totalMatches} match(es)`;
    }

    // update clear icon visibility
    document.querySelector(".search-container")?.classList.toggle("has-text", !!q);

    // ensure nav highlight works after render
    requestAnimationFrame(updateActiveNav);
  }

  function toggleSection(sectionEl, forceOpen = null) {
    const willOpen = (forceOpen === null) ? !sectionEl.classList.contains("open") : forceOpen;
    sectionEl.classList.toggle("open", willOpen);
    const header = sectionEl.querySelector(".section-header");
    header.setAttribute("aria-expanded", String(willOpen));
  }

  function expandAll() {
    document.querySelectorAll(".doc-section").forEach((s) => toggleSection(s, true));
  }
  function collapseAll() {
    document.querySelectorAll(".doc-section").forEach((s) => toggleSection(s, false));
  }

  // ---------------------------
  // Sidebar open/close
  // ---------------------------
  function openSidebarUI() {
    sidebar.classList.add("open");
    overlay.classList.add("show");
  }
  function closeSidebarUI(onlyMobile = false) {
    // on desktop sidebar is sticky visible (CSS) — avoid closing if wide
    if (onlyMobile && window.matchMedia("(min-width: 980px)").matches) return;
    sidebar.classList.remove("open");
    overlay.classList.remove("show");
  }

  menuToggle.addEventListener("click", () => openSidebarUI());
  closeSidebar.addEventListener("click", () => closeSidebarUI());
  overlay.addEventListener("click", () => closeSidebarUI());

  // ---------------------------
  // Search
  // ---------------------------
  function onSearch() {
    renderSections();

    // auto expand matching sections (already open by default)
    // jump to first match with Enter
  }

  searchInput.addEventListener("input", onSearch);

  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const first = document.querySelector(".doc-section");
      if (first) first.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    if (e.key === "Escape") {
      searchInput.value = "";
      onSearch();
      searchInput.blur();
    }
  });

  function clearSearchNow() {
    searchInput.value = "";
    activeTag = null;
    buildTags();
    onSearch();
    showToast("Search cleared");
  }

  clearSearch.addEventListener("click", clearSearchNow);
  clearSearchBtn?.addEventListener("click", clearSearchNow);

  // Ctrl/⌘ + K to focus search
  document.addEventListener("keydown", (e) => {
    const isMac = navigator.platform.toLowerCase().includes("mac");
    const mod = isMac ? e.metaKey : e.ctrlKey;
    if (mod && e.key.toLowerCase() === "k") {
      e.preventDefault();
      searchInput.focus();
      searchInput.select();
    }
  });

  // ---------------------------
  // Active nav highlight + reading progress + FAB
  // ---------------------------
  function updateReadingProgress() {
    const doc = document.documentElement;
    const scrollTop = doc.scrollTop || document.body.scrollTop;
    const height = doc.scrollHeight - doc.clientHeight;
    const percent = height > 0 ? (scrollTop / height) * 100 : 0;
    readingProgress.style.width = `${Math.min(100, Math.max(0, percent))}%`;

    // fab show
    fab.style.display = scrollTop > 420 ? "grid" : "none";
  }

  function updateActiveNav() {
    const sectionsEls = [...document.querySelectorAll(".doc-section")];
    if (!sectionsEls.length) return;

    let best = sectionsEls[0];
    const fromTop = window.scrollY + 120;

    for (const el of sectionsEls) {
      if (el.offsetTop <= fromTop) best = el;
    }

    document.querySelectorAll(".nav-link").forEach((a) => {
      a.classList.toggle("active", a.dataset.target === best.id);
    });
  }

  window.addEventListener("scroll", () => {
    updateReadingProgress();
    updateActiveNav();
  }, { passive: true });

  fab.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  // ---------------------------
  // Expand / Collapse
  // ---------------------------
  expandBtn.addEventListener("click", () => {
    expandAll();
    showToast("Expanded all sections");
  });
  collapseBtn.addEventListener("click", () => {
    collapseAll();
    showToast("Collapsed all sections");
  });

  // ---------------------------
  // Theme toggle
  // ---------------------------
  function setTheme(next) {
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("du_theme", next);
    showToast(`Theme: ${next}`);
  }
  themeBtn.addEventListener("click", () => {
    const cur = document.documentElement.getAttribute("data-theme") || "dark";
    setTheme(cur === "dark" ? "light" : "dark");
  });

  // ---------------------------
  // Copy install command
  // ---------------------------
  copyCmdBtn?.addEventListener("click", async () => {
    const cmd = "pip install datautility";
    try {
      await navigator.clipboard.writeText(cmd);
      showToast("Copied: pip install datautility");
    } catch {
      showToast("Could not copy (browser blocked)");
    }
  });

  // ---------------------------
  // Init
  // ---------------------------
  const savedTheme = localStorage.getItem("du_theme");
  if (savedTheme) document.documentElement.setAttribute("data-theme", savedTheme);

  buildNav();
  buildTags();
  renderSections();
  updateReadingProgress();
  updateActiveNav();
})();
