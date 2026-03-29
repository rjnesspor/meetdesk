import React from 'react';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import styles from './index.module.css';

function Hero() {
    return (
        <div className={styles.hero}>
            <div className={styles.heroInner}>
                <div className={styles.heroBadge}>Open Source</div>
                <h1 className={styles.heroTitle}>
                    Meet<span className={styles.heroAccent}>Desk</span>
                </h1>
                <p className={styles.heroSubtitle}>
                    Modern competition management for gymnastics meets.
                </p>
                <div className={styles.heroActions}>
                    <Link className={styles.btnPrimary} to="/docs/intro">
                        Get Started
                    </Link>
                    <Link className={styles.btnGhost} to="/docs/installation">
                        Installation Guide
                    </Link>
                </div>
            </div>
        </div>
    );
}

const features = [
    {
        title: 'Judge Tablets',
        description:
            'Judges enter scores from any browser on the local network. No app installs required.',
    },
    {
        title: 'Live Score Display',
        description:
            'Connect a TV or projector to show scores as they come in, with a built-in queue system.',
    },
    {
        title: 'PDF Reports',
        description:
            'Generate event awards, team awards, and meet rosters with one click.',
    },
];

function Features() {
    return (
        <div className={styles.features}>
            <div className={styles.featuresGrid}>
                {features.map((f) => (
                    <div key={f.title} className={styles.featureCard}>
                        <div className={styles.featureIcon}>{f.icon}</div>
                        <h3 className={styles.featureTitle}>{f.title}</h3>
                        <p className={styles.featureDesc}>{f.description}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function Home() {
    const { siteConfig } = useDocusaurusContext();
    return (
        <Layout title={siteConfig.title} description={siteConfig.tagline}>
            <main>
                <Hero />
                <Features />
            </main>
        </Layout>
    );
}
