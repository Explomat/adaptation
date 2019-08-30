import React, { Component } from 'react';
import { Icon, Modal, Input, Divider } from 'antd';
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

	handleChangeProp(propName, event) {
		this.setState({
			[propName]: event.target.value
		});
	}

	render() {
		const { allow_edit_tasks, id, created_date } = this.props;
		const { removeTask } = this.props;
		const {
			isShowModal,
			name,
			expected_result,
			achieved_result,
			collaborator_assessment,
			manager_assessment
		} = this.state;
		return (
			<tr className='ant-table-row ant-table-row-level-0'>
				<td>
					<span className='adaptation__date adaptation__task-date'>{renderDate(created_date)}</span>
						<Divider type='vertical' />
					<span>{name}</span>
				</td>
				<td>
					{expected_result}
				</td>
				<td>
					{achieved_result}
				</td>
				<td>
					{collaborator_assessment}
				</td>
				<td>
					{manager_assessment}
				</td>
				{allow_edit_tasks && (<td>
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
					<Input placeholder='Название' value={name} onChange={e => this.handleChangeProp('name', e)}/>
					<div style={{ margin: '24px 0' }} />
					{/*<Input.TextArea placeholder='Описание' value={desc} autosize={{ minRows: 3}} onChange={this.handleChangeDesc}/>*/}
				</Modal>
			</tr>
		);
	}
}

export default Task;