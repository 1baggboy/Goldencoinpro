import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

export const Unsubscribe = () => {
    const [searchParams] = useSearchParams();
    const email = searchParams.get('email');
    const [status, setStatus] = useState('Unsubscribing...');

    useEffect(() => {
        if (!email) {
            setStatus('Invalid request');
            return;
        }
        fetch('/api/unsubscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        })
        .then(res => {
            if (res.ok) setStatus('Successfully unsubscribed.');
            else setStatus('Failed to unsubscribe.');
        })
        .catch(() => setStatus('Network error.'));
    }, [email]);

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-slate-50 dark:bg-slate-950 font-sans">
            <h1 className="text-2xl font-bold dark:text-white">{status}</h1>
        </div>
    );
};
