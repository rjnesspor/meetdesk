import React from 'react';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import styles from './index.module.css';

const details = [
    { label: 'Control Panel', desc: "Manage teams, athletes, levels, and scores from the meet director's laptop." },
    { label: 'Judge Entry', desc: 'Judges open a URL on their tablet. Nothing to install, nothing to configure.' },
    { label: 'Score Display', desc: 'Hook up a TV or projector. Scores appear automatically as they come in.' },
    { label: 'PDF Reports', desc: 'Event awards, team awards, meet rosters - one click.' },
];

export default function Home() {
    const { siteConfig } = useDocusaurusContext();
    return (
        <Layout title={siteConfig.title} description={siteConfig.tagline}>
            <div className={styles.page}>

                <div className={styles.left}>
                    <h1 className={styles.title}>
                        Meet<span className={styles.accent}>Desk</span>
                    </h1>
                    <p className={styles.hook}>
                        I'm a gymnastics judge and CS student.
                    </p>
                    <p className={styles.sub}>
                        I got tired of watching meet directors deal with expensive meet software, so I built this -
                        free, no subscriptions.
                    </p>
                    <p className={styles.byline}>- Ryan Nesspor</p>
                    <div className={styles.actions}>
                        <Link className={styles.btnPrimary} to="/docs/intro">
                            Get Started
                        </Link>
                        <Link className={styles.btnGhost} href="https://github.com/rjnesspor/meetdesk">
                            GitHub
                        </Link>
                    </div>
                    <p className={styles.stack}>
                        Node · Express · SQLite
                    </p>
                </div>

                <div className={styles.right}>
                    <div className={styles.grid}>
                        {details.map((d) => (
                            <div key={d.label} className={styles.cell}>
                                <div className={styles.cellLabel}>{d.label}</div>
                                <div className={styles.cellDesc}>{d.desc}</div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </Layout>
    );
}