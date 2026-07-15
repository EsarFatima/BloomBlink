import React, { useState, useEffect } from 'react';
import { getContactInfo, updateContactInfo } from './api';

const ContactPage = () => {
  const [contactNumber, setContactNumber] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchContactInfo();
  }, []);

  const fetchContactInfo = async () => {
    setLoading(true);
    try {
      const response = await getContactInfo();
      setContactNumber(response.data.contactNumber);
    } catch (error) {
      setMessage('Failed to fetch contact info.');
      console.error('Error fetching contact info:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateContact = async () => {
    setLoading(true);
    try {
      await updateContactInfo({ contactNumber });
      setMessage('Contact number updated successfully!');
      setIsEditing(false);
    } catch (error) {
      setMessage('Failed to update contact info.');
      console.error('Error updating contact info:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-page">
      <h2>Contact Page Management</h2>
      {loading && <p>Loading...</p>}
      {message && <p>{message}</p>}
      <div>
        <label>Contact Number:</label>
        {isEditing ? (
          <input
            type="text"
            value={contactNumber}
            onChange={(e) => setContactNumber(e.target.value)}
          />
        ) : (
          <span>{contactNumber}</span>
        )}
      </div>
      {isEditing ? (
        <>
          <button onClick={handleUpdateContact} disabled={loading}>
            Save
          </button>
          <button onClick={() => setIsEditing(false)} disabled={loading}>
            Cancel
          </button>
        </>
      ) : (
        <button onClick={() => setIsEditing(true)}>Edit</button>
      )}
    </div>
  );
};

export default ContactPage;