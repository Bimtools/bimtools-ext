import { all, fork } from "redux-saga/effects";
import fabStatusSaga from './fabStatus/saga'
import objFabStatusSaga from './objFabStatus/saga'
function* rootSaga() {
    yield all([
        fork(fabStatusSaga),
        fork(objFabStatusSaga),
    ])
}
export default rootSaga;