/**
 * SQLite schema initialiser
 * Creates all tables on first run (CREATE TABLE IF NOT EXISTS).
 * Call once at server startup before accepting requests.
 */
const { getDb } = require('./db')

function initDb() {
  const db = getDb()

  db.exec(`
    -- ─── Users ───────────────────────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS users (
      id            TEXT     PRIMARY KEY,
      email         TEXT     UNIQUE NOT NULL,
      password_hash TEXT,
      name          TEXT     NOT NULL,
      avatar_url    TEXT,
      google_id     TEXT     UNIQUE,
      role          TEXT     DEFAULT 'user' CHECK(role IN ('user','admin')),
      is_verified   INTEGER  DEFAULT 0,
      verify_token  TEXT,
      reset_token   TEXT,
      reset_expires TEXT,
      last_login    TEXT,
      created_at    TEXT     DEFAULT (datetime('now')),
      updated_at    TEXT     DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_users_email  ON users(email);
    CREATE INDEX IF NOT EXISTS idx_users_google ON users(google_id);

    -- ─── Refresh Tokens ──────────────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS refresh_tokens (
      id         TEXT PRIMARY KEY,
      user_id    TEXT NOT NULL,
      token      TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_rt_token   ON refresh_tokens(token);
    CREATE INDEX IF NOT EXISTS idx_rt_user_id ON refresh_tokens(user_id);

    -- ─── Health Profiles ─────────────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS health_profiles (
      id             TEXT  PRIMARY KEY,
      user_id        TEXT  UNIQUE NOT NULL,
      age            INTEGER NOT NULL,
      gender         TEXT  NOT NULL CHECK(gender IN ('male','female','other')),
      weight_kg      REAL  NOT NULL,
      height_cm      REAL  NOT NULL,
      bmi            REAL  GENERATED ALWAYS AS (weight_kg / ((height_cm/100.0) * (height_cm/100.0))) STORED,
      bmr            REAL,
      tdee           REAL,
      activity_level TEXT  DEFAULT 'moderate'
                          CHECK(activity_level IN ('sedentary','light','moderate','active','very_active')),
      diet_type      TEXT  DEFAULT 'vegetarian'
                          CHECK(diet_type IN ('vegetarian','vegan','non_vegetarian','eggetarian','jain')),
      region         TEXT,
      language       TEXT  DEFAULT 'en' CHECK(language IN ('en','ta','hi','te','kn','ml')),
      conditions     TEXT  DEFAULT '[]',
      allergies      TEXT  DEFAULT '[]',
      health_goal    TEXT  DEFAULT 'general_wellness'
                          CHECK(health_goal IN ('weight_loss','muscle_gain','maintenance','therapeutic','general_wellness')),
      created_at     TEXT  DEFAULT (datetime('now')),
      updated_at     TEXT  DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- ─── Recipes ─────────────────────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS recipes (
      id              TEXT    PRIMARY KEY,
      external_id     TEXT,
      source          TEXT    DEFAULT 'manual'
                             CHECK(source IN ('user','mealdb','usda','manual','food_item')),
      name            TEXT    NOT NULL,
      name_regional   TEXT,
      description     TEXT,
      image_url       TEXT,
      food_emoji      TEXT,
      meal_type       TEXT    DEFAULT '[]',
      diet_type       TEXT    CHECK(diet_type IN ('vegetarian','vegan','non_vegetarian','eggetarian','jain')),
      cuisine         TEXT,
      region          TEXT,
      category        TEXT,
      season          TEXT    DEFAULT '[]',
      festivals       TEXT    DEFAULT '[]',
      ayurvedic_dosha TEXT,
      prep_time_min   INTEGER,
      cook_time_min   INTEGER,
      difficulty      TEXT    DEFAULT 'easy' CHECK(difficulty IN ('easy','medium','hard')),
      servings        INTEGER DEFAULT 2,
      calories        REAL,
      protein_g       REAL,
      carbs_g         REAL,
      fat_g           REAL,
      fiber_g         REAL,
      sugar_g         REAL,
      sodium_mg       REAL,
      potassium_mg    REAL,
      calcium_mg      REAL,
      iron_mg         REAL,
      zinc_mg         REAL,
      magnesium_mg    REAL,
      phosphorus_mg   REAL,
      vitamin_a_mcg   REAL,
      vitamin_c_mg    REAL,
      vitamin_d_mcg   REAL,
      vitamin_b12_mcg REAL,
      folate_mcg      REAL,
      omega3_g        REAL,
      omega6_g        REAL,
      saturated_fat_g REAL,
      cholesterol_mg  REAL,
      glycemic_index  INTEGER,
      health_score    INTEGER,
      health_tags     TEXT    DEFAULT '[]',
      ingredients     TEXT    DEFAULT '[]',
      steps           TEXT    DEFAULT '[]',
      is_published    INTEGER DEFAULT 1,
      created_by      TEXT,
      rating_avg      REAL    DEFAULT 0,
      rating_count    INTEGER DEFAULT 0,
      view_count      INTEGER DEFAULT 0,
      created_at      TEXT    DEFAULT (datetime('now')),
      updated_at      TEXT    DEFAULT (datetime('now')),
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
    );
    CREATE INDEX IF NOT EXISTS idx_recipes_diet_type   ON recipes(diet_type);
    CREATE INDEX IF NOT EXISTS idx_recipes_region      ON recipes(region);
    CREATE INDEX IF NOT EXISTS idx_recipes_health_score ON recipes(health_score);
    CREATE INDEX IF NOT EXISTS idx_recipes_source      ON recipes(source);
    CREATE INDEX IF NOT EXISTS idx_recipes_external_id ON recipes(external_id);

    -- ─── Ingredients Master ──────────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS ingredients (
      id            TEXT PRIMARY KEY,
      name          TEXT UNIQUE NOT NULL,
      name_regional TEXT,
      category      TEXT,
      unit_default  TEXT DEFAULT 'g',
      nutrition_per_100g TEXT,
      created_at    TEXT DEFAULT (datetime('now'))
    );

    -- ─── Saved Recipes ───────────────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS saved_recipes (
      id         TEXT PRIMARY KEY,
      user_id    TEXT NOT NULL,
      recipe_id  TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      UNIQUE(user_id, recipe_id),
      FOREIGN KEY (user_id)   REFERENCES users(id)   ON DELETE CASCADE,
      FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
    );

    -- ─── Recipe Ratings ──────────────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS recipe_ratings (
      id         TEXT    PRIMARY KEY,
      user_id    TEXT    NOT NULL,
      recipe_id  TEXT    NOT NULL,
      rating     INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
      review     TEXT,
      created_at TEXT    DEFAULT (datetime('now')),
      UNIQUE(user_id, recipe_id),
      FOREIGN KEY (user_id)   REFERENCES users(id)   ON DELETE CASCADE,
      FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
    );

    -- ─── Meal Plans ──────────────────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS meal_plans (
      id          TEXT    PRIMARY KEY,
      user_id     TEXT    NOT NULL,
      week_start  TEXT    NOT NULL,
      plan_data   TEXT    NOT NULL,
      is_active   INTEGER DEFAULT 1,
      created_at  TEXT    DEFAULT (datetime('now')),
      updated_at  TEXT    DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_meal_plans_user_week ON meal_plans(user_id, week_start);

    -- ─── Daily Nutrition Logs ────────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS nutrition_logs (
      id           TEXT    PRIMARY KEY,
      user_id      TEXT    NOT NULL,
      log_date     TEXT    NOT NULL,
      meal_slot    TEXT    NOT NULL CHECK(meal_slot IN ('breakfast','lunch','snack','dinner')),
      recipe_id    TEXT,
      custom_name  TEXT,
      portion_g    REAL    NOT NULL,
      calories     REAL,
      protein_g    REAL,
      carbs_g      REAL,
      fat_g        REAL,
      fiber_g      REAL,
      iron_mg      REAL,
      calcium_mg   REAL,
      vitamin_c_mg REAL,
      created_at   TEXT    DEFAULT (datetime('now')),
      FOREIGN KEY (user_id)   REFERENCES users(id)   ON DELETE CASCADE,
      FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE SET NULL
    );
    CREATE INDEX IF NOT EXISTS idx_nutrition_logs_user_date ON nutrition_logs(user_id, log_date);

    -- ─── Water Logs ──────────────────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS water_logs (
      id         TEXT    PRIMARY KEY,
      user_id    TEXT    NOT NULL,
      log_date   TEXT    NOT NULL,
      amount_ml  INTEGER NOT NULL DEFAULT 250,
      logged_at  TEXT    DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_water_logs_user_date ON water_logs(user_id, log_date);

    -- ─── Chat Sessions ────────────────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS chat_sessions (
      id         TEXT PRIMARY KEY,
      user_id    TEXT NOT NULL,
      title      TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_chat_sessions_user ON chat_sessions(user_id);

    CREATE TABLE IF NOT EXISTS chat_messages (
      id          TEXT    PRIMARY KEY,
      session_id  TEXT    NOT NULL,
      role        TEXT    NOT NULL CHECK(role IN ('user','assistant','system')),
      content     TEXT    NOT NULL,
      tokens_used INTEGER,
      created_at  TEXT    DEFAULT (datetime('now')),
      FOREIGN KEY (session_id) REFERENCES chat_sessions(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON chat_messages(session_id);

    -- ─── Recommendations ─────────────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS recommendations (
      id         TEXT    PRIMARY KEY,
      user_id    TEXT    NOT NULL,
      recipe_id  TEXT    NOT NULL,
      score      REAL    NOT NULL,
      reason     TEXT,
      algorithm  TEXT,
      served_at  TEXT    DEFAULT (datetime('now')),
      clicked    INTEGER DEFAULT 0,
      FOREIGN KEY (user_id)   REFERENCES users(id)   ON DELETE CASCADE,
      FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_recommendations_user ON recommendations(user_id, score);

    -- ─── User Interactions ───────────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS user_interactions (
      id         TEXT PRIMARY KEY,
      user_id    TEXT NOT NULL,
      recipe_id  TEXT NOT NULL,
      action     TEXT NOT NULL CHECK(action IN ('view','save','cook','rate','share')),
      value      REAL,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id)   REFERENCES users(id)   ON DELETE CASCADE,
      FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_interactions_user_recipe ON user_interactions(user_id, recipe_id);
    CREATE INDEX IF NOT EXISTS idx_interactions_user_action ON user_interactions(user_id, action);

    -- ─── Sync Logs ────────────────────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS sync_logs (
      id              TEXT    PRIMARY KEY,
      source          TEXT    NOT NULL,
      status          TEXT    NOT NULL CHECK(status IN ('started','success','failed','partial')),
      records_added   INTEGER DEFAULT 0,
      records_updated INTEGER DEFAULT 0,
      error_message   TEXT,
      started_at      TEXT    DEFAULT (datetime('now')),
      completed_at    TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_sync_logs_source ON sync_logs(source, status);

    -- ─── Supplement Logs ─────────────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS supplement_logs (
      id            TEXT    PRIMARY KEY,
      user_id       TEXT    NOT NULL,
      supplement_id TEXT    NOT NULL,
      name          TEXT    NOT NULL,
      brand         TEXT,
      dose_g        REAL,
      log_date      TEXT    NOT NULL,
      taken_at      TEXT,
      notes         TEXT,
      created_at    TEXT    DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_supplement_logs_user ON supplement_logs(user_id, log_date);

    -- ─── Notifications ───────────────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS notifications (
      id         TEXT    PRIMARY KEY,
      user_id    TEXT    NOT NULL,
      type       TEXT    NOT NULL,
      title      TEXT    NOT NULL,
      body       TEXT,
      is_read    INTEGER DEFAULT 0,
      created_at TEXT    DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);

    -- ─── System Config ────────────────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS system_config (
      key_name   TEXT PRIMARY KEY,
      value      TEXT NOT NULL,
      updated_at TEXT DEFAULT (datetime('now'))
    );
  `)

  // Seed default config (no-op if already present)
  const seedConfig = db.prepare(
    `INSERT OR IGNORE INTO system_config (key_name, value) VALUES (?, ?)`
  )
  const seedMany = db.transaction((rows) => {
    for (const [k, v] of rows) seedConfig.run(k, v)
  })
  seedMany([
    ['last_mealdb_sync', '2000-01-01 00:00:00'],
    ['last_usda_sync',   '2000-01-01 00:00:00'],
    ['maintenance_mode', 'false'],
    ['app_version',      '1.0.0'],
  ])

  console.log('✅ SQLite schema ready')
}

module.exports = { initDb }
