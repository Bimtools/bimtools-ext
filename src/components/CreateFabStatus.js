import React, { useEffect, useState } from 'react'
import { Input, Divider, Typography, Button, List, message, Dropdown, Select, Form, Modal, Popconfirm } from 'antd';
import { DeleteFilled, EditFilled, FileAddOutlined } from '@ant-design/icons';
import * as WorkspaceAPI from "trimble-connect-workspace-api";
import { useDispatch, useSelector } from "react-redux";
import { CreateFabStatusRequest, DeleteFabStatusRequest, GetFabStatusRequest } from '../store/fabStatus/action';
import { ColorOptions } from '../services/Color';
import { Colorpicker } from 'antd-colorpicker'

const { Text } = Typography;
const { Option } = Select;
const CreateFabStatus = () => {
    const dispatch = useDispatch();
    const [option, setOption] = useState(1);
    const [fabStatus, setFabStatus] = useState('');
    const [projectId, setProjectId] = useState('')
    const [colorDialog, setColorDialog] = useState(false)
    const [color, setColor] = useState({
        rgb: {
            r: 248,
            b: 234,
            g: 28
        }
    })
    const fabStatuses = useSelector(state => state.fabStatus.payload);
    const loading = useSelector(state => state.fabStatus.pending);
    useEffect(() => {
        async function getProjectId() {
            const tcapi = await WorkspaceAPI.connect(window.parent)
            const project = await tcapi.project.getProject()
            setProjectId(project.id)
        }
        getProjectId()
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
                <Text ellipsis style={{ width: '60px'}} >Status</Text>
                <Input placeholder="Fabrication Status" onChange={(e) => setFabStatus(e.target.value)} />
                <div
                    style={{
                        display: "flex",
                        alignItems: 'center',
                        flexDirection: "row",
                        columnGap: '2px'
                    }}>
                    <div type="primary" onClick={() => setColorDialog(!colorDialog)} style={{
                        background: `rgb(${color.rgb.r ?? 0},${color.rgb.g ?? 0},${color.rgb.b ?? 0})`
                    }}>          </div>
                    <Modal title="Color" open={colorDialog} footer={null} onCancel={() => {
                        setColorDialog(!colorDialog)
                    }
                    }>
                        <Colorpicker value={color} onChange={(value) => {
                            setColor(value)
                        }} />
                    </Modal>
                    {option == 1 ? <Button type="primary" icon={<FileAddOutlined />} onClick={() => {
                        const payload = {
                            projectId: projectId,
                            fabStatus: {
                                isPublic: true,
                                name: fabStatus + '=' + `rgb(${color.rgb.r ?? 0},${color.rgb.g ?? 0},${color.rgb.b ?? 0})`,
                                allowedValues: "Completed"
                            }
                        }
                        dispatch(CreateFabStatusRequest(payload))
                    }} /> : null}
                    {option == 2 ? <Button type="primary" icon={<EditFilled />} /> : null}
                </div>

            </div>
            <List
                dataSource={fabStatuses}
                loading={loading}
                renderItem={(item) => (
                    <List.Item style={{
                        background: item.name.split('=')[1],
                        marginTop: '5px',
                        marginBottom: '5px',
                        height: '40px'
                    }} >
                        <Text ellipsis >{item.name.split('=')[0]}</Text>
                        <Popconfirm
                            placement="left"
                            title="Delete the status"
                            description="Are you sure to delete this status?"
                            onConfirm={() => {
                                dispatch(DeleteFabStatusRequest({
                                    projectId: projectId,
                                    id: item.id
                                }))
                            }}
                            okText="Yes"
                            cancelText="No"
                        >
                            <Button type="primary" danger icon={<DeleteFilled />} />
                        </Popconfirm>
                    </List.Item>
                )}
            />
        </>
    )
}

export default CreateFabStatus