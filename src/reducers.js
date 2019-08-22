import { combineReducers } from 'redux';
import uiReducer from './uiReducer';
//import appReducer from './assessment/reducer';

const reducer = combineReducers({
	//app: appReducer,
	ui: uiReducer,
	wt: (state = {}) => state
});

export default reducer;
