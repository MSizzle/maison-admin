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
          className="w-8 h-8 rounded-lg border border-gray-600 cursor-pointer shrink-0"
          style={{ backgroundColor: color }}
        />
        <HexColorInput
          color={color}
          onChange={onChange}
          prefixed
          className="bg-dark-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-gray-200 focus:border-accent focus:outline-none w-28 font-mono"
        />
      </div>

      {open && (
        <div className="absolute z-50 mt-2 p-3 bg-dark-800 rounded-xl border border-gray-700 shadow-2xl">
          <HexColorPicker color={color} onChange={onChange} />
          <div className="flex gap-1 mt-2">
            {['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#FFFFFF', '#111827'].map((c) => (
              <button
                key={c}
                onClick={() => onChange(c)}
                className="w-6 h-6 rounded border border-gray-600 hover:scale-110 transition-transform"
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
