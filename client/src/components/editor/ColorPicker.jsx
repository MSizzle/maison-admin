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
          className="w-8 h-8 rounded-lg border border-cream-300 cursor-pointer shrink-0 shadow-sm"
          style={{ backgroundColor: color }}
        />
        <HexColorInput
          color={color}
          onChange={onChange}
          prefixed
          className="bg-white border border-cream-300 rounded-lg px-3 py-1.5 text-sm text-text-primary focus:border-blue-primary focus:outline-none w-28 font-mono"
        />
      </div>

      {open && (
        <div className="absolute z-50 mt-2 p-3 bg-white rounded-xl border border-cream-300 shadow-xl">
          <HexColorPicker color={color} onChange={onChange} />
          <div className="flex gap-1 mt-2">
            {['#2E5A88', '#1B4F72', '#5B8DB8', '#6B7B5E', '#B8860B', '#C4703F', '#FAF7F2', '#2C2C2C'].map((c) => (
              <button
                key={c}
                onClick={() => onChange(c)}
                className="w-6 h-6 rounded border border-cream-300 hover:scale-110 transition-transform"
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
