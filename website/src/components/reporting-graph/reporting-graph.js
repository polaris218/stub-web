import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Keen from 'keen-js';
import { getErrorMessage } from '../../helpers/task';

export default class ReportingGraph extends Component {
  constructor(props) {
    super(props);

    this.renderGraph = this.renderGraph.bind(this);
  }

  componentDidMount() {
    this.renderGraph();
  }

  componentWillReceiveProps(nextProps) {
    this.renderGraph(nextProps.data, nextProps.error);
  }

  renderGraph(data = this.props.data, error = this.props.error) {
    if (this.props && this.props.title) {
      const element = document.getElementById(this.props.chartId + '');
      const chart = new Keen.Dataviz()
        .el(element)
        .height(400)
        .title(this.props.title)
        .type(this.props.type)
        .stacked(this.props.isStacked)
        .colors(this.props.colors ? this.props.colors : ['#00bbde', '#fe6672'])
        .prepare();
      if (data) {
        if (this.props.mapLabel) {
          chart
            .data(data)
            .title(null)
            .labelMapping({
              'Result': this.props.mapLabel,
            })
            .chartOptions(this.props.chartOptions)
            .render();
        } else {
          chart
            .data(data)
            .title(null)
            .chartOptions(this.props.chartOptions)
            .render();
        }
      } else if (error && error.message) {
        chart
          .message(error.message);
      } else if (error) {
        chart
          .message(getErrorMessage(JSON.parse(error.responseText)));
      }
    }
  }

  render() {
    return (
      <div id={this.props.chartId ? this.props.chartId + '' : 'chart'}/>
    );
  }
}

ReportingGraph.propTypes = {
  data: PropTypes.object,
  error: PropTypes.object,
  title: PropTypes.string,
  type: PropTypes.string,
  isStacked: PropTypes.bool,
  chartId: PropTypes.string,
  mapLabel: PropTypes.string
};
