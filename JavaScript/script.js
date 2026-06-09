const DEFAULT_IMG = "https://cdn-icons-png.flaticon.com/512/847/847969.png";

const TRANSLATIONS = {
  en: {
    title: "Office Contact Directory",
    heroTitle: "Divisional <span>Secretariat </span>of <br>Matara Four Gravets",
    heroSub: "Employee Contact Directory",
    searchPlaceholder: "Search by name or position…",
    call: "Call",
    phoneNumbers: "Phone Numbers",
    noEmployees: "No employees found.",
    errorLoad: "Could not load directory. Please try again.",
    btnText: "සිංහල",
    ariaShowMore: "Show more",
    allCategories: "All Categories",
    directLines: "Direct Lines",
    directLine: "Direct Line",
    directLineLabel: "Receptionist",
    faxLabel: "Fax",
    emailLabel: "Email",
    themeLight: "Switch to light theme",
    themeDark: "Switch to dark theme"
  },
  si: {
    title: "කාර්යාලීය සම්බන්ධතා නාමාවලිය",
    heroTitle: "ප්‍රාදේශීය ලේකම්<br>කාර්යාලය <span> මාතර</span>",
    heroSub: "සේවක සම්බන්ධතා නාමාවලිය",
    searchPlaceholder: "නම හෝ තනතුර අනුව සොයන්න...",
    call: "අමතන්න",
    phoneNumbers: "දුරකථන අංක",
    noEmployees: "සේවකයින් කිසිවෙකු හමු නොවීය.",
    errorLoad: "නාමාවලිය පූරණය කිරීමට නොහැකි විය. කරුණාකර නැවත උත්සාහ කරන්න.",
    btnText: "English",
    ariaShowMore: "වැඩි විස්තර පෙන්වන්න",
    allCategories: "සියලුම කාණ්ඩ",
    directLines: "සෘජු ඇමතුම්",
    directLine: "සෘජු දුරකථනය",
    directLineLabel: "පිළිගැනීමේ නිලධාරී",
    faxLabel: "ෆැක්ස්",
    emailLabel: "විද්‍යුත් තැපෑල",
    themeLight: "ආලෝක තේමාවට මාරු වන්න",
    themeDark: "අඳුරු තේමාවට මාරු වන්න"
  }
};

let currentLang = localStorage.getItem('preferredLang') || 'en';
let currentTheme = localStorage.getItem('preferredTheme') || 'light';
let allCards = [];
let employeeData = [];
let categoriesList = [];
let selectedCategoryKey = null;

function toDialable(num) {
  return '+94' + num.trim().replace(/^0/, '');
}

function loadProfilePictures() {
  const avatars = document.querySelectorAll('.avatar[data-src]');
  avatars.forEach(img => {
    const src = img.getAttribute('data-src');
    if (src) {
      img.onerror = function() {
        this.src = DEFAULT_IMG;
        this.onerror = null;
      };
      img.src = src;
      img.removeAttribute('data-src');
    }
  });
}

function buildCard(name, position, phones, email, imgSrc) {
  const originalPhones = phones.split('|').map(p => p.trim()).filter(Boolean);
  
  // Find the first mobile/personal number (not starting with 041)
  let primary = originalPhones.find(p => {
    const cleanP = p.replace(/[\s\-\(\)]+/g, '');
    return !(cleanP.startsWith('041') || cleanP.startsWith('+9441') || cleanP.startsWith('9441'));
  });
  
  // Fallback to the first number overall if no mobile/personal number is present
  if (!primary && originalPhones.length > 0) {
    primary = originalPhones[0];
  }
  if (!primary) primary = '';

  const t = TRANSLATIONS[currentLang];

  const card = document.createElement('div');
  card.className = 'card';
  card.dataset.name = name.toLowerCase();
  card.dataset.position = position.toLowerCase();

  // Reorder display list so direct lines (041) are on top
  const displayPhones = [...originalPhones].sort((a, b) => {
    const cleanA = a.replace(/[\s\-\(\)]+/g, '');
    const cleanB = b.replace(/[\s\-\(\)]+/g, '');
    const isDirectA = cleanA.startsWith('041') || cleanA.startsWith('+9441') || cleanA.startsWith('9441');
    const isDirectB = cleanB.startsWith('041') || cleanB.startsWith('+9441') || cleanB.startsWith('9441');
    if (isDirectA && !isDirectB) return -1;
    if (!isDirectA && isDirectB) return 1;
    return 0;
  });

  const extraPhones = displayPhones.map(p => {
    const cleanP = p.replace(/[\s\-\(\)]+/g, '');
    const isDirect = cleanP.startsWith('041') || cleanP.startsWith('+9441') || cleanP.startsWith('9441');
    const directTag = isDirect ? `<span class="direct-tag">${t.directLine}</span>` : '';
    return `
      <div class="phone-row">
        <span class="phone-number">${p}${directTag}</span>
        <a class="phone-call-link" href="tel:${toDialable(p)}">${t.call}</a>
      </div>
    `;
  }).join('');

  const emailRow = email && email.trim() ? `
    <div class="email-row">
      <svg class="email-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 7L12 13 2 7"/></svg>
      <a class="email-link" href="mailto:${email.trim()}">${email.trim()}</a>
    </div>
  ` : '';

  card.innerHTML = `
    <div class="card-main">
      <img class="avatar" data-src="${imgSrc}" alt="${name}">
      <div class="card-info">
        <div class="card-name">${name}</div>
        <div class="card-role">${position}</div>
      </div>
      <div class="card-actions">
        <a class="call-btn" href="tel:${toDialable(primary)}">
          <svg class="call-icon" viewBox="0 0 24 24"><path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z"/></svg>
          ${t.call}
        </a>
        <div class="toggle-btn" aria-label="${t.ariaShowMore}">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
        </div>
      </div>
    </div>
    <div class="card-extra">
      <div class="extra-divider"></div>
      <div class="extra-label">${t.phoneNumbers}</div>
      ${extraPhones}
      ${emailRow}
    </div>
  `;

  const toggle = card.querySelector('.toggle-btn');
  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    card.classList.toggle('open');
  });

  card.querySelector('.card-main').addEventListener('click', () => {
    card.classList.toggle('open');
  });

  return card;
}

