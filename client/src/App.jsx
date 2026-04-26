import { Toaster } from 'react-hot-toast';
import EditorPanel from './components/editor/EditorPanel';

export default function App() {
  return (
    <div className="flex h-screen overflow-hidden">
      <Toaster position="bottom-right" toastOptions={{
        style: { background: '#1C1F2B', color: '#E2E8F0', border: '1px solid #2A2D3A', fontSize: '13px' },
      }} />
      <main className="flex-1 overflow-auto">
        <EditorPanel />
      </main>
    </div>
  );
}
