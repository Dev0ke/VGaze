// src/components/records/RecordsApplication.jsx

import React, { Component } from 'react';
import ApplicationNotebook from './ApplicationNotebook';
import PropTypes from 'prop-types';

class RecordsApplication extends Component {
    static propTypes = {
        // 可以根据需要添加适当的 propTypes
        recordId: PropTypes.string.isRequired,
    };

    render() {
        const { recordId } = this.props;

        return (
            <div className="records-application">
                <ApplicationNotebook recordId={recordId} />
            </div>
        );
    }
}

export default RecordsApplication;
