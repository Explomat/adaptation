import createRemoteActions from '../../utils/createRemoteActions';
//import { error } from '../appActions';
import request from '../../utils/request';

export const constants = {
	...createRemoteActions([
		'FETCH_CURATOR_ADAPTATIONS'
	]),
	'LOADING_CURATOR_ADAPTATIONS': 'LOADING_CURATOR_ADAPTATIONS'
};

function setLoading(isLoading){
	return {
		type: constants.LOADING_CURATOR_ADAPTATIONS,
		payload: isLoading
	}
};

export function getCuratorAdaptations(ownProps){
	return (dispatch, getState) => {
		dispatch(setLoading(true));

		const state = getState();
		request('Adaptations')
			.get({
				is_tutor: true
			})
			.then(r => r.json())
			.then(d => {
				dispatch(setLoading(false));
				dispatch({
					type: constants.FETCH_CURATOR_ADAPTATIONS_SUCCESS,
					payload: d.data
				});
			})
			.catch(e => {
				console.error(e);
				//dispatch(error(e.message));
			});

		/*setTimeout(() => {
			saveAssessmentMock({
				status: app.steps.status,
				manager: app.steps.manager.value
			});
			dispatch(getStep());
			dispatch(setLoading(false));
			ownProps.history.push('/profile');
		}, 1000);*/
	}
};