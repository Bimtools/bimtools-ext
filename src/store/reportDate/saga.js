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
import { GetReportDateFailure, GetReportDateSuccess } from "./action";
import instance from "../../interceptors/axios";

function* getReportDateSaga(action) {
  try {
    const getFolderUrl = `/folders/by_path?path=${action.payload.projectName}/FabricationStatus&projectId=${action.payload.projectId}`;
    const response = yield call(instance.get, getFolderUrl);
    const folders = response.data.map((x) => {
      return {
        value: x.id,
        label: x.name,
      };
    });
    folders.sort((a, b) => new Date(b.label) - new Date(a.label));
    yield put(GetReportDateSuccess(folders));
  } catch (exception) {
    message.error(`Oops! Something went wrong. Please try again`);
    yield put(GetReportDateFailure());
    console.log(exception);
  }
}

function* reportDateSaga() {
  yield takeEvery("GET_REPORT_DATE_REQUEST", getReportDateSaga);
}
export default reportDateSaga;
