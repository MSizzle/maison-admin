import ColorPicker from './ColorPicker';

const LABELS = {
  'bg-cream': 'bg-cream', 'bg-warm-white': 'bg-warm-white', 'bg-stone': 'bg-stone', 'bg-dark': 'bg-dark',
  'blue-primary': 'blue-primary', 'blue-dark': 'blue-dark', 'blue-light': 'blue-light', 'blue-pale': 'blue-pale',
  'text-primary': 'text-primary', 'text-secondary': 'text-secondary', 'text-light': 'text-light', 'text-on-dark': 'text-on-dark',
  'gold': 'gold', 'green-garden': 'green-garden', 'terracotta': 'terracotta',
};

const GROUPS = {
  'BACKGROUNDS': ['bg-cream', 'bg-warm-white', 'bg-stone', 'bg-dark'],
  'BLUES': ['blue-primary', 'blue-dark', 'blue-light', 'blue-pale'],
  'TEXT': ['text-primary', 'text-secondary', 'text-light', 'text-on-dark'],
  'ACCENTS': ['gold', 'green-garden', 'terracotta'],
};

export default function ColorEditor({ colors, fonts, onUpdateColors }) {
  return (
    <div className="space-y-5">
      <div>
        <span className="text-xs font-semibold text-t1">CSS Variables</span>
        <p className="text-[10px] text-t4 font-mono mt-0.5">global.css :root</p>
      </div>

      {Object.entries(GROUPS).map(([group, keys]) => (
        <div key={group}>
          <p className="font-mono text-[9px] text-t4 tracking-widest mb-2">{group}</p>
          <div className="space-y-2">
            {keys.map(key => colors[key] !== undefined ? (
              <div key={key} className="flex items-center gap-2.5">
                <ColorPicker color={colors[key]} onChange={c => onUpdateColors({ ...colors, [key]: c })} />
                <span className="font-mono text-[11px] text-t3">--{key}</span>
              </div>
            ) : null)}
          </div>
        </div>
      ))}

      <div>
        <p className="font-mono text-[9px] text-t4 tracking-widest mb-2">FONTS</p>
        {Object.entries(fonts || {}).map(([key, value]) => (
          <div key={key} className="bg-panel rounded px-2.5 py-1.5 border border-border mb-1.5">
            <span className="font-mono text-[10px] text-t4">--{key}</span>
            <p className="text-xs text-t2">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
