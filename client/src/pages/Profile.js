// pages/Profile.js
import React from 'react';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user } = useAuth();
  
  return (
    <div className="container">
      <h1>Profile</h1>
      <p>Welcome, {user?.name}!</p>
      <p>Profile management coming soon...</p>
    </div>
  );
};

export default Profile;