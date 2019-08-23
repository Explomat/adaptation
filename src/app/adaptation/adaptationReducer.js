import { constants } from './adaptationActions';

const adaptationReducer = (state = {
	adaptationList: [],
	card: {},
	mainSteps: [],
	meta: {},
	steps: [],
	ui: {
		isLoading: true
	}
}, action) => {
	switch(action.type) {
		case constants.FETCH_ADAPTATION_SUCCESS: {
			return {
				...state,
				...action.payload
			}
		}

		case constants.FETCH_USER_ADAPTATIONS_SUCCESS: {
			return {
				...state,
				adaptationList: action.payload
			}
		}

		case constants.LOADING_ADAPTATION: {
			return {
				...state,
				ui: {
					...state.ui,
					isLoading: action.payload
				}
			}
		}

		default: return state;
	}
}

export default adaptationReducer;