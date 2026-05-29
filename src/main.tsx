import './app/perf-debugger-init';
import { createRoot } from 'react-dom/client';
import { App } from './app/App';
import { RenderProfiler } from './app/perf-debugger';
import './styles.css';

document.body.style.margin = '0';
document.body.style.fontFamily = 'Inter, system-ui, sans-serif';
document.body.style.backgroundColor = '#020617';

const rootNode = document.getElementById('root');
if (!rootNode) {
  throw new Error('Root element not found.');
}

const treeWithProfiler = import.meta.env.DEV ? (
  <RenderProfiler id='app-root'>
    <App />
  </RenderProfiler>
) : (
  <App />
);

createRoot(rootNode).render(treeWithProfiler);
