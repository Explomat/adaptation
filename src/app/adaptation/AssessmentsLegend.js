import React, { Component } from 'react';
import { Alert, Table, Tag } from 'antd';

class AssessmentsLegend extends Component {
	render() {
		const source = this.props.assessments.map((a, index) => {
			return {
				key: index,
				...a
			}
		});
		return (
			<div className='adaptation__legend'>
				<span className='adaptation__legend-title ant-page-header-heading-title'>Внимательно прочитайте инструкцию перед заполнением!</span>
				<Table className='adaptation__legend_table' pagination={false} dataSource={source} columns={[
					{
						title: 'Оценка',
						dataIndex: 'name',
						key: 'name',
						render: (text, record) => <Tag color={record.color}>{text}</Tag>
					},
					{
						title: 'Описание',
						dataIndex: 'description',
						key: 'description'
					}
				]} />
			</div>
		);
	}
}

export default AssessmentsLegend;