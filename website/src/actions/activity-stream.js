import ajaxPromise from './ajaxPromise';
import history from '../configureHistory';
import {removeAuthFromCookie} from '../helpers/route';
import {error_catch} from '../helpers/error_catch';
export default
{
  sendDeviceId: (id, source) =>
    ajaxPromise({
      url: '/api/activity/device',
      type: 'POST',
      data: JSON.stringify({ id, source })
    }).catch((error) => {
      error_catch(error);
    }),

  getActivities: from =>
    ajaxPromise({
      url: '/api/activity/history',
      type: 'GET',
      data: { from }
    })
    .then(response => JSON.parse(response)).catch((error) => {
      error_catch(error);
    }),

  logout: id =>
    ajaxPromise({
      url: '/api/activity/device/' + id,
      type: 'DELETE'
    })
    .then((response => JSON.parse(response)))
      .catch((error) => {
        error_catch(error);
      })
}
