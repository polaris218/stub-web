import ajaxPromise from './ajaxPromise';
import moment from 'moment';
import {error_catch} from '../helpers/error_catch';
export const getSchedule = ({ startDate, endDate }) => {
  let fSD = moment(startDate);
  let fED = moment(endDate);

  fSD = fSD.format().replace('+', '%2B');
  fED = fED.format().replace('+', '%2B');

  const uri = `/api/schedule?from=${fSD}&to=${fED}`;

  return ajaxPromise({
    url: uri,
    type: 'GET',
  }).catch((error) => {
    error_catch(error);
  });
};
