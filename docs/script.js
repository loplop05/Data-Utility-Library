(function () {
  const body = document.body;

  // ---------- Theme toggle (persist) ----------
  const root = document.documentElement;
  const btnTheme = document.getElementById("toggleTheme");
  const saved = localStorage.getItem("du-theme");
  if (saved) root.setAttribute("data-theme", saved);

  btnTheme.addEventListener("click", () => {
    const cur = root.getAttribute("data-theme") || "dark";
    const next = cur === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    localStorage.setItem("du-theme", next);
  });

  // ---------- Expand / Collapse ----------
  const allDetails = Array.from(document.querySelectorAll("details"));
  document.getElementById("expandAll").addEventListener("click", () => {
    allDetails.forEach((d) => (d.open = true));
  });
  document.getElementById("collapseAll").addEventListener("click", () => {
    allDetails.forEach((d) => (d.open = false));
  });

  // ---------- Copy buttons ----------
  const copyButtons = Array.from(document.querySelectorAll(".copy"));
  copyButtons.forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.getAttribute("data-copy");
      const el = document.getElementById(id);
      if (!el) return;

      const text = el.innerText;
      const old = btn.textContent;

      try {
        await navigator.clipboard.writeText(text);
        btn.classList.add("ok");
        btn.textContent = "Copied";
        setTimeout(() => {
          btn.classList.remove("ok");
          btn.textContent = old;
        }, 900);
      } catch {
        // fallback
        const ta = document.createElement("textarea");
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);

        btn.classList.add("ok");
        btn.textContent = "Copied";
        setTimeout(() => {
          btn.classList.remove("ok");
          btn.textContent = old;
        }, 900);
      }
    });
  });

  // ---------- Tabs ----------
  function setupTabs(scope) {
    const tabs = Array.from(scope.querySelectorAll(".tab"));
    if (!tabs.length) return;

    tabs.forEach((t) =>
      t.addEventListener("click", () => {
        const target = t.getAttribute("data-tab");
        tabs.forEach((x) => {
          x.classList.remove("active");
          x.setAttribute("aria-selected", "false");
        });
        t.classList.add("active");
        t.setAttribute("aria-selected", "true");

        const panels = Array.from(scope.querySelectorAll(".tabpanel"));
        panels.forEach((p) => p.classList.toggle("active", p.id === target));
      })
    );
  }
  document.querySelectorAll(".inner").forEach(setupTabs);

  // ---------- Scrollspy ----------
  const nav = document.getElementById("nav");
  const links = Array.from(nav.querySelectorAll("a"));
  const targets = links
    .map((a) => document.querySelector(a.getAttribute("href")))
    .filter(Boolean);

  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = "#" + entry.target.id;
          links.forEach((a) =>
            a.classList.toggle("active", a.getAttribute("href") === id)
          );
        }
      });
    },
    { rootMargin: "-35% 0px -55% 0px", threshold: 0.01 }
  );

  targets.forEach((t) => obs.observe(t));

  // ---------- Mobile sidebar drawer ----------
  const overlay = document.getElementById("overlay");
  const btnOpenSide = document.getElementById("toggleSidebar");
  const btnCloseSide = document.getElementById("closeSidebar");

  const openSidebar = () => body.classList.add("sidebar-open");
  const closeSidebar = () => body.classList.remove("sidebar-open");

  if (btnOpenSide) btnOpenSide.addEventListener("click", () => {
    if (body.classList.contains("sidebar-open")) closeSidebar();
    else openSidebar();
  });
  if (btnCloseSide) btnCloseSide.addEventListener("click", closeSidebar);
  if (overlay) overlay.addEventListener("click", closeSidebar);

  // Close drawer when clicking a nav link (mobile)
  links.forEach((a) => a.addEventListener("click", closeSidebar));

  // ---------- Back to top ----------
  const fab = document.getElementById("fab");
  const backTop = document.getElementById("backTop");
  const toggleFab = () => {
    if (window.scrollY > 700) fab.classList.remove("hidden");
    else fab.classList.add("hidden");
  };
  window.addEventListener("scroll", toggleFab, { passive: true });
  toggleFab();
  backTop.addEventListener("click", () =>
    window.scrollTo({ top: 0, behavior: "smooth" })
  );

  // ---------- Search (friendly) ----------
  const searchInput = document.getElementById("searchInput");
  const clearBtn = document.getElementById("clearSearch");
  const searchCount = document.getElementById("searchCount");
  const suggestBox = document.getElementById("suggest");

  // Save original HTML for each inner (so we can restore after highlighting)
  const originals = new Map();
  allDetails.forEach((d) => {
    const inner = d.querySelector(".inner");
    if (inner) originals.set(inner, inner.innerHTML);
  });

  function escapeRegExp(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  // highlight ALL matches inside an element (text nodes only)
  function highlightAll(rootEl, term) {
    if (!term) return;

    const safe = escapeRegExp(term);
    const re = new RegExp(safe, "gi");

    const walker = document.createTreeWalker(rootEl, NodeFilter.SHOW_TEXT, null);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);

    nodes.forEach((node) => {
      const value = node.nodeValue;
      if (!value) return;
      if (!re.test(value)) return;

      // reset regex state for safety
      re.lastIndex = 0;

      const frag = document.createDocumentFragment();
      let last = 0;
      let match;

      while ((match = re.exec(value)) !== null) {
        const start = match.index;
        const end = start + match[0].length;

        if (start > last) frag.appendChild(document.createTextNode(value.slice(last, start)));

        const mark = document.createElement("mark");
        mark.className = "hit";
        mark.textContent = value.slice(start, end);
        frag.appendChild(mark);

        last = end;
      }

      if (last < value.length) frag.appendChild(document.createTextNode(value.slice(last)));

      node.parentNode.replaceChild(frag, node);
    });
  }

  function restoreInner(detailsEl) {
    const inner = detailsEl.querySelector(".inner");
    if (!inner) return;
    if (!originals.has(inner)) return;
    inner.innerHTML = originals.get(inner);
    // rebind tabs + copy in restored html (simple + not complicated)
    setupTabs(inner);
    inner.querySelectorAll(".copy").forEach((btn) => {
      // avoid double-binding: mark when bound
      if (btn.dataset.bound === "1") return;
      btn.dataset.bound = "1";
      btn.addEventListener("click", async () => {
        const id = btn.getAttribute("data-copy");
        const el = document.getElementById(id);
        if (!el) return;
        const text = el.innerText;
        const old = btn.textContent;
        try {
          await navigator.clipboard.writeText(text);
          btn.classList.add("ok");
          btn.textContent = "Copied";
          setTimeout(() => {
            btn.classList.remove("ok");
            btn.textContent = old;
          }, 900);
        } catch {
          const ta = document.createElement("textarea");
          ta.value = text;
          document.body.appendChild(ta);
          ta.select();
          document.execCommand("copy");
          document.body.removeChild(ta);
          btn.classList.add("ok");
          btn.textContent = "Copied";
          setTimeout(() => {
            btn.classList.remove("ok");
            btn.textContent = old;
          }, 900);
        }
      });
    });
  }

  function sectionMatches(detailsEl, termLower) {
    const title = (detailsEl.querySelector(".sumtitle")?.textContent || "").toLowerCase();
    const desc = (detailsEl.querySelector(".sumdesc")?.textContent || "").toLowerCase();
    const tags = (detailsEl.getAttribute("data-search-tags") || "").toLowerCase();
    const body = (detailsEl.textContent || "").toLowerCase();

    return (
      title.includes(termLower) ||
      desc.includes(termLower) ||
      tags.includes(termLower) ||
      body.includes(termLower)
    );
  }

  function applySearch(q) {
    const term = q.trim();
    const termLower = term.toLowerCase();

    let visibleCount = 0;

    allDetails.forEach((d) => {
      // restore first (removes old highlights)
      restoreInner(d);

      if (!term) {
        d.style.display = "";
        return;
      }

      const match = sectionMatches(d, termLower);
      d.style.display = match ? "" : "none";

      if (match) {
        visibleCount++;
        d.open = true;

        const inner = d.querySelector(".inner");
        if (inner) highlightAll(inner, term);
      }
    });

    if (!term) {
      searchCount.textContent = "Showing all sections";
      clearBtn.style.visibility = "hidden";
    } else {
      searchCount.textContent =
        visibleCount === 1 ? "1 matching section" : `${visibleCount} matching sections`;
      clearBtn.style.visibility = "visible";
    }
  }

  let t;
  searchInput.addEventListener("input", (e) => {
    clearTimeout(t);
    t = setTimeout(() => applySearch(e.target.value), 120);

    // Suggestions
    renderSuggestions(e.target.value);
  });

  clearBtn.addEventListener("click", () => {
    searchInput.value = "";
    applySearch("");
    hideSuggestions();
    searchInput.focus();
  });

  // Enter = jump to first visible match (friendly)
  searchInput.addEventListener("keydown", (e) => {
    if (e.key !== "Enter") return;

    const firstVisible = allDetails.find((d) => d.style.display !== "none");
    if (!firstVisible) return;

    // scroll to the section container
    firstVisible.scrollIntoView({ behavior: "smooth", block: "start" });
    hideSuggestions();
  });

  // Keyboard shortcuts: / focus search, Esc clear/close
  document.addEventListener("keydown", (e) => {
    const isTyping = ["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName);

    if (!isTyping && e.key === "/") {
      e.preventDefault();
      searchInput.focus();
      return;
    }

    if (e.key === "Escape") {
      if (body.classList.contains("sidebar-open")) closeSidebar();
      hideSuggestions();
      if (document.activeElement === searchInput && searchInput.value) {
        searchInput.value = "";
        applySearch("");
      }
    }
  });

  // default state
  clearBtn.style.visibility = "hidden";

  // ---------- Search suggestions (jump to sections) ----------
  const navItems = links
    .map((a) => {
      const href = a.getAttribute("href") || "";
      const id = href.startsWith("#") ? href.slice(1) : "";
      const main = a.querySelector("span")?.textContent?.trim() || "";
      const sub = a.querySelector(".hint")?.textContent?.trim() || "";
      return { id, href, main, sub };
    })
    .filter((x) => x.id && x.main);

  function hideSuggestions() {
    if (!suggestBox) return;
    suggestBox.classList.remove("show");
    suggestBox.setAttribute("aria-hidden", "true");
    suggestBox.innerHTML = "";
  }

  function renderSuggestions(q) {
    if (!suggestBox) return;
    const term = (q || "").trim().toLowerCase();
    if (term.length < 2) return hideSuggestions();

    const hits = navItems
      .filter((x) => (x.main + " " + x.sub + " " + x.id).toLowerCase().includes(term))
      .slice(0, 7);

    if (!hits.length) return hideSuggestions();

    suggestBox.innerHTML = hits
      .map(
        (x) =>
          `<div class="sItem" role="option" data-href="${x.href}">
             <div>
               <div class="sMain">${escapeHtml(x.main)}</div>
               <div class="sSub">${escapeHtml(x.sub)}</div>
             </div>
             <div class="sTag">#${escapeHtml(x.id)}</div>
           </div>`
      )
      .join("");

    suggestBox.classList.add("show");
    suggestBox.setAttribute("aria-hidden", "false");

    suggestBox.querySelectorAll(".sItem").forEach((el) => {
      el.addEventListener("click", () => {
        const href = el.getAttribute("data-href");
        const target = href ? document.querySelector(href) : null;
        if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
        hideSuggestions();
        closeSidebar();
      });
    });
  }

  // click outside suggestions => hide
  document.addEventListener("click", (e) => {
    if (!suggestBox) return;
    const inSearch = e.target && e.target.closest && e.target.closest(".search");
    if (!inSearch) hideSuggestions();
  });

  function escapeHtml(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }
})();
