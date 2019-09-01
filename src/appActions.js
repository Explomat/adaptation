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
