# Admin Panel Setup Guide

This guide will help you set up and use the **separate admin panel** for managing your BGM referral website. The admin system is completely independent from regular users.

## 🚀 **Key Features**

The admin panel includes:
- **Separate Admin Authentication**: Dedicated login system at `/admin-login`
- **Dashboard**: System overview with key statistics
- **User Management**: View, edit, ban/unban, and delete users
- **Referral Analytics**: Detailed referral statistics and top performers
- **System Settings**: Basic system configuration
- **Role-Based Access**: Different admin roles and permissions

## 🔧 **Setup Instructions**

### 1. **Backend Setup**

1. **Install Dependencies** (if not already installed):
   ```bash
   cd backend
   npm install
   ```

2. **Create Admin User** (in the separate Admin model):
   ```bash
   npm run create-admin-user
   ```
   This will create an admin user with:
   - **Username**: `admin`
   - **Email**: `admin@bgm.com`
   - **Password**: `admin123`
   - **Role**: `super_admin`
   - **Permissions**: Full access to all features

3. **Start Backend Server**:
   ```bash
   npm start
   ```

### 2. **Frontend Setup**

1. **Install Dependencies** (if not already installed):
   ```bash
   npm install
   ```

2. **Start Frontend**:
   ```bash
   npm start
   ```

### 3. **Access Admin Panel**

1. **Navigate to Admin Login**:
   - Go to: `http://localhost:3000/admin-login`
   - Use the admin credentials created in step 1

2. **Access Admin Panel**:
   - After successful login, you'll be redirected to `/admin-panel`
   - The admin panel is completely separate from regular user dashboard

## 🔐 **Admin Authentication System**

### **Separate from Regular Users**
- **Admin Model**: Completely independent `Admin` collection
- **Admin Routes**: `/api/admin-auth/*` for authentication
- **Admin Panel**: `/admin-panel` route (protected)
- **Admin Login**: `/admin-login` route

### **Security Features**
- **Password Hashing**: Automatic bcrypt hashing
- **Account Locking**: After 5 failed attempts (2-hour lockout)
- **JWT Tokens**: Separate admin tokens (24-hour expiry)
- **Role-Based Permissions**: Different access levels
- **Session Management**: Secure token verification

## 📊 **Admin Panel Usage**

### **Dashboard Tab**
- View total users, referrals, active users, and pending referrals
- Real-time system statistics
- Quick overview of system health

### **Users Tab**
- **Search**: Filter users by name, email, or referral code
- **View**: See all user information including referral counts
- **Edit**: Modify user details (name, email, referral count)
- **Ban/Unban**: Temporarily restrict user access
- **Delete**: Permanently remove users (use with caution)

### **Referrals Tab**
- **Analytics**: View referral statistics and trends
- **Top Performers**: See users with highest referral counts
- **Recent Activity**: Monitor recent referral activities

### **Settings Tab**
- Basic system configuration options
- System logs and monitoring

## 🛡️ **Security Features**

- **Separate Authentication**: Admin system completely independent
- **JWT Authentication**: All admin routes require valid admin tokens
- **Admin Middleware**: Only verified admin accounts can access
- **Input Validation**: All user inputs are validated and sanitized
- **Audit Trail**: Admin actions are logged for security
- **Account Locking**: Protection against brute force attacks

## 🔧 **Customization**

### **Adding New Admin Features**

1. **Backend Routes**: Add new endpoints in `backend/routes/admin.js`
2. **Frontend Components**: Extend the admin panel in `src/pages/AdminPanel.js`
3. **Admin Model**: Update `backend/models/Admin.js` for new fields

### **Modifying Admin Roles**

1. **Admin Model**: The `role` field controls admin access level
2. **Permissions**: Use the `permissions` array for granular access control
3. **Middleware**: Update `adminMiddleware` in admin routes for custom logic

## 🚨 **Troubleshooting**

### **Common Issues**

1. **"Access denied" error**:
   - Ensure you're using admin credentials (not regular user)
   - Check admin token validity
   - Verify admin account is active

2. **Admin panel not loading**:
   - Verify backend server is running
   - Check browser console for errors
   - Ensure admin routes are properly configured
   - Login at `/admin-login` first

3. **User actions failing**:
   - Check MongoDB connection
   - Verify user exists in database
   - Check server logs for errors

### **Debug Mode**

Enable debug logging by setting environment variables:
```bash
DEBUG=admin:*
NODE_ENV=development
```

## 📡 **API Endpoints**

### **Admin Authentication Routes**
- `POST /api/admin-auth/login` - Admin login
- `POST /api/admin-auth/logout` - Admin logout
- `GET /api/admin-auth/verify` - Verify admin token

### **Admin Management Routes**
- `GET /api/admin/users` - Get all users
- `GET /api/admin/stats` - Get system statistics
- `PUT /api/admin/users/:userId/edit` - Edit user
- `PUT /api/admin/users/:userId/ban` - Ban user
- `PUT /api/admin/users/:userId/unban` - Unban user
- `DELETE /api/admin/users/:userId` - Delete user
- `GET /api/admin/referrals/analytics` - Get referral analytics
- `GET /api/admin/logs` - Get system logs

## 🎯 **Quick Start Commands**

```bash
# Create admin user
cd backend
npm run create-admin-user

# Start backend
npm start

# In another terminal, start frontend
cd ..
npm start

# Access admin panel
# Navigate to: http://localhost:3000/admin-login
# Username: admin
# Password: admin123
```

## 🔒 **Security Best Practices**

1. **Change Default Password**: Change `admin123` after first login
2. **Regular Updates**: Keep dependencies updated
3. **Access Control**: Limit admin access to trusted users only
4. **Monitoring**: Monitor admin panel usage for suspicious activity
5. **Backup**: Regular database backups before major changes
6. **Testing**: Test all admin functions in development environment
7. **HTTPS**: Use HTTPS in production for secure admin access

## 📞 **Support**

For additional help or feature requests:
1. Check the codebase for existing implementations
2. Review the API documentation above
3. Test in development environment first
4. Ensure proper error handling and validation
5. Verify admin authentication is working correctly
