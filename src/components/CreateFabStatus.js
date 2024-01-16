import React, { useEffect, useState } from 'react'
import { Input, Divider, Typography, Button, List, message } from 'antd';
import { DeleteFilled, EditFilled, FileAddOutlined } from '@ant-design/icons';
import * as WorkspaceAPI from "trimble-connect-workspace-api";
import axios, { AxiosError, AxiosResponse } from "axios";
const { Text } = Typography;
const CreateFabStatus = () => {
    const [option, setOption] = useState(1);
    const [fabStatus, setFabStatus] = useState('');
    const [fabStatuses, setFabStatuses] = useState([]);
    const [projectId, setProjectId] = useState('')
    // useEffect(async () => {
    //     const tcapi = await WorkspaceAPI.connect(window.parent)
    //     console.log(tcapi)
    // })
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
                    const polysus_fab_status_token = localStorage.getItem('polysus_fab_status_token')
                    axios.post(`${process.env.REACT_APP_SHARING_API_URI}/projects/${projectId}/statusactions`,
                        {
                            isPublic: true,
                            name: fabStatus,
                            allowedValues: "Completed"
                        },
                        {
                            headers: {
                                Authorization: `Bearer ${polysus_fab_status_token}`,
                            },
                        }
                    ).then(async response => {
                        console.log(response)
                        if (response.status === 201) {
                            message.success(`New fabrication status: ${fabStatus} has been created`)
                            setFabStatuses([...fabStatuses, {
                                name: fabStatus,
                                id: response.data.id
                            }])
                        } else {
                            message.error('Create new status failed')
                        }
                    }).catch(error => {
                        //message.error('Create new status failed')
                    })
                }} /> : null}
                {option == 2 ? <Button type="primary" icon={<EditFilled />} /> : null}
            </div>
            <List style={{
                marginLeft: '5px',
                marginRight: '5px',
            }}
                renderItem={(item) => (
                    <List.Item>
                        <Text ellipsis style={{ width: '60px' }}>{item.name}</Text>
                        <Button type="primary" danger icon={<DeleteFilled />} />
                    </List.Item>
                )}
            />
        </>
    )
}

export default CreateFabStatus