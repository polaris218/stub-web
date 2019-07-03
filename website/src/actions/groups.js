import ajaxPromise from './ajaxPromise';
import {error_catch} from '../helpers/error_catch';
export const getAllGroups = (get_disabled_groups = false) => {
  const uri = `/api/groups`;
  return ajaxPromise({
    url: uri,
    type: 'GET',
    data: { get_disabled_groups }
  }).catch((error) => {
    error_catch(error);
  });
};

export const getSingleGroup = (group_id) => {
  const uri = `/api/groups/${group_id}`;
  return ajaxPromise({
    url: uri,
    type: 'GET'
  }).catch((error) => {
    error_catch(error);
  });
};

export const createGroup = (group) => {
  const uri = `/api/groups/new`;
  return ajaxPromise({
    url: uri,
    type: 'POST',
    data: group
  }).catch((error) => {
    error_catch(error);
  });
};

export const updateGroup = (group_id, group) => {
  const uri = `/api/groups/${group_id}`;
  return ajaxPromise({
    url: uri,
    type: 'PUT',
    data: group
  }).catch((error) => {
    error_catch(error);
  });
};

export const deleteGroup = (group_id) => {
  const uri = `/api/groups/${group_id}`;
  return ajaxPromise({
    url: uri,
    type: 'DELETE'
  }).catch((error) => {
    error_catch(error);
  });
};

export const getGroupsIconUrl = (group_id) => {
  const uri = `/api/groups/${group_id}/file/upload/url`;
  return ajaxPromise({
    url: uri,
    type: 'GET'
  }).catch((error) => {
    error_catch(error);
  });
};

export const uploadGroupsIcon = (group_id, upload_url, data) => {
  return ajaxPromise({
    url: upload_url,
    type: 'POST',
    data: data,
    processData: false,
    contentType: false,
  });
};

export const getGroupsIcon = (group_id, file_id) => {
  const uri = `/api/groups/${group_id}/file/${file_id}`;
  return ajaxPromise({
    url: uri,
    type: 'GET'
  }).catch((error) => {
    error_catch(error);
  });
};

export const deleteGroupIcon = (group_id, file_id) => {
  const uri = `/api/groups/${group_id}/file/${file_id}`;
  return ajaxPromise({
    url: uri,
    type: 'DELETE'
  }).catch((error) => {
  error_catch(error);
  });
};

export const searchGroups = (searchText, getAjaxCall = null, page = 0, items_per_page = 200) =>
  ajaxPromise({
    url: `/api/groups/search?search=${searchText}&page=${page}&items_per_page=${items_per_page}`,
    type: 'GET'
  }, getAjaxCall);