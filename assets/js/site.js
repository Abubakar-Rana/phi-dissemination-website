/* Shared behaviour for every page. Each block only runs if its markup is present. */

/* Lab profiles, shown as icons in every header and footer. Paste each URL here once.
   An empty value still shows the icon, marked "coming soon". */
const SOCIAL = {
  github: "https://github.com/phi-research",
  linkedin: "https://www.linkedin.com/company/phi-oxford/posts/?feedView=all",
  bluesky: "https://bsky.app/profile/phi-lab.bsky.social",
  x: "https://x.com/PHI_Oxford",
  website: "https://www.ndorms.ox.ac.uk/research/research-groups/planetary-health-informatics",
};

(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
  };
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Mobile nav ---- */
  const toggle = $(".nav-toggle"), nav = $(".nav");
  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
    });
  }

  /* ---- Social icons ---- */
  const ICONS = {
    github: ["GitHub", '<path fill="currentColor" d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.89 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.56-1.11-4.56-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02a9.6 9.6 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.69-4.57 4.93.36.31.68.92.68 1.85v2.75c0 .27.18.58.69.48A10 10 0 0 0 12 2z"/>'],
    linkedin: ["LinkedIn", '<path fill="currentColor" d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z"/>'],
    bluesky: ["Bluesky", '<path fill="currentColor" d="M5.2 3.3C7.5 5 10 8.6 12 10.6c2-2 4.5-5.6 6.8-7.3 1.7-1.2 4.4-2.2 4.4.9 0 .6-.4 5.1-.6 5.8-.7 2.5-3.3 3.2-5.6 2.8 4 .7 5.1 3 2.9 5.2-4.2 4.3-6-1.1-6.5-2.5l-.4-1.1-.4 1.1c-.5 1.4-2.3 6.8-6.5 2.5-2.2-2.2-1.1-4.5 2.9-5.2-2.3.4-4.9-.3-5.6-2.8C1.2 9.3.8 4.8.8 4.2c0-3.1 2.7-2.1 4.4-.9z"/>'],
    x: ["X", '<path fill="currentColor" d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.657l-5.214-6.817-5.966 6.817H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>'],
    website: ["Website", '<g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></g>'],
  };
  $$("[data-social]").forEach((box) => {
    box.innerHTML = Object.entries(ICONS).map(([k, [label, svg]]) => {
      const url = SOCIAL[k];
      const attrs = url ? `href="${url}" target="_blank" rel="noopener"` : `href="#" data-pending title="${label}: link coming soon"`;
      return `<a ${attrs} aria-label="PHI Lab on ${label}"><svg viewBox="0 0 24 24" aria-hidden="true">${svg}</svg></a>`;
    }).join("");
    $$("[data-pending]", box).forEach((a) => a.addEventListener("click", (e) => e.preventDefault()));
  });

  /* ---- Footer year ---- */
  $$("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));

  /* ---- Reveal on scroll ---- */
  if ("IntersectionObserver" in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
    }), { rootMargin: "0px 0px -8% 0px" });
    $$(".reveal").forEach((el) => io.observe(el));
  } else {
    $$(".reveal").forEach((el) => el.classList.add("in"));
  }

  /* ---- Reading lens: same research, explained for different readers ---- */
  const lensButtons = $$("[data-set-lens]");
  if (lensButtons.length) {
    const apply = (lens) => {
      lensButtons.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.setLens === lens)));
      $$("[data-lens]").forEach((el) => el.classList.toggle("lens-on", el.dataset.lens.split(" ").includes(lens)));
      document.documentElement.dataset.reading = lens;
      store.set("phi-lens", lens);
      document.dispatchEvent(new CustomEvent("lenschange", { detail: lens }));
    };
    lensButtons.forEach((b) => b.addEventListener("click", () => apply(b.dataset.setLens)));
    const fromUrl = new URLSearchParams(location.search).get("lens");
    const valid = lensButtons.map((b) => b.dataset.setLens);
    apply(valid.includes(fromUrl) ? fromUrl : valid.includes(store.get("phi-lens")) ? store.get("phi-lens") : valid[0]);
  }

  /* ---- Year player (GIF split into one frame per year) ---- */
  $$(".player").forEach((player) => {
    const img = $(".stage img", player), yearEl = $(".year", player), range = $("input[type=range]", player);
    const playBtn = $(".play", player), sets = $$("[data-set]", player);
    const from = +range.min, to = +range.max;
    let set = sets.find((b) => b.getAttribute("aria-pressed") === "true")?.dataset.set || sets[0]?.dataset.set;
    let timer = null;
    const src = (y) => `${player.dataset.base}${set}-${y}.jpg`;

    // Preload so scrubbing is instant.
    const preload = () => { for (let y = from; y <= to; y++) new Image().src = src(y); };

    const show = (y) => {
      range.value = y; yearEl.textContent = y; img.src = src(y);
      img.alt = `${player.dataset.alt?.replace("{set}", sets.find((b) => b.dataset.set === set)?.textContent || "")} — ${y}`;
      range.setAttribute("aria-valuetext", String(y));
    };
    const icon = (playing) => (playBtn.innerHTML = playing
      ? '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>'
      : '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5.5v13a1 1 0 0 0 1.5.9l10.2-6.5a1 1 0 0 0 0-1.7L9.5 4.6A1 1 0 0 0 8 5.5z"/></svg>');
    const stop = () => { clearInterval(timer); timer = null; icon(false); playBtn.setAttribute("aria-label", "Play animation"); };
    const play = () => {
      if (+range.value >= to) show(from);
      timer = setInterval(() => { const n = +range.value + 1; if (n > to) stop(); else show(n); }, 650);
      icon(true); playBtn.setAttribute("aria-label", "Pause animation");
    };

    playBtn.addEventListener("click", () => (timer ? stop() : play()));
    range.addEventListener("input", () => { stop(); show(+range.value); });
    sets.forEach((b) => b.addEventListener("click", () => {
      set = b.dataset.set;
      sets.forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      $$("[data-for-set]", player.parentElement).forEach((el) => (el.hidden = el.dataset.forSet !== set));
      preload(); show(+range.value);
    }));

    preload(); show(+range.value); icon(false);
    // Autoplay once when it scrolls into view (not for reduced-motion users).
    if (!reduceMotion && "IntersectionObserver" in window) {
      const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { play(); io.disconnect(); } }, { threshold: .5 });
      io.observe(player);
    }
  });

  /* ---- Before / after comparison slider ---- */
  $$(".compare").forEach((cmp) => {
    const range = $("input[type=range]", cmp);
    const set = () => cmp.style.setProperty("--pos", range.value + "%");
    range.addEventListener("input", set); set();
  });
  // Swappable compare sets (e.g. choose an indicator)
  $$("[data-compare-switch]").forEach((group) => {
    const cmp = document.getElementById(group.dataset.compareSwitch);
    const btns = $$("button", group);
    btns.forEach((b) => b.addEventListener("click", () => {
      btns.forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      $(".before", cmp).src = b.dataset.before; $(".after img", cmp).src = b.dataset.after;
      $(".before", cmp).alt = b.dataset.altBefore || ""; $(".after img", cmp).alt = b.dataset.altAfter || "";
      const cap = document.getElementById(group.dataset.caption);
      if (cap) cap.textContent = b.dataset.caption;
    }));
  });

  /* ---- Tabs (simple show/hide panels) ---- */
  $$("[data-tabs]").forEach((tabs) => {
    const btns = $$("button", tabs);
    btns.forEach((b) => b.addEventListener("click", () => {
      btns.forEach((x) => {
        x.setAttribute("aria-selected", String(x === b));
        document.getElementById(x.getAttribute("aria-controls")).hidden = x !== b;
      });
    }));
  });

  /* ---- Lightbox for figures ---- */
  const zoomables = $$(".zoomable");
  if (zoomables.length) {
    const box = document.createElement("div");
    box.className = "lightbox"; box.setAttribute("role", "dialog"); box.setAttribute("aria-modal", "true");
    box.innerHTML = '<button type="button" aria-label="Close">×</button><img alt="">';
    document.body.append(box);
    const close = () => box.classList.remove("open");
    box.addEventListener("click", (e) => { if (e.target !== box.querySelector("img")) close(); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
    zoomables.forEach((img) => {
      img.tabIndex = 0;
      const open = () => { const i = $("img", box); i.src = img.dataset.full || img.currentSrc || img.src; i.alt = img.alt; box.classList.add("open"); $("button", box).focus(); };
      img.addEventListener("click", open);
      img.addEventListener("keydown", (e) => { if (e.key === "Enter") open(); });
    });
  }

  /* ---- Citation formats: copy + download ---- */
  const cite = $("[data-cite]");
  if (cite) {
    const formats = JSON.parse($("#cite-data").textContent);
    const out = $(".cite-text", cite), toast = $(".toast", cite);
    let current = Object.keys(formats)[0];
    const btns = $$("[data-format]", cite);
    const pick = (f) => { current = f; out.textContent = formats[f].text; btns.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.format === f))); };
    btns.forEach((b) => b.addEventListener("click", () => pick(b.dataset.format)));
    const flash = (msg) => { toast.textContent = msg; toast.classList.add("show"); setTimeout(() => toast.classList.remove("show"), 1800); };
    $("[data-copy]", cite).addEventListener("click", async () => {
      try { await navigator.clipboard.writeText(formats[current].text); flash("Copied to clipboard"); }
      catch (e) { const r = document.createRange(); r.selectNodeContents(out); getSelection().removeAllRanges(); getSelection().addRange(r); flash("Selected — press Ctrl+C"); }
    });
    $("[data-download]", cite)?.addEventListener("click", () => {
      const f = formats[current];
      const a = document.createElement("a");
      a.href = URL.createObjectURL(new Blob([f.text], { type: "text/plain" }));
      a.download = f.file; a.click(); URL.revokeObjectURL(a.href);
    });
    pick(current);
  }

  /* ---- Share links use the live page URL ---- */
  $$("[data-share]").forEach((a) => {
    const url = encodeURIComponent(location.href.split("#")[0]);
    const text = encodeURIComponent(a.closest("[data-share-text]")?.dataset.shareText || document.title);
    const map = {
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      bluesky: `https://bsky.app/intent/compose?text=${text}%20${url}`,
      x: `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      email: `mailto:?subject=${text}&body=${url}`,
    };
    if (a.dataset.share === "copy") {
      a.addEventListener("click", async (e) => {
        e.preventDefault();
        try { await navigator.clipboard.writeText(decodeURIComponent(url)); a.textContent = "Link copied"; } catch (err) {}
      });
    } else { a.href = map[a.dataset.share]; a.target = "_blank"; a.rel = "noopener"; }
  });

  /* ---- Project sub-navigation: highlight the section in view ---- */
  const subLinks = $$(".subnav a[href^='#']");
  if (subLinks.length && "IntersectionObserver" in window) {
    const byId = new Map(subLinks.map((a) => [a.getAttribute("href").slice(1), a]));
    const io = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (e.isIntersecting) { subLinks.forEach((a) => a.classList.remove("active")); byId.get(e.target.id)?.classList.add("active"); }
    }), { rootMargin: "-45% 0px -50% 0px" });
    byId.forEach((_, id) => { const s = document.getElementById(id); if (s) io.observe(s); });
  }

  /* ---- Background video ----
     Plays muted and looping with no player chrome. The iframe ignores the mouse, so
     YouTube's title bar and buttons never appear. Opened from disk (file://) or with
     reduced motion, the poster is shown with a link out instead. ---- */
  $$(".video-embed[data-video]").forEach((box) => {
    const id = box.dataset.video;
    const poster = () => {
      box.innerHTML = `<a class="video-poster" href="https://www.youtube.com/watch?v=${id}" target="_blank" rel="noopener">
        <img src="${box.dataset.poster}" alt="Watch the PHI Lab video on YouTube">
        <span class="play" aria-hidden="true"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13a1 1 0 0 0 1.5.9l10.2-6.5a1 1 0 0 0 0-1.7L9.5 4.6A1 1 0 0 0 8 5.5z"/></svg></span>
        <span class="label">Watch on YouTube</span></a>`;
    };
    if (location.protocol === "file:" || reduceMotion) { poster(); return; }

    // Nudge the player into playing, in case the browser held autoplay back.
    const frame = $("iframe", box);
    const send = (func, arg) => frame.contentWindow?.postMessage(JSON.stringify({ event: "command", func, args: arg ? [arg] : [] }), "*");
    let tries = 0;
    const keepPlaying = setInterval(() => {
      send("mute"); send("playVideo"); send("unloadModule", "captions");
      if (++tries > 10) clearInterval(keepPlaying);
    }, 1200);
    frame.addEventListener("load", () => { send("mute"); send("playVideo"); });
  });

  /* ---- Hero slideshow ---- */
  $$(".slideshow").forEach((show) => {
    const slides = $$(".slide", show), dots = $$(".dots button", show);
    if (slides.length < 2) return;
    const interval = +show.dataset.interval || 6500;
    let at = 0, timer = null;

    const go = (next) => {
      at = (next + slides.length) % slides.length;
      slides.forEach((sl, i) => {
        sl.toggleAttribute("data-current", i === at);
        sl.setAttribute("aria-hidden", String(i !== at));
      });
      dots.forEach((d, i) => d.setAttribute("aria-selected", String(i === at)));
    };
    const start = () => { if (!reduceMotion && !timer) timer = setInterval(() => go(at + 1), interval); };
    const stop = () => { clearInterval(timer); timer = null; };

    dots.forEach((d, i) => d.addEventListener("click", () => { stop(); go(i); start(); }));
    show.addEventListener("mouseenter", stop);
    show.addEventListener("mouseleave", start);
    show.addEventListener("focusin", stop);
    show.addEventListener("focusout", start);
    document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()));
    go(0); start();
  });

  /* ---- Theme folders: hovering any one opens all four, and they stay open
         until a header is pressed to fold that one back. ---- */
  $$(".themes").forEach((group) => {
    const cards = $$(".theme-block", group);
    const setOpen = (card, open) => {
      card.classList.toggle("open", open);
      $(".folder-head", card)?.setAttribute("aria-expanded", String(open));
    };
    const openAll = () => cards.forEach((c) => setOpen(c, true));

    group.addEventListener("mouseenter", openAll);
    group.addEventListener("focusin", openAll);
    // Pressing any header folds the whole set back (and opens it again if closed).
    cards.forEach((card) => {
      const head = $(".folder-head", card);
      head?.addEventListener("click", () => {
        const anyOpen = cards.some((c) => c.classList.contains("open"));
        cards.forEach((c) => setOpen(c, !anyOpen));
      });
    });
  });

  /* ---- Research page filter ---- */
  const chips = $$("[data-filter]");
  if (chips.length) {
    chips.forEach((c) => c.addEventListener("click", () => {
      const f = c.dataset.filter;
      chips.forEach((x) => x.setAttribute("aria-pressed", String(x === c)));
      $$("[data-theme]").forEach((el) => (el.hidden = !(f === "all" || el.dataset.theme === f)));
      $$("[data-empty-note]").forEach((n) => {
        const scope = document.getElementById(n.dataset.emptyNote);
        n.hidden = $$("[data-theme]", scope).some((el) => !el.hidden);
      });
    }));
    const want = new URLSearchParams(location.search).get("theme");
    chips.find((c) => c.dataset.filter === want)?.click();
  }
})();
