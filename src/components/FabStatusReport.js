import React, { useEffect, useState } from 'react'
import { Input, Divider, Typography, Button, List, message, Select } from 'antd';
import * as WorkspaceAPI from "trimble-connect-workspace-api";
import { useDispatch, useSelector } from "react-redux";
import { GetObjFabStatusRequest } from '../store/objFabStatus/action';
import { Option } from 'antd/es/mentions';
import moment from 'moment';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

const { Text } = Typography;
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);
export const options = {
  plugins: {
    title: {
      display: true,
      text: 'Fabrication Status Report',
    },
  },
  responsive: true,
  scales: {
    x: {
      stacked: true,
    },
    y: {
      stacked: true,
    },
  },
};
const FabStatusReport = () => {
  const dispatch = useDispatch();
  const [projectId, setProjectId] = useState('')
  const [tcapi, setTcapi] = useState();
  const [reportDate, setReportDate] = useState();
  const [reportData, setReportData] = useState()

  const fabStatuses = useSelector(state => state.fabStatus.payload);
  const objFabStatuses = useSelector(state => state.objFabStatus.payload);
  const loading = useSelector(state => state.objFabStatus.pending);
  useEffect(() => {
    async function getProjectId() {
      const tcapi = await WorkspaceAPI.connect(window.parent)
      const project = await tcapi.project.getProject()
      fabStatuses.every(x => {
        const payload = {
          projectId: projectId,
          statusActionId: x.id,
        }
        dispatch(GetObjFabStatusRequest(payload))
        return true
      })
      setProjectId(project.id)
      setTcapi(tcapi)
    }
    getProjectId()
  }, [])
  return (
    <>
      <Divider>Fabrication Status Report</Divider>
      <div
        containeer
        style={{
          display: "flex",
          flexDirection: 'row',
          justifyContent: 'space-between',
          flexWrap: "wrap",
          columnGap: "5px",
          rowGap: "5px",
          margin: '2px'
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: 'row',
            justifyContent: 'center',
          }}
        >
          <Select placeholder='Report Date' value={reportDate} onChange={(e) => setReportDate(e)}>
            {Object.entries(Object.groupBy(objFabStatuses, ({ reportDate }) => moment(reportDate).format('YYYY-MM-DD'))).map(function ([key, value]) {
              console.log(key, value)
              return <Option key={key} value={key}>{key}</Option>
            })}
          </Select>
        </div>
        <Button type="primary" disabled={loading} onClick={async () => {
          const models = await tcapi.viewer.getObjects({
            parameter: {
              class: "IFCELEMENTASSEMBLY",
            },
          })
          // const obj_fab_status_by_date = objFabStatuses.filter(x => x.reportDate.startsWith(reportDate))
          const obj_fab_status_data=[]
          var total_model_obj=0;
          models.forEach(async x => {
            const object_ids = x.objects.map(a => a.id);
            total_model_obj+=object_ids.length
            const items = await tcapi.viewer.getObjectProperties(x.modelId, object_ids)
            let objects_have_fab_status = []
            items.forEach(item => {
              const properties = item.properties
              let guid = ''
              let weight = -1;
              properties.every(property => {
                if (property.name === 'ASSEMBLY') {
                  const asm_properties = property.properties
                  asm_properties.every(asm_property => {
                    if (guid !== '' && weight > -1) return false
                    if (asm_property.name === 'GUID') {
                      guid = asm_property.value
                    }
                    else if (asm_property.name === "WEIGHT") {
                      weight = Number(asm_property.value) / 1000;
                    }
                    return true
                  })
                  return false
                }
                return true
              })
              //Get objects which have a fabrication status
              const matched_obj = objFabStatuses.filter(obj => obj.guid == guid && obj.modelId === x.modelId)
              if (matched_obj.length === 0) {
                objects_have_fab_status.push({
                  id: item.id,
                  weight: weight,
                  color: `rgb(153,153,153)`
                })
                obj_fab_status_data.push({
                  modelId:x.modelId,
                  id:item.id,
                  weight:weight,
                  status:'Not Yet Started',
                  color: `rgb(153,153,153)`,
                  reportDate:matched_obj[0].reportDate
                })
              } else {
                const matched_fab_statuses = fabStatuses.filter(a => a.id === matched_obj[0].statusActionId)
                const status = matched_fab_statuses[0].name.split('=')[0]
                const color = matched_fab_statuses[0].name.split('=')[1]
                objects_have_fab_status.push({
                  id: item.id,
                  color: color
                })
                obj_fab_status_data.push({
                  modelId:x.modelId,
                  id:item.id,
                  weight:weight,
                  status:status,
                  color: color,
                  reportDate:matched_obj[0].reportDate
                })
              }
            })

            // //Set fab status color
            // const group_by_color = Object.groupBy(objects_have_fab_status, ({ color }) => color)
            // Object.entries(group_by_color).forEach(function ([key, value]) {
            //   var numberPattern = /\d+/g
            //   const rgb_digits = key.match(numberPattern)
            //   let transparency = 255
            //   if (key === 'rgb(153,153,153)') transparency = 50
            //   const objects_id = value.map(a => { return a.id })
            //   tcapi.viewer.setObjectState(
            //     {
            //       modelObjectIds: [
            //         {
            //           modelId: x.modelId,
            //           objectRuntimeIds: objects_id,
            //         },
            //       ],
            //     },
            //     {
            //       color: {
            //         r: rgb_digits[0],
            //         g: rgb_digits[1],
            //         b: rgb_digits[2],
            //         a: transparency
            //       },
            //       visible: true,
            //     }
            //   );
            // })
          })

          console.log(obj_fab_status_data)

        }}>Representation</Button>
      </div>
      <List style={{
        marginLeft: '5px',
        marginRight: '5px',
      }}
        dataSource={fabStatuses}
        loading={loading}
        renderItem={(item) => (
          <List.Item
            style={{
              background: item.name.split('=')[1],
              marginTop: '5px',
              marginBottom: '5px',
              height: '40px'
            }}
          >
            <Text ellipsis style={{ marginLeft: '5px' }} >{item.name.split('=')[0]}</Text>
          </List.Item>
        )}
      />
      {typeof reportData !=='undefined'?(<Bar options={options} data={reportData} />):null}
    </>
  )
}

export default FabStatusReport