import { useState } from 'react';

const INFO = {
  home: 'Homepage', nav: 'Navigation', homes: 'Homes Overview', moulin: 'Le Moulin', grange: 'La Grange',
  jardin: 'Le Jardin', compound: 'The Compound', explore: 'Explore', catering: 'Catering',
  wellness: 'Wellness', about: 'About', contact: 'Contact', gallery: 'Gallery',
  footer: 'Footer', amenity: 'Amenities', success: 'Success Page',
};

export default function SectionEditor({ sectionId, translations, onUpdate }) {
  const [filter, setFilter] = useState('');
  const [lang, setLang] = useState('en');

  const keys = Object.entries(translations).filter(([k]) => !filter || k.toLowerCase().includes(filter.toLowerCase()));

  function update(key, l, value) {
    onUpdate({ ...translations, [key]: { ...translations[key], [l]: value } });
  }

  return (
    <div className="space-y-3">
      <div>
        <span className="text-xs font-semibold text-t1">{INFO[sectionId] || sectionId}</span>
        <p className="font-mono text-[10px] text-t4 mt-0.5">{keys.length} keys</p>
      </div>

      <div className="flex gap-1.5">
        <input type="text" placeholder="filter..." value={filter} onChange={e => setFilter(e.target.value)}
          className="flex-1 bg-card border border-border rounded px-2.5 py-1 text-[11px] text-t1 placeholder-t4 font-mono focus:border-accent focus:outline-none" />
        <div className="flex gap-px bg-panel rounded border border-border">
          {['en', 'fr', 'both'].map(l => (
            <button key={l} onClick={() => setLang(l)}
              className={`px-2 py-1 font-mono text-[10px] transition-colors ${lang === l ? 'bg-accent text-white' : 'text-t4 hover:text-t2'}`}>
              {l.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1">
        {keys.length === 0 ? <p className="text-t4 text-xs font-mono py-6 text-center">No keys</p> : keys.map(([key, val]) => {
          const short = key.split('.').slice(1).join('.');
          const long = (val.en?.length || 0) > 80 || (val.fr?.length || 0) > 80;
          const Tag = long ? 'textarea' : 'input';
          const extra = long ? { rows: 3 } : { type: 'text' };
          const cls = "w-full bg-bg border border-border rounded px-2 py-1 text-[11px] text-t1 font-mono focus:border-accent focus:outline-none resize-none";

          return (
            <div key={key} className="bg-panel rounded px-2.5 py-2 border border-border hover:border-t4/30 transition-colors">
              <span className="font-mono text-[9px] text-t4 block mb-1">{short}</span>
              {(lang === 'en' || lang === 'both') && (
                <div className={lang === 'both' ? 'mb-1' : ''}>
                  {lang === 'both' && <span className="font-mono text-[8px] text-accent">EN</span>}
                  <Tag {...extra} value={val.en || ''} onChange={e => update(key, 'en', e.target.value)} className={cls} />
                </div>
              )}
              {(lang === 'fr' || lang === 'both') && (
                <div>
                  {lang === 'both' && <span className="font-mono text-[8px] text-accent">FR</span>}
                  <Tag {...extra} value={val.fr || ''} onChange={e => update(key, 'fr', e.target.value)} className={`${cls} italic`} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
