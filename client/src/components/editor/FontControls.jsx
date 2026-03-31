import { useState, useEffect } from 'react';
import ColorPicker from './ColorPicker';

const FONT_FAMILIES = [
  'Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins',
  'Playfair Display', 'Cormorant Garamond', 'DM Sans', 'Source Sans Pro',
  'Merriweather', 'Raleway', 'Nunito', 'Work Sans', 'Outfit',
];

const WEIGHTS = ['300', '400', '500', '600', '700', '800'];

export default function FontControls({ font, onChange }) {
  if (!font) return null;

  function update(field, value) {
    onChange({ ...font, [field]: value });
  }

  // Load Google Font when family changes
  useEffect(() => {
    if (font.family) {
      const id = `gfont-${font.family.replace(/\s/g, '-')}`;
      if (!document.getElementById(id)) {
        const link = document.createElement('link');
        link.id = id;
        link.rel = 'stylesheet';
        link.href = `https://fonts.googleapis.com/css2?family=${font.family.replace(/\s/g, '+')}:wght@300;400;500;600;700;800&display=swap`;
        document.head.appendChild(link);
      }
    }
  }, [font.family]);

  return (
    <div className="space-y-3 bg-dark-800 rounded-lg p-3">
      {/* Family */}
      <div>
        <label className="block text-[10px] text-gray-500 mb-1">Family</label>
        <select
          value={font.family}
          onChange={(e) => update('family', e.target.value)}
          className="w-full bg-dark-900 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-gray-200 focus:border-accent focus:outline-none"
        >
          {FONT_FAMILIES.map((f) => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>
      </div>

      {/* Size slider */}
      <div>
        <div className="flex items-center justify-between">
          <label className="text-[10px] text-gray-500">Size</label>
          <span className="text-[10px] text-gray-400 font-mono">{font.size}</span>
        </div>
        <input
          type="range"
          min="0.75"
          max="5"
          step="0.125"
          value={parseFloat(font.size)}
          onChange={(e) => update('size', e.target.value + 'rem')}
          className="w-full accent-accent h-1.5"
        />
      </div>

      {/* Weight */}
      <div>
        <label className="block text-[10px] text-gray-500 mb-1">Weight</label>
        <div className="flex gap-1">
          {WEIGHTS.map((w) => (
            <button
              key={w}
              onClick={() => update('weight', w)}
              className={`flex-1 py-1 text-[10px] rounded transition-colors ${
                font.weight === w ? 'bg-accent text-white' : 'bg-dark-900 text-gray-400 hover:text-gray-200'
              }`}
            >
              {w}
            </button>
          ))}
        </div>
      </div>

      {/* Color */}
      <div>
        <label className="block text-[10px] text-gray-500 mb-1">Color</label>
        <ColorPicker color={font.color} onChange={(c) => update('color', c)} />
      </div>

      {/* Preview */}
      <div className="border-t border-gray-700 pt-2">
        <p
          style={{
            fontFamily: font.family,
            fontSize: font.size,
            fontWeight: font.weight,
            color: font.color,
          }}
          className="truncate"
        >
          The quick brown fox
        </p>
      </div>
    </div>
  );
}
