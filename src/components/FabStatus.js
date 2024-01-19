import React, { useEffect, useState } from 'react'
import { Button, Layout, Menu, } from 'antd';
import {
    CloudUploadOutlined,
    PieChartFilled,
    MoreOutlined,
    FileAddOutlined,
} from "@ant-design/icons";
import UpdateFabStatus from './UpdateFabStatus';
import FabStatusReport from './FabStatusReport';
import CreateFabStatus from './CreateFabStatus';
import * as WorkspaceAPI from "trimble-connect-workspace-api";
import { useDispatch, useSelector } from 'react-redux';
import { GetFabStatusRequest } from '../store/fabStatus/action';
import { GetObjFabStatusRequest } from '../store/objFabStatus/action';

const FabStatus = () => {
    const [option, setOption] = useState(4)
    const [projectId, setProjectId] = useState('')
    const fabStatuses = useSelector(state => state.fabStatus.payload);
    const loading = useSelector(state => state.fabStatus.loading);
    const dispatch = useDispatch();
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
        <Layout>
            <div
                style={{
                    background: '#00a2ff',
                    height: '50px',
                    display: "flex",
                    alignItems: 'center',
                    flexDirection: "row",
                    justifyContent: "space-between",
                    paddingLeft: '10px',
                    paddingRight: '10px',
                }}
            >
                <div
                    style={{
                        fontSize: '20px',
                        color: "#ffffff",
                        textAlign: "center",
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}
                >
                    Polysus-Fabrication Status
                </div>
                <div
                    style={{
                        display: "flex",
                        alignItems: 'center',
                        flexDirection: "row",
                        marginTop: '5px',
                        marginLeft: '5px',
                        marginRight: '5px',
                        columnGap: '2px'
                    }}>
                    <Menu
                        style={{
                            background: '#00a2ff',
                            color: "#ffffff",
                        }}
                        mode="horizontal"
                        items={[
                            {
                                key: 'Options',
                                icon: <MoreOutlined />,
                                children: [
                                    {
                                        label: 'Fabrication Status Report',
                                        key: 1,
                                        icon: <PieChartFilled />,
                                        onClick: (e) => {
                                            fabStatuses.every(x => {
                                                const payload = {
                                                    projectId: projectId,
                                                    statusActionId: x.id,
                                                }
                                                dispatch(GetObjFabStatusRequest(payload))
                                                return true
                                            })
                                            setOption(e.key)
                                        }
                                    },
                                    {
                                        label: 'Update Fabrication Status',
                                        key: 2,
                                        icon: <CloudUploadOutlined />,
                                        onClick: (e) => { setOption(e.key) }
                                    },
                                    {
                                        label: 'Create Fabrication Status',
                                        key: 3,
                                        icon: <FileAddOutlined />,
                                        onClick: (e) => {
                                            setOption(e.key)
                                        }
                                    },
                                ]
                            }
                        ]} />
                </div>
            </div>
            <Layout>
                {
                    option == 1 ? <FabStatusReport /> : null
                }
                {
                    option == 2 ? <UpdateFabStatus /> : null
                }
                {
                    option == 3 ? <CreateFabStatus /> : null
                }
                {
                    option==4?<div></div>:null
                }
            </Layout>
        </Layout >
    )
}

export default FabStatus