import { NextApiRequest, NextApiResponse } from 'next';
import { deleteUser, validateSession } from '../../../managers/userManager';

export default async function Logout(req: NextApiRequest, res: NextApiResponse) {
	const { token } = req.cookies;

	const user = await validateSession(token);

	if (!user) {
		res.status(401).json({
			message: 'Invalid token',
		});
		return;
	}

	const success = await deleteUser(user.user);

	if (success) {
		res.setHeader('Set-Cookie', ['token=; Max-Age=0'])
			.setHeader('Refresh', '0; url=/')
			.status(200)
			.end();
	} else {
		res.json(success);
	}
}
