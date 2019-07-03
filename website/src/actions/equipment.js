import ajaxPromise from './ajaxPromise';
import {error_catch} from '../helpers/error_catch';

export const getEquipments = (items_per_page, page) => {
  const noOfItems = items_per_page ? items_per_page : 100;
  const pageNo = page ? page : 1;
  return ajaxPromise({
    url: '/api/resources',
    type: 'GET',
    data: { items_per_page: noOfItems, page: pageNo }
  }).catch((error) => {
    error_catch(error);
  });
};

export const createEquipment = ({ name, type, details, group_id, extra_fields }) =>
  ajaxPromise({
    url: '/api/resources/new',
    type: 'POST',
    data: { name, type, details, group_id, extra_fields }
  }).catch((error) => {
    error_catch(error);
  });

export const getEquipmentImageUrl = (id) =>
  ajaxPromise({
    url: `/api/resources/${id}/file/upload/url`,
    type: 'GET',
  }).catch((error) => {
    error_catch(error);
  });

export const updateEquipmentImage = (upload_url, data) =>
  ajaxPromise({
    url: upload_url,
    type: 'POST',
    data,
    contentType: false,
    processData: false
  }).catch((error) => {
    error_catch(error);
  });

export const removeEquipmentImage = (id, image_id) =>
  ajaxPromise({
    url: `/api/resources/${id}/file/${image_id}`,
    type: 'DELETE'
  }).catch((error) => {
    error_catch(error);
  });

export const updateEquipment = ({ details, extra_fields, id, name, type, group_id, external_integrations , integration_type }) => {
  const data = { details, id, name, type, group_id, external_integrations, integration_type };

  if (extra_fields) {
    data.extra_fields = extra_fields;
  }

  return ajaxPromise({
    url: `/api/resources/${id}`,
    type: 'PUT',
    data
  }).catch((error) => {
  error_catch(error);
  });
};

export const deleteEquipment = (id) =>
  ajaxPromise({
    url: '/api/resources/' +  id,
    type: 'DELETE',
  }).catch((error) => {
    error_catch(error);
  });

export const searchResources = (searchText, getAjaxCall = null, page = 0, items_per_page = 200) =>
  ajaxPromise({
    url: `/api/resources/search?search=${searchText}&page=${page}&items_per_page=${items_per_page}`,
    type: 'GET'
  }, getAjaxCall);

export const getSamsaraFleetList = (integration_type, endpoint_type, group_ids) =>
  ajaxPromise({
    url: '/api/external_integrations/resource_list?integration_type=' + integration_type + '&endpoint_type=' + endpoint_type + '&group_ids=' + group_ids,
    type: 'GET',
  }).catch((error) => {
    error_catch(error);
  });

export const getSensorsvitals = (integration_type, endpoint_type) =>
  ajaxPromise({
    url: '/api/external_integrations/resource_list?integration_type=' + integration_type + '&endpoint_type=' + endpoint_type,
    type: 'GET',
  }).catch((error) => {
    error_catch(error);
  });

export const updateExternalApiSettings = (integration_settings) => {
  const data = {integration_settings };
  return ajaxPromise({
    url: '/api/users/old_external_integrations',
    type: 'PUT',
    data
  }).catch((error) => {
    error_catch(error);
  });
};

export const getExternalApiSettings = (integration_types) => {
  return ajaxPromise({
    url: '/api/users/old_external_integrations?integration_types=' + integration_types,
    type: 'GET',
  }).catch((error) => {
    error_catch(error);
  });
};

export const getExternalIntegrationData = (equipment_id) => {
  return ajaxPromise({
    url: `/api/external_integrations/${equipment_id}/resource_data`,
    type: 'GET',
  }).catch((error) => {
    error_catch(error);
  });
};
