import ajaxPromise from './ajaxPromise';
import {error_catch} from "../helpers/error_catch";

export const executeCode = ({ language, source_code }) =>
ajaxPromise({
  url: '/api/code/execute',
  type: 'POST',
  data: { language, source_code }
});

export const getProfileInformationDevPortal = () => {
  const baseUrl = '/api/users/profile';
  return ajaxPromise({
    url: baseUrl,
    type: 'GET',
  }).catch((error) => {
    error_catch(error);
  });
};

export const updateKeysDevPortal = () =>
ajaxPromise({
  url: '/api/users/update-auth-keys',
  type: 'GET',
}).catch((error) => {
  error_catch(error);
});
