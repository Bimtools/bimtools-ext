import { combineReducers } from "redux";
import fabStatusReducer from './fabStatus/reducer'
import objFabStatusReducer from './objFabStatus/reducer'
const rootReducer= combineReducers({
    fabStatus:fabStatusReducer,
    objFabStatus:objFabStatusReducer,
})
export default rootReducer;