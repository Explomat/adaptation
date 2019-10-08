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
								<Link to={`/curators/${l.tutor_id}/true/false`}>
									<Icon type='user' className='adaptation_user-icon'/>
									{l.name}
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