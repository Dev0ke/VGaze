// src/components/records/ApplicationNotebook.jsx

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { CancelToken } from 'axios';
import api from '../core/api-service.jsx';
import NotebookRenderer from '../notebooks/notebook-renderer.jsx';
import _ from 'lodash';
import moduleName from 'module';
import Spinner from '../utils/spinner.jsx';

const POLL_TIME = 5000;

class ApplicationNotebook extends Component {
    static propTypes = {
        recordId: PropTypes.string.isRequired,
    };

    state = {
        notebook: {},
        loading: true,
    }

    componentDidMount() {
        this.source = CancelToken.source();
        this.interval = setInterval(this.fetchNotebooks, POLL_TIME);
        this.fetchNotebooks();
    }

    componentWillUnmount() {
        this.source.cancel();
        clearInterval(this.interval);
    }

    fetchNotebooks = () => {
        const { recordId } = this.props;
        if (!recordId) {
            return;
        }

        let notebook_id = "N." + recordId;
        this.setState({ loading: true });

        // 此处需要替换为适用于您应用程序记录的 API 路径和逻辑
        api.get("v1/GetNotebooks", {
            notebook_id: notebook_id,
        }, this.source.token).then(response => {
            if (response.cancel) return;
            let notebooks = response.data.items || [];

            if (notebooks.length > 0) {
                this.setState({ notebook: notebooks[0], loading: false });
            } else {
                // 如果没有找到笔记本，则可能需要创建一个新笔记本
                this.createNotebook(notebook_id);
            }
        });
    }

    createNotebook = (notebook_id) => {
        // 创建笔记本的逻辑，此处根据实际需求调整
    }

    render() {
        const { notebook, loading } = this.state;

        return (
            <div>
                <Spinner loading={loading} />
                {!_.isEmpty(notebook) &&
                    <NotebookRenderer
                        notebook={notebook}
                        fetchNotebooks={this.fetchNotebooks}
                    />
                }
            </div>
        );
    }
}

export default ApplicationNotebook;
