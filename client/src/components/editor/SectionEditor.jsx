import { useState } from 'react';

const SECTION_INFO = {
  home: { title: 'Homepage', description: 'Hero, intro text, home features, and CTAs' },
  nav: { title: 'Navigation', description: 'Top nav links and mobile menu labels' },
  homes: { title: 'Homes Overview', description: 'The homes listing page intro and cards' },
  moulin: { title: 'Le Moulin', description: 'Le Moulin property page — all copy' },
  grange: { title: 'La Grange', description: 'La Grange property page — all copy' },
  jardin: { title: 'Le Jardin', description: 'Le Jardin property page — all copy' },
  compound: { title: 'The Compound', description: 'Compound overview — features, amenities, stats' },
  explore: { title: 'Explore', description: 'Things to do — activities, excursions' },
  catering: { title: 'Catering', description: 'Catering & private chef page' },
  wellness: { title: 'Wellness', description: 'Spa, yoga, and wellness offerings' },
  about: { title: 'About', description: 'About the property and owners' },
  contact: { title: 'Contact', description: 'Contact form labels and info' },
  gallery: { title: 'Gallery', description: 'Photo gallery page' },
  footer: { title: 'Footer', description: 'Footer links, tagline, newsletter' },
  amenity: { title: 'Amenities', description: 'Amenity icons and descriptions' },
  success: { title: 'Success Page', description: 'Form submission confirmation' },
};

export default function SectionEditor({ sectionId, translations, onUpdate }) {
  const [filter, setFilter] = useState('');
  const [editingLang, setEditingLang] = useState('en');
  const info = SECTION_INFO[sectionId] || { title: sectionId, description: '' };

  const keys = Object.entries(translations).filter(([key]) =>
    filter ? key.toLowerCase().includes(filter.toLowerCase()) : true
  );

  function updateTranslation(key, lang, value) {
    onUpdate({ ...translations, [key]: { ...translations[key], [lang]: value } });
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-[13px] font-bold text-text-primary">{info.title}</h3>
        <p className="text-[11px] text-text-muted mt-0.5">{info.description}</p>
        <p className="text-[10px] text-text-muted mt-0.5 tabular-nums">{keys.length} keys</p>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Filter keys..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="flex-1 bg-white border border-surface-border rounded-lg px-3 py-1.5 text-[12px] text-text-primary placeholder-text-muted focus:border-blue-primary focus:outline-none"
        />
        <div className="flex gap-0.5 bg-surface-raised rounded-lg p-0.5 border border-surface-border">
          {['en', 'fr', 'both'].map((lang) => (
            <button
              key={lang}
              onClick={() => setEditingLang(lang)}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-all uppercase ${
                editingLang === lang ? 'bg-blue-primary text-white shadow-card' : 'text-text-muted hover:text-text-primary'
              }`}
            >
              {lang === 'both' ? 'Both' : lang}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        {keys.length === 0 ? (
          <p className="text-text-muted text-sm text-center py-8">No translations found</p>
        ) : (
          keys.map(([key, value]) => (
            <TranslationField
              key={key}
              translationKey={key}
              value={value}
              editingLang={editingLang}
              onUpdate={(lang, val) => updateTranslation(key, lang, val)}
            />
          ))
        )}
      </div>
    </div>
  );
}

function TranslationField({ translationKey, value, editingLang, onUpdate }) {
  const shortKey = translationKey.split('.').slice(1).join('.');
  const isLong = (value.en?.length || 0) > 80 || (value.fr?.length || 0) > 80;
  const InputTag = isLong ? 'textarea' : 'input';
  const inputProps = isLong ? { rows: 3 } : { type: 'text' };

  return (
    <div className="bg-surface-raised rounded-lg px-3 py-2.5 border border-surface-border group hover:border-surface-muted transition-colors">
      <span className="text-[10px] font-mono text-text-muted block mb-1.5">{shortKey}</span>

      {(editingLang === 'en' || editingLang === 'both') && (
        <div className="mb-1.5">
          {editingLang === 'both' && <label className="block text-[10px] text-text-muted mb-0.5 font-semibold">EN</label>}
          <InputTag
            {...inputProps}
            value={value.en || ''}
            onChange={(e) => onUpdate('en', e.target.value)}
            className="w-full bg-white border border-surface-border rounded-md px-2.5 py-1.5 text-[12px] text-text-primary focus:border-blue-primary focus:outline-none resize-none"
          />
        </div>
      )}

      {(editingLang === 'fr' || editingLang === 'both') && (
        <div>
          {editingLang === 'both' && <label className="block text-[10px] text-text-muted mb-0.5 font-semibold">FR</label>}
          <InputTag
            {...inputProps}
            value={value.fr || ''}
            onChange={(e) => onUpdate('fr', e.target.value)}
            className="w-full bg-white border border-surface-border rounded-md px-2.5 py-1.5 text-[12px] text-text-primary focus:border-blue-primary focus:outline-none resize-none italic"
            placeholder={editingLang === 'both' ? 'French translation...' : undefined}
          />
        </div>
      )}
    </div>
  );
}
