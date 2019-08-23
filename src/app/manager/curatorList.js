import React, { Component } from 'react';
import { Link } from 'react-router-dom';

class CuratorList extends Component {
	render() {
		const list = this.props.list;
		return (
			<div className='curators'>
				{list.map(l => {
					return <Link to={`/curators/${l.tutor_id}`} key={l.tutor_id}>{l.fullname} - {l.position_parent_name} -> {l.position_name}</Link>
				})}
			</div>
		);
	}
}

export default CuratorList;