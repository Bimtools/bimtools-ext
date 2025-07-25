import { combineReducers } from "redux";
import fabStatusReducer from './fabStatus/reducer'
import objFabStatusReducer from './objFabStatus/reducer'
import reportDateReducer from './reportDate/reducer'
const rootReducer= combineReducers({
    fabStatus:fabStatusReducer,
    objFabStatus:objFabStatusReducer,
    reportDate: reportDateReducer
})
export default rootReducer;