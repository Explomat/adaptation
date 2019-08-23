import { combineReducers } from 'redux';
import appReducer from './appReducer';
import uiReducer from './uiReducer';
import adaptationReducer from './app/adaptation/adaptationReducer';
import curatorReducer from './app/curator/curatorReducer';
import managerReducer from './app/manager/managerReducer';

//import appReducer from './assessment/reducer';

const reducer = combineReducers({
	app: appReducer,
	adaptation: adaptationReducer,
	curator: curatorReducer,
	manager: managerReducer,
	ui: uiReducer,
	wt: (state = {}) => state
});

export default reducer;
