import * as actionType from './actionTypes'

export function GetFabStatusRequest(payload){
    return{
        type:actionType.GET_FAB_STATUS_REQUEST,
        payload:payload
    }
}
export function GetFabStatusSuccess(payload){
    return{
        type:actionType.GET_FAB_STATUS_SUCCESS,
        payload:payload
    }
}

export function CreateFabStatusRequest(payload){
    return{
        type:actionType.CREATE_FAB_STATUS_REQUEST,
        payload:payload
    }
}

export function CreateFabStatusSuccess(payload){
    return{
        type:actionType.CREATE_FAB_STATUS_SUCCESS,
        payload:payload
    }
}
export function DeleteFabStatusRequest(payload){
    return{
        type:actionType.DELETE_FAB_STATUS_REQUEST,
        payload:payload
    }
}

export function DeleteFabStatusSuccess(payload){
    return{
        type:actionType.DELETE_FAB_STATUS_SUCCESS,
        payload:payload
    }
}
