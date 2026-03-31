import { useState } from 'react';

const SITE_URL = 'https://maison-melissa.netlify.app';

const PAGES = [
  { path: '/', label: 'Home' },
  { path: '/homes/', label: 'Homes' },
  { path: '/homes/le-moulin/', label: 'Le Moulin' },
  { path: '/homes/la-grange/', label: 'La Grange' },
  { path: '/homes/le-jardin/', label: 'Le Jardin' },
  { path: '/the-compound/', label: 'Compound' },
  { path: '/explore/', label: 'Explore' },
  { path: '/catering/', label: 'Catering' },
  { path: '/wellness/', label: 'Wellness' },
  { path: '/about/', label: 'About' },
  { path: '/contact/', label: 'Contact' },
  { path: '/gallery/', label: 'Gallery' },
  { path: '/journal/', label: 'Journal' },
];

export default function PreviewFrame() {
  const [currentPage, setCurrentPage] = useState('/');
  const [viewport, setViewport] = useState('desktop');

  const widthClass = { desktop: 'w-full', tablet: 'w-[768px] mx-auto', mobile: 'w-[375px] mx-auto' };

  return (
    <div className="h-full flex flex-col">
      {/* Browser chrome */}
      <div className="h-10 bg-white border-b border-surface-border flex items-center px-4 gap-2 shrink-0">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/70" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-400/70" />
        </div>

        <select
          value={currentPage}
          onChange={(e) => setCurrentPage(e.target.value)}
          className="ml-2 bg-surface-raised border border-surface-border rounded-md px-2 py-0.5 text-[11px] text-text-secondary font-medium focus:outline-none focus:border-blue-primary"
        >
          {PAGES.map((p) => <option key={p.path} value={p.path}>{p.label}</option>)}
        </select>

        <div className="flex-1 mx-3">
          <div className="bg-surface-raised border border-surface-border rounded-md px-3 py-0.5 text-[11px] text-text-muted text-center truncate">
            {SITE_URL}{currentPage}
          </div>
        </div>

        <div className="flex gap-0.5 bg-surface-raised rounded-md p-0.5 border border-surface-border">
          {[
            { id: 'desktop', d: 'M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25A2.25 2.25 0 015.25 3h13.5A2.25 2.25 0 0121 5.25z' },
            { id: 'tablet', d: 'M10.5 19.5h3m-6.75 2.25h10.5a2.25 2.25 0 002.25-2.25v-15a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 4.5v15a2.25 2.25 0 002.25 2.25z' },
            { id: 'mobile', d: 'M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3' },
          ].map(({ id, d }) => (
            <button key={id} onClick={() => setViewport(id)}
              className={`p-1 rounded transition-colors ${viewport === id ? 'text-blue-primary' : 'text-text-muted hover:text-text-secondary'}`}>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d={d} />
              </svg>
            </button>
          ))}
        </div>

        <a href={`${SITE_URL}${currentPage}`} target="_blank" rel="noopener noreferrer"
          className="p-1 text-text-muted hover:text-text-secondary transition-colors" title="Open in new tab">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
          </svg>
        </a>
      </div>

      <div className="flex-1 overflow-auto bg-surface-bg">
        <div className={`h-full transition-all duration-300 ${widthClass[viewport]}`}>
          <iframe src={`${SITE_URL}${currentPage}`} title="Site Preview" className="w-full h-full border-0" key={currentPage} />
        </div>
      </div>
    </div>
  );
}
