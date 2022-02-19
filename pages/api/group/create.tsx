import { NextApiRequest, NextApiResponse } from 'next';
import { createGroup } from '../../../managers/groupManager';
import { validateSession } from '../../../managers/userManager';

export default async function Create(req: NextApiRequest, res: NextApiResponse) {
	const { token } = req.cookies;

	const user = await validateSession(token);

	if (!user) {
		res.status(401).json({
			error: 'Unauthorized',
		});
		return;
	}

	const { name } = req.body;

	if (!name) {
		res.status(400).json({
			error: 'Missing name',
		});
		return;
	}

	const group = await createGroup(user.user, name);

	if (!group) {
		res.status(500).json({
			error: 'Failed to create group',
		});
		return;
	}

	res.status(200).json({
		group,
	});
}
