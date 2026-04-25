import React, { useEffect, useState } from 'react';
import RequestTracker from '../components/RequestTracker';
import RequestForm from '../components/RequestForm';

function Requests() {
  const [activeTab, setActiveTab] = useState('browse');

  useEffect(() => {
    document.title = 'Blood Requests | LifeLink';
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="page-enter">
      <div className="container section">
        <div className="section-header">
           <h2>Blood Requests Dashboard</h2>
           <p>Browse active blood requests or submit a new patient requirement. Every request is a life waiting to be saved.</p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '40px' }}>
           <button 
             className={`btn ${activeTab === 'browse' ? 'btn-primary' : 'btn-outline'}`} 
             onClick={() => setActiveTab('browse')}
             style={{ borderRadius: 'var(--radius-md) 0 0 var(--radius-md)' }}
           >
             📋 Browse Open Requests
           </button>
           <button 
             className={`btn ${activeTab === 'create' ? 'btn-danger' : 'btn-outline'}`} 
             onClick={() => setActiveTab('create')}
             style={{ borderRadius: '0 var(--radius-md) var(--radius-md) 0' }}
           >
             ➕ Post New Request
           </button>
        </div>

        <div style={{ maxWidth: activeTab === 'create' ? '800px' : '1000px', margin: '0 auto' }}>
           {activeTab === 'browse' && (
              <RequestTracker limit={20} showFilters={true} />
           )}
           
           {activeTab === 'create' && (
              <RequestForm onSuccess={() => setActiveTab('browse')} />
           )}
        </div>
      </div>
    </div>
  );
}

export default Requests;
