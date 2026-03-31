/**
 * Moulin à Rêves site integration
 * Reads/writes the actual Astro site files: CSS variables, translations, images
 * Works locally (filesystem) or remotely (GitHub API)
 */
const fs = require('fs');
const path = require('path');
const github = require('./github');

const CSS_PATH = 'src/styles/global.css';
const TRANSLATIONS_PATH = 'public/i18n/translations.json';

function getRepoPath() {
  return process.env.DEPLOY_REPO_PATH || path.join(__dirname, '..', '..', 'moulin-a-reves');
}

const PATHS = {
  css: () => path.join(getRepoPath(), CSS_PATH),
  translations: () => path.join(getRepoPath(), TRANSLATIONS_PATH),
  images: () => path.join(getRepoPath(), 'public', 'images'),
};

function isLocalRepoAvailable() {
  return fs.existsSync(PATHS.css()) && fs.existsSync(PATHS.translations());
}

// ─── CSS Variable Parsing ────────────────────────────────────────

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
      vars[varMatch[1].trim()] = { value: varMatch[2].trim(), group: currentGroup };
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

function organizeConfig(cssContent, translationsContent) {
  const cssVars = parseCSSVariables(cssContent);
  const translations = JSON.parse(translationsContent);

  const colors = {};
  const fonts = {};
  const spacing = {};

  for (const [name, { value }] of Object.entries(cssVars)) {
    if (name.startsWith('bg-') || name.startsWith('blue-') || name.startsWith('text-') ||
        name === 'gold' || name === 'green-garden' || name === 'terracotta') {
      colors[name] = value;
    } else if (name.startsWith('font-')) {
      fonts[name] = value;
    } else if (name.startsWith('section-') || name.startsWith('content-') || name.startsWith('side-')) {
      spacing[name] = value;
    }
  }

  const pages = {};
  for (const [key, value] of Object.entries(translations)) {
    const prefix = key.split('.')[0];
    if (!pages[prefix]) pages[prefix] = {};
    pages[prefix][key] = value;
  }

  return { colors, fonts, spacing, pages };
}

// ─── Read (local or GitHub) ──────────────────────────────────────

async function readSiteConfig() {
  // Try local filesystem first
  if (isLocalRepoAvailable()) {
    const cssContent = fs.readFileSync(PATHS.css(), 'utf-8');
    const translationsContent = fs.readFileSync(PATHS.translations(), 'utf-8');
    const config = organizeConfig(cssContent, translationsContent);

    let images = [];
    const imagesDir = PATHS.images();
    if (fs.existsSync(imagesDir)) {
      images = listImagesRecursive(imagesDir, imagesDir);
    }

    return { ...config, images, available: true, source: 'local' };
  }

  // Fall back to GitHub API
  if (github.isAvailable()) {
    try {
      const [cssFile, transFile] = await Promise.all([
        github.readFile(CSS_PATH),
        github.readFile(TRANSLATIONS_PATH),
      ]);
      const config = organizeConfig(cssFile.content, transFile.content);
      return { ...config, images: [], available: true, source: 'github' };
    } catch (err) {
      console.error('[Moulin] GitHub read error:', err.message);
      return { colors: {}, fonts: {}, spacing: {}, pages: {}, images: [], available: false, error: err.message };
    }
  }

  return { colors: {}, fonts: {}, spacing: {}, pages: {}, images: [], available: false };
}

// ─── Write (local or GitHub) ─────────────────────────────────────

async function updateColors(colorUpdates) {
  if (isLocalRepoAvailable()) {
    const cssPath = PATHS.css();
    let css = fs.readFileSync(cssPath, 'utf-8');
    css = writeCSSVariables(css, colorUpdates);
    fs.writeFileSync(cssPath, css);
    return;
  }

  if (github.isAvailable()) {
    const { content: css } = await github.readFile(CSS_PATH);
    const updated = writeCSSVariables(css, colorUpdates);
    await github.writeFile(CSS_PATH, updated, 'Update colors via Maison Admin');
    return;
  }

  throw new Error('No repo access — local repo not found and GitHub token not configured');
}

async function updateTranslations(translationUpdates) {
  if (isLocalRepoAvailable()) {
    const transPath = PATHS.translations();
    const translations = JSON.parse(fs.readFileSync(transPath, 'utf-8'));
    applyTranslationUpdates(translations, translationUpdates);
    fs.writeFileSync(transPath, JSON.stringify(translations, null, 2));
    return;
  }

  if (github.isAvailable()) {
    const { content } = await github.readFile(TRANSLATIONS_PATH);
    const translations = JSON.parse(content);
    applyTranslationUpdates(translations, translationUpdates);
    await github.writeFile(TRANSLATIONS_PATH, JSON.stringify(translations, null, 2), 'Update translations via Maison Admin');
    return;
  }

  throw new Error('No repo access — local repo not found and GitHub token not configured');
}

// Save both colors and translations in a single commit (GitHub only)
async function saveAll(colorUpdates, translationUpdates) {
  if (isLocalRepoAvailable()) {
    // Local: just write both files
    if (colorUpdates && Object.keys(colorUpdates).length) {
      const cssPath = PATHS.css();
      let css = fs.readFileSync(cssPath, 'utf-8');
      css = writeCSSVariables(css, colorUpdates);
      fs.writeFileSync(cssPath, css);
    }
    if (translationUpdates && Object.keys(translationUpdates).length) {
      const transPath = PATHS.translations();
      const translations = JSON.parse(fs.readFileSync(transPath, 'utf-8'));
      applyTranslationUpdates(translations, translationUpdates);
      fs.writeFileSync(transPath, JSON.stringify(translations, null, 2));
    }
    return { source: 'local' };
  }

  if (github.isAvailable()) {
    const files = [];

    if (colorUpdates && Object.keys(colorUpdates).length) {
      const { content: css } = await github.readFile(CSS_PATH);
      files.push({ path: CSS_PATH, content: writeCSSVariables(css, colorUpdates) });
    }

    if (translationUpdates && Object.keys(translationUpdates).length) {
      const { content } = await github.readFile(TRANSLATIONS_PATH);
      const translations = JSON.parse(content);
      applyTranslationUpdates(translations, translationUpdates);
      files.push({ path: TRANSLATIONS_PATH, content: JSON.stringify(translations, null, 2) });
    }

    if (files.length > 0) {
      await github.writeFiles(files, 'Site update via Maison Admin');
    }

    return { source: 'github' };
  }

  throw new Error('No repo access');
}

function applyTranslationUpdates(translations, updates) {
  for (const [key, value] of Object.entries(updates)) {
    if (translations[key]) {
      if (value.en !== undefined) translations[key].en = value.en;
      if (value.fr !== undefined) translations[key].fr = value.fr;
    } else {
      translations[key] = value;
    }
  }
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
      results.push({ path: `/images${relativePath}`, name: entry.name, size: stats.size });
    }
  }
  return results;
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
  saveAll,
  getPageSections,
  PATHS,
  getRepoPath,
  isLocalRepoAvailable,
};
