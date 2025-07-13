'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '../../../app/context/UserContext';
import LoadingMessage from '../../../app/components/LoadingMessage';
import { CldImage } from 'next-cloudinary';
import Link from 'next/link';
import { showToast } from '../../../app/utils/toast';
import { capitalizeName } from '../../../app/utils/capitalizeName';
import { validateUsername } from '../../../app/utils/usernameValidation';

const COOLDOWN_PERIOD_MS = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

export default function EditUserPage() {
  const { user, userData, loading, refreshUserData } = useUser();
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [age, setAge] = useState('');
  const [profilePictureFile, setProfilePictureFile] = useState(null);
  const [profilePicturePreviewUrl, setProfilePicturePreviewUrl] = useState(null);
  const [bio, setBio] = useState('');
  const [currentUsername, setCurrentUsername] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [lastUsernameChange, setLastUsernameChange] = useState(null);
  
  const [isFetchingUserData, setIsFetchingUserData] = useState(true); // New state for data fetching
  const [isUpdating, setIsUpdating] = useState(false); // New state for update loading

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
      setCurrentUsername(userData.username || '');
      setNewUsername(userData.username || ''); // Initialize newUsername with current username
      if (userData.lastUsernameChange) {
        setLastUsernameChange(new Date(userData.lastUsernameChange._seconds * 1000 + userData.lastUsernameChange._nanoseconds / 1000000));
      }
      setIsFetchingUserData(false);
    }
  }, [user, loading, router, userData]);

  const checkUsernameAvailability = useCallback(async (uname) => {
    if (!uname || uname === currentUsername) {
      setUsernameAvailable(null);
      setUsernameError('');
      return;
    }

    const { isValid, message } = validateUsername(uname);
    if (!isValid) {
      setUsernameError(message);
      setUsernameAvailable(false);
      return;
    }

    setUsernameError('');
    try {
      const res = await fetch(`/api/user/check-username?username=${uname}`);
      const data = await res.json();
      if (res.ok) {
        setUsernameAvailable(data.isAvailable);
        if (!data.isAvailable) {
          setUsernameError(data.message);
        }
      } else {
        setUsernameAvailable(false);
        setUsernameError(data.error || 'Error checking username.');
      }
    } catch (error) {
      console.error("Error checking username:", error);
      setUsernameAvailable(false);
      setUsernameError('Network error checking username.');
    }
  }, [currentUsername]);

  // Debounce username availability check
  useEffect(() => {
    const handler = setTimeout(() => {
      checkUsernameAvailability(newUsername);
    }, 500); // 500ms debounce time

    return () => {
      clearTimeout(handler);
    };
  }, [newUsername, checkUsernameAvailability]);

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
    try {
      const res = await fetch('/api/user/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ uid: user.uid, firstName: capitalizeName(firstName), lastName: capitalizeName(lastName), age: parseInt(age), bio }),
      });

      if (res.ok) {
        showToast('Profile updated successfully!', 'success');
        await refreshUserData();
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

  const handleUsernameChange = async () => {
    if (!newUsername || newUsername === currentUsername) {
      showToast("Please enter a new username.", 'error');
      return;
    }

    const { isValid: usernameFormatValid } = validateUsername(newUsername);
    if (!usernameFormatValid) {
      showToast(usernameError || "Invalid username format.", 'error');
      return;
    }

    if (usernameAvailable === false) {
      showToast(usernameError || "Username is not available.", 'error');
      return;
    }

    // Check cooldown
    if (lastUsernameChange) {
      const timeSinceLastChange = Date.now() - lastUsernameChange.getTime();
      if (timeSinceLastChange < COOLDOWN_PERIOD_MS) {
        const remainingTimeMs = COOLDOWN_PERIOD_MS - timeSinceLastChange;
        const remainingDays = Math.ceil(remainingTimeMs / (1000 * 60 * 60 * 24));
        showToast(`You can only change your username once every 7 days. Please wait ${remainingDays} more day(s).`, 'error');
        return;
      }
    }

    setIsUpdating(true);
    try {
      const res = await fetch('/api/user/update-username', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ uid: user.uid, newUsername }),
      });

      if (res.ok) {
        showToast('Username updated successfully!', 'success');
        await refreshUserData(); // Refresh user data in context
      } else {
        let errorData = {};
        try {
          errorData = await res.json();
        } catch (jsonError) {
          console.error("Failed to parse error response:", jsonError);
        }
        showToast(errorData.error || 'Failed to update username.', 'error');
      }
    } catch (err) {
      console.error("An unexpected error occurred during username update:", err);
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

  const handleRemoveProfilePicture = async () => {
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
          console.error("Failed to parse error response:", jsonError);
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

  const canChangeUsername = lastUsernameChange ? (Date.now() - lastUsernameChange.getTime() >= COOLDOWN_PERIOD_MS) : true;
  const remainingCooldownTime = lastUsernameChange ? Math.ceil((COOLDOWN_PERIOD_MS - (Date.now() - lastUsernameChange.getTime())) / (1000 * 60 * 60 * 24)) : 0;

  if (loading || isFetchingUserData) {
    return <LoadingMessage />;
  }

  if (!user) {
    return <LoadingMessage />;
  }

  return (
    <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
      <div className="card m-2" style={{ maxWidth: '600px', width: '100%' }}>
        <div className="card-body">
          <h2 className="card-title text-center mb-4"><span className="bi-person-fill-gear"></span>{" "}User Settings</h2>
          
          <div className="mb-3">
            <label htmlFor="profilePicture" className="form-label">Profile Picture</label>
            <div className="mb-2 text-center">
              {profilePicturePreviewUrl ? (
                <CldImage
                  src={profilePicturePreviewUrl}
                  alt="Profile Preview"
                  width={100}
                  height={100}
                  crop="fill"
                  className="rounded-circle border border-primary border-3 mx-auto"
                  style={{ objectFit: 'cover' }}
                />
              ) : (
                <div
                  className="rounded-circle border border-primary border-3 d-flex align-items-center justify-content-center mx-auto"
                  style={{
                    width: '100px',
                    height: '100px',
                    backgroundColor: 'var(--accent-color)',
                    cursor: 'not-allowed'
                  }}
                >
                  <i className="bi bi-person-fill" style={{ fontSize: '50px', color: 'var(--light-text-color)' }}></i>
                </div>
              )}
            </div>
            <input type="file" id="profilePicture" className="form-control" onChange={e => {
              const file = e.target.files[0];
              setProfilePictureFile(file);
              if (file) {
                setProfilePicturePreviewUrl(URL.createObjectURL(file));
              } else {
                setProfilePicturePreviewUrl(null);
              }
            }} disabled={isUpdating} />
          </div>
          <div className="mb-2">
            <button className="btn btn-secondary w-100" onClick={handleProfilePictureUpload} disabled={isUpdating}>
              {isUpdating ? (
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
              ) : (
                <i className="bi-upload"></i>
              )}{' '}{isUpdating ? 'Uploading...' : 'Upload New Picture'}
            </button>
            <button className="btn btn-danger w-100 mt-2" onClick={handleRemoveProfilePicture} disabled={isUpdating || !userData?.profilePictureUrl}>
              <i className="bi-trash"></i> Remove Picture
            </button>
          </div>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">Email</label>
            <input type="email" id="email" className="form-control" value={user?.email} disabled readOnly />
          </div>
          <div className="mb-3">
            <label htmlFor="usernameInput" className="form-label">{canChangeUsername ? 'Change Username' : 'Current Username'}</label>
            <input 
              type="text" 
              className={`form-control ${usernameError ? 'is-invalid' : ''} ${usernameAvailable === true && newUsername !== currentUsername ? 'is-valid' : ''}`}
              id="usernameInput" 
              placeholder="Username" 
              value={canChangeUsername ? newUsername : currentUsername}
              onChange={e => {
                if (canChangeUsername) {
                  setNewUsername(e.target.value);
                }
              }}
              disabled={isUpdating || !canChangeUsername}
              readOnly={!canChangeUsername}
            />
            {usernameError && <div className="invalid-feedback">{usernameError}</div>}
            {usernameAvailable === true && newUsername !== currentUsername && !usernameError && <div className="valid-feedback">Username is available!</div>}
            {!canChangeUsername && (
              <div className="form-text text-danger">
                You can change your username again in {remainingCooldownTime} day(s).
              </div>
            )}
            {canChangeUsername && (
              <button 
                className="btn btn-secondary w-100 mt-2"
                onClick={handleUsernameChange}
                disabled={isUpdating || newUsername === currentUsername || usernameAvailable === false || usernameError !== ''}
              >
                {isUpdating ? (
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                ) : (
                  <i className="bi-pencil"></i>
                )}{' '}{isUpdating ? 'Updating Username...' : 'Change Username'}
              </button>
            )}
          </div>
          <div className="mb-3">
            <label htmlFor="firstName" className="form-label">First Name</label>
            <input type="text" id="firstName" className="form-control" placeholder="First Name" value={firstName} onChange={e => setFirstName(e.target.value)} disabled={isUpdating} />
          </div>
          <div className="mb-3">
            <label htmlFor="lastName" className="form-label">Last Name</label>
            <input type="text" id="lastName" className="form-control" placeholder="Last Name" value={lastName} onChange={e => setLastName(e.target.value)} disabled={isUpdating} />
          </div>
          <div className="mb-3">
            <label htmlFor="age" className="form-label">Age</label>
            <input type="number" id="age" className="form-control" placeholder="Age" value={age} onChange={e => setAge(e.target.value)} disabled={isUpdating} />
          </div>
          <div className="mb-3">
            <label htmlFor="bio" className="form-label">Bio</label>
            <textarea id="bio" className="form-control" placeholder="Tell us about yourself..." value={bio} onChange={e => setBio(e.target.value.slice(0, 50))} rows="3" maxLength={50} disabled={isUpdating}></textarea>
            <div className="text-end text-muted" style={{ fontSize: '0.85em' }}>
              {bio.length}/50 characters
            </div>
          </div>
          <button className="btn btn-primary w-100" onClick={handleUpdate} disabled={isUpdating}>
            {isUpdating ? (
              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            ) : (
              <i className="bi-save"></i>
            )}{' '}{isUpdating ? 'Updating...' : 'Update Profile'}
          </button>
          <div className="text-center mt-3">
            <Link href="/" className="btn btn-link">Back to Home</Link>
          </div>
          <div className="text-center mt-3">
            <button className="btn btn-secondary" onClick={handleResetPassword}>Reset Password</button>
          </div>
        </div>
      </div>
    </div>
  );
}
