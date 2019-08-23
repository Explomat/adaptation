import createRemoteActions from '../../utils/createRemoteActions';
//import { error } from '../appActions';
import request from '../../utils/request';

export const constants = {
	...createRemoteActions([
		'FETCH_CURATORS'
	]),
	'LOADING_CURATORS': 'LOADING_CURATORS'
};

function setLoading(isLoading){
	return {
		type: constants.LOADING_CURATORS,
		payload: isLoading
	}
};

export function getCurators(ownProps){
	return (dispatch, getState) => {
		dispatch(setLoading(true));

		request('Curators')
			.get()
			.then(r => r.json())
			.then(d => {
				dispatch(setLoading(false));
				dispatch({
					type: constants.FETCH_CURATORS_SUCCESS,
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