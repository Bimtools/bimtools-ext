import React, { useEffect } from "react";
import "./App.css";
import FabStatus from "./components/FabStatus";
import { Route, Routes, useNavigate } from "react-router-dom";
import FabStatusReport from "./components/FabStatusReport";
import { Layout, Switch } from "antd";
import { Header } from "antd/es/layout/layout";
import axios from "axios";
import * as WorkspaceAPI from "trimble-connect-workspace-api";
import { useDispatch } from "react-redux";
import { GetFabStatusRequest } from "./store/fabStatus/action";
import axiosConfig from "./interceptors/axios";


function App() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  useEffect(() => {
    getAccessToken()
  }, [])
  async function getAccessToken() {
    const tcapi = await WorkspaceAPI.connect(window.parent)
    const project = await tcapi.project.getProject()
    console.log(project)
    tcapi.extension.requestPermission("accesstoken").then(accessToken => {
      var myHeaders = new Headers();
      myHeaders.append("Authorization", 'Bearer ' + accessToken);

      fetch(`${process.env.REACT_APP_SHARING_API_URI}/auth/token`, {
        method: 'POST',
        headers: myHeaders,
        redirect: 'follow'
      })
        .then(response => 
          response.text()
        )
        .then(status_token => {
          localStorage.setItem('polysus_fab_status_token', status_token.replace(/"/g, ''))
          dispatch(GetFabStatusRequest({
            projectId: project.id
          }))
        })
        .catch(error => console.log('error', error));
    })
  }
  return <div className="App">
    <FabStatus />
  </div>;
}

export default App;
