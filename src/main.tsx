import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from './components/ui/provider'
import './index.css'
import App from './App.tsx'
import { BackendStatusProvider } from './contexts/BackendStatusContext';
import { CardDataProviderComponent } from './contexts/CardDataContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider>
      <BackendStatusProvider>
        <CardDataProviderComponent>
          <App />
        </CardDataProviderComponent>
      </BackendStatusProvider>
    </Provider>
  </StrictMode>
)
