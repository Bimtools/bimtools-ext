export async function refreshToken(refreshToken) {
    const clientId = process.env.REACT_APP_CLIENT_ID;
    const clientSecret = process.env.REACT_APP_CLIENT_SECRET;

    const response = await fetch(process.env.REACT_APP_TC_TOKEN_ENDPOINT, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `grant_type=refresh_token&refresh_token=${refreshToken}&client_id=${clientId}&client_secret=${clientSecret}`
    });
    const data = response.data
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
}