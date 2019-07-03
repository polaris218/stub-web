'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _metadataMin = require('libphonenumber-js/metadata.min.json');

var _metadataMin2 = _interopRequireDefault(_metadataMin);

var _Input = require('./Input');

var _Input2 = _interopRequireDefault(_Input);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var InputWithDefaultMetadata = function (_Component) {
	(0, _inherits3.default)(InputWithDefaultMetadata, _Component);

	function InputWithDefaultMetadata() {
		(0, _classCallCheck3.default)(this, InputWithDefaultMetadata);
		return (0, _possibleConstructorReturn3.default)(this, (InputWithDefaultMetadata.__proto__ || (0, _getPrototypeOf2.default)(InputWithDefaultMetadata)).apply(this, arguments));
	}

	(0, _createClass3.default)(InputWithDefaultMetadata, [{
		key: 'render',
		value: function render() {
			var _this2 = this;

			return _react2.default.createElement(_Input2.default, (0, _extends3.default)({
				ref: function ref(_ref) {
					return _this2.input = _ref;
				}
			}, this.props, {
				metadata: _metadataMin2.default }));
		}
	}, {
		key: 'focus',
		value: function focus() {
			return this.input.focus();
		}
	}]);
	return InputWithDefaultMetadata;
}(_react.Component);

exports.default = InputWithDefaultMetadata;
//# sourceMappingURL=InputWithDefaultMetadata.js.map