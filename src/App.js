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
import { error } from './appActions';
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
		const { ui, error } = this.props;
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
					<Tabs.TabPane tab='Моя адаптация' key={this.routes.adaptations} />
					<Tabs.TabPane tab='Адаптация сотрудников' key={this.routes.curators} />
					<Tabs.TabPane tab='Мои кураторы' key={this.routes.managers} />
				</Tabs>
				
				<Route exact path='/' component={Adaptation}/>
				<Route exact path={this.routes.adaptations} component={Adaptation}/>
				<Route exact path={this.routes.curators} component={Curator}/>
				<Route exact path={this.routes.managers} component={Manager}/>
				<Route exact path='/adaptations/:id' component={AdaptationView}/>
				<Route exact path='/curators/:id/:is_curator?/:all?' component={Curator}/>
			</div>
		);
	}
}

function mapStateToProps(state){
	return {
		ui: state.app.ui
	}
}

export default withRouter(connect(mapStateToProps, { error })(App));