import React, { useState, useEffect, useRef } from 'react';
import '../ConfirmDialog.css';

function ConfirmDialog(props) {
    const {title, content, onConfirm, isActive, setConfDialProps} = props;

    const handleCancel = () => {
        let bg = bgRef.current;
        document.body.classList.remove('lock');
        bg.style.display = 'none';
        setConfDialProps({isActive: false});       
    }

    const bgRef = useRef(null);
    const cdRef = useRef(null);

    const handleClick = (e) => {
        if (e.target == bgRef.current) {
            handleCancel();
            e.preventDefault();
        }
    };

    const handleConfirm = () => {
        onConfirm();
        handleCancel();
    };

    useEffect( () => {
        let bg = bgRef.current;
        if (!isActive) {
            return;
        }

        document.body.classList.add('lock');
        bg.style.display = 'block';
        bg.addEventListener('click', handleClick);

        return (() => {
            document.body.classList.remove('lock');
            bg.style.display = 'none';
            bg.removeEventListener('click', handleClick);
        });
    }, []);

    return (
        <div 
            id = 'confirm-dialog-background' 
            ref = {bgRef}
            style = {{
                display: 'none',
                left: window.scrollX + 'px',
                top: window.scrollY + 'px'
            }}
        >
            <div id = 'confirm-dialog' ref = {cdRef}>
                <div id = 'confirm-dialog-title'>
                    {title}
                </div>
                <div id = 'confirm-dialog-content'>
                    {content}
                </div>
                <button
                    id = 'confirm-dialog-confirm'
                    onClick = {handleConfirm}
                >
                    {"Confirm"}
                </button>
                <button
                    id = 'confirm-dialog-cancel'
                    onClick = {handleCancel}
                >
                    {"Cancel"}
                </button>
            </div>
        </div>
    );
}

export default ConfirmDialog;