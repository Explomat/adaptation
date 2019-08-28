import { constants } from './curatorActions';

const curatorReducer = (state = {
	adaptationList: [],
	curator_fullname: ''
}, action) => {
	switch(action.type) {
		case constants.FETCH_CURATOR_ADAPTATIONS_SUCCESS: {
			return {
				...state,
				adaptationList: action.payload.cards,
				curator_fullname: action.payload.curator_fullname
			}
		}
		default: return state;
	}
}

export default curatorReducer;