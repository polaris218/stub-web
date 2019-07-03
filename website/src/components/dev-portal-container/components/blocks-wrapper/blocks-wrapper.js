import React, { Component } from 'react';
import PropTypes from 'prop-types';
import TextComponent from '../text-component/text-component';
import MarkdownComponent from '../markdown-component/markdown-component';
import CodeComponent from '../code-component/code-component';
import ImageComponent from '../image-component/image-component';
import CodeUIComponent from '../code-ui-component/code-ui-component';
import CodeExecComponent from '../code-execute-component/code-execute-component';
import LiveTrackExecute from '../live-track-execute-component/live-track-execute-component';
import Waypoint from 'react-waypoint';
import OpenAPIContainer from '../open-api-container/open-api-container';
import styles from './blocks-wrapper.module.scss';

export default class BlocksWrapper extends Component {
  constructor(props) {
    super(props);

    this.renderComponents = this.renderComponents.bind(this);
  }

  renderComponents() {
    const componentType = this.props.type;
    if (componentType === 'PARAGRAPH') {
      return (
        <div className={styles.widgets}>
          <Waypoint
            onEnter={() => this.props.elementEnteredInView(this.props.data.id, true)}
          />
          <TextComponent key={this.props.contentId} data={this.props.data} />
        </div>
      );
    } else if (componentType === 'MARKDOWN') {
      return (
        <div className={styles.widgets}>
          <Waypoint
            onEnter={() => this.props.elementEnteredInView(this.props.data.id, true)}
          />
          <MarkdownComponent key={this.props.contentId} data={this.props.data} />
        </div>
      );
    } else if (componentType === 'CODE') {
      return (
        <div className={styles.widgets}>
          <Waypoint
            onEnter={() => this.props.elementEnteredInView(this.props.data.id, true)}
          />
          <CodeComponent key={this.props.contentId} data={this.props.data} />
        </div>
      );
    } else if (componentType === 'IMAGE') {
      return (
        <div className={styles.widgets}>
          <Waypoint
            onEnter={() => this.props.elementEnteredInView(this.props.data.id, true)}
          />
          <ImageComponent key={this.props.contentId} data={this.props.data} />
        </div>
      );
    } else if (componentType === 'CODEUI') {
      return (
        <div>
          <Waypoint
            onEnter={() => this.props.elementEnteredInView(this.props.data.id, true)}
          />
          <CodeUIComponent key={this.props.contentId} data={this.props.data} />
        </div>
      );
    } else if (componentType === 'CODEEXEC') {
      return (
        <div className={styles.widgets}>
          <Waypoint
            onEnter={() => this.props.elementEnteredInView(this.props.data.id, true)}
          />
          <CodeExecComponent key={this.props.contentId} data={this.props.data} />
        </div>
      );
    } else if (componentType === 'LIVECODEEXEC') {
      return (
        <div>
          <Waypoint
            onEnter={() => this.props.elementEnteredInView(this.props.data.id, true)}
          />
          <LiveTrackExecute key={this.props.contentId} data={this.props.data} />
        </div>
      );
    } else if (componentType === 'SWAGGER') {
      return (
        <div className={styles.widgets}>
          <Waypoint
            onEnter={() => this.props.elementEnteredInView(this.props.data.id, true)}
          />
          <OpenAPIContainer key={this.props.contentId} handleApplicationTypeChange={this.props.handleApplicationTypeChange} applicationType={this.props.applicationType} data={this.props.data} />
        </div>
      );
    }
  }

  render() {
    return (
      <div>
        {this.renderComponents()}
      </div>
    );
  }

}

BlocksWrapper.propTypes = {
  data: PropTypes.object,
  type: PropTypes.string,
  elementEnteredInView: PropTypes.func
};
