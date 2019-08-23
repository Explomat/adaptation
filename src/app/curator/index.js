import React, { Component } from 'react';
import AdaptationList from '../adaptation/adaptationList';
import { connect } from 'react-redux';
import { getCuratorAdaptations } from './curatorActions';
import { Link } from 'react-router-dom';
import './index.css';

class Curator extends Component {

	componentDidMount(){
		this.props.getCuratorAdaptations();
	}

	render() {
		const adaptationList = this.props.adaptationList;
		if (adaptationList.length === 0) {
			return null;
		}
		return (
			<div className='curators'>
				<div>Адаптация сотрудников</div>
				<AdaptationList list={adaptationList}/>
			</div>
		);
	}
}

function mapStateToProps(state){
	return {
		adaptationList: state.curator.adaptationList
	}
}

export default connect(mapStateToProps, { getCuratorAdaptations })(Curator);