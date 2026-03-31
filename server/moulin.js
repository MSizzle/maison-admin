/**
 * Moulin à Rêves site integration
 * Reads/writes the actual Astro site files: CSS variables, translations, images
 */
const fs = require('fs');
const path = require('path');

function getRepoPath() {
  return process.env.DEPLOY_REPO_PATH || path.join(__dirname, '..', '..', 'moulin-a-reves');
}

const PATHS = {
  css: () => path.join(getRepoPath(), 'src', 'styles', 'global.css'),
  translations: () => path.join(getRepoPath(), 'public', 'i18n', 'translations.json'),
  images: () => path.join(getRepoPath(), 'public', 'images'),
};

// ─── CSS Variable Extraction ─────────────────────────────────────

function parseCSSVariables(cssContent) {
  const rootMatch = cssContent.match(/:root\s*\{([^}]+)\}/s);
  if (!rootMatch) return {};

  const vars = {};
  const lines = rootMatch[1].split('\n');
  let currentGroup = 'other';

  for (const line of lines) {
    const commentMatch = line.match(/\/\*\s*(.+?)\s*\*\//);
    if (commentMatch) {
      currentGroup = commentMatch[1].toLowerCase().replace(/\s+/g, '_');
      continue;
    }

    const varMatch = line.match(/--([^:]+):\s*([^;]+);/);
    if (varMatch) {
      const name = varMatch[1].trim();
      const value = varMatch[2].trim();
      vars[name] = { value, group: currentGroup };
    }
  }

  return vars;
}

function writeCSSVariables(cssContent, updates) {
  let updated = cssContent;
  for (const [name, value] of Object.entries(updates)) {
    const regex = new RegExp(`(--${name}:\\s*)([^;]+)(;)`, 'g');
    updated = updated.replace(regex, `$1${value}$3`);
  }
  return updated;
}

// ─── Read site config from actual files ──────────────────────────

function isRepoAvailable() {
  return fs.existsSync(PATHS.css()) && fs.existsSync(PATHS.translations());
}

function readSiteConfig() {
  if (!isRepoAvailable()) {
    return { colors: {}, fonts: {}, spacing: {}, pages: {}, images: [], available: false };
  }

  const repoPath = getRepoPath();

  // Read CSS
  const cssContent = fs.readFileSync(PATHS.css(), 'utf-8');
  const cssVars = parseCSSVariables(cssContent);

  // Read translations
  const translations = JSON.parse(fs.readFileSync(PATHS.translations(), 'utf-8'));

  // Organize CSS vars into groups
  const colors = {};
  const fonts = {};
  const spacing = {};

  for (const [name, { value, group }] of Object.entries(cssVars)) {
    if (name.startsWith('bg-') || name.startsWith('blue-') || name.startsWith('text-') ||
        name === 'gold' || name === 'green-garden' || name === 'terracotta') {
      colors[name] = value;
    } else if (name.startsWith('font-')) {
      fonts[name] = value;
    } else if (name.startsWith('section-') || name.startsWith('content-') || name.startsWith('side-')) {
      spacing[name] = value;
    }
  }

  // Organize translations by page/section
  const pages = {};
  for (const [key, value] of Object.entries(translations)) {
    const prefix = key.split('.')[0];
    if (!pages[prefix]) pages[prefix] = {};
    pages[prefix][key] = value;
  }

  // List images
  const imagesDir = PATHS.images();
  let images = [];
  if (fs.existsSync(imagesDir)) {
    images = listImagesRecursive(imagesDir, imagesDir);
  }

  return { colors, fonts, spacing, pages, images, available: true };
}

function listImagesRecursive(dir, baseDir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...listImagesRecursive(fullPath, baseDir));
    } else if (/\.(webp|jpg|jpeg|png|gif|svg)$/i.test(entry.name)) {
      const relativePath = '/' + path.relative(baseDir, fullPath).replace(/\\/g, '/');
      const stats = fs.statSync(fullPath);
      results.push({
        path: `/images${relativePath}`,
        name: entry.name,
        size: stats.size,
      });
    }
  }
  return results;
}

// ─── Write updates back to site files ────────────────────────────

function updateColors(colorUpdates) {
  const cssPath = PATHS.css();
  let css = fs.readFileSync(cssPath, 'utf-8');
  css = writeCSSVariables(css, colorUpdates);
  fs.writeFileSync(cssPath, css);
}

function updateTranslations(translationUpdates) {
  const transPath = PATHS.translations();
  const translations = JSON.parse(fs.readFileSync(transPath, 'utf-8'));

  for (const [key, value] of Object.entries(translationUpdates)) {
    if (translations[key]) {
      if (value.en !== undefined) translations[key].en = value.en;
      if (value.fr !== undefined) translations[key].fr = value.fr;
    } else {
      translations[key] = value;
    }
  }

  fs.writeFileSync(transPath, JSON.stringify(translations, null, 2));
}

function getPageSections() {
  return [
    { id: 'home', label: 'Homepage', icon: 'home' },
    { id: 'nav', label: 'Navigation', icon: 'nav' },
    { id: 'homes', label: 'Homes Overview', icon: 'houses' },
    { id: 'moulin', label: 'Le Moulin', icon: 'house' },
    { id: 'grange', label: 'La Grange', icon: 'house' },
    { id: 'jardin', label: 'Le Jardin', icon: 'house' },
    { id: 'compound', label: 'The Compound', icon: 'compound' },
    { id: 'explore', label: 'Explore', icon: 'explore' },
    { id: 'catering', label: 'Catering', icon: 'catering' },
    { id: 'wellness', label: 'Wellness', icon: 'wellness' },
    { id: 'about', label: 'About', icon: 'about' },
    { id: 'contact', label: 'Contact', icon: 'contact' },
    { id: 'gallery', label: 'Gallery', icon: 'gallery' },
    { id: 'footer', label: 'Footer', icon: 'footer' },
    { id: 'amenity', label: 'Amenities', icon: 'amenity' },
    { id: 'success', label: 'Success Page', icon: 'success' },
  ];
}

module.exports = {
  readSiteConfig,
  updateColors,
  updateTranslations,
  getPageSections,
  PATHS,
  getRepoPath,
};
