import createRemoteActions from '../../utils/createRemoteActions';
//import { error } from '../appActions';
import request from '../../utils/request';

export const constants = {
	...createRemoteActions([
		'FETCH_USER_ADAPTATIONS',
		'FETCH_ADAPTATION',
		'ADD_TASK',
		'REMOVE_TASK',
		'EDIT_TASK'
	]),
	'LOADING_ADAPTATION': 'LOADING_ADAPTATION'
};

function setLoading(isLoading){
	return {
		type: constants.LOADING_ADAPTATION,
		payload: isLoading
	}
};

export function getUserAdaptations(ownProps){
	return (dispatch, getState) => {
		dispatch(setLoading(true));

		request('Adaptations')
			.get()
			.then(r => r.json())
			.then(d => {
				dispatch(setLoading(false));
				dispatch({
					type: constants.FETCH_USER_ADAPTATIONS_SUCCESS,
					payload: d.data
				});
			})
			.catch(e => {
				console.error(e);
				//dispatch(error(e.message));
			});
	}
};

export function getAdaptation(id){
	return (dispatch, getState) => {
		dispatch(setLoading(true));

		request('Adaptations')
			.get({
				id
			})
			.then(r => r.json())
			.then(d => {
				dispatch(setLoading(false));
				dispatch({
					type: constants.FETCH_ADAPTATION_SUCCESS,
					payload: d.data
				});
			})
			.catch(e => {
				console.error(e);
				//dispatch(error(e.message));
			});
	}
};


export function addTask(){
	return (dispatch, getState) => {

		const state = getState();
		const cardId = state.adaptation.card.id;

		request('Task')
			.post({
				cr_id: cardId
			})
			.then(r => r.json())
			.then(d => {
				dispatch({
					type: constants.ADD_TASK_SUCCESS,
					payload: d.data
				});
			})
			.catch(e => {
				console.error(e);
				//dispatch(error(e.message));
			});
	}
};

export function editTask(id){
	return (dispatch, getState) => {
		const state = getState();
		const cardId = state.adaptation.card.id;

		request('Task')
			.post({
				cr_id: cardId,
				task_id: id
			})
			.then(r => r.json())
			.then(d => {
				dispatch({
					type: constants.EDIT_TASK_SUCCESS,
					payload: d.data
				});
			})
			.catch(e => {
				console.error(e);
				//dispatch(error(e.message));
			});
	}
};

export function removeTask(id){
	return (dispatch, getState) => {
		const state = getState();
		const cardId = state.adaptation.card.id;

		request('Task')
			.delete({
				cr_id: cardId,
				task_id: id
			})
			.then(r => r.json())
			.then(d => {
				dispatch({
					type: constants.REMOVE_TASK_SUCCESS,
					payload: d.data
				});
			})
			.catch(e => {
				console.error(e);
				//dispatch(error(e.message));
			});
	}
};