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

    // Dedicated Vrat-Pujanam View & Modal
    vratPujanamView: document.getElementById('vrat-pujanam-view'),
    vratCardsGrid: document.getElementById('vrat-cards-grid'),
    vratSearchInput: document.getElementById('vrat-search-input'),
    vratCountIndicator: document.getElementById('vrat-count-indicator'),
    vratPagePills: document.getElementById('vrat-page-pills'),
    vratDetailModal: document.getElementById('vrat-detail-modal'),
    vratModalTag: document.getElementById('vrat-modal-tag'),
    vratModalTitle: document.getElementById('vrat-modal-title'),
    vratModalBody: document.getElementById('vrat-modal-body'),
    vratModalCloseBtn: document.getElementById('vrat-modal-close-btn'),
    slideOpenVratBtn: document.getElementById('slide-open-vrat-btn'),
    pillarSlideVrat: document.getElementById('pillar-slide-vrat'),

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
    if (DOM.vratPujanamView) DOM.vratPujanamView.style.display = 'none';
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

    // Clear active state on all corpus tabs when on Home (since brand logo represents home)
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
    if (DOM.vratPujanamView) DOM.vratPujanamView.style.display = 'none';
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
    if (DOM.vratPujanamView) DOM.vratPujanamView.style.display = 'none';
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
    if (DOM.vratPujanamView) DOM.vratPujanamView.style.display = 'none';
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

  // Show Vrat-Pujanam View (श्री व्रत-पूजनम् समर्पित पृष्ठ)
  function showVratPujanamView() {
    state.currentStotra = null;
    document.title = 'श्री व्रत-पूजनम् — नवरात्र, एकादशी, प्रदोष एवं महापर्व पूजन-विधि व पावन कथाएं | श्री सनातन वाङ्मयम्';

    if (DOM.loadingSpinner) DOM.loadingSpinner.style.display = 'none';
    if (DOM.stotraArticle) DOM.stotraArticle.style.display = 'none';
    if (DOM.homeView) DOM.homeView.style.display = 'none';
    if (DOM.stutiGangaView) DOM.stutiGangaView.style.display = 'none';
    if (DOM.vedPuranamView) DOM.vedPuranamView.style.display = 'none';
    if (DOM.vedantDarshanamView) DOM.vedantDarshanamView.style.display = 'none';
    if (DOM.vratPujanamView) DOM.vratPujanamView.style.display = 'block';

    // Sub-Navbar on Vrat-Pujanam
    if (DOM.subNavTitle) {
      DOM.subNavTitle.textContent = 'श्री व्रत-पूजनम् — नवरात्र, एकादशी, प्रदोष व महापर्व पूजन-विधान (Vrat & Puja Vidhi)';
      DOM.subNavTitle.title = 'श्री व्रत-पूजनम्';
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
      t.classList.toggle('active', t.dataset.corpus === 'vrat_pujanam');
    });

    // Deselect all stotra items in sidebar
    document.querySelectorAll('.stotra-nav-item').forEach(el => el.classList.remove('active'));

    // Render Vrat Pujanam content
    let activeVratCat = 'all';
    if (DOM.vratPagePills) {
      const activeBtn = DOM.vratPagePills.querySelector('.pill-btn.active');
      if (activeBtn) activeVratCat = activeBtn.dataset.vratCat || 'all';
    }
    renderVratPujanam(activeVratCat, DOM.vratSearchInput ? DOM.vratSearchInput.value : '');

    closeSidebar();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Routing Handler (Home vs Stuti-Ganga vs Ved-Puranam vs Vedant-Darshanam vs Vrat-Pujanam vs Stotra)
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
    } else if (hash === '#vrat-pujanam' || hash === '#vrat_pujanam') {
      showVratPujanamView();
    } else if (hash.startsWith('#vrat-')) {
      const vratId = hash.replace('#vrat-', '');
      showVratPujanamView();
      openVratModal(vratId);
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
    if (DOM.vratPujanamView) DOM.vratPujanamView.style.display = 'none';
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
          showToast('🌊 स्तुति-गंगा: शास्त्रीय स्तोत्र, चालीसा एवं स्तुति संग्रह');
          window.location.hash = '#stuti-ganga';
          openSidebar();
        } else if (corpus === 'ved_puranam') {
          showToast('🏛️ वेद-पुराणम्: चतुर्वेद एवं २६ पावन पुराण ग्रन्थालय');
          window.location.hash = '#ved-puranam';
        } else if (corpus === 'vedant_darshanam') {
          showToast('🪔 वेदान्त-दर्शनम्: प्रस्थानत्रयी, उपनिषद एवं षड्दर्शन संग्रह');
          window.location.hash = '#vedant-darshanam';
        } else if (corpus === 'vrat_pujanam') {
          showToast('🌸 व्रत-पूजनम्: नवरात्र, एकादशी, प्रदोष एवं महापर्व पूजन-विधान');
          window.location.hash = '#vrat-pujanam';
        }
      });
    });

    // 4 PPT-Style Presentation Slide CTA Buttons
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

    const slideOpenVratBtn = document.getElementById('slide-open-vrat-btn');
    if (slideOpenVratBtn) {
      slideOpenVratBtn.addEventListener('click', () => {
        window.location.hash = '#vrat-pujanam';
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

    const pillarSlideVrat = document.getElementById('pillar-slide-vrat');
    if (pillarSlideVrat) {
      pillarSlideVrat.addEventListener('click', (e) => {
        if (!e.target.closest('button')) {
          window.location.hash = '#vrat-pujanam';
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

    // Live Search Filter for Dedicated Vrat-Pujanam Page
    if (DOM.vratSearchInput) {
      DOM.vratSearchInput.addEventListener('input', (e) => {
        let activeCat = 'all';
        if (DOM.vratPagePills) {
          const activeBtn = DOM.vratPagePills.querySelector('.pill-btn.active');
          if (activeBtn) activeCat = activeBtn.dataset.vratCat || 'all';
        }
        renderVratPujanam(activeCat, e.target.value);
      });
    }

    // Category Filter Pills on Dedicated Vrat-Pujanam Page
    if (DOM.vratPagePills) {
      DOM.vratPagePills.addEventListener('click', (e) => {
        const btn = e.target.closest('.pill-btn');
        if (!btn) return;
        DOM.vratPagePills.querySelectorAll('.pill-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const cat = btn.dataset.vratCat || 'all';
        renderVratPujanam(cat, DOM.vratSearchInput ? DOM.vratSearchInput.value : '');
      });
    }

    // Modal Close Handlers for Vrat-Pujanam Detail Modal
    if (DOM.vratModalCloseBtn) {
      DOM.vratModalCloseBtn.addEventListener('click', closeVratModal);
    }
    if (DOM.vratDetailModal) {
      DOM.vratDetailModal.addEventListener('click', (e) => {
        if (e.target === DOM.vratDetailModal) {
          closeVratModal();
        }
      });
    }
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && DOM.vratDetailModal && DOM.vratDetailModal.style.display !== 'none') {
        closeVratModal();
      }
    });

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

  // ==========================================================================
  // श्री व्रत-पूजनम् Data & Functions (नवरात्र, एकादशी, प्रदोष, महापर्व)
  // ==========================================================================
  const vratList = [
    // ----------------- नवरात्र विशेष (९ दिवस एवं घटस्थापना) -----------------
    {
      id: 'navratri_kalash',
      cat: 'navratri',
      badge: '🌸 नवरात्र अनुष्ठान',
      title: 'घटस्थापना एवं अखण्ड ज्योति विधान',
      subtitle: 'प्रतिपदा तिथि — प्रातः काल शुभ मुहूर्त',
      mantra: 'कलशस्य मुखे विष्णुः कण्ठे रुद्रः समाश्रितः। मूले त्वस्य स्थितो ब्रह्मा मध्ये मातृगणाः स्मृताः॥',
      desc: 'शारदीय एवं चैत्र नवरात्र के प्रथम दिवस घटस्थापना, वेदी निर्माण, सप्तधान्य रोपण एवं अखण्ड ज्योति का शास्त्रीय नियम व विधान।',
      contentHtml: `
        <h4>१. घटस्थापना (कलश स्थापना) का शास्त्रीय महत्त्व</h4>
        <p>नवरात्र के प्रथम दिन शुभ मुहूर्त में घट (कलश) स्थापना का विधान है। कलश को सम्पूर्ण ब्रह्माण्ड एवं समस्त देवी-देवताओं का प्रतीक माना जाता है।</p>
        
        <h4>२. आवश्यक पूजन सामग्री</h4>
        <ul>
          <li>मिट्टी अथवा तांबे/पीतल का पवित्र कलश एवं ढक्कन (पूर्णपात्र)।</li>
          <li>पवित्र मिट्टी, बालू एवं सप्तधान्य (जौ, तिल, धान, गेहूं, मूंग, चना, कंगनी)।</li>
          <li>गंगाजल, शुद्ध जल, सुपारी, रोली, अक्षत, दुर्वा, पञ्चरत्न/सिक्का।</li>
          <li>आम अथवा अशोक के ५ या ७ पल्लव, जटावाला श्रीफल (नारियल) एवं लाल कलावा (मौली), लाल चुनरी।</li>
        </ul>

        <h4>३. कलश स्थापना विधि</h4>
        <ol>
          <li><strong>वेदी निर्माण:</strong> ईशान कोण (उत्तर-पूर्व) में स्वच्छ स्थान पर पवित्र मिट्टी या बालू बिछाकर वेदी बनाएं और उसमें सप्तधान्य (जौ) बोएं।</li>
          <li><strong>कलश सज्जा:</strong> कलश पर स्वस्तिक का पावन चिह्न अंकित करें, कंठ में मौली बांधें और गंगाजल मिश्रित शुद्ध जल भरें।</li>
          <li><strong>औषधि व द्रव्य अर्पण:</strong> कलश में गन्ध, अक्षत, पुष्प, दुर्वा, सुपारी एवं सिक्का डालें।</li>
          <li><strong>पल्लव व नारियल:</strong> कलश के मुख पर आम/अशोक के पल्लव रखें। ऊपर पूर्णपात्र (अक्षत से भरा पात्र) रखें और उस पर लाल चुनरी व मौली लिपटा श्रीफल स्थापित करें।</li>
          <li><strong>आवाहन मन्त्र:</strong>
            <blockquote style="margin: 0.8rem 0; padding: 0.6rem 1rem; background: rgba(224,86,36,0.08); border-left: 3px solid var(--accent-vermilion); font-family: var(--font-sanskrit);">
              कलशस्य मुखे विष्णुः कण्ठे रुद्रः समाश्रितः। मूले त्वस्य स्थितो ब्रह्मा मध्ये मातृगणाः स्मृताः॥<br>
              कुक्षौ तु सागराः सर्वे सप्तद्वीपा वसुन्धरा। ऋग्वेदोऽथ यजुर्वेदः सामवेदो ह्यथर्वणः॥
            </blockquote>
          </li>
        </ol>

        <h4>४. अखण्ड ज्योति के शास्त्रीय नियम</h4>
        <ul>
          <li>अखण्ड दीपक को माता की चौकी के दाईं ओर (यदि घी का हो) अथवा बाईं ओर (यदि तिल के तेल का हो) स्थापित करें।</li>
          <li>दीपक प्रज्वलित करने से पूर्व नीचे अक्षत या जौ की ढेरी बनाएं।</li>
          <li>नवरात्र के सम्पूर्ण ९ दिनों तक दीपक की बाती व घृत की नियमित देख-रेख करें ताकि ज्योति अखण्ड बनी रहे।</li>
          <li>संकल्प: <em>« ॐ अद्य... अमुकगोत्रोऽहं... श्रीजगदम्बाप्रीत्यर्थं नवरात्रव्रतमहं करिष्ये। »</em></li>
        </ul>
      `
    },
    {
      id: 'navratri_day1',
      cat: 'navratri',
      badge: '🌸 प्रथम नवरात्र',
      title: 'माँ शैलपुत्री पूजन विधि एवं कथा',
      subtitle: 'प्रतिपदा तिथि — नन्दी सवारी व त्रिशूलधारिणी',
      mantra: 'वन्दे वाञ्छितलाभाय चन्द्रार्धकृतशेखराम्। वृषारूढां शूलधरां शैलपुत्रीं यशस्विनीम्॥',
      desc: 'नवदुर्गा का प्रथम स्वरूप। सती के आत्मदाह के उपरान्त पर्वतराज हिमालय के गृह में प्राकट्य की पावन कथा, गाय के घृत का भोग व पूजन विधि।',
      contentHtml: `
        <h4>१. स्वरूप एवं ध्यान</h4>
        <p>माँ दुर्गा का प्रथम स्वरूप 'शैलपुत्री' है। पर्वतराज हिमालय की पुत्री होने के कारण इन्हें शैलपुत्री कहा जाता है। माता वृषभ (नन्दी) पर आरूढ़ हैं, दाहिने हाथ में त्रिशूल और बाएं हाथ में कमल पुष्प सुशोभित है। यह मूलाधार चक्र की अधिष्ठात्री देवी हैं।</p>

        <h4>२. पौराणिक पावन कथा</h4>
        <p>पूर्वजन्म में ये प्रजापति दक्ष की कन्या 'सती' थीं और उनका विवाह देवाधिदेव महादेव से हुआ था। दक्ष द्वारा आयोजित महायज्ञ में जब भगवान शिव का अपमान हुआ, तो सती ने योगाग्नि में अपने शरीर को भस्म कर दिया।</p>
        <p>अगले जन्म में उन्होंने शैलराज हिमालय की तपस्या से प्रसन्न होकर उनकी पुत्री 'पार्वती' (हेमवती) के रूप में अवतार लिया और पुनः कठोर तप कर भगवान शिव को पति रूप में प्राप्त किया।</p>

        <h4>३. पूजन विधि एवं नैवेद्य</h4>
        <ul>
          <li>प्रातः स्नान कर श्वेत अथवा लाल वस्त्र धारण करें।</li>
          <li>माता शैलपुत्री को लाल पुष्प (गुड़हल/गुलाब), रोली, सिन्दूर व अक्षत अर्पित करें।</li>
          <li><strong>विशेष भोग:</strong> माता शैलपुत्री को गाय के शुद्ध घृत (घी) का भोग लगाने से आरोग्यता और व्याधि-मुक्ति की प्राप्ति होती है।</li>
          <li>मन्त्र जप: <em>« ॐ ऐं ह्रीं क्लीं शैलपुत्र्यै नमः »</em> (१०८ बार)।</li>
        </ul>
      `
    },
    {
      id: 'navratri_day2',
      cat: 'navratri',
      badge: '🌸 द्वितीय नवरात्र',
      title: 'माँ ब्रह्मचारिणी पूजन विधि एवं कथा',
      subtitle: 'द्वितीया तिथि — तपस्या की मूर्ति, अक्षमाला व कमण्डलु',
      mantra: 'दधाना करपद्माभ्यामक्षमालाकमण्डलू। देवी प्रसीदतु मयि ब्रह्मचारिण्यनुत्तमा॥',
      desc: 'भगवान शिव को पति रूप में पाने के लिए सहस्र वर्षों के कठिन तप की पावन कथा, शर्करा (मिश्री) का भोग व तप-तेज प्राप्ति विधान।',
      contentHtml: `
        <h4>१. स्वरूप एवं ध्यान</h4>
        <p>माँ दुर्गा का दूसरा स्वरूप 'ब्रह्मचारिणी' है। ब्रह्म का अर्थ है तपस्या और चारिणी का अर्थ है आचरण करने वाली। इनके दाहिने हाथ में जप की अक्षमाला और बाएं हाथ में दिव्य कमण्डलु है। यह स्वाधिष्ठान चक्र की स्वामिनी हैं।</p>

        <h4>२. पौराणिक पावन कथा</h4>
        <p>भगवान शिव को वर रूप में प्राप्त करने के लिए नारद जी के उपदेश से देवी ने कठोर तपस्या प्रारम्भ की। एक सहस्र वर्ष तक केवल फल-मूल खाकर रहीं, शत वर्षों तक शाक पर निर्वाह किया और कठिन उपवास किए।</p>
        <p>कड़ाके की धूप, वर्षा और शीत में खुले आकाश तले तप किया। तत्पश्चात सूखे बेलपत्र खाना भी छोड़ दिया (जिससे वे 'अपर्णा' कहलाईं)। उनके इस अप्रतिम तप से तीनों लोकों में हाहाकार मच गया और पितामह ब्रह्मा जी ने प्रकट होकर उन्हें अभीष्ट वरदान दिया।</p>

        <h4>३. पूजन विधि एवं नैवेद्य</h4>
        <ul>
          <li>माता को पीले या श्वेत पुष्प तथा सुगन्धित चन्दन अर्पित करें।</li>
          <li><strong>विशेष भोग:</strong> माँ ब्रह्मचारिणी को शर्करा (शक्कर) अथवा मिश्री का भोग लगाया जाता है, जिससे दीर्घायु और संयम का आशीर्वाद मिलता है।</li>
          <li>मन्त्र जप: <em>« ॐ ह्रीं श्रीं अम्बिकायै नमः »</em> अथवा <em>« ॐ देवी ब्रह्मचारिण्यै नमः »</em>।</li>
        </ul>
      `
    },
    {
      id: 'navratri_day3',
      cat: 'navratri',
      badge: '🌸 तृतीय नवरात्र',
      title: 'माँ चन्द्रघण्टा पूजन विधि एवं कथा',
      subtitle: 'तृतीया तिथि — मस्तक पर अर्धचन्द्र, दशभुजा सिंहवाहिनी',
      mantra: 'पिण्डजप्रवरारूढा चण्डकोपास्त्रकैर्युता। प्रसादं तनुते मह्यं चन्द्रघण्टेति विश्रुता॥',
      desc: 'दुष्टों के विनाश व भक्तों के निर्भय कल्याण हेतु तत्पर। दुग्ध व दुग्ध से बने मिष्ठान का भोग, सिंह वाहिनी देवी की पूजा व कथा।',
      contentHtml: `
        <h4>१. स्वरूप एवं ध्यान</h4>
        <p>माँ दुर्गा की तीसरी शक्ति 'चन्द्रघण्टा' हैं। इनके मस्तक पर घण्टे के आकार का अर्धचन्द्र सुशोभित है, जिससे इन्हें चन्द्रघण्टा कहा जाता है। इनका शरीर स्वर्ण के समान कान्तिमान है। देवी दस हाथों में त्रिशूल, गदा, खड्ग, बाण आदि धारण कर सिंह पर सवार रहती हैं। यह मणिपुर चक्र की अधिष्ठात्री हैं।</p>

        <h4>२. पौराणिक पावन कथा</h4>
        <p>जब असुरराज महिषासुर ने स्वर्ग पर अधिकार कर देवताओं को निष्कासित कर दिया, तब ब्रह्मा, विष्णु और महेश के तेज से देवी चन्द्रघण्टा का प्राकट्य हुआ। देवी के घण्टे की प्रचण्ड ध्वनि से दैत्यों के हृदय कम्पित हो उठे। माता ने अनेक दुष्ट दानवों का संहार कर धर्म और देवताओं की रक्षा की।</p>

        <h4>३. पूजन विधि एवं नैवेद्य</h4>
        <ul>
          <li>माता को लाल व पीले पुष्प तथा चमेली के फूल अर्पित करें।</li>
          <li><strong>विशेष भोग:</strong> माँ चन्द्रघण्टा को दूध या दूध से बनी खीर/मिष्ठान का भोग लगाने से समस्त कष्टों व भयों का शमन होता है।</li>
          <li>मन्त्र जप: <em>« ॐ ऐं श्रीं शक्त्यै नमः »</em> अथवा <em>« ॐ देवी चन्द्रघण्टायै नमः »</em>।</li>
        </ul>
      `
    },
    {
      id: 'navratri_day4',
      cat: 'navratri',
      badge: '🌸 चतुर्थ नवरात्र',
      title: 'माँ कूष्माण्डा पूजन विधि एवं कथा',
      subtitle: 'चतुर्थी तिथि — मन्द हास्य से ब्रह्माण्ड-सृष्टि, अष्टभुजा',
      mantra: 'सुरासम्पूर्णकलशं रुधिराप्लुतमेव च। दधाना हस्तपद्माभ्यां कूष्माण्डा शुभदास्तु मे॥',
      desc: 'सृष्टि के आरम्भ में जब चारों ओर अन्धकार था, तब देवी के ईषत् हास्य से ब्रह्माण्ड रचा गया। मालपुआ का भोग व आरोग्यता विधान।',
      contentHtml: `
        <h4>१. स्वरूप एवं ध्यान</h4>
        <p>माँ दुर्गा का चौथा स्वरूप 'कूष्माण्डा' है। जब सृष्टि का अस्तित्व नहीं था और चारों ओर केवल अन्धकार व्याप्त था, तब इन्होंने अपने मन्द (ईषत्) हास्य से ब्रह्माण्ड की रचना की। अतः ये सृष्टि की आदि-स्वरूपा हैं। इनकी आठ भुजाएं हैं और ये सिंह पर आरूढ़ हैं। यह अनाहत चक्र की स्वामिनी हैं।</p>

        <h4>२. पौराणिक पावन कथा</h4>
        <p>सूर्य मण्डल के भीतर के लोक में निवास करने की क्षमता केवल इन्हीं देवी में है। इनके शरीर की कान्ति और प्रभा सूर्य के समान ही दैदीप्यमान है। संस्कृत में कुम्हड़े (पेठा) को कूष्माण्ड कहते हैं, और इस देवी को कूष्माण्ड की बलि (नैवेद्य) अति प्रिय है।</p>

        <h4>३. पूजन विधि एवं नैवेद्य</h4>
        <ul>
          <li>माता को नारंगी/लाल पुष्प, कुमकुम व अक्षत अर्पित करें।</li>
          <li><strong>विशेष भोग:</strong> माँ कूष्माण्डा को मालपुए का नैवेद्य अर्पित किया जाता है, जिससे बुद्धि का विकास और यश की प्राप्ति होती है।</li>
          <li>मन्त्र जप: <em>« ॐ कूष्माण्डायै नमः »</em>।</li>
        </ul>
      `
    },
    {
      id: 'navratri_day5',
      cat: 'navratri',
      badge: '🌸 पञ्चम नवरात्र',
      title: 'माँ स्कन्दमाता पूजन विधि एवं कथा',
      subtitle: 'पञ्चमी तिथि — कुमार कार्तिकेय की जननी, पद्मासना',
      mantra: 'सिंहासनगता नित्यं पद्माश्रितकरद्वया। शुभदास्तु सदा देवी स्कन्दमाता यशस्विनी॥',
      desc: 'भगवान स्कन्द (कार्तिकेय) को गोद में लिए चतुर्भुज रूप में विराजती हैं। केले का भोग, मोक्ष द्वार खोलने वाली एवं सन्तान-कल्याण की कथा।',
      contentHtml: `
        <h4>१. स्वरूप एवं ध्यान</h4>
        <p>नवदुर्गा का पांचवां स्वरूप 'स्कन्दमाता' है। भगवान स्कन्द (कार्तिकेय/मुरुगन), जो देवासुर संग्राम में देवताओं के सेनापति बने, उनकी माता होने के कारण इन्हें स्कन्दमाता कहा जाता है। माता चतुर्भुज हैं और कमल के आसन पर विराजने के कारण 'पद्मासना' भी कहलाती हैं। यह विशुद्ध चक्र की अधिष्ठात्री हैं।</p>

        <h4>२. पौराणिक पावन कथा</h4>
        <p>तारकासुर नामक महादैत्य ने कठोर तप कर केवल शिव-पुत्र के हाथों मृत्यु का वरदान प्राप्त किया था। उस समय शिव-पार्वती के तेज से जन्मे बालक कार्तिकेय (स्कन्द) ने देवताओं की रक्षा हेतु तारकासुर का वध किया। स्कन्दमाता की पूजा करने से भक्त को उनके साथ-साथ बालरूप स्कन्द की कृपा भी स्वतः प्राप्त हो जाती है।</p>

        <h4>३. पूजन विधि एवं नैवेद्य</h4>
        <ul>
          <li>माता को पीले पुष्प, अलसी व धूप अर्पित करें।</li>
          <li><strong>विशेष भोग:</strong> माँ स्कन्दमाता को कदली फल (केला) का भोग अति प्रिय है। इससे साधक को सुख-शान्ति और उत्तम सन्तति प्राप्त होती है।</li>
          <li>मन्त्र जप: <em>« ॐ देवी स्कन्दमातायै नमः »</em>।</li>
        </ul>
      `
    },
    {
      id: 'navratri_day6',
      cat: 'navratri',
      badge: '🌸 षष्ठ नवरात्र',
      title: 'माँ कात्यायनी पूजन विधि एवं कथा',
      subtitle: 'षष्ठी तिथि — महर्षि कात्यायन की कन्या, महिषासुर-घातिनी',
      mantra: 'चन्द्रहासोज्ज्वलकरा शार्दूलवरवाहना। कात्यायनी शुभं दद्याद्देवी दानवघातिनी॥',
      desc: 'गोपियों द्वारा श्रीकृष्ण को पति रूप में पाने के लिए कालिन्दी तट पर पूजन। मधु (शहद) का भोग, विवाह बाधा निवारण व शौर्य कथा।',
      contentHtml: `
        <h4>१. स्वरूप एवं ध्यान</h4>
        <p>माँ दुर्गा का छठा स्वरूप 'कात्यायनी' है। महर्षि कात्यायन की कठिन तपस्या से प्रसन्न होकर भगवती ने उनकी पुत्री के रूप में जन्म लिया, अतः कात्यायनी कहलाईं। देवी सिंह पर सवार हैं और इनके हाथ में चन्द्रहास खड्ग चमकता है। यह आज्ञा चक्र की स्वामिनी हैं।</p>

        <h4>२. पौराणिक पावन कथा एवं कात्यायनी व्रत</h4>
        <p>दशम स्कन्ध श्रीमद्भागवत के अनुसार द्वापर युग में ब्रज की गोपियों ने नन्दनन्दन भगवान श्रीकृष्ण को पति रूप में पाने के लिए यमुना तट पर मार्गशीर्ष मास में माँ कात्यायनी का ही पावन व्रत व पूजन किया था। इसी स्वरूप ने महिषासुर का संहार किया था।</p>

        <h4>३. पूजन विधि एवं नैवेद्य</h4>
        <ul>
          <li>विवाह में आ रही बाधाओं के निवारण हेतु माँ कात्यायनी की पूजा सर्वोत्तम मानी जाती है।</li>
          <li><strong>विशेष भोग:</strong> माँ कात्यायनी को शुद्ध मधु (शहद) का नैवेद्य अर्पित किया जाता है, जिससे रूप, तेज और आकर्षण की वृद्धि होती है।</li>
          <li>विवाह बाधा निवारक मन्त्र: <em>« कात्यायनि महामाये महायोगिन्यधीश्वरि। नन्दगोपसुतं देवि पतिं मे कुरु ते नमः॥ »</em></li>
        </ul>
      `
    },
    {
      id: 'navratri_day7',
      cat: 'navratri',
      badge: '🌸 सप्तम नवरात्र',
      title: 'माँ कालरात्रि पूजन विधि एवं कथा',
      subtitle: 'सप्तमी तिथि — अन्धकार-नाशिनी, निशा-पूजा व शुभङ्करी',
      mantra: 'एकवेणी जपाकर्णपूरा नग्ना खरास्थिता। लम्बोष्ठी कर्णिकाकर्णी तैलाभ्यक्तशरीरिणी॥',
      desc: 'रक्तबीज वध हेतु प्रकट विकराल किन्तु भक्तों के लिए शुभङ्करी स्वरूप। गुड़ का नैवेद्य, भय-मुक्ति एवं निशा-पूजा का विशेष विधान।',
      contentHtml: `
        <h4>१. स्वरूप एवं ध्यान</h4>
        <p>माँ दुर्गा की सातवीं शक्ति 'कालरात्रि' हैं। इनका वर्ण घने अन्धकार की भांति काला है, सिर के बाल बिखरे हुए हैं और गले में विद्युत की भांति चमकने वाली माला है। इनके तीन नेत्र हैं और नासिका से अग्नि की ज्वालाएं निकलती हैं। यह गर्दभ (गधे) पर सवार हैं। यह भक्तों को सदा शुभ फल देती हैं, अतः इन्हें 'शुभङ्करी' भी कहा जाता है।</p>

        <h4>२. पौराणिक पावन कथा</h4>
        <p>शुम्भ-निशुम्भ और रक्तबीज के संहार के समय जब रक्तबीज की एक-एक रक्त की बूंद से सहस्रों दानव उत्पन्न हो रहे थे, तब देवी चण्डिका ने अपने ललाट से कालरात्रि (काली) को प्रकट किया। कालरात्रि ने रक्तबीज के रक्त को पृथ्वी पर गिरने से पहले ही अपने मुख में भर लिया और समस्त दैत्यों का संहार किया।</p>

        <h4>३. पूजन विधि एवं नैवेद्य</h4>
        <ul>
          <li>सप्तमी की रात्रि में तंत्र व मन्त्र साधना की 'निशा-पूजा' का विशेष विधान है।</li>
          <li><strong>विशेष भोग:</strong> माँ कालरात्रि को गुड़ अथवा गुड़ से बने व्यंजनों का भोग अर्पित किया जाता है, जिससे आकस्मिक संकटों और भयों से मुक्ति मिलती है।</li>
          <li>मन्त्र जप: <em>« ॐ कालरात्र्यै नमः »</em> अथवा <em>« ॐ क्रीं कालिकायै नमः »</em>।</li>
        </ul>
      `
    },
    {
      id: 'navratri_day8',
      cat: 'navratri',
      badge: '🌸 महा अष्टमी',
      title: 'माँ महागौरी पूजन विधि एवं कन्या-पूजन',
      subtitle: 'अष्टमी तिथि — श्वेत वृषभारूढा, सन्धि-पूजा व कन्या-भोज',
      mantra: 'श्वेते वृषे समारूढा श्वेताम्बरधरा शुचिः। महागौरी शुभं दद्यान्महादेवप्रमोददा॥',
      desc: 'शिवजी की कृपा से गंगाजल स्नान द्वारा गौर वर्ण प्राप्त करने का आख्यान। नारियल व हलवा-पूरी का भोग, सन्धि पूजा व कन्या पूजन विधि।',
      contentHtml: `
        <h4>१. स्वरूप एवं ध्यान</h4>
        <p>माँ दुर्गा का आठवां स्वरूप 'महागौरी' है। इनका वर्ण पूर्णतः गौर (शंख और चन्द्रमा के समान धवल) है। इनकी आयु आठ वर्ष की मानी गई है। ये श्वेत वस्त्र और आभूषण धारण कर वृषभ पर आरूढ़ रहती हैं। इनके पूजन से पूर्वसंचित समस्त पाप भस्म हो जाते हैं।</p>

        <h4>२. पौराणिक पावन कथा</h4>
        <p>भगवान शिव को पाने के लिए जब देवी पार्वती ने कठोर तप किया, तो धूप, धूल और कड़े उपवास से उनका शरीर श्यामवर्ण (काला) हो गया। उनकी तपस्या से सन्तुष्ट होकर जब महादेव ने अपनी जटाओं से गंगाजल निकालकर देवी पर छिड़का, तो उनका शरीर विद्युत प्रभा के समान परम कान्तिमान और गौर हो गया। तब से वे 'महागौरी' कहलाईं।</p>

        <h4>३. कन्या पूजन विधान (कुमारी पूजन)</h4>
        <ol>
          <li>अष्टमी अथवा नवमी के दिन २ से १० वर्ष तक की कन्याओं (दुर्गा स्वरूपा) को सादर निमन्त्रित करें।</li>
          <li>उनके चरण धोकर चन्दन-रोली लगाएं और मौली बांधें।</li>
          <li>उन्हें हलवा, पूरी, चना और ऋतुफल का सात्विक भोजन कराएं।</li>
          <li>दक्षिणा, चुनरी व उपहार देकर चरण स्पर्श कर आशीर्वाद प्राप्त करें।</li>
        </ol>

        <h4>४. विशेष भोग</h4>
        <p>माँ महागौरी को नारियल का भोग लगाया जाता है। नारियल दान करने से सुख-समृद्धि की वृद्धि होती है।</p>
      `
    },
    {
      id: 'navratri_day9',
      cat: 'navratri',
      badge: '🌸 महानवमी',
      title: 'माँ सिद्धिदात्री पूजन, हवन एवं पूर्णाहुति',
      subtitle: 'नवमी तिथि — अष्ट-सिद्धि दात्री, नवार्ण हवन व विसर्जन',
      mantra: 'सिद्धगन्धर्वयक्षाद्यैरसुरैरमरैरपि। सेव्यमाना सदा भूयात् सिद्धिदा सिद्धिदायिनी॥',
      desc: 'भगवान शिव ने इन्हीं की कृपा से समस्त सिद्धियां व अर्धनारीश्वर रूप प्राप्त किया। चना, खीर, तिल का भोग, नवमी हवन व पूर्णाहुति विधान।',
      contentHtml: `
        <h4>१. स्वरूप एवं ध्यान</h4>
        <p>माँ दुर्गा का नौवां स्वरूप 'सिद्धिदात्री' है। ये समस्त प्रकार की सिद्धियों (अणिमा, महिमा, गरिमा, लघिमा, प्राप्ति, प्राकाम्य, ईशित्व, वशित्व) को देने वाली हैं। मार्कण्डेय पुराण के अनुसार अणिमादि आठ सिद्धियां इन्हीं की अनुकम्पा से प्राप्त होती हैं। देवी कमल पुष्प पर विराजमान हैं और सिंह भी इनका वाहन है।</p>

        <h4>२. पौराणिक पावन कथा</h4>
        <p>देवीपुराण के अनुसार भगवान शिव ने भी समस्त सिद्धियों की प्राप्ति के लिए इन्हीं सिद्धिदात्री भगवती की कठोर आराधना की थी। इनकी अनुकम्पा से ही भगवान शिव का आधा शरीर देवी का हुआ और वे लोक में 'अर्धनारीश्वर' के नाम से प्रसिद्ध हुए।</p>

        <h4>३. नवमी हवन एवं पूर्णाहुति विधान</h4>
        <ul>
          <li><strong>हवन सामग्री:</strong> हवन कुण्ड में आम की समिधा, कपूर, गूगल, लोबान, जौ, तिल, घी, पंचमेवा, बेलपत्र व बताशे का सम्मिश्रण बनाएं।</li>
          <li><strong>नवार्ण मन्त्र आहुति:</strong> <em>« ॐ ऐं ह्रीं क्लीं चामुण्डायै विच्चे स्वाहा »</em> (कम से कम १०८ आहुतियां)।</li>
          <li><strong>दुर्गा सप्तशती मन्त्र:</strong> सप्तशती के मन्त्रों अथवा सिद्ध-कुञ्जिका स्तोत्र से आहुति दें।</li>
          <li><strong>पूर्णाहुति:</strong> एक सूखे नारियल (गोला) में घी, सुपारी, लौंग, इलायची और दक्षिणा रखकर <em>« ॐ पूर्णमदः पूर्णमिदं... »</em> मन्त्र से कुण्ड में समर्पित करें।</li>
          <li>आरती कर कलश के पावन जल का पूरे घर में छिड़काव करें।</li>
        </ul>
      `
    },
    {
      id: 'navratri_durga_saptashati',
      cat: 'navratri',
      badge: '🌸 दुर्गा सप्तशती',
      title: 'श्री दुर्गा सप्तशती (चण्डी) पाठ क्रम व विधि',
      subtitle: 'मार्कण्डेय पुराणोक्त ७०० मन्त्रों का महाअनुष्ठान',
      mantra: 'ॐ ऐं ह्रीं क्लीं चामुण्डायै विच्चे॥',
      desc: 'नवार्ण मन्त्र जप, अर्गला, कीलक, कवच, रात्रि सूक्त, तेरह अध्याय तथा देवी सूक्त व क्षमा-प्रार्थना का पूर्ण प्रामाणिक क्रम।',
      contentHtml: `
        <h4>१. पाठ का शास्त्रीय अनुष्ठान क्रम</h4>
        <p>श्रीमार्कण्डेय पुराण के सावर्णि मन्वन्तर के अन्तर्गत आने वाले ७०० श्लोकों के इस महाग्रन्थ का पाठ समस्त मनोकामनाओं की पूर्ति और विघ्न-विनाशक है।</p>

        <h4>२. दैनिक पाठ का प्रामाणिक क्रम</h4>
        <ol>
          <li><strong>आचमन, प्राणायाम एवं पवित्रिकरण:</strong> शुद्ध आसन पर बैठकर पवित्री धारण करें।</li>
          <li><strong>संकल्प:</strong> दायें हाथ में जल, अक्षत व पुष्प लेकर अभीष्ट कामना का संकल्प लें।</li>
          <li><strong>शापोद्धार व उत्कीलन:</strong> वसिष्ठ-विश्वामित्र शापोद्धार मन्त्र जपें।</li>
          <li><strong>पूर्व अङ्ग पाठ:</strong>
            <ul>
              <li>श्री दुर्गा कवच (सुरक्षा चक्र)</li>
              <li>अर्गला स्तोत्र (सौभाग्य एवं विजय)</li>
              <li>कीलक स्तोत्र (मन्त्रों की शक्ति का उन्मीलन)</li>
              <li>वैदिक/तान्त्रोक्त रात्रि सूक्त</li>
            </ul>
          </li>
          <li><strong>नवार्ण मन्त्र जप:</strong> <em>« ॐ ऐं ह्रीं क्लीं चामुण्डायै विच्चे »</em> (१०८ बार)।</li>
          <li><strong>मूल सप्तशती पाठ:</strong> प्रथम से त्रयोदश अध्याय (१३ अध्याय) का पाठ।</li>
          <li><strong>उत्तर अङ्ग पाठ:</strong>
            <ul>
              <li>ऋग्वेदोक्त / तन्त्रोक्त देवी सूक्त</li>
              <li>प्राधानिक, वैकृतिक एवं मूर्ति रहस्य</li>
              <li>सिद्ध-कुञ्जिका स्तोत्र</li>
              <li>अपराध क्षमा-प्रार्थना स्तोत्र (<em>« न मन्त्रं नो यन्त्रं तदपि च न जाने स्तुतिमहो... »</em>)</li>
            </ul>
          </li>
        </ol>
      `
    },

    // ----------------- एकादशी व्रत (पावन कथाएं व महात्म्य) -----------------
    {
      id: 'ekadashi_nirjala',
      cat: 'ekadashi',
      badge: '🪷 ज्येष्ठ शुक्ल',
      title: 'निर्जला (भीमसेनी) एकादशी व्रत कथा व विधि',
      subtitle: 'समस्त २४ एकादशियों के फल को प्रदान करने वाला महाव्रत',
      mantra: 'ॐ नमो भगवते वासुदेवाय॥',
      desc: 'बिना जल ग्रहण किए केवल एक दिन के नियम से वर्ष भर की एकादशियों का पुण्य। महर्षि व्यास द्वारा महाबली भीमसेन को उपदेश।',
      contentHtml: `
        <h4>१. व्रत का माहात्म्य</h4>
        <p>ज्येष्ठ मास के शुक्ल पक्ष की एकादशी को 'निर्जला एकादशी' कहते हैं। इसे पाण्डव एकादशी अथवा भीमसेनी एकादशी भी कहा जाता है। इस व्रत में सूर्योदय से अगले दिन द्वादशी के सूर्योदय तक जल भी ग्रहण नहीं किया जाता, इसलिए यह 'निर्जला' कहलाती है।</p>

        <h4>२. पौराणिक पावन कथा</h4>
        <p>महाभारत काल में जब महर्षि वेदव्यास जी ने पाण्डवों को प्रत्येक पक्ष की एकादशी व्रत करने का निर्देश दिया, तब पाण्डुपुत्र भीमसेन ने करबद्ध होकर निवेदन किया:</p>
        <p><em>« हे पितामह! युधिष्ठिर, अर्जुन, नकुल, सहदेव और द्रौपदी तो एकादशी का उपवास कर लेते हैं, परन्तु मेरे उदर में स्थित 'वृक' नामक अग्नि भोजन किए बिना शान्त नहीं होती। भूख सहन करना मेरे लिए असम्भव है। कृपया मुझे ऐसा कोई एक व्रत बताएं जिससे बिना भूखे मरे मुझे सम्पूर्ण एकादशियों का फल प्राप्त हो सके। »</em></p>
        <p>व्यास जी ने कहा: <em>« हे भीम! यदि तुम वर्ष भर की समस्त एकादशियों का फल पाना चाहते हो, तो ज्येष्ठ शुक्ल पक्ष की एकादशी को निर्जल (बिना जल पिए) रहो। इस एक दिन के व्रत से मनुष्य वर्ष भर की २४ एकादशियों के फल को प्राप्त कर परम पद को जाता है। »</em> तब भीमसेन ने इस कठोर व्रत का पालन किया।</p>

        <h4>३. पारण एवं दान विधान</h4>
        <ul>
          <li>द्वादशी के दिन प्रातः स्नान कर भगवान विष्णु का षोडशोपचार पूजन करें।</li>
          <li>जल से भरा मिट्टी का कलश, पंखा, छाता, खरबूजा और वस्त्र ब्राह्मण को दान करें।</li>
          <li>सर्वप्रथम ब्राह्मण को भोजन कराकर स्वयं जल और सात्विक आहार ग्रहण कर पारण करें।</li>
        </ul>
      `
    },
    {
      id: 'ekadashi_mokshada',
      cat: 'ekadashi',
      badge: '🪷 मार्गशीर्ष शुक्ल',
      title: 'मोक्षदा एकादशी एवं गीता जयन्ती कथा',
      subtitle: 'पितरों के मोक्ष का मार्ग प्रशस्त करने वाली पावन तिथि',
      mantra: 'यदा यदा हि धर्मस्य ग्लानिर्भवति भारत। अभ्युत्थानमधर्मस्य तदात्मानं सृजाम्यहम्॥',
      desc: 'कुरुक्षेत्र की पावन भूमि पर भगवान श्रीकृष्ण द्वारा अर्जुन को गीता ज्ञान प्रदान करने का दिन। राजा वैखानस के पितृ-मुक्ति की कथा।',
      contentHtml: `
        <h4>१. माहात्म्य एवं गीता जयन्ती</h4>
        <p>मार्गशीर्ष (अगहन) मास के शुक्ल पक्ष की एकादशी 'मोक्षदा एकादशी' कहलाती है। इसी परम पावन दिन महाभारत युद्ध के आरम्भ में भगवान श्रीकृष्ण ने अर्जुन को कुरुक्षेत्र में श्रीमद्भगवद्गीता का अमर उपदेश दिया था, अतः इस दिन 'गीता जयन्ती' भी मनाई जाती है।</p>

        <h4>२. राजा वैखानस एवं पितृ-उद्धार कथा</h4>
        <p>प्राचीन काल में चम्पक नगर में राजा वैखानस राज्य करते थे। एक रात्रि स्वप्न में उन्होंने अपने पिता को यमलोक के घोर नर्क में यातनाएं भोगते देखा। दुःखी होकर राजा ने पर्वत मुनि के आश्रम जाकर इसका कारण और उपाय पूछा।</p>
        <p>पर्वत मुनि ने दिव्य दृष्टि से देखकर बताया कि राजा के पिता ने पूर्वजन्म में अपनी एक रानी के प्रति अन्याय किया था, जिसके पापवश वे नर्क भोग रहे हैं। मुनि ने राजा को मार्गशीर्ष शुक्ल एकादशी (मोक्षदा) का सविधि व्रत रखने और उसका पुण्य पिता को समर्पित करने का निर्देश दिया।</p>
        <p>राजा वैखानस ने परिवार सहित विधिपूर्वक व्रत कर उसका सम्पूर्ण पुण्य अपने पिता को अर्पण किया। तत्क्षण उनके पिता नर्क की यातनाओं से मुक्त होकर दिव्य विमान पर बैठकर स्वर्गलोक को चले गए।</p>

        <h4>३. पूजन व गीता पाठ विधान</h4>
        <ul>
          <li>भगवान दामोदर (विष्णु) की धूप, दीप व तुलसीदल से पूजा करें।</li>
          <li>श्रीमद्भगवद्गीता के सम्पूर्ण १८ अध्यायों अथवा कम से कम ११वें व १२वें अध्याय का पाठ करें।</li>
        </ul>
      `
    },
    {
      id: 'ekadashi_devshayani',
      cat: 'ekadashi',
      badge: '🪷 आषाढ़ शुक्ल',
      title: 'हरिशयनी (देवशयनी) एकादशी व्रत कथा',
      subtitle: 'चातुर्मास महाव्रत प्रारम्भ — भगवान विष्णु का योगनिद्रा में गमन',
      mantra: 'सुप्ते त्वयि जगन्नाथ जगत् सुप्तं भवेदिदम्। विबुद्धे त्वयि बुद्धं च प्रसन्नो मे भवाच्युत॥',
      desc: 'राजा मान्धाता के राज्य में अकाल निवारण कथा। भगवान नारायण क्षीरसागर में शेषशय्या पर चार मास शयन करते हैं।',
      contentHtml: `
        <h4>१. चातुर्मास प्रारम्भ एवं महत्त्व</h4>
        <p>आषाढ़ मास के शुक्ल पक्ष की एकादशी को 'देवशयनी' या 'हरिशयनी' एकादशी कहते हैं। इस दिन से भगवान विष्णु चार मास के लिए क्षीरसागर में योगनिद्रा में शयन करते हैं। इन चार महीनों (चातुर्मास) में विवाह, यज्ञोपवीत, गृहप्रवेश आदि समस्त मांगलिक कार्य वर्जित रहते हैं और केवल जप, तप, ध्यान व स्वाध्याय किया जाता है।</p>

        <h4>२. राजा मान्धाता की पावन कथा</h4>
        <p>सूर्यवंश में मान्धाता नाम के एक चक्रवर्ती राजा हुए। एक समय उनके राज्य में लगातार तीन वर्षों तक वर्षा नहीं हुई, जिससे भीषण अकाल पड़ गया। प्रजा त्राहि-त्राहि करने लगी। राजा व्याकुल होकर वन में अंगिरा ऋषि के आश्रम पहुंचे।</p>
        <p>अंगिरा ऋषि ने राजा को आषाढ़ शुक्ल पक्ष की एकादशी का सपरिवार व्रत करने का परामर्श दिया। राजा मान्धाता ने प्रजा सहित विधिपूर्वक देवशयनी एकादशी का व्रत किया। व्रत के प्रभाव से मेघ उमड़ पड़े और मूसलाधार वर्षा हुई, जिससे सम्पूर्ण राज्य पुनः धन-धान्य से परिपूर्ण हो गया।</p>

        <h4>३. शयन मन्त्र</h4>
        <p>रात्रि में भगवान को सुसज्जित शय्या पर शयन कराते समय यह प्रार्थना करें:</p>
        <blockquote style="margin: 0.8rem 0; padding: 0.6rem 1rem; background: rgba(224,86,36,0.08); border-left: 3px solid var(--accent-gold); font-family: var(--font-sanskrit);">
          सुप्ते त्वयि जगन्नाथ जगत् सुप्तं भवेदिदम्।<br>
          विबुद्धे त्वयि बुद्धं च प्रसन्नो मे भवाच्युत॥
        </blockquote>
      `
    },
    {
      id: 'ekadashi_prabodhini',
      cat: 'ekadashi',
      badge: '🪷 कार्तिक शुक्ल',
      title: 'देवप्रबोधिनी (देवउठनी) एकादशी एवं तुलसी विवाह',
      subtitle: 'चातुर्मास समापन — श्रीहरि का जागरण व मांगलिक कार्य प्रारम्भ',
      mantra: 'उत्तिष्ठोत्तिष्ठ गोविन्द उत्तिष्ठ गरुड़ध्वज। उत्तिष्ठ कमलाकान्त त्रैलोक्यं मङ्गलं कुरु॥',
      desc: 'भगवान विष्णु का जागरण गान, तुलसी-शालिग्राम पाणिग्रहण उत्सव, ईख (गन्ना) व ऋतुफलों का अर्पण एवं पापनाशक कथा।',
      contentHtml: `
        <h4>१. माहात्म्य एवं तुलसी विवाह</h4>
        <p>कार्तिक शुक्ल पक्ष की एकादशी को 'देवप्रबोधिनी', 'देवउठनी' अथवा 'प्रबोधिनी एकादशी' कहा जाता है। चार मास के शयन के पश्चात इसी दिन भगवान विष्णु योगनिद्रा से जागते हैं। इस दिन से समस्त शुभ एवं मांगलिक कार्यों का शुभारम्भ हो जाता है। इसी पावन तिथि को तुलसी जी का विवाह भगवान शालिग्राम के साथ रचाया जाता है।</p>

        <h4>२. भगवान जागरण मन्त्र</h4>
        <blockquote style="margin: 0.8rem 0; padding: 0.6rem 1rem; background: rgba(224,86,36,0.08); border-left: 3px solid var(--accent-vermilion); font-family: var(--font-sanskrit);">
          उत्तिष्ठोत्तिष्ठ गोविन्द त्यज निद्रां जगत्पते।<br>
          त्वयि सुप्ते जगत् सुप्तमुत्थिते चोत्थितं भवेत्॥<br>
          उत्तिष्ठोत्तिष्ठ गोविन्द उत्तिष्ठ गरुड़ध्वज।<br>
          उत्तिष्ठ कमलाकान्त त्रैलोक्यं मङ्गलं कुरु॥
        </blockquote>

        <h4>३. पूजन विधान</h4>
        <ul>
          <li>आंगन में गेरू और चूने से भगवान के चरण-चिह्न बनाएं।</li>
          <li>ईख (गन्ना) का मण्डप बनाकर उसमें भगवान शालिग्राम और तुलसी के पौधे को स्थापित करें।</li>
          <li>सिंघाड़ा, बेर, शकरकन्द, मूली और ऋतुफल अर्पित करें।</li>
          <li>शंख, घण्टी और मृदंग बजाकर भगवान को जगाएं और दीपदान करें।</li>
        </ul>
      `
    },

    // ----------------- शिव व शक्ति व्रत (प्रदोष, शिवरात्रि, तीज) -----------------
    {
      id: 'vrat_pradosh',
      cat: 'shiv',
      badge: '🔱 त्रयोदशी तिथि',
      title: 'प्रदोष व्रत (सोम, भौम व शनि) पूजन विधि व कथा',
      subtitle: 'सायंकाल प्रदोष बेला में भगवान शिव-पार्वती का सान्निध्य',
      mantra: 'त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम्। उर्वारुकमिव बन्धनान्मृत्योर्मुक्षीय मामृतात्॥',
      desc: 'वार अनुसार विभिन्न फल: सोम प्रदोष (मनोकामना), भौम (ऋण-मुक्ति), शनि (आयु-आरोग्य व सन्तति)। सायंकाल अभिषेक व कथा श्रवण।',
      contentHtml: `
        <h4>१. प्रदोष काल का महत्त्व</h4>
        <p>प्रत्येक मास के दोनों पक्षों (शुक्ल व कृष्ण) की त्रयोदशी तिथि को प्रदोष व्रत रखा जाता है। सूर्यास्त से लगभग ४५ मिनट पूर्व और ४५ मिनट पश्चात का समय 'प्रदोष काल' कहलाता है। स्कन्द पुराण के अनुसार इस समय देवाधिदेव महादेव कैलाश पर्वत पर रजत भवन में आनन्द-ताण्डव करते हैं और समस्त देवी-देवता उनकी स्तुति करते हैं।</p>

        <h4>२. वार के अनुसार फल</h4>
        <ul>
          <li><strong>सोम प्रदोष:</strong> मनोकामना पूर्ति एवं शान्ति।</li>
          <li><strong>भौम प्रदोष (मंगलवार):</strong> रोगों से मुक्ति एवं ऋण-निवारण (कर्ज मुक्ति)।</li>
          <li><strong>शनि प्रदोष:</strong> सन्तान प्राप्ति एवं शनि की साढ़ेसाती-ढैया के कष्टों का शमन।</li>
          <li><strong>रवि व गुरु प्रदोष:</strong> यश, आरोग्य, आयु एवं विद्या की प्राप्ति।</li>
        </ul>

        <h4>३. पूजन विधि</h4>
        <ol>
          <li>दिनभर उपवास रहकर सायंकाल सूर्यास्त के समय पुनः स्नान कर स्वच्छ श्वेत अथवा पीले वस्त्र पहनें।</li>
          <li>उत्तर अथवा पूर्व दिशा की ओर मुख कर शिवलिंग का पञ्चामृत (दूध, दही, घी, शहद, गंगाजल) से अभिषेक करें।</li>
          <li>बिल्वपत्र (बेलपत्र), धतूरा, भांग, सफेद चन्दन, अक्षत और मदार के पुष्प अर्पित करें।</li>
          <li>प्रदोष व्रत कथा का श्रवण करें और 'ॐ नमः शिवाय' मन्त्र का जप करते हुए आरती करें।</li>
        </ol>
      `
    },
    {
      id: 'vrat_mahashivratri',
      cat: 'shiv',
      badge: '🔱 फाल्गुन कृष्ण चतुर्दशी',
      title: 'महाशिवरात्रि चार प्रहर पूजन विधि एवं कथा',
      subtitle: 'शिव-शक्ति मिलन की महारात्रि — ज्योतिर्लिंग प्राकट्य',
      mantra: 'ॐ तत्पुरुषाय विद्महे महादेवाय धीमहि तन्नो रुद्रः प्रचोदयात्॥',
      desc: 'प्रथम प्रहर (दुग्ध), द्वितीय (दधि), तृतीय (घृत), चतुर्थ (मधु) अभिषेक विधान। चित्रभानु राजा व लुब्धक (व्याध) की मोक्षप्रद कथा।',
      contentHtml: `
        <h4>१. महाशिवरात्रि का तात्विक रहस्य</h4>
        <p>फाल्गुन मास के कृष्ण पक्ष की चतुर्दशी तिथि को 'महाशिवरात्रि' महापर्व मनाया जाता है। ईशान संहिता के अनुसार इसी महारात्रि को करोड़ों सूर्यों के समान तेजस्वी आदि-अनादि ज्योतिर्लिंग का प्राकट्य हुआ था। इसी रात्रि को भगवान शिव और माता पार्वती का पावन पाणिग्रहण संस्कार सम्पन्न हुआ था।</p>

        <h4>२. चार प्रहर की शास्त्रीय पूजा का विधान</h4>
        <table style="width: 100%; border-collapse: collapse; margin: 1rem 0; font-size: 0.95rem;">
          <tr style="background: rgba(224,86,36,0.1); border-bottom: 2px solid var(--accent-vermilion);">
            <th style="padding: 0.6rem; text-align: left;">प्रहर</th>
            <th style="padding: 0.6rem; text-align: left;">अभिषेक द्रव्य</th>
            <th style="padding: 0.6rem; text-align: left;">विशेष फल</th>
          </tr>
          <tr style="border-bottom: 1px solid var(--border-subtle);">
            <td style="padding: 0.6rem;"><strong>प्रथम प्रहर (सायं ६ से ९)</strong></td>
            <td style="padding: 0.6rem;">शुद्ध गाय का कच्चा दूध</td>
            <td style="padding: 0.6rem;">धर्म एवं चित्त की शान्ति</td>
          </tr>
          <tr style="border-bottom: 1px solid var(--border-subtle);">
            <td style="padding: 0.6rem;"><strong>द्वितीय प्रहर (रात्रि ९ से १२)</strong></td>
            <td style="padding: 0.6rem;">दही (दधि)</td>
            <td style="padding: 0.6rem;">ऐश्वर्य व अर्थ की प्राप्ति</td>
          </tr>
          <tr style="border-bottom: 1px solid var(--border-subtle);">
            <td style="padding: 0.6rem;"><strong>तृतीय प्रहर (रात्रि १२ से ३)</strong></td>
            <td style="padding: 0.6rem;">गाय का शुद्ध घी (घृत)</td>
            <td style="padding: 0.6rem;">काम एवं कामनाओं की शुद्धि</td>
          </tr>
          <tr>
            <td style="padding: 0.6rem;"><strong>चतुर्थ प्रहर (रात्रि ३ से प्रातः ६)</strong></td>
            <td style="padding: 0.6rem;">शुद्ध मधु (शहद) एवं गन्ने का रस</td>
            <td style="padding: 0.6rem;">मोक्ष एवं शिव-सायुज्य</td>
          </tr>
        </table>

        <h4>३. लुब्धक (व्याध) की प्रसिद्ध कथा</h4>
        <p>एक व्याध अनजाने में शिवरात्रि की रात्रि को बेल के वृक्ष पर चढ़कर पत्तियां तोड़कर नीचे स्थित शिवलिंग पर गिराता रहा और चारों प्रहर उपवास रहा। भगवान शिव ने उसके अनजाने में किए गए पूजन से भी प्रसन्न होकर उसे मोक्ष प्रदान किया।</p>
      `
    },
    {
      id: 'vrat_hartalika_teej',
      cat: 'shiv',
      badge: '🔱 भाद्रपद शुक्ल तृतीया',
      title: 'हरितालिका तीज व्रत विधि एवं कथा',
      subtitle: 'अखण्ड सौभाग्य व शिव समान वर प्राप्ति का निर्जल महाव्रत',
      mantra: 'उमामहेश्वराभ्यां नमः। देवि प्रसीद शिवसङ्गिनि पाहि मां त्वम्॥',
      desc: 'माता पार्वती द्वारा सखियों द्वारा वन में हरण कर रेत के शिवलिंग निर्माण व घोर तपस्या की पावन कथा। फुलेरा बन्धन व जागरण।',
      contentHtml: `
        <h4>१. व्रत का नामकरण एवं महत्त्व</h4>
        <p>'हरितालिका' शब्द दो शब्दों से मिलकर बना है — 'हरित' (हरण करना) और 'आलिका' (सखी)। माता पार्वती की सखियां उन्हें उनके पिता हिमालय की इच्छा के विरुद्ध घने वन में हरण कर ले गई थीं ताकि वे अपनी इच्छा अनुसार महादेव को प्राप्त करने हेतु निष्कण्टक तपस्या कर सकें।</p>

        <h4>२. पौराणिक पावन कथा</h4>
        <p>पर्वतराज हिमालय अपनी पुत्री पार्वती का विवाह भगवान विष्णु से कराना चाहते थे, परन्तु पार्वती जी मन ही मन शिवजी को वरण कर चुकी थीं। सखियों के सहयोग से वन में एक गुफा में रहकर माता पार्वती ने भाद्रपद शुक्ल तृतीया को हस्त नक्षत्र में बालू (रेत) का शिवलिंग बनाकर निर्जल तप किया।</p>
        <p>पार्वती जी के इस अगाध प्रेम व तप से सन्तुष्ट होकर भगवान शिव प्रकट हुए और उन्हें अपनी अर्द्धांगिनी बनाने का वरदान दिया।</p>

        <h4>३. पूजन विधि</h4>
        <ul>
          <li>सुहागिन स्त्रियां एवं कुंवारी कन्याएं सम्पूर्ण दिन और रात्रि निर्जला व्रत रखती हैं।</li>
          <li>मिट्टी अथवा बालू से शिव, पार्वती एवं गणेश जी की प्रतिमा बनाएं।</li>
          <li>केले के खम्भों का मण्डप सजाकर सुहाग पिटारी (१६ श्रृंगार) माता पार्वती को अर्पित करें।</li>
          <li>चारों प्रहर की आरती करें और रात्रि जागरण करें। अगले दिन प्रातः नदी में विसर्जन के पश्चात पारण करें।</li>
        </ul>
      `
    },

    // ----------------- महापर्व व नैमित्तिक पूजन -----------------
    {
      id: 'vrat_karwa_chauth',
      cat: 'parva',
      badge: '🪔 कार्तिक कृष्ण चतुर्थी',
      title: 'करवा चौथ (करक चतुर्थी) पूजन विधि व कथा',
      subtitle: 'पति की दीर्घायु एवं दाम्पत्य सौख्य हेतु निर्जल व्रत',
      mantra: 'मम सुखसौभाग्यपुत्रपौत्रादिस्थिरसुसंपदभिवृद्धये करकचतुर्थीव्रतमहं करिष्ये॥',
      desc: 'वीरवती की प्रामाणिक व्रत कथा, करवा माता की पूजा, चलनी से चन्द्र दर्शन, अर्घ्य समर्पण एवं पति पूजन विधान।',
      contentHtml: `
        <h4>१. करवा चौथ का स्वरूप</h4>
        <p>कार्तिक मास के कृष्ण पक्ष की चतुर्थी को 'करक चतुर्थी' अथवा 'करवा चौथ' कहा जाता है। यह सुहागिन स्त्रियों का सर्वाधिक श्रद्धास्पद व्रत है, जिसे वे अपने पति की दीर्घायु, उत्तम स्वास्थ्य एवं अखण्ड सौभाग्य की कामना से निर्जल रखती हैं।</p>

        <h4>२. रानी वीरवती की पावन कथा</h4>
        <p>प्राचीन काल में वीरवती नाम की एक पतिव्रता कन्या थी। सात भाइयों की इकलौती बहन होने के कारण वह सभी की अति लाडली थी। विवाह के उपरान्त जब उसने प्रथम करवा चौथ का निर्जल व्रत रखा, तो भूख-प्यास से उसकी दशा व्याकुल हो गई।</p>
        <p>भाइयों से बहन का कष्ट देखा न गया। उन्होंने दूर पीपल के वृक्ष की ओट में जलती हुई मशाल और छलनी रखकर बहन को चन्द्रोदय होने का आभास कराया। वीरवती ने अर्घ्य देकर जैसे ही भोजन का प्रथम ग्रास उठाया, उसे अपने पति के अस्वस्थ होने का समाचार मिला।</p>
        <p>माता इन्द्राणी के परामर्श पर वीरवती ने वर्ष भर के प्रत्येक मास की चतुर्थी का व्रत किया और अगले वर्ष पुनः विधिपूर्वक करवा चौथ का अखण्ड व्रत रखकर चन्द्रमा को अर्घ्य दिया, जिससे उसका पति पुनः पूर्ण स्वस्थ व दीर्घायु हो गया।</p>

        <h4>३. पूजन विधान</h4>
        <ul>
          <li>सायंकाल दीवार पर करवा चौथ का चित्र (करवा माता) बनाकर रोली, अक्षत, गेहूं व गुड़ से पूजा करें।</li>
          <li>मिट्टी के करवे में जल भरकर उस पर गेहूं और शक्कर से भरा ढक्कन रखें।</li>
          <li>करवा चौथ की कथा सुनें और आपस में 'करवा फेरने' की परम्परा निभाएं।</li>
          <li>चन्द्रोदय होने पर छलनी में दीपक रखकर पहले चन्द्रदेव का दर्शन करें, अर्घ्य दें, फिर छलनी से पतिदेव का दर्शन कर आशीर्वाद लें।</li>
        </ul>
      `
    },
    {
      id: 'pujan_deepawali',
      cat: 'parva',
      badge: '🪔 कार्तिक अमावस्या',
      title: 'दीपावली श्री महालक्ष्मी-गणेश-कुबेर पूजन विधि',
      subtitle: 'प्रदोष काल एवं निशीथ काल — स्थिर लग्न महापूजन',
      mantra: 'ॐ श्रीं ह्रीं क्लीं त्रिभुवनमहाकलक्ष्म्यै अस्माकं दारिद्र्य नाशय प्रचुर धन देहि क्लीं ह्रीं श्रीं ॐ॥',
      desc: 'कलश पूजन, षोडशोपचार महालक्ष्मी अर्चन, श्रीसूक्त-कनकधारा पाठ, बहीखाता (लेखनी) पूजन, दीप-मालिका एवं कुबेर पूजन का सम्पूर्ण क्रम।',
      contentHtml: `
        <h4>१. दीपावली पूजन का शास्त्रीय महत्त्व</h4>
        <p>कार्तिक अमावस्या की पावन निशा में समुद्र-मन्थन से क्षीरसागर-तनया भगवती महालक्ष्मी का प्राकट्य हुआ था। इसी दिन मर्यादा पुरुषोत्तम भगवान श्री राम १४ वर्ष के वनवास के पश्चात लंका विजय कर अयोध्या लौटे थे। प्रदोष काल में स्थिर लग्न (वृषभ/सिंह) में महालक्ष्मी पूजन श्रेष्ठ माना जाता है।</p>

        <h4>२. क्रमबद्ध पूजन विधि</h4>
        <ol>
          <li><strong>चौकी सज्जा:</strong> ईशान कोण अथवा उत्तर दिशा में लाल वस्त्र बिछाकर लकड़ी की चौकी पर चावलों से नवग्रह व अष्टदल कमल बनाएं।</li>
          <li><strong>प्रतिमा स्थापना:</strong> चौकी के मध्य में माँ लक्ष्मी और उनके दाईं ओर विघ्नहर्ता भगवान श्री गणेश की प्रतिमा स्थापित करें। पास में कुबेर यन्त्र या चित्र रखें।</li>
          <li><strong>कलश पूजन:</strong> जल से भरा कलश स्थापित कर वरुण देव का आवाहन करें।</li>
          <li><strong>षोडशोपचार पूजन:</strong> पाद्य, अर्घ्य, आचमन, पञ्चामृत स्नान, शुद्धोदक स्नान, वस्त्र, यज्ञोपवीत, गन्ध (चन्दन), अक्षत, कमल पुष्प, धूप, दीप, नैवेद्य (खीर, बताशे, फल), ताम्बूल और दक्षिणा अर्पित करें।</li>
          <li><strong>बहीखाता एवं लेखनी पूजन:</strong> व्यापारी बन्धु नव-वर्ष के लेखा-जोखा हेतु कलम, दवात व बहीखातों पर स्वस्तिक बनाकर पूजन करें।</li>
          <li><strong>दीप-मालिका प्रज्वलन:</strong> सर्वप्रथम माता लक्ष्मी के सम्मुख चौमुखा घी का दीपक जलाएं, तदुपरान्त २१, ५१ अथवा १०८ दीपकों को घर की चौखट, मुण्डेर और तुलसी के क्यारे में सजाएं।</li>
          <li><strong>स्तोत्र पाठ:</strong> श्रीसूक्त, कनकधारा स्तोत्र अथवा महालक्ष्मी अष्टकम् का पाठ करें।</li>
        </ol>
      `
    },
    {
      id: 'katha_satyanarayan',
      cat: 'parva',
      badge: '🪔 पूर्णिमा / संक्रान्ति',
      title: 'श्री सत्यनारायण व्रत कथा एवं पूजन विधान',
      subtitle: 'रेवाखण्डे स्कन्दपुराणोक्त पञ्चाध्याय पावन कथा',
      mantra: 'नमो भगवते वासुदेवाय। सत्यनारायणाय नमो नमः॥',
      desc: 'शतानन्द विप्र, काष्ठ-विक्रेता भील, साधु वैश्य एवं राजा तुंगध्वज के पाँच अध्यायों की कथा, पञ्चामृत एवं सवाया पञ्जीरी प्रसाद विधान।',
      contentHtml: `
        <h4>१. सत्यनारायण व्रत का माहात्म्य</h4>
        <p>स्कन्द पुराण के रेवाखण्ड के अनुसार कलियुग में सबसे सरल और अभीष्ट फल देने वाला अनुष्ठान 'श्री सत्यनारायण व्रत' है। इस व्रत का मूल सिद्धान्त है — सत्य का आचरण, सत्य का ध्यान और प्रभु का कीर्तन। किसी भी मास की पूर्णिमा, संक्रान्ति अथवा पारिवारिक मांगलिक अवसर पर यह कथा श्रवण की जाती है।</p>

        <h4>२. पञ्चाध्याय कथा का संक्षिप्त सार</h4>
        <ul>
          <li><strong>प्रथम अध्याय:</strong> महर्षि नारद के पूछने पर भगवान नारायण द्वारा कलियुग में क्लेश-मुक्ति हेतु सत्यनारायण व्रत का उपदेश।</li>
          <li><strong>द्वितीय अध्याय:</strong> काशी के निर्धन ब्राह्मण शतानन्द और एक दरिद्र काष्ठ-विक्रेता (लकड़हारे) द्वारा व्रत करने पर अपार सुख व मोक्ष प्राप्ति।</li>
          <li><strong>तृतीय अध्याय:</strong> सन्तान प्राप्ति हेतु साधु वैश्य द्वारा व्रत का संकल्प, कन्या कलावती का जन्म, परन्तु अहंकारवश व्रत भूल जाने पर बन्धन व संकट।</li>
          <li><strong>चतुर्थ अध्याय:</strong> समुद्र में साधु वैश्य की नौकाओं का रतन-मिश्रित धन में बदलना, राजा चन्द्रकेतु द्वारा कारागार मुक्ति, और प्रसाद का निरादर करने पर पुनः संकट व क्षमा-याचना।</li>
          <li><strong>पञ्चम अध्याय:</strong> राजा तुंगध्वज द्वारा गोप-बालकों के सत्यनारायण प्रसाद की उपेक्षा करने पर सम्पूर्ण राज्य व पुत्रों का नाश, और पश्चाताप कर पुनः व्रत करने पर सब कुछ वापस मिलना।</li>
        </ul>

        <h4>३. विशेष सवाया प्रसाद विधान</h4>
        <ul>
          <li>गेहूं का आटा (सवा सेर/सवा पाव), शुद्ध घी और चीनी/बूरा को भूनकर पञ्जीरी बनाएं।</li>
          <li>उसमें केला, तुलसी दल, मेवा और पञ्चामृत (दूध, दही, घी, शहद, गंगाजल) मिलाएं।</li>
          <li>कथा श्रवण के उपरान्त आरती करें और सर्वप्रथम सभी में प्रसाद वितरण कर स्वयं ग्रहण करें।</li>
        </ul>
      `
    }
  ];

  // Render Vrat Pujanam into Dedicated View
  function renderVratPujanam(category = 'all', searchQuery = '') {
    if (!DOM.vratCardsGrid) return;
    const q = (searchQuery || '').trim().toLowerCase();

    const filtered = vratList.filter(item => {
      // Category filter
      if (category !== 'all' && item.cat !== category) return false;
      // Search filter
      if (!q) return true;
      return item.title.toLowerCase().includes(q) ||
             (item.subtitle && item.subtitle.toLowerCase().includes(q)) ||
             (item.badge && item.badge.toLowerCase().includes(q)) ||
             (item.desc && item.desc.toLowerCase().includes(q)) ||
             (item.mantra && item.mantra.toLowerCase().includes(q));
    });

    if (DOM.vratCountIndicator) {
      DOM.vratCountIndicator.textContent = q || category !== 'all'
        ? `${toDevanagari(filtered.length)} व्रत प्राप्त`
        : `${toDevanagari(vratList.length)} प्रमुख पावन व्रत`;
    }

    if (filtered.length === 0) {
      DOM.vratCardsGrid.innerHTML = `
        <div class="empty-purana-search" style="grid-column: 1 / -1; padding: 2.5rem 1rem;">
          🌸 "<strong>${escapeHtml(searchQuery)}</strong>" से मेल खाता कोई व्रत अथवा पूजन विधि प्राप्त नहीं हुई।<br>
          <span style="font-size: 0.9rem; color: var(--text-muted); margin-top: 0.5rem; display: block;">
            अन्य शब्द से खोजें अथवा ऊपर दिए गए वर्गों (नवरात्र, एकादशी, शिव-शक्ति, महापर्व) का चयन करें।
          </span>
        </div>
      `;
      return;
    }

    DOM.vratCardsGrid.innerHTML = filtered.map(item => {
      let tagClass = 'tag-navratri';
      if (item.cat === 'ekadashi') tagClass = 'tag-ekadashi';
      else if (item.cat === 'shiv') tagClass = 'tag-shiv';
      else if (item.cat === 'parva') tagClass = 'tag-parva';

      return `
        <div class="vrat-card-item" data-vrat-id="${item.id}" tabindex="0" role="button" aria-label="${item.title} विवरण पढ़ें">
          <div class="vrat-card-top">
            <span class="vrat-card-tag ${tagClass}">${item.badge}</span>
            <span class="vrat-card-time">${item.subtitle || ''}</span>
          </div>
          <h4 class="vrat-card-title">${item.title}</h4>
          ${item.mantra ? `<div class="vrat-card-mantra">${escapeHtml(item.mantra)}</div>` : ''}
          <p class="vrat-card-desc">${item.desc}</p>
          <div class="vrat-card-action">
            <span>सम्पूर्ण विधि व कथा पढ़ें</span>
            <span>→</span>
          </div>
        </div>
      `;
    }).join('');

    // Attach card click handlers
    DOM.vratCardsGrid.querySelectorAll('.vrat-card-item').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.dataset.vratId;
        openVratModal(id);
      });
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const id = card.dataset.vratId;
          openVratModal(id);
        }
      });
    });
  }

  // Open Vrat Detail Modal
  function openVratModal(id) {
    const item = vratList.find(v => v.id === id);
    if (!item || !DOM.vratDetailModal) return;

    if (DOM.vratModalTag) {
      DOM.vratModalTag.textContent = item.badge || '🌸 पावन व्रत-विधान';
      DOM.vratModalTag.className = 'vrat-modal-tag';
      if (item.cat === 'navratri') DOM.vratModalTag.classList.add('tag-navratri');
      else if (item.cat === 'ekadashi') DOM.vratModalTag.classList.add('tag-ekadashi');
      else if (item.cat === 'shiv') DOM.vratModalTag.classList.add('tag-shiv');
      else if (item.cat === 'parva') DOM.vratModalTag.classList.add('tag-parva');
    }

    if (DOM.vratModalTitle) {
      DOM.vratModalTitle.textContent = item.title;
    }

    if (DOM.vratModalBody) {
      DOM.vratModalBody.innerHTML = `
        ${item.mantra ? `
          <div class="vrat-modal-mantra-box">
            <div class="vrat-modal-mantra-title">✨ पावन ध्यान / संकल्प मन्त्र</div>
            <div class="vrat-modal-mantra-text">${escapeHtml(item.mantra)}</div>
          </div>
        ` : ''}
        <div class="vrat-modal-html-content">
          ${item.contentHtml || `<p>${escapeHtml(item.desc)}</p>`}
        </div>
      `;
    }

    DOM.vratDetailModal.style.display = 'flex';
    document.body.style.overflow = 'hidden'; // prevent background page scrolling
  }

  // Close Vrat Detail Modal
  function closeVratModal() {
    if (!DOM.vratDetailModal) return;
    DOM.vratDetailModal.style.display = 'none';
    document.body.style.overflow = '';
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
