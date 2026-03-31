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

  const widthClass = {
    desktop: 'w-full',
    tablet: 'w-[768px] mx-auto',
    mobile: 'w-[375px] mx-auto',
  };

  return (
    <div className="h-full flex flex-col">
      {/* Browser Chrome */}
      <div className="h-10 bg-dark-850 border-b border-gray-800 flex items-center px-4 gap-2 shrink-0">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/60" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
          <div className="w-3 h-3 rounded-full bg-green-500/60" />
        </div>

        {/* Page selector */}
        <select
          value={currentPage}
          onChange={(e) => setCurrentPage(e.target.value)}
          className="ml-3 bg-dark-900 border border-gray-700 rounded-md px-2 py-1 text-xs text-gray-400 focus:outline-none focus:border-accent"
        >
          {PAGES.map((p) => (
            <option key={p.path} value={p.path}>
              {p.label}
            </option>
          ))}
        </select>

        <div className="flex-1 mx-3">
          <div className="bg-dark-900 rounded-md px-3 py-1 text-xs text-gray-500 text-center truncate">
            {SITE_URL}{currentPage}
          </div>
        </div>

        {/* Viewport toggles */}
        <div className="flex gap-1 bg-dark-900 rounded-md p-0.5">
          {[
            { id: 'desktop', icon: 'M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25A2.25 2.25 0 015.25 3h13.5A2.25 2.25 0 0121 5.25z' },
            { id: 'tablet', icon: 'M10.5 19.5h3m-6.75 2.25h10.5a2.25 2.25 0 002.25-2.25v-15a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 4.5v15a2.25 2.25 0 002.25 2.25z' },
            { id: 'mobile', icon: 'M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3' },
          ].map(({ id, icon }) => (
            <button
              key={id}
              onClick={() => setViewport(id)}
              className={`p-1 rounded transition-colors ${
                viewport === id ? 'text-accent' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
              </svg>
            </button>
          ))}
        </div>

        {/* Open in new tab */}
        <a
          href={`${SITE_URL}${currentPage}`}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1 text-gray-500 hover:text-gray-300 transition-colors"
          title="Open in new tab"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
          </svg>
        </a>
      </div>

      {/* iframe */}
      <div className="flex-1 overflow-auto bg-gray-100">
        <div className={`h-full transition-all duration-300 ${widthClass[viewport]}`}>
          <iframe
            src={`${SITE_URL}${currentPage}`}
            title="Site Preview"
            className="w-full h-full border-0"
            key={currentPage}
          />
        </div>
      </div>
    </div>
  );
}
