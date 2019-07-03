'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _entity = require('./entity');

var _entity2 = _interopRequireDefault(_entity);

var _eventsMarker = require('../events/marker');

var _eventsMarker2 = _interopRequireDefault(_eventsMarker);

exports['default'] = (0, _entity2['default'])('Marker', 'position', _eventsMarker2['default']);
module.exports = exports['default'];