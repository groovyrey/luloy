'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './UserSearchResultCard.module.css';

export default function UserSearchResultCard({ user, className, displayUploadDate, uploadDate }) {


  return (
    <div className={`${styles.card} ${className || ''}`}>
      <Link href={`/user/${user.id}`} className={styles.link}>
        <div className={styles.profilePictureContainer}>
          {user.profilePictureUrl ? (
            <Image
              src={user.profilePictureUrl}
              alt={`${user.firstName} ${user.lastName}`}
              width={80}
              height={80}
              className={styles.profilePicture}
            />
          ) : (
            <div className={styles.placeholderPicture}>
              <i className="bi bi-person-circle"></i>
            </div>
          )}
        </div>
        <div className={styles.userInfo}>
          <h5 className={styles.userName}>{user.firstName.charAt(0).toUpperCase() + user.firstName.slice(1)} {user.lastName.charAt(0).toUpperCase() + user.lastName.slice(1)}</h5>
          {displayUploadDate ? (
            <small className={styles.userId}>Uploaded: {new Date(uploadDate).toLocaleDateString()}</small>
          ) : (
            <>
              <p className={styles.userEmail}>{user.email}</p>
              <small className={styles.userId}>ID: {user.id}</small>
            </>
          )}
        </div>
      </Link>
    </div>
  );
}