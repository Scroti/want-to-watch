-- ============================================
-- CORE TABLES
-- ============================================

-- User profiles table
CREATE TABLE IF NOT EXISTS profiles (
  user_id TEXT PRIMARY KEY, -- Clerk user ID
  username TEXT UNIQUE,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  favorite_genres TEXT[], -- Array of genre IDs
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Follows table (social graph)
CREATE TABLE IF NOT EXISTS follows (
  follower_id TEXT NOT NULL,
  following_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- Wishlist/Media items table (enhanced)
CREATE TABLE IF NOT EXISTS wishlist (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  overview TEXT,
  poster_path TEXT,
  release_date TEXT,
  first_air_date TEXT,
  media_type TEXT NOT NULL CHECK (media_type IN ('movie', 'tv')),
  tmdb_id INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'want_to_watch' CHECK (status IN ('want_to_watch', 'watched', 'currently_watching', 'dropped', 'completed')),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  watched_date DATE,
  tags TEXT[],
  priority TEXT CHECK (priority IN ('high', 'medium', 'low')),
  notes TEXT,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, tmdb_id, media_type)
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  media_id TEXT NOT NULL, -- References wishlist.id
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  content TEXT,
  contains_spoilers BOOLEAN DEFAULT FALSE,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (media_id) REFERENCES wishlist(id) ON DELETE CASCADE
);

-- Review likes table
CREATE TABLE IF NOT EXISTS review_likes (
  review_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (review_id, user_id),
  FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE
);

-- Comments table (for discussions on media items)
CREATE TABLE IF NOT EXISTS comments (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  media_id TEXT NOT NULL, -- References wishlist.id
  parent_id TEXT, -- For threaded replies
  content TEXT NOT NULL,
  contains_spoilers BOOLEAN DEFAULT FALSE,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (media_id) REFERENCES wishlist(id) ON DELETE CASCADE,
  FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE
);

-- Comment likes table
CREATE TABLE IF NOT EXISTS comment_likes (
  comment_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (comment_id, user_id),
  FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE
);

-- Custom lists table
CREATE TABLE IF NOT EXISTS custom_lists (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT TRUE,
  cover_image_url TEXT,
  items_count INTEGER DEFAULT 0,
  followers_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Custom list items table
CREATE TABLE IF NOT EXISTS custom_list_items (
  list_id TEXT NOT NULL,
  media_id TEXT NOT NULL, -- References wishlist.id
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (list_id, media_id),
  FOREIGN KEY (list_id) REFERENCES custom_lists(id) ON DELETE CASCADE,
  FOREIGN KEY (media_id) REFERENCES wishlist(id) ON DELETE CASCADE
);

-- List followers table
CREATE TABLE IF NOT EXISTS list_followers (
  list_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (list_id, user_id),
  FOREIGN KEY (list_id) REFERENCES custom_lists(id) ON DELETE CASCADE
);

-- Activity feed table
CREATE TABLE IF NOT EXISTS activities (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('added_item', 'watched_item', 'reviewed', 'followed_user', 'created_list', 'added_to_list')),
  target_id TEXT, -- ID of the item/user/list etc.
  target_type TEXT, -- 'media', 'user', 'list', etc.
  metadata JSONB, -- Flexible data storage
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  notification_type TEXT NOT NULL CHECK (notification_type IN ('follow', 'review', 'comment', 'like_review', 'like_comment', 'recommendation', 'activity')),
  from_user_id TEXT,
  target_id TEXT,
  target_type TEXT,
  title TEXT NOT NULL,
  message TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recommendations table (friend recommendations)
CREATE TABLE IF NOT EXISTS recommendations (
  id TEXT PRIMARY KEY,
  from_user_id TEXT NOT NULL,
  to_user_id TEXT NOT NULL,
  media_id TEXT NOT NULL, -- References wishlist.id
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (media_id) REFERENCES wishlist(id) ON DELETE CASCADE,
  CHECK (from_user_id != to_user_id)
);

-- User interactions (for taste matching)
CREATE TABLE IF NOT EXISTS user_interactions (
  user_id TEXT NOT NULL,
  media_id TEXT NOT NULL, -- References wishlist.id
  interaction_type TEXT CHECK (interaction_type IN ('added', 'watched', 'reviewed', 'rated')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (user_id, media_id, interaction_type),
  FOREIGN KEY (media_id) REFERENCES wishlist(id) ON DELETE CASCADE
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Profiles
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);

-- Follows
CREATE INDEX IF NOT EXISTS idx_follows_follower ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON follows(following_id);

-- Wishlist
CREATE INDEX IF NOT EXISTS idx_wishlist_user_id ON wishlist(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_user_status ON wishlist(user_id, status);
CREATE INDEX IF NOT EXISTS idx_wishlist_user_media ON wishlist(user_id, tmdb_id, media_type);
CREATE INDEX IF NOT EXISTS idx_wishlist_rating ON wishlist(rating);

-- Reviews
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_media_id ON reviews(media_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_created ON reviews(created_at DESC);

-- Comments
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_media_id ON comments(media_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent ON comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_comments_created ON comments(created_at DESC);

-- Custom lists
CREATE INDEX IF NOT EXISTS idx_custom_lists_user_id ON custom_lists(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_lists_public ON custom_lists(is_public);
CREATE INDEX IF NOT EXISTS idx_custom_lists_followers ON custom_lists(followers_count DESC);

-- Activities
CREATE INDEX IF NOT EXISTS idx_activities_user_id ON activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_created ON activities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activities_type ON activities(activity_type);

-- Notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);

-- Recommendations
CREATE INDEX IF NOT EXISTS idx_recommendations_to_user ON recommendations(to_user_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_from_user ON recommendations(from_user_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_media ON recommendations(media_id);

-- User interactions (for taste matching)
CREATE INDEX IF NOT EXISTS idx_interactions_user ON user_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_interactions_media ON user_interactions(media_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Profiles: Public read, own write
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (true);

-- Follows: Public read, own write
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Follows are viewable by everyone" ON follows FOR SELECT USING (true);
CREATE POLICY "Users can manage own follows" ON follows FOR ALL USING (true);

-- Wishlist: Public read, own write
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Wishlist is viewable by everyone" ON wishlist FOR SELECT USING (true);
CREATE POLICY "Users can manage own wishlist" ON wishlist FOR ALL USING (true);

-- Reviews: Public read, own write
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Reviews are viewable by everyone" ON reviews FOR SELECT USING (true);
CREATE POLICY "Users can manage own reviews" ON reviews FOR ALL USING (true);

-- Comments: Public read, own write
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Comments are viewable by everyone" ON comments FOR SELECT USING (true);
CREATE POLICY "Users can manage own comments" ON comments FOR ALL USING (true);

-- Custom lists: Public read if public, own write
ALTER TABLE custom_lists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public lists are viewable by everyone" ON custom_lists FOR SELECT USING (is_public = true OR user_id = current_setting('request.jwt.claims', true)::json->>'user_id');
CREATE POLICY "Users can manage own lists" ON custom_lists FOR ALL USING (true);

-- Activities: Viewable by followers
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Activities are viewable by everyone" ON activities FOR SELECT USING (true);

-- Notifications: Own only
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (true);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (true);

-- Recommendations: Own only
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own recommendations" ON recommendations FOR SELECT USING (to_user_id = current_setting('request.jwt.claims', true)::json->>'user_id' OR from_user_id = current_setting('request.jwt.claims', true)::json->>'user_id');
