import React, { useEffect, useState } from "react";
import {
  Input,
  Divider,
  Typography,
  Button,
  List,
  message,
  Select,
} from "antd";
import * as WorkspaceAPI from "trimble-connect-workspace-api";
import { useDispatch, useSelector } from "react-redux";
import {
  GetObjFabStatusRequest,
  RepresentObjFabStatusRequest,
  RepresentObjFabStatusSuccess,
  UpdateObjFabStatusRequest,
  UpdateObjFabStatusSuccess,
} from "../store/objFabStatus/action";
import { GetFabStatusRequest } from "../store/fabStatus/action";
import moment from "moment";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import * as XLSX from "xlsx";
import { Format } from "../services/GUIDConversion";
import { GetReportDateRequest } from "../store/reportDate/action";

const { Text } = Typography;
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export const options = {
  scales: {
    x: {
      ticks: {
        maxRotation: 90,
        minRotation: 90,
      },
    },
  },
  responsive: true,
  plugins: {
    legend: {
      position: "top",
    },
    title: {
      display: true,
      text: "Fabrication Progress",
    },
  },
};

const FabStatusReport = () => {
  const dispatch = useDispatch();
  const [projectId, setProjectId] = useState("");
  const [projectName, setProjectName] = useState("");
  const [tcapi, setTcapi] = useState();
  const [reportDate, setReportDate] = useState(undefined);
  const [reportData, setReportData] = useState();

  const fabStatuses = useSelector((state) => state.fabStatus.payload);
  const objFabStatuses = useSelector((state) => state.objFabStatus.payload);
  const modelStatuses = useSelector((state) => state.objFabStatus.objects);
  const reportDates = useSelector((state) => state.reportDate.payload);
  const loading = useSelector((state) => state.objFabStatus.pending);
  useEffect(() => {
    async function getProjectId() {
      const tcapi = await WorkspaceAPI.connect(window.parent);
      const project = await tcapi.project.getProject();
      setProjectId(project.id);
      setProjectName(project.name);
      setTcapi(tcapi);
      dispatch(
        GetReportDateRequest({
          projectId: project.id,
          projectName: project.name,
        })
      );
    }
    getProjectId();
  }, []);

  return (
    <>
      <Divider>Fabrication Status Report</Divider>
      <div
        containeer
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "flex-end",
          flexWrap: "wrap",
          columnGap: "5px",
          rowGap: "5px",
          margin: "2px",
        }}
      >
        <Select
          style={{ width: 120 }}
          optionFilterProp="children"
          value={reportDate}
          options={reportDates}
          onChange={(value) => {
            const selectedReportDate = reportDates.filter(
              (x) => x.value === value
            );
            setReportDate(selectedReportDate);
            dispatch(
              GetObjFabStatusRequest({
                folderId: value,
              })
            );
          }}
          placeholder="Report Date"
        />
        <Button
          type="primary"
          disabled={loading}
          onClick={async () => {
            dispatch(RepresentObjFabStatusSuccess([]));
            dispatch(RepresentObjFabStatusRequest());
            const models = await tcapi.viewer.getObjects({
              parameter: {
                class: "IFCELEMENTASSEMBLY",
              },
            });
            models.map(async (x) => {
              const object_ids = x.objects.map((a) => a.id);
              const token = await tcapi.extension.requestPermission(
                "accesstoken"
              );
              const items = await tcapi.viewer.getObjectProperties(
                x.modelId,
                object_ids
              );
              let objects_have_fab_status = [];
              items.forEach(async (item) => {
                const properties = item.properties;
                let asm_pos = "";
                properties.every((property) => {
                  if (property.name === "ASSEMBLY") {
                    const asm_properties = property.properties;
                    asm_properties.every((asm_property) => {
                      if (asm_pos !== "") return false;
                      if (asm_property.name.trim() === "ASSEMBLY_POS") {
                        asm_pos = asm_property.value.replace("(?)", "");
                      }
                      return true;
                    });
                    return false;
                  } else if (property.name.trim() === "Tekla Assembly") {
                    const asm_properties = property.properties;
                    asm_properties.every((asm_property) => {
                      if (asm_pos !== "") return false;
                      if (
                        asm_property.name.trim() === "Assembly/Cast unit Mark"
                      ) {
                        asm_pos = asm_property.value;
                      }
                      return true;
                    });
                    return false;
                  }
                  return true;
                });

                //Get objects which have a fabrication status
                const matched_obj = objFabStatuses.filter(
                  (obj) =>
                    obj.asmPos == asm_pos &&
                    typeof obj.fabStatusId !== "undefined"
                );
                if (matched_obj.length === 0) {
                  objects_have_fab_status.push({
                    modeId: x.modelId,
                    id: item.id,
                    color: `rgb(153,153,153)`,
                    status: "Not yet started",
                    statusId: "-1",
                    reportDate: reportDate,
                    asm_pos: asm_pos,
                  });
                } else {
                  const matched_fab_statuses = fabStatuses.filter(
                    (a) => a.id === matched_obj[0].fabStatusId
                  );
                  const color = matched_fab_statuses[0].name.split("=")[1];
                  const status = matched_fab_statuses[0].name.split("=")[0];
                  const fab_qty = Number(matched_obj[0].fabQty);
                  const existing_asm_pos = objects_have_fab_status.filter(
                    (obj) => obj.asmPos === asm_pos
                  );
                  if (existing_asm_pos.length < fab_qty || fab_qty === 0) {
                    objects_have_fab_status.push({
                      modeId: x.modelId,
                      id: item.id,
                      color: color,
                      status: status,
                      statusId: matched_obj[0].fabStatusId,
                      asm_pos: asm_pos,
                    });
                  }
                }
              });
              //Set fab status color
              const group_by_color = Object.groupBy(
                objects_have_fab_status,
                ({ color }) => color
              );
              Object.entries(group_by_color).forEach(function ([key, value]) {
                var numberPattern = /\d+/g;
                const rgb_digits = key.match(numberPattern);
                let transparency = 255;
                if (key === "rgb(153,153,153)") transparency = 50;
                const objects_id = value.map((a) => {
                  return a.id;
                });
                tcapi.viewer.setObjectState(
                  {
                    modelObjectIds: [
                      {
                        modelId: x.modelId,
                        objectRuntimeIds: objects_id,
                      },
                    ],
                  },
                  {
                    color: {
                      r: rgb_digits[0],
                      g: rgb_digits[1],
                      b: rgb_digits[2],
                      a: transparency,
                    },
                    visible: true,
                  }
                );
              });
              dispatch(RepresentObjFabStatusSuccess(objects_have_fab_status));
            });
          }}
        >
          Representation
        </Button>
      </div>
      <List
        style={{
          marginLeft: "5px",
          marginRight: "5px",
        }}
        dataSource={fabStatuses}
        loading={loading}
        renderItem={(item) => (
          <List.Item
            style={{
              background: item.name.split("=")[1],
              marginTop: "5px",
              marginBottom: "5px",
              height: "40px",
            }}
            onClick={() => {
              console.log(modelStatuses);
              const matched_obj = modelStatuses.filter(
                (obj) => obj.statusId == item.id
              );
              console.log(item);
              const group_by_model_id = Object.groupBy(
                matched_obj,
                ({ modeId }) => modeId
              );
              let objs_by_status = [];
              Object.entries(group_by_model_id).forEach(function ([
                key,
                value,
              ]) {
                console.log(key);
                const objects_id = value.map((a) => {
                  return a.id;
                });
                objs_by_status.push({
                  modelId: key,
                  objectRuntimeIds: objects_id,
                });
              });
              tcapi.viewer.setSelection(
                {
                  modelObjectIds: [...objs_by_status],
                },
                "set"
              );
            }}
          >
            <Text ellipsis style={{ marginLeft: "5px" }}>
              {item.name.split("=")[0]}
            </Text>
          </List.Item>
        )}
      />
    </>
  );
};

export default FabStatusReport;
