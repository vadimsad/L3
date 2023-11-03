import { Component } from '../component';
import { Product } from '../product/product';
import html from './checkout.tpl.html';
import { formatPrice } from '../../utils/helpers';
import { cartService } from '../../services/cart.service';
import { statsService } from '../../services/stats.service';
import { ProductData } from 'types';

class Checkout extends Component {
  products!: ProductData[];

  async render() {
    this.products = await cartService.get();

    if (this.products.length < 1) {
      this.view.root.classList.add('is__empty');
      return;
    }

    this.products.forEach((product) => {
      const productComp = new Product(product, { isHorizontal: true });
      productComp.render();
      productComp.attach(this.view.cart);
    });

    const totalPrice = this.products.reduce((acc, product) => (acc += product.salePriceU), 0);
    this.view.price.innerText = formatPrice(totalPrice);

    this.view.btnOrder.onclick = this._makeOrder.bind(this);
  }

  private async _makeOrder() {
    this._toggleLoading(true);

    await cartService.clear();
    fetch('/api/makeOrder', {
      method: 'POST',
      body: JSON.stringify(this.products)
    }).then(async (res) => {
      if (res.ok) {
        await statsService.onOrder(this.products, new Date().getTime());
        window.location.href = '/?isSuccessOrder';
      }
    }).catch((err) => {
      console.error(err);
    }).finally(() => {
      this._toggleLoading(false);
    });
  }

  private _toggleLoading(isLoading: boolean) {
    this.view.btnOrder.toggleAttribute('disabled', isLoading);
    this.view.loader.classList.toggle('hide', !isLoading);
  }
}

export const checkoutComp = new Checkout(html);
