import { Component } from '../component';
import { Product } from '../product/product';
import html from './favorite.tpl.html';
import { favService } from '../../services/fav.service';
import { ProductData } from 'types';

class Favorite extends Component {
  products!: ProductData[];

  async render() {
    this.products = await favService.get();

    if (this.products.length < 1) {
      this.view.root.classList.add('is__empty');
      return;
    }

    this.products.forEach((product) => {
      const productComp = new Product(product);
      productComp.render();
      productComp.attach(this.view.favItems);
    });
  }
}

export const favoriteComp = new Favorite(html);
