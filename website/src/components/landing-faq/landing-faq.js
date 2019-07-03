import React, { Component } from 'react';
import { Grid, Row, Col } from 'react-bootstrap';
import styles from './landing-faq.module.scss';
//import './landing-feature.css';

export default class LandingFAQ extends Component {
    getChunks(array, size) {
        var results = [],
            arr = array.slice();                                                                        
        while (arr.length) {
            results.push(arr.splice(0, size));
        }
        return results;
    }

    render() {
        let rows = this.getChunks(this.props.data.qq, 2).map((chunk, cIdx) => {
            let cols = chunk.map((question, qIdx) => {
                return (<Col key={question.header} className={styles.question} sm={12} md={6}>
                            <h2>{question.header}</h2>
                            <p>{question.content}</p>
                        </Col>)
            });
            return <Row key={cIdx} className={styles['question-section']}>{cols}</Row>
        });
        return (<section className={styles['faq-section']}>
                    <h1 className={styles['section-header']}>{this.props.data.header}</h1>
                    <Grid>
                        {rows}
                    </Grid>
                </section>)
    }
};