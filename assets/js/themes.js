// Dynamische themalijst (10 varianten)
const THEMES = Array.from({length:10}, (_,i)=>({
  id: `theme-${i+1}`,
  name: `Thema ${i+1}`,
  href: `assets/css/themes/theme-${i+1}.css`
}));

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
