import React, { Component } from 'react';
import { Card } from 'antd';
import AdaptationList from './adaptationList';
import { connect } from 'react-redux';
import { getUserAdaptations } from './adaptationActions';
import './index.css';

class Adaptation extends Component {

	componentDidMount(){
		this.props.getUserAdaptations();
	}

	render() {
		const { adaptationList } = this.props;
		if (adaptationList.length === 0) {
			return null;
		}

		return (
			<div className='adaptations'>
				<Card title='Моя адаптация'>
					<AdaptationList list={adaptationList}/>
				</Card>
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