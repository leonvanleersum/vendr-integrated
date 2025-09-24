
(function(){
  'use strict';

  const $grid = document.getElementById('grid');
  const $stats = document.getElementById('stats');
  const $alert = document.getElementById('alert');
  const $theme = document.getElementById('theme');
  const $reSection = document.getElementById('realtor-section');
  const $reLinks = document.getElementById('realtor-links');

  // Thema init
  populateThemeSelect($theme);
  initThemeFromQueryOrStorage($theme);
  $theme.addEventListener('change', e=> setTheme(e.target.value));

  // Querystring
  const params = new URLSearchParams(location.search);
  const realtor = params.get('realtor');
  const feedParam = params.get('feed');

  const LOCAL_DEFAULT = new URL('data/feed.json', location.href).href;
  const LOCAL_REALTOR = realtor ? new URL(`data/realtor-${encodeURIComponent(realtor)}.json`, location.href).href : null;

  // Externe feed: vendr.nl
  const EXTERNAL_DEFAULT = 'https://vendr.nl/feed';
  const EXTERNAL_REALTOR = realtor ? `https://vendr.nl/realtor/${encodeURIComponent(realtor)}/feed` : null;

  const FEED_CANDIDATES = [];
  if (feedParam) FEED_CANDIDATES.push(feedParam);
  if (realtor && LOCAL_REALTOR) FEED_CANDIDATES.push(LOCAL_REALTOR);
  FEED_CANDIDATES.push(LOCAL_DEFAULT);
  if (realtor && EXTERNAL_REALTOR) FEED_CANDIDATES.push(EXTERNAL_REALTOR);
  FEED_CANDIDATES.push(EXTERNAL_DEFAULT);

  const PLACEHOLDER = 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 400 300\"><rect width=\"400\" height=\"300\" fill=\"#1f2937\"/><text x=\"50%\" y=\"50%\" dominant-baseline=\"middle\" text-anchor=\"middle\" font-family=\"Arial\" font-size=\"16\" fill=\"#0ea5e9\">Geen afbeelding</text></svg>');

  function showError(msg){ $alert.innerHTML = msg; $alert.classList.remove('hidden'); }
  function clearError(){ $alert.classList.add('hidden'); $alert.textContent=''; }
  function escapeHtml(s){ return String(s).replace(/[&<>\"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',\"'\":'&#039;'}[c]||c)); }

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
        const res = await fetch(target, {cache:'no-store', mode:'cors', credentials:'omit', headers:{'accept':'application/json, text/plain;q=0.9, */*;q=0.8'}});
        if (!res.ok) throw new Error('HTTP '+res.status);
        const text = await res.text();
        const json = parseLooseJson(text);
        return json;
      }catch(e){ tried.push(`${target} → ${e.message}`); }
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

  async function buildRealtorLinks(){
    try{
      const url = new URL('data/index.json', location.href).href;
      const data = await fetchJson(url);
      if (!data || !Array.isArray(data.realtor_files)) return;
      const ids = data.realtor_files
        .map(p => (p.match(/realtor-([A-Fa-f0-9-]{36})\\.json$/)||[])[1])
        .filter(Boolean);
      if (ids.length === 0) return;
      $reLinks.innerHTML = ids.map(id => {
        const u = new URL(location.href);
        u.searchParams.set('realtor', id);
        return `<a href="${u.toString()}">${id}</a>`;
      }).join('');
      const realtor = new URLSearchParams(location.search).get('realtor');
      if (realtor){
        [...$reLinks.querySelectorAll('a')].forEach(a=>{
          if (a.href.includes(realtor)) a.classList.add('active');
        });
      }
      $reSection.classList.remove('hidden');
    }catch(e){
      console.warn('Kon /data/index.json niet laden:', e);
    }
  }

  async function bootstrap(){
    await buildRealtorLinks();

    const errors = [];
    for (const url of FEED_CANDIDATES){
      try{
        const raw = await fetchJson(url);
        if (!Array.isArray(raw)) throw new Error('Onverwacht antwoord (geen array)');
        const vis = raw.filter(x => (x.visibility||'public')==='public');
        render(vis.map(x=> ({...x})));
        clearError();
        return;
      }catch(e){
        errors.push(`${url} → ${e.message}`);
      }
    }
    showError(`<p><strong>Kon feed niet laden.</strong></p><pre>${escapeHtml(errors.join('\\n'))}</pre><p>Tip: gebruik <code>?feed=</code> met je eigen JSON op GitHub Pages.</p>`);
    render([]);
  }

  bootstrap();
})();