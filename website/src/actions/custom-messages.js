import ajaxPromise from './ajaxPromise';
import {error_catch} from '../helpers/error_catch';
export const getMessages = () => {
  const uri = `/api/custom-messages`;

  return ajaxPromise({
    url: uri,
    type: 'GET',
  }).catch((error) => {
    error_catch(error);
  });
};

export const createMessage = (name, type, content, description, default_id, sub_type) => {
  const uri = `/api/custom-messages/new`;

  return ajaxPromise({
    url: uri,
    type: 'POST',
    data: { name, type, content, description, default_id, sub_type}
  }).catch((error) => {
    error_catch(error);
  });
};

export const deleteMessage = (message_id) => {
  const uri = `/api/custom-messages/${message_id}`;
  return ajaxPromise({
    url: uri,
    type: 'DELETE'
  }).catch((error) => {
  error_catch(error);
  });
};

export const updateMessage = (name, type, content, description, message_id) => {
  const uri = `/api/custom-messages/${message_id}`;

  return ajaxPromise({
    url: uri,
    type: 'PUT',
    data: { name, type, content, description}
  }).catch((error) => {
    error_catch(error);
  });
};

export const getUpdatedMessage = (message_id) => {
  const uri = `/api/custom-messages/${message_id}`;
  return ajaxPromise({
    url: uri,
    type: 'GET',
  }).catch((error) => {
    error_catch(error);
  });
};

export const getDefaultFields = () => {
  const uri = `/api/custom-message-keywords`;
  return ajaxPromise({
    url: uri,
    type: 'GET'
  }).catch((error) => {
    error_catch(error);
  });
};

export const getSingleMessage = (id) => {
  const uri = `/api/custom-messages/find`;
  return ajaxPromise({
    url: uri,
    type: 'GET',
    data: { id }
  }).catch((error) => {
    error_catch(error);
  });
}

export const getMessagesNames = () => {
  const uri = `/api/custom-message-names`;
  return ajaxPromise({
    url: uri,
    type: 'GET'
  }).catch((error) => {
    error_catch(error);
  });
};

export const getPreview = (content, sub_type = null) => {
  const uri = `/api/custom-messages/preview`;
  return ajaxPromise({
    url: uri,
    type: 'POST',
    data: { content , sub_type }
  }).catch((error) => {
    error_catch(error);
  });
};
