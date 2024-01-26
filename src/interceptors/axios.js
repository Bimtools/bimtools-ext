import axios from "axios";
import * as WorkspaceAPI from "trimble-connect-workspace-api";

const axiosConfig = async () => {
    const tcapi = await WorkspaceAPI.connect(window.parent)
    axios.defaults.baseURL = process.env.REACT_APP_SHARING_API_URI

    axios.interceptors.response.use(function (response) {
        return response;
    }, function (error) {
        const { config, response: { status } } = error;
        const originalRequest = config;
        if (status === 401) {
            tcapi.extension.requestPermission("accesstoken").then(accessToken => {
                var myHeaders = new Headers();
                myHeaders.append("Authorization", 'Bearer ' + accessToken);
                var requestOptions = {
                    method: 'POST',
                    headers: myHeaders,
                    redirect: 'follow'
                };

                fetch(`${process.env.REACT_APP_SHARING_API_URI}/auth/token`, requestOptions)
                    .then(response => response.text())
                    .then(status_token => {
                        localStorage.setItem('polysus_fab_status_token', status_token.replace(/"/g, ''))
                        return axios(originalRequest);
                    })
                    .catch(error => console.log('error', error));
            })
        }
        return Promise.reject(error);
    });
    axios.interceptors.request.use(config => {
        const token = localStorage.getItem('polysus_fab_status_token');
        if (token) {
            config.headers['Authorization'] = 'Bearer ' + token;
        }
        return config;
    });
}
export default axiosConfig;
