import pg from 'pg';
import axios from 'axios';

const pool = new pg.Pool({
	user: process.env.POSTGRES_USER,
	host: 'db',
	database: 'data',
	password: process.env.POSTGRES_PASSWORD,
	port: 5432,
});

function getItemFromAPI(barcode: string): Promise<Product | null> {
	return new Promise(async (resolve, reject) => {
		if (!barcode) return resolve(null);
		axios
			.get(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`)
			.then((res) => {
				if (res.data.status === 1) {
					const item: Product = {
						barcode: res.data?.code || '',
						brands: res.data?.product?.brands || '',
						categories:
							res.data?.product?.categories_tags
								?.map?.((category: string) => category.split(':')[1])
								.join(';') || '',
						completeness: res.data?.product?.completeness || '',
						nutriscore: res.data?.product?.nutriscore_grade || '',
						product_name: res.data?.product?.product_name || '',
						quantity: res.data?.product?.quantity || '',
					};
					return resolve(item);
				} else {
					return resolve(null);
				}
			})
			.catch((err) => {
				console.log(err);
				return resolve(null);
			});
	});
}

export function getProduct(
	barcode: string
): Promise<{ data: Product; source: 'db' | 'api' } | null> {
	return new Promise(async (resolve, reject) => {
		pool.query(`SELECT * FROM products WHERE barcode = $1`, [barcode], async (err, res) => {
			if (err) {
				console.log(err);
				return resolve(null);
			}
			if (res.rows.length === 0) {
				const item = await getItemFromAPI(barcode);
				if (item) {
					pool.query(
						`INSERT INTO products (barcode, brands, categories, completeness, nutriscore, product_name, cached_at, quantity) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
						[
							item.barcode,
							item.brands,
							item.categories,
							item.completeness,
							item.nutriscore,
							item.product_name,
							new Date(),
							item.quantity,
						],
						(err, res) => {
							if (err) {
								console.log(err);
							}
							resolve({ data: item, source: 'api' });
						}
					);
				}
			} else if (res.rows[0].cached_at < new Date(Date.now() - 1000 * 60 * 60 * 24 * 7)) {
				const item = await getItemFromAPI(barcode);
				if (item) {
					pool.query(
						`UPDATE products SET brands = $1, categories = $2, completeness = $3, nutriscore = $4, product_name = $5, quantity = $6, cached_at = $7 WHERE barcode = $8`,
						[
							item.brands,
							item.categories,
							item.completeness,
							item.nutriscore,
							item.product_name,
							item.quantity,
							new Date(),
							item.barcode,
						],
						(err, res) => {
							if (err) {
								console.log(err);
							}
							resolve({ data: item, source: 'api' });
						}
					);
				}
			} else {
				resolve({ data: res.rows[0], source: 'db' });
			}
		});
	});
}

export interface Product {
	barcode: string;
	brands: string;
	categories: string;
	completeness: number;
	nutriscore: number;
	product_name: string;
	quantity: string;
}
