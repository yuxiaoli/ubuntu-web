import React from 'react';
import ExternalFrame from './external-frame';

export default function VsCode() {
    return <ExternalFrame src="https://github1s.com/yuxiaoli/ubuntu-web/blob/develop/components/ubuntu.js" title="Visual Studio Code — Ubuntu source" externalUrl="https://github.com/yuxiaoli/ubuntu-web/tree/develop" />;
    // Source viewer by https://github.com/conwnet/github1s.
}

export const displayVsCode = () => <VsCode />;
