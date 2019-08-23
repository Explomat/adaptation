import React, { Component } from 'react';
import { List, Icon, Button } from 'antd';
import { connect } from 'react-redux';
import { getAdaptation, addTask, editTask, removeTask } from './adaptationActions';
import { Link } from 'react-router-dom';
import './index.css';

class AdaptationView extends Component {

	componentDidMount(){
		const { match, getAdaptation } = this.props;
		getAdaptation(match.params.id);
	}

	render() {
		const { ui, card, mainSteps, meta, steps  } = this.props;
		const { addTask, editTask, removeTask } = this.props;

		if (ui.isLoading){
			return <div>Загрузка...</div>
		}

		return (
			<div className='adaptation'>
				<div className='adaptation__header'>
					<div className='adaptation__header-info'>
						<span>{card.person_fullname}</span>
						<span>{card.start_date} {card.plan_readiness_date ? `-${card.plan_readiness_date}` : ''}</span>
					</div>
					<div className='adaptation__tutors'>
						{card.tutors && card.tutors.map(t => {
							return (
								<div key={t.person_id} className='adaptation__tutor'>
									<div>{t.person_fullname}</div>
									<div>{t.person_position_name}</div>
									<div>{t.boss_type_name}</div>
								</div>
							);
						})}
					</div>
				</div>
				<div className='adaptation__body'>
					<div className='adaptation__tasks'>
						{meta.allow_edit_tasks ? (
							<Button type='primary' onClick={addTask}>Добавить задачу</Button>
						) : null}
						<List
							itemLayout='horizontal'
						>
							{card.tasks && card.tasks.map(t => {
								return (
									<List.Item
										key={t.id}
										actions={meta.allow_edit_tasks ? [
											<Icon type='edit' onClick={() => this.handleEditTask(t.id)}/>,
											<Icon type='delete' onClick={() => removeTask(t.id)}/>
										] : []}
									>
										 <List.Item.Meta
										 	title={t.name}
										 	description={t.desc}
										 />
									</List.Item>
								)
							})}
						</List>
						{meta.allow_edit_tasks ? (
							meta.actions && meta.actions.map(a => {
								return (
									<Button key={a.name} name={a.name} type='primary'>{a.title}</Button>
								);
							})
						) : null}
					</div>
				</div>
				<div className='adaptation__footer'>
					История этапов
					{
						<List
							itemLayout='horizontal'
						>
							{steps && steps.map(t => {
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
					}
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

export default connect(mapStateToProps, { getAdaptation, addTask, editTask, removeTask })(AdaptationView);