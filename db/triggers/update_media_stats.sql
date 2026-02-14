-- Function to update media stats (Average Rating, Total Reviews, Likes, Dislikes)
CREATE OR REPLACE FUNCTION update_media_stats()
RETURNS TRIGGER AS $$
DECLARE
    target_media_id media_items.id%TYPE;
BEGIN
    IF (TG_OP = 'DELETE') THEN
        target_media_id := OLD."mediaId";
    ELSE
        target_media_id := NEW."mediaId";
    END IF;

    -- Robustness: Skip if target_media_id is NULL (avoids wasted subqueries)
    IF target_media_id IS NULL THEN
        RETURN NULL;
    END IF;

    -- If it's an UPDATE and mediaId changed, we also need to update the OLD media
    IF (TG_OP = 'UPDATE' AND OLD."mediaId" IS DISTINCT FROM NEW."mediaId" AND OLD."mediaId" IS NOT NULL) THEN
        UPDATE media_items
        SET
            -- FIX APPLIED: Cast AVG result to ::numeric before ROUND
            "averageRating" = COALESCE((SELECT ROUND(AVG(rating)::numeric, 1) FROM reviews WHERE "mediaId" = OLD."mediaId" AND rating IS NOT NULL), 0),
            "totalReviews" = (SELECT COUNT(*) FROM reviews WHERE "mediaId" = OLD."mediaId"),
            "totalLikes" = (SELECT COUNT(*) FROM reviews WHERE "mediaId" = OLD."mediaId" AND liked = true),
            "totalDislikes" = (SELECT COUNT(*) FROM reviews WHERE "mediaId" = OLD."mediaId" AND liked = false)
        WHERE id = OLD."mediaId";
    END IF;

    -- Update the target media
    UPDATE media_items
    SET
        -- FIX APPLIED: Cast AVG result to ::numeric before ROUND
        "averageRating" = COALESCE((SELECT ROUND(AVG(rating)::numeric, 1) FROM reviews WHERE "mediaId" = target_media_id AND rating IS NOT NULL), 0),
        "totalReviews" = (SELECT COUNT(*) FROM reviews WHERE "mediaId" = target_media_id),
        "totalLikes" = (SELECT COUNT(*) FROM reviews WHERE "mediaId" = target_media_id AND liked = true),
        "totalDislikes" = (SELECT COUNT(*) FROM reviews WHERE "mediaId" = target_media_id AND liked = false)
    WHERE id = target_media_id;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for Review changes
-- RESTRICTED to relevant columns to avoid recursion when comment counts update
DROP TRIGGER IF EXISTS update_media_stats_trigger ON reviews;
CREATE TRIGGER update_media_stats_trigger
AFTER INSERT OR DELETE OR UPDATE OF rating, liked, "mediaId" ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_media_stats();


-- Function to update total comments on a review
CREATE OR REPLACE FUNCTION update_review_comment_count()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        -- Robustness: Check if reviewId exists/is not null (though schema enforces it)
        IF NEW."reviewId" IS NOT NULL THEN
            UPDATE reviews
            SET "totalComments" = COALESCE("totalComments", 0) + 1
            WHERE id = NEW."reviewId";
        END IF;
        RETURN NEW;
    ELSIF (TG_OP = 'DELETE') THEN
        IF OLD."reviewId" IS NOT NULL THEN
            UPDATE reviews
            SET "totalComments" = GREATEST(COALESCE("totalComments", 0) - 1, 0)
            WHERE id = OLD."reviewId";
        END IF;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for Comment changes
DROP TRIGGER IF EXISTS update_review_comment_count_trigger ON comments;
CREATE TRIGGER update_review_comment_count_trigger
AFTER INSERT OR DELETE ON comments
FOR EACH ROW
EXECUTE FUNCTION update_review_comment_count();

-- Function to update total likes on a review
CREATE OR REPLACE FUNCTION update_review_like_count()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        IF NEW."reviewId" IS NOT NULL THEN
            UPDATE reviews
            SET "totalLikes" = COALESCE("totalLikes", 0) + 1
            WHERE id = NEW."reviewId";
        END IF;
        RETURN NEW;

    ELSIF (TG_OP = 'DELETE') THEN
        IF OLD."reviewId" IS NOT NULL THEN
            UPDATE reviews
            SET "totalLikes" = GREATEST(COALESCE("totalLikes", 0) - 1, 0)
            WHERE id = OLD."reviewId";
        END IF;
        RETURN OLD;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for ReviewLike changes
DROP TRIGGER IF EXISTS update_review_like_count_trigger ON review_likes;

CREATE TRIGGER update_review_like_count_trigger
AFTER INSERT OR DELETE ON review_likes
FOR EACH ROW
EXECUTE FUNCTION update_review_like_count();
