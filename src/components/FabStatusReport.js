import React, { useEffect, useState } from 'react'
import { Input, Divider, Typography, Button, List, message } from 'antd';
import * as WorkspaceAPI from "trimble-connect-workspace-api";
import { useDispatch, useSelector } from "react-redux";
import { GetFabStatusRequest } from '../store/fabStatus/action';
import { GetObjFabStatusRequest } from '../store/objFabStatus/action';
import axios from 'axios';

const { Text } = Typography;
const FabStatusReport = () => {
  const dispatch = useDispatch();
  const [projectId, setProjectId] = useState('')

  const fabStatuses = useSelector(state => state.fabStatus.payload);
  const loading = useSelector(state => state.fabStatus.loading);
  useEffect(() => {
   
    async function fetchStatus() {
      const tcapi = await WorkspaceAPI.connect(window.parent)
      const project = await tcapi.project.getProject()
      setProjectId(project.id)
      dispatch(GetFabStatusRequest({
        projectId: project.id
      }))
    }
    fetchStatus()
  }, [])
  return (
    <>
      <Divider>Fabrication Status Report</Divider>
      <List style={{
        marginLeft: '5px',
        marginRight: '5px',
      }}
        dataSource={fabStatuses}
        loading={loading}
        renderItem={(item) => (
          <List.Item>
            <Text ellipsis >{item.name}</Text>
          </List.Item>
        )}
      />
      <div
        containeer
        style={{
          display: "flex",
          flexDirection: "row-reverse",
          flexWrap: "wrap",
          columnGap: "5px",
          rowGap: "5px",
          margin: '2px'
        }}
      >
        <Button type="primary" onClick={() => {
          
        }}>Representation</Button>
      </div>
    </>
  )
}

export default FabStatusReport