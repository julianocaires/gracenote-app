const en = {
  common: { loading: 'Loading...', error: 'An error occurred', save: 'Save', cancel: 'Cancel', delete: 'Delete', edit: 'Edit', create: 'Create', confirm: 'Confirm', back: 'Back', search: 'Search', close: 'Close' },
  auth: { login: 'Sign In', signup: 'Create Account', logout: 'Sign Out', email: 'Email', password: 'Password', name: 'Name', forgotPassword: 'Forgot password?', noAccount: "Don't have an account?", hasAccount: 'Already have an account?' },
  tabs: { library: 'Library', search: 'Search', favorites: 'Favorites', profile: 'Profile' },
  sermons: { emptyState: 'No sermons yet', createButton: 'New sermon', title: 'Title', content: 'Content', selectCategory: 'Select category', selectTags: 'Select tags', limitReached: 'You have reached the 100-sermon limit on the free plan.', limitReachedAction: 'Subscribe to Premium for unlimited sermons or delete existing ones.', sermonCount: '{{count}} of 100', sermonCountPremium: '{{count}} sermons' },
  categories: { title: 'Categories', create: 'New category', edit: 'Edit category', delete: 'Delete category', name: 'Category name' },
  tags: { title: 'Tags', create: 'New tag', edit: 'Edit tag', delete: 'Delete tag', name: 'Tag name' },
  profile: { title: 'Profile', theme: 'Theme', light: 'Light', dark: 'Dark', system: 'System', language: 'Language' },
  premium: { title: 'GraceNote Premium', monthly: 'Monthly', yearly: 'Yearly', subscribe: 'Subscribe', restore: 'Restore purchases', lockedFeature: 'Available on Premium plan', upgrade: 'Upgrade to Premium', limitReached: 'Sermon limit reached', archived: 'Archived Sermon', archivedMessage: 'This sermon was archived after your Premium subscription ended.', reUpgrade: 'Subscribe again to access it', downgradeWarning: 'By cancelling your subscription, only your 100 most recent sermons will remain active.', upgradeToAccess: 'Subscribe to Premium to access' },
  covers: { title: 'Choose cover', gallery: 'App Gallery', camera: 'Camera', device: 'Device Gallery', premium: 'Premium' },
  editor: { bold: 'Bold', italic: 'Italic', underline: 'Underline', heading1: 'Heading 1', heading2: 'Heading 2', bulletList: 'Bullet list', orderedList: 'Numbered list', textColor: 'Text color', highlight: 'Highlight', font: 'Font', blockquote: 'Quote' },
}
export default en
export type Translations = typeof en
