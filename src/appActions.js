
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
