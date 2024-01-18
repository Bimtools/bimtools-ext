import axios from "axios";
import { all, call, put, takeLatest, takeEvery } from "redux-saga/effects";
import * as actionType from './actionTypes'
import { message } from "antd";

function* updateObjFabStatusSaga(action) {
    try {
        const polysus_fab_status_token = localStorage.getItem('polysus_fab_status_token')
        const url = `${process.env.REACT_APP_SHARING_API_URI}/projects/${action.payload.projectId}/statusevents`
        const response = yield call(axios.post, url, action.payload.objFabStatuses, {
            headers: {
                Authorization: `Bearer ${polysus_fab_status_token}`,
            },
        })
        console.log(response)
    } catch (exception) {
        console.log(exception)
    }
}
function* getObjFabStatusSaga(action) {
    try {
        const polysus_fab_status_token = localStorage.getItem('polysus_fab_status_token')
        const url = `${process.env.REACT_APP_SHARING_API_URI}/projects/${action.payload.projectId}/status?statusActionId=${action.payload.statusActionId}`
        const response = yield call(axios.get, url, {
            headers: {
                Authorization: `Bearer ${polysus_fab_status_token}`,
            },
        })
        const data= response.data
        yield call(presentation,data)
    } catch (exception) {
        console.log(exception)
    }
}
async function presentation(data){
    if(data.length ===0) return
    
}

function* objFabStatusSaga() {
    yield takeEvery('UPDATE_OBJ_FAB_STATUS_REQUEST', updateObjFabStatusSaga)
    yield takeEvery('GET_OBJ_FAB_STATUS_REQUEST', getObjFabStatusSaga)

}
export default objFabStatusSaga