// Live news — admin-managed via Firestore (see js/store.js, admin panel "სიახლეები" tab).
import { state } from "./store.js";

export const NEWS_CATEGORIES = {
  registration: { label: "რეგისტრაცია", icon: "📝", color: "#6d5cf6" },
  event:        { label: "ღონისძიება",  icon: "🎉", color: "#22d3ee" },
  deadline:     { label: "ვადა",        icon: "⏰", color: "#ef4444" },
  scholarship:  { label: "გრანტი",      icon: "🏆", color: "#f59e0b" },
  announcement: { label: "განცხადება",  icon: "📢", color: "#10b981" },
};

export const newsItems = state.news;
