import { NextApiRequest, NextApiResponse } from 'next';
import { deleteSession } from '../../../managers/userManager';

export default async function Logout(req: NextApiRequest, res: NextApiResponse) {
	const { token } = req.cookies;

	const success = await deleteSession(token);

	if (success) {
		res.setHeader('Set-Cookie', ['token=; Max-Age=0'])
			.setHeader('Refresh', '0; url=/')
			.status(200)
			.end();
	} else {
		res.json(success);
	}
}
