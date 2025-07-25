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
  //Check FabStatusFolder
  const getFolderUrl = `/folders/by_path?path=${action.payload.projectName}&projectId=${action.payload.projectId}`;
  const response = yield call(instance.get, getFolderUrl);
  const folders = response.data.filter((x) => x.name === "FabricationStatus");
  console.log(folders);
  if (folders.length == 0) {
    const insertFolderUrl = `/folders`;
    const insertFolderResponse = yield call(instance.post, insertFolderUrl, {
      name: "FabricationStatus",
      parentId: response.data[0].parentId,
    });
    yield put(
      GetFabStatusSuccess({
        folderId: insertFolderResponse.id,
        statuses: [],
      })
    );
  } else {
    const getCommentUrl = `/comments?objectId=${folders[0].id}&objectType=FOLDER`;
    const commentResponse = yield call(instance.get, getCommentUrl);
    const statuses = commentResponse.data.map((x) => ({
      id: x.id,
      name: x.description,
    }));
    yield put(
      GetFabStatusSuccess({
        folderId: folders[0].id,
        statuses: statuses,
      })
    );
  }
}
function* createFabStatusSaga(action) {
  try {
    const url = `\comments`;
    const response = yield call(instance.post, url, action.payload);
    yield put(
      CreateFabStatusSuccess({
        id: response.data.id,
        name: action.payload.description,
      })
    );
  } catch (exception) {
    console.log(exception);
  }
}
function* deleteFabStatusSaga(action) {
  try {
    const url = `comments/${action.payload.id}`;
    const response = yield call(instance.delete, url);
    yield put(
      DeleteFabStatusSuccess({
        id: action.payload.id,
      })
    );
  } catch (exception) {
    console.log(exception);
  }
}

function* fabStatusSaga() {
  yield takeEvery("GET_FAB_STATUS_REQUEST", getFabStatusSaga);
  yield takeEvery("CREATE_FAB_STATUS_REQUEST", createFabStatusSaga);
  yield takeEvery("DELETE_FAB_STATUS_REQUEST", deleteFabStatusSaga);
}
export default fabStatusSaga;
