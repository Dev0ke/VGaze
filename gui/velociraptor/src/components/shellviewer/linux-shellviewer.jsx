import React, { useEffect, useRef, useState } from 'react';
import { Terminal } from 'xterm';
import 'xterm/css/xterm.css';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import HexView from '../utils/hex.jsx';

function TerminalComponent({ base64Content }) {
    const terminalRef = useRef(null);
    const [show, setShow] = useState(false);
    const [terminal, setTerminal] = useState(null);

    useEffect(() => {
        if (!terminal) {
            const newTerminal = new Terminal({
                cursorBlink: true,
                theme: {
                    background: '#202B33',
                    foreground: '#F5F8FA'
                }
            });
            newTerminal.open(terminalRef.current);
            setTerminal(newTerminal);
        }

        return () => {
            terminal?.dispose();
        };
    }, [terminal]);

    useEffect(() => {
        if (terminal && base64Content) {
            const decodedData = atob(base64Content);  // 解码 base64
            terminal.write(decodedData);
        }
    }, [terminal, base64Content]);

    const handleOpen = () => setShow(true);
    const handleClose = () => setShow(false);

    return (
        <>
            <Button onClick={handleOpen} className="hex-popup client-link" variant="outline-info">
                <FontAwesomeIcon icon="external-link-alt"/> Open Terminal
            </Button>
            <Modal show={show} onHide={handleClose} size="lg" aria-labelledby="contained-modal-title-vcenter" centered>
                <Modal.Header closeButton>
                    <Modal.Title>Terminal Logs</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div ref={terminalRef} style={{ height: "400px", width: "100%" }}></div>
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={handleClose}>Close</Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default TerminalComponent;
