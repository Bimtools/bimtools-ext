import React from 'react'
import { Button, Layout, Menu, Typography } from 'antd';
import {
    FileAddFilled,
    MoreOutlined
} from "@ant-design/icons";

const { Header, Content } = Layout;
const { Title, Paragraph } = Typography;
const FabStatus = () => {
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
                        icon={<MoreOutlined />}
                        mode="horizontal"
                        items={[
                            {
                                label: 'Create Fabrication Status',
                                key: 'Create',
                                icon: <FileAddFilled />,
                            },
                        ]} />
                </div>
                {/* <Button style={{
                    display: 'flex',
                    background: '#fff',
                    color: "#00a2ff",
                    alignItems: 'center',
                    justifyContent: "center",
                }}
                    type="text"
                    shape="circle"
                    icon={<MoreOutlined />} /> */}
            </div>
            <Layout>

            </Layout>
        </Layout >
    )
}

export default FabStatus