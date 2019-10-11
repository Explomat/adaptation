import React, { Component } from 'react';
import { List, Icon } from 'antd';
import { Link } from 'react-router-dom';
import unescapeSymbols from '../../utils/unescape';

class AdaptationList extends Component {

	render() {
		const list = this.props.list;
		return (
			<div className='adaptation-list'>
				<List>
					{list.map(l => {
						return (
							<List.Item
								key={l.id}
							>
								 <List.Item.Meta
								 	avatar={<Icon type='user' className='adaptation_user-icon adaptation_user-icon-no-margin'/>}
								 	title={
								 		<div>
								 			<div className='adaptation_list-item'>{l.type}</div>
								 			<Link style={{color: '#1890ff'}} to={`/adaptations/${l.id}`} key={l.id}>{unescapeSymbols(l.name)}</Link>
								 		</div>
								 	}
								 	description={l.status}
								 />
							</List.Item>
						)
					})}
				</List>
			</div>
		);
	}
}

export default AdaptationList;