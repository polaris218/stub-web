export const STATUS_META_DATA = {
  NOTSTARTED: {
    type: 'NOTSTARTED',
    isTerminal: false,
    isDeletePossible: false,
    isInternal: false,
    isTaskLatestStatus: true,
    showEntityPinOnMap: false,
    showEntityDirectionsOnMap: false
  },
  SCHEDULED: {
    type: 'SCHEDULED',
    isTerminal: false,
    isDeletePossible: false,
    isInternal: false,
    isTaskLatestStatus: true,
    showEntityPinOnMap: false,
    showEntityDirectionsOnMap: false
  },
  ENROUTE: {
    type: 'ENROUTE',
    isTerminal: false,
    isDeletePossible: true,
    isInternal: false,
    isTaskLatestStatus: true,
    showEntityPinOnMap: true,
    showEntityDirectionsOnMap: true
  },
  STARTED: {
    type: 'STARTED',
    isTerminal: false,
    isDeletePossible: true,
    isInternal: false,
    isTaskLatestStatus: true,
    showEntityPinOnMap: true,
    showEntityDirectionsOnMap: false
  },
  COMPLETE: {
    type: 'COMPLETE',
    isTerminal: true,
    isDeletePossible: true,
    isInternal: false,
    isTaskLatestStatus: true,
    showEntityPinOnMap: false,
    showEntityDirectionsOnMap: false
  },
  CANCELLED: {
    type: 'CANCELLED',
    isTerminal: true,
    isDeletePossible: true,
    isInternal: false,
    isTaskLatestStatus: true,
    showEntityPinOnMap: false,
    showEntityDirectionsOnMap: false
  },
  EXCEPTION: {
    type: 'EXCEPTION',
    isTerminal: true,
    isDeletePossible: true,
    isInternal: false,
    isTaskLatestStatus: true,
    showEntityPinOnMap: false,
    showEntityDirectionsOnMap: false
  },
  CUSTOM: {
    type: 'CUSTOM',
    isTerminal: false,
    isDeletePossible: true,
    isInternal: true,
    isTaskLatestStatus: false,
    showEntityPinOnMap: false,
    showEntityDirectionsOnMap: false
  },
  PREPARING: {
    type: 'PREPARING',
    isTerminal: false,
    isDeletePossible: true,
    isInternal:  false,
    isTaskLatestStatus: true,
    showEntityPinOnMap: false,
    showEntityDirectionsOnMap: false
  },
  READYFORPICKUP: {
    type: 'READYFORPICKUP',
    isTerminal: false,
    isDeletePossible: true,
    isInternal: false,
    isTaskLatestStatus: true,
    showEntityPinOnMap: false,
    showEntityDirectionsOnMap: false
  },
  CONFIRMED: {
    type: 'CONFIRMED',
    isTerminal: false,
    isDeletePossible: true,
    isInternal: false,
    isTaskLatestStatus: true,
    showEntityPinOnMap: false,
    showEntityDirectionsOnMap: false
  },
  RESCHEDULED: {
    type: 'RESCHEDULED',
    isTerminal: false,
    isDeletePossible: false,
    isInternal: true,
    isTaskLatestStatus: true,
    showEntityPinOnMap: false,
    showEntityDirectionsOnMap: false
  },
  ARRIVING: {
    type: 'ARRIVING',
    isTerminal: false,
    isDeletePossible: false,
    isInternal: true,
    isTaskLatestStatus: true,
    showEntityPinOnMap: true,
    showEntityDirectionsOnMap: true
  },
  LATE: {
    type: 'LATE',
    isTerminal: false,
    isDeletePossible: false,
    isInternal: true,
    isTaskLatestStatus: true,
    showEntityPinOnMap: false,
    showEntityDirectionsOnMap: false
  },
  NOSHOW: {
    type: 'NOSHOW',
    isTerminal: true,
    isDeletePossible: false,
    isInternal: true,
    isTaskLatestStatus: true,
    showEntityPinOnMap: false,
    showEntityDirectionsOnMap: false
  },
  EXTRA_TIME: {
    type: 'EXTRA_TIME',
    isTerminal: false,
    isDeletePossible: true,
    isInternal: false,
    isTaskLatestStatus: true,
    showEntityPinOnMap: false,
    showEntityDirectionsOnMap: false
  },
  REMINDER: {
    type: 'REMINDER',
    isTerminal: false,
    isDeletePossible: false,
    isInternal:  true,
    isTaskLatestStatus: false,
    showEntityPinOnMap: false,
    showEntityDirectionsOnMap: false
  },
  RECOMMENDED: {
    type: 'RECOMMENDED',
    isTerminal: true,
    isDeletePossible: true,
    isInternal: false,
    isTaskLatestStatus: true,
    showEntityPinOnMap: false,
    showEntityDirectionsOnMap: false
  },
  REVIEW_REMINDER: {
    type: 'REVIEW_REMINDER',
    isTerminal: false,
    isDeletePossible: false,
    isInternal: true,
    isTaskLatestStatus: false,
    showEntityPinOnMap: false,
    showEntityDirectionsOnMap: false
  },
  CUSTOMER_SIGNATURE: {
    type: 'CUSTOMER_SIGNATURE',
    isTerminal: false,
    isDeletePossible: true,
    isInternal: false,
    isTaskLatestStatus: true,
    showEntityPinOnMap: false,
    showEntityDirectionsOnMap: false
  },
  CUSTOMER_EXCEPTION: {
    type: 'CUSTOMER_EXCEPTION',
    isTerminal: true,
    isDeletePossible: true,
    isInternal: false,
    isTaskLatestStatus: true,
    showEntityPinOnMap: false,
    showEntityDirectionsOnMap: false
  },
  SEEN_BY_CUSTOMER: {
    type: 'SEEN_BY_CUSTOMER',
    isTerminal: false,
    isDeletePossible: false,
    isInternal: true,
    isTaskLatestStatus: false,
    showEntityPinOnMap: false,
    showEntityDirectionsOnMap: false
  },
  CREW_ASSIGNED: {
    type: 'CREW_ASSIGNED',
    isTerminal: false,
    isDeletePossible: false,
    isInternal: true,
    isTaskLatestStatus: false,
    showEntityPinOnMap: false,
    showEntityDirectionsOnMap: false
  },
  CREW_REMOVED: {
    type: 'CREW_REMOVED',
    isTerminal: false,
    isDeletePossible: false,
    isInternal: true,
    isTaskLatestStatus: false,
    showEntityPinOnMap: false,
    showEntityDirectionsOnMap: false
  },
  EQUIPMENT_ASSIGNED: {
    type: 'EQUIPMENT_ASSIGNED',
    isTerminal: false,
    isDeletePossible: false,
    isInternal: true,
    isTaskLatestStatus: false,
    showEntityPinOnMap: false,
    showEntityDirectionsOnMap: false
  },
  EQUIPMENT_REMOVED: {
    type: 'EQUIPMENT_REMOVED',
    isTerminal: false,
    isDeletePossible: false,
    isInternal: true,
    isTaskLatestStatus: false,
    showEntityPinOnMap: false,
    showEntityDirectionsOnMap: false
  },
  ON_HOLD: {
    type: 'ON_HOLD',
    isTerminal: false,
    isDeletePossible: true,
    isInternal: false,
    isTaskLatestStatus: true,
    showEntityPinOnMap: false,
    showEntityDirectionsOnMap: false
  },
  MOVING_TO_STORAGE: {
    type: 'MOVING_TO_STORAGE',
    isTerminal: false,
    isDeletePossible: true,
    isInternal: false,
    isTaskLatestStatus: true,
    showEntityPinOnMap: false,
    showEntityDirectionsOnMap: false
  },
  IN_STORAGE: {
    type: 'IN_STORAGE',
    isTerminal: false,
    isDeletePossible: true,
    isInternal: false,
    isTaskLatestStatus: true,
    showEntityPinOnMap: false,
    showEntityDirectionsOnMap: false
  },
  OUT_OF_STORAGE: {
    type: 'OUT_OF_STORAGE',
    isTerminal: false,
    isDeletePossible: true,
    isInternal: false,
    isTaskLatestStatus: true,
    showEntityPinOnMap: false,
    showEntityDirectionsOnMap: false
  },
  IN_TRANSIT: {
    type: 'IN_TRANSIT',
    isTerminal: false,
    isDeletePossible: true,
    isInternal: false,
    isTaskLatestStatus: true,
    showEntityPinOnMap: false,
    showEntityDirectionsOnMap: false
  },
  PICKING_UP: {
    type: 'PICKING_UP',
    isTerminal: false,
    isDeletePossible: true,
    isInternal: false,
    isTaskLatestStatus: true,
    showEntityPinOnMap: false,
    showEntityDirectionsOnMap: false
  },
  ARRIVED: {
    type: 'ARRIVED',
    isTerminal: false,
    isDeletePossible: false,
    isInternal: true,
    isTaskLatestStatus: false,
    showEntityPinOnMap: true,
    showEntityDirectionsOnMap: false
  },
  DEPARTED: {
    type: 'DEPARTED',
    isTerminal: false,
    isDeletePossible: false,
    isInternal: true,
    isTaskLatestStatus: false,
    showEntityPinOnMap: false,
    showEntityDirectionsOnMap: false
  },
  AUTO_START_PENDING: {
    type: 'AUTO_START_PENDING',
    isTerminal: false,
    isDeletePossible: false,
    isInternal: true,
    isTaskLatestStatus: false,
    showEntityPinOnMap: true,
    showEntityDirectionsOnMap: false
  },
  AUTO_START: {
    type: 'AUTO_START',
    isTerminal: false,
    isDeletePossible: false,
    isInternal: true,
    isTaskLatestStatus: true,
    showEntityPinOnMap: true,
    showEntityDirectionsOnMap: false
  },
  AUTO_COMPLETE_PENDING: {
    type: 'AUTO_COMPLETE_PENDING',
    isTerminal: false,
    isDeletePossible: false,
    isInternal: true,
    isTaskLatestStatus: false,
    showEntityPinOnMap: false,
    showEntityDirectionsOnMap: false
  },
  AUTO_COMPLETE: {
    type: 'AUTO_COMPLETE',
    isTerminal: true,
    isDeletePossible: false,
    isInternal: true,
    isTaskLatestStatus: true,
    showEntityPinOnMap: false,
    showEntityDirectionsOnMap: false
  },
  RETURNED: {
    type: 'RETURNED',
    isTerminal: false,
    isDeletePossible: false,
    isInternal: true,
    isTaskLatestStatus: false,
    showEntityPinOnMap: false,
    showEntityDirectionsOnMap: false
  },
  ORDER: {
    type: 'ORDER',
    isTerminal: false,
    isDeletePossible: true,
    isInternal: false,
    isTaskLatestStatus: false,
    showEntityPinOnMap: false,
    showEntityDirectionsOnMap: false
  },
  SKIP: {
    type: 'SKIP',
    isTerminal: true,
    isDeletePossible: true,
    isInternal: false,
    isTaskLatestStatus: true,
    showEntityPinOnMap: false,
    showEntityDirectionsOnMap: false
  },
  SUBSCRIBED: {
    type: 'SUBSCRIBED',
    isTerminal: false,
    isDeletePossible: false,
    isInternal: true,
    isTaskLatestStatus: false,
    showEntityPinOnMap: false,
    showEntityDirectionsOnMap: false
  },
  UNSUBSCRIBED: {
    type: 'UNSUBSCRIBED',
    isTerminal: false,
    isDeletePossible: false,
    isInternal: true,
    isTaskLatestStatus: false,
    showEntityPinOnMap: false,
    showEntityDirectionsOnMap: false
  },
  HELP: {
    type: 'HELP',
    isTerminal: false,
    isDeletePossible: false,
    isInternal: true,
    isTaskLatestStatus: false,
    showEntityPinOnMap: false,
    showEntityDirectionsOnMap: false
  }
};
