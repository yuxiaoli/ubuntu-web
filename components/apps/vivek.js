import React, { Component } from 'react';

const sections = [
    { id: 'about', title: 'About Sean', icon: 'about.svg' },
    { id: 'skills', title: 'Focus', icon: 'skills.svg' },
    { id: 'projects', title: 'On the web', icon: 'projects.svg' },
    { id: 'credits', title: 'This desktop', icon: 'about.svg' },
];

function PublicLink({ href, children }) {
    return <a className="underline text-ubt-gedit-orange hover:text-white" href={href} target="_blank" rel="noreferrer noopener">{children}</a>;
}

// Original export names and storage key remain compatible with saved desktops.
export class AboutVivek extends Component {
    state = { active_screen: 'about' };

    componentDidMount() {
        const saved = localStorage.getItem('about-section');
        if (sections.some(section => section.id === saved)) this.setState({ active_screen: saved });
    }

    changeScreen = (id) => {
        localStorage.setItem('about-section', id);
        this.setState({ active_screen: id });
    };

    render() {
        const active = this.state.active_screen;
        return (
            <div className="w-full h-full flex flex-col md:flex-row bg-ub-cool-grey text-white">
                <nav aria-label="About sections" className="flex md:flex-col flex-wrap md:w-1/4 flex-shrink-0 p-2 border-b md:border-b-0 md:border-r border-black text-sm">
                    {sections.map(section => (
                        <button key={section.id} onClick={() => this.changeScreen(section.id)} aria-current={active === section.id ? 'page' : undefined}
                            className={(active === section.id ? 'bg-ub-orange ' : 'hover:bg-ub-warm-grey ') + 'flex items-center text-left rounded px-2 py-2 my-0.5 focus:ring-2 focus:ring-white'}>
                            <img src={'./themes/Yaru/status/' + section.icon} alt="" className="w-4 mr-2" />{section.title}
                        </button>
                    ))}
                </nav>
                <article className="flex-grow min-w-0 overflow-y-auto bg-ub-grey px-5 py-6 md:px-8 windowMainScreen leading-relaxed">
                    {active === 'about' && <>
                        <div className="rounded-full bg-ub-orange flex items-center justify-center w-16 h-16 text-2xl font-medium mb-5" aria-hidden="true">SL</div>
                        <h1 className="text-2xl md:text-3xl font-medium">Sean <span className="text-gray-300">(Yuxiao Li)</span></h1>
                        <p className="text-gray-300 mt-2">Hong Kong | <PublicLink href="https://github.com/yuxiaoli">@yuxiaoli</PublicLink></p>
                        <p className="mt-6 max-w-xl">I work across software engineering, AI and cloud systems, and international technology collaboration.</p>
                        <p className="mt-4 max-w-xl">This Ubuntu-inspired desktop is a small place to explore my public work, keep a few notes, and enjoy a familiar Linux workspace in the browser.</p>
                        <p className="mt-6"><PublicLink href="https://vectorindex.cloud">Visit Vector Index</PublicLink></p>
                    </>}
                    {active === 'skills' && <>
                        <h1 className="text-2xl font-medium">What I focus on</h1>
                        <ul className="list-disc ml-5 mt-5 space-y-4">
                            <li>Software engineering and practical developer tools.</li>
                            <li>AI, cloud systems, and turning research into useful software.</li>
                            <li>Connecting people and ideas through international technology collaboration.</li>
                        </ul>
                        <p className="mt-6 text-gray-300">For current public work and updates, visit my <PublicLink href="https://github.com/yuxiaoli">GitHub profile</PublicLink> or <PublicLink href="https://www.linkedin.com/in/yuxiaoli">LinkedIn</PublicLink>.</p>
                    </>}
                    {active === 'projects' && <>
                        <h1 className="text-2xl font-medium">On the web</h1>
                        <div className="mt-5 space-y-5">
                            <p><PublicLink href="https://vectorindex.cloud">Vector Index</PublicLink><br /><span className="text-gray-300">My homepage and starting point for public work.</span></p>
                            <p><PublicLink href="https://github.com/yuxiaoli">GitHub | yuxiaoli</PublicLink><br /><span className="text-gray-300">Public repositories, experiments and developer tools.</span></p>
                            <p><PublicLink href="https://www.linkedin.com/in/yuxiaoli">LinkedIn | Yuxiao Li</PublicLink><br /><span className="text-gray-300">Professional profile and connections.</span></p>
                            <p><PublicLink href="https://github.com/yuxiaoli/ubuntu-web">This desktop on GitHub</PublicLink><br /><span className="text-gray-300">Source code for the personalized Ubuntu web simulation.</span></p>
                        </div>
                    </>}
                    {active === 'credits' && <>
                        <h1 className="text-2xl font-medium">About this desktop</h1>
                        <p className="mt-5">A browser simulation of Ubuntu 20.04, built with Next.js, React and Tailwind CSS. It is a website, with a simulated terminal and desktop controls.</p>
                        <p className="mt-4">The original project was created by <PublicLink href="https://github.com/vivek9patel/vivek9patel.github.io">Vivek Patel (vivek9patel)</PublicLink>. Original code is MIT licensed, copyright (c) 2020 vivek9patel. The original license is retained in this fork.</p>
                        <p className="mt-4">Personalized for Sean (Yuxiao Li). Ubuntu and application names and artwork belong to their respective owners. External apps may limit embedding; use their open-in-new-tab links when needed.</p>
                        <p className="mt-4 text-gray-300">Notes and desktop preferences stay in this browser's local storage. This simulation does not provide a real shell or operating system.</p>
                    </>}
                </article>
            </div>
        );
    }
}

export default AboutVivek;
export const displayAboutVivek = () => <AboutVivek />;
