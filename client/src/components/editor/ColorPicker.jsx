import { useState, useRef, useEffect } from 'react';
import { HexColorPicker, HexColorInput } from 'react-colorful';

export default function ColorPicker({ color, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function onClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setOpen(!open)}
          className="w-7 h-7 rounded-md border border-surface-border cursor-pointer shrink-0 shadow-card"
          style={{ backgroundColor: color }}
        />
        <HexColorInput
          color={color}
          onChange={onChange}
          prefixed
          className="bg-white border border-surface-border rounded-md px-2 py-1 text-[12px] text-text-primary focus:border-blue-primary focus:outline-none w-24 font-mono"
        />
      </div>

      {open && (
        <div className="absolute z-50 mt-2 p-3 bg-white rounded-xl border border-surface-border shadow-raised">
          <HexColorPicker color={color} onChange={onChange} />
          <div className="flex gap-1 mt-2">
            {['#2E5A88', '#1B4F72', '#5B8DB8', '#6B7B5E', '#B8860B', '#C4703F', '#FAF7F2', '#2C2C2C'].map((c) => (
              <button
                key={c}
                onClick={() => onChange(c)}
                className="w-5 h-5 rounded border border-surface-border hover:scale-110 transition-transform"
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
