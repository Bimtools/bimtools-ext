import React, { useEffect, useState } from 'react'
import { Input, Divider, Typography, Button, List, message, Dropdown, Select } from 'antd';
import { DeleteFilled, EditFilled, FileAddOutlined } from '@ant-design/icons';
import * as WorkspaceAPI from "trimble-connect-workspace-api";
import { useDispatch, useSelector } from "react-redux";
import { CreateFabStatusRequest, DeleteFabStatusRequest, GetFabStatusRequest } from '../store/fabStatus/action';
import { ColorOptions } from '../services/Color';

const { Text } = Typography;
const { Option } = Select;
const CreateFabStatus = () => {
    const dispatch = useDispatch();
    const [option, setOption] = useState(1);
    const [fabStatus, setFabStatus] = useState('');
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
            <Divider>Create Fabrication Status</Divider>
            <div
                style={{
                    display: "flex",
                    alignItems: 'center',
                    flexDirection: "row",
                    justifyContent: 'space-between',
                    marginTop: '5px',
                    marginLeft: '5px',
                    marginRight: '5px',
                    columnGap: '2px'
                }}>
                <Text ellipsis style={{ width: '60px' }}>Status</Text>
                <Input placeholder="Fabrication Status" onChange={(e) => setFabStatus(e.target.value)} />
                {option == 1 ? <Button type="primary" icon={<FileAddOutlined />} onClick={() => {
                    const payload = {
                        projectId: projectId,
                        fabStatus: {
                            isPublic: true,
                            name: fabStatus,
                            allowedValues: "Completed"
                        }
                    }
                    dispatch(CreateFabStatusRequest(payload))
                }} /> : null}
                {option == 2 ? <Button type="primary" icon={<EditFilled />} /> : null}
            </div>
            <List style={{
                marginLeft: '5px',
                marginRight: '5px',
            }}
                dataSource={fabStatuses}
                loading={loading}
                renderItem={(item) => (
                    <List.Item >
                        <Text ellipsis >{item.name}</Text>
                        <Select
                            placeholder="Select color"
                        >
                            {ColorOptions.forEach(x => { return <Option/> })}
                        </Select>
                        <Button type="primary" danger icon={<DeleteFilled />} onClick={() => {
                            dispatch(DeleteFabStatusRequest({
                                projectId: projectId,
                                id: item.id
                            }))
                        }} />
                    </List.Item>
                )}
            />
        </>
    )
}

export default CreateFabStatus