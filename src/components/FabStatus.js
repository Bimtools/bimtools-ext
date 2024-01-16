import React, { useEffect, useState } from 'react'
import { Button, Layout, Menu, message, Upload } from 'antd';
import {
    CloudUploadOutlined,
    PieChartFilled,
    MoreOutlined,
    FileAddOutlined,
} from "@ant-design/icons";
import UpdateFabStatus from './UpdateFabStatus';
import FabStatusReport from './FabStatusReport';
import CreateFabStatus from './CreateFabStatus';
import axios from 'axios';

const FabStatus = () => {
    const [option, setOption] = useState(1)
    const clientId = process.env.REACT_APP_CLIENT_ID;
    const redirectUri = process.env.REACT_APP_REDIRECT_URI;
    const scope = `openid ${process.env.REACT_APP_SHARING_APP_NAME}`;
    useEffect(() => {
        const polysus_token_data = localStorage.getItem('polysus_token')
        if (polysus_token_data === null) {
            const urlParams = new URLSearchParams(window.location.search);
            const authorizationCode = urlParams.get('code');
            if (authorizationCode) {
                const tokenEndpoint = process.env.REACT_APP_TC_TOKEN_ENDPOINT;
                const clientSecret = process.env.REACT_APP_CLIENT_SECRET;
                const data = new URLSearchParams();
                data.append('grant_type', 'authorization_code');
                data.append('code', authorizationCode);
                data.append('client_id', clientId);
                data.append('client_secret', clientSecret);
                data.append('redirect_uri', redirectUri);
                axios.post(tokenEndpoint, data)
                    .then(async response => {
                        const data = await response.data
                        localStorage.setItem('polysus_token', JSON.stringify(data))
                        const accessToken = data.access_token;
                        const res_status_token = await axios.post(
                            `${process.env.REACT_APP_SHARING_API_URI}/auth/token`,
                            {},
                            {
                                headers: {
                                    Authorization: `Bearer ${accessToken}`,
                                },
                            }
                        );
                        const status_token = res_status_token.data;
                        localStorage.setItem('polysus_fab_status_token', status_token)
                    })
                    .catch(error => {
                        console.error(error);
                    });
            }
        }
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
                <div>
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
                                        onClick: (e) => { setOption(e.key) }
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
                                            const polysus_token_data = localStorage.getItem('polysus_token')
                                            if (polysus_token_data == null) {
                                                const authorizationUrl = `https://id.trimble.com/oauth/authorize/?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}`;
                                                window.location.href = authorizationUrl;
                                            }
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

            </Layout>
        </Layout >
    )
}

export default FabStatus