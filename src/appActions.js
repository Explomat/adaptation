import createRemoteActions from './utils/createRemoteActions';
import request from './utils/request';

export const constants = {
	...createRemoteActions([
		'FETCH_USER'
	]),
	'LOADING': 'LOADING',
	'ERROR': 'ERROR'
};

export function loading(isLoading){
	return {
		type: constants.LOADING,
		payload: isLoading
	}
};

export function error(error){
	return {
		type: constants.ERROR,
		payload: error
	}
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
				dispatch(error(e.message));
			});
	}
};