import createRemoteActions from '../../utils/createRemoteActions';
import { error } from '../../appActions';
import request from '../../utils/request';

export const constants = {
	...createRemoteActions([
		'FETCH_CURATORS'
	])
};

export function getCurators(ownProps){
	return (dispatch, getState) => {
		request('Curators')
			.get()
			.then(r => r.json())
			.then(d => {
				dispatch({
					type: constants.FETCH_CURATORS_SUCCESS,
					payload: d.data
				});
			})
			.catch(e => {
				console.error(e);
				dispatch(error(e.message));
			});
	}
};