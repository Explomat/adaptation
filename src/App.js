import React, { Component } from 'react';
import Loader from './components/loader';
import ErrorAlert from './components/error';
import AdaptationView from './app/adaptation/adaptation';
import Adaptation from './app/adaptation';
import Curator from './app/curator';
import Manager from './app/manager';
import { connect } from 'react-redux';
import { error } from './appActions';
import { Route } from 'react-router-dom';
import './App.css';

class App extends Component {

	render() {
		const { ui, error } = this.props;

		return (
			<div className='app'>
				{ui.isLoading && <Loader message='Загрузка' description='Загружаются результаты'/>}
				<ErrorAlert message={ui.error} visible={ui.error} onClose={() => error(false)}/>
				<Route exact path='/' render={() => {
					return (
						<div>
							<Adaptation />
							<Curator />
							<Manager />
						</div>
					)
				}} />
				<Route exact path='/adaptation/:id' component={AdaptationView}/>
				<Route exact path='/curators/:id' component={Curator}/>
			</div>
		);
	}
}

function mapStateToProps(state){
	return {
		ui: state.app.ui
	}
}

export default connect(mapStateToProps, { error })(App);