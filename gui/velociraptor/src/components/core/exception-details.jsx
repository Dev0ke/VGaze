import React from 'react';
import { LineChart, Line, BarChart, Bar, AreaChart, Area } from 'recharts';
import "./table.css"

import _ from 'lodash';
import api from '../core/api-service.jsx';

import PropTypes from 'prop-types';
import Spinner from '../utils/spinner.jsx';
import SplitPane from 'react-split-pane';
import { CancelToken } from 'axios';

import { withRouter } from "react-router-dom";

const hostData = [
    { time: '8:00', count: 10 },
    { time: '10:00', count: 15 },
    { time: '12:00', count: 20 },
];

const taskData = [
    { time: '8:00', count: 5 },
    { time: '10:00', count: 8 },
    { time: '12:00', count: 12 },
];

const exceptionData = [
    { time: '8:00', count: 2 },
    { time: '10:00', count: 1 },
    { time: '12:00', count: 4 },
];

class ExceptionDetails extends React.Component {
    static propTypes = {
        // React router props.
        match: PropTypes.object,
        history: PropTypes.object,
    };

    state = {
        hunts: [],

        loading: true,
    }


    componentDidMount = () => {
        this.get_hunts_source = CancelToken.source();
        this.interval = setInterval(this.loadHunter, 5000);
        this.loadHunter();
    }

    componentWillUnmount() {
        this.get_hunts_source.cancel();
        clearInterval(this.interval);
    }

    // GetNotebooks?notebook_id=N.H.CMJMKRIEFC22E&include_uploads=true
    loadHunter = () => {
        api.get("v1/GetTable", {
            notebook_id: "N.H.CMJMEU2NEHSMO",
            cell_id: "NC.CMJMF23GK2UPE",
            table_id: 1,
            Version: 1705469832,
            start_row: 0,
            rows: 10,
            sort_direction: false
        }, this.get_hunts_source.token).then(response => {
            if (response.cancel) return;

            this.setState({ hunts: response.data, loading: false });
        });
    }


    render() {
        return (
            <div>
                <div className='number-container'>
                    <div className='box-blue'>
                        <div className='left'>
                            <h3>今日异常</h3>
                            <div className='value'>12042</div>
                        </div>
                        <div className='right'>
                            <LineChart width={400} height={200} data={hostData}>
                                <Line type="monotone" dataKey="count" stroke="#8884d8" strokeWidth={3} />
                            </LineChart>
                        </div>
                    </div>
                    <div className="box-green">
                        <div className='left'>
                            <h3>异常总数</h3>
                            <div className='value'>12042</div>
                        </div>
                        <div className='right'>
                            <LineChart width={400} height={200} data={taskData}>
                                <Line type="monotone" dataKey="count" stroke="#8884d8" strokeWidth={3} />
                            </LineChart>
                        </div>
                    </div>
                    <div className="box-blue">
                        <div className='left'>
                            <h3>异常主机</h3>
                            <div className='value'>12042</div>
                        </div>
                        <div className='right'>
                            <LineChart width={400} height={200} data={exceptionData}>
                                <Line type="monotone" dataKey="count" stroke="#8884d8" strokeWidth={3} />
                            </LineChart>
                        </div>
                    </div>

                </div>

                <div className='table-container'>
                    <h2>异常详情</h2>
                    <><Spinner loading={this.state.loading} />
                        <table>
                            <thead>
                                <tr>
                                    {this.state.hunts.columns && this.state.hunts.columns.map((column, index) => (
                                        <th key={index}>{column}</th>
                                    ))}
                                </tr>

                            </thead>
                            <tbody>
                                {this.state.hunts.rows && this.state.hunts.rows.map((row, index) => (
                                    <tr key={index}>
                                        {row.cell.map((cell, cellIndex) => (
                                            <td key={cellIndex}>{cell}</td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </>
                </div>
            </div >
        );
    }
}

export default withRouter(ExceptionDetails);