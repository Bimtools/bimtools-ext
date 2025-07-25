import { all, fork } from "redux-saga/effects";
import fabStatusSaga from './fabStatus/saga'
import objFabStatusSaga from './objFabStatus/saga'
import reportDateSaga from "./reportDate/saga";
function* rootSaga() {
    yield all([
        fork(fabStatusSaga),
        fork(objFabStatusSaga),
        fork(reportDateSaga)
    ])
}
export default rootSaga;