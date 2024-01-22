import React, { useEffect } from "react";
import "./App.css";
import UpdateStatus from "./components/UpdateStatus";
import FabStatus from "./components/FabStatus";
import { Route, Routes, useNavigate } from "react-router-dom";
import FabStatusReport from "./components/FabStatusReport";
import { Layout, Switch } from "antd";
import { Header } from "antd/es/layout/layout";
import axios from "axios";
import * as WorkspaceAPI from "trimble-connect-workspace-api";
import { useDispatch } from "react-redux";
import { GetFabStatusRequest } from "./store/fabStatus/action";


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
    const urlParams = new URLSearchParams(window.location.search);
    const authorizationCode = urlParams.get('code');
    if (authorizationCode) {
      const tokenEndpoint = process.env.REACT_APP_TC_TOKEN_ENDPOINT;
      const clientSecret = process.env.REACT_APP_CLIENT_SECRET;
      const data = new URLSearchParams();
      data.append('grant_type', 'authorization_code');
      data.append('code', authorizationCode);
      data.append('client_id', process.env.REACT_APP_CLIENT_ID ?? '');
      data.append('client_secret', clientSecret ?? '');
      data.append('redirect_uri', process.env.REACT_APP_REDIRECT_URI ?? '');
      console.log(authorizationCode)
      axios.post(tokenEndpoint ?? '', data)
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
          dispatch(GetFabStatusRequest({
            projectId: project.id,
            statusToken:status_token
          }))
          localStorage.setItem('polysus_fab_status_token', status_token)
        }).then(a => {
          
        })
        .catch(error => {
          console.error(error);
        });
    }
  }
  return <div className="App">
    <FabStatus />
  </div>;
}

export default App;
