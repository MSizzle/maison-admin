import ColorPicker from './ColorPicker';

const COLOR_LABELS = {
  'bg-cream': 'Page Background',
  'bg-warm-white': 'Warm White',
  'bg-stone': 'Stone Accent',
  'bg-dark': 'Dark Background',
  'blue-primary': 'Primary Blue',
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
        <h3 className="text-[13px] font-bold text-text-primary mb-0.5">Design System</h3>
        <p className="text-[11px] text-text-muted">CSS custom properties for the Moulin à Rêves site.</p>
      </div>

      {Object.entries(GROUPS).map(([groupName, keys]) => (
        <div key={groupName}>
          <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2.5">{groupName}</h4>
          <div className="space-y-2.5">
            {keys.map((key) =>
              colors[key] !== undefined ? (
                <div key={key} className="flex items-center gap-3">
                  <ColorPicker
                    color={colors[key]}
                    onChange={(c) => onUpdateColors({ ...colors, [key]: c })}
                  />
                  <div className="min-w-0">
                    <p className="text-[12px] text-text-primary font-medium">{COLOR_LABELS[key] || key}</p>
                    <p className="text-[10px] text-text-muted font-mono">--{key}</p>
                  </div>
                </div>
              ) : null
            )}
          </div>
        </div>
      ))}

      <div>
        <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2.5">Typography</h4>
        <div className="space-y-1.5">
          {Object.entries(fonts || {}).map(([key, value]) => (
            <div key={key} className="bg-surface-raised rounded-lg px-3 py-2 border border-surface-border">
              <p className="text-[10px] text-text-muted font-mono">--{key}</p>
              <p className="text-[12px] text-text-primary font-medium">{value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
