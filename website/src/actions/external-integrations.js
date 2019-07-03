import ajaxPromise from './ajaxPromise';
import {error_catch} from '../helpers/error_catch';

export const getIntegrationsList = () => {
  return ajaxPromise({
    url: '/api/users/external_integrations',
    type: 'GET',
  }).catch((error) => {
    error_catch(error);
  });
};

export const getIntegration = (id, get_limited_details = false, number_of_history_records = 1) => {
  return ajaxPromise({
    url: '/api/users/external_integrations/' + id + '?get_limited_details=' + get_limited_details + '&number_of_history_records=' + number_of_history_records,
    type: 'GET',
  }).catch((error) => {
    error_catch(error);
  });
};

export const verifyIntegrationKeys = (payload) => {
  return ajaxPromise({
    url: '/api/users/external_integrations/verify_auth_keys',
    type: 'POST',
    data: payload,
  }).catch((error) => {
    error_catch(error);
  });
};
export const updateIntegration = (integrationId, payload) => {
  return ajaxPromise({
    url: '/api/users/external_integrations/' + integrationId,
    type: 'PUT',
    data: payload,
  }).catch((error) => {
    error_catch(error);
  });
};
export const deleteIntegration = (integrationId) => {
  return ajaxPromise({
    url: '/api/users/external_integrations/' + integrationId,
    type: 'DELETE',
  }).catch((error) => {
    error_catch(error);
  });
};
export const addIntegration = (payload) => {
  return ajaxPromise({
    url: '/api/users/external_integrations/new',
    type: 'POST',
    data: payload,
  }).catch((error) => {
    error_catch(error);
  });
};
export const fetchExternaldData = (payload) => {
  return ajaxPromise({
    url: '/api/users/external_integrations/fetch_data',
    type: 'POST',
    data: payload,
  }).catch((error) => {
    error_catch(error);
  });
};

export const deleteSlackIntegration = () => {
  return ajaxPromise({
    url: '/oauth/slack/refresh',
    type: 'DELETE'
  }).catch(() => {
    error_catch(error);
  })
};
