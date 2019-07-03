import 'babel-polyfill';
import { AppContainer } from 'react-hot-loader';
import React from 'react';
import ReactDOM from 'react-dom';
import App from './live_routes';

const rootEl = document.getElementById('app-container');

ReactDOM.render(
  <AppContainer>
    <App />
  </AppContainer>,
  rootEl
);

if (module.hot) {
  module.hot.accept('./live_routes', () => {
    console.log('hot loaded');
    // If you use Webpack 2 in ES modules mode, you can
    // use <App /> here rather than require() a <NextApp />.
    const NextRoot = require('./live_routes').default;
    ReactDOM.render(
      <AppContainer>
         <NextRoot />
      </AppContainer>,
      rootEl
    );
  });
}