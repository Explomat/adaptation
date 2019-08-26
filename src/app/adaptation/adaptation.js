import React, { Component } from 'react';
import { withRouter } from 'react-router';
import { List, Icon, Button, Modal, Input, PageHeader, Row, Col, Steps, Card } from 'antd';
import Task from './task';
import { connect } from 'react-redux';
import { getAdaptation, changeStep, addTask, updateTask, removeTask } from './adaptationActions';
import { Link } from 'react-router-dom';
import './index.css';

const UserDescription = ({ term, children, span = 12 }) => (
	<Col span={span}>
		<div className='description'>
			<a className='term'>{term}</a>
			<div className='detail'>{children}</div>
		</div>
	</Col>
);

class AdaptationView extends Component {

	constructor(props){
		super(props);

		this.state = {
			isShowModal: false,
			taskName: '',
			taskDesc: ''
		}

		this.handleToggleModal = this.handleToggleModal.bind(this);
		this.handleAddTask = this.handleAddTask.bind(this);
		this.handleChangeTaskName = this.handleChangeTaskName.bind(this);
		this.handleChangeTaskDesc = this.handleChangeTaskDesc.bind(this);
	}

	handleToggleModal(){
		this.setState({
			isShowModal: !this.state.isShowModal,
			taskName: '',
			taskDesc: ''
		});
	}

	handleChangeTaskName ({ target: { value } }) {
		this.setState({ taskName: value });
	}

	handleChangeTaskDesc ({ target: { value } }) {
		this.setState({ taskDesc: value });
	}

	handleAddTask(){
		const { addTask } = this.props;
		const { taskName, taskDesc } = this.state;
		addTask({
			name: taskName,
			desc: taskDesc
		});
		this.handleToggleModal();
	}

	componentDidMount(){
		const { match, getAdaptation } = this.props;
		getAdaptation(match.params.id);
	}

	renderHistory(){
		const { steps } = this.props;
		return (
			<Card className='adaptation__history' title='История этапов'>
				{
					steps && steps.map(s => {
						return (
							<div key={s.id}>
								<a>{s.name}</a>
								<List
									itemLayout='horizontal'
								>
									{s.history && s.history.map(t => {
										return (
											<List.Item
												key={t.id}
											>
												 <List.Item.Meta
												 	title={t.step}
												 	description={t.type}
												 />
												 {t.collaborator} -> {t.object}
											</List.Item>
										)
									})}
								</List>
							</div>
						)
						
					})
				}
			</Card>
		);
	}

	render() {
		const { ui, card, mainSteps, meta, steps, history  } = this.props;
		const { changeStep, updateTask, removeTask } = this.props;
		const { isShowModal, taskName, taskDesc } = this.state;

		if (ui.isLoading){
			return <div>Загрузка...</div>
		}

		return (
			<div className='adaptation'>
				<PageHeader
					onBack={history.goBack}
					title={card.person_fullname}
					extra={card.start_date + ' ' + (card.plan_readiness_date ? `-${card.plan_readiness_date}` : '')}
				>
					<div className='wrap'>
						<div className='content padding'>
							{card.tutors && card.tutors.map(t => {
								return (
									<Row key={t.person_id}>
										<UserDescription term={t.person_fullname}>{t.boss_type_name}</UserDescription>
									</Row>
								);
							})}
						</div>
					</div>
				</PageHeader>
				<div className='adaptation__body'>
					<div className='adaptation__tasks'>
						{meta.allow_edit_tasks ? (
							<Button type='primary' onClick={this.handleToggleModal}>Добавить задачу</Button>
						) : null}
						<List
							itemLayout='horizontal'
						>
							{card.tasks && card.tasks.map(t => {
								return (
									<Task
										key={t.id}
										allow_edit_tasks={meta.allow_edit_tasks}
										updateTask={updateTask}
										removeTask={removeTask}
										{...t}
									/>
								)
							})}
						</List>
						{meta.allow_edit_tasks ? (
							meta.actions && meta.actions.map(a => {
								return (
									<Button key={a.name} type='primary' onClick={() => changeStep(a.name)}>{a.title}</Button>
								);
							})
						) : null}
					</div>
					<Modal
						title='Создать'
						visible={isShowModal}
						onOk={this.handleAddTask}
						onCancel={this.handleToggleModal}
					>
						<Input placeholder='Название' value={taskName} onChange={this.handleChangeTaskName}/>
						<div style={{ margin: '24px 0' }} />
						<Input.TextArea placeholder='Описание' value={taskDesc} autosize={{ minRows: 3}} onChange={this.handleChangeTaskDesc}/>
					</Modal>
				</div>
				<div className='adaptation__footer'>
					{this.renderHistory()}
				</div>
			</div>
		);
	}
}

function mapStateToProps(state){
	return {
		...state.adaptation,
		ui: state.adaptation.ui
	}
}

export default withRouter(connect(mapStateToProps, { getAdaptation, changeStep, addTask, updateTask, removeTask })(AdaptationView));