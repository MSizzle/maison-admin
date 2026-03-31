export default function Toolbar({ onSave, onPublish, onRevert, onUndo, onRedo, canUndo, canRedo, saving, publishing, dirty }) {
  return (
    <div className="h-14 bg-cream-50 border-b border-cream-300 flex items-center px-4 gap-3 shrink-0">
      <h2 className="font-display text-lg font-semibold text-text-primary mr-2">Site Editor</h2>
      {dirty && (
        <span className="px-2 py-0.5 text-[10px] font-medium bg-gold/10 text-gold rounded-full border border-gold/20">
          Unsaved changes
        </span>
      )}

      <div className="flex gap-1 ml-2">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-cream-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="Undo (Cmd+Z)"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
          </svg>
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-cream-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="Redo (Cmd+Shift+Z)"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l6-6m0 0l-6-6m6 6H9a6 6 0 000 12h3" />
          </svg>
        </button>
      </div>

      <div className="flex-1" />

      <button
        onClick={onRevert}
        className="px-3 py-1.5 text-sm text-text-secondary hover:text-text-primary border border-cream-300 rounded-lg hover:bg-cream-200 transition-colors"
      >
        Revert
      </button>

      <button
        onClick={onSave}
        disabled={saving}
        className="px-4 py-1.5 text-sm bg-white text-text-primary border border-cream-300 rounded-lg hover:bg-cream-100 transition-colors disabled:opacity-50 flex items-center gap-2 shadow-sm"
      >
        {saving && <div className="w-3 h-3 border-2 border-text-secondary border-t-transparent rounded-full animate-spin" />}
        Save to Repo
      </button>

      <button
        onClick={onPublish}
        disabled={publishing}
        className="px-4 py-1.5 text-sm bg-blue-primary text-white rounded-lg hover:bg-blue-hover transition-colors disabled:opacity-50 flex items-center gap-2 font-medium shadow-sm"
      >
        {publishing && <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />}
        Publish to Netlify
      </button>
    </div>
  );
}
