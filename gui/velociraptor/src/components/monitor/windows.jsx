import "./anomaly.css";
import PropTypes from 'prop-types';

import React from 'react';

import _ from 'lodash';
import Navbar from 'react-bootstrap/Navbar';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Dropdown from 'react-bootstrap/Dropdown';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import VeloReportViewer from "../artifacts/reporting.jsx";
import T from '../i8n/i8n.jsx';

import { withRouter }  from "react-router-dom";

const ranges = [
    {desc: "最近一小时", sec: 60*60, sample: 1, rows: 400},
    {desc: "昨天", sec: 60*60*24, sample: 6, rows: 2000},
    {desc: "最近2天", sec: 60*60*24*2, sample: 10, rows: 2000},
    {desc: "最近一周", sec: 60*60*24*7, sample: 40, rows: 2000},
  ];


class WindowsMonitor extends React.Component {
    static propTypes = {
        // React router props.
        history: PropTypes.object,
    };

    constructor(props) {
        super(props);

        let now = parseInt((new Date()).getTime() / 1000);
        this.state = {
            start_time: now - ranges[0].sec,
            sample: ranges[0].sample,
            desc: ranges[0].desc,
            rows: ranges[0].rows,
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
        this.setState({start_time: now - desc.sec,
                       desc: desc.desc,
                       rows: desc.rows,
                       version: this.state.version + 1,
                       sample: desc.sample});
    }

    render() {
        return (
            <>
              <Navbar className="toolbar">
                <ButtonGroup>
                  <Button variant="default"
                          data-position="right"
                          className="btn-tooltip"
                          data-tooltip={T("Redraw dashboard")}
                          onClick={() => this.setState({
                      version: this.state.version + 1,
                  })} >
                    <FontAwesomeIcon icon="sync"/>
                  </Button>

                </ButtonGroup>
               
              </Navbar>
              <div className="dashboard">
                <VeloReportViewer
                  artifact="Server.Monitor.Windows"
                  type="SERVER_EVENT"
                  params={{start_time: this.state.start_time,
                           version: this.state.version,
                           sample: this.state.sample}}
                />
              </div>
            </>
        );
    }
};

export default withRouter(WindowsMonitor);
