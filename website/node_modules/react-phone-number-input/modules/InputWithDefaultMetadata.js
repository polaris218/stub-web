import _extends from 'babel-runtime/helpers/extends';
import _Object$getPrototypeOf from 'babel-runtime/core-js/object/get-prototype-of';
import _classCallCheck from 'babel-runtime/helpers/classCallCheck';
import _createClass from 'babel-runtime/helpers/createClass';
import _possibleConstructorReturn from 'babel-runtime/helpers/possibleConstructorReturn';
import _inherits from 'babel-runtime/helpers/inherits';
import React, { Component } from 'react';
import metadata from 'libphonenumber-js/metadata.min.json';

import Input from './Input';

var InputWithDefaultMetadata = function (_Component) {
	_inherits(InputWithDefaultMetadata, _Component);

	function InputWithDefaultMetadata() {
		_classCallCheck(this, InputWithDefaultMetadata);

		return _possibleConstructorReturn(this, (InputWithDefaultMetadata.__proto__ || _Object$getPrototypeOf(InputWithDefaultMetadata)).apply(this, arguments));
	}

	_createClass(InputWithDefaultMetadata, [{
		key: 'render',
		value: function render() {
			var _this2 = this;

			return React.createElement(Input, _extends({
				ref: function ref(_ref) {
					return _this2.input = _ref;
				}
			}, this.props, {
				metadata: metadata }));
		}
	}, {
		key: 'focus',
		value: function focus() {
			return this.input.focus();
		}
	}]);

	return InputWithDefaultMetadata;
}(Component);

export default InputWithDefaultMetadata;
//# sourceMappingURL=InputWithDefaultMetadata.js.map