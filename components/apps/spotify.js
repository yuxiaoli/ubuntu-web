import React from 'react';
import ExternalFrame from './external-frame';

export default function Spotify() {
    return <ExternalFrame src="https://open.spotify.com/embed/playlist/37i9dQZEVXbLZ52XmnySJg" title="Spotify playlist" externalUrl="https://open.spotify.com/playlist/37i9dQZEVXbLZ52XmnySJg" />;
}

export const displaySpotify = () => <Spotify />;
