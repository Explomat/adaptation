import { constants } from './curatorActions';

const curatorReducer = (state = {
	adaptationList: []
}, action) => {
	switch(action.type) {
		case constants.FETCH_CURATOR_ADAPTATIONS_SUCCESS: {
			return {
				...state,
				adaptationList: action.payload
			}
		}
		default: return state;
	}
}

export default curatorReducer;