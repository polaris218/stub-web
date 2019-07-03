import React, { Component } from 'react';
import styles from './open-api-container.module.scss';
import SwaggerComponent from '../swagger-component/swagger-component';
import { FormControl } from 'react-bootstrap';

export default class OpenAPIContainer extends Component {
  constructor(props) {
    super(props);

    this.renderSwaggerComponent = this.renderSwaggerComponent.bind(this);
  }

  renderSwaggerComponent() {
    const content = this.props.data.content;
    let contentAccordingToApplicationType = null;
    if (this.props.applicationType in content) {
      contentAccordingToApplicationType = content[this.props.applicationType];
    } else {
      contentAccordingToApplicationType = content;
    }
    let path = contentAccordingToApplicationType.path;
    let id = contentAccordingToApplicationType.id;
    let mdSource = null;
    if (path.indexOf('/docs/') !== -1 || path.indexOf('/api_reference_docs/') !== -1){
      const rawFile = new XMLHttpRequest();
      rawFile.open('GET', path, false);
      rawFile.onreadystatechange = function () {
        if (rawFile.readyState === 4) {
          if (rawFile.status === 200 || rawFile.status === 0) {
            mdSource = rawFile.responseText;
          }
        }
      };
      rawFile.send(null);
    } else {
      mdSource = this.props.data.content;
    }
    mdSource = JSON.parse(mdSource);
    return (
      <SwaggerComponent
        applicationType={this.props.applicationType}
        source={mdSource}
        id={id}
        key={'idx_swagger_comp_' + id}
      />
    );
  }

  render () {
    return (
      <div id={this.props.data.id} className={styles.openAPIContainer}>
        {this.props.data.id === 'swagger_open_api_2' &&
          <p className={styles.applicationTypeSwitcherIntro}>
            All APIs support application/json and application/urlform_encoded as possible contentTypes. Please select the one appropriate according to your integration.
          </p>
        }
        <div className={styles.applicationTypeSelectorContainer}>
          <FormControl value={this.props.applicationType} onChange={(e) => { this.props.handleApplicationTypeChange(e, e.target.value) }} className="col-md-3" componentClass="select">
            <option value="json">json</option>
            <option value="formData">formData</option>
          </FormControl>
        </div>
        { this.renderSwaggerComponent() }
      </div>
    );
  }

}
