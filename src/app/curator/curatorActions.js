import createRemoteActions from '../../utils/createRemoteActions';
import { error } from '../../appActions';
import request from '../../utils/request';

export const constants = {
	...createRemoteActions([
		'FETCH_CURATOR_ADAPTATIONS'
	])
};

export function getTutorAdaptations(tutorId, tutorRole){
	return (dispatch, getState) => {
		request('Adaptations')
			.get({
				is_tutor: true,
				tutor_id: tutorId,
				tutor_role: tutorRole
			})
			.then(r => r.json())
			.then(d => {
				if (d.type === 'error'){
					throw d;
				}
				dispatch({
					type: constants.FETCH_CURATOR_ADAPTATIONS_SUCCESS,
					payload: { ...d.data }
				});
			})
			.catch(e => {
				console.error(e);
				dispatch(error(e.message));
			});
	}
};