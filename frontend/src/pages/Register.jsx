import React, { useEffect, useState } from 'react';
import DonorRegistration from '../components/DonorRegistration';
import EligibilityChecker from '../components/EligibilityChecker';

function Register() {
  const [showChecker, setShowChecker] = useState(false);

  useEffect(() => {
    document.title = 'Become a Donor | LifeLink';
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="page-enter">
      <div className="container section">
        <div className="section-header">
           <h2>Join Our Lifesaving Network</h2>
           <p>Your single donation can save up to three lives. Register today to be notified when someone in your area urgently needs your blood type.</p>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '40px' }}>
           <button 
             className={`btn ${!showChecker ? 'btn-primary' : 'btn-outline'}`} 
             onClick={() => setShowChecker(false)}
             style={{ borderRadius: 'var(--radius-md) 0 0 var(--radius-md)' }}
           >
             Register Now
           </button>
           <button 
             className={`btn ${showChecker ? 'btn-primary' : 'btn-outline'}`} 
             onClick={() => setShowChecker(true)}
             style={{ borderRadius: '0 var(--radius-md) var(--radius-md) 0' }}
           >
             Check Eligibility
           </button>
        </div>

        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
           {showChecker ? <EligibilityChecker /> : <DonorRegistration />}
        </div>
      </div>
    </div>
  );
}

export default Register;
