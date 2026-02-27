
const db = require('./db');

// --- HÀM HELPER: Tính lại điểm đánh giá ---

const refreshProductAggregates = async (productId) => {
  try {
    const stats = await db.get(
      `SELECT COUNT(*) as total, AVG(rating) as average
       FROM product_reviews

       WHERE product_id = ?`, 
      [productId]
    );


    const avg = stats && stats.average ? stats.average : 0;
    const total = stats && stats.total ? stats.total : 0;

    await db.run(
      `UPDATE products
       SET rating = ?, review_count = ?
       WHERE id = ?`,
      [avg, total, productId]
    );
  } catch (error) {

    console.error('⚠️ Lỗi tính lại rating:', error.message);
  }
};

// --- CÁC HÀM CHÍNH ---

exports.getReviewsByProduct = (productId) => {
  return db.all(
    `SELECT * FROM product_reviews
     WHERE product_id = ?
     ORDER BY created_at DESC`,
    [productId]

  );
};

exports.createReview = async (productId, payload) => {
  const now = new Date().toISOString();

  await db.run('BEGIN TRANSACTION');
  try {
    const result = await db.run(
      `INSERT INTO product_reviews

        (product_id, user_id, rating, comment, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)`,

      [
        productId,
        payload.user_id,
        Number(payload.rating),

        payload.comment || null,

        now,
        now
      ]
    );

    await refreshProductAggregates(productId);

    await db.run('COMMIT');
    return db.get('SELECT * FROM product_reviews WHERE id = ?', [result.lastID]);
  } catch (error) {
    await db.run('ROLLBACK');


    throw error;
  }
};


// Hàm trả lời review (Admin)
exports.replyToReview = async (reviewId, replyText) => {
    const now = new Date().toISOString();
    await db.run(
      `UPDATE product_reviews
       SET admin_reply = ?, updated_at = ?
       WHERE id = ?`,
      [replyText, now, reviewId]
    );
    return db.get('SELECT * FROM product_reviews WHERE id = ?', [reviewId]);
};

exports.deleteReview = async (reviewId) => {
  try {
    const review = await db.get('SELECT * FROM product_reviews WHERE id = ?', [reviewId]);
    if (!review) return false;

    await db.run('BEGIN TRANSACTION');
    
    await db.run('DELETE FROM product_reviews WHERE id = ?', [reviewId]);

    await refreshProductAggregates(review.product_id);

    await db.run('COMMIT');
    return true;
  } catch (error) {
    await db.run('ROLLBACK');


    throw error;
  }
};



exports.getAllReviews = async () => {
    return db.all(`
      SELECT r.*, p.name as product_name
      FROM product_reviews r
      JOIN products p ON r.product_id = p.id
      ORDER BY r.created_at DESC
    `);
};