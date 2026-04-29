-- ============================================================
-- AarogyaAnna Database Schema
-- MySQL 8.0+ | ICMR-NIN 2020 aligned
-- ============================================================

CREATE DATABASE IF NOT EXISTS aarogya_anna CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE aarogya_anna;

-- ─── Users ───────────────────────────────────────────────────────────────────
CREATE TABLE users (
  id            VARCHAR(36)   PRIMARY KEY DEFAULT (UUID()),
  email         VARCHAR(255)  UNIQUE NOT NULL,
  password_hash VARCHAR(255)  NULL,                   -- NULL for OAuth users
  name          VARCHAR(100)  NOT NULL,
  avatar_url    VARCHAR(500)  NULL,
  google_id     VARCHAR(100)  UNIQUE NULL,
  role          ENUM('user','admin') DEFAULT 'user',
  is_verified   BOOLEAN       DEFAULT FALSE,
  verify_token  VARCHAR(100)  NULL,
  reset_token   VARCHAR(100)  NULL,
  reset_expires DATETIME      NULL,
  last_login    DATETIME      NULL,
  created_at    DATETIME      DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_google_id (google_id)
);

-- ─── Refresh Tokens ──────────────────────────────────────────────────────────
CREATE TABLE refresh_tokens (
  id         VARCHAR(36)  PRIMARY KEY DEFAULT (UUID()),
  user_id    VARCHAR(36)  NOT NULL,
  token      VARCHAR(500) NOT NULL,
  expires_at DATETIME     NOT NULL,
  created_at DATETIME     DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_token (token(100)),
  INDEX idx_user_id (user_id)
);

