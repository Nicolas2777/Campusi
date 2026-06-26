// Push notifications are disabled per product decision.
// All exports remain as no-op stubs so existing imports keep working.

export const getSubs = () => [];
export const getUnread = () => ({});
export const totalUnread = () => 0;
export const clearUnread = () => {};
export const onUnreadChange = (cb) => { try { cb(0); } catch {} };
export const notifyPermissionState = () => "denied";
export const requestNotifyPermission = async () => "denied";
export const ensureForumSub = () => {};
export const removeForumSub = () => {};
export const detachAllSubs = () => {};
export const startNotifications = () => {};
