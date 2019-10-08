import React, { Component } from 'react';
import { Card, Alert } from 'antd';
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
			return <Alert message='Нет данных' type='info' />
		}
		return (
			<div className='curators'>
				<Card>
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