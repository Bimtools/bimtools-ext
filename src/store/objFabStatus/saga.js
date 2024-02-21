import axios from "axios";
import { all, call, put, takeLatest, takeEvery } from "redux-saga/effects";
import * as WorkspaceAPI from "trimble-connect-workspace-api";
import { message } from "antd";
import { GetObjFabStatusFailure, GetObjFabStatusSuccess, UpdateObjFabStatusSuccess } from "./action";

function* updateObjFabStatusSaga(action) {
    try {
        const url = `/projects/${action.payload.projectId}/statusevents`
        const response = yield call(axios.post, url, action.payload.objFabStatuses)   
        console.log(response.data)   
        const data = response.data.map(x => {
            return {
                statusActionId: x.statusActionId,
                asm_pos: x.objectId.split('-@-')[0],
                fab_qty: Number(x.objectId.split('-@-')[1]),
                model_total: Number(x.objectId.split('-@-')[2]),
                asm_weight: Number(x.objectId.split('-@-')[3]),
                reportDate: x.valueDate
            }
        })
        yield put(UpdateObjFabStatusSuccess(data))
        message.success(`Fabrication status has been updated`)
    } catch (exception) {
        message.error(`Oops! Something went wrong. Please try again`)
        console.log(exception)
    }
}
function* getObjFabStatusSaga(action) {
    try {
        const url = `${process.env.REACT_APP_SHARING_API_URI}/projects/${action.payload.projectId}/statusevents?statusActionId=${action.payload.statusActionId}`
        const response = yield call(axios.get, url)
        const data = response.data.map(x => {
            return {
                statusActionId: action.payload.statusActionId,
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