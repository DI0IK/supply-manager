import { NextApiRequest, NextApiResponse } from 'next';
import { getGroup } from '../../../managers/groupManager';
import { addProduct } from '../../../managers/groupProductManager';
import { getProduct } from '../../../managers/openfoodfacts';
import { validateSession } from '../../../managers/userManager';

export default async function addProductToGroupProducts(req: NextApiRequest, res: NextApiResponse) {
	const { token } = req.cookies;

	const user = await validateSession(token);

	if (!user) {
		res.status(401).json({
			error: 'Unauthorized',
		});
		return;
	}

	const { groupId, barcode, expDate, amount } = req.body;

	const group = await getGroup(groupId);

	if (!group) {
		res.status(500).json({
			error: 'Failed to get group',
		});
		return;
	}

	const product = await getProduct(barcode);

	if (!product) {
		res.status(500).json({
			error: 'Failed to get product',
		});
		return;
	}

	const success = await addProduct(product.data, amount, new Date(expDate), group);

	if (!success) {
		res.status(500).json({
			error: 'Failed to add product',
		});
		return;
	} else {
		res.status(200).json({
			success: true,
		});
	}
}
