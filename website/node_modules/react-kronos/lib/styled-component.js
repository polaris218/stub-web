"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = createStyledComponent;

var _react = _interopRequireDefault(require("react"));

var _jss = _interopRequireDefault(require("jss"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function createStyledComponent(Component, rules, options) {
  function attach(rules, options) {
    return _jss.default.createStyleSheet(rules, options).attach();
  }

  function makeUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0;
      var v = c === 'x' ? r : r & 0x3 | 0x8;
      return v.toString(16);
    });
  }

  var StyledComponent =
  /*#__PURE__*/
  function (_React$Component) {
    _inherits(StyledComponent, _React$Component);

    function StyledComponent() {
      _classCallCheck(this, StyledComponent);

      return _possibleConstructorReturn(this, (StyledComponent.__proto__ || Object.getPrototypeOf(StyledComponent)).apply(this, arguments));
    }

    _createClass(StyledComponent, [{
      key: "componentWillMount",
      value: function componentWillMount() {
        var uuid = this.props.instance ? this.props.instance : makeUUID();

        var _rules = typeof rules === 'function' ? rules(this.props, uuid) : rules;

        var _options = typeof options === 'function' ? options(this.props, uuid) : options;

        this.sheet = attach(_rules, _options);
        this.uuid = uuid;
      }
    }, {
      key: "componentWillUnmount",
      value: function componentWillUnmount() {
        this.sheet.detach();
        this.sheet = null;
      }
    }, {
      key: "classSet",
      value: function classSet(classNames) {
        return Object.keys(classNames).filter(function (className) {
          return classNames[className];
        }).map(function (className) {
          return this.sheet.classes[className] || className;
        }).join(' ');
      }
    }, {
      key: "render",
      value: function render() {
        return _react.default.createElement(Component, _extends({
          instance: this.uuid,
          ref: 'kronos',
          classes: this.sheet.classes,
          classSet: this.classSet
        }, this.props));
      }
    }]);

    return StyledComponent;
  }(_react.default.Component); // Support React Hot Loader


  if (module.hot) {
    var HotStyledComponent =
    /*#__PURE__*/
    function (_StyledComponent) {
      _inherits(HotStyledComponent, _StyledComponent);

      function HotStyledComponent() {
        _classCallCheck(this, HotStyledComponent);

        return _possibleConstructorReturn(this, (HotStyledComponent.__proto__ || Object.getPrototypeOf(HotStyledComponent)).apply(this, arguments));
      }

      _createClass(HotStyledComponent, [{
        key: "componentWillReceiveProps",
        value: function componentWillReceiveProps(nextProps) {
          if (this.props !== nextProps) {
            var _rules = typeof rules === 'function' ? rules(nextProps, this.uuid) : rules;

            var _options = typeof options === 'function' ? options(nextProps, this.uuid) : options;

            this.sheet.detach();
            this.sheet = attach(_rules, _options);
          }
        }
      }]);

      return HotStyledComponent;
    }(StyledComponent);

    return HotStyledComponent;
  }

  return StyledComponent;
}