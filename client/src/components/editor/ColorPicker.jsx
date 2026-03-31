import { useState, useRef, useEffect } from 'react';
import { HexColorPicker, HexColorInput } from 'react-colorful';

export default function ColorPicker({ color, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const fn = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <div className="flex items-center gap-1.5">
        <button onClick={() => setOpen(!open)} className="w-6 h-6 rounded border border-border cursor-pointer shrink-0" style={{ backgroundColor: color }} />
        <HexColorInput color={color} onChange={onChange} prefixed
          className="bg-card border border-border rounded px-2 py-0.5 text-[11px] text-t1 font-mono focus:border-accent focus:outline-none w-20" />
      </div>
      {open && (
        <div className="absolute z-50 mt-1.5 p-2.5 bg-card rounded-lg border border-border shadow-xl">
          <HexColorPicker color={color} onChange={onChange} />
          <div className="flex gap-1 mt-2">
            {['#2E5A88', '#1B4F72', '#5B8DB8', '#6B7B5E', '#B8860B', '#C4703F', '#FAF7F2', '#2C2C2C'].map(c => (
              <button key={c} onClick={() => onChange(c)} className="w-5 h-5 rounded border border-border hover:scale-110 transition-transform" style={{ backgroundColor: c }} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
