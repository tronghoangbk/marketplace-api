import OrderModel from "../models/Order.model";
import { createObjIdService, createService, findOneService, deleteOneService, findManyService } from "./model.services";
import { Order } from "../interfaces/order.interfaces";
import axios from "axios";

export const getCreationNumService = async (txn_hash: string) => {
	try {
		let creationNumber = 0;
		await new Promise(resolve => setTimeout(resolve, 1000));
		const response = await axios.get(`https://fullnode.testnet.aptoslabs.com/v1/transactions/by_hash/${txn_hash}`);
		let data = response.data.events;
		data.forEach((element: any) => {
			if (element.type.includes("listing_utils::ListingEvent")) {
				creationNumber = element.data.id.creation_num;
			}
		});
		return creationNumber;
	} catch (error: any) {
		console.log(error.message);
		throw new Error("Error when get creation number");
	}
};

export const createOrderService = async (
	chainId: Number,
	maker: String,
	itemIdString: string,
	minPrice: Number,
	coinType: String,
	creationNumber: Number,
	amount: Number,
	startTime: String,
	expirationTime: String,
	instantSale: Boolean,
	auctionId: String,
) => {
	const itemId = createObjIdService(itemIdString);
	const order = await createService(OrderModel, {
		chainId,
		maker,
		itemId,
		minPrice,
		coinType,
		creationNumber,
		amount,
		startTime,
		expirationTime,
		instantSale,
		auctionId,
	});
	return order;
};

export const getOrderByIdService = async (orderId: string): Promise<Order> => {
	const order: Order = await findOneService(OrderModel, { _id: orderId });
	return order;
};

export const deleteOrderService = async (orderId: string) => {
	await deleteOneService(OrderModel, { _id: orderId });
	return "Done";
};

export const getOrderByItemIdService = async (itemId: string): Promise<Order[]> => {
	const orders: Order[] = await OrderModel.find({ itemId }).lean().populate("itemInfo");
	return orders;
};

export const getOrderByInstantSaleTrueService = async (): Promise<Order[]> => {
	const orders: Order[] = await OrderModel.find({ instantSale: true }).lean().populate("itemInfo");
	return orders;
};

export const getOrderByInstantSaleFalseService = async (): Promise<Order[]> => {
	const orders: Order[] = await OrderModel.find({ instantSale: false }).lean().populate("itemInfo");
	return orders;
};
