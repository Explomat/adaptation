import { constants } from './adaptationActions';

const tasksReducer = (state = [], action) => {
	switch(action.type) {
		case constants.ADD_TASK_SUCCESS: {
			return state.concat(action.payload);
		}

		case constants.REMOVE_TASK_SUCCESS: {
			const id = action.id;
			return state.filter(t => t.id !== id);
		}

		case constants.EDIT_TASK_SUCCESS: {
			const id = action.id;
			return state.map(t => {
				if (t.id === id){
					return action.payload;
				}
				return t;
			});
		}
		default: return state;
	}
}

const adaptationReducer = (state = {
	adaptationList: [],
	card: {
		tasks: []
	},
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

		case constants.ADD_TASK_SUCCESS:
		case constants.REMOVE_TASK_SUCCESS:
		case constants.EDIT_TASK_SUCCESS: {
			return {
				...state,
				card: {
					...state.card,
					tasks: tasksReducer(state.card.tasks, action)
				}
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