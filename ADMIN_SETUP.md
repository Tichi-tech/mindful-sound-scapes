# Admin System Setup Guide

This guide explains how to set up and use the admin system for evaluating user-generated music tracks.

## Features

The admin system includes:
- **Role-based access control**: Admins can evaluate and manage user-generated content
- **Track evaluation**: Rate tracks from 1-5 stars and add review notes
- **Featured content**: Mark tracks as featured to display them prominently on the home page
- **Community curation**: Admin-selected tracks appear first in the community showcase

## Database Structure

The admin system adds the following to your database:

### New Tables
- `user_roles`: Stores user role assignments (admin/user)

### Extended Tables
- `generated_tracks` now includes:
  - `admin_rating`: 1-5 star rating from admin
  - `is_featured`: Boolean flag for featured tracks
  - `admin_notes`: Admin review comments
  - `reviewed_at`: Timestamp of last review
  - `reviewed_by`: ID of admin who reviewed

## Setting Up Your First Admin

Since the system requires an admin to promote other users, you need to manually create the first admin user:

### Option 1: Direct Database Insert (Recommended)

1. Go to your Supabase dashboard → SQL Editor
2. Find the user ID of the person you want to make admin:
   ```sql
   SELECT user_id, display_name FROM profiles WHERE display_name ILIKE '%youremail%';
   ```
3. Insert the admin role:
   ```sql
   INSERT INTO user_roles (user_id, role) 
   VALUES ('USER_ID_FROM_STEP_2', 'admin');
   ```

### Option 2: Using Browser Console (For Developers)

1. Sign in to your app as the user you want to promote
2. Open browser developer tools → Console
3. Run this code (replace with actual email):
   ```javascript
   import { promoteUserToAdmin } from './src/utils/adminUtils';
   const result = await promoteUserToAdmin('admin@example.com');
   console.log(result);
   ```

## Using the Admin Panel

Once you have admin access:

1. **Access**: The "Admin" tab appears in the navigation for admin users
2. **Review Tracks**: 
   - View all completed user-generated tracks
   - Listen to audio previews
   - Rate tracks from 1-5 stars
   - Add review notes
3. **Feature Tracks**: 
   - Click "Feature Track" to promote good content
   - Featured tracks appear first on the home page
   - Featured tracks show a "Featured" badge
4. **Track Management**:
   - Submit reviews to save ratings and notes
   - Track review history with timestamps

## Home Page Integration

The community showcase on the home page now prioritizes content as follows:
1. **Featured tracks** (admin-selected) appear first
2. **Recent tracks** fill remaining slots
3. **Admin ratings** are displayed on track cards
4. **Featured badges** highlight promoted content

## Admin Permissions

Admins can:
- View and access the admin panel
- Rate and review all user-generated tracks
- Mark tracks as featured/unfeatured
- View all user roles (future feature)
- Promote other users to admin (database access required)

## Security Notes

- Admin status is controlled by Row Level Security (RLS) policies
- Only authenticated users can access admin functions
- Admin actions are logged with timestamps and user IDs
- All database operations use proper security definer functions

## Future Enhancements

Consider adding:
- Admin dashboard with analytics
- Bulk operations for track management
- Content moderation tools
- User management interface
- Admin activity logging