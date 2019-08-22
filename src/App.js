import React, { Component } from 'react';
import AdaptationList from './app/adaptations';
import CuratorList from './app/curators';
import ManagerList from './app/managers';
import { connect } from 'react-redux';
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
							<AdaptationList />
							<CuratorList />
							<ManagerList />
						</div>
					)
				}} />
			</div>
		);
	}
}

function mapStateToProps(state){
	return {
		ui: state.ui
	}
}

export default connect(mapStateToProps)(App);