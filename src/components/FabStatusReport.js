import React, { useEffect, useState } from 'react'
import { Input, Divider, Typography, Button, List, message, Select } from 'antd';
import * as WorkspaceAPI from "trimble-connect-workspace-api";
import { useDispatch, useSelector } from "react-redux";
import { GetObjFabStatusRequest, RepresentObjFabStatusRequest, RepresentObjFabStatusSuccess, UpdateObjFabStatusRequest, UpdateObjFabStatusSuccess } from '../store/objFabStatus/action';
import moment from 'moment';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

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
        minRotation: 90
      }
    }
  },
  responsive: true,
  plugins: {
    legend: {
      position: 'top',
    },
    title: {
      display: true,
      text: 'Fabrication Status',
    },
  },
};

const FabStatusReport = () => {
  const dispatch = useDispatch();
  const [projectId, setProjectId] = useState('')
  const [tcapi, setTcapi] = useState();
  const [reportDate, setReportDate] = useState();
  const [reportData, setReportData] = useState()
  const [reportDates, setReportDates] = useState([])

  const fabStatuses = useSelector(state => state.fabStatus.payload);
  const objFabStatuses = useSelector(state => state.objFabStatus.payload);
  const modelStatuses = useSelector(state => state.objFabStatus.objects);
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
          <Select placeholder='Report Date' value={reportDate} onChange={(e) => {
            setReportDate(e)
          }
          }>
            {Object.entries(Object.groupBy(objFabStatuses, ({ reportDate }) => moment(reportDate).format('YYYY-MM-DD'))).map(function ([key, value]) {
              return <Select.Option key={key} value={key}>{key}</Select.Option>
            })}
          </Select>
        </div>
        <Button type="primary" disabled={loading} onClick={async () => {
          dispatch(RepresentObjFabStatusSuccess([]))
          dispatch(RepresentObjFabStatusRequest())
          const models = await tcapi.viewer.getObjects({
            parameter: {
              class: "IFCELEMENTASSEMBLY",
            },
          })
          models.map(async x => {
            const object_ids = x.objects.map(a => a.id);
            const items = await tcapi.viewer.getObjectProperties(x.modelId, object_ids)
            let objects_have_fab_status = []
            items.forEach(item => {
              const properties = item.properties
              let asm_pos = ''
              properties.every(property => {
                if (property.name === 'ASSEMBLY') {
                  const asm_properties = property.properties
                  asm_properties.every(asm_property => {
                    if (asm_pos !== '') return false
                    if (asm_property.name.trim() === 'ASSEMBLY_POS') {
                      asm_pos = asm_property.value
                    }
                    return true
                  })
                  return false
                } else if (property.name.trim() === 'Tekla Assembly') {
                  const asm_properties = property.properties
                  asm_properties.every(asm_property => {
                    if (asm_pos !== '') return false
                    if (asm_property.name.trim() === 'Assembly/Cast unit Mark') {
                      asm_pos = asm_property.value
                    }
                    return true
                  })
                  return false
                }
                return true
              })
              //Get objects which have a fabrication status
              const matched_obj = objFabStatuses.filter(obj => obj.asm_pos == asm_pos && obj.reportDate.startsWith(reportDate) && typeof obj.statusActionId !== 'undefined')
              if (matched_obj.length === 0) {
                objects_have_fab_status.push({
                  modeId: x.modelId,
                  id: item.id,
                  color: `rgb(153,153,153)`,
                  status: "Not yet started",
                  statusId: '-1',
                  reportDate: reportDate,
                  asm_pos: asm_pos,
                })
              } else {
                const matched_fab_statuses = fabStatuses.filter(a => a.id === matched_obj[0].statusActionId)
                const color = matched_fab_statuses[0].name.split('=')[1]
                const status = matched_fab_statuses[0].name.split('=')[0]
                const fab_qty = Number(matched_obj[0].fab_qty)
                const existing_asm_pos = objects_have_fab_status.filter(obj => obj.asm_pos === asm_pos)
                if (existing_asm_pos.length < fab_qty || fab_qty === 0) {
                  objects_have_fab_status.push({
                    modeId: x.modelId,
                    id: item.id,
                    color: color,
                    status: status,
                    statusId: matched_obj[0].statusActionId,
                    reportDate: reportDate,
                    asm_pos: asm_pos,
                  })
                }
              }
            })
            //Set fab status color
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
            dispatch(RepresentObjFabStatusSuccess(objects_have_fab_status))
          })
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
            onClick={() => {
              console.log(modelStatuses)
              const matched_obj = modelStatuses.filter(obj => obj.statusId == item.id && obj.reportDate.startsWith(reportDate))
              const group_by_model_id = Object.groupBy(matched_obj, ({ modeId }) => modeId)
              console.log(group_by_model_id)
              let objs_by_status = []
              Object.entries(group_by_model_id).forEach(function ([key, value]) {
                console.log(key)
                const objects_id = value.map(a => { return a.id })
                objs_by_status.push({
                  modelId: key,
                  objectRuntimeIds: objects_id,
                })
              })
              tcapi.viewer.setSelection(
                {
                  modelObjectIds: [
                    ...objs_by_status,
                  ],
                }, 'set'
              );
            }}
          >
            <Text ellipsis style={{ marginLeft: '5px' }} >{item.name.split('=')[0]}</Text>
          </List.Item>
        )}
      />
      <div
        style={{
          display: "flex",
          flexDirection: 'row',
          justifyContent: 'flex-end',
          margin: '5px'
        }}
      >
        <Button type="primary" onClick={() => {
          let report_dates = []
          let datasets = []
          //Group by status
          const group_by_status = Object.groupBy(objFabStatuses, ({ statusActionId }) => statusActionId)
          Object.entries(group_by_status).forEach(function ([key, value]) {
            const matched_fab_statuses = fabStatuses.filter(a => a.id === key)
            const color = matched_fab_statuses[0].name.split('=')[1]
            const status = matched_fab_statuses[0].name.split('=')[0]
            //Group by report date
            const group_by_date = Object.groupBy(value, ({ reportDate }) => reportDate)
            let data = []
            Object.entries(group_by_date).forEach(function ([key, value]) {
              const report_date = key.substring(0, 10)
              if (!report_dates.includes(report_date)) {
                report_dates.push(report_date)
              }
              const weight = value.reduce((accumulator, object) => {
                return accumulator + object.asm_weight;
              }, 0);
              if (isNaN(weight)) {
                data.push(0)
              } else {
                data.push(weight)
              }

            })
            datasets.push({
              label: status,
              data: data,
              borderColor: color,
              backgroundColor: color
            })
          })
          console.log(datasets)
          console.log(report_dates)
          setReportData({
            labels: report_dates,
            datasets: datasets
          })
          console.log(reportData)
        }}>
          Fabrication Report
        </Button>
      </div>
      {typeof reportData !== 'undefined' ? (<Line options={options} data={reportData} />) : null}
    </>
  )
}

export default FabStatusReport