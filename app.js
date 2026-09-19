'use strict';
const properties = [
  {id:1,name:'Villa contemporánea',original:'Luxury Villa',type:'villa',label:'Villa',image:'house2.webp',beds:4,baths:3,area:'3,500',subtitle:'Diseño que conecta con la naturaleza',description:'Una villa de espacios amplios, materiales cálidos y grandes ventanales. Un lugar para disfrutar de la luz, la calma y la vida al aire libre.'},
  {id:2,name:'Apartamento moderno',original:'Modern Apartment',type:'apartamento',label:'Apartamento',image:'house3.webp',beds:2,baths:2,area:'1,500',subtitle:'Una nueva forma de vivir la ciudad',description:'Un apartamento que combina líneas contemporáneas con espacios cómodos. Dos habitaciones y dos baños para vivir tu día a día a tu manera.'},
  {id:3,name:'Casa de campo',original:'Cozy Cottage',type:'casa',label:'Casa',image:'house4.webp',beds:3,baths:2,area:'2,000',subtitle:'El lujo de bajar el ritmo',description:'Un refugio acogedor para desconectar y crear nuevos recuerdos. Tres habitaciones y espacios que invitan a compartir momentos sin prisa.'},
  {id:4,name:'Bungalow con encanto',original:'Charming Bungalow',type:'casa',label:'Casa',image:'house5.webp',beds:2,baths:1,area:'1,200',subtitle:'Pequeños detalles, grandes momentos',description:'Un bungalow de dos habitaciones con una distribución acogedora. Un espacio para quienes encuentran lo especial en las cosas sencillas.'},
  {id:5,name:'Loft urbano',original:'Downtown Loft',type:'apartamento',label:'Apartamento',image:'house6.webp',beds:1,baths:1,area:'900',subtitle:'Un espacio con tu propia identidad',description:'Un loft de una habitación con carácter contemporáneo. La oportunidad de hacer tuyo un espacio práctico, personal y lleno de posibilidades.'},
  {id:6,name:'Casa de playa',original:'Beach House',type:'casa',label:'Casa',image:'house7.webp',beds:3,baths:2,area:'2,500',subtitle:'Tu próxima historia, cerca del mar',description:'Una casa de tres habitaciones pensada para disfrutar de un ritmo diferente. Espacio para compartir, descansar y empezar cada día con otra perspectiva.'}
];
const icon = name => `<svg aria-hidden="true"><use href="#i-${name}"/></svg>`;
const grid = document.querySelector('#property-grid');
const typeSelect = document.querySelector('#property-type');
const bedroomSelect = document.querySelector('#bedrooms');
const savedButton = document.querySelector('#saved-filter');
const dialog = document.querySelector('#property-dialog');
let saved = new Set();
try { const value = JSON.parse(localStorage.getItem('realestate-saved') || '[]'); if(Array.isArray(value)) saved = new Set(value.filter(id => properties.some(p => p.id === id))); } catch {}
let currentType = 'all';
let currentBedrooms = 0;
let savedOnly = false;
let activeProperty = null;
let toastTimeout;
const featureMarkup = p => `<span>${icon('bed')} ${p.beds} hab.</span><span>${icon('bath')} ${p.baths} ${p.baths === 1 ? 'baño' : 'baños'}</span><span>${icon('area')} ${p.area} ft²</span>`;
function renderProperties() {
  const filtered = properties.filter(p => (currentType === 'all' || p.type === currentType) && p.beds >= currentBedrooms && (!savedOnly || saved.has(p.id)));
  grid.innerHTML = filtered.map((p,index) => `<article class="property-card" style="animation-delay:${index * 55}ms"><div class="property-visual"><button type="button" data-detail="${p.id}" aria-label="Ver ${p.name}"><img src="src/${p.image}" alt="${p.name}" loading="lazy" width="888" height="888"></button><span class="property-badge">${p.label}</span><button class="favorite-button" type="button" data-save="${p.id}" aria-label="${saved.has(p.id) ? 'Quitar de' : 'Añadir a'} favoritos: ${p.name}" aria-pressed="${saved.has(p.id)}">${icon('heart')}</button></div><div class="property-content"><p class="property-category">${p.label} · Colección RealEstate</p><h3>${p.name}</h3><p class="property-subtitle">${p.subtitle}</p><div class="property-features">${featureMarkup(p)}</div><div class="property-bottom"><span>Precio a consultar</span><button class="detail-button" data-detail="${p.id}">Ver propiedad ${icon('diagonal')}</button></div></div></article>`).join('');
  document.querySelector('#empty-state').hidden = filtered.length > 0;
  document.querySelector('#results-status').textContent = `${filtered.length} propiedades encontradas${savedOnly ? ' en tus favoritos' : ''}.`;
  document.querySelector('#saved-count').textContent = saved.size;
  document.querySelectorAll('[data-filter]').forEach(button => { const selected = button.dataset.filter === currentType; button.classList.toggle('selected',selected);button.setAttribute('aria-pressed',String(selected)); });
  savedButton.setAttribute('aria-pressed',String(savedOnly));
}
function showToast(message) { const toast = document.querySelector('#toast');clearTimeout(toastTimeout);toast.textContent = message;toast.classList.add('visible');toastTimeout = setTimeout(() => toast.classList.remove('visible'),2500); }
let detailTrigger;
function openProperty(id,trigger) { const p = properties.find(p => p.id === id);if(!p) return;activeProperty = p;detailTrigger = trigger;document.querySelector('#dialog-title').textContent = p.name;document.querySelector('#dialog-category').textContent = `${p.label} · Colección RealEstate`;document.querySelector('#dialog-description').textContent = p.description;document.querySelector('#dialog-image').src = `src/${p.image}`;document.querySelector('#dialog-image').alt = p.name;document.querySelector('#dialog-features').innerHTML = featureMarkup(p);dialog.showModal();document.body.classList.add('dialog-open'); }
grid.addEventListener('click',event => {
  const detail = event.target.closest('[data-detail]');if(detail) return openProperty(Number(detail.dataset.detail),detail);
  const favorite = event.target.closest('[data-save]');if(!favorite) return;const id = Number(favorite.dataset.save);saved.has(id) ? saved.delete(id) : saved.add(id);
  try { localStorage.setItem('realestate-saved',JSON.stringify([...saved])); } catch {}
  showToast(saved.has(id) ? 'Propiedad guardada en tus favoritos' : 'Propiedad eliminada de favoritos');
  // Keep focus and the image in place when saving from the full collection.
  if(savedOnly) { renderProperties();const next = grid.querySelector('[data-save]');(next || savedButton).focus(); } else { const p = properties.find(item => item.id === id);favorite.setAttribute('aria-pressed',String(saved.has(id)));favorite.setAttribute('aria-label',`${saved.has(id) ? 'Quitar de' : 'Añadir a'} favoritos: ${p.name}`);document.querySelector('#saved-count').textContent = saved.size; }
});
document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click',() => { currentType = button.dataset.filter;typeSelect.value = currentType;renderProperties(); }));
document.querySelector('#search-form').addEventListener('submit',event => { event.preventDefault();currentType = typeSelect.value;currentBedrooms = Number(bedroomSelect.value);savedOnly = false;renderProperties();document.querySelector('#properties').scrollIntoView({behavior:motion.matches ? 'auto' : 'smooth'}); });
savedButton.addEventListener('click',() => { savedOnly = !savedOnly;renderProperties(); });
document.querySelector('#reset-filters').addEventListener('click',() => { currentType = 'all';currentBedrooms = 0;savedOnly = false;typeSelect.value = 'all';bedroomSelect.value = '0';renderProperties();document.querySelector('[data-filter="all"]').focus(); });
document.querySelector('.dialog-close').addEventListener('click',() => dialog.close());
dialog.addEventListener('click',event => { if(event.target !== dialog) return;const bounds = dialog.getBoundingClientRect();if(event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close(); });
dialog.addEventListener('close',() => { document.body.classList.remove('dialog-open');detailTrigger?.focus({preventScroll:true}); });
document.querySelector('#property-contact').addEventListener('click',() => { if(!activeProperty) return;document.querySelector('#message').value = `Hola, me interesa la propiedad «${activeProperty.name}». Quisiera conocer su precio y disponibilidad para una visita.`;dialog.close();location.hash = 'contact';document.querySelector('#name').focus({preventScroll:true}); });
const menu = document.querySelector('.menu-toggle');
const nav = document.querySelector('#navigation');
function closeMenu(){ menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Abrir menú');nav.classList.remove('open'); }
menu.addEventListener('click',() => { const opened = menu.getAttribute('aria-expanded') !== 'true';menu.setAttribute('aria-expanded',String(opened));menu.setAttribute('aria-label',opened ? 'Cerrar menú' : 'Abrir menú');nav.classList.toggle('open',opened); });
nav.querySelectorAll('a').forEach(link => link.addEventListener('click',closeMenu));
document.addEventListener('keydown',event => { if(event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') { closeMenu();menu.focus(); } });
document.addEventListener('click',event => { if(!event.target.closest('.site-header')) closeMenu(); });
const quotes = [{text:'RealEstate Hub me ayudó a encontrar mi hogar ideal de manera rápida y fácil. El equipo es increíblemente profesional.',name:'Juan Pérez',initials:'JP'},{text:'La mejor experiencia inmobiliaria que he tenido. Encontré justo lo que buscaba.',name:'María López',initials:'ML'}];
let quoteIndex = 0;
function changeQuote(direction) { quoteIndex = (quoteIndex + direction + quotes.length) % quotes.length;const quote = quotes[quoteIndex];document.querySelector('#quote-text').textContent = quote.text;document.querySelector('#quote-name').textContent = quote.name;document.querySelector('#quote-initials').textContent = quote.initials;document.querySelector('#quote-page').textContent = `0${quoteIndex+1} / 02`;if(!motion.matches) document.querySelector('.quote-content').animate([{opacity:0,transform:'translateY(12px)'},{opacity:1,transform:'translateY(0)'}],{duration:400,easing:'ease-out'}); }
document.querySelector('#quote-prev').addEventListener('click',() => changeQuote(-1));document.querySelector('#quote-next').addEventListener('click',() => changeQuote(1));
document.querySelectorAll('[data-service]').forEach(link => link.addEventListener('click',() => { document.querySelector('#message').value = link.dataset.service; }));
let draftUrl;
document.querySelector('#contact-form').addEventListener('submit',event => { event.preventDefault();const name = document.querySelector('#name').value.trim();const email = document.querySelector('#email').value.trim();const message = document.querySelector('#message').value.trim();if(!name || !message) { showToast('Completa tu nombre y tu consulta.');return; }const draft = `Consulta para RealEstate Hub\n\nNombre: ${name}\nCorreo: ${email}\n\n${message}\n`;if(draftUrl) URL.revokeObjectURL(draftUrl);draftUrl = URL.createObjectURL(new Blob([draft],{type:'text/plain;charset=utf-8'}));const result = document.querySelector('#form-result');result.replaceChildren(document.createTextNode('Tu consulta está preparada. No se ha enviado ningún mensaje.'));const download = document.createElement('a');download.href = draftUrl;download.download = 'consulta-realestate-hub.txt';download.textContent = 'Descargar mi consulta';result.append(download);result.hidden = false; });
const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => { if(entry.isIntersecting){ entry.target.classList.remove('pending');entry.target.classList.add('visible');revealObserver.unobserve(entry.target); } }),{threshold:.08});
document.querySelectorAll('.reveal').forEach((element,index) => { if(!motion.matches){ element.classList.add('pending');if(element.classList.contains('service-card')) element.style.transitionDelay = `${index % 3 * 80}ms`;revealObserver.observe(element); } });
const sectionObserver = new IntersectionObserver(entries => { entries.forEach(entry => { if(entry.isIntersecting) document.querySelectorAll('.desktop-nav a').forEach(link => link.classList.toggle('active',link.hash === `#${entry.target.id}`)); }); },{rootMargin:'-15% 0px -55% 0px'});
document.querySelectorAll('main section[id]').forEach(section => sectionObserver.observe(section));
let scrollQueued = false;
function updateProgress(){ const available = document.documentElement.scrollHeight - window.innerHeight;document.querySelector('.scroll-progress').style.transform = `scaleX(${available > 0 ? window.scrollY / available : 0})`;scrollQueued = false; }
window.addEventListener('scroll',() => { if(!scrollQueued){ requestAnimationFrame(updateProgress);scrollQueued = true; } },{passive:true});
window.addEventListener('resize',updateProgress);
document.querySelector('#year').textContent = new Date().getFullYear();
renderProperties();updateProgress();
