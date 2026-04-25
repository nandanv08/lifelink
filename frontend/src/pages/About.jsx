import React, { useEffect } from 'react';

function About() {
  useEffect(() => {
    document.title = 'About Us | LifeLink';
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="page-enter">
      <div className="container section">
        
        <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto var(--space-4xl)' }}>
          <h1 style={{ fontSize: '3rem', marginBottom: 'var(--space-md)', color: 'var(--primary)' }}>Our Mission</h1>
          <p style={{ fontSize: '1.25rem', color: 'var(--gray-600)', lineHeight: '1.8' }}>
            LifeLink was created with a single, powerful goal: to ensure no life is lost due to a shortage of blood. 
            We bridge the gap between willing donors and patients in critical need through intelligent technology and community engagement.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-2xl)', marginBottom: 'var(--space-4xl)' }}>
          <div style={{ background: 'var(--white)', padding: 'var(--space-xl)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-md)', border: '1px solid var(--gray-100)' }}>
             <div style={{ fontSize: '2.5rem', marginBottom: 'var(--space-md)' }}>🎯</div>
             <h3 style={{ marginBottom: 'var(--space-sm)' }}>Smart Matching</h3>
             <p style={{ color: 'var(--gray-600)' }}>Our proprietary algorithm matches blood requests not just by blood group, but by donor availability, location proximity, and donation eligibility.</p>
          </div>
          
          <div style={{ background: 'var(--white)', padding: 'var(--space-xl)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-md)', border: '1px solid var(--gray-100)' }}>
             <div style={{ fontSize: '2.5rem', marginBottom: 'var(--space-md)' }}>⚡</div>
             <h3 style={{ marginBottom: 'var(--space-sm)' }}>Emergency Response</h3>
             <p style={{ color: 'var(--gray-600)' }}>In critical situations, our "Emergency Mode" instantly alerts available compatible donors, cutting down response times from hours to minutes.</p>
          </div>

          <div style={{ background: 'var(--white)', padding: 'var(--space-xl)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-md)', border: '1px solid var(--gray-100)' }}>
             <div style={{ fontSize: '2.5rem', marginBottom: 'var(--space-md)' }}>🔒</div>
             <h3 style={{ marginBottom: 'var(--space-sm)' }}>Privacy First</h3>
             <p style={{ color: 'var(--gray-600)' }}>We protect donor privacy. Full contact details are only shared securely when a blood request is actively matched and accepted by the donor.</p>
          </div>
        </div>

        <div style={{ background: 'var(--primary-50)', padding: 'var(--space-3xl) var(--space-xl)', borderRadius: 'var(--radius-2xl)', textAlign: 'center' }}>
           <h2 style={{ marginBottom: 'var(--space-md)', color: 'var(--gray-900)' }}>Ready to become a lifesaver?</h2>
           <p style={{ color: 'var(--gray-600)', marginBottom: 'var(--space-xl)', maxWidth: '600px', margin: '0 auto var(--space-xl)' }}>
             Join thousands of heroes in our network. Registration takes less than 2 minutes.
           </p>
           <a href="/register" className="btn btn-primary btn-lg">Register as Donor</a>
        </div>

      </div>
    </div>
  );
}

export default About;