-- ─── Health Profiles ─────────────────────────────────────────────────────────
CREATE TABLE health_profiles (
  id              VARCHAR(36)   PRIMARY KEY DEFAULT (UUID()),
  user_id         VARCHAR(36)   UNIQUE NOT NULL,
  age             TINYINT       NOT NULL,
  gender          ENUM('male','female','other') NOT NULL,
  weight_kg       DECIMAL(5,2)  NOT NULL,
  height_cm       DECIMAL(5,2)  NOT NULL,
  bmi             DECIMAL(4,2)  GENERATED ALWAYS AS (weight_kg / ((height_cm/100) * (height_cm/100))) STORED,
  bmr             DECIMAL(7,2)  NULL,               -- Mifflin-St Jeor, stored after calc
  tdee            DECIMAL(7,2)  NULL,
  activity_level  ENUM('sedentary','light','moderate','active','very_active') DEFAULT 'moderate',
  diet_type       ENUM('vegetarian','vegan','non_vegetarian','eggetarian','jain') DEFAULT 'vegetarian',
  region          VARCHAR(50)   NULL,               -- South Indian, North Indian, etc.
  language        ENUM('en','ta','hi','te','kn','ml') DEFAULT 'en',
  -- Health conditions (bit flags stored as JSON for flexibility)
  conditions      JSON          NULL,               -- ["diabetes","pcod","hypertension"]
  allergies       JSON          NULL,               -- ["nuts","gluten","dairy"]
  health_goal     ENUM('weight_loss','muscle_gain','maintenance','therapeutic','general_wellness') DEFAULT 'general_wellness',
  created_at      DATETIME      DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ─── Recipes ─────────────────────────────────────────────────────────────────
CREATE TABLE recipes (
  id              VARCHAR(36)    PRIMARY KEY DEFAULT (UUID()),
  external_id     VARCHAR(100)   NULL,              -- TheMealDB / USDA source ID
  source          ENUM('user','mealdb','usda','manual','food_item') DEFAULT 'manual',
  name            VARCHAR(255)   NOT NULL,
  name_regional   VARCHAR(255)   NULL,              -- e.g. "சாம்பார்"
  description     TEXT           NULL,
  image_url       VARCHAR(500)   NULL,
  food_emoji      VARCHAR(10)    NULL,
  -- Classification
  meal_type       JSON           NULL,              -- ["breakfast","lunch"]
  diet_type       ENUM('vegetarian','vegan','non_vegetarian','eggetarian','jain') NULL,
  cuisine         VARCHAR(100)   NULL,
  region          VARCHAR(100)   NULL,
  category        VARCHAR(100)   NULL,              -- fruit, vegetable, legume, grain, etc.
  -- Ayurvedic / seasonal
  season          JSON           NULL,              -- ["summer","monsoon"]
  festivals       JSON           NULL,              -- ["diwali","pongal"]
  ayurvedic_dosha VARCHAR(50)    NULL,
  -- Time & difficulty
  prep_time_min   SMALLINT       NULL,
  cook_time_min   SMALLINT       NULL,
  difficulty      ENUM('easy','medium','hard') DEFAULT 'easy',
  servings        TINYINT        DEFAULT 2,
  -- Nutrition per 100g (ICMR-NIN 2020 aligned)
  calories        DECIMAL(7,2)   NULL,
  protein_g       DECIMAL(6,2)   NULL,
  carbs_g         DECIMAL(6,2)   NULL,
  fat_g           DECIMAL(6,2)   NULL,
  fiber_g         DECIMAL(6,2)   NULL,
  sugar_g         DECIMAL(6,2)   NULL,
  sodium_mg       DECIMAL(8,2)   NULL,
  potassium_mg    DECIMAL(8,2)   NULL,
  calcium_mg      DECIMAL(8,2)   NULL,
  iron_mg         DECIMAL(7,2)   NULL,
  zinc_mg         DECIMAL(7,2)   NULL,
  magnesium_mg    DECIMAL(8,2)   NULL,
  phosphorus_mg   DECIMAL(8,2)   NULL,
  vitamin_a_mcg   DECIMAL(8,2)   NULL,
  vitamin_c_mg    DECIMAL(8,2)   NULL,
  vitamin_d_mcg   DECIMAL(7,2)   NULL,
  vitamin_b12_mcg DECIMAL(7,3)   NULL,
  folate_mcg      DECIMAL(8,2)   NULL,
  omega3_g        DECIMAL(7,3)   NULL,
  omega6_g        DECIMAL(7,3)   NULL,
  saturated_fat_g DECIMAL(6,2)   NULL,
  cholesterol_mg  DECIMAL(7,2)   NULL,
  glycemic_index  TINYINT        NULL,
  health_score    TINYINT        NULL,              -- 0–100, computed
  health_tags     JSON           NULL,              -- ["Iron-Rich","Diabetic-Friendly"]
  -- Ingredients & steps (JSON for flexibility)
  ingredients     JSON           NULL,
  steps           JSON           NULL,
  -- Meta
  is_published    BOOLEAN        DEFAULT TRUE,
  created_by      VARCHAR(36)    NULL,
  rating_avg      DECIMAL(3,2)   DEFAULT 0.00,
  rating_count    INT            DEFAULT 0,
  view_count      INT            DEFAULT 0,
  created_at      DATETIME       DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME       DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  FULLTEXT INDEX ft_name (name, name_regional, description),
  INDEX idx_meal_type ((CAST(meal_type AS CHAR(200)))),
  INDEX idx_diet_type (diet_type),
  INDEX idx_region (region),
  INDEX idx_health_score (health_score),
  INDEX idx_source (source),
  INDEX idx_external_id (external_id)
);

-- ─── Ingredients Master ──────────────────────────────────────────────────────
CREATE TABLE ingredients (
  id            VARCHAR(36)  PRIMARY KEY DEFAULT (UUID()),
  name          VARCHAR(255) UNIQUE NOT NULL,
  name_regional VARCHAR(255) NULL,
  category      VARCHAR(100) NULL,
  unit_default  VARCHAR(20)  DEFAULT 'g',
  nutrition_per_100g JSON    NULL,
  created_at    DATETIME     DEFAULT CURRENT_TIMESTAMP
);

-- ─── Saved Recipes ───────────────────────────────────────────────────────────
CREATE TABLE saved_recipes (
  id         VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id    VARCHAR(36) NOT NULL,
  recipe_id  VARCHAR(36) NOT NULL,
  created_at DATETIME    DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_user_recipe (user_id, recipe_id),
  FOREIGN KEY (user_id)   REFERENCES users(id)   ON DELETE CASCADE,
  FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
);

-- ─── Recipe Ratings ──────────────────────────────────────────────────────────
CREATE TABLE recipe_ratings (
  id         VARCHAR(36)  PRIMARY KEY DEFAULT (UUID()),
  user_id    VARCHAR(36)  NOT NULL,
  recipe_id  VARCHAR(36)  NOT NULL,
  rating     TINYINT      NOT NULL CHECK (rating BETWEEN 1 AND 5),
  review     TEXT         NULL,
  created_at DATETIME     DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_user_recipe_rating (user_id, recipe_id),
  FOREIGN KEY (user_id)   REFERENCES users(id)   ON DELETE CASCADE,
  FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
);

-- ─── Meal Plans ──────────────────────────────────────────────────────────────
CREATE TABLE meal_plans (
  id          VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id     VARCHAR(36) NOT NULL,
  week_start  DATE        NOT NULL,               -- Monday of the week
  plan_data   JSON        NOT NULL,               -- Full week plan JSON
  is_active   BOOLEAN     DEFAULT TRUE,
  created_at  DATETIME    DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_week (user_id, week_start)
);

-- ─── Daily Nutrition Logs ────────────────────────────────────────────────────
CREATE TABLE nutrition_logs (
  id            VARCHAR(36)  PRIMARY KEY DEFAULT (UUID()),
  user_id       VARCHAR(36)  NOT NULL,
  log_date      DATE         NOT NULL,
  meal_slot     ENUM('breakfast','lunch','snack','dinner') NOT NULL,
  recipe_id     VARCHAR(36)  NULL,
  custom_name   VARCHAR(255) NULL,
  portion_g     DECIMAL(7,2) NOT NULL,
  -- Computed totals at log time
  calories      DECIMAL(7,2) NULL,
  protein_g     DECIMAL(6,2) NULL,
  carbs_g       DECIMAL(6,2) NULL,
  fat_g         DECIMAL(6,2) NULL,
  fiber_g       DECIMAL(6,2) NULL,
  iron_mg       DECIMAL(7,2) NULL,
  calcium_mg    DECIMAL(8,2) NULL,
  vitamin_c_mg  DECIMAL(8,2) NULL,
  created_at    DATETIME     DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id)   REFERENCES users(id)   ON DELETE CASCADE,
  FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE SET NULL,
  INDEX idx_user_date (user_id, log_date)
);

