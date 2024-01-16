import React, { useState } from 'react'
import { message, Row, Col, Upload, Input, Divider, Typography, Button, Form } from 'antd';
import * as WorkspaceAPI from "trimble-connect-workspace-api";
import * as XLSX from "xlsx";
import {
    UploadOutlined
} from "@ant-design/icons";
function LettersToNumber(letters) {
    for (var p = 0, n = 0; p < letters.length; p++) {
        n = letters[p].charCodeAt() - 64 + n * 26;
    }
    return n - 1;
}
const { Dragger } = Upload;
const { Text, Link } = Typography;
const UpdateFabStatus = () => {
    const [rows, setRows] = useState([]);
    const [startRowIndex, setStartRow] = useState();
    const [colAsmPos, setColAsmPos] = useState();
    const [colFabQty, setColFabQty] = useState();
    const [colFabStatus, setColFabStatus] = useState();
    const dummyRequest = ({ file, onSuccess }) => {
        const promise = new Promise((resolve, reject) => {
            const fileReader = new FileReader();
            fileReader.readAsArrayBuffer(file);
            fileReader.onload = (e) => {
                const bufferArray = e.target.result;
                const wb = XLSX.read(bufferArray, { type: "buffer" });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
                resolve(data);
            };
            fileReader.onerror = (error) => {
                reject(error);
            };
        });

        promise.then((d) => {
            setRows(d);
        });
        onSuccess("ok");
    };
    const props = {
        name: 'file',
        multiple: false,
        customRequest: dummyRequest,
        onChange(info) {
            const { status } = info.file;
            if (status !== 'uploading') {
                console.log(info.file)
            }
            if (status === 'done') {
                message.success(`${info.file.name} file uploaded successfully.`);
            } else if (status === 'error') {
                message.error(`${info.file.name} file upload failed.`);
            }
        },
        onDrop(e) {
            console.log('Dropped files', e.dataTransfer.files);
        },
    };
    return (
        <>
            <Dragger {...props}>
                <p className="upload-drag-icon" style={{ height: '10px', marginTop: '0px', padding: '0px' }}>
                    <UploadOutlined />
                </p>
                <p className="upload-text" style={{ height: '10px' }}>Click or drag file to this area to upload</p>
            </Dragger>
            <Divider>Excel Mapping</Divider>
            <Row style={{ margin: '2px' }}>
                <Col span={8}><Text ellipsis strong>Description</Text></Col>
                <Col span={16}><Text ellipsis strong>Column Name</Text></Col>
            </Row>
            <Row style={{ margin: '2px' }}>
                <Col span={8}><Text ellipsis>First Row Index</Text></Col>
                <Col span={16}>
                    <Form>
                        <Form.Item name="firstRowIndex" rules={[{ required: true, message: "Please input first row index!" }]}>
                            <Input placeholder="First Row Index" onChange={(e) => setStartRow(e.target.value)} />
                        </Form.Item>
                    </Form></Col>
            </Row>
            <Row style={{ margin: '2px' }}>
                <Col span={8}><Text ellipsis>Assembly Position</Text></Col>
                <Col span={16}>
                    <Form>
                        <Form.Item name="asmPos" rules={[{ required: true, message: "Please input assembly position column name!" }]}>
                            <Input placeholder="Assembly Position" required onChange={(e) => setColAsmPos(e.target.value)} />
                        </Form.Item>
                    </Form>
                </Col>
            </Row>
            <Row style={{ margin: '2px' }}>
                <Col span={8}><Text ellipsis>Fabrication Quantity</Text></Col>
                <Col span={16}>
                    <Form>
                        <Form.Item name="fabQty" rules={[{ required: true, message: "Please input fabrication quantity column!" }]}>
                            <Input placeholder="Fabrication Quantity" required onChange={(e) => setColFabQty(e.target.value)} />
                        </Form.Item>
                    </Form>

                </Col>
            </Row>
            <Row style={{ margin: '2px' }}>
                <Col span={8}><Text ellipsis>Fabrication Status</Text></Col>
                <Col span={16}>
                    <Form>
                        <Form.Item name="fabStatus" rules={[{ required: true, message: "Please input fabrication status column!" }]}>
                            <Input placeholder="Fabrication Status" required onChange={(e) => setColFabStatus(e.target.value)} />
                        </Form.Item>
                    </Form>

                </Col>
            </Row>
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
                <Button type="primary" disabled={typeof (startRowIndex) === 'undefined' || Number(startRowIndex) < 1 || colAsmPos === ''
                    || colFabQty === '' || colFabStatus === ''}
                    onClick={async () => {
                        const col_index_asm_pos = LettersToNumber(colAsmPos)
                        const col_index_fab_qty = LettersToNumber(colFabQty)
                        const col_index_fab_status = LettersToNumber(colFabStatus)
                        WorkspaceAPI.connect(window.parent, (event, data) => {
                        }).then(async tcapi => {
                            // Get all assemblies
                            const assemblies = await tcapi.viewer.getObjects({
                                parameter: {
                                    class: "IFCELEMENTASSEMBLY",
                                },
                            })
                            assemblies.forEach(async x => {
                                const object_ids = x.objects.map(a=>a.id);
                                const properties = await tcapi.viewer.getObjectProperties(x.modelId, object_ids)
                                
                            })

                        });
                    }}>Update</Button>
            </div>
        </>
    )
}

export default UpdateFabStatus