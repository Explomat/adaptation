import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Route } from 'react-router-dom';
import './index.css';

class ManagerList extends Component {

	componentDidMount(){
		this.props.getCurators();
	}

	render() {
		const list = this.props.list;
		if (list.length === 0) {
			return null;
		}
		return <div>ManagerList</div>
	}
}

function mapStateToProps(state){
	return {
		ui: state.ui
	}
}

export default connect(mapStateToProps)(ManagerList);