-- ─── Water Logs ──────────────────────────────────────────────────────────────
CREATE TABLE water_logs (
  id          VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id     VARCHAR(36) NOT NULL,
  log_date    DATE        NOT NULL,
  amount_ml   INT         NOT NULL DEFAULT 250,
  logged_at   DATETIME    DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_date (user_id, log_date)
);

-- ─── Chat Sessions ────────────────────────────────────────────────────────────
CREATE TABLE chat_sessions (
  id         VARCHAR(36)  PRIMARY KEY DEFAULT (UUID()),
  user_id    VARCHAR(36)  NOT NULL,
  title      VARCHAR(200) NULL,
  created_at DATETIME     DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id)
);

CREATE TABLE chat_messages (
  id          VARCHAR(36)  PRIMARY KEY DEFAULT (UUID()),
  session_id  VARCHAR(36)  NOT NULL,
  role        ENUM('user','assistant','system') NOT NULL,
  content     TEXT         NOT NULL,
  tokens_used INT          NULL,
  created_at  DATETIME     DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES chat_sessions(id) ON DELETE CASCADE,
  INDEX idx_session_id (session_id)
);

-- ─── User Recommendations ─────────────────────────────────────────────────────
CREATE TABLE recommendations (
  id           VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id      VARCHAR(36) NOT NULL,
  recipe_id    VARCHAR(36) NOT NULL,
  score        DECIMAL(5,4) NOT NULL,
  reason       VARCHAR(500) NULL,
  algorithm    VARCHAR(50)  NULL,                  -- 'collab_filter','content_based','hybrid'
  served_at    DATETIME     DEFAULT CURRENT_TIMESTAMP,
  clicked      BOOLEAN      DEFAULT FALSE,
  FOREIGN KEY (user_id)   REFERENCES users(id)   ON DELETE CASCADE,
  FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
  INDEX idx_user_score (user_id, score)
);

