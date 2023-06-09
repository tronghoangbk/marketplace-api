import OrderModel from "../models/Order.model";
import {
	createObjIdService,
	createService,
	findOneService,
	deleteOneService,
	findManyService,
	updateOneService,
} from "./model.services";
import { Order } from "../interfaces/order.interfaces";
import axios from "axios";
import path from "path";
import { removeUndefinedOfObj } from "./other.services";
import itemModel from "../models/item.model";
import { getBalanceTokenForAccount } from "./aptos.services";
import { getOneItemService } from "./item.services";
export const getCreationNumService = async (txn_hash: string) => {
	try {
		let creationNumber = 0;
		await new Promise(resolve => setTimeout(resolve, 500));
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

export const getAuctionIdService = async (txHash: string) => {
	try {
		let auctionId = 0;
		await new Promise(resolve => setTimeout(resolve, 500));
		const response = await axios.get(`https://fullnode.testnet.aptoslabs.com/v1/transactions/by_hash/${txHash}`);
		let data = response.data.events;
		data.forEach((element: any) => {
			if (element.type.includes("auction::AuctionEvent")) {
				auctionId = element.data.auction_id;
			}
		});
		return auctionId;
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
	const order: any = await OrderModel.findOne({ _id: orderId })
		.lean()
		.populate({ path: "itemInfo", populate: "collectionInfo" });
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

export const getOneOrderService = async (query: Object): Promise<Order | null> => {
	query = removeUndefinedOfObj(query);
	const order: Order | null = await OrderModel.findOne(query).lean().populate("itemInfo");
	return order;
};

export const finalAuction = async (txHash: string, itemId: string) => {
	try {
		let buyer = "";
		let lister = "";
		let price = "";
		await new Promise(resolve => setTimeout(resolve, 500));
		const response = await axios.get(`https://fullnode.testnet.aptoslabs.com/v1/transactions/by_hash/${txHash}`);
		let data = response.data.events;
		data.forEach((element: any) => {
			if (element.type.includes("::bid_utils::OrderExecutedEvent")) {
				buyer = element.data.buyer;
				lister = element.data.lister_address;
				price = element.data.executed_price;
			}
		});
		let itemInfo = await getOneItemService({ _id: itemId });
		if (!itemInfo) {
			return;
		}
		let owners = itemInfo.owner;
		if (!owners.includes(buyer)) {
			owners.push(buyer);
		}
		let balanceLister = await getBalanceTokenForAccount(
			lister,
			itemInfo.creator,
			itemInfo.collectionInfo.collectionName,
			itemInfo.itemName,
			"2",
		);
		if (balanceLister === "0") {
			owners = owners.filter(ele => ele !== lister);
		}
		await updateOneService(itemModel, { _id: itemId }, { owner: owners });
	} catch (error: any) {
		console.log(error.message);
	}
};
