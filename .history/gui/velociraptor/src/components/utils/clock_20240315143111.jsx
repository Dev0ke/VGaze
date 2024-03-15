import "./clock.css";

import React, { Component } from 'react';
import VeloTimestamp from "./time.jsx";

const POLL_TIME = 1000; // 1 sec

export default class VeloLiveClock extends Component {
    componentDidMount = () => {
        this.interval = setInterval(()=>{
            this.setState({date: new Date()});
        }, POLL_TIME);
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    state = {
        date: new Date(),
    }

    render() {
        // 获取当前时间，并转换为中国时区时间
        const chinaTime = this.state.date.toLocaleString("zh-CN", {
            timeZone: "Asia/Shanghai",
            hour12: false // 24小时制
        });
    
        return (
            <div className="float-right">{chinaTime}</div>
        );
    }
}
