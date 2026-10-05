/**
 * श्री शिव स्तोत्र ग्रन्थावली — Web Application Logic
 * Zero-dependency, modern, reactive JavaScript
 */

(function () {
  'use strict';

  // State Management
  const state = {
    stotras: [],
    currentStotra: null,
    activeCategory: 'all',
    searchQuery: '',
    viewMode: (function () {
      const saved = localStorage.getItem('shri_view_mode');
      if (saved === 'all' || saved === 'parayan' || saved === 'study') return saved;
      return 'all';
    })(),
    lineWrap: localStorage.getItem('shri_line_wrap') || 'nowrap', // Default 'nowrap' ensures shloka lines never break!
    theme: localStorage.getItem('shri_theme') || 'dark', // 'dark' | 'vedic' | 'light'
    fontScale: parseFloat(localStorage.getItem('shri_font_scale')) || 1.0,
    shlokaFontScale: parseFloat(localStorage.getItem('shri_shloka_font_scale')) || 1.0,
    favorites: new Set(JSON.parse(localStorage.getItem('shri_favorites') || '[]'))
  };

  // DOM Elements
  const DOM = {
    appContainer: document.getElementById('app-container'),
    sidebar: document.getElementById('app-sidebar'),
    sidebarToggleBtn: document.getElementById('sidebar-toggle-btn'),
    sidebarBackdrop: document.getElementById('sidebar-backdrop'),
    stotraList: document.getElementById('stotra-list'),
    sidebarCountBadge: document.getElementById('sidebar-count-badge'),
    categoryPills: document.getElementById('category-pills'),
    globalSearchInput: document.getElementById('global-search-input'),
    loadingSpinner: document.getElementById('loading-spinner'),
    stotraArticle: document.getElementById('stotra-article'),
    homeView: document.getElementById('home-view'),
    brandIdentityBtn: document.getElementById('brand-identity-btn'),
    subHomeBtn: document.getElementById('sub-home-btn'),
    
    // Dedicated Full-Page Corpus Views
    stutiGangaView: document.getElementById('stuti-ganga-view'),
    stutiKhandasGrid: document.getElementById('stuti-khandas-grid'),
    stutiSearchInput: document.getElementById('stuti-search-input'),
    stutiCountIndicator: document.getElementById('stuti-count-indicator'),
    stutiPagePills: document.getElementById('stuti-page-pills'),
    stutiStotrasCardsGrid: document.getElementById('stuti-stotras-cards-grid'),
    stutiCatalogTitle: document.getElementById('stuti-catalog-title'),
    stutiCatalogHeader: document.getElementById('stuti-catalog-header'),
    vedPuranamView: document.getElementById('ved-puranam-view'),
    vedantDarshanamView: document.getElementById('vedant-darshanam-view'),
    puranaSearchInput: document.getElementById('purana-search-input'),
    puranaCountIndicator: document.getElementById('purana-count-indicator'),
    darshanSearchInput: document.getElementById('darshan-search-input'),
    darshanCountIndicator: document.getElementById('darshan-count-indicator'),
    vedasGrid: document.getElementById('vedas-grid'),
    puranaCardsGrid: document.getElementById('purana-cards-grid'),
    vedantaCardsGrid: document.getElementById('vedanta-cards-grid'),
    darshanCardsGrid: document.getElementById('darshan-cards-grid'),

    // Corpus Tabs
    corpusTabs: document.querySelectorAll('.corpus-tab-btn'),

    // Secondary Sub-Navbar Elements
    subNav: document.getElementById('sub-navbar'),
    subNavIndexBtn: document.getElementById('sub-nav-index-btn'),
    subNavTitle: document.getElementById('sub-nav-title'),
    mukhyaPathTitle: document.getElementById('mukhya-path-title'),
    subYoutubeBtn: document.getElementById('sub-youtube-btn'),
    subCopyBtn: document.getElementById('sub-copy-btn'),
    subFavBtn: document.getElementById('sub-fav-btn'),
    subPrintBtn: document.getElementById('sub-print-btn'),
    
    // Stotra Hero (Legacy fallbacks)
    heroNumber: document.getElementById('hero-number'),
    heroDeity: document.getElementById('hero-deity'),
    heroCategory: document.getElementById('hero-category'),
    heroShlokaCount: document.getElementById('hero-shloka-count'),
    heroSourceLink: document.getElementById('hero-source-link'),
    stotraTitle: document.getElementById('stotra-title'),
    youtubeBtn: document.getElementById('youtube-stotra-btn'),
    copyFullBtn: document.getElementById('copy-full-stotra-btn'),
    favToggleBtn: document.getElementById('fav-toggle-btn'),
    printBtn: document.getElementById('print-stotra-btn'),

    // Quick Jump Links
    jumpIntroPill: document.getElementById('jump-intro-pill'),
    jumpMukhyaPill: document.getElementById('jump-mukhya-pill'),
    jumpVersesPill: document.getElementById('jump-verses-pill'),
    
    // Content Sections
    introSection: document.getElementById('intro-section'),
    introContent: document.getElementById('intro-content'),
    parayanSection: document.getElementById('parayan-section'),
    parayanText: document.getElementById('parayan-text'),
    copyMukhyaBtn: document.getElementById('copy-mukhya-btn'),
    versesHeaderBar: document.getElementById('verses-header-bar'),
    versesSection: document.getElementById('verses-section'),
    notesSection: document.getElementById('notes-section'),
    notesContent: document.getElementById('notes-content'),
    
    // Bottom Nav
    prevStotraCard: document.getElementById('prev-stotra-card'),
    prevStotraTitle: document.getElementById('prev-stotra-title'),
    nextStotraCard: document.getElementById('next-stotra-card'),
    nextStotraTitle: document.getElementById('next-stotra-title'),
    
    // View Mode & Controls
    modeBtns: document.querySelectorAll('.mode-btn'),
    fontDecreaseBtn: document.getElementById('font-decrease-btn'),
    fontIncreaseBtn: document.getElementById('font-increase-btn'),
    fontSizeIndicator: document.getElementById('font-size-indicator'),
    shlokaFontDecBtn: document.getElementById('shloka-font-dec'),
    shlokaFontIncBtn: document.getElementById('shloka-font-inc'),
    shlokaFontVal: document.getElementById('shloka-font-val'),
    shlokaFontAutofitBtn: document.getElementById('shloka-font-autofit'),
    verseFontDecBtn: document.getElementById('verse-font-dec'),
    verseFontIncBtn: document.getElementById('verse-font-inc'),
    verseFontVal: document.getElementById('verse-font-val'),
    verseFontAutofitBtn: document.getElementById('verse-font-autofit'),
    lineWrapToggleBtn: document.getElementById('line-wrap-toggle-btn'),
    lineWrapIcon: document.getElementById('line-wrap-icon'),
    lineWrapCardBtn: document.getElementById('line-wrap-card-btn'),
    themeToggleBtn: document.getElementById('theme-toggle-btn'),
    themeMenu: document.getElementById('theme-menu'),
    currentThemeIcon: document.getElementById('current-theme-icon'),
    themeOptions: document.querySelectorAll('.theme-option'),
    
    // Toast & Top
    toast: document.getElementById('toast-notification'),
    backToTopBtn: document.getElementById('back-to-top-btn')
  };

  // Helper: Format Time
  function formatSeconds(sec) {
    if (isNaN(sec) || sec < 0) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  }

  // Helper: Simple Markdown Formatter
  function parseSimpleMarkdown(text) {
    if (!text) return '';
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/^>\s*(.*?)$/gm, '<blockquote>$1</blockquote>')
      .replace(/\n\n+/g, '</p><p>')
      .replace(/^(.+)$/gm, function (match) {
        if (match.startsWith('<blockquote') || match.startsWith('</blockquote')) return match;
        return match;
      });
  }

  // Show Toast
  function showToast(msg) {
    DOM.toast.textContent = msg;
    DOM.toast.classList.add('show');
    clearTimeout(DOM.toast._timeout);
    DOM.toast._timeout = setTimeout(() => {
      DOM.toast.classList.remove('show');
    }, 2400);
  }

  // Helper: Escape HTML
  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  // Helper: Format Sanskrit Text with Unbroken Lines (अखंड पंक्तियाँ)
  function formatUnbrokenSanskritHtml(rawText) {
    if (!rawText) return '';
    const blocks = rawText.trim().split(/\n\s*\n/);
    return blocks.map(block => {
      const lines = block.split('\n')
        .map(l => l.trim())
        .filter(l => l.length > 0);
      const linesHtml = lines.map(line => `<span class="shloka-line">${escapeHtml(line)}</span>`).join('');
      return `<div class="parayan-shloka-block">${linesHtml}</div>`;
    }).join('');
  }

  // Helper: Enable mouse drag-to-scroll for horizontal text overflow
  function enableDragToScroll(el) {
    if (!el || el._dragScrollAttached) return;
    el._dragScrollAttached = true;
    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;
    let hasMoved = false;

    el.addEventListener('mousedown', (e) => {
      if (state.lineWrap === 'wrap') return;
      if (e.button !== 0) return;
      if (el.scrollWidth <= el.clientWidth + 4) return;
      isDown = true;
      hasMoved = false;
      startX = e.pageX - el.offsetLeft;
      scrollLeft = el.scrollLeft;
    });

    window.addEventListener('mouseup', () => {
      if (!isDown) return;
      isDown = false;
      if (hasMoved) {
        setTimeout(() => {
          if (el) {
            el.style.cursor = '';
            el.style.userSelect = '';
          }
        }, 50);
      } else if (el) {
        el.style.cursor = '';
        el.style.userSelect = '';
      }
    });

    el.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      const x = e.pageX - el.offsetLeft;
      const walk = (x - startX);
      if (Math.abs(walk) > 4) {
        hasMoved = true;
        el.style.cursor = 'grabbing';
        el.style.userSelect = 'none';
        el.scrollLeft = scrollLeft - walk;
      }
    });
  }

  // 16 Deva Khandas Configuration
  const DEITY_KHANDAS = [
    { num: 1, name: 'श्री शिव', count: 40, icon: '🔱', firstId: '1.001', desc: 'रुद्र, ताण्डव, महिम्नः, पञ्चाक्षर, ज्योतिर्लिङ्ग एवं शिव चालीसा' },
    { num: 2, name: 'श्री विष्णु', count: 37, icon: '🪷', firstId: '2.001', desc: 'विष्णुसहस्रनाम, षट्पदी, गजेन्द्रस्तुति, नारायण अष्टक एवं विष्णु चालीसा' },
    { num: 3, name: 'श्री कृष्ण', count: 10, icon: '🪈', firstId: '3.001', desc: 'कृष्णाष्टकम्, मधुराष्टकम्, मुकुन्दमाला, बालमुकुन्द एवं कृष्ण चालीसा' },
    { num: 4, name: 'श्री राम', count: 15, icon: '🏹', firstId: '4.001', desc: 'रामरक्षास्तोत्रम्, रामाष्टकम्, आपदां अपहर्तारम् एवं राम चालीसा' },
    { num: 5, name: 'श्री हनुमान', count: 12, icon: '🚩', firstId: '5.001', desc: 'हनुमान चालीसा, बजरंग बाण, हनुमत्पञ्चरत्नम् एवं हनुमद्वडवानल' },
    { num: 6, name: 'श्री गणेश', count: 17, icon: '🐘', firstId: '6.001', desc: 'गणपति अथर्वशीर्षम्, संकटनाशन, संकटहरण एवं गणेश चालीसा' },
    { num: 7, name: 'श्री देवी / शक्ति', count: 66, icon: '🌸', firstId: '7.001', desc: 'दुर्गासप्तशती, ललिता, महालक्ष्मी, कनकधारा, महिषासुरमर्दिनी व चालीसाएं' },
    { num: 8, name: 'श्री सूर्य', count: 10, icon: '☀️', firstId: '8.001', desc: 'आदित्यहृदयस्तोत्रम्, सूर्याष्टकम्, सूर्यमण्डल एवं सूर्य चालीसा' },
    { num: 9, name: 'श्री नृसिंह', count: 7, icon: '🦁', firstId: '9.001', desc: 'नृसिंहकवचम्, नृसिंहाष्टकम्, प्रह्लाद स्तुति एवं नृसिंह सहस्रनाम' },
    { num: 10, name: 'श्री कार्तिकेय', count: 7, icon: '🦚', firstId: '10.001', desc: 'सुब्रह्मण्य भुजङ्गम्, प्रज्ञाविवर्धन एवं षण्मुख स्तोत्रम्' },
    { num: 11, name: 'श्री दत्तात्रेय', count: 6, icon: '🕉️', firstId: '11.001', desc: 'दत्तात्रेय स्तोत्रम्, अष्टोत्तरशतनामावली एवं वज्रकवचम्' },
    { num: 12, name: 'श्री भैरव', count: 6, icon: '⚔️', firstId: '12.001', desc: 'कालभैरवाष्टकम्, तीक्ष्णदंष्ट्र, बटुक भैरव एवं भैरव चालीसा' },
    { num: 13, name: 'नवग्रह', count: 12, icon: '🪐', firstId: '13.001', desc: 'नवग्रह स्तोत्रम्, शनि चालीसा, नवग्रह कवच, सूर्य-चन्द्रादि स्तुति' },
    { num: 14, name: 'वैदिक सूक्त', count: 14, icon: '📜', firstId: '14.001', desc: 'पुरुष सूक्तम्, श्री सूक्तम्, नासदीय सूक्तम्, हिरण्यगर्भ, मेधा सूक्तम्' },
    { num: 15, name: 'श्री गुरु', count: 2, icon: '🪔', firstId: '15.001', desc: 'गुर्वष्टकम् एवं श्री गुरु चालीसा' },
    { num: 16, name: 'कुबेर', count: 1, icon: '💰', firstId: '16.001', desc: 'कुबेर अष्टोत्तरशतनामावली' }
  ];

  // Render Stotra Catalog on Stuti-Ganga Landing Page
  function renderStutiCatalog(category = 'all', searchQuery = '') {
    const grid = document.getElementById('stuti-stotras-cards-grid');
    if (!grid) return;

    let filtered = state.stotras;
    if (category && category !== 'all') {
      filtered = filtered.filter(s => s.deity === category);
    }
    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      filtered = filtered.filter(s => 
        (s.title && s.title.toLowerCase().includes(q)) ||
        (s.deity && s.deity.toLowerCase().includes(q)) ||
        (s.devanagari_num && s.devanagari_num.includes(q)) ||
        (s.id && s.id.includes(q))
      );
    }

    const countIndicator = document.getElementById('stuti-count-indicator');
    if (countIndicator) {
      countIndicator.textContent = `${toDevanagari(filtered.length)} पावन रचनाएं`;
    }

    const titleEl = document.getElementById('stuti-catalog-title');
    if (titleEl) {
      if (category && category !== 'all') {
        titleEl.textContent = `📖 ${category} — ${toDevanagari(filtered.length)} पावन रचनाएं`;
      } else if (searchQuery) {
        titleEl.textContent = `🔍 खोज परिणाम — ${toDevanagari(filtered.length)} रचनाएं`;
      } else {
        titleEl.textContent = `📖 सम्पूर्ण स्तुति-गंगा — २६२ पावन रचनाएं`;
      }
    }

    grid.innerHTML = '';
    if (filtered.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 40px 20px; background: var(--bg-card); border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
          <div style="font-size: 2.2rem; margin-bottom: 8px;">🔍</div>
          <h4 style="color: var(--accent-gold); margin: 0 0 6px;">कोई रचना नहीं मिली</h4>
          <p style="color: var(--text-muted); margin: 0;">कृपया अन्य शब्द अथवा देवता का नाम खोजें।</p>
        </div>
      `;
      return;
    }

    filtered.forEach(s => {
      const card = document.createElement('div');
      card.className = 'stotra-item-card';
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');
      card.innerHTML = `
        <div class="stotra-card-top">
          <span class="stotra-card-num">${s.devanagari_num}</span>
          <span class="stotra-card-deity">${s.deity || ''}</span>
        </div>
        <h4 class="stotra-card-title">${s.title}</h4>
        <div class="stotra-card-meta">
          <span class="stotra-card-verses">📜 ${toDevanagari(s.shloka_count || s.verses?.length || 0)} श्लोक</span>
          <span class="stotra-card-meaning">✨ हिंदी भावार्थ</span>
        </div>
        <div class="stotra-card-action">
          <span>सम्पूर्ण पाठ खोलें →</span>
        </div>
      `;

      // Direct opening on selection: "sidhe wo sambadhit stotra khule"
      card.addEventListener('click', () => {
        window.location.hash = `#stotra-${s.id}`;
      });

      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          window.location.hash = `#stotra-${s.id}`;
        }
      });

      grid.appendChild(card);
    });
  }

  // Render 16 Deva Khandas on Stuti-Ganga View
  function renderStutiKhandas() {
    const grid = document.getElementById('stuti-khandas-grid');
    if (!grid || grid.children.length > 0) return;

    DEITY_KHANDAS.forEach(k => {
      // Find all stotras belonging to this deity
      const stotrasOfDeity = state.stotras.filter(s => s.deity === k.name);

      const card = document.createElement('div');
      card.className = 'khanda-card';
      card.setAttribute('tabindex', '0');

      let optionsHtml = `<option value="">✨ ${k.name} का स्तोत्र चुनें (${toDevanagari(stotrasOfDeity.length)})...</option>`;
      stotrasOfDeity.forEach(s => {
        optionsHtml += `<option value="${s.id}">${s.devanagari_num} ${s.title}</option>`;
      });

      card.innerHTML = `
        <div class="khanda-card-top">
          <span class="khanda-icon">${k.icon}</span>
          <span class="khanda-tag">खण्ड ${toDevanagari(k.num)}</span>
        </div>
        <h4 class="khanda-name">${k.name}</h4>
        <div class="khanda-count">${toDevanagari(stotrasOfDeity.length || k.count)} पावन रचनाएं</div>
        <p class="khanda-desc">${k.desc}</p>

        <!-- Dropdown to select and directly open a stotra -->
        <div class="khanda-select-wrap" onclick="event.stopPropagation();">
          <select class="khanda-stotra-select" aria-label="${k.name} का स्तोत्र चुनें">
            ${optionsHtml}
          </select>
        </div>

        <div class="khanda-card-bottom-action">
          <span>सभी ${toDevanagari(stotrasOfDeity.length || k.count)} रचनाएं देखें ↓</span>
        </div>
      `;

      // Direct selection from dropdown: "sidhe wo sambadhit stotra khule"
      const selectEl = card.querySelector('.khanda-stotra-select');
      if (selectEl) {
        selectEl.addEventListener('change', (e) => {
          const val = e.target.value;
          if (val) {
            window.location.hash = `#stotra-${val}`;
          }
        });
      }

      // Clicking anywhere on the card filters the stotra catalog to this deity
      card.addEventListener('click', (e) => {
        if (e.target.closest('.khanda-select-wrap')) return;

        state.activeCategory = k.name;
        // Update page pills
        document.querySelectorAll('#stuti-page-pills .pill-btn').forEach(btn => {
          btn.classList.toggle('active', btn.dataset.pageCat === k.name);
        });
        // Update sidebar pills
        document.querySelectorAll('#category-pills .pill-btn').forEach(btn => {
          btn.classList.toggle('active', btn.dataset.cat === k.name);
        });
        renderSidebarList();
        renderStutiCatalog(k.name, '');

        const catalogHeader = document.getElementById('stuti-catalog-header');
        if (catalogHeader) {
          catalogHeader.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });

      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          if (!e.target.closest('.khanda-select-wrap')) {
            e.preventDefault();
            card.click();
          }
        }
      });

      grid.appendChild(card);
    });
  }

  // Alias for backward compatibility
  const renderHomeKhandas = renderStutiKhandas;

  // Show Home View (मुख्य द्वार)
  function showHomeView() {
    state.currentStotra = null;
    document.title = 'श्री सनातन वाङ्मयम् — मुख्य द्वार (अखण्ड डिजिटल ग्रन्थालय)';

    if (DOM.loadingSpinner) DOM.loadingSpinner.style.display = 'none';
    if (DOM.stotraArticle) DOM.stotraArticle.style.display = 'none';
    if (DOM.stutiGangaView) DOM.stutiGangaView.style.display = 'none';
    if (DOM.vedPuranamView) DOM.vedPuranamView.style.display = 'none';
    if (DOM.vedantDarshanamView) DOM.vedantDarshanamView.style.display = 'none';
    if (DOM.homeView) DOM.homeView.style.display = 'block';

    // Sub-Navbar on Home
    if (DOM.subNavTitle) {
      DOM.subNavTitle.textContent = 'श्री सनातन वाङ्मयम् — मुख्य द्वार (Digital Vedic Library)';
      DOM.subNavTitle.title = 'श्री सनातन वाङ्मयम्';
    }

    // Hide stotra-specific action buttons on Home
    const subCopyBtn = document.getElementById('sub-copy-btn');
    const subFavBtn = document.getElementById('sub-fav-btn');
    const subPrintBtn = document.getElementById('sub-print-btn');
    const subYtBtn = document.getElementById('sub-youtube-btn');
    if (subCopyBtn) subCopyBtn.style.display = 'none';
    if (subFavBtn) subFavBtn.style.display = 'none';
    if (subPrintBtn) subPrintBtn.style.display = 'none';
    if (subYtBtn) subYtBtn.style.display = 'none';

    // Active tab in corpus navigation
    DOM.corpusTabs.forEach(t => {
      t.classList.toggle('active', t.dataset.corpus === 'home');
    });

    // Deselect all stotra items in sidebar
    document.querySelectorAll('.stotra-nav-item').forEach(el => el.classList.remove('active'));

    // Collapse sidebar on home page so presentation slides look expansive
    closeSidebar();

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Show Stuti-Ganga View (स्तुति-गंगा समर्पित पृष्ठ)
  function showStutiGangaView() {
    state.currentStotra = null;
    document.title = 'श्री स्तुति-गंगा — १६ शास्त्रीय देव-खण्ड एवं २६२ पावन रचनाएं | श्री सनातन वाङ्मयम्';

    if (DOM.loadingSpinner) DOM.loadingSpinner.style.display = 'none';
    if (DOM.stotraArticle) DOM.stotraArticle.style.display = 'none';
    if (DOM.homeView) DOM.homeView.style.display = 'none';
    if (DOM.vedPuranamView) DOM.vedPuranamView.style.display = 'none';
    if (DOM.vedantDarshanamView) DOM.vedantDarshanamView.style.display = 'none';
    if (DOM.stutiGangaView) DOM.stutiGangaView.style.display = 'block';

    // Sub-Navbar on Stuti-Ganga
    if (DOM.subNavTitle) {
      DOM.subNavTitle.textContent = 'श्री स्तुति-गंगा — १६ देव-खण्ड एवं २६२ पावन रचनाएं (Stuti-Ganga)';
      DOM.subNavTitle.title = 'श्री स्तुति-गंगा';
    }

    // Hide stotra-specific action buttons
    const subCopyBtn = document.getElementById('sub-copy-btn');
    const subFavBtn = document.getElementById('sub-fav-btn');
    const subPrintBtn = document.getElementById('sub-print-btn');
    const subYtBtn = document.getElementById('sub-youtube-btn');
    if (subCopyBtn) subCopyBtn.style.display = 'none';
    if (subFavBtn) subFavBtn.style.display = 'none';
    if (subPrintBtn) subPrintBtn.style.display = 'none';
    if (subYtBtn) subYtBtn.style.display = 'none';

    // Active tab in corpus navigation
    DOM.corpusTabs.forEach(t => {
      t.classList.toggle('active', t.dataset.corpus === 'stuti_ganga');
    });

    // Deselect all stotra items in sidebar
    document.querySelectorAll('.stotra-nav-item').forEach(el => el.classList.remove('active'));

    // Render 16 Deva Khandas
    renderStutiKhandas();

    // Sync active category pill on Stuti-Ganga page
    if (DOM.stutiPagePills) {
      DOM.stutiPagePills.querySelectorAll('.pill-btn').forEach(b => {
        b.classList.toggle('active', (b.dataset.pageCat || 'all') === (state.activeCategory || 'all'));
      });
    }

    // Render Stotra Catalog
    renderStutiCatalog(state.activeCategory || 'all', DOM.stutiSearchInput ? DOM.stutiSearchInput.value : '');

    // Automatically open sidebar containing the stotra list!
    openSidebar();

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Show Ved-Puranam View (वेद-पुराणम् समर्पित पृष्ठ)
  function showVedPuranamView() {
    state.currentStotra = null;
    document.title = 'श्री वेद-पुराणम् — चतुर्वेद एवं २६ पुराण, उपपुराण व इतिहास ग्रन्थालय | श्री सनातन वाङ्मयम्';

    if (DOM.loadingSpinner) DOM.loadingSpinner.style.display = 'none';
    if (DOM.stotraArticle) DOM.stotraArticle.style.display = 'none';
    if (DOM.homeView) DOM.homeView.style.display = 'none';
    if (DOM.stutiGangaView) DOM.stutiGangaView.style.display = 'none';
    if (DOM.vedantDarshanamView) DOM.vedantDarshanamView.style.display = 'none';
    if (DOM.vedPuranamView) DOM.vedPuranamView.style.display = 'block';

    // Sub-Navbar on Ved-Puranam
    if (DOM.subNavTitle) {
      DOM.subNavTitle.textContent = 'श्री वेद-पुराणम् — चतुर्वेद एवं २६ पुराण, उपपुराण व इतिहास ग्रन्थ (Vedas & Puranas)';
      DOM.subNavTitle.title = 'श्री वेद-पुराणम्';
    }

    // Hide stotra-specific action buttons
    const subCopyBtn = document.getElementById('sub-copy-btn');
    const subFavBtn = document.getElementById('sub-fav-btn');
    const subPrintBtn = document.getElementById('sub-print-btn');
    const subYtBtn = document.getElementById('sub-youtube-btn');
    if (subCopyBtn) subCopyBtn.style.display = 'none';
    if (subFavBtn) subFavBtn.style.display = 'none';
    if (subPrintBtn) subPrintBtn.style.display = 'none';
    if (subYtBtn) subYtBtn.style.display = 'none';

    // Active tab in corpus navigation
    DOM.corpusTabs.forEach(t => {
      t.classList.toggle('active', t.dataset.corpus === 'ved_puranam');
    });

    // Deselect all stotra items in sidebar
    document.querySelectorAll('.stotra-nav-item').forEach(el => el.classList.remove('active'));

    // Render Vedas & Puranas content
    renderVedasAndPuranas(DOM.puranaSearchInput ? DOM.puranaSearchInput.value : '');

    closeSidebar();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Show Vedant-Darshanam View (वेदान्त-दर्शनम् समर्पित पृष्ठ)
  function showVedantDarshanamView() {
    state.currentStotra = null;
    document.title = 'श्री वेदान्त-दर्शनम् — प्रस्थानत्रयी, उपनिषद एवं षड्दर्शन | श्री सनातन वाङ्मयम्';

    if (DOM.loadingSpinner) DOM.loadingSpinner.style.display = 'none';
    if (DOM.stotraArticle) DOM.stotraArticle.style.display = 'none';
    if (DOM.homeView) DOM.homeView.style.display = 'none';
    if (DOM.stutiGangaView) DOM.stutiGangaView.style.display = 'none';
    if (DOM.vedPuranamView) DOM.vedPuranamView.style.display = 'none';
    if (DOM.vedantDarshanamView) DOM.vedantDarshanamView.style.display = 'block';

    // Sub-Navbar on Vedant-Darshanam
    if (DOM.subNavTitle) {
      DOM.subNavTitle.textContent = 'श्री वेदान्त-दर्शनम् — प्रस्थानत्रयी, उपनिषद एवं षड्दर्शन (Vedanta & Philosophy)';
      DOM.subNavTitle.title = 'श्री वेदान्त-दर्शनम्';
    }

    // Hide stotra-specific action buttons
    const subCopyBtn = document.getElementById('sub-copy-btn');
    const subFavBtn = document.getElementById('sub-fav-btn');
    const subPrintBtn = document.getElementById('sub-print-btn');
    const subYtBtn = document.getElementById('sub-youtube-btn');
    if (subCopyBtn) subCopyBtn.style.display = 'none';
    if (subFavBtn) subFavBtn.style.display = 'none';
    if (subPrintBtn) subPrintBtn.style.display = 'none';
    if (subYtBtn) subYtBtn.style.display = 'none';

    // Active tab in corpus navigation
    DOM.corpusTabs.forEach(t => {
      t.classList.toggle('active', t.dataset.corpus === 'vedant_darshanam');
    });

    // Deselect all stotra items in sidebar
    document.querySelectorAll('.stotra-nav-item').forEach(el => el.classList.remove('active'));

    // Render Vedanta & Darshanas content
    renderVedantaAndDarshanas(DOM.darshanSearchInput ? DOM.darshanSearchInput.value : '');

    closeSidebar();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Routing Handler (Home vs Stuti-Ganga vs Ved-Puranam vs Vedant-Darshanam vs Stotra)
  function handleRoute() {
    const hash = window.location.hash || '';
    if (!hash || hash === '#' || hash === '#home') {
      showHomeView();
    } else if (hash === '#stuti-ganga' || hash === '#stuti_ganga') {
      showStutiGangaView();
    } else if (hash === '#ved-puranam') {
      showVedPuranamView();
    } else if (hash === '#vedant-darshanam') {
      showVedantDarshanamView();
    } else if (hash.startsWith('#stotra-')) {
      const id = hash.replace('#stotra-', '');
      let target = state.stotras.find(s => s.id === id || s.legacy_id === id || s.legacy_id === id.padStart(3, '0'));
      if (!target) {
        if (id === '038' || id === '039' || id === '040') target = state.stotras.find(s => s.id === '1.038');
        else if (id === '041') target = state.stotras.find(s => s.id === '1.039');
      }
      if (target) {
        loadStotra(target.id, false);
      } else {
        showHomeView();
      }
    } else {
      showHomeView();
    }
  }

  // Initialize App
  async function init() {
    applyTheme(state.theme);
    applyFontScale(state.fontScale);
    applyShlokaFontScale(state.shlokaFontScale);
    applyViewMode(state.viewMode);
    applyLineWrap(state.lineWrap);

    try {
      if (window.STOTRAS_DATA && Array.isArray(window.STOTRAS_DATA) && window.STOTRAS_DATA.length > 0) {
        state.stotras = window.STOTRAS_DATA;
      } else {
        const resp = await fetch('data/stotras.json');
        if (!resp.ok) throw new Error('Failed to load stotras.json');
        state.stotras = await resp.json();
      }

      // Hide loading spinner
      if (DOM.loadingSpinner) DOM.loadingSpinner.style.display = 'none';

      // Render Sidebar
      renderSidebarList();

      // Render Home 16 Deva Khandas
      renderHomeKhandas();

      // Handle Route (Home View vs Stotra)
      handleRoute();

      // Listen for Hash Changes (Browser Back / Forward navigation)
      window.addEventListener('hashchange', handleRoute);

      // Responsive sidebar close on smaller screens
      if (window.innerWidth <= 1200) {
        closeSidebar();
      }
      autoFitShlokaLines();
    } catch (err) {
      console.error(err);
      if (DOM.loadingSpinner) {
        DOM.loadingSpinner.innerHTML = `
          <div style="color: var(--accent-vermilion); font-size: 2rem;">⚠️</div>
          <p>पावन स्तोत्र-संग्रह लोड करने में विलंब। कृपया पृष्ठ को पुनः लोड करें।</p>
        `;
      }
    }

    // Set up event listeners safely AFTER data and view are hydrated
    setupEventListeners();
  }

  // Devanagari Number Helper
  const DEVANAGARI_DIGITS = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
  function toDevanagari(n, pad = 1) {
    const s = String(n).padStart(pad, '0');
    return s.split('').map(c => DEVANAGARI_DIGITS[parseInt(c, 10)] || c).join('');
  }

  // Render Sidebar List
  function renderSidebarList() {
    const list = DOM.stotraList;
    list.innerHTML = '';

    const query = state.searchQuery.toLowerCase().trim();
    const filtered = state.stotras.filter(s => {
      // Category / Deity filter
      if (state.activeCategory === 'fav' && !state.favorites.has(s.id)) return false;
      if (state.activeCategory !== 'all' && state.activeCategory !== 'fav') {
        if (s.category !== state.activeCategory && s.deity !== state.activeCategory) return false;
      }

      // Search Query
      if (query) {
        const titleMatch = s.title.toLowerCase().includes(query);
        const deityMatch = s.deity && s.deity.toLowerCase().includes(query);
        const idMatch = s.id.includes(query) || s.devanagari_num.includes(query) || (s.legacy_id && s.legacy_id.includes(query));
        const sanskritMatch = s.full_sanskrit && s.full_sanskrit.toLowerCase().includes(query);
        const meaningMatch = s.verses && s.verses.some(v => v.meaning && v.meaning.toLowerCase().includes(query));
        return titleMatch || deityMatch || idMatch || sanskritMatch || meaningMatch;
      }
      return true;
    });

    if (DOM.sidebarCountBadge) {
      DOM.sidebarCountBadge.textContent = `${filtered.length} रचनाएं`;
    }

    let lastSection = null;
    const showSections = state.activeCategory === 'all' && !query;
    const deityIcons = {
      'श्री शिव': '🔱',
      'श्री विष्णु': '🪷',
      'श्री कृष्ण': '🪈',
      'श्री राम': '🏹',
      'श्री हनुमान': '🚩',
      'श्री गणेश': '🐘',
      'श्री देवी / शक्ति': '🌸',
      'श्री सूर्य': '☀️',
      'श्री नृसिंह': '🦁',
      'श्री कार्तिकेय': '🦚',
      'श्री दत्तात्रेय': '🕉️',
      'श्री भैरव': '⚔️',
      'नवग्रह': '🪐',
      'वैदिक सूक्त': '📜',
      'श्री गुरु': '🪔',
      'कुबेर': '💰'
    };

    filtered.forEach(s => {
      if (showSections && s.section_num && s.section_num !== lastSection) {
        lastSection = s.section_num;
        const icon = deityIcons[s.deity] || '🕉️';
        const sectionStotras = state.stotras.filter(x => x.section_num === s.section_num);
        const count = sectionStotras.length;
        const divider = document.createElement('div');
        divider.className = 'sidebar-section-divider';
        divider.innerHTML = `<span class="section-icon">${icon}</span> <span class="section-title">खण्ड ${toDevanagari(s.section_num)}: ${s.deity} (${toDevanagari(count)} रचनाएं)</span>`;
        list.appendChild(divider);
      }

      const item = document.createElement('a');
      item.className = `stotra-nav-item ${state.currentStotra && state.currentStotra.id === s.id ? 'active' : ''}`;
      item.href = `#stotra-${s.id}`;
      item.dataset.id = s.id;

      const hasYoutube = Boolean(s.youtube_url);
      const isFav = state.favorites.has(s.id);

      const countLabel = String(s.shloka_count).includes('श्लोक') || String(s.shloka_count).includes('अनुवाक') || String(s.shloka_count).includes('मार्गदर्शक')
        ? s.shloka_count
        : `कुल ${s.shloka_count} श्लोक`;

      item.innerHTML = `
        <div class="nav-item-left">
          <span class="nav-item-num">${s.devanagari_num}</span>
          <span class="nav-item-title">${s.title}</span>
        </div>
        <div class="nav-item-right">
          ${hasYoutube ? '<span class="nav-item-youtube-dot" title="यूट्यूब पाठ उपलब्ध">▶️</span>' : ''}
          ${isFav ? '<span style="color: var(--accent-gold); font-size: 0.8rem;">⭐</span>' : ''}
          <span class="nav-item-badge">${countLabel}</span>
        </div>
      `;

      item.addEventListener('click', (e) => {
        e.preventDefault();
        loadStotra(s.id, true);
        if (window.innerWidth <= 1200) {
          closeSidebar();
        }
      });

      list.appendChild(item);
    });
  }

  // Load and Render Stotra
  function loadStotra(id, updateHistory = true) {
    let stotra = state.stotras.find(s => s.id === id || s.legacy_id === id);
    if (!stotra) {
      if (id === '038' || id === '039' || id === '040') {
        stotra = state.stotras.find(s => s.id === '1.038');
      } else if (id === '041') {
        stotra = state.stotras.find(s => s.id === '1.039');
      }
    }
    if (!stotra) return;

    if (DOM.homeView) DOM.homeView.style.display = 'none';
    if (DOM.stutiGangaView) DOM.stutiGangaView.style.display = 'none';
    if (DOM.vedPuranamView) DOM.vedPuranamView.style.display = 'none';
    if (DOM.vedantDarshanamView) DOM.vedantDarshanamView.style.display = 'none';
    if (DOM.stotraArticle) DOM.stotraArticle.style.display = 'block';

    // Show subnavbar action buttons
    const subCopyBtn = document.getElementById('sub-copy-btn');
    const subFavBtn = document.getElementById('sub-fav-btn');
    const subPrintBtn = document.getElementById('sub-print-btn');
    if (subCopyBtn) subCopyBtn.style.display = 'inline-flex';
    if (subFavBtn) subFavBtn.style.display = 'inline-flex';
    if (subPrintBtn) subPrintBtn.style.display = 'inline-flex';

    // Active tab in corpus navigation
    DOM.corpusTabs.forEach(t => {
      t.classList.toggle('active', t.dataset.corpus === 'stuti_ganga');
    });

    state.currentStotra = stotra;
    if (updateHistory) {
      history.pushState(null, '', `#stotra-${stotra.id}`);
    }

    // Update Document Title
    document.title = `${stotra.devanagari_num}. ${stotra.title} — श्री वाङ्मयम्`;

    // Highlight in sidebar
    document.querySelectorAll('.stotra-nav-item').forEach(el => {
      el.classList.toggle('active', el.dataset.id === stotra.id);
    });

    // Format Display Title for Sub-Navbar (e.g. "१.००१ श्री शिव नमामि स्तोत्रम् (कुल 12 श्लोक)")
    let countStr = '';
    if (stotra.shloka_count && stotra.shloka_count !== '0') {
      const isCustomText = String(stotra.shloka_count).includes('श्लोक') || String(stotra.shloka_count).includes('अनुवाक') || String(stotra.shloka_count).includes('मार्गदर्शक');
      countStr = ` (कुल ${stotra.shloka_count}${isCustomText ? '' : ' श्लोक'})`;
    }
    const displayTitle = `${stotra.devanagari_num} ${stotra.title}${countStr}`;

    // Sub-Navbar Title (Directly above the reading content)
    if (DOM.subNavTitle) {
      DOM.subNavTitle.textContent = displayTitle;
      DOM.subNavTitle.title = displayTitle;
    }

    // Stotra Recitation Header (Directly above the stotra recitation text)
    if (DOM.mukhyaPathTitle) {
      DOM.mukhyaPathTitle.textContent = displayTitle;
      DOM.mukhyaPathTitle.title = displayTitle;
    }

    // Sub-Navbar YouTube Link
    if (DOM.subYoutubeBtn) {
      if (stotra.youtube_url) {
        DOM.subYoutubeBtn.href = stotra.youtube_url;
        DOM.subYoutubeBtn.style.display = 'inline-flex';
      } else {
        DOM.subYoutubeBtn.style.display = 'none';
      }
    }

    const formattedShlokaCount = String(stotra.shloka_count).includes('श्लोक') || String(stotra.shloka_count).includes('अनुवाक') || String(stotra.shloka_count).includes('मार्गदर्शक')
      ? stotra.shloka_count
      : `कुल ${stotra.shloka_count} श्लोक`;

    // Safe fallbacks for legacy hero (if present)
    if (DOM.heroNumber) DOM.heroNumber.textContent = stotra.devanagari_num;
    if (DOM.heroDeity) DOM.heroDeity.textContent = stotra.deity || 'सनातन';
    if (DOM.heroCategory) DOM.heroCategory.textContent = stotra.category;
    if (DOM.heroShlokaCount) DOM.heroShlokaCount.textContent = formattedShlokaCount;
    if (DOM.stotraTitle) DOM.stotraTitle.textContent = stotra.title;
    if (DOM.heroSourceLink) {
      if (stotra.source_url) {
        DOM.heroSourceLink.innerHTML = `<a href="${stotra.source_url}" target="_blank" rel="noopener">मूल संदर्भ ↗</a>`;
        DOM.heroSourceLink.style.display = 'inline-block';
      } else {
        DOM.heroSourceLink.style.display = 'none';
      }
    }

    if (DOM.youtubeBtn) {
      if (stotra.youtube_url) {
        DOM.youtubeBtn.href = stotra.youtube_url;
        DOM.youtubeBtn.style.display = 'inline-flex';
      } else {
        DOM.youtubeBtn.style.display = 'none';
      }
    }

    // Favorite Button state
    updateFavButton();

    // Intro Section
    if (stotra.intro) {
      DOM.introContent.innerHTML = `<p>${parseSimpleMarkdown(stotra.intro)}</p>`;
      DOM.introSection.style.display = 'block';
    } else {
      DOM.introSection.style.display = 'none';
    }

    // Parayan / Mukhya Path Section
    if (stotra.full_sanskrit && stotra.full_sanskrit.trim()) {
      DOM.parayanText.innerHTML = formatUnbrokenSanskritHtml(stotra.full_sanskrit);
    } else if (stotra.verses && stotra.verses.length > 0) {
      DOM.parayanText.innerHTML = formatUnbrokenSanskritHtml(stotra.verses.map(v => v.sanskrit).join('\n\n'));
    } else {
      DOM.parayanText.innerHTML = '<p class="mukhya-path-notice">मुख्य पाठ उपलब्ध नहीं है।</p>';
    }

    // Verses Section (Study Mode)
    DOM.versesSection.innerHTML = '';
    if (stotra.verses && stotra.verses.length > 0) {
      stotra.verses.forEach(v => {
        const card = document.createElement('div');
        card.className = 'verse-card';
        card.innerHTML = `
          <div class="verse-top-bar">
            <span class="verse-number-tag">${v.label.startsWith('श्लोक') || v.label.startsWith('पद') || v.label.startsWith('अनुवाक') || v.label.startsWith('चौपाई') || v.label.startsWith('दोहा') || v.label.startsWith('प्रारम्भिक') || v.label.startsWith('समापन') ? v.label : `श्लोक ${v.label}`}</span>
            <button class="verse-copy-btn" title="यह श्लोक कॉपी करें">📋 कॉपी</button>
          </div>
          <div class="verse-sanskrit-box">${formatUnbrokenSanskritHtml(v.sanskrit)}</div>
          ${v.meaning ? `<div class="verse-meaning-box"><span class="meaning-lead">भावार्थ:</span> ${escapeHtml(v.meaning)}</div>` : ''}
        `;

        card.querySelector('.verse-copy-btn').addEventListener('click', () => {
          const copyText = `${v.sanskrit}\n\nभावार्थ: ${v.meaning || ''}\n— ${stotra.title}`;
          navigator.clipboard.writeText(copyText).then(() => {
            showToast('श्लोक कॉपी हो गया!');
          });
        });

        DOM.versesSection.appendChild(card);
      });
    }

    // Notes / Variants
    if (stotra.variants) {
      DOM.notesContent.innerHTML = `<p>${parseSimpleMarkdown(stotra.variants)}</p>`;
      DOM.notesSection.style.display = 'block';
    } else {
      DOM.notesSection.style.display = 'none';
    }

    // Bottom Navigation (Prev / Next)
    const currentIndex = state.stotras.findIndex(s => s.id === stotra.id);
    if (currentIndex > 0) {
      const prev = state.stotras[currentIndex - 1];
      DOM.prevStotraTitle.textContent = `${prev.devanagari_num}. ${prev.title}`;
      DOM.prevStotraCard.style.visibility = 'visible';
      DOM.prevStotraCard.onclick = () => loadStotra(prev.id);
    } else {
      DOM.prevStotraCard.style.visibility = 'hidden';
    }

    if (currentIndex < state.stotras.length - 1) {
      const next = state.stotras[currentIndex + 1];
      DOM.nextStotraTitle.textContent = `${next.devanagari_num}. ${next.title}`;
      DOM.nextStotraCard.style.visibility = 'visible';
      DOM.nextStotraCard.onclick = () => loadStotra(next.id);
    } else {
      DOM.nextStotraCard.style.visibility = 'hidden';
    }

    // Ensure sections match current viewMode (All, Parayan, Study)
    applyViewMode(state.viewMode);

    // Auto-fit font size to container width so shlokas never break
    autoFitShlokaLines();

    // Enable drag-to-scroll on parayan text and verse boxes
    if (DOM.parayanText) enableDragToScroll(DOM.parayanText);
    document.querySelectorAll('.verse-sanskrit-box').forEach(enableDragToScroll);

    // Scroll to Top smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Favorite Button
  function updateFavButton() {
    if (!state.currentStotra) return;
    const isFav = state.favorites.has(state.currentStotra.id);
    if (DOM.subFavBtn) {
      DOM.subFavBtn.textContent = isFav ? '⭐' : '☆';
      DOM.subFavBtn.title = isFav ? 'पसंदीदा से हटाएं' : 'पसंदीदा में जोड़ें';
      DOM.subFavBtn.classList.toggle('active', isFav);
    }
    if (DOM.favToggleBtn) {
      const icon = DOM.favToggleBtn.querySelector('.btn-icon');
      const label = DOM.favToggleBtn.querySelector('span:last-child');
      if (icon) icon.textContent = isFav ? '⭐' : '☆';
      if (label) label.textContent = isFav ? 'पसंदीदा में है' : 'पसंदीदा';
    }
  }

  // Event Listeners
  function setupEventListeners() {
    // Sidebar Toggle
    if (DOM.sidebarToggleBtn) DOM.sidebarToggleBtn.addEventListener('click', toggleSidebar);
    if (DOM.sidebarBackdrop) DOM.sidebarBackdrop.addEventListener('click', closeSidebar);

    // Global Search (if element exists)
    if (DOM.globalSearchInput) {
      DOM.globalSearchInput.addEventListener('input', (e) => {
        state.searchQuery = e.target.value;
        renderSidebarList();
      });
    }

    // Category Filter Pills
    if (DOM.categoryPills) {
      DOM.categoryPills.addEventListener('click', (e) => {
        const btn = e.target.closest('.pill-btn');
        if (!btn) return;
        DOM.categoryPills.querySelectorAll('.pill-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.activeCategory = btn.dataset.cat;
        renderSidebarList();

        // Also sync Stuti-Ganga page pills and catalog if on Stuti-Ganga view
        if (DOM.stutiPagePills) {
          DOM.stutiPagePills.querySelectorAll('.pill-btn').forEach(b => {
            b.classList.toggle('active', (b.dataset.pageCat || 'all') === state.activeCategory);
          });
          const query = DOM.stutiSearchInput ? DOM.stutiSearchInput.value : '';
          renderStutiCatalog(state.activeCategory, query);
        }
      });
    }

    // View Mode Switcher
    if (DOM.modeBtns) {
      DOM.modeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          applyViewMode(btn.dataset.mode);
        });
      });
    }

    // Font Controls
    if (DOM.fontDecreaseBtn) DOM.fontDecreaseBtn.addEventListener('click', () => changeFontScale(-0.06));
    if (DOM.fontIncreaseBtn) DOM.fontIncreaseBtn.addEventListener('click', () => changeFontScale(0.06));

    // Shloka Specific Font Steppers (Card, Verses)
    if (DOM.shlokaFontDecBtn) DOM.shlokaFontDecBtn.addEventListener('click', () => changeShlokaFontScale(-0.08));
    if (DOM.shlokaFontIncBtn) DOM.shlokaFontIncBtn.addEventListener('click', () => changeShlokaFontScale(0.08));
    if (DOM.shlokaFontAutofitBtn) DOM.shlokaFontAutofitBtn.addEventListener('click', resetToAutoFit);

    if (DOM.verseFontDecBtn) DOM.verseFontDecBtn.addEventListener('click', () => changeShlokaFontScale(-0.08));
    if (DOM.verseFontIncBtn) DOM.verseFontIncBtn.addEventListener('click', () => changeShlokaFontScale(0.08));
    if (DOM.verseFontAutofitBtn) DOM.verseFontAutofitBtn.addEventListener('click', resetToAutoFit);

    // Window Resize Auto-fitting
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        autoFitShlokaLines();
      }, 80);
    });

    // Theme Toggle Menu
    if (DOM.themeToggleBtn) {
      DOM.themeToggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (DOM.themeMenu) DOM.themeMenu.classList.toggle('open');
      });
    }

    document.addEventListener('click', () => {
      if (DOM.themeMenu) DOM.themeMenu.classList.remove('open');
    });

    if (DOM.themeOptions) {
      DOM.themeOptions.forEach(opt => {
        opt.addEventListener('click', () => {
          applyTheme(opt.dataset.setTheme);
        });
      });
    }

    // Copy Full Stotra (Sub-Navbar & Legacy)
    const copyFullStotraAction = () => {
      if (!state.currentStotra) return;
      const s = state.currentStotra;
      let text = `# ${s.title}\n\n`;
      if (s.full_sanskrit) {
        text += s.full_sanskrit + '\n\n';
      }
      if (s.verses && s.verses.length > 0) {
        text += s.verses.map(v => `${v.sanskrit}\nभावार्थ: ${v.meaning || ''}`).join('\n\n');
      }
      navigator.clipboard.writeText(text).then(() => {
        showToast('सम्पूर्ण स्तोत्र कॉपी हो गया!');
      });
    };

    if (DOM.subCopyBtn) DOM.subCopyBtn.addEventListener('click', copyFullStotraAction);
    if (DOM.copyFullBtn) DOM.copyFullBtn.addEventListener('click', copyFullStotraAction);

    // Copy Mukhya Path Only
    if (DOM.copyMukhyaBtn) {
      DOM.copyMukhyaBtn.addEventListener('click', () => {
        if (!state.currentStotra) return;
        const s = state.currentStotra;
        const text = s.full_sanskrit || (s.verses || []).map(v => v.sanskrit).join('\n\n');
        if (text) {
          navigator.clipboard.writeText(text).then(() => {
            showToast('मुख्य स्तोत्र पाठ कॉपी हो गया!');
          });
        }
      });
    }

    // Sub-Navbar Index Button (अनुक्रमणिका।   244। स्तोत्र)
    if (DOM.subNavIndexBtn) {
      DOM.subNavIndexBtn.addEventListener('click', toggleSidebar);
    }

    // Quick Jump Links (Legacy)
    if (DOM.jumpMukhyaPill) {
      DOM.jumpMukhyaPill.addEventListener('click', (e) => {
        e.preventDefault();
        if (state.viewMode === 'study') {
          applyViewMode('all');
        }
        DOM.parayanSection.scrollIntoView({ behavior: 'smooth' });
      });
    }

    if (DOM.jumpVersesPill) {
      DOM.jumpVersesPill.addEventListener('click', (e) => {
        e.preventDefault();
        if (state.viewMode === 'parayan') {
          applyViewMode('all');
        }
        (DOM.versesHeaderBar || DOM.versesSection).scrollIntoView({ behavior: 'smooth' });
      });
    }

    if (DOM.jumpIntroPill) {
      DOM.jumpIntroPill.addEventListener('click', (e) => {
        e.preventDefault();
        DOM.introSection.scrollIntoView({ behavior: 'smooth' });
      });
    }

    // Line Wrap Mode Toggle Listeners
    if (DOM.lineWrapToggleBtn) {
      DOM.lineWrapToggleBtn.addEventListener('click', toggleLineWrap);
    }
    if (DOM.lineWrapCardBtn) {
      DOM.lineWrapCardBtn.addEventListener('click', toggleLineWrap);
    }

    // Favorite Toggle (Sub-Navbar & Legacy)
    const toggleFavAction = () => {
      if (!state.currentStotra) return;
      const id = state.currentStotra.id;
      if (state.favorites.has(id)) {
        state.favorites.delete(id);
        showToast('पसंदीदा से हटाया गया');
      } else {
        state.favorites.add(id);
        showToast('पसंदीदा में जोड़ा गया!');
      }
      localStorage.setItem('shri_favorites', JSON.stringify([...state.favorites]));
      updateFavButton();
      renderSidebarList();
    };

    if (DOM.subFavBtn) DOM.subFavBtn.addEventListener('click', toggleFavAction);
    if (DOM.favToggleBtn) DOM.favToggleBtn.addEventListener('click', toggleFavAction);

    // Print Button (Sub-Navbar & Legacy)
    if (DOM.subPrintBtn) DOM.subPrintBtn.addEventListener('click', () => window.print());
    if (DOM.printBtn) DOM.printBtn.addEventListener('click', () => window.print());

    // Brand Logo & Sub-Navbar Home Button
    if (DOM.brandIdentityBtn) {
      DOM.brandIdentityBtn.addEventListener('click', () => {
        window.location.hash = '#home';
      });
      DOM.brandIdentityBtn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          window.location.hash = '#home';
        }
      });
    }

    if (DOM.subHomeBtn) {
      DOM.subHomeBtn.addEventListener('click', () => {
        window.location.hash = '#home';
      });
    }

    // Corpus Tabs Navigation (त्रिपक्षीय स्तम्भ: मुख्य द्वार, स्तुति-गंगा, वेद-पुराणम्, वेदान्त-दर्शनम्)
    DOM.corpusTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const corpus = tab.dataset.corpus;
        DOM.corpusTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        if (corpus === 'home') {
          window.location.hash = '#home';
        } else if (corpus === 'stuti_ganga') {
          showToast('🌊 स्तुति-गंगा: २६२ पावन स्तोत्र, चालीसा एवं स्तुति संग्रह');
          window.location.hash = '#stuti-ganga';
          openSidebar();
        } else if (corpus === 'ved_puranam') {
          showToast('🏛️ वेद-पुराणम्: चतुर्वेद एवं २६ पावन पुराण ग्रन्थालय');
          window.location.hash = '#ved-puranam';
        } else if (corpus === 'vedant_darshanam') {
          showToast('🪔 वेदान्त-दर्शनम्: प्रस्थानत्रयी, उपनिषद एवं षड्दर्शन संग्रह');
          window.location.hash = '#vedant-darshanam';
        }
      });
    });

    // 3 PPT-Style Presentation Slide CTA Buttons
    const slideEnterStutiBtn = document.getElementById('slide-enter-stuti-btn');
    if (slideEnterStutiBtn) {
      slideEnterStutiBtn.addEventListener('click', () => {
        window.location.hash = '#stuti-ganga';
        openSidebar();
      });
    }

    const slideOpenVedpuranBtn = document.getElementById('slide-open-vedpuran-btn');
    if (slideOpenVedpuranBtn) {
      slideOpenVedpuranBtn.addEventListener('click', () => {
        window.location.hash = '#ved-puranam';
      });
    }

    const slideOpenVedantBtn = document.getElementById('slide-open-vedant-btn');
    if (slideOpenVedantBtn) {
      slideOpenVedantBtn.addEventListener('click', () => {
        window.location.hash = '#vedant-darshanam';
      });
    }

    // Slide Card Click Handlers (allow clicking anywhere on the slide card)
    const pillarSlideStuti = document.getElementById('pillar-slide-stuti');
    if (pillarSlideStuti) {
      pillarSlideStuti.addEventListener('click', (e) => {
        if (!e.target.closest('button')) {
          window.location.hash = '#stuti-ganga';
          openSidebar();
        }
      });
    }

    const pillarSlidePuran = document.getElementById('pillar-slide-puran');
    if (pillarSlidePuran) {
      pillarSlidePuran.addEventListener('click', (e) => {
        if (!e.target.closest('button')) {
          window.location.hash = '#ved-puranam';
        }
      });
    }

    const pillarSlideDarshan = document.getElementById('pillar-slide-darshan');
    if (pillarSlideDarshan) {
      pillarSlideDarshan.addEventListener('click', (e) => {
        if (!e.target.closest('button')) {
          window.location.hash = '#vedant-darshanam';
        }
      });
    }

    // Live Search Filter for Dedicated Stuti-Ganga Page
    if (DOM.stutiSearchInput) {
      DOM.stutiSearchInput.addEventListener('input', (e) => {
        const query = e.target.value;
        if (query && query.trim() && state.activeCategory !== 'all') {
          // If searching with text, reset category to 'all' so user finds matches across all deities
          state.activeCategory = 'all';
          if (DOM.stutiPagePills) {
            DOM.stutiPagePills.querySelectorAll('.pill-btn').forEach(b => {
              b.classList.toggle('active', (b.dataset.pageCat || 'all') === 'all');
            });
          }
          if (DOM.categoryPills) {
            DOM.categoryPills.querySelectorAll('.pill-btn').forEach(b => {
              b.classList.toggle('active', (b.dataset.cat || 'all') === 'all');
            });
            renderSidebarList();
          }
        }
        renderStutiCatalog(state.activeCategory, query);
      });
    }

    // Category Filter Pills on Dedicated Stuti-Ganga Page
    if (DOM.stutiPagePills) {
      DOM.stutiPagePills.addEventListener('click', (e) => {
        const btn = e.target.closest('.pill-btn');
        if (!btn) return;
        DOM.stutiPagePills.querySelectorAll('.pill-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.activeCategory = btn.dataset.pageCat || 'all';

        // Also sync sidebar category pills if available
        if (DOM.categoryPills) {
          DOM.categoryPills.querySelectorAll('.pill-btn').forEach(b => {
            b.classList.toggle('active', (b.dataset.cat || 'all') === state.activeCategory);
          });
          renderSidebarList();
        }

        const query = DOM.stutiSearchInput ? DOM.stutiSearchInput.value : '';
        renderStutiCatalog(state.activeCategory, query);
      });
    }

    // Live Search Filter for Dedicated Ved-Puranam Page
    if (DOM.puranaSearchInput) {
      DOM.puranaSearchInput.addEventListener('input', (e) => {
        renderVedasAndPuranas(e.target.value);
      });
    }

    // Live Search Filter for Dedicated Vedant-Darshanam Page
    if (DOM.darshanSearchInput) {
      DOM.darshanSearchInput.addEventListener('input', (e) => {
        renderVedantaAndDarshanas(e.target.value);
      });
    }

    // ScrollSpy for Sub-Navbar Section Pills
    window.addEventListener('scroll', () => {
      if (!state.currentStotra) return;
      const scrollPos = window.scrollY + 140;
      const introTop = (DOM.introSection && DOM.introSection.style.display !== 'none') ? DOM.introSection.offsetTop : -1;
      const parayanTop = DOM.parayanSection ? DOM.parayanSection.offsetTop : -1;
      const versesTarget = DOM.versesHeaderBar || DOM.versesSection;
      const versesTop = versesTarget ? versesTarget.offsetTop : -1;

      if (versesTop > 0 && scrollPos >= versesTop) {
        if (DOM.subBhavarthPill) DOM.subBhavarthPill.classList.add('active');
        if (DOM.subMukhyaPill) DOM.subMukhyaPill.classList.remove('active');
        if (DOM.subIntroPill) DOM.subIntroPill.classList.remove('active');
      } else if (parayanTop > 0 && scrollPos >= parayanTop) {
        if (DOM.subMukhyaPill) DOM.subMukhyaPill.classList.add('active');
        if (DOM.subBhavarthPill) DOM.subBhavarthPill.classList.remove('active');
        if (DOM.subIntroPill) DOM.subIntroPill.classList.remove('active');
      } else if (introTop > 0 && scrollPos >= introTop) {
        if (DOM.subIntroPill) DOM.subIntroPill.classList.add('active');
        if (DOM.subMukhyaPill) DOM.subMukhyaPill.classList.remove('active');
        if (DOM.subBhavarthPill) DOM.subBhavarthPill.classList.remove('active');
      }
    }, { passive: true });

    // Floating Back to Top
    window.addEventListener('scroll', () => {
      if (DOM.backToTopBtn) {
        if (window.scrollY > 300) {
          DOM.backToTopBtn.classList.add('visible');
        } else {
          DOM.backToTopBtn.classList.remove('visible');
        }
      }
    });

    if (DOM.backToTopBtn) {
      DOM.backToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    // Popstate (Back/Forward navigation)
    window.addEventListener('popstate', () => {
      const rawId = window.location.hash.replace('#stotra-', '');
      const target = state.stotras.find(s => s.id === rawId || s.legacy_id === rawId || s.legacy_id === rawId.padStart(3, '0'));
      if (target && (!state.currentStotra || state.currentStotra.id !== target.id)) {
        loadStotra(target.id, false);
      }
    });

    // Keyboard Shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT') return;

      if (e.key === '/' || (e.ctrlKey && e.key === 'k') || (e.metaKey && e.key === 'k')) {
        if (DOM.globalSearchInput) {
          e.preventDefault();
          DOM.globalSearchInput.focus();
        }
      } else if (e.key === 'ArrowLeft') {
        const curIdx = state.stotras.findIndex(s => s.id === state.currentStotra.id);
        if (curIdx > 0) loadStotra(state.stotras[curIdx - 1].id);
      } else if (e.key === 'ArrowRight') {
        const curIdx = state.stotras.findIndex(s => s.id === state.currentStotra.id);
        if (curIdx < state.stotras.length - 1) loadStotra(state.stotras[curIdx + 1].id);
      } else if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        changeFontScale(0.06);
      } else if (e.key === '-' || e.key === '_') {
        e.preventDefault();
        changeFontScale(-0.06);
      } else if (e.key === '0') {
        e.preventDefault();
        resetToAutoFit();
      }
    });
  }

  // Sidebar Controls
  function toggleSidebar() {
    if (DOM.appContainer) DOM.appContainer.classList.toggle('sidebar-collapsed');
    if (DOM.sidebar) DOM.sidebar.classList.toggle('open');
    if (DOM.sidebarBackdrop) DOM.sidebarBackdrop.classList.toggle('open');
    setTimeout(autoFitShlokaLines, 80);
  }

  function closeSidebar() {
    if (DOM.appContainer) DOM.appContainer.classList.add('sidebar-collapsed');
    if (DOM.sidebar) DOM.sidebar.classList.remove('open');
    if (DOM.sidebarBackdrop) DOM.sidebarBackdrop.classList.remove('open');
    setTimeout(autoFitShlokaLines, 80);
  }

  function openSidebar() {
    if (DOM.appContainer) DOM.appContainer.classList.remove('sidebar-collapsed');
    if (DOM.sidebar) DOM.sidebar.classList.add('open');
    if (DOM.sidebarBackdrop) DOM.sidebarBackdrop.classList.add('open');
    setTimeout(autoFitShlokaLines, 80);
  }

  // Apply Theme
  function applyTheme(theme) {
    state.theme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('shri_theme', theme);

    const icons = { dark: '🌙', vedic: '📜', light: '☀️' };
    DOM.currentThemeIcon.textContent = icons[theme] || '🌙';
  }

  // Apply Global UI Font Scale (Navbar Controls)
  function applyFontScale(scale) {
    state.fontScale = scale;
    document.documentElement.style.setProperty('--reader-font-scale', scale);
    const label = `${Math.round(scale * 100)}%`;
    if (DOM.fontSizeIndicator) DOM.fontSizeIndicator.textContent = label;
    localStorage.setItem('shri_font_scale', scale);
  }

  // Change Global UI Font Scale
  function changeFontScale(delta) {
    const next = Math.min(1.60, Math.max(0.60, Math.round((state.fontScale + delta) * 100) / 100));
    applyFontScale(next);
    showToast(`समग्र फ़ॉन्ट आकार: ${Math.round(next * 100)}%`);
  }

  // Apply Dedicated Sanskrit Shloka Font Scale (Affects Sanskrit recitation & verse blocks only)
  function applyShlokaFontScale(scale) {
    state.shlokaFontScale = scale;
    document.documentElement.style.setProperty('--shloka-font-scale', scale);
    const label = `${Math.round(scale * 100)}%`;
    if (DOM.shlokaFontVal) DOM.shlokaFontVal.textContent = label;
    if (DOM.verseFontVal) DOM.verseFontVal.textContent = label;
    localStorage.setItem('shri_shloka_font_scale', scale);
  }

  // Change Dedicated Sanskrit Shloka Font Scale
  function changeShlokaFontScale(delta) {
    const next = Math.min(2.20, Math.max(0.70, Math.round((state.shlokaFontScale + delta) * 100) / 100));
    document.documentElement.style.setProperty('--shloka-auto-fit-ratio', '1');
    applyShlokaFontScale(next);
    showToast(`श्लोक फॉन्ट आकार: ${Math.round(next * 100)}%`);
  }

  // Auto-fit Sanskrit shloka lines to container width (Zero mid-line breaks guarantee)
  function autoFitShlokaLines() {
    requestAnimationFrame(() => {
      // In wrap mode, shlokas wrap naturally so no horizontal shrinking needed
      if (state.lineWrap === 'wrap') {
        document.documentElement.style.setProperty('--shloka-auto-fit-ratio', '1');
        return;
      }

      const activeLines = document.querySelectorAll('.shloka-line');
      if (!activeLines.length) {
        document.documentElement.style.setProperty('--shloka-auto-fit-ratio', '1');
        return;
      }

      let minRatio = 1;
      activeLines.forEach(line => {
        const parent = line.closest('.sanskrit-parayan-text') || line.closest('.verse-sanskrit-box');
        if (!parent || parent.clientWidth <= 0) return;

        const availableWidth = parent.clientWidth - 28;
        const naturalWidth = line.scrollWidth;

        if (naturalWidth > availableWidth && availableWidth > 150) {
          const ratio = (availableWidth / naturalWidth) * 0.98;
          if (ratio < minRatio) {
            minRatio = ratio;
          }
        }
      });

      // Clamp so font never drops below readable size (min 0.88 instead of 0.52!)
      if (minRatio < 1) {
        const safeRatio = Math.max(0.88, minRatio);
        document.documentElement.style.setProperty('--shloka-auto-fit-ratio', safeRatio.toFixed(3));
      } else {
        document.documentElement.style.setProperty('--shloka-auto-fit-ratio', '1');
      }
    });
  }

  // Reset to auto-fitted scale
  function resetToAutoFit() {
    applyShlokaFontScale(1.0);
    autoFitShlokaLines();
    showToast('श्लोक फॉन्ट सामान्य (100%) एवं स्वतः फिट किया गया');
  }

  // Apply View Mode (all vs parayan vs study)
  function applyViewMode(mode) {
    state.viewMode = mode;
    localStorage.setItem('shri_view_mode', mode);

    DOM.modeBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mode === mode);
    });

    if (mode === 'parayan') {
      // Only Mukhya Stotra Path (Recitation)
      DOM.parayanSection.style.display = 'block';
      DOM.versesSection.style.display = 'none';
      if (DOM.versesHeaderBar) DOM.versesHeaderBar.style.display = 'none';
      if (DOM.jumpMukhyaPill) DOM.jumpMukhyaPill.classList.add('active-pill');
      if (DOM.jumpVersesPill) DOM.jumpVersesPill.classList.remove('active-pill');
    } else if (mode === 'study') {
      // Only Verses Breakdown (Study)
      DOM.parayanSection.style.display = 'none';
      DOM.versesSection.style.display = 'flex';
      if (DOM.versesHeaderBar) DOM.versesHeaderBar.style.display = 'flex';
      if (DOM.jumpMukhyaPill) DOM.jumpMukhyaPill.classList.remove('active-pill');
      if (DOM.jumpVersesPill) DOM.jumpVersesPill.classList.add('active-pill');
    } else {
      // 'all' (Default): Both Mukhya Path AND Verse Breakdown!
      DOM.parayanSection.style.display = 'block';
      DOM.versesSection.style.display = 'flex';
      if (DOM.versesHeaderBar) DOM.versesHeaderBar.style.display = 'flex';
      if (DOM.jumpMukhyaPill) DOM.jumpMukhyaPill.classList.add('active-pill');
      if (DOM.jumpVersesPill) DOM.jumpVersesPill.classList.add('active-pill');
    }
  }

  // Apply Line Wrap Mode ('nowrap' vs 'wrap')
  function applyLineWrap(mode) {
    state.lineWrap = mode;
    localStorage.setItem('shri_line_wrap', mode);

    const isNoWrap = mode === 'nowrap';
    const container = DOM.appContainer || document.getElementById('app-container');
    if (container) {
      container.classList.toggle('mode-nowrap', isNoWrap);
      container.classList.toggle('mode-wrap', !isNoWrap);
    }
    document.body.classList.toggle('mode-nowrap', isNoWrap);
    document.body.classList.toggle('mode-wrap', !isNoWrap);

    if (DOM.lineWrapIcon) {
      DOM.lineWrapIcon.textContent = isNoWrap ? '↔️' : '↩️';
    }
    if (DOM.lineWrapToggleBtn) {
      DOM.lineWrapToggleBtn.classList.toggle('active', isNoWrap);
      DOM.lineWrapToggleBtn.title = isNoWrap 
        ? 'वर्तमान: अखंड पंक्ति (बिना ब्रेक) · क्लिक कर प्रवाही मोड़ें' 
        : 'वर्तमान: प्रवाही विन्यास (Word Wrap) · क्लिक कर अखंड पंक्ति करें';
    }

    if (DOM.lineWrapCardBtn) {
      const label = DOM.lineWrapCardBtn.querySelector('.line-wrap-card-label');
      const icon = DOM.lineWrapCardBtn.querySelector('.btn-icon');
      if (label) label.textContent = isNoWrap ? 'अखंड पंक्ति' : 'प्रवाही विन्यास';
      if (icon) icon.textContent = isNoWrap ? '↔️' : '↩️';
      DOM.lineWrapCardBtn.classList.toggle('active-action', !isNoWrap);
      DOM.lineWrapCardBtn.title = isNoWrap ? 'क्लिक कर प्रवाही विन्यास (Word Wrap) में बदलें' : 'क्लिक कर अखंड पंक्ति (बिना ब्रेक) करें';
    }

    autoFitShlokaLines();
  }

  // Toggle Line Wrap
  function toggleLineWrap() {
    const next = state.lineWrap === 'nowrap' ? 'wrap' : 'nowrap';
    applyLineWrap(next);
    showToast(next === 'nowrap' ? 'अखंड पंक्ति (बिना ब्रेक) सक्रिय' : 'प्रवाही पंक्ति विन्यास (Word Wrap) सक्रिय');
  }

  // ==========================================================================
  // वेद-पुराणम् Explorer Data & Functions (चतुर्वेद एवं २६ पुराण, उपपुराण व इतिहास ग्रन्थ)
  // ==========================================================================
  const vedasList = [
    { num: '०१', title: 'ऋग्वेद संहिता', desc: 'शाकल शाखा संहिता — महर्षि दयानन्द भाष्य / आर्ष भाष्य', status: 'संकलन प्रक्रियाधीन' },
    { num: '०२', title: 'यजुर्वेद संहिता', desc: 'माध्यन्दिन वाजसनेयी संहिता — महर्षि दयानन्द भाष्य (४० अध्याय)', status: 'संकलन प्रक्रियाधीन' },
    { num: '०३', title: 'सामवेद संहिता', desc: 'कौथुम शाखा — छन्द एवं गान संहिता (आर्ष भाष्य)', status: 'संकलन प्रक्रियाधीन' },
    { num: '०४', title: 'अथर्ववेद संहिता', desc: 'शौनक शाखा — ब्रह्मवेद एवं आर्ष भाष्य', status: 'संकलन प्रक्रियाधीन' }
  ];

  const puranasList = [
    { num: '01', title: 'श्री ब्रह्म महापुराण', file: '001_shri_brahma_mahapuran.pdf', category: 'महापुराण' },
    { num: '02', title: 'श्री पद्म महापुराण', file: '002_shri_padma_mahapuran.pdf', category: 'महापुराण' },
    { num: '03', title: 'श्री विष्णु महापुराण', file: '003_shri_vishnu_mahapuran.pdf', category: 'महापुराण' },
    { num: '04', title: 'श्री शिव महापुराण (भाग १)', file: '004_shri_shiv_mahapuran_bhag_01.pdf', category: 'महापुराण' },
    { num: '05', title: 'श्री शिव महापुराण (भाग २)', file: '005_shri_shiv_mahapuran_bhag_02.pdf', category: 'महापुराण' },
    { num: '06', title: 'श्रीमद्भागवत महापुराण (खण्ड १)', file: '006_shrimad_bhagavat_mahapuran_khand_01.pdf', category: 'महापुराण' },
    { num: '07', title: 'श्रीमद्भागवत महापुराण (खण्ड २)', file: '007_shrimad_bhagavat_mahapuran_khand_02.pdf', category: 'महापुराण' },
    { num: '08', title: 'श्री नारद महापुराण', file: '008_shri_narad_mahapuran.pdf', category: 'महापुराण' },
    { num: '09', title: 'श्री मार्कण्डेय महापुराण', file: '009_shri_markandeya_mahapuran.pdf', category: 'महापुराण' },
    { num: '10', title: 'श्री अग्नि महापुराण', file: '010_shri_agni_mahapuran.pdf', category: 'महापुराण' },
    { num: '11', title: 'श्री भविष्य महापुराण', file: '011_shri_bhavishya_mahapuran.pdf', category: 'महापुराण' },
    { num: '12', title: 'श्री ब्रह्मवैवर्त महापुराण', file: '012_shri_brahmavaivarta_mahapuran.pdf', category: 'महापुराण' },
    { num: '13', title: 'श्री लिङ्ग महापुराण (खण्ड १)', file: '013_shri_linga_mahapuran_khand_01.pdf', category: 'महापुराण' },
    { num: '14', title: 'श्री लिङ्ग महापुराण (खण्ड २)', file: '014_shri_linga_mahapuran_khand_02.pdf', category: 'महापुराण' },
    { num: '15', title: 'श्री वराह महापुराण', file: '015_shri_varaha_mahapuran.pdf', category: 'महापुराण' },
    { num: '16', title: 'श्री स्कन्द महापुराण', file: '016_shri_skanda_mahapuran.pdf', category: 'महापुराण' },
    { num: '17', title: 'श्री वामन महापुराण', file: '017_shri_vamana_mahapuran.pdf', category: 'महापुराण' },
    { num: '18', title: 'श्री कूर्म महापुराण', file: '018_shri_kurma_mahapuran.pdf', category: 'महापुराण' },
    { num: '19', title: 'श्री मत्स्य महापुराण', file: '019_shri_matsya_mahapuran.pdf', category: 'महापुराण' },
    { num: '20', title: 'श्री गरुड़ महापुराण', file: '020_shri_garuda_mahapuran.pdf', category: 'महापुराण' },
    { num: '21', title: 'श्री ब्रह्माण्ड महापुराण (भाग १)', file: '021_shri_brahmanda_mahapuran_bhag_01.pdf', category: 'महापुराण' },
    { num: '22', title: 'श्री ब्रह्माण्ड महापुराण (अध्यात्म रामायण)', file: '022_shri_brahmanda_mahapuran_bhag_02_adhyatma_ramayan.pdf', category: 'महापुराण / अध्यात्म रामायण' },
    { num: '23', title: 'श्री गणेश पुराण', file: '023_shri_ganesh_puran.pdf', category: 'उपपुराण' },
    { num: '24', title: 'श्री नृसिंह पुराण', file: '024_shri_narasimha_puran.pdf', category: 'उपपुराण' },
    { num: '25', title: 'श्री हरिवंश पुराण', file: '025_shri_harivamsha.pdf', category: 'इतिहास-पुराण' },
    { num: '26', title: 'श्री मत्स्य पुराण (विस्तृत संस्करण)', file: '026_shri_matsya_puran_another_edition.pdf', category: 'महापुराण (विस्तृत)' }
  ];

  // Render Vedas & Puranas into Dedicated View
  function renderVedasAndPuranas(filterText = '') {
    const q = (filterText || '').trim().toLowerCase();

    // Render Vedas
    if (DOM.vedasGrid) {
      const filteredVedas = vedasList.filter(v => {
        if (!q) return true;
        return v.title.toLowerCase().includes(q) || v.desc.toLowerCase().includes(q) || v.num.includes(q);
      });

      if (filteredVedas.length === 0) {
        DOM.vedasGrid.innerHTML = '<div class="empty-purana-search">कोई वेद संहिता प्राप्त नहीं हुई।</div>';
      } else {
        DOM.vedasGrid.innerHTML = filteredVedas.map(v => `
          <div class="purana-card-item pending-item">
            <span class="purana-badge">${v.num}</span>
            <div class="purana-info">
              <span class="purana-card-title">${v.title}</span>
              <span class="purana-card-sub">${v.desc} — <em>${v.status}</em></span>
            </div>
          </div>
        `).join('');
      }
    }

    // Render Puranas
    if (DOM.puranaCardsGrid) {
      const filteredPuranas = puranasList.filter(p => {
        if (!q) return true;
        return p.title.toLowerCase().includes(q) ||
               p.num.includes(q) ||
               (p.category && p.category.toLowerCase().includes(q)) ||
               p.file.toLowerCase().includes(q);
      });

      if (DOM.puranaCountIndicator) {
        DOM.puranaCountIndicator.textContent = q ? `${toDevanagari(filteredPuranas.length)} ग्रन्थ प्राप्त` : '२६ पुराण ग्रन्थ';
      }

      if (filteredPuranas.length === 0) {
        DOM.puranaCardsGrid.innerHTML = `<div class="empty-purana-search">"<strong>${escapeHtml(filterText)}</strong>" से मेल खाता कोई पुराण प्राप्त नहीं हुआ। अन्य नाम से खोजें।</div>`;
      } else {
        DOM.puranaCardsGrid.innerHTML = filteredPuranas.map(p => {
          let tagClass = '';
          if (p.category.includes('उपपुराण')) tagClass = 'tag-upapurana';
          else if (p.category.includes('इतिहास')) tagClass = 'tag-itihasa';
          return `
          <a class="purana-card-item" href="ved_puraanam/puranas/${p.file}" target="_blank" rel="noopener" title="${p.title} (${p.category}) PDF ग्रन्थ खोलें">
            <span class="purana-badge">${p.num}</span>
            <div class="purana-info">
              <span class="purana-card-title">${p.title}</span>
              <span class="purana-card-sub">
                <span class="purana-cat-tag ${tagClass}">${p.category}</span>
                <span style="color: var(--accent-gold);">PDF ग्रन्थ खोलें ↗</span>
              </span>
            </div>
          </a>
        `;
        }).join('');
      }
    }
  }

  // ==========================================================================
  // वेदान्त-दर्शनम् Explorer Data & Functions (प्रस्थानत्रयी, उपनिषद एवं षड्दर्शन)
  // ==========================================================================
  const vedantaList = [
    { num: '०१', title: '१०८ उपनिषद संग्रह', desc: 'ईश, केन, कठ, प्रश्न, मुण्डक, माण्डूक्य, तैत्तिरीय, ऐतरेय आदि', status: 'संकलन प्रक्रियाधीन' },
    { num: '०२', title: 'श्रीमद्भगवद्गीता', desc: 'प्रस्थानत्रयी का स्मृति-प्रस्थान — सम्पूर्ण १८ अध्याय', status: 'संकलन प्रक्रियाधीन' },
    { num: '०३', title: 'ब्रह्मसूत्र (वेदान्त दर्शन)', desc: 'महर्षि बादरायण व्यास प्रणीत एवं शांकरभाष्य', status: 'संकलन प्रक्रियाधीन' },
    { num: '०४', title: 'विवेकचूड़ामणि', desc: 'जगद्गुरु आदि शंकराचार्य विरचित अद्वैत प्रकरण ग्रन्थ', status: 'संकलन प्रक्रियाधीन' },
    { num: '०५', title: 'अष्टावक्र गीता', desc: 'परम अद्वैत तत्त्व एवं आत्म-साक्षात्कार', status: 'संकलन प्रक्रियाधीन' }
  ];

  const darshanList = [
    { num: '०१', title: 'संक्षिप्त योग वासिष्ठ', file: '001_sankshipt_yog_vasishtha.pdf', available: true, desc: 'महारामायणम् — अद्वैत ज्ञानयोग एवं मोक्ष-दर्शन' },
    { num: '०२', title: 'सांख्य दर्शन (सांख्यप्रवचनसूत्र)', file: '', available: false, desc: 'महर्षि कपिल प्रणीत सांख्यकारिका एवं सूत्र' },
    { num: '०३', title: 'योग दर्शन (पातञ्जल योगसूत्र)', file: '', available: false, desc: 'महर्षि पतञ्जलि प्रणीत अष्टांग योग एवं कैवल्यपाद' },
    { num: '०४', title: 'न्याय दर्शन (न्यायसूत्र)', file: '', available: false, desc: 'महर्षि अक्षपाद गौतम प्रणीत प्रमाण एवं तर्कशास्त्र' },
    { num: '०५', title: 'वैशेषिक दर्शन (वैशेषिकसूत्र)', file: '', available: false, desc: 'महर्षि कणाद प्रणीत पदार्थ-मीमांसा' },
    { num: '०६', title: 'पूर्व मीमांसा (मीमांसासूत्र)', file: '', available: false, desc: 'महर्षि जैमिनि प्रणीत धर्म एवं वैदिक कर्मकाण्ड' },
    { num: '०७', title: 'उत्तर मीमांसा (वेदान्तसूत्र)', file: '', available: false, desc: 'महर्षि बादरायण व्यास प्रणीत वेदान्त-दर्शन (शांकरभाष्य)' },
    { num: '०८', title: 'माण्डूक्यकारिका (आगमशास्त्र)', file: '', available: false, desc: 'आचार्य गौड़पाद प्रणीत अजातवाद एवं तुरीय अवस्था' }
  ];

  // Render Vedanta & Darshanas into Dedicated View
  function renderVedantaAndDarshanas(filterText = '') {
    const q = (filterText || '').trim().toLowerCase();

    // Render Vedanta
    let matchVedantaCount = 0;
    if (DOM.vedantaCardsGrid) {
      const filteredVedanta = vedantaList.filter(v => {
        if (!q) return true;
        return v.title.toLowerCase().includes(q) || v.desc.toLowerCase().includes(q) || v.num.includes(q);
      });
      matchVedantaCount = filteredVedanta.length;

      if (filteredVedanta.length === 0) {
        DOM.vedantaCardsGrid.innerHTML = '<div class="empty-purana-search">कोई वेदान्त ग्रन्थ प्राप्त नहीं हुआ।</div>';
      } else {
        DOM.vedantaCardsGrid.innerHTML = filteredVedanta.map(v => `
          <div class="purana-card-item pending-item">
            <span class="purana-badge">${v.num}</span>
            <div class="purana-info">
              <span class="purana-card-title">${v.title}</span>
              <span class="purana-card-sub">${v.desc} — <em>${v.status}</em></span>
            </div>
          </div>
        `).join('');
      }
    }

    // Render Darshanas
    if (DOM.darshanCardsGrid) {
      const filteredDarshan = darshanList.filter(d => {
        if (!q) return true;
        return d.title.toLowerCase().includes(q) || d.desc.toLowerCase().includes(q) || d.num.includes(q);
      });

      if (DOM.darshanCountIndicator) {
        const total = filteredDarshan.length + matchVedantaCount;
        DOM.darshanCountIndicator.textContent = q ? `${toDevanagari(total)} ग्रन्थ प्राप्त` : '१३ दार्शनिक ग्रन्थ';
      }

      if (filteredDarshan.length === 0) {
        DOM.darshanCardsGrid.innerHTML = `<div class="empty-purana-search">"<strong>${escapeHtml(filterText)}</strong>" से मेल खाता कोई दर्शन ग्रन्थ प्राप्त नहीं हुआ।</div>`;
      } else {
        DOM.darshanCardsGrid.innerHTML = filteredDarshan.map(d => d.available ? `
          <a class="purana-card-item" href="vedant_darshanam/darshanam/${d.file}" target="_blank" rel="noopener" title="${d.title} PDF खोलें">
            <span class="purana-badge">${d.num}</span>
            <div class="purana-info">
              <span class="purana-card-title">${d.title}</span>
              <span class="purana-card-sub" style="color: var(--accent-gold);">${d.desc} (PDF खोलें ↗)</span>
            </div>
          </a>
        ` : `
          <div class="purana-card-item pending-item">
            <span class="purana-badge">${d.num}</span>
            <div class="purana-info">
              <span class="purana-card-title">${d.title}</span>
              <span class="purana-card-sub">${d.desc} — <em>शीघ्र संकलित होगा</em></span>
            </div>
          </div>
        `).join('');
      }
    }
  }

  // Backward-compatibility: Redirect modals to dedicated pages
  function showVedPuranModal() {
    window.location.hash = '#ved-puranam';
  }
  function closeVedPuranModal() {}

  function showVedantDarshanModal() {
    window.location.hash = '#vedant-darshanam';
  }
  function closeVedantDarshanModal() {}

  // Start on DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
