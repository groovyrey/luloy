'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUser } from '../../../app/context/UserContext';
import LoadingMessage from '../../../app/components/LoadingMessage';
import { CldImage } from 'next-cloudinary';
import Link from 'next/link';
import { showToast } from '../../../app/utils/toast';
import { capitalizeName } from '../../../app/utils/capitalizeName';
import Modal from '../../../app/components/Modal';

export default function EditUserPage() {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const { user, userData, loading, refreshUserData } = useUser();
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [age, setAge] = useState('');
  const [profilePictureFile, setProfilePictureFile] = useState(null);
  const [profilePicturePreviewUrl, setProfilePicturePreviewUrl] = useState(null);
  const [bio, setBio] = useState('');
  const searchParams = useSearchParams();
  const [activeSection, setActiveSection] = useState('information'); // New state for active section

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['information', 'security'].includes(tab)) {
      setActiveSection(tab);
    }
  }, [searchParams]);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isResetModalOpen, setIsResetModalOpen] = useState(false); // New state for reset password modal
  
  const [isFetchingUserData, setIsFetchingUserData] = useState(true); // New state for data fetching
  const [isUpdating, setIsUpdating] = useState(false); // New state for update loading

  // Rate limiting states for individual fields
  const [firstNameDisabled, setFirstNameDisabled] = useState(false);
  const [lastNameDisabled, setLastNameDisabled] = useState(false);
  const [ageDisabled, setAgeDisabled] = useState(false);

  // Remaining time messages
  const [firstNameRemainingTime, setFirstNameRemainingTime] = useState('');
  const [lastNameRemainingTime, setLastNameRemainingTime] = useState('');
  const [ageRemainingTime, setAgeRemainingTime] = useState('');

  // Timestamps for last updates
  const [lastFirstNameUpdate, setLastFirstNameUpdate] = useState(0);
  const [lastLastNameUpdate, setLastLastNameUpdate] = useState(0);
  const [lastAgeUpdate, setLastAgeUpdate] = useState(0);

  const COOLDOWN_PERIOD = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

  useEffect(() => {
    document.title = "User Settings";
    if (!loading && !user) {
      router.push('/login');
    } else if (user && userData) {
      setFirstName(userData.firstName || '');
      setLastName(userData.lastName || '');
      setAge(userData.age || '');
      if (userData.profilePictureUrl) {
        setProfilePicturePreviewUrl(userData.profilePictureUrl);
      }
      setBio(userData.bio || '');
      setIsFetchingUserData(false);

      // Load timestamps from userData (Firestore) and set disabled states
      const now = Date.now();

      const lastFieldUpdates = userData.lastFieldUpdates || {};

      const getMillis = (field) => {
        if (field) {
          if (typeof field.toMillis === 'function') {
            return field.toMillis();
          } else if (typeof field === 'number') {
            return field;
          }
        }
        return 0; // Default to 0 if not a valid timestamp or number
      };

      let lastFirstNameUpdateMillis = getMillis(lastFieldUpdates.firstName);
      const firstNameTimeElapsed = now - lastFirstNameUpdateMillis;
      if (firstNameTimeElapsed < COOLDOWN_PERIOD) {
        setFirstNameDisabled(true);
        const remaining = COOLDOWN_PERIOD - firstNameTimeElapsed;
        setFirstNameRemainingTime(formatTimeRemaining(remaining));
        setTimeout(() => {
          setFirstNameDisabled(false);
          setFirstNameRemainingTime('');
        }, remaining);
      }
      setLastFirstNameUpdate(lastFirstNameUpdateMillis);

      let lastLastNameUpdateMillis = getMillis(lastFieldUpdates.lastName);
      const lastNameTimeElapsed = now - lastLastNameUpdateMillis;
      if (lastNameTimeElapsed < COOLDOWN_PERIOD) {
        setLastNameDisabled(true);
        const remaining = COOLDOWN_PERIOD - lastNameTimeElapsed;
        setLastNameRemainingTime(formatTimeRemaining(remaining));
        setTimeout(() => {
          setLastNameDisabled(false);
          setLastNameRemainingTime('');
        }, remaining);
      }
      setLastLastNameUpdate(lastLastNameUpdateMillis);

      let lastAgeUpdateMillis = getMillis(lastFieldUpdates.age);
      const ageTimeElapsed = now - lastAgeUpdateMillis;
      if (ageTimeElapsed < COOLDOWN_PERIOD) {
        setAgeDisabled(true);
        const remaining = COOLDOWN_PERIOD - ageTimeElapsed;
        setAgeRemainingTime(formatTimeRemaining(remaining));
        setTimeout(() => {
          setAgeDisabled(false);
          setAgeRemainingTime('');
        }, remaining);
      }
      setLastAgeUpdate(lastAgeUpdateMillis);
    }
  }, [user, loading, router, userData]);

  const formatTimeRemaining = (ms) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    let parts = [];
    if (days > 0) parts.push(`${days} day${days > 1 ? 's' : ''}`);
    if (hours % 24 > 0) parts.push(`${hours % 24} hour${hours % 24 > 1 ? 's' : ''}`);
    if (minutes % 60 > 0) parts.push(`${minutes % 60} minute${minutes % 60 > 1 ? 's' : ''}`);
    if (seconds % 60 > 0) parts.push(`${seconds % 60} second${seconds % 60 > 1 ? 's' : ''}`);

    return parts.join(', ') || 'less than a second';
  };

  const handleUpdate = async () => {
    // Client-side validation
    if (!firstName.trim()) {
      showToast('First Name cannot be empty.', 'error');
      return;
    }
    if (!lastName.trim()) {
      showToast('Last Name cannot be empty.', 'error');
      return;
    }
    if (!age || isNaN(parseInt(age)) || parseInt(age) <= 0) {
      showToast('Please enter a valid age.', 'error');
      return;
    }

    setIsUpdating(true);

    const updatedFields = {
      firstName: capitalizeName(firstName),
      lastName: capitalizeName(lastName),
      age: parseInt(age),
    };

    if (bio !== userData.bio) updatedFields.bio = bio;

    // Check if any of the core fields (firstName, lastName, age) have actually changed
    // or if bio has changed. If not, show info toast and return.
    if (firstName === userData.firstName &&
        lastName === userData.lastName &&
        age === userData.age &&
        bio === userData.bio) {
      showToast('No changes to update.', 'info');
      setIsUpdating(false);
      return;
    }

    // Determine if firstName, lastName, or age were actually changed for rate limiting
    let firstNameChanged = firstName !== userData.firstName;
    let lastNameChanged = lastName !== userData.lastName;
    let ageChanged = age !== userData.age;

    try {
      const res = await fetch('/api/user/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ uid: user.uid, ...updatedFields }),
      });

      if (res.ok) {
        showToast('Profile updated successfully!', 'success');
        await refreshUserData();

        const now = Date.now();
        if (firstNameChanged) {
          setLastFirstNameUpdate(now);
          setFirstNameDisabled(true);
          console.log('firstNameDisabled set to true after update.');
          setTimeout(() => {
            setFirstNameDisabled(false);
            setFirstNameRemainingTime('');
            console.log('firstName re-enabled after timeout.');
          }, COOLDOWN_PERIOD);
        }
        if (lastNameChanged) {
          setLastLastNameUpdate(now);
          setLastNameDisabled(true);
          console.log('lastNameDisabled set to true after update.');
          setTimeout(() => {
            setLastNameDisabled(false);
            setLastNameRemainingTime('');
            console.log('lastName re-enabled after timeout.');
          }, COOLDOWN_PERIOD);
        }
        if (ageChanged) {
          setLastAgeUpdate(now);
          setAgeDisabled(true);
          console.log('ageDisabled set to true after update.');
          setTimeout(() => {
            setAgeDisabled(false);
            setAgeRemainingTime('');
            console.log('age re-enabled after timeout.');
          }, COOLDOWN_PERIOD);
        }

      } else {
        let errorData = {};
        try {
          errorData = await res.json();
        } catch (jsonError) {
          console.error("Failed to parse error response:", jsonError);
        }
        showToast(errorData.error || 'Failed to update profile.', 'error');
      }
    } catch (err) {
      console.error("An unexpected error occurred during profile update:", err);
      showToast('An unexpected error occurred.', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleResetPassword = async () => {
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: user.email }),
      });

      const data = await res.json();

      if (res.ok) {
        showToast('Password reset link sent to your email!', 'success');
      } else {
        showToast(data.error || 'Failed to send password reset link.', 'error');
      }
    } catch (err) {
      showToast('An unexpected error occurred.', 'error');
    }
  };

  const confirmResetPassword = async () => {
    setIsResetModalOpen(false);
    await handleResetPassword();
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      showToast('All password fields are required.', 'error');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      showToast('New password and confirm password do not match.', 'error');
      return;
    }
    if (newPassword.length < 6) {
      showToast('New password must be at least 6 characters long.', 'error');
      return;
    }

    setIsUpdating(true);
    try {
      const res = await fetch('/api/user/update-password', { // Assuming a new API endpoint for changing password
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ uid: user.uid, currentPassword, newPassword }),
      });

      const data = await res.json();

      if (res.ok) {
        showToast('Password changed successfully!', 'success');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
      } else {
        showToast(data.error || 'Failed to change password.', 'error');
      }
    } catch (err) {
      console.error("An unexpected error occurred during password change:", err);
      showToast('An unexpected error occurred.', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleProfilePictureUpload = async () => {
    if (!profilePictureFile) {
      showToast("Please select a file to upload.", 'error');
      return;
    }

    setIsUpdating(true);

    const formData = new FormData();
    formData.append("uid", user.uid);
    formData.append("file", profilePictureFile);

    try {
      const res = await fetch('/api/user/upload-profile-picture', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        showToast('Profile picture uploaded successfully!', 'success');
        await refreshUserData();
        const updatedUserData = await res.json();
        setProfilePicturePreviewUrl(updatedUserData.url);
      } else {
        let errorData = {};
        try {
          errorData = await res.json();
        } catch (jsonError) {
          console.error("Failed to parse error response:", jsonError);
        }
        showToast(errorData.error || 'Failed to upload profile picture.', 'error');
      }
    } catch (err) {
      console.error("An unexpected error occurred during file upload:", err);
      showToast('An unexpected error occurred.', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemoveProfilePicture = () => {
    setIsDeleteModalOpen(true);
  };

  const confirmRemoveProfilePicture = async () => {
    setIsDeleteModalOpen(false);
    setIsUpdating(true);

    try {
      const res = await fetch(`/api/user/upload-profile-picture?uid=${user.uid}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        showToast('Profile picture removed successfully!', 'success');
        setProfilePicturePreviewUrl(null);
        setProfilePictureFile(null);
        await refreshUserData();
      } else {
        let errorData = {};
        try {
          errorData = await res.json();
        } catch (jsonError) {
          console.error("Failed to parse error:", jsonError);
        }
        showToast(errorData.error || 'Failed to remove profile picture.', 'error');
      }
    } catch (err) {
      console.error("An unexpected error occurred during profile picture removal:", err);
      showToast('An unexpected error occurred.', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading || isFetchingUserData) {
    return <LoadingMessage />;
  }

  if (!user) {
    return <LoadingMessage />;
  }

  return (
    <div className="d-flex flex-column align-items-center justify-content-center py-3" style={{ minHeight: 'calc(100vh - 60px)' }}>
      <div className="card shadow-sm" style={{ maxWidth: '450px', width: '100%' }}>
        <div className="card-header text-center py-2">
          <img src="/luloy.svg" alt="Luloy Logo" className="mb-2" style={{ height: '3.5em' }} />
          <h2 className="card-title fw-bold mb-0 fs-5"><span className="bi-person-fill-gear me-2"></span>User Settings</h2>
          <p className="mb-0 text-muted text-xs">Manage your profile and account settings.</p>
          <div className="d-flex justify-content-center mt-3">
            <button
              className={`btn btn-sm ${activeSection === 'information' ? 'btn-primary' : 'btn-outline-primary'} me-2`}
              onClick={() => {
                router.push(`/user/settings?tab=information`, undefined, { shallow: true });
                setActiveSection('information');
              }}
            >
              Information
            </button>
            <button
              className={`btn btn-sm ${activeSection === 'security' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => {
                router.push(`/user/settings?tab=security`, undefined, { shallow: true });
                setActiveSection('security');
              }}
            >
              Security
            </button>
          </div>
        </div>
        <div className="card-body p-3">
          {activeSection === 'information' && (
            <>
          <div className="mb-2 text-center">
            <label htmlFor="profilePicture" className="form-label d-block mb-2">Profile Picture</label>
            <div className="mb-2">
              {profilePicturePreviewUrl ? (
                <CldImage
                  src={profilePicturePreviewUrl}
                  alt="Profile Preview"
                  width={80}
                  height={80}
                  crop="fill"
                  className="rounded-circle border border-primary border-2 mx-auto"
                  style={{ objectFit: 'cover' }}
                />
              ) : (
                <div
                  className="rounded-circle border border-primary border-2 d-flex align-items-center justify-content-center mx-auto"
                  style={{
                    width: '80px',
                    height: '80px',
                    backgroundColor: 'var(--accent-color)',
                    cursor: 'not-allowed'
                  }}
                >
                  <i className="bi bi-person-fill" style={{ fontSize: '40px', color: 'var(--light-text-color)' }}></i>
                </div>
              )}
            </div>
            <input type="file" id="profilePicture" className="form-control form-control-sm mb-1" onChange={e => {
              const file = e.target.files[0];
              setProfilePictureFile(file);
              if (file) {
                setProfilePicturePreviewUrl(URL.createObjectURL(file));
              } else {
                setProfilePicturePreviewUrl(null);
              }
            }} disabled={isUpdating} />
            <div className="d-grid gap-2 d-sm-flex justify-content-sm-center">
              <button className="btn btn-secondary btn-sm flex-grow-1" onClick={handleProfilePictureUpload} disabled={isUpdating}>
                {isUpdating ? (
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                ) : (
                  <i className="bi-upload me-1"></i>
                )}{' '}{isUpdating ? 'Uploading...' : 'Upload New'}
              </button>
              <button className="btn btn-danger btn-sm flex-grow-1" onClick={handleRemoveProfilePicture} disabled={isUpdating || !userData?.profilePictureUrl}>
                <i className="bi-trash me-1"></i> Remove
              </button>
            </div>
          </div>
          <hr className="my-3"/>
          <div className="mb-2">
            <label htmlFor="email" className="form-label small mb-1">Email</label>
            <input type="email" id="email" className="form-control form-control-sm" value={user?.email} disabled readOnly />
          </div>
          <div className="mb-2">
            <label htmlFor="firstName" className="form-label small mb-1">First Name</label>
            <input type="text" id="firstName" className="form-control form-control-sm" placeholder="First Name" value={firstName} onChange={e => setFirstName(e.target.value)} disabled={isUpdating || firstNameDisabled} />
            {firstNameDisabled && firstNameRemainingTime && (
              <small className="text-warning d-block mt-1 text-xs">Can change in: {firstNameRemainingTime}</small>
            )}
          </div>
          <div className="mb-2">
            <label htmlFor="lastName" className="form-label small mb-1">Last Name</label>
            <input type="text" id="lastName" className="form-control form-control-sm" placeholder="Last Name" value={lastName} onChange={e => setLastName(e.target.value)} disabled={isUpdating || lastNameDisabled} />
            {lastNameDisabled && lastNameRemainingTime && (
              <small className="text-warning d-block mt-1 text-xs">Can change in: {lastNameRemainingTime}</small>
            )}
          </div>
          <div className="mb-2">
            <label htmlFor="age" className="form-label small mb-1">Age</label>
            <input type="number" id="age" className="form-control form-control-sm" placeholder="Age" value={age} onChange={e => setAge(e.target.value)} disabled={isUpdating || ageDisabled} />
            {ageDisabled && ageRemainingTime && (
              <small className="text-warning d-block mt-1 text-xs">Can change in: {ageRemainingTime}</small>
            )}
          </div>
          <div className="mb-3">
            <label htmlFor="bio" className="form-label small mb-1">Bio (max 50 chars)</label>
            <textarea id="bio" className="form-control form-control-sm" placeholder="Tell us about yourself..." value={bio} onChange={e => setBio(e.target.value.slice(0, 50))} rows="2" maxLength={50} disabled={isUpdating}></textarea>
            <div className="text-end text-muted small mt-1">
              {bio.length}/50 characters
            </div>
          </div>
          <button className="btn btn-primary w-100 mb-2" onClick={handleUpdate} disabled={isUpdating}>
            {isUpdating ? (
              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            ) : (
              <i className="bi-save me-1"></i>
            )}{' '}{isUpdating ? 'Updating...' : 'Update Profile'}
          </button>
          <div className="d-grid gap-2">
          <Link href="/" className="btn btn-outline-info btn-sm mt-2">
            Back to Home
          </Link>
          </div>
            </>
          )}
          {activeSection === 'security' && (
            <div>
              <h5 className="text-center mb-3">Security Settings</h5>
              <p className="text-center text-muted">Manage your security preferences here.</p>
              <div className="mb-3">
                <label htmlFor="currentPassword" className="form-label small mb-1">Current Password</label>
                <input type="password" id="currentPassword" className="form-control form-control-sm" placeholder="Current Password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} disabled={isUpdating} />
              </div>
              <div className="mb-3">
                <label htmlFor="newPassword" className="form-label small mb-1">New Password</label>
                <input type="password" id="newPassword" className="form-control form-control-sm" placeholder="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} disabled={isUpdating} />
              </div>
              <div className="mb-4">
                <label htmlFor="confirmNewPassword" className="form-label small mb-1">Confirm New Password</label>
                <input type="password" id="confirmNewPassword" className="form-control form-control-sm" placeholder="Confirm New Password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} disabled={isUpdating} />
              </div>
              <button className="btn btn-primary w-100 mb-2" onClick={handleChangePassword} disabled={isUpdating}>
                {isUpdating ? (
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                ) : (
                  <i className="bi-lock me-1"></i>
                )}{' '}{isUpdating ? 'Updating...' : 'Change Password'}
              </button>
              <p className="text-center mt-3 mb-0"><a href="#" onClick={() => setIsResetModalOpen(true)} className="text-primary small">Forgot your password? Reset it here.</a></p>
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
        <h5 className="mb-3">Confirm Profile Picture Removal</h5>
        <p>Are you sure you want to remove your profile picture? This action cannot be undone.</p>
        <div className="d-flex justify-content-center gap-2 mt-4">
          <button className="btn btn-danger" onClick={confirmRemoveProfilePicture}>Yes, Remove</button>
          <button className="btn btn-secondary" onClick={() => setIsDeleteModalOpen(false)}>Cancel</button>
        </div>
      </Modal>

      <Modal isOpen={isResetModalOpen} onClose={() => setIsResetModalOpen(false)}>
        <h5 className="mb-3">Confirm Password Reset</h5>
        <p>Are you sure you want to send a password reset link to your email ({user?.email})? You will need to check your inbox to complete the reset process.</p>
        <div className="d-flex justify-content-center gap-2 mt-4">
          <button className="btn btn-danger" onClick={confirmResetPassword}>Yes, Send Link</button>
          <button className="btn btn-secondary" onClick={() => setIsResetModalOpen(false)}>Cancel</button>
        </div>
      </Modal>
    </div>
  );
        
}