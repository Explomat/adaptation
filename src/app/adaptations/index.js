import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Route } from 'react-router-dom';
import './index.css';

class AdaptationList extends Component {

	componentDidMount(){
		this.props.getAdaptations();
	}

	render() {
		const list = this.props.list;
		if (list.length === 0) {
			return null;
		}
		return <div>AdaptationList</div>
	}
}

function mapStateToProps(state){
	return {
		ui: state.ui
	}
}

export default connect(mapStateToProps)(AdaptationList);