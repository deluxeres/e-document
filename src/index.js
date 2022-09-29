import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react'
import {Provider} from 'react-redux'
import store from './components/reducers/store'
import './index.scss';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
      <ChakraProvider>
        <BrowserRouter>
          <Provider store={store}>
            <App />
          </Provider>
          </BrowserRouter>
      </ChakraProvider>
  </React.StrictMode>
);