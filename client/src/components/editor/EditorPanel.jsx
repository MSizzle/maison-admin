import { useState, useEffect, useRef, useCallback } from 'react';
import toast from 'react-hot-toast';
import SectionEditor from './SectionEditor';
import PreviewFrame from './PreviewFrame';
import Toolbar from '../shared/Toolbar';

export default function EditorPanel() {
  const [config, setConfig] = useState(null);
  const [publishedConfig, setPublishedConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);

  // Load config
  useEffect(() => {
    Promise.all([
      fetch('/api/config/draft').then((r) => r.json()),
      fetch('/api/config').then((r) => r.json()),
    ])
      .then(([draft, published]) => {
        setConfig(draft);
        setPublishedConfig(published);
        setHistory([draft]);
        setHistoryIndex(0);
        if (draft.sections?.length) setActiveSection(draft.sections[0].id);
        setLoading(false);
      })
      .catch(() => {
        toast.error('Failed to load config');
        setLoading(false);
      });
  }, []);

  const pushHistory = useCallback(
    (newConfig) => {
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(newConfig);
      if (newHistory.length > 50) newHistory.shift();
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    },
    [history, historyIndex]
  );

  const updateConfig = useCallback(
    (updater) => {
      setConfig((prev) => {
        const next = typeof updater === 'function' ? updater(prev) : updater;
        pushHistory(next);
        return next;
      });
    },
    [pushHistory]
  );

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex((i) => i - 1);
      setConfig(history[historyIndex - 1]);
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex((i) => i + 1);
      setConfig(history[historyIndex + 1]);
    }
  }, [history, historyIndex]);

  const saveDraft = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/config/draft', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      const data = await res.json();
      if (data.ok) toast.success('Draft saved');
      else toast.error('Save failed');
    } catch {
      toast.error('Save failed');
    }
    setSaving(false);
  };

  const publish = async () => {
    setPublishing(true);
    try {
      // Save draft first
      await fetch('/api/config/draft', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      const res = await fetch('/api/config/publish', { method: 'POST' });
      const data = await res.json();
      if (data.ok) {
        toast.success(data.message || 'Published!');
        setPublishedConfig(config);
      } else {
        toast.error(data.error || 'Publish failed');
      }
    } catch {
      toast.error('Publish failed');
    }
    setPublishing(false);
  };

  const revert = async () => {
    try {
      const res = await fetch('/api/config/revert', { method: 'POST' });
      const data = await res.json();
      if (data.ok) {
        setConfig(data.config);
        pushHistory(data.config);
        toast.success('Reverted to published version');
      }
    } catch {
      toast.error('Revert failed');
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    function onKey(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        saveDraft();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [undo, redo]);

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

  if (!config) return <div className="p-6 text-red-400">Failed to load configuration</div>;

  return (
    <div className="flex flex-col h-full">
      <Toolbar
        onSave={saveDraft}
        onPublish={publish}
        onRevert={revert}
        onUndo={undo}
        onRedo={redo}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        saving={saving}
        publishing={publishing}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Left: Section Tree + Editor */}
        <div className="w-[420px] border-r border-gray-800 flex flex-col overflow-hidden shrink-0">
          {/* Section Tree */}
          <div className="border-b border-gray-800 p-3">
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 px-2">Sections</h3>
            <div className="space-y-0.5">
              {/* Global settings */}
              <button
                onClick={() => setActiveSection('_global')}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                  activeSection === '_global' ? 'bg-accent/10 text-accent' : 'text-gray-400 hover:text-gray-200 hover:bg-dark-800'
                }`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
                </svg>
                Global Styles
              </button>

              {config.sections?.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors capitalize ${
                    activeSection === section.id
                      ? 'bg-accent/10 text-accent'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-dark-800'
                  }`}
                >
                  <SectionIcon type={section.type} />
                  {section.type}
                </button>
              ))}
            </div>
          </div>

          {/* Section Editor */}
          <div className="flex-1 overflow-y-auto p-4">
            <SectionEditor
              config={config}
              activeSection={activeSection}
              onUpdate={updateConfig}
            />
          </div>
        </div>

        {/* Right: Preview */}
        <div className="flex-1 overflow-hidden bg-dark-900">
          <PreviewFrame config={config} />
        </div>
      </div>
    </div>
  );
}

function SectionIcon({ type }) {
  const icons = {
    hero: 'M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z',
    about: 'M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0',
    features: 'M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6z',
    footer: 'M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25',
  };
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d={icons[type] || icons.features} />
    </svg>
  );
}