-- ─── User Recipe Interactions ────────────────────────────────────────────────
CREATE TABLE user_interactions (
  id          VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id     VARCHAR(36) NOT NULL,
  recipe_id   VARCHAR(36) NOT NULL,
  action      ENUM('view','save','cook','rate','share') NOT NULL,
  value       DECIMAL(3,2) NULL,                   -- for 'rate': 1-5
  created_at  DATETIME     DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id)   REFERENCES users(id)   ON DELETE CASCADE,
  FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
  INDEX idx_user_recipe (user_id, recipe_id),
  INDEX idx_user_action (user_id, action)
);

-- ─── Sync Logs (Admin) ───────────────────────────────────────────────────────
CREATE TABLE sync_logs (
  id            VARCHAR(36)   PRIMARY KEY DEFAULT (UUID()),
  source        VARCHAR(50)   NOT NULL,             -- 'mealdb','usda','manual'
  status        ENUM('started','success','failed','partial') NOT NULL,
  records_added INT           DEFAULT 0,
  records_updated INT         DEFAULT 0,
  error_message TEXT          NULL,
  started_at    DATETIME      DEFAULT CURRENT_TIMESTAMP,
  completed_at  DATETIME      NULL,
  INDEX idx_source_status (source, status)
);

-- ─── Supplement Tracker ──────────────────────────────────────────────────────
CREATE TABLE supplement_logs (
  id            VARCHAR(36)  PRIMARY KEY DEFAULT (UUID()),
  user_id       VARCHAR(36)  NOT NULL,
  supplement_id VARCHAR(100) NOT NULL,             -- from frontend constants
  name          VARCHAR(255) NOT NULL,
  brand         VARCHAR(100) NULL,
  dose_g        DECIMAL(6,2) NULL,
  log_date      DATE         NOT NULL,
  taken_at      DATETIME     NULL,
  notes         VARCHAR(500) NULL,
  created_at    DATETIME     DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_date (user_id, log_date)
);

-- ─── Notifications ───────────────────────────────────────────────────────────
CREATE TABLE notifications (
  id         VARCHAR(36)  PRIMARY KEY DEFAULT (UUID()),
  user_id    VARCHAR(36)  NOT NULL,
  type       VARCHAR(50)  NOT NULL,                -- 'meal_reminder','water_alert','nutrient_tip'
  title      VARCHAR(200) NOT NULL,
  body       TEXT         NULL,
  is_read    BOOLEAN      DEFAULT FALSE,
  created_at DATETIME     DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_unread (user_id, is_read)
);

-- ─── Admin: System Config ────────────────────────────────────────────────────
CREATE TABLE system_config (
  key_name   VARCHAR(100) PRIMARY KEY,
  value      TEXT         NOT NULL,
  updated_at DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO system_config (key_name, value) VALUES
  ('last_mealdb_sync', '2000-01-01 00:00:00'),
  ('last_usda_sync',   '2000-01-01 00:00:00'),
  ('maintenance_mode', 'false'),
  ('app_version',      '1.0.0');
