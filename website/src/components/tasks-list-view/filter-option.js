import React, {Component} from 'react';

import { Checkbox, OverlayTrigger, Tooltip } from 'react-bootstrap';
import styles from './tasks-list-view.module.scss';
import {DragSource, DropTarget} from 'react-dnd';
import { findDOMNode } from 'react-dom';
const cardSource = {
  beginDrag(props) {
    return {
      item: props.item
    };
  }
};

const cardTarget = {
  hover(props, monitor, component) {
    const currentItem = props.item;
    const draggedItem = monitor.getItem().item;
    if (currentItem === draggedItem) {
      return;
    }
    props.dragOptions(currentItem, draggedItem);
  }
};

function collect(connect, monitor) {
  return {
    // Call this function inside render()
    // to let React DnD handle the drag events:
    connectDragSource: connect.dragSource(),
    // You can ask the monitor about the current drag state:
    isDragging: monitor.isDragging()
  };
}

@DropTarget('CARD', cardTarget, connect => ({
  connectDropTarget: connect.dropTarget(),
}))
@DragSource('CARD', cardSource, collect)
export default class FilterOption extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { isDragging, connectDragSource, connectDropTarget } = this.props;
    const { checked, name, onChangeFilter, styleClass, templateName, item } = this.props;
    const option = (
      <Checkbox
        name={name}
        checked={checked}
        onChange={() => {onChangeFilter(item)}}
        className={styleClass}>
        <i className={styles.icon}><img src="images/task-list/menu-bar.svg" alt="icon"/></i>
        <strong>{name.replace('_', ' ')}</strong>
        <i className={styles.icon}>
          <img src={checked ? 'images/task-list/eye.svg' : 'images/task-list/eye_slash.svg'} alt="icon"/>
        </i>
      </Checkbox>
    );

    return (connectDragSource(connectDropTarget(
      <li>
        {this.props.showOverlay &&
        <OverlayTrigger placement="bottom" key={'key' + item} overlay={
          <Tooltip id={'tooltip' + item}>
            <span>Extra field from template: {templateName}</span>
          </Tooltip>
        }>
          <div>
            {option}
          </div>
        </OverlayTrigger>
        }
        {!this.props.showOverlay &&
          option
        }
      </li>
      ))
    );
  }
}
