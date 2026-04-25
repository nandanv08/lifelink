import React, { useEffect } from 'react';
import Hero from '../components/Hero';
import Stats from '../components/Stats';

function Home() {
  useEffect(() => {
    document.title = 'LifeLink | Donate Blood, Save Lives';
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="page-enter">
      <Hero />
      <Stats />
      
      <section className="section" style={{ background: 'var(--white)' }}>
         <div className="container">
            <div className="section-header">
               <span className="section-badge">How It Works</span>
               <h2>Simple Steps to Save a Life</h2>
               <p>Our platform makes connecting donors and recipients seamless and efficient, especially during critical emergencies.</p>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '32px', marginTop: '48px' }}>
               <div style={{ textAlign: 'center', padding: '24px', background: 'var(--gray-50)', borderRadius: 'var(--radius-xl)'}}>
                  <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📝</div>
                  <h3 style={{ marginBottom: '12px' }}>1. Register</h3>
                  <p style={{ color: 'var(--gray-500)' }}>Sign up as a donor with your basic info and blood group.</p>
               </div>
               <div style={{ textAlign: 'center', padding: '24px', background: 'var(--gray-50)', borderRadius: 'var(--radius-xl)'}}>
                  <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🚨</div>
                  <h3 style={{ marginBottom: '12px' }}>2. Get Notified</h3>
                  <p style={{ color: 'var(--gray-500)' }}>Receive alerts when someone in your area needs your blood type.</p>
               </div>
               <div style={{ textAlign: 'center', padding: '24px', background: 'var(--gray-50)', borderRadius: 'var(--radius-xl)'}}>
                  <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🤝</div>
                  <h3 style={{ marginBottom: '12px' }}>3. Connect</h3>
                  <p style={{ color: 'var(--gray-500)' }}>Accept the request and we'll securely connect you with the patient.</p>
               </div>
               <div style={{ textAlign: 'center', padding: '24px', background: 'var(--primary-50)', borderRadius: 'var(--radius-xl)'}}>
                  <div style={{ fontSize: '3rem', marginBottom: '16px' }}>❤️</div>
                  <h3 style={{ marginBottom: '12px', color: 'var(--primary)' }}>4. Save a Life</h3>
                  <p style={{ color: 'var(--gray-700)' }}>Donate blood at the specified hospital and become a hero.</p>
               </div>
            </div>
         </div>
      </section>
    </div>
  );
}

export default Home;
