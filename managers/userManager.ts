import crypto from 'crypto';
import pg from 'pg';

const pool = new pg.Pool({
	user: process.env.POSTGRES_USER,
	host: 'db',
	database: 'data',
	password: process.env.POSTGRES_PASSWORD,
	port: 5432,
});

export function register(email: string, password: string, username: string): Promise<User | null> {
	return new Promise(async (resolve, reject) => {
		if (!email || !password) return resolve(null);
		const salt = crypto.randomBytes(16).toString('hex');
		const hash = crypto.pbkdf2Sync(password, salt, 10000, 512, 'sha512').toString('hex');
		const createdAt = new Date();
		const updatedAt = new Date();

		pool.query(
			'SELECT * FROM users WHERE email = $1 or username = $2',
			[email, username],
			(err, result) => {
				if (err) return reject(err);
				if (result.rows.length > 0) return resolve(null);

				pool.query(
					'INSERT INTO users (username, hash, email, salt, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6)',
					[username, hash, email, salt, createdAt, updatedAt],
					(err, res) => {
						if (err) {
							console.log(err);
							return resolve(null);
						}
						return resolve({
							username: username,
							email: email,
							created_at: createdAt,
							updated_at: updatedAt,
							hash: hash,
							salt: salt,
						});
					}
				);
			}
		);
	});
}

export function login(emailOrPassord: string, password: string): Promise<Session | null> {
	return new Promise(async (resolve, reject) => {
		if (!emailOrPassord || !password) return resolve(null);
		pool.query(
			'SELECT * FROM users WHERE email = $1 OR username = $1',
			[emailOrPassord],
			(err, res) => {
				if (err) {
					console.log(err);
					return resolve(null);
				}
				if (res.rows.length === 0) return resolve(null);
				const user = res.rows[0];
				const hash = crypto
					.pbkdf2Sync(password, user.salt, 10000, 512, 'sha512')
					.toString('hex');
				if (hash.replace(/\s/g, '') === user.hash.replace(/\s/g, '')) {
					pool.query('SELECT * FROM sessions WHERE user_id = $1', [user.id], (err, res) => {
						if (err) {
							console.log(err);
							return resolve(null);
						}
						if (res.rows.length > 0) {
							if (res.rows[0].expires_at < new Date()) {
								pool.query(
									'DELETE FROM sessions WHERE user_id = $1',
									[user.id],
									(err, res) => {
										if (err) {
											console.log(err);
											return resolve(null);
										}

										const token = crypto.randomBytes(16).toString('hex');
										const session: Session = {
											created_at: new Date(),
											token: token,
											expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
											user_id: user.id,
										};

										pool.query(
											'INSERT INTO sessions (created_at, token, expires_at, user_id) VALUES ($1, $2, $3, $4)',
											[
												session.created_at,
												session.token,
												session.expires_at,
												session.user_id,
											],
											(err, res) => {
												if (err) {
													console.log(err);
													return resolve(null);
												}
												return resolve(session);
											}
										);
									}
								);
							} else {
								pool.query(
									'UPDATE sessions SET expires_at = $1 WHERE user_id = $2',
									[new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), user.id],
									(err, res2) => {
										if (err) {
											console.log(err);
											return resolve(null);
										}

										const session = res.rows[0];

										session.expires_at = new Date(session.expires_at);

										resolve(session);
									}
								);
							}
						} else {
							const token = crypto.randomBytes(16).toString('hex');
							const session: Session = {
								created_at: new Date(),
								token: token,
								expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
								user_id: user.id,
							};

							pool.query(
								'INSERT INTO sessions (created_at, token, expires_at, user_id) VALUES ($1, $2, $3, $4)',
								[session.created_at, session.token, session.expires_at, session.user_id],
								(err, res) => {
									if (err) {
										console.log(err);
										return resolve(null);
									}
									return resolve(session);
								}
							);
						}
					});
				} else {
					return resolve(null);
				}
			}
		);
	});
}