function extractCategories() {
  const seen = new Set();
  categoriesList = [];
  employeeData.forEach(emp => {
    const key = emp.categoryEn;
    if (key && !seen.has(key)) {
      seen.add(key);
      categoriesList.push({
        key: key,
        en: emp.categoryEn,
        sl: emp.categorySl || emp.categoryEn
      });
    }
  });
}

function renderDropdown() {
  const t = TRANSLATIONS[currentLang];
  const dropdownBtn = document.getElementById('dropdownBtn');
  
  if (selectedCategoryKey) {
    dropdownBtn.classList.add('active');
  } else {
    dropdownBtn.classList.remove('active');
  }

  const dropdownContent = document.getElementById('dropdownContent');
  dropdownContent.innerHTML = '';

  const allItem = document.createElement('div');
  allItem.className = `dropdown-item ${!selectedCategoryKey ? 'active' : ''}`;
  allItem.textContent = t.allCategories;
  allItem.addEventListener('click', () => {
    selectedCategoryKey = null;
    document.getElementById('categoryDropdown').classList.remove('show');
    renderDropdown();
    renderCards();
  });
  dropdownContent.appendChild(allItem);

  categoriesList.forEach(cat => {
    const item = document.createElement('div');
    const name = currentLang === 'si' ? cat.sl : cat.en;
    item.className = `dropdown-item ${selectedCategoryKey === cat.key ? 'active' : ''}`;
    item.textContent = name;
    
    item.addEventListener('click', () => {
      if (selectedCategoryKey === cat.key) {
        selectedCategoryKey = null;
      } else {
        selectedCategoryKey = cat.key;
      }
      document.getElementById('categoryDropdown').classList.remove('show');
      renderDropdown();
      renderCards();
    });
    dropdownContent.appendChild(item);
  });
}

function setLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('preferredLang', lang);

  const t = TRANSLATIONS[lang];

  document.title = t.title;
  document.querySelector('.hero-title').innerHTML = t.heroTitle;
  document.querySelector('.hero-sub').textContent = t.heroSub;
  
  const searchInput = document.getElementById('searchInput');
  searchInput.placeholder = t.searchPlaceholder;

  const langToggle = document.getElementById('langToggle');
  langToggle.textContent = t.btnText;
  
  const emptyState = document.getElementById('emptyState');
  emptyState.textContent = t.noEmployees;

  // Localize direct lines button and labels
  const directLinesToggle = document.getElementById('directLinesToggle');
  directLinesToggle.querySelector('.btn-text').textContent = t.directLines;
  directLinesToggle.setAttribute('aria-label', lang === 'si' ? 'සෘජු ඇමතුම් පෙන්වන්න' : 'Show direct lines');
  
  document.getElementById('lblDirectLine').textContent = t.directLineLabel;
  document.getElementById('lblFax').textContent = t.faxLabel;
  document.getElementById('lblDirectEmail').textContent = t.emailLabel;
  document.getElementById('lnkDirectLineCall').querySelector('.call-text').textContent = t.call;

  // Localize theme button
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    themeToggle.setAttribute('aria-label', currentTheme === 'dark' ? t.themeLight : t.themeDark);
  }

  renderDropdown();
  renderCards();
}

function setTheme(theme) {
  currentTheme = theme;
  localStorage.setItem('preferredTheme', theme);
  document.documentElement.setAttribute('data-theme', theme);
  
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    const t = TRANSLATIONS[currentLang];
    themeToggle.setAttribute('aria-label', theme === 'dark' ? t.themeLight : t.themeDark);
  }
}

