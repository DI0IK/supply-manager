import { NextApiRequest, NextApiResponse } from 'next';
import { deleteGroup, getGroup } from '../../../managers/groupManager';
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

	const { id } = req.body;

	const group = await getGroup(id);

	if (!group) {
		res.status(500).json({
			error: 'Failed to get group',
		});
		return;
	}

	const success = await deleteGroup(user.user, group);

	if (!success) {
		res.status(500).json({
			error: 'Failed to delete group',
		});
		return;
	}

	res.status(200).json({
		success,
	});
}
