import * as actionType from './actionTypes'

export function GetReportDateRequest(payload){
    return{
        type:actionType.GET_REPORT_DATE_REQUEST,
        payload:payload,
    }
}

export function GetReportDateSuccess(payload){
    return{
        type:actionType.GET_REPORT_DATE_SUCCESS,
        payload:payload
    }
}
export function GetReportDateFailure(){
    return{
        type:actionType.GET_REPORT_DATE_FAILURE,
    }
}