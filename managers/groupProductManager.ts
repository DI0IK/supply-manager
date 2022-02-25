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

export function addProduct(
	product: Product,
	quantity: number,
	expirationDate: Date,
	group: Group
): Promise<boolean> {
	return new Promise(async (resolve, reject) => {
		pool.query(
			'SELECT * FROM groups_products WHERE group_id = $1 AND product_barcode = $2 AND expiration_date = $3',
			[group.id, product.barcode, expirationDate],
			(err, res) => {
				if (err) {
					console.log(err);
					return resolve(false);
				}
				if (res.rows.length === 0) {
					pool.query(
						'INSERT INTO groups_products (group_id, product_barcode, quantity, expiration_date, amount_wanted) VALUES ($1, $2, $3, $4, $5)',
						[group.id, product.barcode, quantity, expirationDate, 0],
						(err, res) => {
							if (err) {
								console.log(err);
								return resolve(false);
							}
							return resolve(true);
						}
					);
				} else {
					pool.query(
						'UPDATE groups_products SET quantity = $1 WHERE group_id = $2 AND product_barcode = $3 AND expiration_date = $4',
						[res.rows[0].quantity + quantity, group.id, product.barcode, expirationDate],
						(err, res) => {
							if (err) {
								console.log(err);
								return resolve(false);
							}
							return resolve(true);
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
): Promise<boolean> {
	return new Promise(async (resolve, reject) => {
		pool.query(
			'SELECT * FROM groups_products WHERE group_id = $1 AND product_barcode = $2 AND expiration_date = $3',
			[group.id, product.barcode, expirationDate],
			(err, res) => {
				if (err) {
					console.log(err);
					return resolve(false);
				}
				if (res.rows.length === 0) {
					return resolve(false);
				} else {
					if (res.rows[0].quantity - quantity === 0) {
						pool.query(
							'DELETE FROM groups_products WHERE group_id = $1 AND product_barcode = $2 AND expiration_date = $3',
							[group.id, product.barcode, expirationDate],
							(err, res) => {
								if (err) {
									console.log(err);
									return resolve(false);
								}
								return resolve(true);
							}
						);
					}
					if (res.rows[0].quantity - quantity < 0) {
						return resolve(false);
					} else {
						pool.query(
							'UPDATE groups_products SET quantity = $1 WHERE group_id = $2 AND product_barcode = $3 AND expiration_date = $4',
							[res.rows[0].quantity - quantity, group.id, product.barcode, expirationDate],
							(err, res) => {
								if (err) {
									console.log(err);
									return resolve(false);
								}
								return resolve(true);
							}
						);
					}
				}
			}
		);
	});
}

export function setAmountWanted(
	product: Product,
	quantity: number,
	expirationDate: Date,
	group: Group
): Promise<boolean> {
	return new Promise(async (resolve, reject) => {
		pool.query(
			'SELECT * FROM groups_products WHERE group_id = $1 AND product_barcode = $2 AND expiration_date = $3',
			[group.id, product.barcode, expirationDate],
			(err, res) => {
				if (err) {
					console.log(err);
					return resolve(false);
				}
				if (res.rows.length === 0) {
					return resolve(false);
				} else {
					pool.query(
						'UPDATE groups_products SET amount_wanted = $1 WHERE group_id = $2 AND product_barcode = $3 AND expiration_date = $4',
						[quantity, group.id, product.barcode, expirationDate],
						(err, res) => {
							if (err) {
								console.log(err);
								return resolve(false);
							}
							return resolve(true);
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
	quantity: number;
	expiration_date: Date;
	amount_wanted?: number;
}
