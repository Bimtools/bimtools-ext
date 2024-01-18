import * as type from './actionTypes';
const initialState = {
    payload: [],
    pending: false,
    error: null,
}
const reducers = (state = initialState, action) => {
    switch (action.type) {
        case type.UPDATE_OBJ_FAB_STATUS_REQUEST:
            return {
                ...state,
                pending: true
            }
        case type.UPDATE_OBJ_FAB_STATUS_SUCCESS:
            return {
                ...state,
                pending: false,
                payload: [...action.payload]
            }
        case type.UPDATE_OBJ_FAB_STATUS_FAILURE:
            return {
                ...state,
                pending: false,
                error: action.error
            }
        case type.GET_OBJ_FAB_STATUS_REQUEST:
            return {
                ...state,
                pending: true
            }
        case type.GET_OBJ_FAB_STATUS_SUCCESS:
            return {
                ...state,
                pending: false,
                payload: [
                    ...state.payload,
                    ...action.payload]
            }
        case type.GET_OBJ_FAB_STATUS_FAILURE:
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