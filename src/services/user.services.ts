import userModel from "../models/user.model";
import {
	createService,
	findOneService,
	queryExistService,
	updateOneService,
	deleteOneService,
	findManyService,
	queryItemsOfModelInPageService,
	createObjIdService,
} from "./model.services";
import blacklistModel from "../models/blacklist.model";
import { getSortObj } from "./other.services";
import { BlackUser, User } from "../interfaces/user.interfaces";
import { ListResponseAPI } from "../interfaces/responseData.interfaces";

const createUserIfNotExistService = async (userAddress: string, nonce: string): Promise<User> => {
	let user: User = await findOneService(userModel, { userAddress });
	if (!user) {
		user = await createService(userModel, { userAddress, nonce });
	}
	return user;
};

const checkUserExistsService = async (userAddress: string): Promise<boolean> => {
	userAddress = userAddress.toLowerCase();
	return await queryExistService(userModel, { userAddress });
};

const getOneUserService = async (userAddress: string): Promise<User> => {
	let user: User = await findOneService(userModel, { userAddress: userAddress.toLowerCase() });
	if (!user) {
		user = await createService(userModel, { userAddress });
	}
	return user;
};

const getManyUserService = async (
	text: string,
	sort: string[],
	pageSize: number,
	pageId: number,
): Promise<ListResponseAPI<User>> => {
	const userAddress:any = text ? { userAddress: { $regex: text, $options: "i" } } : undefined;
	const username:any = text ? { username: { $regex: text, $options: "i" } } : undefined;
	
	const objQuery = (userAddress && username) ? { $or: [userAddress, username] } : {};
	
	

	let returnUser: ListResponseAPI<User> = await queryItemsOfModelInPageService(
		userModel,
		objQuery,
		pageId,
		pageSize,
		getSortObj(sort),
		"userAddress"
		
	);

	return returnUser;
};
const updateNonceUserService = async(userAddress: string, nonce: string) => {
	let user: User = await findOneService(userModel, { userAddress: userAddress.toLowerCase() });
	if (user) {
		user = await updateOneService(userModel,{userAddress},{nonce},{new: true})	
	}
}

const updateUserService = async (
	userAddress: string,
	avatar: string,
	background: string,
	username: string,
	email: string,
	social: string,
	bio: string,
): Promise<User> => {
	const user: User = await updateOneService(
		userModel,
		{
			userAddress,
		},
		{
			avatar,
			background,
			username,
			email,
			bio,
			social,
		},
		{
			new: true,
		},
	);

	return user;
};

const addUserToBlacklistService = async (address: string): Promise<BlackUser> => {
	const user: BlackUser = await createService(blacklistModel, { userAddress: address });
	return user;
};

const removeUserFromBlacklistService = async (address: string): Promise<BlackUser> => {
	const user: BlackUser = await deleteOneService(blacklistModel, { userAddress: address });
	return user;
};

const getBlacklistService = async (): Promise<BlackUser[]> => {
	const users: BlackUser[] = await findManyService(blacklistModel, {}, "userAddress");
	return users;
};

const checkUserIsInBlacklistService = async (userAddress: string): Promise<boolean> => {
	const user: BlackUser = await findOneService(blacklistModel, { userAddress });
	return user ? true : false;
};

const getAllUsersService = async () => {
	const usersInBlackList = await userModel.find().populate("userInBlackList").lean();
	return usersInBlackList;
};

const getSearchUserByIdService = async (userId: string): Promise<User> => {
	const user: User = await findOneService(userModel, { _id: createObjIdService(userId) });
	return user;
};

/*-----------Get Nonce Login using Cookie----------------*/

const getNonceUserService = async (userAddress: string) => {
	let user = await findOneService(userModel, { userAddress: userAddress.toLowerCase() });
	if (!user) {
		user = await createService(userModel, { userAddress });
	}
	return user;
}
/*-----------Get Avatar by User Address----------------*/
const getAvatarService = async (userAddress: string) => {
	const user: User = await findOneService(userModel, { userAddress: userAddress.toLowerCase() });
	return user.avatar.toString();
}
/*-----------Get User Name by User Address----------------*/
const getUserNameService = async (userAddress: string) => {
	const user: User = await findOneService(userModel, { userAddress: userAddress.toLowerCase() });
	return user.username.toString();
}

export {
	createUserIfNotExistService,
	checkUserExistsService,
	updateUserService,
	getOneUserService,
	addUserToBlacklistService,
	removeUserFromBlacklistService,
	checkUserIsInBlacklistService,
	getBlacklistService,
	getManyUserService,
	getAllUsersService,
	getSearchUserByIdService,
/*-----------Add Service----------------*/
	updateNonceUserService,
	getNonceUserService,
	getAvatarService,
	getUserNameService,
};
