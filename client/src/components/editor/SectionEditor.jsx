import { useState } from 'react';

const SECTION_INFO = {
  home: { title: 'Homepage', description: 'Hero, intro text, home features, and CTAs' },
  nav: { title: 'Navigation', description: 'Top nav links and mobile menu labels' },
  homes: { title: 'Homes Overview', description: 'The homes listing page intro and cards' },
  moulin: { title: 'Le Moulin', description: 'Le Moulin property page — all copy' },
  grange: { title: 'La Grange', description: 'La Grange property page — all copy' },
  jardin: { title: 'Le Jardin', description: 'Le Jardin property page — all copy' },
  compound: { title: 'The Compound', description: 'Compound overview page — features, amenities, stats' },
  explore: { title: 'Explore', description: 'Things to do page — activities, excursions' },
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
    onUpdate({
      ...translations,
      [key]: { ...translations[key], [lang]: value },
    });
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-gray-200">{info.title}</h3>
        <p className="text-xs text-gray-500 mt-0.5">{info.description}</p>
        <p className="text-[10px] text-gray-600 mt-1">{keys.length} translation keys</p>
      </div>

      {/* Controls */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Filter keys..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="flex-1 bg-dark-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-gray-200 placeholder-gray-600 focus:border-accent focus:outline-none"
        />
        <div className="flex gap-0.5 bg-dark-800 rounded-lg p-0.5 border border-gray-700">
          <button
            onClick={() => setEditingLang('en')}
            className={`px-3 py-1 text-xs rounded-md transition-colors font-medium ${
              editingLang === 'en' ? 'bg-accent text-white' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            EN
          </button>
          <button
            onClick={() => setEditingLang('fr')}
            className={`px-3 py-1 text-xs rounded-md transition-colors font-medium ${
              editingLang === 'fr' ? 'bg-accent text-white' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            FR
          </button>
          <button
            onClick={() => setEditingLang('both')}
            className={`px-3 py-1 text-xs rounded-md transition-colors font-medium ${
              editingLang === 'both' ? 'bg-accent text-white' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Both
          </button>
        </div>
      </div>

      {/* Translation entries */}
      <div className="space-y-2">
        {keys.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-8">No translations found</p>
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
    <div className="bg-dark-800 rounded-lg p-3 group">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[10px] font-mono text-gray-600 truncate">{shortKey}</span>
      </div>

      {(editingLang === 'en' || editingLang === 'both') && (
        <div className="mb-2">
          {editingLang === 'both' && (
            <label className="block text-[10px] text-gray-500 mb-0.5 font-medium">English</label>
          )}
          <InputTag
            {...inputProps}
            value={value.en || ''}
            onChange={(e) => onUpdate('en', e.target.value)}
            className="w-full bg-dark-900 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-gray-200 focus:border-accent focus:outline-none resize-none"
          />
        </div>
      )}

      {(editingLang === 'fr' || editingLang === 'both') && (
        <div>
          {editingLang === 'both' && (
            <label className="block text-[10px] text-gray-500 mb-0.5 font-medium">Français</label>
          )}
          <InputTag
            {...inputProps}
            value={value.fr || ''}
            onChange={(e) => onUpdate('fr', e.target.value)}
            className="w-full bg-dark-900 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-gray-200 focus:border-accent focus:outline-none resize-none italic"
            placeholder={editingLang === 'both' ? 'French translation...' : undefined}
          />
        </div>
      )}
    </div>
  );
}
