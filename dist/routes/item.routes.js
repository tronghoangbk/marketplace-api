"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const checkUser_middlewares_1 = require("../middlewares/checkUser.middlewares");
const checkOther_middlewares_1 = require("../middlewares/checkOther.middlewares");
const checkCollection_middlewares_1 = require("../middlewares/checkCollection.middlewares");
const checkItem_middlewares_1 = require("../middlewares/checkItem.middlewares");
const item_controllers_1 = require("../controllers/item.controllers");
const itemRouter = express_1.default.Router();
itemRouter.post("/create/userAddress/:userAddress/chainId/:chainId", checkUser_middlewares_1.checkUserExist, checkOther_middlewares_1.checkChainIdValid, checkCollection_middlewares_1.checkOwnerCollection, checkUser_middlewares_1.checkUserAuthen, checkItem_middlewares_1.checkItemName, checkItem_middlewares_1.checkItemDescription, checkItem_middlewares_1.checkItemMedia, item_controllers_1.createItem);
itemRouter.get("/get-info/itemId/:itemId", item_controllers_1.getItemById);
itemRouter.get("/get-all/chainId/:chainId", checkOther_middlewares_1.checkChainIdValid, item_controllers_1.getAllItem);
itemRouter.get("/get-item-for-user/userAddress/:userAddress/chainId/:chainId", checkUser_middlewares_1.checkUserExist, checkOther_middlewares_1.checkChainIdValid, item_controllers_1.getItemForUser);
itemRouter.post("/show-list-item", item_controllers_1.showSelectItemController);
itemRouter.get("/show-random-list-item", item_controllers_1.showRandomListItemController);
itemRouter.get("/get-item-by-created/:userAddress", item_controllers_1.getListItemByCreatedController);
itemRouter.get("/get-item-by-collected/:userAddress", item_controllers_1.getListItemByOwnerController);
itemRouter.get("/get-transaction", item_controllers_1.getTranController);
itemRouter.post("/setItem", item_controllers_1.setItemController);
itemRouter.get("/getItem", item_controllers_1.getItemController);
itemRouter.put("/transfer", item_controllers_1.updateOwnerController);
itemRouter.put("/update-item", item_controllers_1.updateOwnerController);
itemRouter.get("/get-volume-item/:id", item_controllers_1.getVolumeAllItemController);
exports.default = itemRouter;
