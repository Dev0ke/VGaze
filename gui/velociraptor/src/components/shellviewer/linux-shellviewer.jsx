import React, { useEffect, useRef, useState } from 'react';
import { Terminal } from 'xterm';
import 'xterm/css/xterm.css';
import { useParams } from 'react-router-dom';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

function TerminalComponent() {
    const { filePath } = useParams();
    const terminalRef = useRef(null);
    const [terminal, setTerminal] = useState(null);
    const [show, setShow] = useState(true);

    useEffect(() => {
        const newTerminal = new Terminal({
            cursorBlink: true,
            theme: {
                background: '#202B33', // Ensure background and text colors are set to see the contrast
                foreground: '#F5F8FA'
            }
        });
        newTerminal.open(terminalRef.current);
        setTerminal(newTerminal);

        return () => newTerminal.dispose();
    }, []);

    useEffect(() => {
        if (terminal) {
            fetch(`/${filePath}`)
                .then(response => response.text())
                .then(text => {
                    terminal.write(text);
                })
                .catch(err => console.error('Failed to load log:', err));
        }
    }, [terminal, filePath]);

    const handleClose = () => setShow(false);

    return (
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
    );
}

export default TerminalComponent;
