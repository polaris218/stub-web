import ajaxPromise from './ajaxPromise';
import {error_catch} from '../helpers/error_catch';

export const getinvitation = (invite_id) => {
  const uri = `/api/invite/${invite_id}`;
  return ajaxPromise({
    url: uri,
    type: 'GET'
  }).catch((error) => {
    error_catch(error);
  });
};


export const acceptInvitation = (invite_id) => {
  const uri = `/api/invite/${invite_id}/accept`;
  return ajaxPromise({
    url: uri,
    type: 'POST'
  }).catch((error) => {
    error_catch(error);
  });
};

