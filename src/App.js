import React, { Component } from 'react';
import { withRouter } from 'react-router';
import Loader from './components/loader';
import ErrorAlert from './components/error';
import AdaptationView from './app/adaptation/adaptation';
import Adaptation from './app/adaptation';
import Curator from './app/curator';
import Manager from './app/manager';
import { Tabs } from 'antd';
import { connect } from 'react-redux';
import { error, getUsers } from './appActions';
import { Route } from 'react-router-dom';
import './App.css';

class App extends Component {

	constructor(props){
		super(props);

		this.onTabChange = this.onTabChange.bind(this);
		this.routes = {
			adaptations: '/adaptations',
			curators: '/curators',
			managers: '/managers'
		}
		/*this.state = {
			defaultKey: this.routes.adaptations
		}*/
	}

	componentDidMount(){
		this.props.getUsers();
		/*console.log(this.props.location.pathname);

		const route = Object.keys(this.routes).find(r => this.props.location.pathname.indexOf(this.routes[r]));
		if (route){
			this.setState({
				defaultKey: this.routes[route]
			});
		}*/

		/*const { history } = this.props;
		history.push(this.defaultKey);*/
	}

	onTabChange(activeKey){
		const { history } = this.props;
		history.push(activeKey);
	}

	render() {
		const { ui, error, adaptation, curator, manager } = this.props;
		const alen = adaptation.adaptationList.length > 0;
		const clen = curator.adaptationList.length > 0;
		const mlen = manager.curatorList.length > 0;

		const defaultView = () => {
			if (alen) {
				return Adaptation;
			} else if (clen) {
				return Curator;
			} else if (mlen) {
				return Manager;
			}
		}
/*		const { defaultKey } = this.state;*/

		return (
			<div className='adaptation'>
				{ui.isLoading && <Loader message='Загрузка' description='Загружаются результаты'/>}
				<ErrorAlert message={ui.error} visible={!!ui.error} onClose={() => error(false)}/>
				{/*<Route exact path='/' render={() => {
					return (
						[
							<Adaptation key='adaptation'/>,
							<Curator key='curator'/>,
							<Manager key='manager'/>
						]
					)
				}} />*/}

				<Tabs onChange={this.onTabChange}>
					{alen && <Tabs.TabPane tab='Моя адаптация' key={this.routes.adaptations} />}
					{clen && <Tabs.TabPane tab='Сотрудники на адаптации' key={this.routes.curators} />}
					{mlen && <Tabs.TabPane tab='Мои кураторы' key={this.routes.managers} /> }
				</Tabs>
				
				<Route exact path='/' component={defaultView()}/>
				{alen && <Route exact path={this.routes.adaptations} component={Adaptation}/>}
				{clen && <Route exact path={this.routes.curators} component={Curator}/>}
				{mlen && <Route exact path={this.routes.managers} component={Manager}/>}
				<Route exact path='/adaptations/:id' component={AdaptationView}/>
				<Route exact path='/curators/:id/:is_curator?/:all?' component={Curator}/>
			</div>
		);
	}
}

function mapStateToProps(state){
	return {
		ui: state.app.ui,
		adaptation: state.adaptation,
		curator: state.curator,
		manager: state.manager
	}
}

export default withRouter(connect(mapStateToProps, { error, getUsers })(App));