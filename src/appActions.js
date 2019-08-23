import createRemoteActions from './utils/createRemoteActions';
//import { error } from '../appActions';
import request from './utils/request';

export const constants = {
	...createRemoteActions([
		'FETCH_USER'
	])
};

export function getUser(){
	return (dispatch, getState) => {

		request('Users')
			.get()
			.then(d => {
				dispatch({
					type: constants.FETCH_USER_SUCCESS,
					payload: d
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