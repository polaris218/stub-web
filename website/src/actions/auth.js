import ajaxPromise from './ajaxPromise';
import {error_catch} from '../helpers/error_catch';

export const register = ({fullname, email, password, ref, entity_id, is_enterprise, phone, company_name })=>
  ajaxPromise({
    url: '/api/users/register',
    type: 'POST',
    data: { fullname, email, password, ref, entity_id, is_enterprise, phone, company_name }
  })

  export const authBasedLogin = ({auth_key, auth_token, entity_id})=>
  ajaxPromise({
    url: '/api/users/authlogin',
    type: 'POST',
    data: { auth_key, auth_token, entity_id }
    });

export const login = ({email, phone, password})=>
  ajaxPromise({
    url: '/api/users/login',
    type: 'POST',
    data: { email, phone, password }
    });

export const logout = ()=>
  ajaxPromise({
    url: '/api/users/logout',
    type: 'GET'
    });

export const changePassword = ({ username, password, confirm_password}) =>
  ajaxPromise({
    url: '/api/users/changepassword',
    type: 'POST',
    data: {username, password, confirm_password}
  }).catch((error) => {
    error_catch(error);
  });

export const deleteIt = (email) =>
ajaxPromise({
  url: '/api/users/delete/' +  email,
  type: 'DELETE',
}).catch((error) => {
  error_catch(error);
});

export const resetPassword1 = ({ email, phone }) =>
  ajaxPromise({
    url: '/api/users/resetpassword',
    type: 'POST',
    data: { email, phone }
  });

export const entityPasswordReset = ({ email, phone }) =>
  ajaxPromise({
    url: '/api/users/resetuserpassword',
    type: 'POST',
    data: { email, phone }
  });

export const resetPassword2 = ({ user_id, signup_token, password, confirm_password }) =>
  ajaxPromise({
    url: '/api/users/resetpassword/' + user_id + '/' + signup_token,
    type: 'POST',
    data: { password, confirm_password }
  });

export const veryfyUser = ({user_id, token})=>
  ajaxPromise({
    url: '/api/users/register/verify/' + user_id + '/'+ token,
    type: 'GET'
  });
export const verifyOauthClient = ({clientid, clientsecret})=>
  ajaxPromise({
    url: '/api/oauth2/verifyclient',
    type: 'POST',
    data: { clientid, clientsecret }
    });
