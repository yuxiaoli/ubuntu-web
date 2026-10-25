import React from 'react';

const links = [
    ['Desktop source', 'https://github.com/yuxiaoli/ubuntu-web'],
    ['Report a desktop issue', 'https://github.com/yuxiaoli/ubuntu-web/issues'],
    ['Vector Index', 'https://vectorindex.cloud'],
    ['Sean on GitHub', 'https://github.com/yuxiaoli'],
    ['LinkedIn', 'https://www.linkedin.com/in/yuxiaoli'],
    ['Original project | Vivek Patel', 'https://github.com/vivek9patel/vivek9patel.github.io'],
];

export default function DefaultMenu(props) {
    return (
        <div id="default-menu" className={(props.active ? ' block ' : ' hidden ') + 'cursor-default w-56 context-menu-bg border text-left border-gray-900 rounded text-white py-3 absolute z-50 text-sm'}>
            {links.map(([label, href]) => <a key={href} href={href} target="_blank" rel="noreferrer noopener" className="block px-4 py-1.5 hover:bg-ub-warm-grey focus:bg-ub-warm-grey">{label}</a>)}
            <div className="border-t border-gray-900 mt-2 pt-2 px-4 text-xs text-gray-400">Preferences and notes stay in this browser.</div>
        </div>
    );
}
