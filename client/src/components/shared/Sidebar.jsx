export default function Sidebar({ activeTab, onTabChange }) {
  const tabs = [
    {
      id: 'analytics',
      label: 'Analytics',
      icon: 'M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z',
    },
    {
      id: 'editor',
      label: 'Site Editor',
      icon: 'M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10',
    },
  ];

  return (
    <aside className="w-16 lg:w-56 bg-white border-r border-surface-border flex flex-col shrink-0">
      <div className="h-16 flex items-center px-4 border-b border-surface-border">
        <div className="w-8 h-8 rounded-lg bg-blue-primary flex items-center justify-center font-display font-bold text-white text-sm shadow-card">
          M
        </div>
        <div className="ml-3 hidden lg:block">
          <span className="font-display text-[15px] font-bold text-text-primary leading-tight">Moulin à Rêves</span>
          <p className="text-[10px] text-text-muted font-medium">Admin</p>
        </div>
      </div>

      <nav className="flex-1 py-3 space-y-0.5 px-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
              activeTab === tab.id
                ? 'bg-blue-50 text-blue-primary font-semibold'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface-raised'
            }`}
          >
            <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d={tab.icon} />
            </svg>
            <span className="hidden lg:block">{tab.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-surface-border">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-garden animate-pulse-dot" />
          <span className="text-[11px] text-text-muted hidden lg:block font-medium">Online</span>
        </div>
      </div>
    </aside>
  );
}
