import axios from "axios";
import { all, call, put, takeLatest, takeEvery } from "redux-saga/effects";
import * as actionType from './actionTypes'
import * as WorkspaceAPI from "trimble-connect-workspace-api";
import { message } from "antd";
import { GetObjFabStatusSuccess, UpdateObjFabStatusSuccess } from "./action";

function* updateObjFabStatusSaga(action) {
    try {
        const polysus_fab_status_token = localStorage.getItem('polysus_fab_status_token')
        const url = `${process.env.REACT_APP_SHARING_API_URI}/projects/${action.payload.projectId}/statusevents`
        const response = yield call(axios.post, url, action.payload.objFabStatuses, {
            headers: {
                Authorization: `Bearer ${polysus_fab_status_token}`,
            },
        })
        message.success(`Fabrication status has been updated`)
        yield put(UpdateObjFabStatusSuccess(response.data))
        console.log(response)
    } catch (exception) {
        message.error(`Oops! Something went wrong. Please try again`)
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
        const data = response.data.map(x=>{return {
            statusActionId:action.payload.statusActionId,
            guid:x.objectId.split('-@-')[0],
            modelId:x.objectId.split('-@-')[1]
        }})
        if(data.length ===0) return
        yield put(GetObjFabStatusSuccess(data))
    } catch (exception) {
        console.log(exception)
    }
}
async function presentation(data) {
    if (data.length === 0) return
    WorkspaceAPI.connect(window.parent, (event, data) => {
    }).then(async tcapi => {
        // Get all assemblies
        const models = await tcapi.viewer.getObjects({
            parameter: {
                class: "IFCELEMENTASSEMBLY",
            },
        })
        models.forEach(async x => {
            const object_ids = x.objects.map(a => a.id);
            const items = await tcapi.viewer.getObjectProperties(x.modelId, object_ids)
            let object_statuses = []
            items.forEach(item => {
                const properties = item.properties
                properties.every(property => {
                    if (property.name === 'ASSEMBLY') {
                        const asm_properties = property.properties
                        let guid = ''
                        const object_id = item.id
                        asm_properties.every(asm_property => {
                            if (guid !== '') return false
                            if (asm_property.name === 'GUID') {
                                guid = asm_property.value
                            }
                            return true
                        })
                        //Get matched status if any
                        const matched_statuses = data.filter(row => row.objectId===guid)
                        console.log(matched_statuses)
                        return false
                    }
                    return true
                })
            })
            if (object_statuses.length === 0) return
        })
    });

}

function* objFabStatusSaga() {
    yield takeEvery('UPDATE_OBJ_FAB_STATUS_REQUEST', updateObjFabStatusSaga)
    yield takeEvery('GET_OBJ_FAB_STATUS_REQUEST', getObjFabStatusSaga)

}
export default objFabStatusSaga