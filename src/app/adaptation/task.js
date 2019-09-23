import React, { Component } from 'react';
import {
	Icon, Modal, Input, Divider, Select, Tag, Button
} from 'antd';
import TaskForm from './taskForm';
import { renderDate } from '../../utils/date';

class Task extends Component {

	constructor(props){
		super(props);

		this.state = {
			isShowModal: false
		}

		this.handleToggleModal = this.handleToggleModal.bind(this);
		this.handleUpdate = this.handleUpdate.bind(this);
	}

	handleUpdate(state){
		const { id, updateTask } = this.props;
		updateTask(id, {
			id,
			...state
		});
		this.handleToggleModal();
	}

	handleToggleModal(){
		this.setState({
			isShowModal: !this.state.isShowModal
		});
	}


	render() {
		const { meta, id, created_date, removeTask } = this.props;
		const {
			name,
			expected_result,
			achieved_result,
			collaborator_assessment,
			manager_assessment
		} = this.props;
		const { isShowModal } = this.state;

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
					<div>{name}</div>
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
				<TaskForm
					title='Редактирование'
					visible={isShowModal}
					onCommit={this.handleUpdate}
					onCancel={this.handleToggleModal}
					{...this.props}
				/>
				{/*<Modal
					title='Редактирование'
					visible={isShowModal}
					onOk={this.handleUpdate}
					onCancel={this.handleToggleModal}
					footer={[
						<Button type='primary' key='submit' onClick={this.handleUpdate}>
							Ok
						</Button>,
						<Button key='cancel' onClick={this.handleToggleModal}>
							Отмена
						</Button>
					]}
				>
					<label className='adaptation__form-label'>Цель</label>
					<Input placeholder='Укажите вашу цель' value={name} onChange={e => this.handleChangeProp('name', e.target.value)}/>
					<div style={{ margin: '24px 0' }} />
					<label className='adaptation__form-label'>Ожидаемый результат</label>
					<Input.TextArea
						placeholder='Опишите ожидаемый результат'
						value={expected_result}
						autosize={{ minRows: 3}}
						onChange={e => this.handleChangeProp('expected_result', e.target.value)}
					/>
					<div style={{ margin: '24px 0' }} />
					<label className='adaptation__form-label'>Достигнутый результат</label>
					<Input.TextArea
						placeholder='Опишите достигнутый результат'
						value={achieved_result}
						autosize={{ minRows: 3}}
						onChange={e => this.handleChangeProp('achieved_result', e.target.value)}
					/>
					<div style={{ margin: '24px 0' }} />
					<label className='adaptation__form-label'>Оценка сотрудника</label>
					<Select disabled={!meta.allow_edit_collaborator_assessment} defaultValue={defaultCollaboratorAssessment.name} onChange={value => this.handleChangeProp('collaborator_assessment', value)}>
						{meta.assessments && meta.assessments.map(a => {
							return (
								<Select.Option key={a.id} value={a.name}>{a.name}</Select.Option>
							);
						})}
					</Select>
					<div style={{ margin: '24px 0' }} />
					<label className='adaptation__form-label'>Оценка руководителя</label>
					<Select disabled={!meta.allow_edit_manager_assessment} defaultValue={defaultManagerAssessment.name} onChange={value => this.handleChangeProp('manager_assessment', value)}>
						{meta.assessments && meta.assessments.map(a => {
							return (
								<Select.Option key={a.id} value={a.name}>{a.name}</Select.Option>
							);
						})}
					</Select>
				</Modal>*/}
			</tr>
		);
	}
}

export default Task;