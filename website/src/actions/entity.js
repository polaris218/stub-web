import ajaxPromise from './ajaxPromise';
import {error_catch} from '../helpers/error_catch';
export const getEntities = (items_per_page, page, groupId) => {
  const noOfItems = items_per_page ? items_per_page : 500;
  const pageNo = page ? page : 1;
  const group_id = groupId ? groupId : '';
  return ajaxPromise({
    url: '/api/entities',
    type: 'GET',
    data: { items_per_page: noOfItems, page: pageNo, group_id }
  }).catch((error) => {
    error_catch(error);
  });
};

export const createEntity = ({ name, type, email, phone, details, color, can_turnoff_location, permission, group_id, notifications }) =>
  ajaxPromise({
    url: '/api/entities/new',
    type: 'POST',
    data: { name, type, email, phone, details, color, can_turnoff_location, permission, group_id , notifications}
  }).catch((error) => {
    error_catch(error);
  });

export const getEntityImageUrl = (id) =>
  ajaxPromise({
    url: `/api/entities/${id}/file/upload/url`,
    type: 'GET',
  }).catch((error) => {
    error_catch(error);
  });

export const updateEntityImage = (upload_url, data) =>
  ajaxPromise({
    url: upload_url,
    type: 'POST',
    data,
    contentType: false,
    processData: false
  }).catch((error) => {
    error_catch(error);
  });

export const removeEntityImage = (id, image_id) =>
  ajaxPromise({
    url: `/api/entities/${id}/file/${image_id}`,
    type: 'DELETE'
  }).catch((error) => {
  error_catch(error);
  });

export const updateEntity = ({ details, email, extra_fields, id, name, phone, type, color, can_turnoff_location, permission, group_id, notifications }) => {
  const data = { details, id, name, type, email, phone, color, can_turnoff_location, permission, group_id, notifications };

  if (extra_fields) {
    data.extra_fields = extra_fields;
  }

  return ajaxPromise({
    url: `/api/entities/${id}`,
    type: 'PUT',
    data
  }).catch((error) => {
    error_catch(error);
  });
};

export const deleteEntity = (id) =>
  ajaxPromise({
    url: '/api/entities/' +  id,
    type: 'DELETE',
  }).catch((error) => {
    error_catch(error);
  });

export const getSingleEntity = (id) =>
    ajaxPromise({
      url: '/api/entities/' +  id,
      type: 'GET',
    }).catch((error) => {
      error_catch(error);
    });

export const getEntityLastReportedLocation = (id, page = 1, items_per_page = 1) =>
  ajaxPromise({
    url: '/api/entities/' +  id + '/readings?page=' + page + '&items_per_page=' + items_per_page,
    type: 'GET',
  }).catch((error) => {
    error_catch(error);
  });

export const report_entity_locations = ( location_payload ) =>
  ajaxPromise({
    url: '/api/entities/report',
    type: 'POST',
    data: location_payload,
    contentType: 'application/json'
  }).catch((error) => {
    error_catch(error);
  });

export const searchEntities = (searchText, getAjaxCall = null, page = 0, items_per_page = 200) =>
  ajaxPromise({
    url: `/api/entities/search?search=${searchText}&page=${page}&items_per_page=${items_per_page}`,
    type: 'GET'
  }, getAjaxCall);

export const resendInvitation = (entity_id) => {
  const uri = `/api/invite/${entity_id}/resend`;
  return ajaxPromise({
    url: uri,
    type: 'POST'
  }).catch((error) => {
    error_catch(error);
  });
};
