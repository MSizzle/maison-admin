export default function Toolbar({ onSave, onPublish, onRevert, onUndo, onRedo, canUndo, canRedo, saving, publishing }) {
  return (
    <div className="h-14 bg-dark-850 border-b border-gray-800 flex items-center px-4 gap-3 shrink-0">
      <h2 className="text-sm font-semibold mr-4">Site Editor</h2>

      {/* Undo/Redo */}
      <div className="flex gap-1">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className="p-2 rounded-lg text-gray-400 hover:text-gray-200 hover:bg-dark-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="Undo (Cmd+Z)"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
          </svg>
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          className="p-2 rounded-lg text-gray-400 hover:text-gray-200 hover:bg-dark-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="Redo (Cmd+Shift+Z)"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l6-6m0 0l-6-6m6 6H9a6 6 0 000 12h3" />
          </svg>
        </button>
      </div>

      <div className="flex-1" />

      {/* Action buttons */}
      <button
        onClick={onRevert}
        className="px-3 py-1.5 text-sm text-gray-400 hover:text-gray-200 border border-gray-700 rounded-lg hover:bg-dark-800 transition-colors"
      >
        Revert
      </button>

      <button
        onClick={onSave}
        disabled={saving}
        className="px-4 py-1.5 text-sm bg-dark-800 text-gray-200 border border-gray-700 rounded-lg hover:bg-dark-700 transition-colors disabled:opacity-50 flex items-center gap-2"
      >
        {saving && <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />}
        Save Draft
      </button>

      <button
        onClick={onPublish}
        disabled={publishing}
        className="px-4 py-1.5 text-sm bg-accent text-white rounded-lg hover:bg-accent-hover transition-colors disabled:opacity-50 flex items-center gap-2 font-medium"
      >
        {publishing && <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />}
        Publish
      </button>
    </div>
  );
}
