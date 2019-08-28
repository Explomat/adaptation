import { constants } from './appActions';

const appReducer = (state = {
	user: {},
	ui: {}
}, action) => {
	switch(action.type) {
		case constants.FETCH_USER_SUCCESS: {
			return {
				...action.payload
			}
		}

		case constants.LOADING: {
			return {
				...state,
				ui: {
					...state.ui,
					isLoading: action.payload
				}
			}
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