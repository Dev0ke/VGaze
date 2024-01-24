import React from 'react';
import { PieChart as Chart, Pie, Cell, Legend, Tooltip, LineChart, Line, BarChart, Bar, AreaChart, Area } from 'recharts';
import './overview.css';

import _ from 'lodash';
import PropTypes from 'prop-types';
import Navbar from 'react-bootstrap/Navbar';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Dropdown from 'react-bootstrap/Dropdown';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import VeloReportViewer from "../artifacts/reporting.jsx";
import T from '../i8n/i8n.jsx';

import { withRouter } from "react-router-dom";

const times = [
    { desc: "Last Hour", sec: 60 * 60, sample: 1, rows: 400 },
    { desc: "Last Day", sec: 60 * 60 * 24, sample: 6, rows: 2000 },
    { desc: "Last 2 days", sec: 60 * 60 * 24 * 2, sample: 10, rows: 2000 },
    { desc: "Last Week", sec: 60 * 60 * 24 * 7, sample: 40, rows: 2000 },
];

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


class Overview extends React.Component {
    static propTypes = {
        // React router props.
        history: PropTypes.object,
    };

    constructor(props) {
        super(props);

        let now = parseInt((new Date()).getTime() / 1000);
        this.state = {
            start_time: now - times[0].sec,
            sample: times[0].sample,
            desc: times[0].desc,
            rows: times[0].rows,
            version: 0,
        };
    }

    shouldComponentUpdate = (nextProps, nextState) => {
        // Do not keep updating the dashboard - it is quite expensive
        // and should be done sparingly unless the version is actually
        // changed. The version is changed by pressing the "Refresh"
        // Button or selecting a new range.
        if (this.state.version !== nextState.version) {
            return true;
        }
        return false;
    };

    setRange = (desc) => {
        // Current time in seconds.
        let now = parseInt((new Date()).getTime() / 1000);
        this.setState({
            start_time: now - desc.sec,
            desc: desc.desc,
            rows: desc.rows,
            version: this.state.version + 1,
            sample: desc.sample
        });
    };

    render() {
        return (
            <>
                <div className='dashboard'>
                    <div className="overview-container">
                        <h1 className="overview-title">Overview</h1>
                        <div className='number-container'>
                            <div className='box-blue'>
                                <div className='left'>
                                    <h3>主机数量</h3>
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
                                    <h3>任务数量</h3>
                                    <div className='value'>12042</div>
                                </div>
                                <div className='right'>
                                    <BarChart width={400} height={200} data={taskData}>
                                        <Bar dataKey="count" fill="#8884d8" />
                                    </BarChart>
                                </div>
                            </div>
                            <div className="box-blue">
                                <div className='left'>
                                    <h3>今日异常</h3>
                                    <div className='value'>12042</div>
                                </div>
                                <div className='right'>
                                    <AreaChart width={400} height={200} data={exceptionData}>
                                        <Area type="monotone" dataKey="count" stroke="#8884d8" fill="#8884d8" />
                                    </AreaChart>
                                </div>
                            </div>

                        </div>

                        <ButtonGroup className="float-right">
                            <Dropdown>
                                <Dropdown.Toggle variant="default">
                                    <FontAwesomeIcon icon="book" />
                                    <span className="button-label">{this.state.desc}</span>
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                    {_.map(times, (x, idx) => {
                                        return <Dropdown.Item key={idx}
                                            onClick={() => this.setRange(x)} >
                                            {x.desc}
                                        </Dropdown.Item>;
                                    })}
                                </Dropdown.Menu>
                            </Dropdown>
                        </ButtonGroup>

                        <div className='viewer'>
                            <VeloReportViewer
                                artifact="Custom.Server.Monitor.Health1"
                                type="SERVER_EVENT"
                                params={{
                                    start_time: this.state.start_time,
                                    version: this.state.version,
                                    sample: this.state.sample
                                }}
                            />
                        </div>
                    </div>
                </div>
            </>
        );
    }

}

export default withRouter(Overview);