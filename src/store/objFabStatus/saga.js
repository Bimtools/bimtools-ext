import axios from "axios";
import { all, call, put, takeLatest, takeEvery, fork } from "redux-saga/effects";
import { message } from "antd";
import { GetObjFabStatusFailure, GetObjFabStatusSuccess, UpdateObjFabStatusFailure, UpdateObjFabStatusSuccess } from "./action";
import instance from "../../interceptors/axios";

function* updateObjFabStatusSaga(action) {
    try {
        const url = `/projects/${action.payload.projectId}/statusevents`
        const response = yield call(instance.post, url, action.payload.objFabStatuses)
        console.log(response)
        yield put(UpdateObjFabStatusSuccess())
        message.success(`Fabrication status has been updated`)
    } catch (exception) {
        message.error(`Oops! Something went wrong. Please try again`)
        yield put(UpdateObjFabStatusFailure())
        console.log(exception)
    }
}
function* getObjFabStatusSaga(action) {
    try {
        const url = `/projects/${action.payload.projectId}/status`
        const response = yield call(instance.get, url)
        const data = response.data.map(x => {
            return {
                statusActionId: x.statusActionId,
                asm_pos: x.objectId.split('-@-')[0],
                fab_qty: Number(x.objectId.split('-@-')[1]),
            }
        })
        if (data.length === 0) return
        console.log(data)
        yield put(GetObjFabStatusSuccess(data))
    } catch (exception) {
        console.log(exception)
        yield put(GetObjFabStatusFailure())
    }
}

function* objFabStatusSaga() {
    yield takeEvery('UPDATE_OBJ_FAB_STATUS_REQUEST', updateObjFabStatusSaga)
    yield takeEvery('GET_OBJ_FAB_STATUS_REQUEST', getObjFabStatusSaga)

}
export default objFabStatusSaga