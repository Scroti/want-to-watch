// ============================================
// MEDIA TYPES
// ============================================

export type MediaType = 'movie' | 'tv';
export type WatchlistStatus = 'want_to_watch' | 'watched' | 'currently_watching' | 'dropped' | 'completed';
export type Priority = 'high' | 'medium' | 'low';

export interface MediaItem {
  id: string;
  userId: string;
  title: string;
  overview?: string;
  poster_path?: string;
  release_date?: string;
  first_air_date?: string;
  media_type: MediaType;
  tmdb_id: number;
  status: WatchlistStatus;
  rating?: number;
  watched_date?: string;
  tags?: string[];
  priority?: Priority;
  notes?: string;
  addedAt: Date;
  updatedAt: Date;
}

export interface TMDBMovie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  release_date: string;
  media_type?: 'movie';
}

export interface TMDBTV {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  first_air_date: string;
  media_type?: 'tv';
}

export type TMDBSearchResult = TMDBMovie | TMDBTV;

// ============================================
// USER PROFILE TYPES
// ============================================

export interface UserProfile {
  user_id: string;
  username?: string;
  display_name?: string;
  bio?: string;
  avatar_url?: string;
  favorite_genres?: number[];
  created_at: Date;
  updated_at: Date;
}

export interface UserStats {
  total_items: number;
  watched_count: number;
  want_to_watch_count: number;
  currently_watching_count: number;
  dropped_count: number;
  reviews_count: number;
  followers_count: number;
  following_count: number;
  lists_count: number;
  average_rating?: number;
}

// ============================================
// SOCIAL TYPES
// ============================================

export interface Follow {
  follower_id: string;
  following_id: string;
  created_at: Date;
}

export interface UserWithStats extends UserProfile {
  stats?: UserStats;
  isFollowing?: boolean;
  isFollowedBy?: boolean;
}

// ============================================
// REVIEW TYPES
// ============================================

export interface Review {
  id: string;
  user_id: string;
  media_id: string;
  rating: number;
  title?: string;
  content?: string;
  contains_spoilers: boolean;
  likes_count: number;
  created_at: Date;
  updated_at: Date;
  user?: UserProfile;
  liked?: boolean;
}

// ============================================
// COMMENT TYPES
// ============================================

export interface Comment {
  id: string;
  user_id: string;
  media_id: string;
  parent_id?: string;
  content: string;
  contains_spoilers: boolean;
  likes_count: number;
  created_at: Date;
  updated_at: Date;
  user?: UserProfile;
  replies?: Comment[];
  liked?: boolean;
  reply_count?: number;
}

// ============================================
// LIST TYPES
// ============================================

export interface CustomList {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  is_public: boolean;
  cover_image_url?: string;
  items_count: number;
  followers_count: number;
  created_at: Date;
  updated_at: Date;
  user?: UserProfile;
  isFollowing?: boolean;
}

export interface CustomListItem {
  list_id: string;
  media_id: string;
  added_at: Date;
  media?: MediaItem;
}

// ============================================
// ACTIVITY TYPES
// ============================================

export type ActivityType = 'added_item' | 'watched_item' | 'reviewed' | 'followed_user' | 'created_list' | 'added_to_list';

export interface Activity {
  id: string;
  user_id: string;
  activity_type: ActivityType;
  target_id?: string;
  target_type?: string;
  metadata?: Record<string, any>;
  created_at: Date;
  user?: UserProfile;
}

// ============================================
// NOTIFICATION TYPES
// ============================================

export type NotificationType = 'follow' | 'review' | 'comment' | 'like_review' | 'like_comment' | 'recommendation' | 'activity';

export interface Notification {
  id: string;
  user_id: string;
  notification_type: NotificationType;
  from_user_id?: string;
  target_id?: string;
  target_type?: string;
  title: string;
  message?: string;
  read: boolean;
  created_at: Date;
  from_user?: UserProfile;
}

// ============================================
// RECOMMENDATION TYPES
// ============================================

export interface Recommendation {
  id: string;
  from_user_id: string;
  to_user_id: string;
  media_id: string;
  message?: string;
  created_at: Date;
  from_user?: UserProfile;
  media?: MediaItem;
}

// ============================================
// TASTE MATCHING TYPES
// ============================================

export interface TasteMatch {
  user: UserProfile;
  compatibility_score: number;
  common_items: number;
  similar_genres: string[];
}
