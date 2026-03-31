export default function Sidebar({ activeTab, onTabChange }) {
  return (
    <aside className="w-14 lg:w-48 bg-panel border-r border-border flex flex-col shrink-0">
      <div className="h-12 flex items-center px-3 border-b border-border">
        <div className="w-6 h-6 rounded bg-accent text-white flex items-center justify-center text-[10px] font-bold font-mono">M</div>
        <span className="ml-2 text-xs font-semibold text-t2 hidden lg:block tracking-wide uppercase">Maison</span>
      </div>

      <nav className="flex-1 py-2 px-1.5 space-y-0.5">
        <NavBtn active={activeTab === 'analytics'} onClick={() => onTabChange('analytics')}
          icon="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
          label="Analytics" />
        <NavBtn active={activeTab === 'editor'} onClick={() => onTabChange('editor')}
          icon="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
          label="Editor" />
      </nav>

      <div className="p-3 border-t border-border flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-green animate-pulse-dot" />
        <span className="text-[10px] text-t4 hidden lg:block font-mono">ONLINE</span>
      </div>
    </aside>
  );
}

function NavBtn({ active, onClick, icon, label }) {
  return (
    <button onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded text-xs transition-colors ${
        active ? 'bg-accent/15 text-accent font-semibold' : 'text-t3 hover:text-t2 hover:bg-hover'
      }`}>
      <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
      </svg>
      <span className="hidden lg:block">{label}</span>
    </button>
  );
}
