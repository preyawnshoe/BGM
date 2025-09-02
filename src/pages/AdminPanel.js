import React, { useState, useEffect } from "react";
import { Container, ContentWithPaddingXl } from "components/misc/Layouts";
import { SectionHeading } from "components/misc/Headings";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";

const ModalOverlay = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.4);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
`;
const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  min-width: 320px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.2);
`;
const ModalTitle = styled.h3`
  margin-top: 0;
  margin-bottom: 1.5rem;
`;
const ModalActions = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
  justify-content: flex-end;
`;

const AdminContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
`;

const AdminCard = styled.div`
  background: white;
  border-radius: 15px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-5px);
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1.5rem;
  border-radius: 15px;
  text-align: center;
`;

const StatNumber = styled.div`
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  font-size: 1rem;
  opacity: 0.9;
`;

const TableContainer = styled.div`
  overflow-x: auto;
  margin-top: 1rem;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
`;

const Th = styled.th`
  background: #f8f9fa;
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  border-bottom: 2px solid #e9ecef;
`;

const Td = styled.td`
  padding: 1rem;
  border-bottom: 1px solid #e9ecef;
`;

const Tr = styled.tr`
  &:hover {
    background: #f8f9fa;
  }
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  margin-bottom: 1rem;
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const TabContainer = styled.div`
  display: flex;
  margin-bottom: 2rem;
  border-bottom: 2px solid #e9ecef;
`;

const Tab = styled.button`
  padding: 1rem 2rem;
  background: ${props => props.active ? '#667eea' : 'transparent'};
  color: ${props => props.active ? 'white' : '#6c757d'};
  border: none;
  border-radius: 8px 8px 0 0;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.active ? '#667eea' : '#f8f9fa'};
  }
