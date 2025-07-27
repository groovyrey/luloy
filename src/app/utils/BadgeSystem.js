import { FaBug, FaTrophy, FaUserTie, FaStar, FaGem, FaHandsHelping, FaGavel, FaMale, FaFemale, FaGenderless } from 'react-icons/fa';
import { BsShieldCheck, BsCodeSlash } from 'react-icons/bs';
import * as BiIcons from 'react-icons/bi';

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
    icon: FaGavel,
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
    icon: FaHandsHelping,
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

const GENDER_ICONS = {
  'Male': { icon: FaMale, color: '#007bff' }, // Blue
  'Female': { icon: FaFemale, color: '#ff69b4' }, // Pink
  'Non-binary': { icon: FaGenderless, color: '#6f42c1' }, // Purple
  'Prefer not to say': { icon: FaGenderless, color: '#6c757d' }, // Gray
};

const INTEREST_ICONS = {
  'Programming': { icon: BiIcons.BiCodeAlt, color: '#007bff' },
  'Web Development': { icon: BiIcons.BiGlobe, color: '#28a745' },
  'Mobile Development': { icon: BiIcons.BiMobile, color: '#fd7e14' },
  'Data Science': { icon: BiIcons.BiData, color: '#6f42c1' },
  'Machine Learning': { icon: BiIcons.BiBrain, color: '#dc3545' },
  'Cybersecurity': { icon: BiIcons.BiLockAlt, color: '#343a40' },
  'Cloud Computing': { icon: BiIcons.BiCloud, color: '#17a2b8' },
  'DevOps': { icon: BiIcons.BiGitBranch, color: '#6610f2' },
  'Game Development': { icon: BiIcons.BiGame, color: '#e83e8c' },
  'UI/UX Design': { icon: BiIcons.BiPalette, color: '#ffc107' },
  'Technical Writing': { icon: BiIcons.BiBookContent, color: '#6c757d' },
  'Open Source': { icon: BiIcons.BiLaptop, color: '#20c997' },
  'Artificial Intelligence': { icon: BiIcons.BiChip, color: '#007bff' },
  'Blockchain': { icon: BiIcons.BiBlock, color: '#6f42c1' },
  'Internet of Things (IoT)': { icon: BiIcons.BiWifi, color: '#17a2b8' },
  'Robotics': { icon: BiIcons.BiHardHat, color: '#dc3545' },
  'Virtual Reality (VR)': { icon: BiIcons.BiGlasses, color: '#e83e8c' },
  'Augmented Reality (AR)': { icon: BiIcons.BiGlassesAlt, color: '#ffc107' },
  'Gaming': { icon: BiIcons.BiGame, color: '#28a745' },
  'Photography': { icon: BiIcons.BiCamera, color: '#6c757d' },
  'Music': { icon: BiIcons.BiMusic, color: '#fd7e14' },
  'Reading': { icon: BiIcons.BiBook, color: '#007bff' },
  'Sports': { icon: BiIcons.BiFootball, color: '#dc3545' },
  'Travel': { icon: BiIcons.BiWorld, color: '#17a2b8' },
  'Cooking': { icon: BiIcons.BiFoodMenu, color: '#ffc107' },
  'Fitness': { icon: BiIcons.BiRun, color: '#28a745' },
  'Gardening': { icon: BiIcons.BiLeaf, color: '#20c997' },
  'DIY': { icon: BiIcons.BiWrench, color: '#6f42c1' },
  'Volunteering': { icon: BiIcons.BiHeart, color: '#fd7e14' },
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

export { BADGES, GENDER_ICONS, INTEREST_ICONS, getComputedPermissions };