import $ from 'jquery';
import { Cookies } from 'react-cookie';

export default(params, getAjaxCall = null)=>{
  return new Promise((resolve, reject)=>{
    let cookies = new Cookies();
    const companyId = cookies && cookies.get('cidx') || '';
    if (!params.type || params.type.toUpperCase() === 'GET' || params.type.toUpperCase() === 'DELETE') {
      if (params.url.indexOf('?') > -1) {
        params.url += '&company_id=' + companyId;
      } else {
        params.url += '?company_id=' + companyId;
      }
    } else {
      if (params.data) {
        if (typeof params.data === 'object') {
          params.data['company_id'] = params.data['company_id'] ? params.data['company_id'] : companyId;
        } else {
          params.data = JSON.parse(params.data);
          params.data['company_id'] = companyId;
          params.data = JSON.stringify(params.data);
        }
      } else {
        params.data = { company_id: companyId };
      }
    }
    let ajaxCall = $.ajax({
      ...params,
      success: resolve,
      error: reject
    });
    if (getAjaxCall) {
      getAjaxCall(ajaxCall);
    }
  })
}
