import { Request, Response } from "express";
import {
	createUserIfNotExistService,
	getManyUserService,
	getOneUserService,
	getSearchUserByIdService,
	updateUserService,
	updateNonceUserService,
} from "../services/user.services";
import { findOneService, updateOneService } from "../services/model.services";
import userModel from "../models/user.model";
import { createService } from "../services/model.services";
import { removeUndefinedOfObj } from "../services/other.services";
import formidable from "formidable";
import { handlePromiseUpload } from "../services/uploadFile.service";
import { LoginUser, User } from "../interfaces/user.interfaces";
import { ResponseAPI } from "../interfaces/responseData.interfaces";
import { ERROR_RESPONSE } from "../constant/response.constants";
import { sendMailService } from "../services/mail.services";
import { STATIC_FOLDER } from "../constant/default.constant";
import jwt from "jsonwebtoken";
import fs from "fs";
const createUserController = async (req: Request, res: Response) => {
	try {
		let { userAddress, signature } = req.body;
		userAddress = userAddress.toLowerCase();
		const user: User = await createUserIfNotExistService(userAddress, signature);
		return res.status(200).json({ data: user });
	} catch (error: any) {
		return res.status(403).json({ error: ERROR_RESPONSE[403] });
	}
};

const uploadUserImageController = async (req: Request, res: Response) => {
	try {
		const form = formidable();
		const result = await handlePromiseUpload(form, req, "users");
		return res.status(200).json({ data: result });
	} catch (error: any) {
		return res.status(500).json({ error: ERROR_RESPONSE[500] });
	}
};

const updateUserController = async (req: Request, res: Response) => {
	try {
		const { userAddress } = req.params;
		let data: User = req.body;
		data = removeUndefinedOfObj(data);
		const user = await updateOneService(userModel, { userAddress }, data);
		if (data.email && (!user.confirmEmail || user.email !== data.email)) {
			let html = fs.readFileSync(`${STATIC_FOLDER}/views/verificationEmail.html`, { encoding: "utf8" });
			let token = jwt.sign({ userAddress }, "secret", { expiresIn: "10m" });
			token = encodeURIComponent(token);
			let host = req.headers.host?.includes("localhost") ? "http://" : "https://";
			host += req.headers.host;
			let link = `${host}/users/verify-email/${userAddress}/${token}`;
			html = html.replace("{{link}}", link);
			await sendMailService(data.email, "Verify your email", html);
		}
		return res.status(200).json({ data: user });
	} catch (error: any) {
		return res.status(500).json({ error: ERROR_RESPONSE[403] });
	}
};

const verificationEmailController = async (req: Request, res: Response) => {
	try {
		let { userAddress, token } = req.params;
		userAddress = userAddress.toLowerCase();
		token = decodeURIComponent(token);
		const user = await findOneService(userModel, { userAddress });
		if (!user) return res.status(403).json({ error: ERROR_RESPONSE[403] });
		const decoded = jwt.verify(token, "secret");
		if (decoded) {
			await updateOneService(userModel, { userAddress }, { confirmEmail: true });
			return res.status(200).json({ message: "Verify email successfully" });
		}
		return res.status(403).json({ error: ERROR_RESPONSE[403] });
	} catch (error: any) {
		return res.status(500).json({ error: ERROR_RESPONSE[500] });
	}
};

// const logoutController = async (req: Request, res: Response) => {
// 	try {
// 		const { userAddress } = req.body;
// 		const user = await findOneService(userModel, { userAddress });
// 		if (user.signature) {
// 			await updateOneService(userModel, { userAddress }, { signature: "" });
// 		}
// 		return res.status(200).json({ message: "Logout successfully" });
// 	} catch (error: any) {
// 		return res.status(500).json({ error: ERROR_RESPONSE[500] });
// 	}
// };

const getQueryUserController = async (req: Request, res: Response) => {
	const { pageSize, pageId } = req.params;
	try {
		const textSearch = req.body.text;
		const sort = req.body.sort;
		const users = await getManyUserService(textSearch, sort, parseInt(pageSize), parseInt(pageId));
		if (users) res.status(200).json(users);
		else res.status(403).json({ message: ERROR_RESPONSE[403] });
	} catch (error: any) {
		return res.status(500).json({ error: ERROR_RESPONSE[500] });
	}
};

const getSearchUserByIdController = async (req: Request, res: Response) => {
	const { userId } = req.params;
	try {
		const user: User = await getSearchUserByIdService(userId);
		const response: ResponseAPI<User> = {
			data: user,
		};
		return res.status(200).json(response);
	} catch (error: any) {
		console.log(error.message);
		return res.status(500).json({ error: ERROR_RESPONSE[500] });
	}
};

const getUserProfileController = async (req: Request, res: Response) => {
	try {
		const { userAddress } = req.params;
		const user = await userModel.findOne({ userAddress });
		return res.status(200).json({ data: user });
	} catch (error: any) {
		return res.status(500).json({ error: ERROR_RESPONSE[500] });
	}
};
export {
	createUserController,
	updateUserController,
	uploadUserImageController,
	verificationEmailController,
	getUserProfileController,
};
