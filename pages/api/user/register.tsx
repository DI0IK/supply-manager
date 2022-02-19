import { NextApiRequest, NextApiResponse } from 'next';
import { login, register } from '../../../managers/userManager';

export default async function Register(req: NextApiRequest, res: NextApiResponse) {
	const { username, password, email } = req.body;

	const success = await register(email, password, username);

	const loginSuccess = success ? await login(email, password) : false;

	if (loginSuccess) {
		res.setHeader('Set-Cookie', ['token=' + loginSuccess.token + '; Path=/']).json(loginSuccess);
	} else {
		res.json(success);
	}
}
