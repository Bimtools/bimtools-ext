import axios from "axios";
import { all, call, put, takeLatest, takeEvery } from "redux-saga/effects";
import * as actionType from './actionTypes'
import { CreateFabStatusSuccess, DeleteFabStatusSuccess, GetFabStatusSuccess } from "./action";
import { message } from "antd";

function* getFabStatusSaga(action) {
    const polysus_fab_status_token = localStorage.getItem('polysus_fab_status_token')
    const url = `${process.env.REACT_APP_SHARING_API_URI}/projects/${action.payload.projectId}/statusactions`
    console.log(url)
    const response = yield call(axios.get, url, {
        headers: {
            Authorization: `Bearer ${polysus_fab_status_token}`,
        },
    })
    const statuses = response.data.map(x => ({
        id: x.id,
        name: x.name
    }))
    yield put(GetFabStatusSuccess(statuses));
}
function* createFabStatusSaga(action) {
    try {
        const polysus_fab_status_token = localStorage.getItem('polysus_fab_status_token')
        const url = `${process.env.REACT_APP_SHARING_API_URI}/projects/${action.payload.projectId}/statusactions`
        const response = yield call(axios.post, url, action.payload.fabStatus, {
            headers: {
                Authorization: `Bearer ${polysus_fab_status_token}`,
            },
        })
        yield put(CreateFabStatusSuccess({
            id: response.data.id,
            name: action.payload.fabStatus.name
        }))
    } catch (exception) {
        console.log(exception)
    }
}
function* deleteFabStatusSaga(action) {
    try {
        const polysus_fab_status_token = localStorage.getItem('polysus_fab_status_token')
        const url = `${process.env.REACT_APP_SHARING_API_URI}/projects/${action.payload.projectId}/statusactions/${action.payload.id}`
        const response = yield call(axios.delete, url, {
            headers: {
                Authorization: `Bearer ${polysus_fab_status_token}`,
            },
        })
        yield put(DeleteFabStatusSuccess(action.payload.id))
    } catch (exception) {
        console.log(exception)
    }
}

function* fabStatusSaga() {
    yield takeEvery('GET_FAB_STATUS_REQUEST', getFabStatusSaga)
    yield takeEvery('CREATE_FAB_STATUS_REQUEST', createFabStatusSaga)
    yield takeEvery('DELETE_FAB_STATUS_REQUEST', deleteFabStatusSaga)

}
export default fabStatusSaga