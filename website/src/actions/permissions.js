import ajaxPromise from './ajaxPromise';
import {error_catch} from '../helpers/error_catch';
export const getPermissions = (entity_id) =>
  ajaxPromise({
    url: `/api/user_permission_groups`,
    type: 'GET',
    data: { entity_id }
  }).catch((error) => {
    error_catch(error);
  });

export const updatePermissiosn = (entity_id, permissions) =>
  ajaxPromise({
    url: `/api/user_permission_groups`,
    type: 'POST',
    data: { entity_id, permissions }
  }).catch((error) => {
    error_catch(error);
  });

export const getEntityPermissionsGroups = () =>
  ajaxPromise({
    url: '/api/permission_groups',
    type: 'GET'
  }).catch((error) => {
    error_catch(error);
  });
