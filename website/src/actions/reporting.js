import ajaxPromise from './ajaxPromise';
import {error_catch} from '../helpers/error_catch';

export const get_report = (attrs) => {
  let url = '/api/report/' + attrs.reportName;
  if(attrs.params){
    let param = '';

    for(let p in attrs.params){
      param = param + '&' + p + '=' + attrs.params[p];
    }
    url = url + '?' + param;
  }
  return ajaxPromise({
    url: url,
    type: 'GET',
  }).then((res) => {
    return JSON.parse(res);
  }).catch((error) => {
    error_catch(error);
  });
};

