import React, { useEffect, useState, MouseEvent, useRef } from "react";
import * as WorkspaceAPI from "trimble-connect-workspace-api";
import { Layout, Button, message } from "antd";
import {
  Pie, getDatasetAtEvent,
  getElementAtEvent,
  getElementsAtEvent,
} from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";


const { Content } = Layout;
ChartJS.register(ArcElement, Tooltip, Legend);

const FabData = [
  {
    Status: "Not Yet Started",
    Color: "rgb(153,153,153)",
    TC_Color: {
      a: 50,
      b: 153,
      g: 153,
      r: 153
    },
  },
  {
    Status: "Deliveried",
    Color: "rgb(226,56,236)",
    TC_Color: {
      a: 255,
      b: 236,
      g: 56,
      r: 226
    },
  },
  {
    Status: "Fabricated",
    Color: "rgb(0,0,255)",
    TC_Color: {
      a: 255,
      b: 255,
      g: 0,
      r: 0
    },
  },
  {
    Status: "In Fabrication",
    Color: "rgb(255,191,0)",
    TC_Color: {
      a: 255,
      b: 0,
      g: 191,
      r: 255
    },
  },

]
const fab_Statues = FabData.map(x => x.Status)
const fab_Colors = FabData.map(x => x.Color)

const UpdateStatus = () => {
  const [event, setEvent] = useState();
  const [data, setData] = useState();
  const [fabricatedCount, setFabricatedCount] = useState(0);
  const [fabricatingCount, setFabricatingCount] = useState(0);
  const [deliveriedCount, setDeliveriedCount] = useState(0);
  const [notYetStartedCount, setNotYetStartedCount] = useState(0);
  const [modelObjects, setModelObjects] = useState([]);
  const [api, setApi] = useState();

  const chartRef = useRef();

  useEffect(() => {
    const api = WorkspaceAPI.connect(window.parent, (event, data) => {
      setEvent(event);
      setData(data);
    });
    setApi(api);
  }, []);

  const allSattus_1 = async () => {
    setDeliveriedCount(0);
    setFabricatedCount(0);
    setFabricatingCount(0);
    setNotYetStartedCount(0);
    if (typeof data === "undefined" || typeof data.data === "undefined" || typeof data.data.length === "undefined" || data.data.length === 0) {
      message.error("Please select models to apply representation");
      return;
    }

    const model_ids = data.data.map((x) => x.modelId);
    api.then(async (tcapi) => {
      const object_selector = {
        parameter: {
          class: "IFCELEMENTASSEMBLY",
        },
      };
      const objects = await tcapi.viewer.getObjects(object_selector);
      objects.forEach(async (model) => {
        const modelId = model.modelId;
        if (model_ids.indexOf(modelId) < 0) return;
        const objects_id = model.objects.map((x) => x.id);
        const elements = await tcapi.viewer.getObjectProperties(modelId, objects_id);
        const model_objects = await elements.map((x) => {
          const properties = x.properties;
          let weight = 0;
          let fab_status = "Not Yet Started";
          properties.forEach((p) => {
            if (p.name === "ASSEMBLY") {
              p.properties.forEach((a) => {
                if (
                  a.name === "TS_FAB_Contractor_Comment"
                ) {
                  fab_status = a.value;
                  return true;
                }
                else if (a.name === "WEIGHT") {
                  weight = Number(a.value) / 1000;
                  return true;
                }
              });
            }
          });
          return {
            modelId: modelId,
            objId: x.id,
            status: fab_status,
            weight: weight
          }
        })
        setModelObjects([...modelObjects, ...model_objects])
        await FabData.forEach(x => {

          tcapi.viewer.setObjectState(
            {
              modelObjectIds: [
                {
                  modelId: model_objects[0].id,
                  objectRuntimeIds: model_objects.filter(e => e.status === x.Status).map(e => e.objId),
                },
              ],
            },
            {
              color: x.TC_Color,
              visible: true,
            }
          );
        })
      });



    });
  };
  const allSattus = async () => {
    setDeliveriedCount(0);
    setFabricatedCount(0);
    setFabricatingCount(0);
    setNotYetStartedCount(0);
    if (typeof data === "undefined" || typeof data.data === "undefined" || typeof data.data.length === "undefined" || data.data.length === 0) {
      message.error("Please select models to apply representation");
      return;
    }

    const model_ids = data.data.map((x) => x.modelId);
    api.then(async (tcapi) => {
      const object_selector = {
        parameter: {
          class: "IFCELEMENTASSEMBLY",
        },
      };
      const objects = await tcapi.viewer.getObjects(object_selector);
      let fabricated_ids = [];
      let fabricating_ids = [];
      let deliveried_ids = [];
      objects.forEach(async (model) => {
        const modelId = model.modelId;
        if (model_ids.indexOf(modelId) < 0) return;
        const objects_id = model.objects.map((x) => x.id);
        tcapi.viewer.getObjectProperties(modelId, objects_id).then((data) => {
          data.forEach((x) => {
            const properties = x.properties;
            let weight = 0;
            let asm_pos;
            let fab_status;
            properties.forEach((p) => {
              if (p.name === "ASSEMBLY") {
                p.properties.forEach((a) => {
                  if (
                    a.name === "TS_FAB_Contractor_Comment" &&
                    a.value === "In Fabrication"
                  ) {
                    fabricating_ids.push(x.id);
                    fab_status = "In Fabrication"
                    return true;
                  } else if (a.name === "TS_FAB_Contractor_Comment" &&
                    a.value === "Fabricated") {
                    fabricated_ids.push(x.id);
                    fab_status = "Fabricated"
                    return true;
                  }
                  else if (a.name === "TS_FAB_Contractor_Comment" &&
                    a.value === "Deliveried") {
                    deliveried_ids.push(x.id);
                    fab_status = "Deliveried"
                    return true;
                  }
                  else if (a.name === "WEIGHT") {
                    weight = Number(a.value) / 1000;
                    return true;
                  }
                  else if (a.name === "ASSEMBLY_POS") {
                    asm_pos = a.value
                    return true;
                  }
                });
              }
            });
            setModelObjects([...modelObjects, {
              modelId: modelId,
              objId: x.id,
              status: fab_status,
              weight: weight
            }])
            if (fab_status === "Deliveried") {
              setDeliveriedCount((x) => x + weight);
            } else if (fab_status === "Fabricated") {
              setFabricatedCount((x) => x + weight);
            } else if (fab_status === "In Fabrication") {
              setFabricatingCount((x) => x + weight);
            } else {
              setNotYetStartedCount((x) => x + weight);
            }
          });
          tcapi.viewer.setObjectState(
            {
              modelObjectIds: [
                {
                  modelId: modelId,
                  objectRuntimeIds: objects_id,
                },
              ],
            },
            {
              color: FabData.filter(x => x.Status === "Not Yet Started")[0].TC_Color,
              visible: true,
            }
          );
          tcapi.viewer.setObjectState(
            {
              modelObjectIds: [
                {
                  modelId: modelId,
                  objectRuntimeIds: deliveried_ids,
                },
              ],
            },
            {
              color: FabData.filter(x => x.Status === "Deliveried")[0].TC_Color,
              visible: true,
            }
          );
          tcapi.viewer.setObjectState(
            {
              modelObjectIds: [
                {
                  modelId: modelId,
                  objectRuntimeIds: fabricated_ids,
                },
              ],
            },
            {
              color: FabData.filter(x => x.Status === "Fabricated")[0].TC_Color,
              visible: true,
            }
          );
          tcapi.viewer.setObjectState(
            {
              modelObjectIds: [
                {
                  modelId: modelId,
                  objectRuntimeIds: fabricating_ids,
                },
              ],
            },
            {
              color: FabData.filter(x => x.Status === "In Fabrication")[0].TC_Color,
              visible: true,
            }
          );
        });
      });
    });
  };

  const pieceClick = (event) => {
    const chart = chartRef.current;
    const a = getDatasetAtEvent(chart, event)
    console.log(a)
  }

  return (
    <Layout style={{ backgroundColor: "#ffffff" }}>
      <Content style={{ padding: "10px" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            flexWrap: "wrap",
            rowGap: "5px",
            columnGap: "5px",
          }}
        >
          <Button type="primary" onClick={allSattus}>
            Fabrication Status
          </Button>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            flexWrap: "wrap",
            rowGap: "5px",
            columnGap: "5px",
            height: "300px",
            width: "300px",
          }}
        >
          <Pie
            width={"50px"}
            height={"50px"} ref={chartRef}
            data={{
              labels: fab_Statues,
              datasets: [
                {
                  label: "Fabrication Status",
                  data: [notYetStartedCount, deliveriedCount, fabricatedCount, fabricatingCount],
                  backgroundColor: fab_Colors,
                  borderColor: fab_Colors,
                  borderWidth: 1,
                },
              ],
            }}
            onClick={pieceClick}
          />
        </div>
      </Content>
    </Layout>
  );
};

export default UpdateStatus;
