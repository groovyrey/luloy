'use client';

import React from 'react';

import UserSearchResultCard from '../../components/UserSearchResultCard';
import { useState, useEffect } from 'react';
import { BADGES } from '../../utils/BadgeSystem';

export default function StaffPage() {
  const [staffUsers, setStaffUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchStaffUsers() {
      try {
        const response = await fetch('/api/user/staff');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setStaffUsers(data);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }

    fetchStaffUsers();
  }, []);

  if (loading) {
    return (
      <div className="container mt-4">
        <h1 className="d-flex align-items-center">
          Staff Members <BADGES.staff.icon className={`ms-2 ${BADGES.staff.color}`} title={BADGES.staff.name} />
        </h1>
        <p>Loading staff members...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-4">
        <h1 className="d-flex align-items-center">
          Staff Members <BADGES.staff.icon className={`ms-2 ${BADGES.staff.color}`} title={BADGES.staff.name} />
        </h1>
        <p className="text-danger">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h1 className="d-flex align-items-center">
        Staff Members <BADGES.staff.icon className={`ms-2 ${BADGES.staff.color}`} title={BADGES.staff.name} />
      </h1>
      {staffUsers.length === 0 ? (
        <p>No staff members found.</p>
      ) : (
        <div className="list-group">
          {staffUsers.map((user) => (
            <UserSearchResultCard key={user.id} user={{ ...user, email: undefined }} />
          ))}
        </div>
      )}
    </div>
  );
}
