import moment from 'moment-timezone';
import { TIMEZONES } from './timezones-list';

export const getTimezoneOptions = () => {
  const timezoneNames = TIMEZONES;
  const options = [];
  timezoneNames.map((zone) => {
    options.push({
      value: zone.value,
      shortname: zone.shortname,
      label: '(UTC' + moment.tz(new Date, zone.value).format('Z') + ') ' + zone.shortname,
      utcOffset: moment.tz(new Date, zone.value).utcOffset(),
      offset: moment.tz(new Date, zone.value).format('Z')
    });
  });
  return options;
};

export const isTimezonesOffsetEqual = (tz1, tz2) => {
  if (moment.tz(tz1).utcOffset() === moment.tz(tz2).utcOffset()) {
    return true;
  }
  return false;
};