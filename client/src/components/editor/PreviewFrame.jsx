import { useMemo } from 'react';

export default function PreviewFrame({ config }) {
  const html = useMemo(() => generatePreviewHTML(config), [config]);

  return (
    <div className="h-full flex flex-col">
      <div className="h-10 bg-dark-850 border-b border-gray-800 flex items-center px-4 gap-2 shrink-0">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/60" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
          <div className="w-3 h-3 rounded-full bg-green-500/60" />
        </div>
        <div className="flex-1 mx-4">
          <div className="bg-dark-900 rounded-md px-3 py-1 text-xs text-gray-500 text-center">
            Live Preview
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-auto bg-white">
        <iframe
          srcDoc={html}
          title="Site Preview"
          className="w-full h-full border-0"
          sandbox="allow-scripts"
        />
      </div>
    </div>
  );
}

function generatePreviewHTML(config) {
  if (!config) return '<html><body><p>Loading...</p></body></html>';

  const { colors, fonts, sections, images } = config;

  const sectionsHTML = (sections || [])
    .map((section) => {
      switch (section.type) {
        case 'hero':
          return `
            <section style="
              background: ${section.background_color || colors.primary};
              ${section.background_image ? `background-image: linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('${section.background_image}');` : ''}
              background-size: cover; background-position: center;
              min-height: 60vh; display: flex; align-items: center; justify-content: center;
              text-align: center; padding: 4rem 2rem; color: white;
            ">
              <div>
                <h1 style="font-family: ${fonts.heading.family}; font-size: ${fonts.heading.size}; font-weight: ${fonts.heading.weight}; margin-bottom: 1rem;">
                  ${esc(section.headline || '')}
                </h1>
                <p style="font-family: ${fonts.body.family}; font-size: 1.25rem; opacity: 0.9; margin-bottom: 2rem;">
                  ${esc(section.subheadline || '')}
                </p>
                ${section.cta_text ? `
                  <a href="${esc(section.cta_link || '#')}" style="
                    display: inline-block; background: ${colors.primary}; color: white;
                    padding: 0.75rem 2rem; border-radius: 0.5rem; text-decoration: none;
                    font-family: ${fonts.body.family}; font-weight: 600;
                  ">${esc(section.cta_text)}</a>
                ` : ''}
              </div>
            </section>`;

        case 'about':
          return `
            <section style="background: ${section.background_color || '#fff'}; padding: 5rem 2rem;">
              <div style="max-width: 800px; margin: 0 auto; text-align: center;">
                <h2 style="font-family: ${fonts.heading.family}; font-size: calc(${fonts.heading.size} * 0.8); font-weight: ${fonts.heading.weight}; color: ${fonts.heading.color}; margin-bottom: 1.5rem;">
                  ${esc(section.headline || '')}
                </h2>
                <p style="font-family: ${fonts.body.family}; font-size: ${fonts.body.size}; color: ${fonts.body.color}; line-height: 1.8;">
                  ${esc(section.body || '')}
                </p>
              </div>
            </section>`;

        case 'features':
          return `
            <section style="background: ${section.background_color || '#f8fafc'}; padding: 5rem 2rem;">
              <div style="max-width: 1000px; margin: 0 auto;">
                <h2 style="font-family: ${fonts.heading.family}; font-size: calc(${fonts.heading.size} * 0.8); font-weight: ${fonts.heading.weight}; color: ${fonts.heading.color}; text-align: center; margin-bottom: 3rem;">
                  ${esc(section.headline || '')}
                </h2>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 2rem;">
                  ${(section.items || []).map((item) => `
                    <div style="background: white; border-radius: 0.75rem; padding: 2rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                      <h3 style="font-family: ${fonts.heading.family}; font-weight: 600; font-size: 1.25rem; color: ${fonts.heading.color}; margin-bottom: 0.5rem;">
                        ${esc(item.title || '')}
                      </h3>
                      <p style="font-family: ${fonts.body.family}; color: ${fonts.body.color}; font-size: 0.875rem; line-height: 1.6;">
                        ${esc(item.description || '')}
                      </p>
                    </div>
                  `).join('')}
                </div>
              </div>
            </section>`;

        case 'footer':
          return `
            <footer style="background: ${section.background_color || '#0f172a'}; color: #94a3b8; padding: 2rem; text-align: center;">
              <p style="font-family: ${fonts.body.family}; font-size: 0.875rem;">${esc(section.text || '')}</p>
            </footer>`;

        default:
          return '';
      }
    })
    .join('');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="https://fonts.googleapis.com/css2?family=${fonts.heading.family.replace(/\s/g, '+')}:wght@300;400;500;600;700;800&family=${fonts.body.family.replace(/\s/g, '+')}:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: ${fonts.body.family}, sans-serif; color: ${colors.text}; background: ${colors.background}; }
    img { max-width: 100%; }
  </style>
</head>
<body>${sectionsHTML}</body>
</html>`;
}

function esc(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
