import * as URLs from '../const';
import axios from 'axios'

const instance = axios.create({
    baseURL: URLs.sohoApiUrl,
    timeout: 5000
    // headers: {'X-Custom-Header': 'foobar'}
});
instance.interceptors.request.use(
    function (config) {
        return config;
    }, 
    function (error) {
        return Promise.reject(error);
    }
);
instance.interceptors.response.use(
    function (response) {
        return response;
    },
    function (error) {
        return Promise.reject(error);
    }
);

export default {
    getMyInfo() {
        return instance({
                url: `${URLs.sohoApiUrl}/res/json/sample.json`,
                method: 'get'
            })
    },
    setMyInfo(params) {
        return instance({
            url: `${URLs.sohoApiUrl}/res/json/sample.json`,
            method: 'post',
            data: params
        })
    }
}