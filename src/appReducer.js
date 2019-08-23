import { constants } from './appActions';

const appReducer = (state = {
	user: {}
}, action) => {
	switch(action.type) {
		case constants.FETCH_USER_SUCCESS: {
			return {
				...action.payload
			}
		}
		default: return state;
	}
}

export default appReducer;