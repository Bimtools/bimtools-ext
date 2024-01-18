import * as type from './actionTypes';
const initialState = {
    payload: [],
    pending: false,
    error: null,
}
const reducers = (state = initialState, action) => {
    switch (action.type) {
        case type.GET_FAB_STATUS_REQUEST:
            return {
                ...state,
                pending: true
            }
        case type.GET_FAB_STATUS_SUCCESS:
            return {
                ...state,
                pending: false,
                payload: [
                    ...action.payload
                ]
            }
        case type.GET_FAB_STATUS_FAILURE:
            return {
                ...state,
                pending: false,
                error: action.error
            }
        case type.CREATE_FAB_STATUS_REQUEST:
            return {
                ...state,
                pending: true
            }
        case type.CREATE_FAB_STATUS_SUCCESS:
            return {
                ...state,
                pending: false,
                payload: [
                    ...state.payload, {
                        ...action.payload
                    }
                ]
            }
        case type.CREATE_FAB_STATUS_FAILURE:
            return {
                ...state,
                pending: false,
                error: action.error
            }
        case type.DELETE_FAB_STATUS_REQUEST:
            return {
                ...state,
                pending: true
            }
        case type.DELETE_FAB_STATUS_SUCCESS:
            const remaining = state.payload.filter(x => x.id !== action.payload)
            return {
                ...state,
                pending: false,
                payload: [...remaining]
            }
        case type.DELETE_FAB_STATUS_FAILURE:
            return {
                ...state,
                pending: false,
                error: action.error
            }
        default:
            return { ...state }
    }
}
export default reducers