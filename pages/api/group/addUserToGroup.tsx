import { NextApiRequest, NextApiResponse } from 'next';
import { getGroup, joinGroup } from '../../../managers/groupManager';
import { validateSession } from '../../../managers/userManager';

export default async function addUserToGroup(req: NextApiRequest, res: NextApiResponse) {
	const { token } = req.cookies;

	const user = await validateSession(token);

	if (!user) {
		res.status(401).json({
			error: 'Unauthorized',
		});
		return;
	}

	const { groupId, userId } = req.body;

	const group = await getGroup(groupId);

	if (!group) {
		res.status(500).json({
			error: 'Failed to get group',
		});
		return;
	}

	if (group.owner_id !== user.user.id) {
		res.status(403).json({
			error: 'You are not the owner of this group',
		});
		return;
	}

	const success = await joinGroup(userId, group);

	if (!success) {
		res.status(500).json({
			error: 'Failed to add user to group',
		});
		return;
	} else {
		res.status(200).json({
			success: true,
		});
	}
}
