import React, { Component } from 'react';
import { Link } from 'react-router-dom';

class AdaptationList extends Component {

	render() {
		const list = this.props.list;
		return (
			<div className='adaptation-list'>
				{list.map(l => {
					return <Link to={`/adaptation/${l.id}`} key={l.id}>{l.name} - {l.status}</Link>
				})}
			</div>
		);
	}
}

export default AdaptationList;