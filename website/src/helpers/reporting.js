import Keen from 'keen-js';

export const get_client = () => {
  const client = new Keen();
//  {
//    projectId: config(window).projectId,
//    readKey: config(window).readKey
//  });
  return client;
};

//Queries irrespective group_id
export const get_count_of_all_events = (timeFrame = 'this_30_days', event_collection = 5629499534213120, queryType = 'count') => {
  const query = new Keen.Query(queryType + '', {
    event_collection: event_collection + '',
    group_by: ['event_type'],
    timeframe: timeFrame,
    timezone: 18000,
    filters: [{ 'operator':'exists', 'property_name':'entity_id', 'property_value':false },
      { 'operator':'exists', 'property_name':'resource_id', 'property_value':false },
      { 'operator':'eq', 'property_name':'unscheduled', 'property_value':false }],
    target_property: (queryType === 'count_unique') ? 'id' : null
  });
  return query;
};



export const get_task_ratings = (timeFrame = 'this_30_days', event_collection = 5629499534213120) => {
    const query = new Keen.Query('count', {
        event_collection: event_collection + '',
        filters: [
            { 'operator':'exists', 'property_name':'task_rating', 'property_value':true },
            { 'operator':'exists', 'property_name':'entity_id', 'property_value':false },
            { 'operator':'exists', 'property_name':'resource_id', 'property_value':false }],
        group_by: ['task_rating', 'event_type'],
        timeframe: timeFrame,
        timezone: 18000
    });
    return query;
};

// Convert number to format 1000 -> 1K
export const format_number = (number, decimals) => {
  let formattedNumber = number;
  if (number >= 1000000) {
    formattedNumber = (number / 1000000).toFixed(decimals);
    formattedNumber += 'M';
  } else if (number >= 1000) {
    formattedNumber = (number / 1000).toFixed(decimals);
    formattedNumber += 'K';
  }
  return formattedNumber;
};

