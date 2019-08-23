import React, { Component } from 'react';
import AdaptationView from './app/adaptation/adaptation';
import Adaptation from './app/adaptation';
import Curator from './app/curator';
import Manager from './app/manager';
import { connect } from 'react-redux';
import { getUser } from './appActions';
import { Route } from 'react-router-dom';
import './App.css';

class App extends Component {

	render() {
		const { ui } = this.props;

		if (ui.error){
			return (
				<div>Error</div>
			);
		}

		return ui.isLoading ? (
				<div>Loading</div>
			) : (
			<div className='app'>
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
		ui: state.ui,
		user: state.user
	}
}

export default connect(mapStateToProps, { getUser })(App);