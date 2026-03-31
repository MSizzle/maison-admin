import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import SectionEditor from './SectionEditor';
import PreviewFrame from './PreviewFrame';
import Toolbar from '../shared/Toolbar';
import ColorEditor from './ColorEditor';

export default function EditorPanel() {
  const [siteData, setSiteData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('_colors');
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  useEffect(() => {
    fetch('/api/site')
      .then((r) => r.json())
      .then((data) => {
        setSiteData(data);
        setHistory([data]);
        setHistoryIndex(0);
        setLoading(false);
      })
      .catch(() => {
        toast.error('Failed to load site data');
        setLoading(false);
      });
  }, []);

  const pushHistory = useCallback(
    (newData) => {
      setHistory((prev) => {
        const sliced = prev.slice(0, historyIndex + 1);
        sliced.push(newData);
        if (sliced.length > 50) sliced.shift();
        return sliced;
      });
      setHistoryIndex((i) => Math.min(i + 1, 49));
    },
    [historyIndex]
  );

  const updateSiteData = useCallback(
    (updater) => {
      setSiteData((prev) => {
        const next = typeof updater === 'function' ? updater(prev) : updater;
        pushHistory(next);
        setDirty(true);
        return next;
      });
    },
    [pushHistory]
  );

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setSiteData(history[newIndex]);
      setDirty(true);
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setSiteData(history[newIndex]);
      setDirty(true);
    }
  }, [history, historyIndex]);

  const save = async () => {
    if (!siteData) return;
    setSaving(true);
    try {
      const allTranslations = Object.fromEntries(
        Object.entries(siteData.pages).flatMap(([, keys]) => Object.entries(keys))
      );

      const res = await fetch('/api/site/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ colors: siteData.colors, translations: allTranslations }),
      });
      const data = await res.json();

      if (data.ok) {
        toast.success(data.source === 'github' ? 'Saved via GitHub' : 'Saved to repo');
        setDirty(false);
      } else {
        toast.error(data.error || 'Save failed');
      }
    } catch {
      toast.error('Save failed');
    }
    setSaving(false);
  };

  const publish = async () => {
    setPublishing(true);
    try {
      const allTranslations = Object.fromEntries(
        Object.entries(siteData.pages).flatMap(([, keys]) => Object.entries(keys))
      );

      const res = await fetch('/api/site/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ colors: siteData.colors, translations: allTranslations }),
      });
      const data = await res.json();
      if (data.ok) {
        toast.success('Published to Netlify!');
        setDirty(false);
      } else {
        toast.error(data.error || 'Publish failed');
      }
    } catch {
      toast.error('Publish failed');
    }
    setPublishing(false);
  };

  const revert = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/site');
      const data = await res.json();
      setSiteData(data);
      pushHistory(data);
      setDirty(false);
      toast.success('Reverted to last saved state');
    } catch {
      toast.error('Revert failed');
    }
    setLoading(false);
  };

  // Keyboard shortcuts
  useEffect(() => {
    function onKey(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        e.shiftKey ? redo() : undo();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        save();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [undo, redo, siteData]);

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="skeleton h-12 w-64 rounded-lg" />
        <div className="grid grid-cols-2 gap-6">
          <div className="skeleton h-[600px] rounded-xl" />
          <div className="skeleton h-[600px] rounded-xl" />
        </div>
      </div>
    );
  }

  if (!siteData) return <div className="p-6 text-red-400">Failed to load site data</div>;

  return (
    <div className="flex flex-col h-full">
      <Toolbar
        onSave={save}
        onPublish={publish}
        onRevert={revert}
        onUndo={undo}
        onRedo={redo}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        saving={saving}
        publishing={publishing}
        dirty={dirty}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Left: Section Tree + Editor */}
        <div className="w-[440px] border-r border-cream-300 flex flex-col overflow-hidden shrink-0">
          {/* Section Tree */}
          <div className="border-b border-gray-800 p-3 overflow-y-auto max-h-[280px]">
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 px-2">
              Moulin à Rêves
            </h3>
            <div className="space-y-0.5">
              <SectionButton
                active={activeSection === '_colors'}
                onClick={() => setActiveSection('_colors')}
                icon="M4.098 19.902a3.75 3.75 0 005.304 0l6.401-6.402M6.75 21A3.75 3.75 0 013 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 003.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008z"
                label="Design System"
              />
              <div className="mt-2 mb-1 px-2">
                <p className="text-[10px] font-medium text-gray-600 uppercase tracking-wider">Pages</p>
              </div>
              {(siteData.sections || []).map((section) => (
                <SectionButton
                  key={section.id}
                  active={activeSection === section.id}
                  onClick={() => setActiveSection(section.id)}
                  label={section.label}
                  count={siteData.pages[section.id] ? Object.keys(siteData.pages[section.id]).length : 0}
                />
              ))}
            </div>
          </div>

          {/* Editor Area */}
          <div className="flex-1 overflow-y-auto p-4">
            {activeSection === '_colors' ? (
              <ColorEditor
                colors={siteData.colors}
                fonts={siteData.fonts}
                onUpdateColors={(colors) => updateSiteData((prev) => ({ ...prev, colors }))}
              />
            ) : (
              <SectionEditor
                sectionId={activeSection}
                translations={siteData.pages[activeSection] || {}}
                onUpdate={(updated) =>
                  updateSiteData((prev) => ({
                    ...prev,
                    pages: { ...prev.pages, [activeSection]: updated },
                  }))
                }
              />
            )}
          </div>
        </div>

        {/* Right: Live Preview */}
        <div className="flex-1 overflow-hidden bg-dark-900">
          <PreviewFrame />
        </div>
      </div>
    </div>
  );
}

function SectionButton({ active, onClick, icon, label, count }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
        active ? 'bg-accent/10 text-accent' : 'text-gray-400 hover:text-gray-200 hover:bg-dark-800'
      }`}
    >
      {icon && (
        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
        </svg>
      )}
      {!icon && <span className="w-4 h-4 shrink-0 rounded bg-gray-700 text-[8px] flex items-center justify-center font-bold">{label?.[0]}</span>}
      <span className="truncate">{label}</span>
      {count > 0 && <span className="ml-auto text-[10px] text-gray-600">{count}</span>}
    </button>
  );
}
