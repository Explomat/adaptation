import React, { Component } from 'react';
import { withRouter } from 'react-router';
import { List, Icon, Button, Modal, Input, PageHeader, Row, Col, Steps, Card, Tag } from 'antd';
import Task from './task';
import TaskForm from './taskForm';
import { pureUrl } from '../../utils/request';
import { renderDate } from '../../utils/date';
import { connect } from 'react-redux';
import { getAdaptation, changeStep, addTask, updateTask, removeTask } from './adaptationActions';
import { loading } from '../../appActions';
import { createBaseUrl } from '../../utils/request';
import { calculatePercent } from './utils/calculate';
import './index.css';
import 'antd/es/table/style/index.css';

const UserDescription = ({ ...props }) => (
	<Col>
		<div className='description'>
			<div className='term'>{props.children}</div>
			<a className='detail' target='__blank' href={pureUrl() + `/view_doc.html?mode=collaborator&object_id=${props.person_id}`}>{props.person_fullname}</a>
		</div>
	</Col>
);

class AdaptationView extends Component {

	constructor(props){
		super(props);

		this.state = {
			isShowModalTask: false,
			isShowModalComment: false,
			comment: ''
		}

		this.currentAction = null;
		this.handleToggleTaskModal = this.handleToggleTaskModal.bind(this);
		this.handleAddTask = this.handleAddTask.bind(this);
		this.handleChangeStep = this.handleChangeStep.bind(this);
		this.handeAction = this.handeAction.bind(this);
		this.handleToggleCommentModal = this.handleToggleCommentModal.bind(this);
		this.handleChangeComment = this.handleChangeComment.bind(this);
	}

	handleToggleTaskModal(){
		this.setState({
			isShowModalTask: !this.state.isShowModalTask
		});
	}

	handleToggleCommentModal(){
		this.setState({
			isShowModalComment: !this.state.isShowModalComment,
			comment: ''
		});
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

	handleAddTask(task){
		const { addTask } = this.props;
		addTask(task);
		this.handleToggleTaskModal();
	}

	componentWillMount(){
		const { match, getAdaptation } = this.props;
		getAdaptation(match.params.id);
		//this.props.loading(true);
	}

	renderMainSteps(){
		const { mainSteps, card } = this.props;
		const curStepIndex = mainSteps.findIndex(s => s.id === card.main_step_id);
		return (
			<div className='adaptation__steps'>
				<Steps progressDot current={curStepIndex}>
					{mainSteps &&
						mainSteps.map((s, index) => (
							<Steps.Step
								key={s.id}
								title={
									<span>
										<span className='adaptation__date'>{renderDate(s.date)}</span>
										{index <= curStepIndex ? <Icon className='adaptation__date-check' type='check'/> : null}
									</span>
								}
								description={s.description}
							/>)
						)}
				</Steps>
			</div>
		);
	}

	renderHeader(){
		const { card, history  } = this.props;
		const cdate = () => 'с ' + renderDate(card.start_date) + ' ' + (card.plan_readiness_date ? `по ${renderDate(card.plan_readiness_date)}` : '');
		const rurl = createBaseUrl('Report', { cr_id: card.id });

		return (	
			<PageHeader
				onBack={history.goBack}
				title={<span>{card.person_fullname}</span>}
				extra={[
					<Tag key='date' color='green'>{cdate()}</Tag>,
					<div key='status' className='detail'>Статус: <span className='adaptation__status'>{card.status}</span></div>,
					<a style={{ 'paddingTop': '12px', display: 'block' }} key='report' href={rurl} className='term'>Скачать отчет <Icon type='download' /></a>
				]}
			>
				<div className='wrap'>
					<div className='content padding'>
						{card.tutors && card.tutors.map(t => {
							return (
								<Row key={t.person_id} style={{ width: '70%' }}>
									<UserDescription {...t}>{t.boss_type_name}</UserDescription>
								</Row>
							);
						})}
						<Row style={{ width: '70%' }}>
							<Col>
								<div className='description'>
									<div className='term'>Текущий этап</div>
									<div className='detail adaptation__current-step'>{card.main_step} / {card.current_step}</div>
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
								<List>
									{s.history && s.history.map(t => {
										return (
											<List.Item
												key={t.id}
											>
												 <List.Item.Meta
												 	title={<span>
												 		<span className='adaptation__date'>{renderDate(t.created_date)}</span>
												 		<span className='adaptation__history-step'>{t.main_step} / {t.step}</span>
												 	</span>}
												 />
												 {t.collaborator} <Icon type='arrow-right' /> {t.object}
												 {t.data && (
												 	<div className='adaptation__history-data'>
												 		Комментарий: 
												 		<div className='adaptation__history-comment'>{t.data}</div>
												 	</div>
												 )}
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
		const collaboratorAssessement = calculatePercent(card.tasks.map(t => t.collaborator_assessment), meta.assessments);
		const managerAssessement = calculatePercent(card.tasks.map(t => t.manager_assessment), meta.assessments);
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
											<colgroup><col/><col/><col/></colgroup>
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
															updateTask={updateTask}
															removeTask={removeTask}
															meta={meta}
															{...t}
														/>
													);
												})}
											</tbody>
											<tfoot>
												{card.tasks.length > 0 && <tr>
													<td></td>
													<td></td>
													<td style={{ fontWeight: 'bold', padding: '16px' }}>
														{(collaboratorAssessement || managerAssessement) && 'Итоговая оценка:'}
													</td>
													<td style={{ padding: '16px' }}>{collaboratorAssessement && (
														<div title={collaboratorAssessement.description}>
															<Tag color={collaboratorAssessement.color}>{collaboratorAssessement.name}</Tag>
														</div>
													)}
													</td>
													<td style={{ padding: '16px' }}>{managerAssessement && (
														<div title={managerAssessement.description}>
															<Tag color={managerAssessement.color}>{managerAssessement.name}</Tag>
														</div>
													)}
													</td>
													<td></td>
												</tr>}
											</tfoot>
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
		const { card, meta, ui } = this.props;
		if (ui.isLoading){
			return null;
		}
		const { isShowModalTask } = this.state;
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
								<Button className='adaptation__tasks-add' type='primary' ghost onClick={this.handleToggleTaskModal}>
									Добавить задачу
								</Button>
							) : null
						}
						actions={
							meta.actions && meta.actions.map(a => {
								return (
									<Button
											key={a.name}
											disabled={card.tasks.length === 0}
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
					{isShowModalTask && <TaskForm
						title='Новая задача'
						onCommit={this.handleAddTask}
						onCancel={this.handleToggleTaskModal}
						meta={meta}
					/>}
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
		...state.adaptation
	}
}

export default withRouter(connect(mapStateToProps, { getAdaptation, changeStep, addTask, updateTask, removeTask, loading })(AdaptationView));