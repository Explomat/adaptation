import React, { Component } from 'react';
import { List, Icon } from 'antd';
import { Link } from 'react-router-dom';

class CuratorList extends Component {
	render() {
		const list = this.props.list;
		return (
			<div className='curators'>
				<List>
					{list.map(l => {
						return (
							<List.Item key={l.tutor_id}>
								<Link to={`/curators/${l.tutor_id}`}>
									{l.fullname} <Icon type="arrow-right" /> {l.position_name} <Icon type="arrow-right" /> {l.position_parent_name}
								</Link>
								
							</List.Item>
						)
					})}
				</List>
			</div>
		);
	}
}

export default CuratorList;