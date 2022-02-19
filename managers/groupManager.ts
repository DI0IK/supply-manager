import pg from 'pg';
import { User } from './userManager';

const pool = new pg.Pool({
	user: process.env.POSTGRES_USER,
	host: 'db',
	database: 'data',
	password: process.env.POSTGRES_PASSWORD,
	port: 5432,
});

export function createGroup(user: User & { id: number }, name: string): Promise<Group | null> {
	return new Promise(async (resolve, reject) => {
		if (!user) return resolve(null);
		const createdAt = new Date();

		pool.query(
			'INSERT INTO groups (name, created_at, owner_id) VALUES ($1, $2, $3)',
			[name, createdAt, user.id],
			(err, res) => {
				if (err) {
					console.log(err);
					return resolve(null);
				}
				pool.query(
					'SELECT * FROM groups WHERE created_at = $1 AND owner_id = $2',
					[createdAt, user.id],
					(err, res) => {
						if (err) {
							console.log(err);
							return resolve(null);
						}
						pool.query(
							'INSERT INTO users_groups (user_id, group_id) VALUES ($1, $2)',
							[user.id, res.rows[0].id],
							(err, res2) => {
								if (err) {
									console.log(err);
									return resolve(null);
								}
								return resolve({
									name: name,
									created_at: createdAt,
									owner_id: user.id,
									id: res.rows[0].id,
								});
							}
						);
					}
				);
			}
		);
	});
}

export function deleteGroup(user: User & { id: number }, group: Group): Promise<boolean> {
	return new Promise(async (resolve, reject) => {
		if (!user) return resolve(false);

		pool.query(
			'DELETE FROM groups WHERE id = $1 AND owner_id = $2',
			[group.id, user.id],
			(err, res) => {
				if (err) {
					console.log(err);
					return resolve(false);
				}
				if (res.rowCount === 0) return resolve(false);
				// remove all users from the group
				pool.query('DELETE FROM users_groups WHERE group_id = $1', [group.id], (err, res) => {
					if (err) {
						console.log(err);
						return resolve(false);
					}
					return resolve(true);
				});
			}
		);
	});
}

export function getGroups(user: User): Promise<Group[] | null> {
	return new Promise(async (resolve, reject) => {
		if (!user) return resolve(null);
		pool.query(
			'SELECT * FROM users_groups, groups WHERE users_groups.user_id = $1 AND users_groups.group_id = groups.id',
			[user.id],
			(err, res) => {
				if (err) {
					console.log(err);
					return resolve(null);
				}
				const groups = res.rows.map((row) => {
					return {
						name: row.name,
						created_at: row.created_at,
						owner_id: row.owner_id,
						id: row.id,
					};
				});
				return resolve(groups);
			}
		);
	});
}

export function joinGroup(user: User, group: Group): Promise<boolean> {
	return new Promise(async (resolve, reject) => {
		if (!user) return resolve(false);
		pool.query(
			'INSERT INTO users_groups (user_id, group_id) VALUES ($1, $2)',
			[user.id, group.id],
			(err, res) => {
				if (err) {
					console.log(err);
					return resolve(false);
				}
				return resolve(true);
			}
		);
	});
}

export function getGroup(groupId: number): Promise<Group | null> {
	return new Promise(async (resolve, reject) => {
		pool.query('SELECT * FROM groups WHERE id = $1', [groupId], (err, res) => {
			if (err) {
				console.log(err);
				return resolve(null);
			}
			if (res.rowCount === 0) return resolve(null);
			return resolve({
				id: res.rows[0].id,
				name: res.rows[0].name,
				created_at: res.rows[0].created_at,
				owner_id: res.rows[0].owner_id,
			});
		});
	});
}

export interface Group {
	id: number;
	name: string;
	created_at: Date;
	owner_id: number;
}
