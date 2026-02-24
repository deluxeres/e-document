import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider as ReduxProvider } from 'react-redux';
import { Provider } from './components/ui/provider';
import store from './components/reducers/store';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <Provider>
        <ReduxProvider store={store}>
            <BrowserRouter>
                <App />
            </BrowserRouter>
        </ReduxProvider>
    </Provider>
);