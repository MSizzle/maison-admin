import { useState } from 'react';

const SITE_URL = 'https://www.moulinareves.com';
const PAGES = [
  { path: '/', label: 'Home' }, { path: '/homes/', label: 'Homes' },
  { path: '/homes/le-moulin/', label: 'Le Moulin' }, { path: '/homes/la-grange/', label: 'La Grange' },
  { path: '/homes/le-jardin/', label: 'Le Jardin' }, { path: '/the-compound/', label: 'Compound' },
  { path: '/explore/', label: 'Explore' }, { path: '/catering/', label: 'Catering' },
  { path: '/wellness/', label: 'Wellness' }, { path: '/about/', label: 'About' },
  { path: '/contact/', label: 'Contact' }, { path: '/gallery/', label: 'Gallery' },
  { path: '/journal/', label: 'Journal' },
];

export default function PreviewFrame() {
  const [page, setPage] = useState('/');
  const [vp, setVp] = useState('desktop');
  const w = { desktop: 'w-full', tablet: 'w-[768px] mx-auto', mobile: 'w-[375px] mx-auto' };

  return (
    <div className="h-full flex flex-col">
      <div className="h-9 bg-panel border-b border-border flex items-center px-3 gap-2 shrink-0">
        <select value={page} onChange={e => setPage(e.target.value)}
          className="bg-card border border-border rounded px-1.5 py-0.5 text-[10px] font-mono text-t2 focus:outline-none focus:border-accent">
          {PAGES.map(p => <option key={p.path} value={p.path}>{p.label}</option>)}
        </select>
        <div className="flex-1 mx-2">
          <div className="bg-bg rounded px-2 py-0.5 text-[10px] font-mono text-t4 text-center truncate">{SITE_URL}{page}</div>
        </div>
        <div className="flex gap-px">
          {['desktop', 'tablet', 'mobile'].map(v => (
            <button key={v} onClick={() => setVp(v)}
              className={`px-1.5 py-0.5 font-mono text-[9px] rounded transition-colors ${vp === v ? 'text-accent bg-accent/10' : 'text-t4 hover:text-t2'}`}>
              {v[0].toUpperCase()}
            </button>
          ))}
        </div>
        <a href={`${SITE_URL}${page}`} target="_blank" rel="noopener noreferrer" className="text-t4 hover:text-t2 ml-1">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
          </svg>
        </a>
      </div>
      <div className="flex-1 overflow-auto bg-bg">
        <div className={`h-full transition-all duration-200 ${w[vp]}`}>
          <iframe src={`${SITE_URL}${page}?edit=1`} title="Preview" className="w-full h-full border-0" key={page} />
        </div>
      </div>
    </div>
  );
}
