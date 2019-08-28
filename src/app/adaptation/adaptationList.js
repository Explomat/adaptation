import React, { Component } from 'react';
import { List } from 'antd';
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
								 	title={ <Link style={{color: '#1890ff'}} to={`/adaptation/${l.id}`} key={l.id}>{unescapeSymbols(l.name)}</Link>}
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