import React, { useEffect, useState } from 'react'
import { Input, Divider, Typography, Button, List, message, Select } from 'antd';
import * as WorkspaceAPI from "trimble-connect-workspace-api";
import { useDispatch, useSelector } from "react-redux";
import { GetObjFabStatusRequest, RepresentObjFabStatusRequest, RepresentObjFabStatusSuccess, UpdateObjFabStatusRequest, UpdateObjFabStatusSuccess } from '../store/objFabStatus/action';
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
              return <Select.Option key={key} value={key}>{key}</Select.Option>
            })}
          </Select>
        </div>
        <Button type="primary" disabled={loading} onClick={async () => {
          dispatch(RepresentObjFabStatusRequest())
          const models = await tcapi.viewer.getObjects({
            parameter: {
              class: "IFCELEMENTASSEMBLY",
            },
          })
          // const obj_fab_status_by_date = objFabStatuses.filter(x => x.reportDate.startsWith(reportDate))

          models.map(async x => {
            const object_ids = x.objects.map(a => a.id);
            const items = await tcapi.viewer.getObjectProperties(x.modelId, object_ids)
            let objects_have_fab_status = []
            let model_objects = []
            var total_weight = 0
            console.log(items);
            items.forEach(item => {
              const properties = item.properties
              let guid = ''
              let weight = 0;
              let objType = ''
              properties.every(property => {
                if (property.name === 'ASSEMBLY') {
                  
                  const asm_properties = property.properties
                  asm_properties.every(asm_property => {
                    if (guid !== '' && weight > -1) return false
                    if (asm_property.name === 'GUID') {
                      guid = asm_property.value
                    }
                    else if (asm_property.name === "WEIGHT") {
                      weight = Number(asm_property.value);
                    }
                    return true
                  })
                  return false
                } else if (property.name === 'Tekla Assembly') {
                  const asm_properties = property.properties
                  asm_properties.every(asm_property => {
                    if (asm_property.name === 'Cast unit type') {
                      objType ='CONCRETE'
                    }
                    else if (asm_property.name === "WEIGHT") {
                      weight = Number(asm_property.value);
                    }
                    return true
                  })
                  return false
                }
                return true
              })

              if (typeof weight === 'undefined') weight = 0
              total_weight += weight
              model_objects.push({
                modelId: x.modelId,
                guid: guid,
                id: item.id,
                weight: weight,
              })
              //Get objects which have a fabrication status
              const matched_obj = objFabStatuses.filter(obj => obj.guid == guid && obj.reportDate.startsWith(reportDate))
              if (matched_obj.length === 0) {
                objects_have_fab_status.push({
                  id: item.id,
                  weight: weight,
                  color: `rgb(153,153,153)`
                })
              } else {
                const matched_fab_statuses = fabStatuses.filter(a => a.id === matched_obj[0].statusActionId)
                const color = matched_fab_statuses[0].name.split('=')[1]
                objects_have_fab_status.push({
                  id: item.id,
                  color: color
                })
              }
            })
            //Set fab status color
            console.log(objects_have_fab_status)
            const group_by_color = Object.groupBy(objects_have_fab_status, ({ color }) => color)
            Object.entries(group_by_color).forEach(function ([key, value]) {
              var numberPattern = /\d+/g
              const rgb_digits = key.match(numberPattern)
              let transparency = 255
              if (key === 'rgb(153,153,153)') transparency = 50
              const objects_id = value.map(a => { return a.id })
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
                    a: transparency
                  },
                  visible: true,
                }
              );
            })

            var all_status = fabStatuses.map(x => {
              return {
                id: x.id,
                status: x.name.split('=')[0],
                color: x.name.split('=')[1],
              }
            })
            const report_dates = Object.entries(Object.groupBy(objFabStatuses, ({ reportDate }) => moment(reportDate).format('YYYY-MM-DD'))).map(function ([key, value]) {
              return key
            })
            let datasets = []
            all_status.forEach(x => {
              const weights = report_dates.map(k => {
                const obj_fab_status_by_date = objFabStatuses.filter(a => a.reportDate.startsWith(k) && a.statusActionId === x.id)
                console.log(obj_fab_status_by_date)
                let weight = 0;

                obj_fab_status_by_date.forEach(t => {
                  const existing = model_objects.filter(x => x.guid === t.guid)
                  if (existing.length > 0) weight += existing[0].weight
                })
                return weight
              })
              console.log(weights)
            });

          })
          dispatch(RepresentObjFabStatusSuccess())
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
      {/* {typeof reportData !== 'undefined' ? (<Bar options={options} data={{
        labels: Object.entries(Object.groupBy(objFabStatuses, ({ reportDate }) => moment(reportDate).format('YYYY-MM-DD'))).map(function ([key, value]) {
          return key
        })
      }} />) : null} */}
    </>
  )
}

export default FabStatusReport