`;

const ActionButton = styled.button`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.9rem;
  margin: 0 0.25rem;
  transition: all 0.2s ease;

  &.edit {
    background: #28a745;
    color: white;
    &:hover { background: #218838; }
  }

  &.delete {
    background: #dc3545;
    color: white;
    &:hover { background: #c82333; }
  }

  &.ban {
    background: #ffc107;
    color: #212529;
    &:hover { background: #e0a800; }
  }
`;

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalReferrals: 0,
    activeUsers: 0,
    pendingReferrals: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [adminData, setAdminData] = useState(null);
  const navigate = useNavigate();

  const checkAdminAuth = React.useCallback(async () => {
    const adminToken = localStorage.getItem('adminToken');
    const storedAdminData = localStorage.getItem('adminData');

    if (!adminToken || !storedAdminData) {
      navigate('/admin-login');
      return;
    }

    try {
      // Verify admin token
      const response = await fetch('/api/admin-auth/verify', {
        headers: { Authorization: `Bearer ${adminToken}` }
      });

      if (response.ok) {
        const data = await response.json();
        setAdminData(data.admin);
        fetchAdminData(adminToken);
      } else {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminData');
        navigate('/admin-login');
      }
    } catch (err) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminData');
      navigate('/admin-login');
    }
  }, [navigate]);

  useEffect(() => {
    checkAdminAuth();
  }, [checkAdminAuth]);


  const fetchAdminData = async (token) => {
    try {
      const [usersRes, statsRes] = await Promise.all([
        fetch('/api/admin/users', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch('/api/admin/stats', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData);
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const [editModal, setEditModal] = useState({ open: false, user: null, form: { name: '', email: '', referrals: 0 }, error: '' });

  const openEditModal = (user) => {
    setEditModal({ open: true, user, form: { name: user.name, email: user.email, referrals: user.referrals }, error: '' });
  };
  const closeEditModal = () => setEditModal({ open: false, user: null, form: { name: '', email: '', referrals: 0 }, error: '' });

  const handleEditChange = (e) => {
    setEditModal((prev) => ({ ...prev, form: { ...prev.form, [e.target.name]: e.target.value } }));
  };

  const handleEditSubmit = async () => {
    const { user, form } = editModal;
    try {
      const token = localStorage.getItem('adminToken');
      const url = `/api/admin/users/${user._id}/edit`;
      const response = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form)
      });
      if (response.ok) {
        fetchAdminData(token);
        closeEditModal();
        alert('User edit successful');
      } else {
        const data = await response.json();
        setEditModal((prev) => ({ ...prev, error: data.message || 'Failed to edit user' }));
      }
    } catch (error) {
      setEditModal((prev) => ({ ...prev, error: 'Error editing user' }));
    }
  };

  const handleUserAction = async (userId, action) => {
    if (action === 'edit') {
      const user = users.find(u => u._id === userId);
      if (user) openEditModal(user);
      return;
    }
    try {
      const token = localStorage.getItem('adminToken');
      let url = `/api/admin/users/${userId}`;
      let method = 'PUT';
      if (action === 'ban') {
        url += '/ban';
        method = 'PUT';
      } else if (action === 'unban') {
        url += '/unban';
        method = 'PUT';
      } else if (action === 'delete') {
        method = 'DELETE';
      } else {
        alert('Unknown action');
        return;
      }
      const response = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        fetchAdminData(token); // Refresh data
        alert(`User ${action} successful`);
      } else {
        alert(`Failed to ${action} user`);
      }
    } catch (error) {
      console.error(`Error ${action}ing user:`, error);
      alert(`Error ${action}ing user`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    navigate('/admin-login');
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.referralCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <AdminContainer>
        <Container>
          <ContentWithPaddingXl>
            <div style={{ textAlign: 'center', padding: '4rem' }}>
              <div>Loading admin panel...</div>
            </div>
          </ContentWithPaddingXl>
        </Container>
      </AdminContainer>
    );
  }

  return (
    <AdminContainer>
      <Container>
        <ContentWithPaddingXl>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <SectionHeading style={{ color: 'white', margin: 0 }}>
              Admin Panel
            </SectionHeading>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ color: 'white', fontSize: '0.9rem' }}>
                Welcome, {adminData?.username}
              </span>
              <button
                onClick={handleLogout}
                style={{
                  padding: '0.5rem 1rem',
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '5px',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                Logout
              </button>
            </div>
          </div>

          <TabContainer>
            <Tab 
              active={activeTab === 'dashboard'} 
              onClick={() => setActiveTab('dashboard')}
            >
              Dashboard
            </Tab>
            <Tab 
              active={activeTab === 'users'} 
              onClick={() => setActiveTab('users')}
            >
              Users
            </Tab>
            <Tab 
              active={activeTab === 'referrals'} 
              onClick={() => setActiveTab('referrals')}
            >
              Referrals
            </Tab>
            <Tab 
              active={activeTab === 'settings'} 
              onClick={() => setActiveTab('settings')}
            >
              Settings
            </Tab>
          </TabContainer>

          {activeTab === 'dashboard' && (
            <AdminCard>
              <h2 style={{ marginBottom: '2rem', color: '#333' }}>System Overview</h2>
              <StatsGrid>
                <StatCard>
                  <StatNumber>{stats.totalUsers}</StatNumber>
                  <StatLabel>Total Users</StatLabel>
                </StatCard>
                <StatCard>
                  <StatNumber>{stats.totalReferrals}</StatNumber>
                  <StatLabel>Total Referrals</StatLabel>
                </StatCard>
                <StatCard>
                  <StatNumber>{stats.activeUsers}</StatNumber>
                  <StatLabel>Active Users</StatLabel>
                </StatCard>
                <StatCard>
                  <StatNumber>{stats.pendingReferrals}</StatNumber>
                  <StatLabel>Pending Referrals</StatLabel>
                </StatCard>
              </StatsGrid>
            </AdminCard>
          )}

          {activeTab === 'users' && (
            <AdminCard>
              <h2 style={{ marginBottom: '2rem', color: '#333' }}>User Management</h2>
              <SearchInput
                type="text"
                placeholder="Search users by name, email, or referral code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <TableContainer>
                <Table>
                  <thead>
                    <tr>
                      <Th>Name</Th>
                      <Th>Email</Th>
                      <Th>Referral Code</Th>
                      <Th>Referrals</Th>
                      <Th>Referred By</Th>
                      <Th>Joined</Th>
                      <Th>Actions</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(user => (
                      <Tr key={user._id}>
                        <Td>{user.name}</Td>
                        <Td>{user.email}</Td>
                        <Td>{user.referralCode}</Td>
                        <Td>{user.referrals}</Td>
                        <Td>{user.referredBy || 'None'}</Td>
                        <Td>{new Date(user.createdAt).toLocaleDateString()}</Td>
                        <Td>
                          <ActionButton 
                            className="edit"
                            onClick={() => handleUserAction(user._id, 'edit')}
                          >
                            Edit
                          </ActionButton>
      {editModal.open && (
        <ModalOverlay>
          <ModalContent>
            <ModalTitle>Edit User</ModalTitle>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <label>
                Name:
                <input name="name" value={editModal.form.name} onChange={handleEditChange} style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }} />
              </label>
              <label>
                Email:
                <input name="email" value={editModal.form.email} onChange={handleEditChange} style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }} />
              </label>
              <label>
                Referrals:
                <input name="referrals" type="number" value={editModal.form.referrals} onChange={handleEditChange} style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }} />
              </label>
              {editModal.error && <div style={{ color: 'red', fontSize: '0.95rem' }}>{editModal.error}</div>}
            </div>
            <ModalActions>
              <button onClick={closeEditModal} style={{ padding: '0.5rem 1rem' }}>Cancel</button>
              <button onClick={handleEditSubmit} style={{ padding: '0.5rem 1rem', background: '#667eea', color: 'white', border: 'none', borderRadius: '5px' }}>Save</button>
            </ModalActions>
          </ModalContent>
        </ModalOverlay>
      )}
                          <ActionButton 
                            className="ban"
                            onClick={() => handleUserAction(user._id, 'ban')}
                          >
                            Ban
                          </ActionButton>
                          <ActionButton 
                            className="delete"
                            onClick={() => handleUserAction(user._id, 'delete')}
                          >
                            Delete
                          </ActionButton>
                        </Td>
                      </Tr>
                    ))}
                  </tbody>
                </Table>
              </TableContainer>
            </AdminCard>
          )}

          {activeTab === 'referrals' && (
            <AdminCard>
              <h2 style={{ marginBottom: '2rem', color: '#333' }}>Referral Management</h2>
              <p>Referral analytics and management tools will be displayed here.</p>
            </AdminCard>
          )}

          {activeTab === 'settings' && (
            <AdminCard>
              <h2 style={{ marginBottom: '2rem', color: '#333' }}>System Settings</h2>
              <p>System configuration and settings will be displayed here.</p>
            </AdminCard>
          )}
        </ContentWithPaddingXl>
      </Container>
    </AdminContainer>
  );
};

export default AdminPanel;
