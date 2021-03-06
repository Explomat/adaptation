import React, { Component } from 'react';
import { withRouter } from 'react-router';
import { Card, PageHeader, Select, Alert } from 'antd';
import AdaptationList from '../adaptation/adaptationList';
import { connect } from 'react-redux';
import { getTutorAdaptations } from './curatorActions';
import './index.css';

class Curator extends Component {

	constructor(props){
		super(props);

		this.handleChangeTutorRole = this.handleChangeTutorRole.bind(this);
	}

	componentDidMount(){
		const { match, currentTutorRole } = this.props;
		this.props.getTutorAdaptations(match.params, currentTutorRole);
	}

	handleChangeTutorRole(value){
		const { match } = this.props;
		this.props.getTutorAdaptations(match.params, value);
	}

	renderTutorRoles(){
		const { tutorRoles, currentTutorRole } = this.props;

		if (tutorRoles) {
			return (
				<Select defaultValue={currentTutorRole} onChange={this.handleChangeTutorRole}>
					{tutorRoles.map(t => {
						return (
							<Select.Option key={t.code} value={t.code}>{t.name}</Select.Option>
						);
					})}
				</Select>
			);
		}
	}

	render() {
		const { adaptationList, curator_fullname, history } = this.props;
		if (adaptationList.length === 0) {
			return <Alert message='Нет данных' type='info' />
		}
		return (
			<div className='curators'>
				<Card>
					{this.renderTutorRoles()}
					<AdaptationList list={adaptationList}/>
				</Card>
				{/*history.location.pathname === '/curators' ? (
					<Card>
						{this.renderTutorRoles()}
						<AdaptationList list={adaptationList}/>
					</Card>
				):(
					<PageHeader
						onBack={history.goBack}
						title={curator_fullname}
					>
						<div className='curators__tutor-header'>Сотрудники на адаптации</div>
						<AdaptationList list={adaptationList}/>
					</PageHeader>
				)*/}
			</div>
		);
	}
}

function mapStateToProps(state){
	return {
		...state.curator
	}
}

export default withRouter(connect(mapStateToProps, { getTutorAdaptations })(Curator));