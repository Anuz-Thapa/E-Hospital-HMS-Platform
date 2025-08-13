import axios from 'axios';
import {getRefreshedToken,isAccessTokenExpired,setAuthUser} from './auth';
import Cookies from 'js-cookie';

import {API_BASE_URL} from './constants';

const useAxios =()=>{
    const access_token=Cookies.get("access_token")
    const refresh_token=Cookies.get("refresh_token")
    console.log(refresh_token)
    const axiosInstance=axios.create({
        baseURL:API_BASE_URL,
        headers: { Authorization: `Bearer ${access_token}` } 
    });

    // intercepting the request before it gets to the server for checking whether the token has expired,if yes create new one
    axiosInstance.interceptors.request.use(async (req)=>{
        const access_token = Cookies.get("access_token");
        const refresh_token = Cookies.get("refresh_token");
        if (!isAccessTokenExpired()) {
    return req;
}
        const response=await getRefreshedToken(refresh_token);
        console.log("new refresh token found!")
        setAuthUser(response.access,response.refresh)
        req.headers.Authorization=`Bearer ${response?.access}`;
        return req;
    });
    return axiosInstance;
}
export default useAxios;
// useAxios will intercept the request before the server gets it for checking whether the token has expired