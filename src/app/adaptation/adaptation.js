import React, { Component } from 'react';
import { withRouter } from 'react-router';
import { List, Icon, Button, Modal, Input, PageHeader, Row, Col, Steps, Card } from 'antd';
import Task from './task';
import { pureUrl } from '../../utils/request';
import { renderDate } from '../../utils/date';
import { connect } from 'react-redux';
import { getAdaptation, changeStep, addTask, updateTask, removeTask } from './adaptationActions';
import './index.css';
import 'antd/es/table/style/index.css';

const UserDescription = ({ ...props }) => (
	<Col>
		<div className='description'>
			<a target='__blank' href={pureUrl() + `/view_doc.html?mode=collaborator&object_id=${props.person_id}`} className='term'>{props.person_fullname}</a>
			<div className='detail'>{props.children}</div>
		</div>
	</Col>
);

class AdaptationView extends Component {

	constructor(props){
		super(props);

		this.state = {
			isShowModalTask: false,
			isShowModalComment: false,
			comment: '',
			taskName: '',
			taskDesc: ''
		}

		this.currentAction = null;
		this.handleToggleTaskModal = this.handleToggleTaskModal.bind(this);
		this.handleAddTask = this.handleAddTask.bind(this);
		this.handleChangeTaskName = this.handleChangeTaskName.bind(this);
		this.handleChangeTaskDesc = this.handleChangeTaskDesc.bind(this);
		this.handleChangeStep = this.handleChangeStep.bind(this);
		this.handeAction = this.handeAction.bind(this);
		this.handleToggleCommentModal = this.handleToggleCommentModal.bind(this);
		this.handleChangeComment = this.handleChangeComment.bind(this);
	}

	handleToggleTaskModal(){
		this.setState({
			isShowModalTask: !this.state.isShowModalTask,
			taskName: '',
			taskDesc: ''
		});
	}

	handleToggleCommentModal(){
		this.setState({
			isShowModalComment: !this.state.isShowModalComment,
			comment: ''
		});
	}

	handleChangeTaskName ({ target: { value } }) {
		this.setState({ taskName: value });
	}

	handleChangeTaskDesc ({ target: { value } }) {
		this.setState({ taskDesc: value });
	}

	handleChangeComment ({ target: { value } }) {
		this.setState({ comment: value });
	}

	handeAction(action){
		const { changeStep } = this.props;
		if (action.allow_additional_data === 'true'){
			this.currentAction = action;
			this.handleToggleCommentModal();
		} else {
			changeStep(action.name);
		}
	}

	handleChangeStep(isComment){
		const { changeStep } = this.props;
		const comment = isComment ? this.state.comment : null;
		changeStep(this.currentAction.name, comment);
		this.handleToggleCommentModal();
	}

	handleAddTask(){
		const { addTask } = this.props;
		const { taskName, taskDesc } = this.state;
		addTask({
			name: taskName,
			desc: taskDesc
		});
		this.handleToggleTaskModal();
	}

	componentDidMount(){
		const { match, getAdaptation } = this.props;
		getAdaptation(match.params.id);
	}

	renderMainSteps(){
		const { mainSteps, card } = this.props;
		const curStepIndex = mainSteps.findIndex(s => s.id === card.main_step_id);
		return (
			<div className='adaptation__steps'>
				<Steps progressDot current={curStepIndex}>
					{mainSteps && mainSteps.map(s => <Steps.Step key={s.id} title={s.description} />)}
				</Steps>
			</div>
		);
	}

	renderHeader(){
		const { card, history  } = this.props;

		return (
			<PageHeader
				onBack={history.goBack}
				title={card.person_fullname}
				extra={<span className='adaptation__date'>{'с ' + renderDate(card.start_date) + ' ' + (card.plan_readiness_date ? `по ${renderDate(card.plan_readiness_date)}` : '')}</span>}
			>
				<div className='wrap'>
					<div className='content padding'>
						{card.tutors && card.tutors.map(t => {
							return (
								<Row key={t.person_id}>
									<UserDescription {...t}>{t.boss_type_name}</UserDescription>
								</Row>
							);
						})}
						<Row>
							<Col>
								<div className='description'>
									<div className='term'>Текущий этап</div>
									<div className='detail'>{card.current_step}</div>
								</div>
							</Col>
						</Row>
						<Row>
							<Col>
								<div className='description'>
									<div className='term'>Статус</div>
									<div className='detail'>{card.status}</div>
								</div>
							</Col>
						</Row>
					</div>
				</div>
			</PageHeader>
		);
	}

