export const STATUS_DICT = {
  NOTSTARTED: {
    label: 'Not Started',
    color: '#4E4646',
    style: 'notstarted',
    type: 'NOTSTARTED'
  },
  ENROUTE: {
    label: 'On our way',
    color: '#6aa3d7',
    style: 'enroute',
    type: 'ENROUTE'
  },
  STARTED: {
    label: 'Start',
    color: '#2ee7fb',
    style: 'stared',
    type: 'STARTED'
  },
  COMPLETE: {
    label: 'Complete',
    color: '#5fe23f',
    style: 'complete',
    type: 'COMPLETE'
  },
  CANCELLED: {
    label: 'Cancel',
    color: '#ea583d',
    style: 'cancelled',
    type: 'CANCELLED'
  },
  EXCEPTION: {
    label: 'Exception',
    color: '#fd8b86',
    style: 'exception',
    type: 'EXCEPTION'
  },
  PREPARING: {
    label: 'Preparing',
    color: '#ff9608',
    style: 'preparing',
    type: 'PREPARING'
  },
  CONFIRMED: {
    label: 'Confirm',
    color: '#4cc791',
    style: 'confirmed',
    type: 'CONFIRMED'
  },
  READYFORPICKUP: {
    label: 'Ready for Pickup',
    color: '#7b85d6',
    style: 'readyforpickup',
    type: 'READYFORPICKUP'
  },
  CUSTOMER_EXCEPTION: {
    label: 'Customer Exception',
    color: '#fd8b86',
    style: 'exception',
    type: 'CUSTOMER_EXCEPTION'
  },
  REVIEW_REMINDER: {
    label: 'Review Reminder',
    color: '#44a7f1',
    style: 'review_reminder',
    type: 'REVIEW_REMINDER'
  },
  RESCHEDULED: {
    label: 'Rescheduled',
    color: '#2d2a2a',
    style: 'rescheduled',
    type: 'RESCHEDULED'
  },
  RECOMMENDED: {
    label: 'Recommended',
    color: '#24ab95',
    style: 'recommended',
    type: 'RECOMMENDED'
  },
  REMINDER: {
    label: 'Reminder',
    color: '#44a7f1',
    style: 'reminder',
    type: 'REMINDER'
  },
  LATE: {
    label: 'Late',
    color: '#44a7f1',
    style: 'late',
    type: 'LATE'
  },
  NOSHOW: {
    label: 'No Show',
    color: '#44a7f1',
    style: 'noshow',
    type: 'NOSHOW'
  },
  SEEN_BY_CUSTOMER: {
    label: 'Seen By Customer',
    color: '#44a7f1',
    style: 'seen_by_customer',
    type: 'SEEN_BY_CUSTOMER'
  },
  CREW_ASSIGNED: {
    label: 'Crew Assigned',
    color: '#7bd8d2',
    style: 'crew_assigned',
    type: 'CREW_ASSIGNED'
  },
  CREW_REMOVED: {
    label: 'Crew Removed',
    color: '#e0889a',
    style: 'crew_removed',
    type: 'CREW_REMOVED'
  },
  EQUIPMENT_ASSIGNED: {
    label: 'Equipment Assigned',
    color: '#e0c3ac',
    style: 'equipment_assigned',
    type: 'EQUIPMENT_ASSIGNED'
  },
  EQUIPMENT_REMOVED: {
    label: 'Equipment Removed',
    color: '#e5b5d3',
    style: 'equipment_assigned',
    type: 'EQUIPMENT_REMOVED'
  },
  ARRIVING: {
    label: 'Approaching',
    color: '#44a7f1',
    style: 'arriving',
    type: 'ARRIVING'
  },
  EXTRA_TIME: {
    label: 'Extra Time',
    color: '#29B6F6',
    style: 'extra_time',
    type: 'EXTRA_TIME'
  },
  CUSTOMER_SIGNATURE: {
    label: 'Customer Signature',
    color: '#964646',
    style: 'customer_signature',
    type: 'CUSTOMER_SIGNATURE'
  },
  ON_HOLD: {
    label: 'On hold',
    color: '#F57C00',
    style: 'onhold',
    type: 'ON_HOLD'
  },
  MOVING_TO_STORAGE: {
    label: 'Moving to Storage',
    color: '#039BE5',
    style: 'movingtostorage',
    type: 'MOVING_TO_STORAGE'
  },
  IN_STORAGE: {
    label: 'In Storage',
    color: '#81D4FA',
    style: 'instorage',
    type: 'IN_STORAGE'
  },
  OUT_OF_STORAGE: {
    label: 'Out of Storage',
    color: '#039BE5',
    style: 'outofstorage',
    type: 'OUT_OF_STORAGE'
  },
  IN_TRANSIT: {
    label: 'In transit',
    color: '#607D8B',
    style: 'intransit',
    type: 'IN_TRANSIT'
  },
  PICKING_UP: {
    label: 'Picking Up',
    color: '#5E35B1',
    style: 'pickingup',
    type: 'PICKING_UP'
  },
  ARRIVED: {
    label: 'Arrived',
    color: '#44a7f1',
    style: 'arrived',
    type: 'ARRIVED'
  },
  DEPARTED: {
    label: 'Departed',
    color: '#44a7f1',
    style: 'departed',
    type: 'DEPARTED'
  },
  AUTO_START_PENDING: {
    label: 'Auto Start Pending',
    color: '#44a7f1',
    style: 'auto_start_pending',
    type: 'AUTO_START_PENDING'
  },
  AUTO_START: {
    label: 'Auto Start',
    color: '#44a7f1',
    style: 'auto_start',
    type: 'AUTO_START'
  },
  AUTO_COMPLETE_PENDING: {
    label: 'Auto Complete Pending',
    color: '#44a7f1',
    style: 'auto_complete_pending',
    type: 'AUTO_COMPLETE_PENDING'
  },
  AUTO_COMPLETE: {
    label: 'Auto Complete',
    color: '#44a7f1',
    style: 'auto_complete',
    type: 'AUTO_COMPLETE'
  },
  RETURNED: {
    label: 'Returned',
    color: '#44a7f1',
    style: 'returned',
    type: 'RETURNED'
  },
  ORDER: {
    label: 'Order',
    color: '#efbdaa',
    style: 'order',
    type: 'ORDER'
  },
  SKIP: {
    label: 'Skip',
    color: '#db9797',
    style: 'skip',
    type: 'SKIP'
  },
  CUSTOM: {
    label: 'Customer Note',
    color: '#999999',
    style: 'custom',
    type: 'CUSTOM'
  },
  TEAM_NOTE: {
    label: 'Team Note',
    color: '#999999',
    style: 'custom',
    type: 'CUSTOM'
  },
  SUBSCRIBED: {
    label: 'Subscribe',
    color: '#999999',
    style: 'subscribed',
    type: 'SUBSCRIBED'
  },
  UNSUBSCRIBED: {
    label: 'Un-Subscribe',
    color: '#999999',
    style: 'un-subscribe',
    type: 'UNSUBSCRIBED'
  },
  HELP: {
    label: 'Help',
    color: '#999999',
    style: 'help',
    type: 'HELP'
  },
  MANUAL_NOTIFICATION: {
    label: 'Manual Notification',
    color: '#0054a6',
    style: 'manual notification',
    type: 'MANUAL_NOTIFICATION'
  }
};
