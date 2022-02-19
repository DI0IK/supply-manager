import { NextApiRequest, NextApiResponse } from 'next';
import { changePassword, validateSession } from '../../../managers/userManager';

export default async function Logout(req: NextApiRequest, res: NextApiResponse) {
	const { token } = req.cookies;
	const { passwordNew } = req.body;

	const user = await validateSession(token);

	if (!user) {
		res.status(401).json({
			message: 'Invalid token',
		});
		return;
	}

	const success = await changePassword(user.user, passwordNew);

	if (success) {
		res.status(200).json({
			message: 'Password changed',
		});
	} else {
		res.json(success);
	}
}
