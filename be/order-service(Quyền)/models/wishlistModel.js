
const db = require('../config/database');

exports.getList = async (userId) => {
    return await db.all('SELECT * FROM wishlists WHERE user_id = ? ORDER BY created_at DESC', [userId]);
};

exports.add = async (userId, productId) => {
    try {
        const result = await db.run(
            'INSERT INTO wishlists (user_id, product_id) VALUES (?, ?)',
            [userId, productId]
        );
        return { id: result.lastID, user_id: userId, product_id: productId };
    } catch (error) {
        if (error.message.includes('UNIQUE')) {
            return await db.get('SELECT * FROM wishlists WHERE user_id = ? AND product_id = ?', [userId, productId]);
        }
        throw error;
    }
};

exports.remove = async (userId, productId) => {
    const result = await db.run(
        'DELETE FROM wishlists WHERE user_id = ? AND product_id = ?',
        [userId, productId]
    );
    return result.changes > 0;
};

