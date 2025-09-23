(function(){
  'use strict';

  // --- Elementen ---
  const $grid = document.getElementById('grid');
  const $stats = document.getElementById('stats');
  const $alert = document.getElementById('alert');
  const $q = document.getElementById('q');
  const $city = document.getElementById('city');
  const $status = document.getElementById('status');
  const $theme = document.getElementById('theme');

  // Thema init
  populateThemeSelect($theme);
  initThemeFromQueryOrStorage($theme);
  $theme.addEventListener('change', e=> setTheme(e.target.value));

  // --- Querystring: realtor → feed url ---
  const params = new URLSearchParams(location.search);
  const realtor = params.get('realtor');
  const feedParam = params.get('feed');
  const DEFAULT_FEED = 'https://venapp.accept.paqt.io/feed';
  const FEED_URL = feedParam || (realtor ? `https://venapp.accept.paqt.io/realtor/${encodeURIComponent(realtor)}/feed` : DEFAULT_FEED);

  // --- State ---
  let DATA = [];

  // --- Utils ---
  const PLACEHOLDER = 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect width="400" height="300" fill="#1f2937"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="16" fill="#cbd5e1">Geen afbeelding</text></svg>');

  function showError(msg){ $alert.innerHTML = msg; $alert.classList.remove('hidden'); }
  function clearError(){ $alert.classList.add('hidden'); $alert.textContent=''; }
  function escapeHtml(s){ return String(s).replace(/[&<>\"]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]||c)); }

  function cityFromAddress(addr){
    if (!addr) return '';
    const parts = addr.split(',').map(s=>s.trim());
    if (!parts.length) return '';
    const tail = parts[parts.length-1];
    const m = tail.match(/([0-9]{4}\s?[A-Z]{2})\s+(.+)/);
    return m ? m[2].trim() : tail.trim();
  }

  function parseLooseJson(text){
    const t = String(text || '').trim();
    try { return JSON.parse(t); } catch(_) {}
    let s = t.indexOf('['), e = t.lastIndexOf(']');
    if (s !== -1 && e > s) {
      const slice = t.slice(s, e+1);
      try { return JSON.parse(slice); } catch(_) {}
    }
    s = t.indexOf('{'); e = t.lastIndexOf('}');
    if (s !== -1 && e > s) {
      const slice = t.slice(s, e+1);
      try { return JSON.parse(slice); } catch(_) {}
    }
    throw new Error('Geen valide JSON in antwoord');
  }

  function withFormatVariant(url){
    if (!url) return [];
    try{
      const u = new URL(url);
      const v = new URL(u.href);
      if (!v.searchParams.has('format')) v.searchParams.set('format','json');
      return [u.href, v.href];
    }catch{ return [url]; }
  }
  function candidates(url){
    const out = [];
    for (const base of withFormatVariant(url)){
      out.push(base);
      try {
        const u = new URL(base);
        out.push(`https://r.jina.ai/${u.href}`);
        out.push(`https://r.jina.ai/https://${u.host}${u.pathname}${u.search}`);
        out.push(`https://r.jina.ai/http://${u.host}${u.pathname}${u.search}`);
      } catch {}
    }
    return [...new Set(out)];
  }

  async function fetchJson(url){
    const tried=[];
    for (const target of candidates(url)){
      try{
        const res = await fetch(target, {
          cache:'no-store', mode:'cors', credentials:'omit',
          headers: { 'accept':'application/json, text/plain;q=0.9, */*;q=0.8' }
        });
        if (!res.ok) throw new Error('HTTP '+res.status);
        const text = await res.text();
        const json = parseLooseJson(text);
        return json;
      }catch(e){
        tried.push(`${target} → ${e.message}`);
      }
    }
    throw new Error('Feed kon niet worden geladen.\n'+tried.join('\n'));
  }

  function statusBadge(av, sold){
    if (sold || av==='sold') return {text:'Sold', cls:'sold'};
    if (av==='under_bid') return {text:'Under bid', cls:'warn'};
    return {text:'Available'};
  }

  function render(items){
    $grid.innerHTML='';
    const tpl = document.getElementById('card-tpl');
    items.forEach(it=>{
      const node = tpl.content.cloneNode(true);
      const img = node.querySelector('.img');
      img.src = it.image || PLACEHOLDER; img.alt = it.name || '';
      img.onerror = ()=>{ img.src = PLACEHOLDER; };
      const b = statusBadge(it.availability, it.is_sold);
      const badge = node.querySelector('.badge');
      badge.textContent = b.text; if (b.cls) badge.classList.add(b.cls);
      node.querySelector('.name').textContent = it.name || '—';
      node.querySelector('.addr').textContent = it.full_address || '';
      node.querySelector('.meta').textContent = 'Makelaar: ' + (it.realtor || '—');
      const a = node.querySelector('.btn'); a.href = it.url || '#';
      $grid.appendChild(node);
    });
    $stats.textContent = `${items.length} resultaten`;
  }

  function initFilters(){
    const cities=[...new Set(DATA.map(x=>x._city).filter(Boolean))].sort();
    $city.innerHTML = '<option value="">Alle plaatsen</option>' + cities.map(c=>`<option>${escapeHtml(c)}</option>`).join('');
  }

  function applyFilters(){
    const qv = ($q.value||'').toLowerCase();
    const cv = $city.value||'';
    const sv = $status.value||'';
    const out = DATA.filter(x=>{
      const hay = [x.name,x.full_address,x.realtor,x._city].join(' ').toLowerCase();
      if (qv && !hay.includes(qv)) return false;
      if (cv && x._city!==cv) return false;
      if (sv && x.availability!==sv && !(sv==='sold' && x.is_sold)) return false;
      return true;
    });
    render(out);
  }

  [$q,$city,$status].forEach(el=> el.addEventListener('input', applyFilters));

  async function bootstrap(){
    try{
      const raw = await fetchJson(FEED_URL);
      if (!Array.isArray(raw)) throw new Error('Onverwacht antwoord (geen array)');
      const vis = raw.filter(x => (x.visibility||'public')==='public');
      DATA = vis.map(x=> ({...x, _city: cityFromAddress(x.full_address)}));
      initFilters();
      applyFilters();
      clearError();
    }catch(e){
      const snippet = (e && e.message) ? '<pre>'+escapeHtml(String(e.message).slice(0,800))+'</pre>' : '';
      showError(`<p><strong>Kon feed niet laden.</strong></p>${snippet}<p>Tip: u kunt ook <code>?feed=</code> gebruiken met een eigen (CORS-toegankelijke) JSON-URL.</p>`);
      DATA = [];
      render([]);
    }
  }

  bootstrap();
})();