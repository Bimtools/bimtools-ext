import React, { useEffect, useState } from 'react'
import { message, Row, Col, Upload, Input, Divider, Typography, Button, Form } from 'antd';
import * as WorkspaceAPI from "trimble-connect-workspace-api";
import * as XLSX from "xlsx";
import {
    UploadOutlined
} from "@ant-design/icons";
import { useDispatch, useSelector } from 'react-redux';
import { GetFabStatusRequest } from '../store/fabStatus/action';
import { Format } from '../services/GUIDConversion';
import { UpdateObjFabStatusRequest } from '../store/objFabStatus/action';
function LettersToNumber(letters) {
    for (var p = 0, n = 0; p < letters.length; p++) {
        n = letters[p].charCodeAt() - 64 + n * 26;
    }
    return n - 1;
}
const { Dragger } = Upload;
const { Text, Link } = Typography;
const UpdateFabStatus = () => {
    const dispatch = useDispatch();
    const [rows, setRows] = useState([]);
    const [startRowIndex, setStartRow] = useState();
    const [colAsmPos, setColAsmPos] = useState();
    const [colFabQty, setColFabQty] = useState();
    const [colFabStatus, setColFabStatus] = useState();
    const [projectId, setProjectId] = useState('')
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
    const fabStatuses = useSelector(state => state.fabStatus.payload);
    const objFabStatuses = useSelector(state => state.objFabStatus.payload);
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
                            const models = await tcapi.viewer.getObjects({
                                parameter: {
                                    class: "IFCELEMENTASSEMBLY",
                                },
                            })
                            models.forEach(async x => {
                                const object_ids = x.objects.map(a => a.id);
                                const items = await tcapi.viewer.getObjectProperties(x.modelId, object_ids)
                                let object_statuses = []
                                items.forEach(item => {
                                    const properties = item.properties
                                    properties.every(property => {
                                        if (property.name === 'ASSEMBLY') {
                                            const asm_properties = property.properties
                                            let asm_pos = ''
                                            let guid = ''
                                            asm_properties.every(asm_property => {
                                                if (asm_pos !== '' && guid !== '') return false
                                                if (asm_property.name === 'ASSEMBLY_POS') {
                                                    asm_pos = asm_property.value
                                                } else if (asm_property.name === 'GUID') {
                                                    guid = asm_property.value
                                                }
                                                return true
                                            })
                                            //Get corresponding status in excel file
                                            const matched_rows = rows.filter(row => row[col_index_asm_pos] === asm_pos)
                                            if (matched_rows.length > 0) {
                                                const fab_status_in_excel = matched_rows[0][col_index_fab_status]
                                                const matched_fab_statuses = fabStatuses.filter(x => x.name === fab_status_in_excel)
                                                if (matched_fab_statuses.length > 0) {
                                                    const fab_status_id = matched_fab_statuses[0].id
                                                    object_statuses.push({
                                                        objectId: guid,
                                                        statusActionId: fab_status_id,
                                                        value: 'Completed',
                                                        valueDate: new Date().toISOString()
                                                    })
                                                }
                                            }
                                            return false
                                        }
                                        return true
                                    })

                                })
                                
                                const payload={
                                    projectId:projectId,
                                    objFabStatuses:object_statuses
                                }
                                dispatch(UpdateObjFabStatusRequest(payload))
                            })
                        });
                    }}>Update</Button>
            </div>
        </>
    )
}

export default UpdateFabStatus