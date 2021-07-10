import React, { Component } from 'react';
import TotalFiles from './TotalFiles/TotalFiles';
import './docs-section.css';

class DocsSection extends Component {
    state = {

    }

    render() {
        return (
            <div className="docs-section">
                <div className="docs-section__title-row">
                    <h1 className="docs-section__title">Search Results</h1>
                    <TotalFiles filesNum={this.props.totalFiles} />
                </div>
                <div className="docs-section__table-container">
                    {this.props.children}
                </div>
            </div>
        );
    }
}

export default DocsSection;