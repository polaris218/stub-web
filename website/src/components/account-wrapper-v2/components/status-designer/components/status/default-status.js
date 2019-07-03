import React, { Component } from 'react';
import PropTypes from 'prop-types';

import styles from './status.module.scss';
import { DragSource } from 'react-dnd';
import { Tooltip, OverlayTrigger } from 'react-bootstrap';


const cardSource = {
  beginDrag(props) {
    return {
      index: props.index,
      listId: props.id,
      card: props.status
    };
  },

  endDrag(props, monitor) {
    const item = monitor.getItem();
    if (item.card.type_id === 1004) {
      alert('There can only one status with type COMPLETE in a template');
    } else {
      props.pushCard(item.card);
    }
  }
};

/**
 * Specifies which props to inject into your component.
 */
function collect(connect, monitor) {
  return {
    // Call this function inside render()
    // to let React DnD handle the drag events:
    connectDragSource: connect.dragSource(),
    // You can ask the monitor about the current drag state:
    isDragging: monitor.isDragging()
  };
}

@DragSource('CARD', cardSource, collect)
export default class DefaultStatus extends Component {
  constructor(props) {
    super(props);
    this.state = {
      status: this.props.status
    };
    this.handleStatusDoubleClick = this.handleStatusDoubleClick.bind(this);
  }

  handleStatusDoubleClick(e) {
    e.preventDefault();
    e.stopPropagation();
    this.props.pushCard(this.props.status);
  }

  render() {
    const { isDragging, connectDragSource } = this.props;
    let style = '';
    if (this.state.status.color) {
      style = {
        background: this.state.status.color,
        borderColor: this.state.status.color };
    } else {
      style = {
        background: '#999',
        borderColor: '#999'
      };
    }

    const tooltip = (
      <Tooltip id={this.state.status.type_id}>{this.state.status.description}</Tooltip>
    );

    return connectDragSource(
      <span>
        <OverlayTrigger placement="bottom" overlay={tooltip}>
          <div onDoubleClick={(e) => this.handleStatusDoubleClick(e)} style={style} className={styles.statusBar}>
            {this.state.status.title !== '' ? this.state.status.title : 'CUSTOM'}
          </div>
        </OverlayTrigger>
      </span>
    );
  }
}

DefaultStatus.propTypes = {
  status: PropTypes.object.isRequired
};
