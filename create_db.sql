-- TABLES
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'user',
    status TEXT NOT NULL DEFAULT 'active',
    view_history TEXT,
    profile_pic TEXT,
    theme TEXT NOT NULL DEFAULT '{"theme":"light","color":"blue"}',
    created_on TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_on TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    title TEXT,
    steps TEXT,
    thumbnail TEXT,
    is_published BOOLEAN NOT NULL DEFAULT false,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    user_id INT NOT NULL,
    vehicle_id INT NOT NULL,
    created_on TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_on TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE vehicles (
    id SERIAL PRIMARY KEY,
    year INT NOT NULL,
    make TEXT NOT NULL,
    model TEXT NOT NULL,
    engine TEXT NOT NULL,
    is_verified BOOLEAN NOT NULL DEFAULT false,
    UNIQUE (year, make, model, engine)
);

CREATE TABLE posts_tags (
    post_id INT NOT NULL,
    tag_id INT NOT NULL
);

CREATE TABLE tags (
    id SERIAL PRIMARY KEY,
    tag TEXT NOT NULL UNIQUE
);

-- FUNCTION for TIMESTAMP
CREATE FUNCTION set_updated_on() RETURNS TRIGGER
    LANGUAGE plpgsql
    AS $$
    BEGIN
        NEW.updated_on = CURRENT_TIMESTAMP;
        RETURN NEW;
    END;
$$;

-- TRIGGERS for TIMESTAMP
CREATE TRIGGER update_timestamp BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION set_updated_on();
CREATE TRIGGER update_timestamp BEFORE UPDATE ON posts FOR EACH ROW EXECUTE FUNCTION set_updated_on();

-- FORGEIN KEY CONSTRAINTS
ALTER TABLE ONLY posts ADD CONSTRAINT fk_posts_users FOREIGN KEY (user_id) REFERENCES users(id);
ALTER TABLE ONLY posts ADD CONSTRAINT fk_posts_vehicles FOREIGN KEY (vehicle_id) REFERENCES vehicles(id);
ALTER TABLE ONLY posts_tags ADD CONSTRAINT fk_posts_tags_posts FOREIGN KEY (post_id) REFERENCES posts(id);
ALTER TABLE ONLY posts_tags ADD CONSTRAINT fk_posts_tags_tags FOREIGN KEY (tag_id) REFERENCES tags(id);

-- UNIQUE rows for posts_tags
ALTER TABLE posts_tags ADD CONSTRAINT unique_rows_posts_tags UNIQUE (post_id, tag_id);