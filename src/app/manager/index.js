import React, { Component } from 'react';
import CuratorList from './curatorList';
import { connect } from 'react-redux';
import { getCurators } from './managerActions';
import './index.css';

class ManagerList extends Component {

	componentDidMount(){
		this.props.getCurators();
	}

	render() {
		const curatorList = this.props.curatorList;
		if (curatorList.length === 0) {
			return null;
		}
		return (
			<div className='curators'>
				<div>Мои кураторы</div>
				<CuratorList list={curatorList}/>
			</div>
		);
	}
}

function mapStateToProps(state){
	return {
		curatorList: state.manager.curatorList
	}
}

export default connect(mapStateToProps, { getCurators })(ManagerList);