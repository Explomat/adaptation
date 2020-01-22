import { getUserAdaptations } from './app/adaptation/adaptationActions';
import { getTutorAdaptations } from './app/curator/curatorActions';
import { getCurators } from './app/manager/managerActions';

export const constants = {
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


export function getUsers() {
	return dispatch => {
		Promise.all([dispatch(getUserAdaptations()), dispatch(getTutorAdaptations({})), dispatch(getCurators())])
		.then(responses  => {
			console.log(responses);
		});
	}
}