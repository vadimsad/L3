import { genUUID } from "../utils/helpers";
import { ProductData } from "types";

type StatBody = {
    type: StatEventType,
    payload: object,
};

type StatBodySent = StatBody & { timestamp: number };

enum StatEventType {
    ROUTE = 'route',
    VIEW_CARD = 'viewCard',
    VIEW_CARD_PROMO = 'viewCardPromo',
    ADD_TO_CART = 'addToCart',
    PURCHASE = 'purchase',
}

class StatsService {
    onRoute(url: string) {
        const action = {
            type: StatEventType.ROUTE,
            payload: { url },
        }

        this._send(action);
    }

    onViewProduct(product: ProductData, secretKey: string) {
        const action = {
            type: this._isEmpty(product.log) ? StatEventType.VIEW_CARD : StatEventType.VIEW_CARD_PROMO,
            payload: { ...product, secretKey },
        }

        this._send(action);
    }

    onAddToCart(product: ProductData) {
        const action = {
            type: StatEventType.ADD_TO_CART,
            payload: { ...product },
        }

        this._send(action);
    }

    onOrder(products: ProductData[]) {
        const action = {
            type: StatEventType.PURCHASE,
            payload: { 
                orderId: genUUID(),
                totalPrice: products.reduce((acc, product) => (acc += product.salePriceU), 0),
                productIds: products.map(product => product.id),
             }
        }

        return this._send(action);
    }

    private async _send(data: StatBody) {
        const dataToSend: StatBodySent = {
            ...data,
            timestamp: new Date().getTime(),
        };

        return fetch('/api/sendEvent', {
            method: 'POST',
            body: JSON.stringify(dataToSend)
        });
    }

    private _isEmpty(field: any) {
        if (!field) return true;

        if (Array.isArray(field) || typeof field === 'string') {
            return field.length === 0;
        } else if (typeof field === 'object' && field !== null) {
            return Object.keys(field).length === 0;
        } else {
            return false;
        }
    }
}

export const statsService = new StatsService();