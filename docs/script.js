/* =========================================================
   DataUtility Docs — Global Professional JS
   - Mobile sidebar
   - Search filtering + highlight
   - Render sections + left nav + right TOC
   - Smooth accordion
   - Expand/Collapse all
   - Active section highlighting
   - Back-to-top FAB
   - Ctrl/⌘ + K focus search
   ========================================================= */

(function () {
  "use strict";

  // ---------- Safe DOM helpers ----------
  const byId = (id) => document.getElementById(id);
  const qs = (sel, root = document) => root.querySelector(sel);
  const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // ---------- Elements (some optional in your HTML) ----------
  const overlay = byId("overlay");
  const sidebar = byId("sidebar");
  const menuToggle = byId("menuToggle");
  const closeSidebar = byId("closeSidebar");

  const navMenu = byId("navMenu");
  const tagsContainer = byId("tagsContainer");
  const tocLinks = byId("tocLinks");

  const searchInput = byId("searchInput");
  const clearSearch = byId("clearSearch");
  const searchMeta = byId("searchMeta");

  const sectionsContainer = byId("sectionsContainer");
  const emptyState = byId("emptyState");
  const emptyStateText = byId("emptyStateText");
  const clearSearchBtn = byId("clearSearchBtn");

  const expandBtn = byId("expandBtn");
  const collapseBtn = byId("collapseBtn");

  const fab = byId("fab");
  const themeBtn = byId("themeBtn"); // optional

  // ---------- Demo data (replace with your real docs export) ----------
  // Keep this until you connect real library output.
  const DOCS_DATA = [
    {
      id: "missing-values",
      title: "Missing Values",
      subtitle: "Count, drop, fill, and audit missing data safely",
      tag: "Cleaning",
      methods: [
        { name: "missingRows()", desc: "Return rows containing at least one missing value." },
        { name: "missingColumns()", desc: "Return columns containing at least one missing value." },
        { name: "fillMissingValues(strategy='mean')", desc: "Fill missing values using mean/median/mode or constant value." },
      ],
    },
    {
      id: "duplicates",
      title: "Duplicates",
      subtitle: "Detect and remove duplicates with control",
      tag: "Cleaning",
      methods: [
        { name: "duplicateRows(keep='first')", desc: "Return duplicated rows based on keep behavior." },
        { name: "dropDuplicates(subset=None)", desc: "Drop duplicates with optional subset columns." },
      ],
    },
    {
      id: "outliers",
      title: "Outliers",
      subtitle: "IQR detection + summary reporting",
      tag: "EDA",
      methods: [
        { name: "detectOutliersIQR(k=1.5)", desc: "Return rows containing outliers by IQR threshold." },
        { name: "outlierSummary()", desc: "Outlier count per numeric column." },
      ],
    },
    {
      id: "encoding",
      title: "Encoding",
      subtitle: "One-hot / label encoding helpers",
      tag: "Features",
      methods: [
        { name: "oneHotEncode(cols)", desc: "One-hot encode selected columns safely." },
        { name: "labelEncode(col)", desc: "Label encode a column with mapping output." },
      ],
    },
  ];

  // ---------- State ----------
  let activeTag = null;

  // ---------- Utilities ----------
  function escapeHtml(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function slugify(str) {
    return String(str)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  function safeRegex(query) {
    // Escape special regex chars
    return query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function highlight(text, query) {
    if (!query) return escapeHtml(text);
    const safe = escapeHtml(text);
    const re = new RegExp(`(${safeRegex(query)})`, "ig");
    return safe.replace(re, "<mark>$1</mark>");
  }

  function isDesktop() {
    return window.matchMedia("(min-width: 1024px)").matches;
  }

  // ---------- Sidebar controls ----------
  function openSidebar() {
    if (isDesktop()) return;
    sidebar?.classList.add("open");
    overlay?.classList.add("show");
  }

  function closeSidebarUI() {
    if (isDesktop()) return;
    sidebar?.classList.remove("open");
    overlay?.classList.remove("show");
  }

  // ---------- Accordion smooth height ----------
  function setAccordionOpen(sectionEl, open) {
    const body = qs(".section-body", sectionEl);
    const inner = qs(".section-body-inner", sectionEl);
    if (!body || !inner) return;

    if (open) {
      sectionEl.classList.add("open");
      // measure and set height
      const h = inner.scrollHeight;
      body.style.height = h + "px";
    } else {
      // set current height then animate to 0
      const h = inner.scrollHeight;
      body.style.height = h + "px";
      requestAnimationFrame(() => {
        body.style.height = "0px";
        sectionEl.classList.remove("open");
      });
    }
  }

  function toggleAccordion(sectionEl) {
    const open = sectionEl.classList.contains("open");
    setAccordionOpen(sectionEl, !open);
  }

  function expandAll() {
    qsa(".doc-section").forEach((el) => setAccordionOpen(el, true));
  }

  function collapseAll() {
    qsa(".doc-section").forEach((el) => setAccordionOpen(el, false));
  }

  // ---------- Build left nav ----------
  function buildNav(data) {
    if (!navMenu) return;
    navMenu.innerHTML = "";

    data.forEach((s) => {
      const a = document.createElement("a");
      a.href = `#${s.id}`;
      a.className = "nav-link";
      a.dataset.target = s.id;
      a.innerHTML = `<span>${escapeHtml(s.title)}</span><small>${escapeHtml(s.tag)}</small>`;
      a.addEventListener("click", () => closeSidebarUI());
      navMenu.appendChild(a);
    });
  }

  // ---------- Build tags ----------
  function buildTags(data) {
    if (!tagsContainer) return;
    const tags = Array.from(new Set(data.map((x) => x.tag))).sort();
    tagsContainer.innerHTML = "";

    function make(label, active, onClick) {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "tag" + (active ? " active" : "");
      b.textContent = label;
      b.addEventListener("click", onClick);
      tagsContainer.appendChild(b);
    }

    make("All", !activeTag, () => {
      activeTag = null;
      buildTags(data);
      render(data);
    });

    tags.forEach((t) => {
      make(t, activeTag === t, () => {
        activeTag = activeTag === t ? null : t;
        buildTags(data);
        render(data);
      });
    });
  }

  // ---------- Build right TOC from visible sections ----------
  function buildTOCFromRendered() {
    if (!tocLinks) return;
    tocLinks.innerHTML = "";

    const links = qsa(".doc-section").map((sec) => {
      const titleEl = qs(".section-title", sec);
      const title = titleEl ? titleEl.textContent.trim() : sec.id;
      return { id: sec.id, title };
    });

    // Always include Sections anchor if exists
    const sectionsAnchor = byId("sections");
    if (sectionsAnchor) {
      const a0 = document.createElement("a");
      a0.href = "#sections";
      a0.textContent = "Sections";
      tocLinks.appendChild(a0);
    }

    links.forEach((l) => {
      const a = document.createElement("a");
      a.href = `#${l.id}`;
      a.textContent = l.title;
      a.dataset.target = l.id;
      tocLinks.appendChild(a);
    });
  }

  // ---------- Active highlight (left nav + TOC) ----------
  function updateActiveHighlight() {
    const secs = qsa(".doc-section");
    if (!secs.length) return;

    const y = window.scrollY + 140;
    let current = secs[0];

    for (const sec of secs) {
      if (sec.offsetTop <= y) current = sec;
    }

    qsa(".nav-link").forEach((a) => {
      a.classList.toggle("active", a.dataset.target === current.id);
    });

    if (tocLinks) {
      qsa("a", tocLinks).forEach((a) => {
        const target = a.dataset.target;
        if (!target) return;
        a.classList.toggle("active", target === current.id);
      });
    }
  }

  // ---------- Render sections ----------
  function render(data) {
    if (!sectionsContainer) return;

    const qRaw = (searchInput?.value || "").trim();
    const q = qRaw.toLowerCase();

    const filteredByTag = data.filter((s) => !activeTag || s.tag === activeTag);

    sectionsContainer.innerHTML = "";

    let visible = 0;
    let matchCount = 0;

    filteredByTag.forEach((s) => {
      // ensure id exists
      const sid = s.id || slugify(s.title || "section");

      const hay = (
        (s.title || "") +
        " " +
        (s.subtitle || "") +
        " " +
        (s.methods || []).map((m) => (m.name || "") + " " + (m.desc || "")).join(" ")
      ).toLowerCase();

      if (q && !hay.includes(q)) return;

      visible++;

      if (q) {
        const re = new RegExp(safeRegex(q), "ig");
        const m = hay.match(re);
        matchCount += m ? m.length : 0;
      }

      const sectionEl = document.createElement("article");
      sectionEl.className = "doc-section open";
      sectionEl.id = sid;

      sectionEl.innerHTML = `
        <div class="section-header" role="button" tabindex="0" aria-expanded="true">
          <div class="section-left">
            <h3 class="section-title">${highlight(s.title || sid, qRaw)}</h3>
            <p class="section-sub">${highlight(s.subtitle || "", qRaw)}</p>
          </div>
          <div class="section-right">
            <span class="badge">${escapeHtml(s.tag || "General")}</span>
            <div class="chev">⌄</div>
          </div>
        </div>

        <div class="section-body">
          <div class="section-body-inner">
            <div class="methods">
              ${(s.methods || []).map((m) => `
                <p><code>${highlight(m.name || "", qRaw)}</code> — ${highlight(m.desc || "", qRaw)}</p>
              `).join("")}
            </div>
          </div>
        </div>
      `;

      const header = qs(".section-header", sectionEl);
      header?.addEventListener("click", () => toggleAccordion(sectionEl));
      header?.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          toggleAccordion(sectionEl);
        }
      });

      sectionsContainer.appendChild(sectionEl);

      // set initial height for smooth open state
      requestAnimationFrame(() => {
        const inner = qs(".section-body-inner", sectionEl);
        const body = qs(".section-body", sectionEl);
        if (inner && body) body.style.height = inner.scrollHeight + "px";
      });
    });

    // Empty state
    if (emptyState && emptyStateText) {
      if (!visible) {
        emptyState.style.display = "block";
        emptyStateText.textContent = qRaw ? `No results for "${qRaw}".` : "No sections available.";
      } else {
        emptyState.style.display = "none";
      }
    }

    // Search meta and clear button visibility
    const searchWrap = qs(".search-wrap") || qs(".topbar-center"); // safety
    const metaWrap = searchMeta;

    // mark has-text on container so CSS can show clear button
    const parentForHasText = searchWrap?.parentElement || searchWrap;
    parentForHasText?.classList.toggle("has-text", !!qRaw);

    if (metaWrap) {
      metaWrap.textContent = qRaw ? `${visible} section(s), ~${matchCount} match(es)` : "";
    }

    // rebuild TOC for currently visible sections
    buildTOCFromRendered();

    // update active highlights
    requestAnimationFrame(updateActiveHighlight);
  }

  // ---------- Search controls ----------
  function clearSearchNow() {
    if (searchInput) searchInput.value = "";
    activeTag = null;
    buildTags(DOCS_DATA);
    render(DOCS_DATA);
    searchInput?.focus();
  }

  // ---------- Theme toggle (optional) ----------
  function initTheme() {
    if (!themeBtn) return;

    const saved = localStorage.getItem("du_theme");
    if (saved) document.documentElement.setAttribute("data-theme", saved);

    themeBtn.addEventListener("click", () => {
      const cur = document.documentElement.getAttribute("data-theme") || "dark";
      const next = cur === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      localStorage.setItem("du_theme", next);
    });
  }

  // ---------- FAB ----------
  function updateFab() {
    if (!fab) return;
    const y = window.scrollY || document.documentElement.scrollTop;
    fab.style.display = y > 420 ? "grid" : "none";
  }

  // ---------- Keyboard shortcut Ctrl/⌘ + K ----------
  function initShortcuts() {
    document.addEventListener("keydown", (e) => {
      const isMac = navigator.platform.toLowerCase().includes("mac");
      const mod = isMac ? e.metaKey : e.ctrlKey;

      if (mod && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInput?.focus();
        searchInput?.select();
      }

      if (e.key === "Escape") {
        // Close sidebar on mobile if open
        if (sidebar?.classList.contains("open")) closeSidebarUI();
      }
    });
  }

  // ---------- Resize: keep open accordion heights correct ----------
  function fixOpenHeights() {
    qsa(".doc-section.open").forEach((sec) => {
      const inner = qs(".section-body-inner", sec);
      const body = qs(".section-body", sec);
      if (inner && body) body.style.height = inner.scrollHeight + "px";
    });
  }

  // ---------- Bind events safely ----------
  menuToggle?.addEventListener("click", openSidebar);
  closeSidebar?.addEventListener("click", closeSidebarUI);
  overlay?.addEventListener("click", closeSidebarUI);

  expandBtn?.addEventListener("click", expandAll);
  collapseBtn?.addEventListener("click", collapseAll);

  searchInput?.addEventListener("input", () => render(DOCS_DATA));
  searchInput?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const first = qs(".doc-section");
      first?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    if (e.key === "Escape") {
      clearSearchNow();
    }
  });

  clearSearch?.addEventListener("click", clearSearchNow);
  clearSearchBtn?.addEventListener("click", clearSearchNow);

  fab?.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  window.addEventListener("scroll", () => {
    updateActiveHighlight();
    updateFab();
  }, { passive: true });

  window.addEventListener("resize", () => {
    fixOpenHeights();
    // on resize to desktop, close mobile overlay safely
    if (isDesktop()) closeSidebarUI();
  });

  // ---------- Init ----------
  function init() {
    // Build nav and tags from full data set
    buildNav(DOCS_DATA);
    buildTags(DOCS_DATA);

    // Initial render
    render(DOCS_DATA);

    // Initial UI updates
    updateActiveHighlight();
    updateFab();
    fixOpenHeights();

    // Extras
    initTheme();
    initShortcuts();
  }

  init();
})();
