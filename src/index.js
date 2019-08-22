
import 'react-app-polyfill/ie9';
import 'react-app-polyfill/stable';

import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter as Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import App from './App';
import configureStore from './store';


const store = configureStore({
	wt: {
		routerId: window.routerId,
		serverId: window.serverId
	}
});

const render = () => (
	<Provider store={store}>
		<Router>
			<App />
		</Router>
	</Provider>
);

ReactDOM.render(render(), document.getElementById('root'));

