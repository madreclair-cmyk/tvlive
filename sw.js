
// TV LIVE — Service Worker Anti-Ads
// Intercepta peticiones de red y bloquea dominios de publicidad
// igual que uBlock Origin

const BLOCKED = [
  'tiogolhd.com',
  'ads.tiogolhd.com',
  'exoclick.com','exosrv.com','exdynsrv.com',
  'popads.net','popcash.net',
  'trafficjunky.com','trafficjunky.net',
  'juicyads.com','adsterra.com','adsterranetwork.com',
  'hilltopads.net','propellerads.com','propellerclick.com',
  'mgid.com','tsyndicate.com','clickadu.com','clickadilla.com',
  'galaksion.com','adhaven.com','plugrush.com',
  'doubleclick.net','googlesyndication.com','adnxs.com',
  'coinzilla.com','coinhive.com','pushcrew.com',
  'onesignal.com','notix.io','ero-advertising.com',
];

const BLOCKED_KEYWORDS = [
  'aclib.js', 'block.js?v=', '/popunder', 'pop.js',
  'pops.js', 'popunder.js', '/popup.js',
];

// Respuesta falsa para scripts de ads — objeto vacío que no rompe nada
const FAKE_ACLIB = `
window.aclib = {
  runPop: function(){},
  runBanner: function(){},
  runInterstitial: function(){},
  runSlider: function(){},
  runVideo: function(){}
};
`;

function shouldBlock(url) {
  try {
    const u = new URL(url);
    const host = u.hostname.toLowerCase();
    for (const d of BLOCKED) {
      if (host === d || host.endsWith('.' + d)) return true;
    }
    for (const kw of BLOCKED_KEYWORDS) {
      if (url.includes(kw)) return true;
    }
  } catch(e) {}
  return false;
}

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

self.addEventListener('fetch', e => {
  const url = e.request.url;
  if (!shouldBlock(url)) return; // dejar pasar normal

  // Si es un .js devolver objeto vacío (no rompe la página)
  if (url.includes('.js')) {
    e.respondWith(new Response(FAKE_ACLIB, {
      status: 200,
      headers: { 'Content-Type': 'application/javascript' }
    }));
  } else {
    // Para otros recursos (imágenes, iframes de ads) devolver vacío
    e.respondWith(new Response('', {
      status: 200,
      headers: { 'Content-Type': 'text/plain' }
    }));
  }
});
