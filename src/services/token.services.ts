import tokenModel from "../models/token.model";
import { findManyService } from "./model.services";
import { Token } from "../interfaces/token.interfaces";

export const getAllTokenService = async () => {
    const token: Token[] = await findManyService(tokenModel, {});
    return token;
};

export const getDecimalService = async (tokenSymbol: string): Promise<Number> => {
    const token: Token = await findManyService(tokenModel, { tokenSymbol });
    return token.decimal;
}