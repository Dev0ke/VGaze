import React from 'react';
import PropTypes from 'prop-types';

import SplitPane from 'react-split-pane';
import recordsList from './records-list.jsx';
import recordsInspector from './records-inspector.jsx';
import _ from 'lodash';
import api from '../core/api-service.jsx';

import  {CancelToken} from 'axios';

import { withRouter }  from "react-router-dom";

const POLL_TIME = 5000;

class RecordsApplication extends React.Component {
    static propTypes = {
        // React router props.
        match: PropTypes.object,
        history: PropTypes.object,
    };

    state = {
        // The currently selected records summary.
        selected_records_id: {},

        // The full detail of the current selected records.
        full_selected_records: {},

        // A list of records summary objects - contains just enough info
        // to render tables.
        records: [],

        filter: "",

        collapsed: false,
        topPaneSize: "30%",
    }

    componentDidMount = () => {
        this.get_records_source = CancelToken.source();
    }

    componentWillUnmount() {
        this.get_records_source.cancel();
    }

    collapse = () => {
        if (!this.state.collapsed) {
            this.setState({topPaneSize: "100%", collapsed: true});
        } else {
            this.setState({topPaneSize: "30%", collapsed: false});
        }
    }

    setSelectedrecordsId = (records_id) => {
        if (!records_id) {
            return;
        }
        let tab = this.props.match && this.props.match.params && this.props.match.params.tab;
        if (tab) {
            this.props.history.push("/records/application/" + records_id + "/" + tab);
        } else {
            this.props.history.push("/records/application/" + records_id);
        }
        this.setState({selected_records_id: records_id});
        this.loadFullrecords(records_id);
    }

    loadFullrecords = (records_id) => {
        this.get_records_source.cancel();
        this.get_hunts_source = CancelToken.source();

        api.get("v1/GetHunt", {
            hunt_id: hunt_id,
        }, this.get_hunts_source.token).then((response) => {
            if (response.cancel) return;

            if(_.isEmpty(response.data)) {
                this.setState({full_selected_hunt: {}});
            } else {
                this.setState({full_selected_hunt: response.data});
            }
        });
    }

    fetchSelectedHunt = () => {
        let selected_hunt_id = this.props.match && this.props.match.params &&
            this.props.match.params.hunt_id;

        if (!selected_hunt_id) return;
        this.loadFullHunt(selected_hunt_id);
    }

    render() {
        return (
            <>
              <SplitPane
                size={this.state.topPaneSize}
                split="horizontal"
                defaultSize="30%">
                <HuntList
                  collapseToggle={this.collapse}
                  updateHunts={this.fetchSelectedHunt}
                  selected_hunt={this.state.full_selected_hunt}
                  setSelectedHuntId={this.setSelectedHuntId} />
                <HuntInspector
                  fetch_hunts={this.fetchSelectedHunt}
                  hunt={this.state.full_selected_hunt} />
              </SplitPane>
            </>
        );
    }
};

export default withRouter(RecordsApplication);
