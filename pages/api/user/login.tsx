import { NextApiRequest, NextApiResponse } from 'next';
import { login } from '../../../managers/userManager';

export default async function Login(req: NextApiRequest, res: NextApiResponse) {
	const { username, password } = req.body;

	const success = await login(username, password);

	if (success) {
		res.setHeader('Set-Cookie', ['token=' + success.token + '; Path=/']).json(success);
	} else {
		res.json(success);
	}
}
