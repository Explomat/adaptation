import { constants } from './appActions';

const appReducer = (state = {
	user: {},
	ui: {
		isLoading: false
	}
}, action) => {
	switch(action.type) {
		case constants.LOADING: {
			const newState = {
				...state,
				ui: {
					...state.ui,
					isLoading: action.payload
				}
			}

			return newState;
		}

		case constants.ERROR: {
			return {
				...state,
				ui: {
					...state.ui,
					error: action.payload
				}
			}
		}

		default: return state;
	}
}

export default appReducer;