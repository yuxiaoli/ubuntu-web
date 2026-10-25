import React from 'react';

export default function ExternalFrame({ src, title, externalUrl = src, refreshKey = 0, id }) {
    return (
        <div className="flex flex-col h-full min-h-0 w-full bg-ub-cool-grey text-white">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-black border-opacity-30 px-3 py-2 text-xs bg-ub-grey">
                <span className="text-gray-300">Some websites block embedding or require sign-in.</span>
                <a className="text-white underline focus:outline-none focus:ring-2 focus:ring-orange-400 rounded px-1 py-1" href={externalUrl} target="_blank" rel="noopener noreferrer">Open in new tab ↗</a>
            </div>
            <iframe
                key={`${src}-${refreshKey}`}
                id={id}
                src={src}
                title={title}
                className="flex-1 min-h-0 w-full border-0 bg-white"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-presentation"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
            />
        </div>
    );
}
