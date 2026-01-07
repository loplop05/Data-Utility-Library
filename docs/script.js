(function () {
  const $ = (id) => document.getElementById(id);

  const menuToggle = $("menuToggle");
  const sidebar = $("sidebar");
  const overlay = $("overlay");
  const closeSidebar = $("closeSidebar");

  const navMenu = $("navMenu");
  const tagsContainer = $("tagsContainer");
  const sectionsContainer = $("sectionsContainer");

  const searchInput = $("searchInput");
  const clearSearch = $("clearSearch");
  const clearSearchBtn = $("clearSearchBtn");
  const emptyState = $("emptyState");
  const emptyStateText = $("emptyStateText");
  const searchMeta = document.getElementById("searchMeta"); // optional (if not in HTML, code still works)

  const expandBtn = $("expandBtn");
  const collapseBtn = $("collapseBtn");
  const fab = $("fab");

  // ---------- Demo sections (REMOVE if you already build from real data) ----------
  const SECTIONS = [
    {
      id: "missing-values",
      title: "Missing Values",
      subtitle: "Count, drop, fill, and audit missing data safely",
      tag: "Cleaning",
      methods: [
        { name: "missingRows()", desc: "Return rows that contain at least one missing value." },
        { name: "missingColumns()", desc: "Return columns that contain at least one missing value." },
        { name: "fillMissingValues(strategy='mean')", desc: "Fill missing values using mean/median/mode or a constant value." },
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
        { name: "labelEncode(col)", desc: "Label encode a single column with mapping output." },
      ],
    },
  ];

  // ---------- Helpers ----------
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

  function isDesktop() {
    return window.matchMedia("(min-width: 1024px)").matches;
  }

  function openSidebar() {
    if (isDesktop()) return; // desktop sidebar is always visible
    sidebar.classList.add("open");
    overlay.classList.add("show");
  }

  function closeSidebarUI() {
    if (isDesktop()) return;
    sidebar.classList.remove("open");
    overlay.classList.remove("show");
  }

  // ---------- Build Nav ----------
  function buildNav(data) {
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

  // ---------- Tags ----------
  let activeTag = null;

  function buildTags(data) {
    const tags = [...new Set(data.map((s) => s.tag))].sort();
    tagsContainer.innerHTML = "";

    const make = (label, isActive, onClick) => {
      const b = document.createElement("button");
      b.className = "tag" + (isActive ? " active" : "");
      b.textContent = label;
      b.addEventListener("click", onClick);
      tagsContainer.appendChild(b);
    };

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

  // ---------- Accordion animation ----------
  function setOpen(sectionEl, open) {
    const body = sectionEl.querySelector(".section-body");
    const inner = sectionEl.querySelector(".section-body-inner");
    if (!body || !inner) return;

    if (open) {
      sectionEl.classList.add("open");
      const h = inner.scrollHeight;
      body.style.height = h + "px";
      // after animation, set to auto-height feel by keeping px but updating on resize
    } else {
      const h = inner.scrollHeight;
      body.style.height = h + "px";
      requestAnimationFrame(() => {
        body.style.height = "0px";
        sectionEl.classList.remove("open");
      });
    }
  }

  function toggle(sectionEl) {
    const open = sectionEl.classList.contains("open");
    setOpen(sectionEl, !open);
  }

  function expandAll() {
    document.querySelectorAll(".doc-section").forEach((el) => setOpen(el, true));
  }
  function collapseAll() {
    document.querySelectorAll(".doc-section").forEach((el) => setOpen(el, false));
  }

  // ---------- Render sections ----------
  function render(data) {
    const q = searchInput.value.trim().toLowerCase();
    const filtered = data.filter((s) => !activeTag || s.tag === activeTag);

    sectionsContainer.innerHTML = "";

    let visible = 0;
    let matches = 0;

    filtered.forEach((s) => {
      const hay =
        (s.title + " " + s.subtitle + " " + s.methods.map(m => m.name + " " + m.desc).join(" ")).toLowerCase();

      if (q && !hay.includes(q)) return;

      visible++;

      if (q) {
        const re = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "ig");
        const m = hay.match(re);
        matches += m ? m.length : 0;
      }

      const sectionEl = document.createElement("article");
      sectionEl.className = "doc-section open";
      sectionEl.id = s.id;

      sectionEl.innerHTML = `
        <div class="section-header" role="button" tabindex="0" aria-expanded="true">
          <div class="section-left">
            <h3 class="section-title">${highlight(s.title, q)}</h3>
            <p class="section-sub">${highlight(s.subtitle, q)}</p>
          </div>
          <div class="section-right">
            <span class="badge">${escapeHtml(s.tag)}</span>
            <div class="chev">⌄</div>
          </div>
        </div>

        <div class="section-body">
          <div class="section-body-inner">
            <div class="methods">
              ${s.methods.map(m => `
                <p><code>${highlight(m.name, q)}</code> — ${highlight(m.desc, q)}</p>
              `).join("")}
            </div>
          </div>
        </div>
      `;

      const header = sectionEl.querySelector(".section-header");
      header.addEventListener("click", () => toggle(sectionEl));
      header.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          toggle(sectionEl);
        }
      });

      sectionsContainer.appendChild(sectionEl);

      // fix initial height for smooth accordion
      requestAnimationFrame(() => {
        const inner = sectionEl.querySelector(".section-body-inner");
        const body = sectionEl.querySelector(".section-body");
        if (inner && body) body.style.height = inner.scrollHeight + "px";
      });
    });

    // empty state
    if (!visible) {
      emptyState.style.display = "block";
      emptyStateText.textContent = q ? `No results for "${q}".` : "No sections available.";
    } else {
      emptyState.style.display = "none";
    }

    // search meta + clear icon
    document.querySelector(".search-container")?.classList.toggle("has-text", !!q);
    if (searchMeta) {
      searchMeta.textContent = q ? `${visible} section(s), ~${matches} match(es)` : "";
    }

    // update nav highlight after rendering
    requestAnimationFrame(updateActiveNav);
  }

  // ---------- Active nav highlight ----------
  function updateActiveNav() {
    const sections = [...document.querySelectorAll(".doc-section")];
    if (!sections.length) return;

    const fromTop = window.scrollY + 120;
    let current = sections[0];

    for (const s of sections) {
      if (s.offsetTop <= fromTop) current = s;
    }

    document.querySelectorAll(".nav-link").forEach((a) => {
      a.classList.toggle("active", a.dataset.target === current.id);
    });
  }

  // ---------- Events ----------
  menuToggle?.addEventListener("click", openSidebar);
  closeSidebar?.addEventListener("click", closeSidebarUI);
  overlay?.addEventListener("click", closeSidebarUI);

  expandBtn?.addEventListener("click", expandAll);
  collapseBtn?.addEventListener("click", collapseAll);

  searchInput?.addEventListener("input", () => render(SECTIONS));
  searchInput?.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      searchInput.value = "";
      render(SECTIONS);
      searchInput.blur();
    }
  });

  function clearSearchNow() {
    searchInput.value = "";
    activeTag = null;
    buildTags(SECTIONS);
    render(SECTIONS);
  }
  clearSearch?.addEventListener("click", clearSearchNow);
  clearSearchBtn?.addEventListener("click", clearSearchNow);

  // FAB
  window.addEventListener("scroll", () => {
    updateActiveNav();
    const y = window.scrollY || document.documentElement.scrollTop;
    fab.style.display = y > 420 ? "grid" : "none";
  }, { passive:true });

  fab?.addEventListener("click", () => window.scrollTo({ top:0, behavior:"smooth" }));

  // keep accordion heights correct on resize
  window.addEventListener("resize", () => {
    document.querySelectorAll(".doc-section.open").forEach((sectionEl) => {
      const inner = sectionEl.querySelector(".section-body-inner");
      const body = sectionEl.querySelector(".section-body");
      if (inner && body) body.style.height = inner.scrollHeight + "px";
    });
  });

  // ---------- Init ----------
  buildNav(SECTIONS);
  buildTags(SECTIONS);
  render(SECTIONS);
  updateActiveNav();

})();
