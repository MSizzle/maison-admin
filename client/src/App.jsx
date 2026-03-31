import { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import Sidebar from './components/shared/Sidebar';
import AnalyticsDashboard from './components/analytics/AnalyticsDashboard';
import EditorPanel from './components/editor/EditorPanel';

export default function App() {
  const [activeTab, setActiveTab] = useState('analytics');

  return (
    <div className="flex h-screen overflow-hidden">
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: '#FEFCF8', color: '#2C2C2C', border: '1px solid #E4DDD0', fontFamily: 'DM Sans' },
          success: { iconTheme: { primary: '#6B7B5E', secondary: '#FEFCF8' } },
          error: { iconTheme: { primary: '#C4703F', secondary: '#FEFCF8' } },
        }}
      />
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-1 overflow-auto bg-cream-100">
        {activeTab === 'analytics' ? <AnalyticsDashboard /> : <EditorPanel />}
      </main>
    </div>
  );
}
