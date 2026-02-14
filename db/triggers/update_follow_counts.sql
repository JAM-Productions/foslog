-- Function to update followers/following count
CREATE OR REPLACE FUNCTION update_follow_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN

        -- Increment following count of follower
        UPDATE users
        SET "totalFollowing" = COALESCE("totalFollowing", 0) + 1
        WHERE id = NEW."followerId";

        -- Increment followers count of followed user
        UPDATE users
        SET "totalFollowers" = COALESCE("totalFollowers", 0) + 1
        WHERE id = NEW."followingId";

        RETURN NEW;

    ELSIF (TG_OP = 'DELETE') THEN

        -- Decrement following count of follower
        UPDATE users
        SET "totalFollowing" = GREATEST(COALESCE("totalFollowing", 0) - 1, 0)
        WHERE id = OLD."followerId";

        -- Decrement followers count of followed user
        UPDATE users
        SET "totalFollowers" = GREATEST(COALESCE("totalFollowers", 0) - 1, 0)
        WHERE id = OLD."followingId";

        RETURN OLD;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_follow_counts_trigger ON follows;

CREATE TRIGGER update_follow_counts_trigger
AFTER INSERT OR DELETE ON follows
FOR EACH ROW
EXECUTE FUNCTION update_follow_counts();