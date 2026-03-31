export default function Toolbar({ onSave, onPublish, onRevert, onUndo, onRedo, canUndo, canRedo, saving, publishing, dirty }) {
  return (
    <div className="h-11 bg-panel border-b border-border flex items-center px-4 gap-2 shrink-0">
      <span className="text-xs font-semibold text-t2 mr-2">EDITOR</span>
      {dirty && <span className="font-mono text-[10px] text-warn bg-warn/10 px-1.5 py-0.5 rounded">unsaved</span>}

      <div className="flex gap-0.5 ml-1">
        <IconBtn onClick={onUndo} disabled={!canUndo} d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
        <IconBtn onClick={onRedo} disabled={!canRedo} d="M15 15l6-6m0 0l-6-6m6 6H9a6 6 0 000 12h3" />
      </div>

      <div className="flex-1" />

      <button onClick={onRevert} className="px-2.5 py-1 text-[11px] font-mono text-t3 border border-border rounded hover:bg-hover transition-colors">revert</button>
      <button onClick={onSave} disabled={saving}
        className="px-3 py-1 text-[11px] font-mono text-t1 bg-card border border-border rounded hover:bg-hover transition-colors disabled:opacity-50 flex items-center gap-1.5">
        {saving && <Spin />} save
      </button>
      <button onClick={onPublish} disabled={publishing}
        className="px-3 py-1 text-[11px] font-mono font-semibold text-white bg-accent rounded hover:bg-accent-hover transition-colors disabled:opacity-50 flex items-center gap-1.5">
        {publishing && <Spin white />} publish
      </button>
    </div>
  );
}

function IconBtn({ onClick, disabled, d }) {
  return <button onClick={onClick} disabled={disabled}
    className="p-1 rounded text-t4 hover:text-t2 hover:bg-hover disabled:opacity-20 transition-colors">
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d={d} /></svg>
  </button>;
}

function Spin({ white }) {
  return <div className={`w-2.5 h-2.5 border-[1.5px] ${white ? 'border-white/30 border-t-white' : 'border-t3/30 border-t-t2'} rounded-full animate-spin`} />;
}
