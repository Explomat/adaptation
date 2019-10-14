import React, { Component } from 'react';
import {
	Icon, Divider, Tag
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
					{collaborator_assessment && (
						<div title={defaultCollaboratorAssessment.description}>
							<Tag color={defaultCollaboratorAssessment.color}>{collaborator_assessment}</Tag>
						</div>
					)}
				</td>
				<td>
					{manager_assessment && (
						<div title={defaultManagerAssessment.description}>
							<Tag color={defaultManagerAssessment.color}>{manager_assessment}</Tag>
						</div>
					)}
				</td>
				{meta.allow_edit_tasks && (<td>
					<span>
						<Icon className='task__icon' type='edit' onClick={this.handleToggleModal}/>
						<Divider type='vertical' />
						<Icon className='task__icon' type='delete' onClick={() => removeTask(id)}/>
					</span>
				</td>)}
				{isShowModal && <TaskForm
					title='Редактирование'
					onCommit={this.handleUpdate}
					onCancel={this.handleToggleModal}
					{...this.props}
				/>}
			</tr>
		);
	}
}

export default Task;