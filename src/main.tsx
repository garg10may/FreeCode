import ReactDOM from 'react-dom/client';
import App from './App';
import './styles.css';

const theme = localStorage.getItem('fc:theme');
if (theme === 'light' || theme === 'dark') {
  document.documentElement.dataset.theme = theme;
}

ReactDOM.createRoot(document.getElementById('root')!).render(<App />);
