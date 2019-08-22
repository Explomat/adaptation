const ui = (state = {
	isLoading: false,
	error: null
}, action) => {
	switch(action.type) {
		case 'LOADING': {
			return {
				...state,
				isLoading: action.payload
			}
		}

		case 'ERROR': {
			return {
				...state,
				error: action.payload
			}
		}
		default: return state;
	}
}

export default ui;