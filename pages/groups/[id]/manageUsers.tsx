import { GetServerSidePropsContext } from 'next';
import { getGroups, Group, getUsersInGroup } from '../../../managers/groupManager';
import { getUsers, Session, User, validateSession } from '../../../managers/userManager';
import Layout from '../../../components/layout';
import Head from 'next/head';
import { useRouter } from 'next/router';

const translations: {
	[key: string]: {
		[key: string]: string;
	};
} = {
	'en-US': {
		Title: 'Manage Users in group $name',
		User: 'User',
		UsersInGroup: 'Users in group',
		AddUserToGroup: 'Add user to group',
		add: 'Add',
	},
	'de-DE': {
		Title: 'Benutzer in Gruppe $name verwalten',
		User: 'Benutzer',
		UsersInGroup: 'Benutzer in Gruppe',
		AddUserToGroup: 'Benutzer zur Gruppe hinzufügen',
		add: 'Hinzufügen',
	},
};

export default function AddUserToGroup(props: {
	session: Session;
	user: User;
	group: Group;
	users: { name: string; id: number; inGroup: boolean }[];
}) {
	const router = useRouter();
	const translation = translations[router.locale || 'en-US'];

	const addUserToGroup = (e: any) => {
		e.preventDefault();
		const userId = props.users.find(
			(user) => user.name === (document.getElementById('userId') as HTMLInputElement).value
		)?.id;

		if (!userId) return;

		if (!props.users.some((u) => u.id === userId)) {
			alert('User not found');
			return;
		}

		if (props.users.find((u) => u.id === userId)?.inGroup) {
			alert('User is already in group');
			return;
		}

		fetch('/api/group/addUserToGroup', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				groupId: props.group.id,
				userId: userId,
			}),
		})
			.then((res) => res.json())
			.then((data) => {
				if (data.success) {
					router.push(`/groups/${props.group.id}/manageUsers`);
				} else {
					alert(data.error);
				}
			});
	};

	const removeUserFromGroup = (e: any) => {
		e.preventDefault();
		const userId = props.users.find(
			(user) => user.name === (document.getElementById('userId') as HTMLInputElement).value
		)?.id;

		if (!props.users.some((u) => u.id === userId)) {
			alert('User not found');
			return;
		}

		if (!props.users.find((u) => u.id === userId)?.inGroup) {
			alert('User is not in group');
			return;
		}

		fetch('/api/group/removeUserFromGroup', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				groupId: props.group.id,
				userId: userId,
			}),
		})
			.then((res) => res.json())
			.then((data) => {
				if (data.success) {
					router.push(`/groups/${props.group.id}/manageUsers`);
				} else {
					alert(data.error);
				}
			});
	};

	return (
		<>
			<Head>
				<title>{translation.Title}</title>
			</Head>
			<Layout data={props}>
				<h2>
					{translation.UsersInGroup} {props.group.name}
				</h2>
				<ul>
					{props.users
						.filter((user) => user.inGroup)
						.map((user) => (
							<li key={user.id}>
								{user.name}
								<button onClick={removeUserFromGroup}>Remove</button>
							</li>
						))}
				</ul>
				<h2>{translation.AddUserToGroup}</h2>
				<datalist id="users">
					{props.users.map((user) => (
						<option key={user.id} value={user.name}>
							{user.name}
						</option>
					))}
				</datalist>
				<span>
					<label>{translation.User}: </label>
				</span>
				<input list="users" autoComplete="on" id="userId" />
				<button onClick={addUserToGroup}>{translation.add}</button>
			</Layout>
		</>
	);
}

export async function getServerSideProps({ req, query }: GetServerSidePropsContext) {
	const { session, user } = (await validateSession(req.cookies.token)) || {};

	if (!session || !user) {
		return {
			props: {
				session: null,
				user: null,
				group: null,
			},
		};
	}

	if (!query.id) {
		return {
			props: {
				session: session,
				user: user,
				group: null,
			},
		};
	}

	const userGroups = await getGroups(user);

	if (!userGroups) {
		return {
			props: {
				session: session,
				user: user,
				group: null,
			},
		};
	}

	let group = userGroups?.find((g) => g.id === Number.parseInt(query.id as string));

	if (!group) {
		return {
			props: {
				session: session,
				user: user,
				group: null,
			},
		};
	}

	group.created_at = group.created_at.toISOString() as any;

	const usersInGroup = await getUsersInGroup(group);

	const users = await Promise.all(
		(
			await getUsers()
		).map(async (u) => ({
			id: u.id,
			name: u.username,
			inGroup:
				usersInGroup?.find((uig) => uig === u.id) !== undefined && group?.owner_id !== u.id,
		}))
	);

	return {
		props: {
			session: session,
			user: user,
			group: group,
			users: users,
		},
	};
}
