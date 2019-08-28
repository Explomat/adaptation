import React, { Component } from 'react';
import { Card } from 'antd';
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
				<Card title='Мои кураторы'>
					<CuratorList list={curatorList}/>
				</Card>
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