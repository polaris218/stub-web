import React, {Component} from 'react';
import SwaggerUi from 'swagger-ui';
import 'swagger-ui/dist/swagger-ui.css';
import styles from './swagger-component.module.scss';
import _ from 'lodash';
import style from './swagger-override.css';

const DisableAuthorizePlugin = function() {
  return {
    wrapComponents: {
      authorizeBtn: () => () => null
    }
  };
};

export default class SwaggerComponent extends Component {
  constructor(props) {
    super(props);

    this.renderSwaggerApiContent = this.renderSwaggerApiContent.bind(this);

  }

  componentDidMount() {
    this.renderSwaggerApiContent();
  }

  componentWillReceiveProps(nextProps) {
    if (!_.isEqual(nextProps.applicationType, this.props.applicationType)) {
      this.renderSwaggerApiContent();
    }
  }

  renderSwaggerApiContent() {
    let id = "swaggerContainer";
    if (this.props.id) {
      id = this.props.id;
    }


    SwaggerUi({
      dom_id: '#' + id,
      url: this.props.source,
      spec: this.props.source,
      supportedSubmitMethods : [],
      presets: [
        SwaggerUi.presets.apis,
        DisableAuthorizePlugin
      ]
    });
  }

  render() {
    let id = "swaggerContainer";
    if (this.props.id) {
      id = this.props.id;
    }

    return (
      <div id={id} className={styles.swaggerContainer}/>
    );
  }
}
