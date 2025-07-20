import { FaBug, FaTrophy, FaUserTie, FaStar, FaGem } from 'react-icons/fa';
import { BsShieldCheck, BsCodeSlash } from 'react-icons/bs';

const BADGES = {
  'administrator': {
    name: 'Administrator',
    description: 'Full administrative control over the platform.',
    icon: BsShieldCheck,
    color: 'badge-administrator',
    permissions: {
      canEditSettings: true,
      canDeleteUsers: true,
      canDeletePosts: true,
      canAssignBadges: true,
      canViewPrivateMessages: true,
      canManageUsers: true,
      canManageMessages: true,
    },
  },
  'developer': {
    name: 'Developer',
    description: 'A core contributor to the development and maintenance of the application.',
    icon: BsCodeSlash,
    color: 'badge-developer',
    permissions: {
      canEditSettings: false,
      canDeleteUsers: false,
      canDeletePosts: false,
      canAssignBadges: false,
    },
  },
  'content-moderator': {
    name: 'Content Moderator',
    description: 'Ensures that community content is appropriate and follows guidelines.',
    icon: FaUserTie,
    color: 'badge-content-moderator',
    permissions: {
      canEditSettings: false,
      canDeleteUsers: false,
      canDeletePosts: true,
      canAssignBadges: false,
      canEditAuthor: true,
    },
  },
  'bug-hunter': {
    name: 'Bug Hunter',
    description: 'Awarded for actively finding and reporting significant bugs.',
    icon: FaBug,
    color: 'badge-bug-hunter',
    permissions: {},
  },
  'community-helper': {
    name: 'Community Helper',
    description: 'Recognized for consistently providing helpful answers and support to other users.',
    icon: FaUserTie,
    color: 'badge-community-helper',
    permissions: {},
  },
  'early-adopter': {
    name: 'Early Adopter',
    description: 'Granted to users who joined the platform during its initial phases.',
    icon: FaStar,
    color: 'badge-early-adopter',
    permissions: {},
  },
  'top-contributor': {
    name: 'Top Contributor',
    description: 'Awarded to users with a high volume of valuable contributions (e.g., code, content).',
    icon: FaTrophy,
    color: 'badge-top-contributor',
    permissions: {},
  },
  'designer': {
    name: 'Designer',
    description: 'For users who contribute to the visual design or user experience of the platform.',
    icon: FaGem,
    color: 'badge-designer',
    permissions: {},
  },
  'staff': {
    name: 'Staff',
    description: 'Official member of Luloy Team.',
    icon: FaUserTie,
    color: 'badge-staff',
    permissions: {
      canEditAuthor: true,
    },
  },
  // Add more badges here as needed
};

// A helper function to get a user's combined permissions
function getComputedPermissions(badgeIds = []) {
  const permissions = {};
  for (const badgeId of badgeIds) {
    const badge = BADGES[badgeId];
    if (badge && badge.permissions) {
      for (const permKey in badge.permissions) {
        if (typeof badge.permissions[permKey] === 'boolean') {
          permissions[permKey] = permissions[permKey] || badge.permissions[permKey];
        } else {
          permissions[permKey] = badge.permissions[permKey];
        }
      }
    }
  }
  return permissions;
}

export { BADGES, getComputedPermissions };
