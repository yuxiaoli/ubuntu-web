import React, { Component } from 'react';
import ExternalFrame from './external-frame';
import { normalizeBrowserUrl, loadBrowserUrl } from '../../lib/browser-url.cjs';

const bookmarks = [
    { title: 'Vector Index', url: 'https://vectorindex.cloud', description: 'Sean’s homepage' },
    { title: 'GitHub', url: 'https://github.com/yuxiaoli', description: 'Projects and source code' },
    { title: 'LinkedIn', url: 'https://www.linkedin.com/in/yuxiaoli', description: 'Professional profile' },
    { title: 'Ubuntu tutorials', url: 'https://ubuntu.com/tutorials', description: 'Learn and explore' },
];

export class Chrome extends Component {
    constructor() {
        super();
        this.state = { url: '', display_url: '', refreshKey: 0, error: '' };
    }

    componentDidMount() {
        try {
            const url = loadBrowserUrl(localStorage);
            if (url) this.setState({ url, display_url: url });
            // Existing storage is only read here. Visiting Home or another URL is an explicit action.
        } catch {
            this.setState({ error: 'Saved browsing history is unavailable in this browser.' });
        }
    }

    storeVisitedUrl = (url) => {
        try {
            localStorage.setItem('chrome-url', url);
            localStorage.setItem('chrome-display-url', url);
        } catch {
            this.setState({ error: 'This page opened, but the browser could not save its address.' });
        }
    }

    navigate = (address) => {
        const url = normalizeBrowserUrl(address);
        if (!url) {
            this.setState({ error: 'Enter an http:// or https:// website address.' });
            return;
        }
        this.setState({ url, display_url: url, error: '' });
        this.storeVisitedUrl(url);
    }

    refreshChrome = () => {
        this.setState(({ refreshKey }) => ({ refreshKey: refreshKey + 1 }));
    }

    goToHome = () => {
        this.setState({ url: '', display_url: '', error: '' });
        this.storeVisitedUrl('');
    }

    checkKey = (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            this.navigate(event.target.value);
            event.target.blur();
        }
    }

    handleDisplayUrl = (event) => {
        this.setState({ display_url: event.target.value });
    }

    displayUrlBar = () => (
        <div className="flex-shrink-0 w-full px-2 py-2 flex gap-2 items-center text-white text-sm border-b border-gray-900">
            <button type="button" onClick={this.refreshChrome} aria-label="Reload page" title="Reload page" className="p-1 rounded hover:bg-white hover:bg-opacity-10 focus:outline-none focus:ring-2 focus:ring-orange-400">
                <img className="w-5 h-5" src="./themes/Yaru/status/chrome_refresh.svg" alt="" />
            </button>
            <button type="button" onClick={this.goToHome} aria-label="Browser home" title="Browser home" className="p-1 rounded hover:bg-white hover:bg-opacity-10 focus:outline-none focus:ring-2 focus:ring-orange-400">
                <img className="w-5 h-5" src="./themes/Yaru/status/chrome_home.svg" alt="" />
            </button>
            <input aria-label="Website address" onKeyDown={this.checkKey} onChange={this.handleDisplayUrl} value={this.state.display_url} id="chrome-url-bar" className="min-w-0 flex-1 bg-ub-grey rounded-full px-3 py-1 text-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400" placeholder="Enter a website address" type="text" inputMode="url" spellCheck={false} autoComplete="off" />
            <button type="button" onClick={() => this.navigate(this.state.display_url)} className="px-2 py-1 rounded hover:bg-white hover:bg-opacity-10 focus:outline-none focus:ring-2 focus:ring-orange-400">Go</button>
        </div>
    );

    displayHome = () => (
        <main className="flex-1 overflow-y-auto px-5 py-8 sm:px-10 text-white select-text">
            <div className="mx-auto max-w-2xl">
                <p className="text-sm text-gray-400">Sean’s browser</p>
                <h1 className="text-3xl font-medium mt-2 mb-3">A place to start</h1>
                <p className="text-sm leading-relaxed text-gray-300 mb-7">Explore a bookmark or enter a website above. This desktop runs in your browser; some sites require a separate tab.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {bookmarks.map(bookmark => (
                        <div key={bookmark.url} className="rounded-lg bg-ub-grey px-4 py-4">
                            <button type="button" onClick={() => this.navigate(bookmark.url)} className="text-left w-full rounded focus:outline-none focus:ring-2 focus:ring-orange-400">
                                <span className="block text-base font-medium">{bookmark.title}</span>
                                <span className="block text-sm text-gray-300 mt-1">{bookmark.description}</span>
                            </button>
                            <a href={bookmark.url} target="_blank" rel="noopener noreferrer" className="inline-block mt-3 text-xs text-gray-300 underline rounded focus:outline-none focus:ring-2 focus:ring-orange-400">Open in new tab ↗</a>
                        </div>
                    ))}
                </div>
                <p className="text-xs text-gray-400 mt-7 leading-relaxed">Your last visited address stays in this browser’s local storage. External websites have their own privacy and sign-in policies.</p>
            </div>
        </main>
    );

    render() {
        return (
            <div className="h-full min-h-0 w-full flex flex-col bg-ub-cool-grey">
                {this.displayUrlBar()}
                {this.state.error && <p role="status" className="px-3 py-2 text-sm text-orange-200">{this.state.error}</p>}
                {this.state.url ? <div className="flex-1 min-h-0"><ExternalFrame src={this.state.url} title="Browser website" id="chrome-screen" refreshKey={this.state.refreshKey} /></div> : this.displayHome()}
            </div>
        );
    }
}

export default Chrome;
export const displayChrome = () => <Chrome />;
