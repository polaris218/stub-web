import ajaxPromise from './ajaxPromise';
import {error_catch} from '../helpers/error_catch';

export const getDocumentssNames = () => {
  const uri = `/api/document-names`;
  return ajaxPromise({
    url: uri,
    type: 'GET'
  }).catch((error) => {
    error_catch(error);
  });
};
