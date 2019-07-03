import ajaxPromise from './ajaxPromise';
import {error_catch} from '../helpers/error_catch';

export const validateAuthorizationRequest = ( query_props )=>
  ajaxPromise({
    url: '/api/oauth2/auth?' + query_props,
    type: 'GET'
  }).catch((error) => {
    error_catch(error);
  });


export const createAuthorizationResponse = (credential )=>
  ajaxPromise({
    url: '/api/oauth2/auth',
    type: 'POST',
    data: credential
  }).catch((error) => {
    error_catch(error);
  });

export const getAccessToken = (query_props)=>
  ajaxPromise({
    url: '/api/oauth2/access_token?'+query_props,
    type: 'POST'
    // data: query_props
  }).catch((error) => {
    error_catch(error);
  });