	renderHistory(){
		const { steps } = this.props;

		return (
			<Card
				className='adaptation__history'
				title='История этапов'>
				{
					steps && steps.map(s => {
						return (
							<div key={s.id}>
								<a href='#'>{s.name}</a>
								<List>
									{s.history && s.history.map(t => {
										return (
											<List.Item
												key={t.id}
											>
												 <List.Item.Meta
												 	title={<span>{t.step} <span className='adaptation__date'>{renderDate(t.created_date)}</span></span>}
												 	description={t.type}
												 />
												 {t.collaborator} <Icon type='arrow-right' /> {t.object}
												 {t.data && <div className='adaptation__history-data'>Комментарий: {t.data}</div>}
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

	renderTasks(){
		const { card, meta, updateTask, removeTask } = this.props;
		if (card.tasks){
			const columns = [
				{
					title: 'Цели',
					dataIndex: 'name',
					key: 'name'
				},
				{
					title: 'Ожидаемый резултат',
					dataIndex: 'expected_result',
					key: 'expected_result'
				},
				{
					title: 'Достигнутый результат',
					dataIndex: 'achieved_result',
					key: 'achieved_result'
				},
				{
					title: 'Оценка сотрудника',
					dataIndex: 'collaborator_assessment',
					key: 'collaborator_assessment'
				},
				{
					title: 'Оценка руководителя',
					dataIndex: 'manager_assessment',
					key: 'manager_assessment'
				}
			];
			return (
				<div>
					<div className='ant-table-wrapper'>
						<div className='ant-spin-nested-loading'>
							<div className='ant-table ant-table-default ant-table-scroll-position-left'>
								<div className='ant-table-content'>
									<div className='ant-table-body'>
										<table>
											<thead className='ant-table-thead'>
												<tr>
												{columns.map(c => {
													return (
														<th key={c.key}>
															<span className='ant-table-header-column'>
																<div>
																	<span className='ant-table-column-title'>
																		{c.title}
																	</span>
																</div>
															</span>
														</th>
													);
												})}
												</tr>
											</thead>
											<tbody className='ant-table-tbody'>
												{card.tasks.map(t => {
													return (
														<Task
															key={t.id}
															allow_edit_tasks={meta.allow_edit_tasks}
															updateTask={updateTask}
															removeTask={removeTask}
															{...t}
														/>
													);
												})}
											</tbody>
										</table>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			);	
		}
	}

	render() {
		const { card, meta  } = this.props;
		const { isShowModalTask, taskName, taskDesc } = this.state;
		const { isShowModalComment, comment } = this.state;
		return (
			<div className='adaptation'>
				{ this.renderHeader() }
				<div className='adaptation__body'>
					{ this.renderMainSteps() }
					<Card
						className='adaptation__tasks'
						title='Мои задачи'
						extra={
							meta.allow_edit_tasks ? (
								<Icon className='adaptation__tasks-add' type='plus-circle' theme='filled' onClick={this.handleToggleTaskModal}/>
							) : null
						}
						actions={
							meta.actions && meta.actions.map(a => {
								return (
									<Button
											key={a.name}
											className='adaptation__tasks-actions'
											type='primary'
											onClick={() => this.handeAction(a)}
									>
										{a.title}
									</Button>
								);
							})
						}
					>
						{this.renderTasks()}
					</Card>
					<Modal
						title='Создать'
						visible={isShowModalTask}
						onOk={this.handleAddTask}
						onCancel={this.handleToggleTaskModal}
					>
						<Input placeholder='Название' value={taskName} onChange={this.handleChangeTaskName}/>
						<div style={{ margin: '24px 0' }} />
						<Input.TextArea placeholder='Описание' value={taskDesc} autosize={{ minRows: 3}} onChange={this.handleChangeTaskDesc}/>
					</Modal>
					<Modal
						title='Сообщение'
						visible={isShowModalComment}
						onOk={() => this.handleChangeStep(true)}
						onCancel={this.handleToggleCommentModal}
						footer={[
							<Button key='submit' onClick={() => this.handleChangeStep(true)}>
								Ok
							</Button>,
							<Button key='cancel' onClick={this.handleToggleCommentModal}>
								Отмена
							</Button>,
							<Button key='submit_wthout_comment' onClick={this.handleChangeStep}>
								Отправить без комментария
							</Button>
						]}
					>
						<Input.TextArea placeholder='Описание' value={comment} autosize={{ minRows: 3}} onChange={this.handleChangeComment}/>
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