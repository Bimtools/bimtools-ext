import axios from "axios";
import {
  all,
  call,
  put,
  takeLatest,
  takeEvery,
  fork,
} from "redux-saga/effects";
import {
  CreateFabStatusSuccess,
  DeleteFabStatusSuccess,
  GetFabStatusSuccess,
} from "./action";
import instance from "../../interceptors/axios";

function* getFabStatusSaga(action) {
  const url = `/projects/${action.payload.projectId}/statusactions`;
  const response = yield call(instance.get, url);
  const statuses = response.data.map((x) => ({
    id: x.id,
    name: x.name,
  }));
  yield put(GetFabStatusSuccess(statuses));
}
function* createFabStatusSaga(action) {
  try {
    const url = `/projects/${action.payload.projectId}/statusactions`;
    const response = yield call(instance.post, url, action.payload.fabStatus);
    yield put(
      CreateFabStatusSuccess({
        id: response.data.id,
        name: action.payload.fabStatus.name,
      })
    );
  } catch (exception) {
    console.log(exception);
  }
}
function* deleteFabStatusSaga(action) {
  try {
    // const url = `/projects/${action.payload.projectId}/statusactions/${action.payload.id}`
    // const response = yield call(instance.delete, url)
    // yield put(DeleteFabStatusSuccess(action.payload.id))
    const token = localStorage.getItem("trimbleToken");
    const url = `https://app21.connect.trimble.com/tc/api/2.0/comments`;
    for (let i = 0; i < 1000; i++) {
      const response = yield call(
        axios.post,
        url,
        {
          objectId: "cNizqPDWZGo",
          objectType: "FOLDER",
          description: "Test Comment "+i,
          contextId: "",
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
        }
      );
      console.log(response);
    }
  } catch (exception) {
    console.log(exception);
  }
}

function* fabStatusSaga() {
  yield takeLatest("GET_FAB_STATUS_REQUEST", getFabStatusSaga);
  yield takeEvery("CREATE_FAB_STATUS_REQUEST", createFabStatusSaga);
  yield takeEvery("DELETE_FAB_STATUS_REQUEST", deleteFabStatusSaga);
}
export default fabStatusSaga;
