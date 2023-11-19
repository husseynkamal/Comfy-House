const cartBtn = document.querySelector(".cart-btn");
const closeCartBtn = document.querySelector(".close-cart");
const clearCartBtn = document.querySelector(".clear-cart");
const cartDOM = document.querySelector(".cart");
const cartOverlay = document.querySelector(".cart-overlay");
const cartItems = document.querySelector(".cart-items");
const cartTotal = document.querySelector(".cart-total");
const cartContent = document.querySelector(".cart-content");
const productsDOM = document.querySelector(".products-center");

let cart = [];

let buttonsDOM = [];

class Products {
  async getProducts() {
    try {
      const result = await fetch("products.json");
      const data = await result.json();
      let products = data.items;
      products = products.map((item) => {
        const { title, price } = item.fields;
        const { id } = item.sys;
        const image = item.fields.image.fields.file.url;
        return { title, price, id, image };
      });
      return products;
    } catch (error) {
      throw new Error(error);
    }
  }
}

class UI {
  startShopping() {
    const shopButton = document.querySelector(".banner-btn");
    const title = document.querySelector(".products .section-title h2");
    shopButton.addEventListener("click", () => {
      window.scrollTo({
        top: title.offsetTop - 55,
        behavior: "smooth",
      });
    });
  }

  displayProducts(products) {
    let result = "";
    products.forEach((product) => {
      result += `
        <!-- Single product -->
        <article class="product">
          <div class="img-container">
            <img src=${product.image} alt="product" class="product-img">
            <button class="bag-btn" data-id=${product.id}>
              <i class="fas fa-shopping-cart"></i>
              add to cart
            </button>
          </div>
          <h3>${product.title}</h3>
          <h4>$${product.price}</h4>
        </article>
        <!-- End of single product -->
      `;
    });
    productsDOM.innerHTML = result;
  }

  getBagButtons() {
    const buttons = [...document.querySelectorAll(".bag-btn")];
    buttonsDOM = buttons;
    buttons.forEach((button) => {
      const id = button.dataset.id;
      const productInCart = cart.find((item) => item.id === id);
      if (productInCart) {
        button.innerText = "In Cart";
        button.disabled = true;
        button.style.cursor = "not-allowed";
      }
      button.addEventListener("click", (e) => {
        e.target.innerText = "In Cart";
        e.target.disabled = true;
        e.target.style.cursor = "not-allowed";

        const cartItem = { ...Storage.getProduct(id), amount: 1 };

        cart = [...cart, cartItem];
        Storage.saveCart(cart);
        this.setCartValues(cart);
        this.addToCart(cartItem);
        this.showCart();
      });
    });
  }

  setUpApp() {
    cart = Storage.getCart();
    this.setCartValues(cart);
    this.populateCart(cart);
    cartBtn.addEventListener("click", this.showCart);
    closeCartBtn.addEventListener("click", this.hideCart);
    document.addEventListener("click", (e) => {
      const isOverlay = e.target.classList.contains("cart-overlay");
      if (isOverlay) this.hideCart();
    });
  }

  populateCart(cart) {
    cart.forEach((item) => this.addToCart(item));
  }

  setCartValues(cart) {
    let totalAmount = 0;
    let totalItems = 0;
    cart.forEach((item) => {
      totalAmount += item.price * item.amount;
      totalItems += item.amount;
    });
    cartTotal.innerText = parseFloat(totalAmount.toFixed(2));
    cartItems.innerText = totalItems;
  }

  addToCart(item) {
    const div = document.createElement("div");
    div.classList.add("cart-item");
    div.innerHTML = `
      <img src=${item.image} alt="product">
      <div>
        <h4>${item.title}</h4>
        <h5>$${item.price}</h5>
        <span class="remove-item" data-id=${item.id}>remove</span>
      </div>
      <div>
        <i class="fas fa-chevron-up" data-id=${item.id}></i>
        <p class="item-amount">${item.amount}</p>
        <i class="fas fa-chevron-down" data-id=${item.id}></i>
      </div>
    `;
    cartContent.appendChild(div);
  }

  removeFromCart(id) {
    cart = cart.filter((item) => item.id !== id);
    this.setCartValues(cart);
    Storage.saveCart(cart);

    const button = this.getSingleButton(id);
    button.disabled = false;
    button.style.cursor = "pointer";
    button.innerHTML = `<i class="fas fa-shopping-cart"></i>add to cart`;
  }

  cartLogic() {
    clearCartBtn.addEventListener("click", () => {
      this.clearCart();
    });

    cartContent.addEventListener("click", (event) => {
      if (event.target.classList.contains("remove-item")) {
        const removedItem = event.target;
        const id = removedItem.dataset.id;

        cartContent.removeChild(removedItem.parentElement.parentElement);
        this.removeFromCart(id);
      } else if (event.target.classList.contains("fa-chevron-up")) {
        const addAmount = event.target;
        const id = addAmount.dataset.id;

        const existingItem = cart.find((item) => item.id === id);
        existingItem.amount += 1;

        Storage.saveCart(cart);
        this.setCartValues(cart);

        addAmount.nextElementSibling.innerText = existingItem.amount;
      } else if (event.target.classList.contains("fa-chevron-down")) {
        const lowerAmount = event.target;
        const id = lowerAmount.dataset.id;

        const existingItem = cart.find((item) => item.id === id);
        existingItem.amount -= 1;

        if (existingItem.amount > 0) {
          Storage.saveCart(cart);
          this.setCartValues(cart);
          lowerAmount.previousElementSibling.innerText = existingItem.amount;
        } else {
          this.removeFromCart(id);
          cartContent.removeChild(lowerAmount.parentElement.parentElement);
        }
      }
    });
  }

  clearCart() {
    const cartItems = cart.map((item) => item.id);
    cartItems.forEach((id) => this.removeFromCart(id));
    while (cartContent.children.length > 0) {
      cartContent.removeChild(cartContent.children[0]);
    }
    this.hideCart();
  }

  getSingleButton(id) {
    return buttonsDOM.find((button) => button.dataset.id === id);
  }

  showCart() {
    cartOverlay.classList.add("transparentBcg");
    cartDOM.classList.add("showCart");
  }

  hideCart() {
    cartOverlay.classList.remove("transparentBcg");
    cartDOM.classList.remove("showCart");
  }
}

class Storage {
  static saveProducts(products) {
    localStorage.setItem("products", JSON.stringify(products));
  }

  static getProduct(id) {
    const products = JSON.parse(localStorage.getItem("products"));
    return products.find((product) => product.id === id);
  }

  static saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }

  static getCart() {
    return JSON.parse(localStorage.getItem("cart")) || [];
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const ui = new UI();
  const products = new Products();

  ui.setUpApp();

  products
    .getProducts()
    .then((products) => {
      ui.displayProducts(products);
      Storage.saveProducts(products);
    })
    .then(() => {
      ui.getBagButtons();
      ui.cartLogic();
      ui.startShopping();
    });
});
