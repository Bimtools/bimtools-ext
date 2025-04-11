import axios from "axios";
import { all, call, put, takeLatest, takeEvery, fork } from "redux-saga/effects";
import { message } from "antd";
import { GetObjFabStatusFailure, GetObjFabStatusSuccess, UpdateObjFabStatusSuccess } from "./action";
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
        console.log(exception)
    }
}
function* getObjFabStatusSaga(action) {
    try {
        console.log(action.payload)
        const url = `/projects/${action.payload.projectId}/status?statusActionId=${action.payload.statusActionId}`
        console.log(url)
        const response = yield call(instance.get, url)
        const data = response.data.map(x => {
            return {
                statusActionId: action.payload.statusActionId,
                asm_pos: x.objectId.split('-@-')[0],
                fab_qty: Number(x.objectId.split('-@-')[1]),
                model_total: Number(x.objectId.split('-@-')[2]),
                asm_weight: Number(x.objectId.split('-@-')[3]),
                reportDate: x.valueDate
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