import React from 'react';
import Head from 'next/head';

export default function Meta() {
    const title = 'Sean | Ubuntu desktop';
    const description = 'Sean (Yuxiao Li) - a personal Ubuntu 20.04 web desktop with notes, public work and links to Vector Index.';
    const url = 'https://yuxiaoli.github.io/ubuntu-web/';
    return (
        <Head>
            <title>{title}</title>
            <meta charSet="utf-8" />
            <meta name="description" content={description} />
            <meta name="author" content="Sean (Yuxiao Li); original Ubuntu web simulation by Vivek Patel" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <meta name="theme-color" content="#E95420" />
            <meta name="robots" content="index, follow" />
            <link rel="canonical" href={url} />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:url" content={url} />
            <meta property="og:type" content="website" />
            <meta property="og:image" content={url + 'images/logos/logo_1200.png'} />
            <meta name="twitter:card" content="summary" />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
            <link rel="icon" href="./images/logos/fevicon.svg" />
            <link rel="apple-touch-icon" href="./images/logos/logo.png" />
            <link href="https://fonts.googleapis.com/css2?family=Ubuntu:wght@300;400;500;700&display=swap" rel="stylesheet" />
        </Head>
    );
}
