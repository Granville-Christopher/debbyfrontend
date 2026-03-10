const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
app.set('trust proxy', true);

const distDir = path.join(__dirname, 'dist');
const indexPath = path.join(distDir, 'index.html');
const fallbackOgImagePath = path.join(distDir, 'og-image.png');
const publicOgImagePath = path.join(__dirname, 'public', 'og-image.png');

// Serve static files from dist directory, but handle "/" ourselves for dynamic meta injection.
app.use(express.static(path.join(__dirname, 'dist'), { index: false }));

const trimTrailingSlash = (value = '') => value.replace(/\/+$/, '');

const inferBackendBaseUrl = () => {
  const explicit =
    process.env.BACKEND_URL ||
    process.env.VITE_API_BASE_URL ||
    process.env.API_BASE_URL ||
    '';
  return trimTrailingSlash(explicit);
};

const escapeHtml = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const withTimeout = async (promise, timeoutMs) => {
  let timer = null;
  try {
    const timeout = new Promise((_, reject) => {
      timer = setTimeout(() => reject(new Error('Timed out')), timeoutMs);
    });
    return await Promise.race([promise, timeout]);
  } finally {
    if (timer) clearTimeout(timer);
  }
};

const normalizeText = (value, fallback = '') => {
  const next = String(value || '').trim();
  return next || fallback;
};

const getRequestOrigin = (req) => {
  const protoHeader = String(req.headers['x-forwarded-proto'] || '').split(',')[0].trim();
  const hostHeader = String(req.headers['x-forwarded-host'] || '').split(',')[0].trim();
  const proto = protoHeader || req.protocol || 'https';
  const host = hostHeader || req.get('host') || '';
  return `${proto}://${host}`;
};

const isHttpUrl = (value = '') => /^https?:\/\//i.test(value);
const isDataImageUrl = (value = '') => /^data:image\/[a-zA-Z0-9.+-]+;base64,/i.test(value);

const toAbsoluteImageUrl = (candidate, backendBase) => {
  const image = normalizeText(candidate);
  if (!image) return '';
  if (isDataImageUrl(image)) return image;
  if (isHttpUrl(image)) return image;
  if (image.startsWith('//')) return `https:${image}`;
  if (image.startsWith('/') && backendBase) {
    try {
      return new URL(image, `${backendBase}/`).toString();
    } catch {
      return '';
    }
  }
  return '';
};

const pickShopImageCandidate = (payload, backendBase) => {
  const shop = payload?.shop || {};
  const heroImage = Array.isArray(shop.heroImageUrls)
    ? shop.heroImageUrls.map((entry) => String(entry || '').trim()).find(Boolean)
    : '';
  const categoryImage = Array.isArray(payload?.categories)
    ? payload.categories
        .flatMap((category) => (Array.isArray(category?.productImages) ? category.productImages : []))
        .map((entry) => String(entry || '').trim())
        .find(Boolean)
    : '';
  const productImage = Array.isArray(payload?.products)
    ? payload.products.map((product) => String(product?.imageUrl || '').trim()).find(Boolean)
    : '';

  return (
    toAbsoluteImageUrl(heroImage, backendBase) ||
    toAbsoluteImageUrl(shop.bannerUrl, backendBase) ||
    toAbsoluteImageUrl(shop.logoUrl, backendBase) ||
    toAbsoluteImageUrl(categoryImage, backendBase) ||
    toAbsoluteImageUrl(productImage, backendBase) ||
    ''
  );
};

const sendDefaultOgImage = (res) => {
  if (fs.existsSync(fallbackOgImagePath)) {
    return res.sendFile(fallbackOgImagePath);
  }
  return res.status(404).end();
};

const replaceTag = (html, regex, replacement) =>
  regex.test(html) ? html.replace(regex, replacement) : html;

const HOMEPAGE_META = {
  title: 'DEBBY for Business | Run your commerce operation from one dashboard',
  description:
    'Debby unifies storefront, CRM, billing, automations, and analytics so your team can scale without juggling disconnected tools.'
};

