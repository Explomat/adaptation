import React, { Component } from 'react';
import AdaptationList from './adaptationList';
import { connect } from 'react-redux';
import { getUserAdaptations } from './adaptationActions';
import { Link } from 'react-router-dom';
import './index.css';

class Adaptation extends Component {

	componentDidMount(){
		this.props.getUserAdaptations();
	}

	render() {
		const adaptationList = this.props.adaptationList;
		if (adaptationList.length === 0) {
			return null;
		}

		return (
			<div className='adaptations'>
				<div>Моя адаптация</div>
				<AdaptationList list={adaptationList}/>
			</div>
		);
	}
}

function mapStateToProps(state){
	return {
		adaptationList: state.adaptation.adaptationList
	}
}

export default connect(mapStateToProps, { getUserAdaptations })(Adaptation);