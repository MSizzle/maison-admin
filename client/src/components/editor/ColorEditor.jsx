import ColorPicker from './ColorPicker';

const COLOR_LABELS = {
  'bg-cream': 'Page Background',
  'bg-warm-white': 'Warm White',
  'bg-stone': 'Stone Accent',
  'bg-dark': 'Dark Background',
  'blue-primary': 'Primary Blue (Volet Bleu)',
  'blue-dark': 'Dark Blue',
  'blue-light': 'Light Blue',
  'blue-pale': 'Pale Blue',
  'text-primary': 'Body Text',
  'text-secondary': 'Secondary Text',
  'text-light': 'Light Text',
  'text-on-dark': 'Text on Dark',
  'gold': 'Gold Accent',
  'green-garden': 'Garden Green',
  'terracotta': 'Terracotta',
};

const GROUPS = {
  'Backgrounds': ['bg-cream', 'bg-warm-white', 'bg-stone', 'bg-dark'],
  'Brand Blues': ['blue-primary', 'blue-dark', 'blue-light', 'blue-pale'],
  'Text Colors': ['text-primary', 'text-secondary', 'text-light', 'text-on-dark'],
  'Accents': ['gold', 'green-garden', 'terracotta'],
};

export default function ColorEditor({ colors, fonts, onUpdateColors }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-gray-200 mb-1">Design System</h3>
        <p className="text-xs text-gray-500 mb-4">Edit the CSS custom properties that control the Moulin à Rêves site.</p>
      </div>

      {Object.entries(GROUPS).map(([groupName, keys]) => (
        <div key={groupName}>
          <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">{groupName}</h4>
          <div className="space-y-3">
            {keys.map((key) =>
              colors[key] !== undefined ? (
                <div key={key} className="flex items-center gap-3">
                  <ColorPicker
                    color={colors[key]}
                    onChange={(c) => onUpdateColors({ ...colors, [key]: c })}
                  />
                  <div className="min-w-0">
                    <p className="text-sm text-gray-300">{COLOR_LABELS[key] || key}</p>
                    <p className="text-[10px] text-gray-600 font-mono">--{key}</p>
                  </div>
                </div>
              ) : null
            )}
          </div>
        </div>
      ))}

      {/* Font preview (read-only for now) */}
      <div>
        <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Typography</h4>
        <div className="space-y-2">
          {Object.entries(fonts || {}).map(([key, value]) => (
            <div key={key} className="bg-dark-800 rounded-lg p-3">
              <p className="text-[10px] text-gray-500 font-mono mb-1">--{key}</p>
              <p className="text-sm text-gray-300">{value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
