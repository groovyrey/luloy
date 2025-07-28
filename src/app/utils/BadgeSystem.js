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

const GENDER_OPTIONS = [
  { value: 'Male', label: 'Male', icon: FaMale, color: '#007bff' },
  { value: 'Female', label: 'Female', icon: FaFemale, color: '#ff69b4' },
  { value: 'Prefer not to say', label: 'Prefer not to say', icon: FaGenderless, color: '#6c757d' },
];

const INTEREST_OPTIONS = [
  // General Interests
  { value: 'General Interests', label: 'General Interests', icon: BiIcons.BiCategory, color: '#6c757d' },
  { value: 'Technology', label: 'Technology', icon: BiIcons.BiLaptop, color: '#007bff' },
  { value: 'Travel', label: 'Travel', icon: BiIcons.BiWorld, color: '#17a2b8' },
  { value: 'Food & Cooking', label: 'Food & Cooking', icon: BiIcons.BiFoodMenu, color: '#ffc107' },
  { value: 'Fashion', label: 'Fashion', icon: BiIcons.BiCloset, color: '#e83e8c' },
  { value: 'Photography', label: 'Photography', icon: BiIcons.BiCamera, color: '#6c757d' },
  { value: 'Movies', label: 'Movies', icon: BiIcons.BiMovie, color: '#dc3545' },
  { value: 'Gaming', label: 'Gaming', icon: BiIcons.BiGame, color: '#28a745' },
  { value: 'Books', label: 'Books', icon: BiIcons.BiBook, color: '#007bff' },
  { value: 'Music', label: 'Music', icon: BiIcons.BiMusic, color: '#fd7e14' },
  { value: 'Art', label: 'Art', icon: BiIcons.BiPalette, color: '#6f42c1' },
  { value: 'Anime', label: 'Anime', icon: BiIcons.BiHappy, color: '#ff69b4' },

  // Personal Development
  { value: 'Personal Development', label: 'Personal Development', icon: BiIcons.BiCategory, color: '#6c757d' },
  { value: 'Productivity', label: 'Productivity', icon: BiIcons.BiTarget, color: '#28a745' },
  { value: 'Mindfulness', label: 'Mindfulness', icon: BiIcons.BiLeaf, color: '#20c997' },
  { value: 'Fitness', label: 'Fitness', icon: BiIcons.BiRun, color: '#dc3545' },
  { value: 'Career Growth', label: 'Career Growth', icon: BiIcons.BiBriefcase, color: '#007bff' },
  { value: 'Learning Languages', label: 'Learning Languages', icon: BiIcons.BiGlobe, color: '#17a2b8' },
  { value: 'Mental Health', label: 'Mental Health', icon: BiIcons.BiBrain, color: '#6f42c1' },
  { value: 'Public Speaking', label: 'Public Speaking', icon: BiIcons.BiMicrophone, color: '#ffc107' },
  { value: 'Journaling', label: 'Journaling', icon: BiIcons.BiPencil, color: '#fd7e14' },
  { value: 'Coding', label: 'Coding', icon: BiIcons.BiCodeAlt, color: '#007bff' },
  { value: 'Financial Literacy', label: 'Financial Literacy', icon: BiIcons.BiDollar, color: '#28a745' },

  // Entertainment & Pop Culture
  { value: 'Entertainment & Pop Culture', label: 'Entertainment & Pop Culture', icon: BiIcons.BiCategory, color: '#6c757d' },
  { value: 'Memes', label: 'Memes', icon: BiIcons.BiLaugh, color: '#ffc107' },
  { value: 'Celebrity News', label: 'Celebrity News', icon: BiIcons.BiStar, color: '#e83e8c' },
  { value: 'K-pop / J-pop', label: 'K-pop / J-pop', icon: BiIcons.BiMusic, color: '#ff69b4' },
  { value: 'Esports', label: 'Esports', icon: BiIcons.BiJoystick, color: '#6f42c1' },
  { value: 'Comics / Manga', label: 'Comics / Manga', icon: BiIcons.BiBookOpen, color: '#dc3545' },
  { value: 'TV Series', label: 'TV Series', icon: BiIcons.BiTv, color: '#007bff' },
  { value: 'Streaming', label: 'Streaming', icon: BiIcons.BiCameraMovie, color: '#17a2b8' },
  { value: 'Dance', label: 'Dance', icon: BiIcons.BiDancer, color: '#fd7e14' },
  { value: 'Creative Writing', label: 'Creative Writing', icon: BiIcons.BiPen, color: '#20c997' },

  // Tech & Digital
  { value: 'Tech & Digital', label: 'Tech & Digital', icon: BiIcons.BiCategory, color: '#6c757d' },
  { value: 'Web Development', label: 'Web Development', icon: BiIcons.BiCode, color: '#007bff' },
  { value: 'Mobile Apps', label: 'Mobile Apps', icon: BiIcons.BiMobile, color: '#fd7e14' },
  { value: 'AI & Machine Learning', label: 'AI & Machine Learning', icon: BiIcons.BiBrain, color: '#6f42c1' },
  { value: 'UI/UX Design', label: 'UI/UX Design', icon: BiIcons.BiPalette, color: '#ffc107' },
  { value: 'Cybersecurity', label: 'Cybersecurity', icon: BiIcons.BiLockAlt, color: '#343a40' },
  { value: 'Blockchain', label: 'Blockchain', icon: BiIcons.BiBlock, color: '#28a745' },
  { value: 'Startups', label: 'Startups', icon: BiIcons.BiRocket, color: '#e83e8c' },
  { value: 'Robotics', label: 'Robotics', icon: BiIcons.BiHardHat, color: '#dc3545' },
  { value: 'Open Source', label: 'Open Source', icon: BiIcons.BiGitBranch, color: '#20c997' },

  // Social & Lifestyle
  { value: 'Social & Lifestyle', label: 'Social & Lifestyle', icon: BiIcons.BiCategory, color: '#6c757d' },
  { value: 'Relationships', label: 'Relationships', icon: BiIcons.BiHeart, color: '#ff69b4' },
  { value: 'Online Communities', label: 'Online Communities', icon: BiIcons.BiGroup, color: '#007bff' },
  { value: 'Self-Care', label: 'Self-Care', icon: BiIcons.BiSpa, color: '#20c997' },
  { value: 'Fashion Trends', label: 'Fashion Trends', icon: BiIcons.BiMapAlt, color: '#e83e8c' },
  { value: 'Astrology', label: 'Astrology', icon: BiIcons.BiMeteor, color: '#6f42c1' },
  { value: 'Pets', label: 'Pets', icon: BiIcons.BiHappyHeartEyes, color: '#fd7e14' },
  { value: 'Minimalism', label: 'Minimalism', icon: BiIcons.BiCube, color: '#6c757d' },
  { value: 'DIY Crafts', label: 'DIY Crafts', icon: BiIcons.BiWrench, color: '#ffc107' },
];

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

export { BADGES, GENDER_OPTIONS, INTEREST_OPTIONS, getComputedPermissions };
