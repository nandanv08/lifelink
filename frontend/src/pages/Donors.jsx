import React, { useEffect, useState } from 'react';
import DonorList from '../components/DonorList';
import RequestForm from '../components/RequestForm';

function Donors() {
  const [selectedDonor, setSelectedDonor] = useState(null);

  useEffect(() => {
    document.title = 'Find Blood Donors | LifeLink';
    window.scrollTo(0, 0);
  }, []);

  const handleRequestClick = (donor) => {
    setSelectedDonor(donor);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="page-enter">
      <div className="container section">
        <div className="section-header">
           <h2>Blood Donor Directory</h2>
           <p>Search and filter our network of verified blood donors. Connect directly with available donors in your city.</p>
        </div>
        
        {selectedDonor ? (
           <div style={{ marginBottom: '40px' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: 0 }}>Create Request for {selectedDonor.name}</h3>
                <button className="btn btn-ghost btn-sm" onClick={() => setSelectedDonor(null)}>← Back to List</button>
             </div>
             <RequestForm initialDonor={selectedDonor} onSuccess={() => setSelectedDonor(null)} />
           </div>
        ) : (
           <DonorList onRequestBlood={handleRequestClick} />
        )}
      </div>
    </div>
  );
}

export default Donors;