export function validateSession(
	sessionToken: string
): Promise<{ user: User & { id: number }; session: Session } | null> {
	return new Promise(async (resolve, reject) => {
		if (!sessionToken) return resolve(null);
		pool.query('SELECT * FROM sessions WHERE token = $1', [sessionToken], (err, res) => {
			if (err) {
				console.log(err);
				return resolve(null);
			}
			if (res.rows.length === 0) return resolve(null);
			const session = res.rows[0];
			if (session.expires_at < new Date()) {
				pool.query('DELETE FROM sessions WHERE token = $1', [sessionToken], (err, res) => {
					if (err) {
						console.log(err);
					}

					return resolve(null);
				});
			} else {
				pool.query(
					'UPDATE sessions SET expires_at = $1 WHERE token = $2',
					[new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), sessionToken],
					(err, res3) => {
						if (err) {
							console.log(err);
							return resolve(null);
						}
						pool.query(
							'SELECT * FROM users WHERE id = $1',
							[session.user_id],
							(err, res2) => {
								if (err) {
									console.log(err);
									return resolve(null);
								}
								if (res2.rows.length === 0) return resolve(null);
								let session = res.rows[0];
								session.expires_at = session.expires_at.toISOString();
								session.created_at = session.created_at.toISOString();
								let user = res2.rows[0];
								user.created_at = user.created_at.toISOString();
								user.updated_at = user.updated_at.toISOString();
								return resolve({ user: user, session: session });
							}
						);
					}
				);
			}
		});
	});
}

export function deleteSession(sessionToken: string): Promise<boolean> {
	return new Promise((resolve, reject) => {
		pool.query('DELETE FROM sessions WHERE token = $1', [sessionToken], (err, res) => {
			if (err) {
				console.log(err);
				return resolve(false);
			}
			return resolve(true);
		});
	});
}

export function deleteUser(user: User) {
	return new Promise((resolve, reject) => {
		pool.query('DELETE FROM users WHERE id = $1', [user.id], (err, res) => {
			if (err) {
				console.log(err);
				return resolve(false);
			}
			pool.query('DELETE FROM sessions WHERE user_id = $1', [user.id], (err, res) => {
				if (err) {
					console.log(err);
					return resolve(false);
				}
				return resolve(true);
			});
		});
	});
}

export function changePassword(user: User, password: string): Promise<boolean> {
	return new Promise((resolve, reject) => {
		const newHash = crypto.pbkdf2Sync(password, user.salt, 1000, 64, 'sha512').toString('hex');
		pool.query('UPDATE users SET password = $1 WHERE id = $2', [newHash, user.id], (err, res) => {
			if (err) {
				console.log(err);
				return resolve(false);
			}
			return resolve(true);
		});
	});
}

export function getUsers(): Promise<User[]> {
	return new Promise((resolve, reject) => {
		pool.query('SELECT * FROM users', (err, res) => {
			if (err) {
				console.log(err);
				return resolve([]);
			}
			const users = res.rows.map((user) => {
				user.created_at = user.created_at.toISOString();
				user.updated_at = user.updated_at.toISOString();
				return user;
			});
			return resolve(users);
		});
	});
}

export function getSessions(): Promise<Session[]> {
	return new Promise((resolve, reject) => {
		pool.query('SELECT * FROM sessions', (err, res) => {
			if (err) {
				console.log(err);
				return resolve([]);
			}
			const sessions = res.rows.map((session) => {
				session.created_at = session.created_at.toISOString();
				session.expires_at = session.expires_at.toISOString();
				return session;
			});
			return resolve(sessions);
		});
	});
}

export interface User {
	username: string;
	hash: string;
	email: string;
	salt: string;
	created_at: Date;
	updated_at: Date;
	id?: number;
}

export interface Session {
	user_id: string;
	token: string;
	created_at: Date;
	expires_at: Date;
}
