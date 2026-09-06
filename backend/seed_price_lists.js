const { pool } = require('./src/config/db');

async function fixPriceLists() {
  try {
    const products = (await pool.query('SELECT id, price, tax_rate FROM products')).rows;
    const priceLists = (await pool.query('SELECT id, name FROM price_lists')).rows;
    
    console.log(`Found ${products.length} products and ${priceLists.length} price lists.`);

    for (const pl of priceLists) {
      let factor = 1.0;
      if (pl.name.includes('SILVER')) factor = 0.95;
      if (pl.name.includes('GOLD')) factor = 0.90;
      if (pl.name.includes('BRONZE')) factor = 1.00;

      for (const p of products) {
        const price = (Number(p.price) * factor).toFixed(2);
        // Check if exists
        const existing = await pool.query(
          'SELECT id FROM price_list_items WHERE price_list_id = $1 AND product_id = $2',
          [pl.id, p.id]
        );

        if (existing.rows.length > 0) {
          await pool.query(
            'UPDATE price_list_items SET price = $1 WHERE id = $2',
            [price, existing.rows[0].id]
          );
        } else {
          await pool.query(
            'INSERT INTO price_list_items (price_list_id, product_id, price) VALUES ($1, $2, $3)',
            [pl.id, p.id, price]
          );
        }
      }
    }
    console.log('Price lists seeded successfully for all products!');
  } catch (err) {
    console.error('Error seeding price lists:', err);
  } finally {
    process.exit(0);
  }
}

fixPriceLists();
