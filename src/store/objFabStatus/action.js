import * as actionType from './actionTypes'

export function UpdateObjFabStatusRequest(payload){
    return{
        type:actionType.UPDATE_OBJ_FAB_STATUS_REQUEST,
        payload:payload
    }
}

export function UpdateObjFabStatusSuccess(payload){
    return{
        type:actionType.UPDATE_OBJ_FAB_STATUS_SUCCESS,
        payload:payload
    }
}
export function GetObjFabStatusRequest(payload){
    return{
        type:actionType.GET_OBJ_FAB_STATUS_REQUEST,
        payload:payload
    }
}

export function GetObjFabStatusSuccess(payload){
    return{
        type:actionType.GET_OBJ_FAB_STATUS_SUCCESS,
        payload:payload
    }
}