
// 12 thema's met merknaam en eigen CSS-bestand
const THEMES = [
  { id: "theme-1",  name: "MVGM",                         href: "assets/css/themes/theme-1.css"  },
  { id: "theme-2",  name: "Zadelhoff Vastgoedadviseurs",  href: "assets/css/themes/theme-2.css"  },
  { id: "theme-3",  name: "Wagenhof Real Estate",         href: "assets/css/themes/theme-3.css"  },
  { id: "theme-4",  name: "Neder Real Estate",            href: "assets/css/themes/theme-4.css"  },
  { id: "theme-5",  name: "Makelaardij Hoekstra",         href: "assets/css/themes/theme-5.css"  },
  { id: "theme-6",  name: "FRIS Real People",             href: "assets/css/themes/theme-6.css"  },
  { id: "theme-7",  name: "Ans de Wijn",                  href: "assets/css/themes/theme-7.css"  },
  { id: "theme-8",  name: "Hans Janssen Zakelijk",        href: "assets/css/themes/theme-8.css"  },
  { id: "theme-9",  name: "NDRP Real Estate",             href: "assets/css/themes/theme-9.css"  },
  { id: "theme-10", name: "Brantjes",                     href: "assets/css/themes/theme-10.css" },
  { id: "theme-11", name: "Woonbron",                     href: "assets/css/themes/theme-11.css"  },
  { id: "theme-12", name: "JLL",                          href: "assets/css/themes/theme-12.css"  }
];

function populateThemeSelect(selectEl){
  selectEl.innerHTML = THEMES.map(t=>`<option value="${t.id}">${t.name}</option>`).join('');
}
function setTheme(themeId){
  const theme = THEMES.find(t=>t.id===themeId) || THEMES[0];
  document.getElementById('themeStylesheet').setAttribute('href', theme.href);
  localStorage.setItem('listing.theme', theme.id);
  const url = new URL(location.href);
  url.searchParams.set('theme', theme.id);
  history.replaceState({}, '', url);
}
function initThemeFromQueryOrStorage(selectEl){
  const params = new URLSearchParams(location.search);
  const fromQuery = params.get('theme');
  const stored = localStorage.getItem('listing.theme');
  const active = fromQuery || stored || THEMES[0].id;
  setTheme(active);
  selectEl.value = active;
}
