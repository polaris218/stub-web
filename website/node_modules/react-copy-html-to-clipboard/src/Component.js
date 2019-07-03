import React from 'react';
import PropTypes from 'prop-types';
import copy from 'copy-html-to-clipboard';


export class CopyToClipboard extends React.PureComponent {
  static propTypes = {
    text: PropTypes.any.isRequired,
    children: PropTypes.element.isRequired,
    onCopy: PropTypes.func,
    options: PropTypes.shape({
      debug: PropTypes.bool,
      message: PropTypes.string,
      asHtml: PropTypes.bool,
      onlyHtml: PropTypes.bool,
      canUsePrompt: PropTypes.bool,
    })
  };

  onClick = event => {
    const {
      text,
      onCopy,
      children,
      options
    } = this.props;

    const elem = React.Children.only(children);

    let textToCopy;
    if (typeof text == 'function')
        textToCopy = text();
    else
        textToCopy = text;

    const result = copy(textToCopy, options);

    if (onCopy) {
      onCopy(textToCopy, result);
    }

    // Bypass onClick/onTouchTap if it was present
    if (elem && elem.props && typeof elem.props.onClick === 'function') {
      elem.props.onClick(event);
    } else if (elem && elem.props && typeof elem.props.onTouchTap === 'function') {
      elem.props.onTouchTap(event);
    }
  };

  render() {
    const {
      text: _text,
      onCopy: _onCopy,
      options: _options,
      children,
      ...props
    } = this.props;
    const elem = React.Children.only(children);

    return React.cloneElement(elem, {...props, onClick: this.onClick, onTouchTap: this.onClick});
  }
}
