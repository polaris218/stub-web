export const getOrderedPriorityList = (status_priorities) => {
  const sorted_status_priorities = {
    NOTSTARTED: {
      priority: status_priorities.NOTSTARTED && status_priorities.NOTSTARTED.priority ? status_priorities.NOTSTARTED.priority : 'LOW',
      same_day: status_priorities.NOTSTARTED && status_priorities.NOTSTARTED.same_day ? status_priorities.NOTSTARTED.same_day : 'LOW',
      time_mileage: status_priorities.NOTSTARTED && status_priorities.NOTSTARTED.time_mileage !== (undefined || null) ? status_priorities.NOTSTARTED.time_mileage:false,
    },
    ENROUTE: {
      priority: status_priorities.ENROUTE && status_priorities.ENROUTE.priority ? status_priorities.ENROUTE.priority : 'HIGH',
      same_day: status_priorities.ENROUTE && status_priorities.ENROUTE.same_day ? status_priorities.ENROUTE.same_day : 'HIGH',
      time_mileage: status_priorities.ENROUTE && status_priorities.ENROUTE.time_mileage !== (undefined || null) ? status_priorities.ENROUTE.time_mileage:true,
    },
    STARTED: {
      priority: status_priorities.STARTED && status_priorities.STARTED.priority ? status_priorities.STARTED.priority : 'HIGH',
      same_day: status_priorities.STARTED && status_priorities.STARTED.same_day ? status_priorities.STARTED.same_day : 'HIGH',
      time_mileage: status_priorities.STARTED && status_priorities.STARTED.time_mileage !== (undefined || null) ? status_priorities.STARTED.time_mileage:true,
    },
    COMPLETE: {
      priority: status_priorities.COMPLETE && status_priorities.COMPLETE.priority ? status_priorities.COMPLETE.priority : 'HIGH',
      same_day: status_priorities.COMPLETE && status_priorities.COMPLETE.same_day ? status_priorities.COMPLETE.same_day : 'HIGH',
      time_mileage: status_priorities.COMPLETE && status_priorities.COMPLETE.time_mileage !== (undefined || null) ? status_priorities.COMPLETE.time_mileage:true,
    },
    CANCELLED: {
      priority: status_priorities.CANCELLED && status_priorities.CANCELLED.priority ? status_priorities.CANCELLED.priority : 'HIGH',
      same_day: status_priorities.CANCELLED && status_priorities.CANCELLED.same_day ? status_priorities.CANCELLED.same_day : 'URGENT',
      time_mileage: status_priorities.CANCELLED && status_priorities.CANCELLED.time_mileage !== (undefined || null) ? status_priorities.CANCELLED.time_mileage:false,
    },
    EXCEPTION: {
      priority: status_priorities.EXCEPTION && status_priorities.EXCEPTION.priority ? status_priorities.EXCEPTION.priority : 'HIGH',
      same_day: status_priorities.EXCEPTION && status_priorities.EXCEPTION.same_day ? status_priorities.EXCEPTION.same_day : 'HIGH',
      time_mileage: status_priorities.EXCEPTION && status_priorities.EXCEPTION.time_mileage !== (undefined || null) ? status_priorities.EXCEPTION.time_mileage:false,
    },
    CUSTOM: {
      priority: status_priorities.CUSTOM && status_priorities.CUSTOM.priority ? status_priorities.CUSTOM.priority : 'URGENT',
      same_day: status_priorities.CUSTOM && status_priorities.CUSTOM.same_day ? status_priorities.CUSTOM.same_day : 'URGENT',
      time_mileage: status_priorities.CUSTOM && status_priorities.CUSTOM.time_mileage !== (undefined || null) ? status_priorities.CUSTOM.time_mileage:false,
    },
    TEAM_NOTE: {
      priority: status_priorities.TEAM_NOTE && status_priorities.TEAM_NOTE.priority ? status_priorities.TEAM_NOTE.priority : 'HIGH',
      same_day: status_priorities.TEAM_NOTE && status_priorities.TEAM_NOTE.same_day ? status_priorities.TEAM_NOTE.same_day : 'HIGH',
    },
    PREPARING: {
      priority: status_priorities.PREPARING && status_priorities.PREPARING.priority ? status_priorities.PREPARING.priority : 'LOW',
      same_day: status_priorities.PREPARING && status_priorities.PREPARING.same_day ? status_priorities.PREPARING.same_day : 'LOW',
      time_mileage: status_priorities.PREPARING && status_priorities.PREPARING.time_mileage !== (undefined || null) ? status_priorities.PREPARING.time_mileage:false,
    },
    READYFORPICKUP: {
      priority: status_priorities.READYFORPICKUP && status_priorities.READYFORPICKUP.priority ? status_priorities.READYFORPICKUP.priority : 'LOW',
      same_day: status_priorities.READYFORPICKUP && status_priorities.READYFORPICKUP.same_day ? status_priorities.READYFORPICKUP.same_day : 'LOW',
      time_mileage: status_priorities.READYFORPICKUP && status_priorities.READYFORPICKUP.time_mileage !== (undefined || null) ? status_priorities.READYFORPICKUP.time_mileage:false,
    },
    CONFIRMED: {
      priority: status_priorities.CONFIRMED && status_priorities.CONFIRMED.priority ? status_priorities.CONFIRMED.priority : 'HIGH',
      same_day: status_priorities.CONFIRMED && status_priorities.CONFIRMED.same_day ? status_priorities.CONFIRMED.same_day : 'HIGH',
      time_mileage: status_priorities.CONFIRMED && status_priorities.CONFIRMED.time_mileage !== (undefined || null) ? status_priorities.CONFIRMED.time_mileage:false,
    },
    RESCHEDULED: {
      priority: status_priorities.RESCHEDULED && status_priorities.RESCHEDULED.priority ? status_priorities.RESCHEDULED.priority : 'MEDIUM',
      same_day: status_priorities.RESCHEDULED && status_priorities.RESCHEDULED.same_day ? status_priorities.RESCHEDULED.same_day : 'HIGH',
      time_mileage: status_priorities.RESCHEDULED && status_priorities.RESCHEDULED.time_mileage !== (undefined || null) ? status_priorities.RESCHEDULED.time_mileage:false,
    },
    ARRIVING: {
      priority: status_priorities.ARRIVING && status_priorities.ARRIVING.priority ? status_priorities.ARRIVING.priority : 'MEDIUM',
      same_day: status_priorities.ARRIVING && status_priorities.ARRIVING.same_day ? status_priorities.ARRIVING.same_day : 'MEDIUM',
      time_mileage: status_priorities.ARRIVING && status_priorities.ARRIVING.time_mileage !== (undefined || null) ? status_priorities.ARRIVING.time_mileage:false,
    },
    LATE: {
      priority: status_priorities.LATE && status_priorities.LATE.priority ? status_priorities.LATE.priority : 'HIGH',
      same_day: status_priorities.LATE && status_priorities.LATE.same_day ? status_priorities.LATE.same_day : 'HIGH',
      time_mileage: status_priorities.LATE && status_priorities.LATE.time_mileage !== (undefined || null) ? status_priorities.LATE.time_mileage:false,
    },
    NOSHOW: {
      priority: status_priorities.NOSHOW && status_priorities.NOSHOW.priority ? status_priorities.NOSHOW.priority : 'HIGH',
      same_day: status_priorities.NOSHOW && status_priorities.NOSHOW.same_day ? status_priorities.NOSHOW.same_day : 'HIGH',
      time_mileage: status_priorities.NOSHOW && status_priorities.NOSHOW.time_mileage !== (undefined || null) ? status_priorities.NOSHOW.time_mileage:false,
    },
    EXTRA_TIME: {
      priority: status_priorities.EXTRA_TIME && status_priorities.EXTRA_TIME.priority ? status_priorities.EXTRA_TIME.priority : 'HIGH',
      same_day: status_priorities.EXTRA_TIME && status_priorities.EXTRA_TIME.same_day ? status_priorities.EXTRA_TIME.same_day : 'HIGH',
      time_mileage: status_priorities.EXTRA_TIME && status_priorities.EXTRA_TIME.time_mileage !== (undefined || null) ? status_priorities.EXTRA_TIME.time_mileage:false,
    },
    REMINDER: {
      priority: status_priorities.REMINDER && status_priorities.REMINDER.priority ? status_priorities.REMINDER.priority : 'LOW',
      same_day: status_priorities.REMINDER && status_priorities.REMINDER.same_day ? status_priorities.REMINDER.same_day : 'LOW',
      time_mileage: status_priorities.REMINDER && status_priorities.REMINDER.time_mileage !== (undefined || null) ? status_priorities.REMINDER.time_mileage:false,
    },
    RECOMMENDED: {
      priority: status_priorities.RECOMMENDED && status_priorities.RECOMMENDED.priority ? status_priorities.RECOMMENDED.priority : 'MEDIUM',
      same_day: status_priorities.RECOMMENDED && status_priorities.RECOMMENDED.same_day ? status_priorities.RECOMMENDED.same_day : 'MEDIUM',
      time_mileage: status_priorities.RECOMMENDED && status_priorities.RECOMMENDED.time_mileage !== (undefined || null) ? status_priorities.RECOMMENDED.time_mileage:false,
    },
    REVIEW_REMINDER: {
      priority: status_priorities.REVIEW_REMINDER && status_priorities.REVIEW_REMINDER.priority ? status_priorities.REVIEW_REMINDER.priority : 'LOW',
      same_day: status_priorities.REVIEW_REMINDER && status_priorities.REVIEW_REMINDER.same_day ? status_priorities.REVIEW_REMINDER.same_day : 'LOW',
      time_mileage: status_priorities.REVIEW_REMINDER && status_priorities.REVIEW_REMINDER.time_mileage !== (undefined || null) ? status_priorities.REVIEW_REMINDER.time_mileage:false,
    },
    CUSTOMER_SIGNATURE: {
      priority: status_priorities.CUSTOMER_SIGNATURE && status_priorities.CUSTOMER_SIGNATURE.priority ? status_priorities.CUSTOMER_SIGNATURE.priority : 'MEDIUM',
      same_day: status_priorities.CUSTOMER_SIGNATURE && status_priorities.CUSTOMER_SIGNATURE.same_day ? status_priorities.CUSTOMER_SIGNATURE.same_day : 'MEDIUM',
      time_mileage: status_priorities.CUSTOMER_SIGNATURE && status_priorities.CUSTOMER_SIGNATURE.time_mileage !== (undefined || null) ? status_priorities.CUSTOMER_SIGNATURE.time_mileage:false,
    },
    CUSTOMER_EXCEPTION: {
      priority: status_priorities.CUSTOMER_EXCEPTION && status_priorities.CUSTOMER_EXCEPTION.priority ? status_priorities.CUSTOMER_EXCEPTION.priority : 'URGENT',
      same_day: status_priorities.CUSTOMER_EXCEPTION && status_priorities.CUSTOMER_EXCEPTION.same_day ? status_priorities.CUSTOMER_EXCEPTION.same_day : 'URGENT',
      time_mileage: status_priorities.CUSTOMER_EXCEPTION && status_priorities.CUSTOMER_EXCEPTION.time_mileage !== (undefined || null) ? status_priorities.CUSTOMER_EXCEPTION.time_mileage:false,
    },
    HELP: {
      priority: status_priorities.HELP && status_priorities.HELP.priority ? status_priorities.HELP.priority : 'URGENT',
      same_day: status_priorities.HELP && status_priorities.HELP.same_day ? status_priorities.HELP.same_day : 'URGENT',
      time_mileage: status_priorities.HELP && status_priorities.HELP.time_mileage !== (undefined || null) ? status_priorities.HELP.time_mileage:false,
    },
    SUBSCRIBED: {
      priority: status_priorities.SUBSCRIBED && status_priorities.SUBSCRIBED.priority ? status_priorities.SUBSCRIBED.priority : 'URGENT',
      same_day: status_priorities.SUBSCRIBED && status_priorities.SUBSCRIBED.same_day ? status_priorities.SUBSCRIBED.same_day : 'URGENT',
      time_mileage: status_priorities.SUBSCRIBED && status_priorities.SUBSCRIBED.time_mileage !== (undefined || null) ? status_priorities.SUBSCRIBED.time_mileage:false,
    },
    UNSUBSCRIBED: {
      priority: status_priorities.UNSUBSCRIBED && status_priorities.UNSUBSCRIBED.priority ? status_priorities.UNSUBSCRIBED.priority : 'URGENT',
      same_day: status_priorities.UNSUBSCRIBED && status_priorities.UNSUBSCRIBED.same_day ? status_priorities.UNSUBSCRIBED.same_day : 'URGENT',
      time_mileage: status_priorities.UNSUBSCRIBED && status_priorities.UNSUBSCRIBED.time_mileage !== (undefined || null) ? status_priorities.UNSUBSCRIBED.time_mileage:false,
    },
    SKIP: {
      priority: status_priorities.SKIP && status_priorities.SKIP.priority ? status_priorities.SKIP.priority : 'LOW',
      same_day: status_priorities.SKIP && status_priorities.SKIP.same_day ? status_priorities.SKIP.same_day : 'LOW',
      time_mileage: status_priorities.SKIP && status_priorities.SKIP.time_mileage !== (undefined || null) ? status_priorities.SKIP.time_mileage:false,
    },
    ORDER: {
      priority: status_priorities.ORDER && status_priorities.ORDER.priority ? status_priorities.ORDER.priority : 'LOW',
      same_day: status_priorities.ORDER && status_priorities.ORDER.same_day ? status_priorities.ORDER.same_day : 'LOW',
      time_mileage: status_priorities.ORDER && status_priorities.ORDER.time_mileage !== (undefined || null) ? status_priorities.ORDER.time_mileage:false,
    },
    SEEN_BY_CUSTOMER: {
      priority: status_priorities.SEEN_BY_CUSTOMER && status_priorities.SEEN_BY_CUSTOMER.priority ? status_priorities.SEEN_BY_CUSTOMER.priority : 'LOW',
      same_day: status_priorities.SEEN_BY_CUSTOMER && status_priorities.SEEN_BY_CUSTOMER.same_day ? status_priorities.SEEN_BY_CUSTOMER.same_day : 'LOW',
      time_mileage: status_priorities.SEEN_BY_CUSTOMER && status_priorities.SEEN_BY_CUSTOMER.time_mileage !== (undefined || null) ? status_priorities.SEEN_BY_CUSTOMER.time_mileage:false,
    },
    CREW_ASSIGNED: {
      priority: status_priorities.CREW_ASSIGNED && status_priorities.CREW_ASSIGNED.priority ? status_priorities.CREW_ASSIGNED.priority : 'LOW',
      same_day: status_priorities.CREW_ASSIGNED && status_priorities.CREW_ASSIGNED.same_day ? status_priorities.CREW_ASSIGNED.same_day : 'HIGH',
      time_mileage: status_priorities.CREW_ASSIGNED && status_priorities.CREW_ASSIGNED.time_mileage !== (undefined || null) ? status_priorities.CREW_ASSIGNED.time_mileage:false,
    },
    CREW_REMOVED: {
      priority: status_priorities.CREW_REMOVED && status_priorities.CREW_REMOVED.priority ? status_priorities.CREW_REMOVED.priority : 'LOW',
      same_day: status_priorities.CREW_REMOVED && status_priorities.CREW_REMOVED.same_day ? status_priorities.CREW_REMOVED.same_day : 'HIGH',
      time_mileage: status_priorities.CREW_REMOVED && status_priorities.CREW_REMOVED.time_mileage !== (undefined || null) ? status_priorities.CREW_REMOVED.time_mileage:false,
    },
    EQUIPMENT_ASSIGNED: {
      priority: status_priorities.EQUIPMENT_ASSIGNED && status_priorities.EQUIPMENT_ASSIGNED.priority ? status_priorities.EQUIPMENT_ASSIGNED.priority : 'LOW',
      same_day: status_priorities.EQUIPMENT_ASSIGNED && status_priorities.EQUIPMENT_ASSIGNED.same_day ? status_priorities.EQUIPMENT_ASSIGNED.same_day : 'LOW',
      time_mileage: status_priorities.EQUIPMENT_ASSIGNED && status_priorities.EQUIPMENT_ASSIGNED.time_mileage !== (undefined || null) ? status_priorities.EQUIPMENT_ASSIGNED.time_mileage:false,
    },
    EQUIPMENT_REMOVED: {
      priority: status_priorities.EQUIPMENT_REMOVED && status_priorities.EQUIPMENT_REMOVED.priority ? status_priorities.EQUIPMENT_REMOVED.priority : 'URGENT',
      same_day: status_priorities.EQUIPMENT_REMOVED && status_priorities.EQUIPMENT_REMOVED.same_day ? status_priorities.EQUIPMENT_REMOVED.same_day : 'URGENT',
      time_mileage: status_priorities.EQUIPMENT_REMOVED && status_priorities.EQUIPMENT_REMOVED.time_mileage !== (undefined || null) ? status_priorities.EQUIPMENT_REMOVED.time_mileage:false,
    },
    ON_HOLD: {
      priority: status_priorities.ON_HOLD && status_priorities.ON_HOLD.priority ? status_priorities.ON_HOLD.priority : 'MEDIUM',
      same_day: status_priorities.ON_HOLD && status_priorities.ON_HOLD.same_day ? status_priorities.ON_HOLD.same_day : 'MEDIUM',
      time_mileage: status_priorities.ON_HOLD && status_priorities.ON_HOLD.time_mileage !== (undefined || null) ? status_priorities.ON_HOLD.time_mileage:false,
    },
    MOVING_TO_STORAGE: {
      priority: status_priorities.MOVING_TO_STORAGE && status_priorities.MOVING_TO_STORAGE.priority ? status_priorities.MOVING_TO_STORAGE.priority : 'MEDIUM',
      same_day: status_priorities.MOVING_TO_STORAGE && status_priorities.MOVING_TO_STORAGE.same_day ? status_priorities.MOVING_TO_STORAGE.same_day : 'MEDIUM',
      time_mileage: status_priorities.MOVING_TO_STORAGE && status_priorities.MOVING_TO_STORAGE.time_mileage !== (undefined || null) ? status_priorities.MOVING_TO_STORAGE.time_mileage:false,
    },
    IN_STORAGE: {
      priority: status_priorities.IN_STORAGE && status_priorities.IN_STORAGE.priority ? status_priorities.IN_STORAGE.priority : 'LOW',
      same_day: status_priorities.IN_STORAGE && status_priorities.IN_STORAGE.same_day ? status_priorities.IN_STORAGE.same_day : 'LOW',
      time_mileage: status_priorities.IN_STORAGE && status_priorities.IN_STORAGE.time_mileage !== (undefined || null) ? status_priorities.IN_STORAGE.time_mileage:false,
    },
    OUT_OF_STORAGE: {
      priority: status_priorities.OUT_OF_STORAGE && status_priorities.OUT_OF_STORAGE.priority ? status_priorities.OUT_OF_STORAGE.priority : 'LOW',
      same_day: status_priorities.OUT_OF_STORAGE && status_priorities.OUT_OF_STORAGE.same_day ? status_priorities.OUT_OF_STORAGE.same_day : 'LOW',
      time_mileage: status_priorities.OUT_OF_STORAGE && status_priorities.OUT_OF_STORAGE.time_mileage !== (undefined || null) ? status_priorities.OUT_OF_STORAGE.time_mileage:false,
    },
    IN_TRANSIT: {
      priority: status_priorities.IN_TRANSIT && status_priorities.IN_TRANSIT.priority ? status_priorities.IN_TRANSIT.priority : 'MEDIUM',
      same_day: status_priorities.IN_TRANSIT && status_priorities.IN_TRANSIT.same_day ? status_priorities.IN_TRANSIT.same_day : 'MEDIUM',
      time_mileage: status_priorities.IN_TRANSIT && status_priorities.IN_TRANSIT.time_mileage !== (undefined || null) ? status_priorities.IN_TRANSIT.time_mileage:false,
    },
    PICKING_UP: {
      priority: status_priorities.PICKING_UP && status_priorities.PICKING_UP.priority ? status_priorities.PICKING_UP.priority : 'MEDIUM',
      same_day: status_priorities.PICKING_UP && status_priorities.PICKING_UP.same_day ? status_priorities.PICKING_UP.same_day : 'MEDIUM',
      time_mileage: status_priorities.PICKING_UP && status_priorities.PICKING_UP.time_mileage !== (undefined || null) ? status_priorities.PICKING_UP.time_mileage:false,
    },
    ARRIVED: {
      priority: status_priorities.ARRIVED && status_priorities.ARRIVED.priority ? status_priorities.ARRIVED.priority : 'MEDIUM',
      same_day: status_priorities.ARRIVED && status_priorities.ARRIVED.same_day ? status_priorities.ARRIVED.same_day : 'MEDIUM',
      time_mileage: status_priorities.ARRIVED && status_priorities.ARRIVED.time_mileage !== (undefined || null) ? status_priorities.ARRIVED.time_mileage:false,
    },
    DEPARTED: {
      priority: status_priorities.DEPARTED && status_priorities.DEPARTED.priority ? status_priorities.DEPARTED.priority : 'MEDIUM',
      same_day: status_priorities.DEPARTED && status_priorities.DEPARTED.same_day ? status_priorities.DEPARTED.same_day : 'MEDIUM',
      time_mileage: status_priorities.DEPARTED && status_priorities.DEPARTED.time_mileage !== (undefined || null)? status_priorities.DEPARTED.time_mileage:false,
    },
    AUTO_START_PENDING: {
      priority: status_priorities.AUTO_START_PENDING && status_priorities.AUTO_START_PENDING.priority ? status_priorities.AUTO_START_PENDING.priority : 'LOW',
      same_day: status_priorities.AUTO_START_PENDING && status_priorities.AUTO_START_PENDING.same_day ? status_priorities.AUTO_START_PENDING.same_day : 'LOW',
      time_mileage: status_priorities.AUTO_START_PENDING && status_priorities.AUTO_START_PENDING.time_mileage !== (undefined || null) ? status_priorities.AUTO_START_PENDING.time_mileage:false,
    },
    AUTO_START: {
      priority: status_priorities.AUTO_START && status_priorities.AUTO_START.priority ? status_priorities.AUTO_START.priority : 'MEDIUM',
      same_day: status_priorities.AUTO_START && status_priorities.AUTO_START.same_day ? status_priorities.AUTO_START.same_day : 'MEDIUM',
      time_mileage: status_priorities.AUTO_START && status_priorities.AUTO_START.time_mileage !== (undefined || null) ? status_priorities.AUTO_START.time_mileage:true,
    },
    AUTO_COMPLETE_PENDING: {
      priority: status_priorities.AUTO_COMPLETE_PENDING && status_priorities.AUTO_COMPLETE_PENDING.priority ? status_priorities.AUTO_COMPLETE_PENDING.priority : 'LOW',
      same_day: status_priorities.AUTO_COMPLETE_PENDING && status_priorities.AUTO_COMPLETE_PENDING.same_day ? status_priorities.AUTO_COMPLETE_PENDING.same_day : 'LOW',
      time_mileage: status_priorities.AUTO_COMPLETE_PENDING && status_priorities.AUTO_COMPLETE_PENDING.time_mileage !== (undefined || null) ? status_priorities.AUTO_COMPLETE_PENDING.time_mileage:false,
    },
    AUTO_COMPLETE: {
      priority: status_priorities.AUTO_COMPLETE && status_priorities.AUTO_COMPLETE.priority ? status_priorities.AUTO_COMPLETE.priority : 'MEDIUM',
      same_day: status_priorities.AUTO_COMPLETE && status_priorities.AUTO_COMPLETE.same_day ? status_priorities.AUTO_COMPLETE.same_day : 'MEDIUM',
      time_mileage: status_priorities.AUTO_COMPLETE && status_priorities.AUTO_COMPLETE.time_mileage !== (undefined || null) ? status_priorities.AUTO_COMPLETE.time_mileage:true,
    },
    RETURNED: {
      priority: status_priorities.RETURNED && status_priorities.RETURNED.priority ? status_priorities.RETURNED.priority : 'MEDIUM',
      same_day: status_priorities.RETURNED && status_priorities.RETURNED.same_day ? status_priorities.RETURNED.same_day : 'MEDIUM',
      time_mileage: status_priorities.RETURNED && status_priorities.RETURNED.time_mileage !== (undefined || null) ? status_priorities.RETURNED.time_mileage:false,
    },
    MANUAL_NOTIFICATION: {
      priority: status_priorities.MANUAL_NOTIFICATION && status_priorities.MANUAL_NOTIFICATION.priority ? status_priorities.MANUAL_NOTIFICATION.priority : 'MEDIUM',
      same_day: status_priorities.MANUAL_NOTIFICATION && status_priorities.MANUAL_NOTIFICATION.same_day ? status_priorities.MANUAL_NOTIFICATION.same_day : 'MEDIUM',
      time_mileage: status_priorities.MANUAL_NOTIFICATION && status_priorities.MANUAL_NOTIFICATION.time_mileage !== (undefined || null) ? status_priorities.MANUAL_NOTIFICATION.time_mileage:false,
    },
  };
  return sorted_status_priorities;
};
