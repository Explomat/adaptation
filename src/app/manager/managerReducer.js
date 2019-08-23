import { constants } from './managerActions';

const managerReducer = (state = {
	curatorList: []
}, action) => {
	switch(action.type) {
		case constants.FETCH_CURATORS_SUCCESS: {
			return {
				...state,
				curatorList: action.payload
			}
		}
		default: return state;
	}
}

export default managerReducer;