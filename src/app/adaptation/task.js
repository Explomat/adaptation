import React, { Component } from 'react';
import { List, Icon, Modal, Input } from 'antd';
import { renderDate } from '../../utils/date';

class Task extends Component {

	constructor(props){
		super(props);

		this.state = {
			isShowModal: false,
			name: props.name,
			desc: props.desc
		}

		this.handleToggleModal = this.handleToggleModal.bind(this);
		this.handleChangeName = this.handleChangeName.bind(this);
		this.handleChangeDesc = this.handleChangeDesc.bind(this);
		this.handleUpdate = this.handleUpdate.bind(this);
	}

	handleUpdate(){
		const { id, updateTask } = this.props;
		updateTask(id, {
			id,
			name: this.state.name,
			desc: this.state.desc
		});
		this.handleToggleModal();
	}

	handleToggleModal(){
		this.setState({
			isShowModal: !this.state.isShowModal
		});
	}

	handleChangeName ({ target: { value } }) {
		this.setState({ name: value });
	}

	handleChangeDesc ({ target: { value } }) {
		this.setState({ desc: value });
	}

	render() {
		const { allow_edit_tasks, id, created_date } = this.props;
		const { removeTask } = this.props;
		const { isShowModal, name, desc } = this.state;
		return (
			<List.Item className='adaptation__task'
				actions={allow_edit_tasks ? [
					<Icon className='task__icon' type='edit' onClick={this.handleToggleModal}/>,
					<Icon className='task__icon' type='delete' onClick={() => removeTask(id)}/>
				] : []}
			>
				 <List.Item.Meta
				 	title={<span>
				 			<span className='adaptation__date adaptation__task-date'>{renderDate(created_date)}</span>
				 			<span>{name}</span>
				 		</span>}
				 	description={desc}
				 />
				<Modal
					title='Редактирование'
					visible={isShowModal}
					onOk={this.handleUpdate}
					onCancel={this.handleToggleModal}
				>
					<Input placeholder='Название' value={name} onChange={this.handleChangeName}/>
					<div style={{ margin: '24px 0' }} />
					<Input.TextArea placeholder='Описание' value={desc} autosize={{ minRows: 3}} onChange={this.handleChangeDesc}/>
				</Modal>
			</List.Item>
		);
	}
}

export default Task;