const injectShopMeta = (html, meta) => {
  let next = html;
  next = replaceTag(next, /<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(meta.title)}</title>`);
  next = replaceTag(
    next,
    /<meta\s+name="title"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="title" content="${escapeHtml(meta.title)}" />`
  );
  next = replaceTag(
    next,
    /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="description" content="${escapeHtml(meta.description)}" />`
  );
  next = replaceTag(
    next,
    /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:title" content="${escapeHtml(meta.title)}" />`
  );
  next = replaceTag(
    next,
    /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:description" content="${escapeHtml(meta.description)}" />`
  );
  next = replaceTag(
    next,
    /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:url" content="${escapeHtml(meta.url)}" />`
  );
  if (meta.image) {
    next = replaceTag(
      next,
      /<meta\s+property="og:image"\s+content="[^"]*"\s*\/?>/i,
      `<meta property="og:image" content="${escapeHtml(meta.image)}" />`
    );
  }
  next = replaceTag(
    next,
    /<meta\s+property="twitter:title"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="twitter:title" content="${escapeHtml(meta.title)}" />`
  );
  next = replaceTag(
    next,
    /<meta\s+property="twitter:description"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="twitter:description" content="${escapeHtml(meta.description)}" />`
  );
  next = replaceTag(
    next,
    /<meta\s+property="twitter:url"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="twitter:url" content="${escapeHtml(meta.url)}" />`
  );
  if (meta.image) {
    next = replaceTag(
      next,
      /<meta\s+property="twitter:image"\s+content="[^"]*"\s*\/?>/i,
      `<meta property="twitter:image" content="${escapeHtml(meta.image)}" />`
    );
  }
  return next;
};

const injectHomepageMeta = (html, req) => {
  const origin = getRequestOrigin(req);
  const meta = {
    title: HOMEPAGE_META.title,
    description: HOMEPAGE_META.description,
    url: new URL('/', origin).toString(),
    image: new URL('/og-image.png', origin).toString()
  };
  let next = injectShopMeta(html, meta);
  // Keep twitter tags compatible across scrapers that prefer name=.
  if (!/<meta\s+name="twitter:image"/i.test(next)) {
    next = next.replace(
      /<\/head>/i,
      `  <meta name="twitter:image" content="${escapeHtml(meta.image)}" />\n</head>`
    );
  }
  if (!/<meta\s+name="twitter:title"/i.test(next)) {
    next = next.replace(
      /<\/head>/i,
      `  <meta name="twitter:title" content="${escapeHtml(meta.title)}" />\n</head>`
    );
  }
  if (!/<meta\s+name="twitter:description"/i.test(next)) {
    next = next.replace(
      /<\/head>/i,
      `  <meta name="twitter:description" content="${escapeHtml(meta.description)}" />\n</head>`
    );
  }
  return next;
};

const fetchShopHomepagePayload = async (slug) => {
  const backendBase = inferBackendBaseUrl();
  if (!backendBase) return { payload: null, backendBase: '' };
  const endpoint = `${backendBase}/shops/${encodeURIComponent(slug)}/homepage`;
  const response = await withTimeout(
    fetch(endpoint, {
      headers: { Accept: 'application/json' }
    }),
    4000
  );
  if (!response || !response.ok) return { payload: null, backendBase };
  const payload = await response.json();
  return { payload, backendBase };
};

const fetchShopHomepageMeta = async (slug, req) => {
  const { payload, backendBase } = await fetchShopHomepagePayload(slug);
  if (!payload) return null;
  const shop = payload?.shop || {};
  const title = `${normalizeText(shop.name, 'Shop')} | Debby Storefront`;
  const description = normalizeText(
    shop.description,
    `Browse ${normalizeText(shop.name, 'this shop')} on Debby storefront.`
  );
  const absoluteUrl = new URL(req.originalUrl || `/shop/${slug}`, getRequestOrigin(req)).toString();
  const previewImageUrl = new URL(`/shop/${encodeURIComponent(slug)}/og-image`, getRequestOrigin(req)).toString();
  const fallbackImage = pickShopImageCandidate(payload, backendBase);
  const image = previewImageUrl || fallbackImage;
  return { title, description, image, url: absoluteUrl };
};

const serveShopIndexWithMeta = async (req, res) => {
  try {
    const slug = String(req.params.slug || '').trim();
    if (!slug) {
      return res.sendFile(indexPath);
    }
    const original = fs.readFileSync(indexPath, 'utf8');
    const meta = await fetchShopHomepageMeta(slug, req);
    if (!meta) {
      return res.type('html').send(original);
    }
    return res.type('html').send(injectShopMeta(original, meta));
  } catch (err) {
    return res.sendFile(indexPath);
  }
};

app.get('/', (req, res) => {
  try {
    const original = fs.readFileSync(indexPath, 'utf8');
    return res.type('html').send(injectHomepageMeta(original, req));
  } catch {
    return res.sendFile(indexPath);
  }
});

app.get('/og-image.png', (req, res) => {
  const sourcePath = fs.existsSync(fallbackOgImagePath)
    ? fallbackOgImagePath
    : fs.existsSync(publicOgImagePath)
    ? publicOgImagePath
    : '';
  if (!sourcePath) {
    return res.status(404).end();
  }
  res.setHeader('Cache-Control', 'public, max-age=300');
  return res.sendFile(sourcePath);
});

app.get('/shop/:slug', serveShopIndexWithMeta);
app.get('/shop/:slug/collections', serveShopIndexWithMeta);
app.get('/shop/:slug/og-image', async (req, res) => {
  try {
    const slug = String(req.params.slug || '').trim();
    if (!slug) {
      return sendDefaultOgImage(res);
    }
    const { payload, backendBase } = await fetchShopHomepagePayload(slug);
    if (!payload) {
      return sendDefaultOgImage(res);
    }
    const image = pickShopImageCandidate(payload, backendBase);
    if (!image) {
      return sendDefaultOgImage(res);
    }
    if (isDataImageUrl(image)) {
      const match = image.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/i);
      if (!match) return sendDefaultOgImage(res);
      const mimeType = match[1];
      const rawBase64 = match[2].replace(/\s/g, '');
      const buffer = Buffer.from(rawBase64, 'base64');
      res.setHeader('Content-Type', mimeType);
      res.setHeader('Cache-Control', 'public, max-age=300');
      return res.send(buffer);
    }
    if (isHttpUrl(image)) {
      return res.redirect(302, image);
    }
    return sendDefaultOgImage(res);
  } catch {
    return sendDefaultOgImage(res);
  }
});

// Handle SPA routing - send all requests to index.html for client-side routing
app.use((req, res, next) => {
  // Skip API routes or static files
  if (req.path.startsWith('/api') || req.path.includes('.')) {
    return next();
  }
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Frontend server running on port ${port}`);
});
