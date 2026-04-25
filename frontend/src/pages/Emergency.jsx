import React, { useEffect } from 'react';
import EmergencyMode from '../components/EmergencyMode';

function Emergency() {
  useEffect(() => {
    document.title = 'Emergency Blood Needs | LifeLink';
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="page-enter">
      <div className="container section">
        <EmergencyMode />
      </div>
    </div>
  );
}

export default Emergency;
