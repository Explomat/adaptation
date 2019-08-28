import React, { Component } from 'react';
import { withRouter } from 'react-router';
import { Card, PageHeader } from 'antd';
import AdaptationList from '../adaptation/adaptationList';
import { connect } from 'react-redux';
import { getCuratorAdaptations } from './curatorActions';
import './index.css';

class Curator extends Component {

	componentDidMount(){
		const { match } = this.props;
		this.props.getCuratorAdaptations(match.params.id);
	}

	render() {
		const { adaptationList, curator_fullname, history } = this.props;
		if (adaptationList.length === 0) {
			return null;
		}
		return (
			<div className='curators'>
				{history.location.pathname === '/' ? (
					<Card title='Адаптация сотрудников'>
						<AdaptationList list={adaptationList}/>
					</Card>
				):(
					<PageHeader
						onBack={history.goBack}
						title={curator_fullname}
					>
						<div className='curators__tutor-header'>Адаптация сотрудников</div>
						<AdaptationList list={adaptationList}/>
					</PageHeader>
				)}
			</div>
		);
	}
}

function mapStateToProps(state){
	return {
		...state.curator
	}
}

export default withRouter(connect(mapStateToProps, { getCuratorAdaptations })(Curator));