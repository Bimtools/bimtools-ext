import axios from "axios";
import {
  all,
  call,
  put,
  takeLatest,
  takeEvery,
  fork,
} from "redux-saga/effects";
import { message } from "antd";
import {
  GetObjFabStatusFailure,
  GetObjFabStatusSuccess,
  UpdateObjFabStatusFailure,
  UpdateObjFabStatusSuccess,
} from "./action";
import instance from "../../interceptors/axios";

function* updateObjFabStatusSaga(action) {
  try {
    if (action.payload.objFabStatuses.length === 0) {
      yield put(UpdateObjFabStatusSuccess());
      message.success(`Fabrication status has been updated`);
    } else {
      //Get FabStatusFolder
      const getFabStatusFolderUrl = `/folders/by_path?path=${action.payload.projectName}&projectId=${action.payload.projectId}`;
      const responseFabStatusFolder = yield call(
        instance.get,
        getFabStatusFolderUrl
      );
      const foldersFabStatus = responseFabStatusFolder.data.filter(
        (x) => x.name === "FabricationStatus"
      );
      //Check respective folder
      const getFolderUrl = `/folders/by_path?path=${action.payload.projectName}/FabricationStatus&projectId=${action.payload.projectId}`;
      const response = yield call(instance.get, getFolderUrl);
      console.log(getFolderUrl);
      const folders = response.data.filter(
        (x) => x.name === action.payload.reportDate
      );
      if (folders.length > 0) {
        const deleteFolderUrl = `folders/${folders[0].id}`;
        const responseDelete = yield call(instance.delete, deleteFolderUrl);
      }
      //Create report date folder
      const insertFolderUrl = `/folders`;
      const insertFolderResponse = yield call(instance.post, insertFolderUrl, {
        name: action.payload.reportDate,
        parentId: foldersFabStatus[0].id,
      });
      console.log(insertFolderResponse.data);
      for (const fabStatus of action.payload.objFabStatuses) {
        const urlInsertComment = `\comments`;
        const responseInsertComment = yield call(
          instance.post,
          urlInsertComment,
          {
            objectId: insertFolderResponse.data.id,
            objectType: "FOLDER",
            description: JSON.stringify(fabStatus),
          }
        );
        console.log(responseInsertComment.data);
      }
      yield put(UpdateObjFabStatusSuccess());
      message.success(`Fabrication status has been updated`);
    }
    console.log(action.payload.objFabStatuses);
  } catch (exception) {
    message.error(`Oops! Something went wrong. Please try again`);
    yield put(UpdateObjFabStatusFailure());
    console.log(exception);
  }
}
function* getObjFabStatusSaga(action) {
  try {
    const getCommentUrl = `/comments?objectId=${action.payload.folderId}&objectType=FOLDER`;
    const response = yield call(instance.get, getCommentUrl);
    const statuses = response.data.map((x) => {
      return JSON.parse(x.description);
    });
    yield put(GetObjFabStatusSuccess(statuses));
  } catch (exception) {
    console.log(exception);
    yield put(GetObjFabStatusFailure());
  }
}

function* objFabStatusSaga() {
  yield takeEvery("UPDATE_OBJ_FAB_STATUS_REQUEST", updateObjFabStatusSaga);
  yield takeEvery("GET_OBJ_FAB_STATUS_REQUEST", getObjFabStatusSaga);
}
export default objFabStatusSaga;
