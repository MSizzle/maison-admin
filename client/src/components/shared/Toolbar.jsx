export default function Toolbar({ onSave, onPublish, onRevert, onUndo, onRedo, canUndo, canRedo, saving, publishing, dirty }) {
  return (
    <div className="h-14 bg-white border-b border-surface-border flex items-center px-5 gap-3 shrink-0">
      <h2 className="font-display text-lg font-bold text-text-primary mr-2">Site Editor</h2>
      {dirty && (
        <span className="px-2 py-0.5 text-[10px] font-semibold bg-gold/10 text-gold rounded-full border border-gold/20">
          Unsaved
        </span>
      )}

      <div className="flex gap-0.5 ml-2">
        <IconBtn onClick={onUndo} disabled={!canUndo} title="Undo"
          d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
        <IconBtn onClick={onRedo} disabled={!canRedo} title="Redo"
          d="M15 15l6-6m0 0l-6-6m6 6H9a6 6 0 000 12h3" />
      </div>

      <div className="flex-1" />

      <button onClick={onRevert}
        className="px-3 py-1.5 text-[12px] font-semibold text-text-secondary border border-surface-border rounded-lg hover:bg-surface-raised transition-all">
        Revert
      </button>

      <button onClick={onSave} disabled={saving}
        className="px-4 py-1.5 text-[12px] font-semibold bg-white text-text-primary border border-surface-border rounded-lg hover:bg-surface-raised hover:shadow-card transition-all disabled:opacity-50 flex items-center gap-2 shadow-card">
        {saving && <Spinner />}
        Save
      </button>

      <button onClick={onPublish} disabled={publishing}
        className="px-4 py-1.5 text-[12px] font-bold bg-blue-primary text-white rounded-lg hover:bg-blue-hover transition-all disabled:opacity-50 flex items-center gap-2 shadow-card">
        {publishing && <Spinner white />}
        Publish
      </button>
    </div>
  );
}

function IconBtn({ onClick, disabled, title, d }) {
  return (
    <button onClick={onClick} disabled={disabled} title={title}
      className="p-1.5 rounded-md text-text-muted hover:text-text-primary hover:bg-surface-raised disabled:opacity-25 disabled:cursor-not-allowed transition-colors">
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d={d} />
      </svg>
    </button>
  );
}

function Spinner({ white }) {
  return <div className={`w-3 h-3 border-2 ${white ? 'border-white/40 border-t-white' : 'border-text-muted/40 border-t-text-secondary'} rounded-full animate-spin`} />;
}
