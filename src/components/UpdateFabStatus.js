import React, { useEffect, useState } from 'react'
import { message, Row, Col, Upload, Input, Divider, Typography, Button, Form, Spin, DatePicker } from 'antd';
import * as WorkspaceAPI from "trimble-connect-workspace-api";
import * as XLSX from "xlsx";
import {
    UploadOutlined
} from "@ant-design/icons";
import { useDispatch, useSelector } from 'react-redux';
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
    const [colAsmPos, setColAsmPos] = useState();
    const [colFabQty, setColFabQty] = useState();
    const [colWeight, setColWeight] = useState();
    const [colModelTotal, setColModelTotal] = useState();
    const [colFabStatus, setColFabStatus] = useState();
    const [projectId, setProjectId] = useState('')
    const [reportDate, setReportDate] = useState()
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
    const loading = useSelector(state => state.objFabStatus.pending);
    useEffect(() => {
        console.log(loading)
        async function getProjectId() {
            const tcapi = await WorkspaceAPI.connect(window.parent)
            const project = await tcapi.project.getProject()
            setProjectId(project.id)
        }
        getProjectId()
    }, [loading])
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
                <Col span={8}><Text ellipsis>Assembly Position</Text></Col>
                <Col span={16}>
                    <Input placeholder="Assembly Position" required onChange={(e) => setColAsmPos(e.target.value)} />
                </Col>
            </Row>
            <Row style={{ margin: '2px' }}>
                <Col span={8}><Text ellipsis>Assembly Weight</Text></Col>
                <Col span={16}>
                    <Input placeholder="Assembly Weight" required onChange={(e) => setColWeight(e.target.value)} />
                </Col>
            </Row>
            <Row style={{ margin: '2px' }}>
                <Col span={8}><Text ellipsis>Model Total</Text></Col>
                <Col span={16}>
                    <Input placeholder="Model Total" required onChange={(e) => setColModelTotal(e.target.value)} />
                </Col>
            </Row>
            <Row style={{ margin: '2px' }}>
                <Col span={8}><Text ellipsis>Fabrication Quantity</Text></Col>
                <Col span={16}>
                    <Input placeholder="Fabrication Quantity" required onChange={(e) => setColFabQty(e.target.value)} />
                </Col>
            </Row>
            <Row style={{ margin: '2px' }}>
                <Col span={8}><Text ellipsis>Fabrication Status</Text></Col>
                <Col span={16}>
                    <Input placeholder="Fabrication Status" required onChange={(e) => setColFabStatus(e.target.value)} />
                </Col>
            </Row>
            <Row style={{ margin: '2px' }}>
                <Col span={8}><Text ellipsis>Report Date</Text></Col>
                <Col span={16}>
                    <div
                        style={{
                            display: "flex",
                            alignItems: 'center',
                            flexDirection: "row",
                            justifyContent: 'space-between',
                            marginTop: '5px',
                            marginRight: '5px',
                            columnGap: '2px'
                        }}>
                        <DatePicker format={'YYYY-MM-DD'} onChange={(date, dateString) => {
                            setReportDate(dateString)
                        }} />
                    </div>
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
                <Button type="primary" disabled={colAsmPos === ''
                    || colFabQty === '' || colFabStatus === ''}
                    onClick={async () => {
                        const col_index_asm_pos = LettersToNumber(colAsmPos)
                        const col_index_fab_qty = LettersToNumber(colFabQty)
                        const col_index_fab_status = LettersToNumber(colFabStatus)
                        const col_index_asm_weight = LettersToNumber(colWeight)
                        const col_index_model_total = LettersToNumber(colModelTotal)
                        let object_statuses = []
                        rows.every(x=>{
                            const asm_model_total = Number(x[col_index_model_total])
                            if(typeof asm_model_total ==='undefined' || asm_model_total <=0) return true
                            const asm_weight = Number(x[col_index_asm_weight])
                            if(typeof asm_weight ==='undefined' || asm_weight <=0) return true
                            const fab_status_in_excel = x[col_index_fab_status]
                            const matched_fab_statuses = fabStatuses.filter(x => x.name.startsWith(fab_status_in_excel))
                            if(matched_fab_statuses.length === 0) return true
                            const asm_pos_in_excel = x[col_index_asm_pos]
                            if(typeof asm_pos_in_excel === 'undefined' || asm_pos_in_excel==='') return true
                            let fab_qty_in_excel = x[col_index_fab_qty]
                            if(typeof fab_qty_in_excel === 'undefined' || fab_qty_in_excel==='') return true
                            const fab_status_id = matched_fab_statuses[0].id
                            object_statuses.push({
                                objectId: asm_pos_in_excel+'-@-'+fab_qty_in_excel+'-@-'+asm_model_total+'-@-'+asm_weight,
                                statusActionId: fab_status_id,
                                value: 'Completed',
                                valueDate: reportDate
                            })
                            return true
                        })
                       
                        const payload = {
                            projectId: projectId,
                            objFabStatuses: object_statuses
                        }
                        console.log(object_statuses)
                        dispatch(UpdateObjFabStatusRequest(payload))
                        // WorkspaceAPI.connect(window.parent, (event, data) => {
                        // }).then(async tcapi => {
                        //     // Get all assemblies
                        //     const models = await tcapi.viewer.getObjects({
                        //         parameter: {
                        //             class: "IFCELEMENTASSEMBLY",
                        //         },
                        //     })
                        //     console.log(models)
                        //     models.forEach(async x => {
                        //         const object_ids = x.objects.map(a => a.id);
                        //         const items = await tcapi.viewer.getObjectProperties(x.modelId, object_ids)
                        //         let object_statuses = []
                        //         let object_properties = []
                        //         items.forEach((item, index) => {
                        //             const properties = item.properties
                        //             properties.every(property => {
                        //                 if (property.name === 'ASSEMBLY') {
                        //                     const asm_properties = property.properties
                        //                     let asm_pos = ''
                        //                     let guid = ''
                        //                     let weight=''
                        //                     asm_properties.every(asm_property => {
                        //                         if (asm_pos !== '' && guid !== '') return false
                        //                         if (asm_property.name === 'ASSEMBLY_POS') {
                        //                             asm_pos = asm_property.value
                        //                         } else if (asm_property.name === 'GUID') {
                        //                             guid = asm_property.value
                        //                         }
                        //                         return true
                        //                     })
                        //                     object_properties.push({
                        //                         asmPos: asm_pos,
                        //                         guid: guid,
                        //                     })
                        //                     return false
                        //                 }
                        //                 return true
                        //             })
                        //         })
                        //         //Group by asmPos
                        //         const group_by_asm_pos = Object.groupBy(object_properties, ({ asmPos }) => asmPos)
                        //         console.log(group_by_asm_pos)
                        //         Object.entries(group_by_asm_pos).forEach(function ([key, value]) {
                        //             //Get corresponding status in excel file
                        //             const matched_rows = rows.filter(row => key.startsWith(row[col_index_asm_pos]))
                        //             console.log(matched_rows)
                        //             if (matched_rows.length > 0) {
                        //                 const fab_status_in_excel = matched_rows[0][col_index_fab_status]
                        //                 const fab_qty_in_excel = matched_rows[0][col_index_fab_qty]
                        //                 const matched_fab_statuses = fabStatuses.filter(x => x.name.startsWith(fab_status_in_excel))
                        //                 let total_num = value.length
                        //                 if (typeof fab_qty_in_excel !== 'undefined') total_num = Number(fab_qty_in_excel)
                        //                 if (matched_fab_statuses.length > 0) {
                        //                     const fab_status_id = matched_fab_statuses[0].id
                        //                     for (let i = 0; i < total_num; i++) {
                        //                         object_statuses.push({
                        //                             objectId: key+'-@-'+value.length + '-@-' + x.modelId,
                        //                             statusActionId: fab_status_id,
                        //                             value: 'Completed',
                        //                             valueDate: reportDate
                        //                         })
                        //                     }
                        //                 }
                        //             }
                        //         })
                        //         console.log(object_statuses)
                        //         if (object_statuses.length === 0){
                        //             message.success(`Fabrication status has been updated`)
                        //             return
                        //         }
                        //         console.log(object_statuses)
                                
                        //     })
                        // });
                    }}>Update</Button>
                {loading ? (<Spin size="large" />) : null}
            </div>
        </>
    )
}

export default UpdateFabStatus