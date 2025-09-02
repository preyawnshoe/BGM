import React, { useState, useEffect } from "react";
import { PrimaryButton } from "components/misc/Buttons";
import styled from "styled-components";

const AdminAccessContainer = styled.div`
  margin: 1rem 0;
  padding: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 10px;
  text-align: center;
`;

const AdminAccess = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const token = localStorage.getItem('jwt');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch('/api/user/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const userData = await response.json();
        setIsAdmin(userData.isAdmin || false);
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return null;
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <AdminAccessContainer>
      <h3 style={{ color: 'white', marginBottom: '1rem' }}>
        Admin Access
      </h3>
      <PrimaryButton 
        as="a" 
        href="/admin-panel"
        style={{ textDecoration: 'none' }}
      >
        Access Admin Panel
      </PrimaryButton>
    </AdminAccessContainer>
  );
};

export default AdminAccess;


