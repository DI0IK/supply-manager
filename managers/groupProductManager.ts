import pg from 'pg';
import { Group } from './groupManager';
import { Product } from './openfoodfacts';

const pool = new pg.Pool({
	user: process.env.POSTGRES_USER,
	host: 'db',
	database: 'data',
	password: process.env.POSTGRES_PASSWORD,
	port: 5432,
});

export function addProduct(product: Product, quantity: number, expirationDate: Date, group: Group) {
	return new Promise(async (resolve, reject) => {
		pool.query(
			'SELECT * FROM groups_products WHERE group_id = $1 AND product_barcode = $2 AND expiration_date = $3',
			[group.id, product.barcode, expirationDate],
			(err, res) => {
				if (err) {
					console.log(err);
					return resolve(null);
				}
				if (res.rows.length === 0) {
					pool.query(
						'INSERT INTO groups_products (group_id, product_barcode, quantity, expiration_date) VALUES ($1, $2, $3, $4)',
						[group.id, product.barcode, quantity, expirationDate],
						(err, res) => {
							if (err) {
								console.log(err);
								return resolve(null);
							}
							return resolve(res);
						}
					);
				} else {
					pool.query(
						'UPDATE groups_products SET quantity = $1 WHERE group_id = $2 AND product_barcode = $3 AND expiration_date = $4',
						[res.rows[0].quantity + quantity, group.id, product.barcode, expirationDate],
						(err, res) => {
							if (err) {
								console.log(err);
								return resolve(null);
							}
							return resolve(res);
						}
					);
				}
			}
		);
	});
}

export function removeProduct(
	product: Product,
	quantity: number,
	expirationDate: Date,
	group: Group
) {
	return new Promise(async (resolve, reject) => {
		pool.query(
			'SELECT * FROM groups_products WHERE group_id = $1 AND product_barcode = $2 AND expiration_date = $3',
			[group.id, product.barcode, expirationDate],
			(err, res) => {
				if (err) {
					console.log(err);
					return resolve(null);
				}
				if (res.rows.length === 0) {
					return resolve(null);
				} else {
					pool.query(
						'UPDATE groups_products SET quantity = $1 WHERE group_id = $2 AND product_barcode = $3 AND expiration_date = $4',
						[res.rows[0].quantity - quantity, group.id, product.barcode, expirationDate],
						(err, res) => {
							if (err) {
								console.log(err);
								return resolve(null);
							}
							return resolve(res);
						}
					);
				}
			}
		);
	});
}

export function getProducts(group: Group): Promise<(Product & GroupProduct)[] | null> {
	return new Promise(async (resolve, reject) => {
		pool.query(
			'SELECT * FROM groups_products, products WHERE group_id = $1 AND groups_products.product_barcode = products.barcode',
			[group.id],
			(err, res) => {
				if (err) {
					console.log(err);
					return resolve(null);
				}
				return resolve(res.rows);
			}
		);
	});
}

export interface GroupProduct {
	group_id: string;
	product_barcode: string;
	amount: number;
	expiration_date: Date;
}
