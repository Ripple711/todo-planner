import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './components/AppLayout';
import { RainShaderBackground } from './components/visual/RainShaderBackground';
import { MainWorkspacePage } from './pages/MainWorkspacePage';
import { QuickCapturePage } from './pages/QuickCapturePage';
import { RainGlassDemoPage } from './pages/RainGlassDemoPage';
import { TaskPoolPage } from './pages/TaskPoolPage';

export default function App() {
  return (
    <>
      <RainShaderBackground intensity={0.62} />
      <Routes>
        <Route path="/rain-glass-demo" element={<RainGlassDemoPage />} />
        <Route
          path="*"
          element={
            <AppLayout>
              <Routes>
                <Route path="/" element={<Navigate to="/workspace" replace />} />
                <Route path="/workspace" element={<MainWorkspacePage />} />
                <Route path="/quick-capture" element={<QuickCapturePage />} />
                <Route path="/task-pool" element={<TaskPoolPage />} />
                <Route path="*" element={<Navigate to="/workspace" replace />} />
              </Routes>
            </AppLayout>
          }
        />
      </Routes>
    </>
  );
}
