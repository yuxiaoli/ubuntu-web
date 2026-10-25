import React, { useEffect, useState } from 'react';
import { STARTER_NOTES, loadNotes, saveNotes } from '../../lib/notes-storage.cjs';

export default function Gedit() {
    const [text, setText] = useState('');
    const [status, setStatus] = useState('Loading notes…');
    useEffect(() => {
        try { setText(loadNotes(localStorage)); setStatus('Saved on this device'); }
        catch { setText(STARTER_NOTES); setStatus('Browser storage unavailable. Download a backup.'); }
    }, []);
    const change = event => {
        const value = event.target.value;
        setText(value);
        try { saveNotes(localStorage, value); setStatus('Saved on this device'); }
        catch { setStatus('Could not save. Download a backup.'); }
    };
    const download = () => {
        const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }));
        const a = document.createElement('a'); a.href = url; a.download = 'sean-notes.txt'; a.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    };
    return <div className="h-full flex flex-col bg-ub-gedit-dark text-white">
        <div className="flex items-center justify-between px-3 py-2 bg-ub-gedit-light text-sm">
            <span>My notes</span><button className="px-3 py-1 rounded bg-ub-cool-grey hover:bg-ub-orange" onClick={download}>Download</button>
        </div>
        <textarea aria-label="My notes" value={text} onChange={change} spellCheck="false" className="flex-grow min-h-0 w-full resize-none bg-transparent p-4 text-sm font-mono outline-none" />
        <p role="status" className="text-xs px-3 py-2 text-gray-300">{status}</p>
    </div>;
}
export const displayGedit = () => <Gedit />;