function renderCards() {
  const container = document.getElementById('cards');
  
  container.innerHTML = `<div class="empty" id="emptyState">${TRANSLATIONS[currentLang].noEmployees}</div>`;
  
  allCards = [];

  const categoriesToShow = selectedCategoryKey 
    ? categoriesList.filter(c => c.key === selectedCategoryKey)
    : categoriesList;

  const q = document.getElementById('searchInput').value.toLowerCase();
  let totalVisible = 0;

  categoriesToShow.forEach(cat => {
    const empsInCat = employeeData.filter(emp => emp.categoryEn === cat.key);
    
    const matchingEmps = empsInCat.filter(emp => {
      if (!q) return true;
      const name = currentLang === 'si' ? (emp.nameSl || emp.nameEn) : emp.nameEn;
      const position = currentLang === 'si' ? (emp.positionSl || emp.positionEn) : emp.positionEn;
      return name.toLowerCase().includes(q) || position.toLowerCase().includes(q);
    });

    if (matchingEmps.length > 0) {
      const groupDiv = document.createElement('div');
      groupDiv.className = 'category-group';

      const headerDiv = document.createElement('div');
      headerDiv.className = 'category-header';

      const titleSpan = document.createElement('span');
      titleSpan.className = 'category-title';
      titleSpan.textContent = currentLang === 'si' ? cat.sl : cat.en;

      const lineDiv = document.createElement('div');
      lineDiv.className = 'category-line';

      headerDiv.appendChild(titleSpan);
      headerDiv.appendChild(lineDiv);
      groupDiv.appendChild(headerDiv);

      matchingEmps.forEach(emp => {
        const name = currentLang === 'si' ? (emp.nameSl || emp.nameEn) : emp.nameEn;
        const position = currentLang === 'si' ? (emp.positionSl || emp.positionEn) : emp.positionEn;
        const card = buildCard(name, position, emp.phones, emp.email, emp.img);
        
        allCards.push(card);
        groupDiv.appendChild(card);
        totalVisible++;
      });

      container.appendChild(groupDiv);
    }
  });

  const emptyState = document.getElementById('emptyState');
  if (totalVisible === 0) {
    emptyState.style.display = 'block';
  } else {
    emptyState.style.display = 'none';
  }

  // Load profile pictures asynchronously after text is rendered
  setTimeout(loadProfilePictures, 50);
}

// Fetch config first, then fetch Google Sheet data
fetch("config.json")
  .then(res => res.json())
  .then(config => {
    const sheetUrl = config.sheetUrl;
    return fetch(sheetUrl + "&t=" + Date.now());
  })
  .then(res => res.text())
  .then(data => {
    const rows = data.split('\n').slice(1).filter(r => r.trim());
    employeeData = rows.map(row => {
      const cols = row.split(',');
      return {
        nameEn: (cols[0] || '').trim(),
        nameSl: (cols[1] || '').trim(),
        categoryEn: (cols[2] || '').trim() || 'Uncategorized',
        categorySl: (cols[3] || '').trim() || 'වර්ගීකරණය නොකළ',
        positionEn: (cols[4] || '').trim(),
        positionSl: (cols[5] || '').trim(),
        phones: (cols[6] || '').trim(),
        email: (cols[7] || '').trim(),
        img: (cols[8] || '').trim() || DEFAULT_IMG
      };
    }).filter(emp => emp.nameEn || emp.nameSl);

    extractCategories();
    renderDropdown();
    renderCards();
  })
  .catch(() => {
    const emptyState = document.getElementById('emptyState');
    emptyState.style.display = 'block';
    emptyState.textContent = TRANSLATIONS[currentLang].errorLoad;
  });

// Setup event listeners
document.getElementById('langToggle').addEventListener('click', () => {
  const nextLang = currentLang === 'en' ? 'si' : 'en';
  setLanguage(nextLang);
});

document.getElementById('themeToggle').addEventListener('click', () => {
  const nextTheme = currentTheme === 'light' ? 'dark' : 'light';
  setTheme(nextTheme);
});

document.getElementById('searchInput').addEventListener('input', function() {
  renderCards();
});

// Dropdown click handler
document.getElementById('dropdownBtn').addEventListener('click', (e) => {
  e.stopPropagation();
  document.getElementById('categoryDropdown').classList.toggle('show');
  
  // Close direct lines if open
  document.getElementById('directPopup').classList.remove('show');
  document.getElementById('directLinesToggle').classList.remove('active');
});

// Direct lines click handler
document.getElementById('directLinesToggle').addEventListener('click', (e) => {
  e.stopPropagation();
  const popup = document.getElementById('directPopup');
  const btn = document.getElementById('directLinesToggle');
  popup.classList.toggle('show');
  btn.classList.toggle('active');
  
  // Close category dropdown if open
  document.getElementById('categoryDropdown').classList.remove('show');
});

// Close popups when clicking outside
window.addEventListener('click', (e) => {
  const dropdown = document.getElementById('categoryDropdown');
  if (dropdown && !dropdown.contains(e.target)) {
    dropdown.classList.remove('show');
  }

  const directContainer = document.querySelector('.direct-lines-container');
  if (directContainer && !directContainer.contains(e.target)) {
    document.getElementById('directPopup').classList.remove('show');
    document.getElementById('directLinesToggle').classList.remove('active');
  }
});

// Initialize theme and language on startup
setTheme(currentTheme);
setLanguage(currentLang);
