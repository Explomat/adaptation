import React, { Component } from 'react';
import { Icon, Modal, Input, Divider, Select, Tag } from 'antd';
import { renderDate } from '../../utils/date';

class Task extends Component {

	constructor(props){
		super(props);

		this.state = {
			isShowModal: false,
			name: props.name,
			expected_result: props.expected_result,
			achieved_result: props.achieved_result,
			collaborator_assessment: props.collaborator_assessment,
			manager_assessment: props.manager_assessment
		}

		this.handleToggleModal = this.handleToggleModal.bind(this);
		this.handleChangeProp = this.handleChangeProp.bind(this);
		this.handleUpdate = this.handleUpdate.bind(this);
	}

	handleUpdate(){
		const { id, updateTask } = this.props;
		updateTask(id, {
			id,
			...this.state
		});
		this.handleToggleModal();
	}

	handleToggleModal(){
		this.setState({
			isShowModal: !this.state.isShowModal
		});
	}

	handleChangeProp(propName, value) {
		this.setState({
			[propName]: value
		});
	}

	render() {
		const { meta, id, created_date } = this.props;
		const { removeTask } = this.props;
		const {
			isShowModal,
			name,
			expected_result,
			achieved_result,
			collaborator_assessment,
			manager_assessment
		} = this.state;

		let defaultCollaboratorAssessment = meta.assessments.find(a => a.name === collaborator_assessment);
		if (!defaultCollaboratorAssessment){
			defaultCollaboratorAssessment = meta.assessments[0];
		}
		let defaultManagerAssessment = meta.assessments.find(a => a.name === manager_assessment);
		if (!defaultManagerAssessment){
			defaultManagerAssessment = meta.assessments[0];
		}
		return (
			<tr className='ant-table-row ant-table-row-level-0'>
				<td>
					<div className='adaptation__date adaptation__task-date'>{renderDate(created_date)}</div>
					<span>{name}</span>
				</td>
				<td>
					{expected_result}
				</td>
				<td>
					{achieved_result}
				</td>
				<td>
					{collaborator_assessment && <Tag color={defaultCollaboratorAssessment.color}>{collaborator_assessment}</Tag>}
				</td>
				<td>
					{manager_assessment && <Tag color={defaultManagerAssessment.color}>{manager_assessment}</Tag>}
				</td>
				{meta.allow_edit_tasks && (<td>
					<span>
						<Icon className='task__icon' type='edit' onClick={this.handleToggleModal}/>
						<Divider type='vertical' />
						<Icon className='task__icon' type='delete' onClick={() => removeTask(id)}/>
					</span>
				</td>)}
				<Modal
					title='Редактирование'
					visible={isShowModal}
					onOk={this.handleUpdate}
					onCancel={this.handleToggleModal}
				>
					<Input placeholder='Цель' value={name} onChange={e => this.handleChangeProp('name', e.target.value)}/>
					<div style={{ margin: '24px 0' }} />
					<Input.TextArea
						placeholder='Ожидаемый результат'
						value={expected_result}
						autosize={{ minRows: 3}}
						onChange={e => this.handleChangeProp('expected_result', e.target.value)}
					/>
					<div style={{ margin: '24px 0' }} />
					<Input.TextArea
						placeholder='Достигнутый результат'
						value={achieved_result}
						autosize={{ minRows: 3}}
						onChange={e => this.handleChangeProp('achieved_result', e.target.value)}
					/>
					<div style={{ margin: '24px 0' }} />
					<label>Оценка сотрудника</label>
					<Select defaultValue={defaultCollaboratorAssessment.name} onChange={value => this.handleChangeProp('collaborator_assessment', value)}>
						{meta.assessments && meta.assessments.map(a => {
							return (
								<Select.Option key={a.id} value={a.name}>{a.name}</Select.Option>
							);
						})}
					</Select>
					<div style={{ margin: '24px 0' }} />
					<label>Оценка руководителя</label>
					<Select defaultValue={defaultManagerAssessment.name} onChange={value => this.handleChangeProp('manager_assessment', value)}>
						{meta.assessments && meta.assessments.map(a => {
							return (
								<Select.Option key={a.id} value={a.name}>{a.name}</Select.Option>
							);
						})}
					</Select>
				</Modal>
			</tr>
		);
	}
}

export default Task;