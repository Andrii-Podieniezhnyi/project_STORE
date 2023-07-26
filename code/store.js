import { dataStore } from "./data-store.js";

const storeEl = dataStore.map(({id, productImage, productName, productDescription, productPrice, currencyUnits}) => {
    return `
    <div class="storeCard">
        <div class="img_box">
            <img src="${productImage}">
        </div> 
        <div class="card_info">
            <div class="card_title">${productName}${productDescription}</div>
        </div>
        <div class="store_Card_price">${productPrice}<span>${currencyUnits}</span>
            <div class="btns_block">
                <div class="btn_plus_minus_value_block">
                    <button class="btn_minus">&#8722;</button>
                        <input type="text" class="addToCart_value" value="">
                    <button class="btn_plus">&#43;</button>
                </div>
                <button id="${id}" class="btn_add_toCart"><img src="./img/ico/shopping-cart-add_ico.svg" alt="shopping-cart-add"></button>
            </div>
        </div>
    </div>
    `
}).join("")

document.querySelector(".storeBox")
    .insertAdjacentHTML("beforeend", storeEl);


// реалізація пульсуючого кола


document.getElementById("scrollDown").addEventListener("click", function(){
    const targetElement = document.getElementById("targetSection");
    const targetPosition = targetElement.offsetTop;

    window.scrollTo({
        top: targetPosition,
        behavior: "smooth"
    })
})

// реалізація загальної суми товарів в кошику , додавання продуктів до кошику, видалення, кількість позицій ...

class Cart {
    constructor() {
      this.prodInCart = [];
      this.totalPriceValue = 0;
      this.totalPriceSpan = document.querySelector(".price");
    }
  
    addToCart(objFromId) {
      this.prodInCart.push(objFromId);
      const price = parseFloat(objFromId.productPrice);
      this.totalPriceValue += price;
      this.totalPriceSpan.textContent = this.totalPriceValue.toFixed(2);
    }
  
    removeFromCart(el) {
      const removeProdIndex = this.prodInCart.findIndex(obj => obj.id === el.id);
      if (removeProdIndex !== -1) {
        const removedProduct = this.prodInCart.splice(removeProdIndex, 1)[0];
        const price = parseFloat(removedProduct.productPrice);
        this.totalPriceValue -= price;
        this.totalPriceSpan.textContent = this.totalPriceValue.toFixed(2);
      }
    }
  
    updateCartItemCount(el) {
      const input_value = el.parentNode.childNodes[1].childNodes[3];
      const cartById = this.prodInCart.filter(obj => obj.id === el.id);
      input_value.value = cartById.length;
    }

    modalCartItemTotalPrice(el){
      const cartById = this.prodInCart.filter(obj => obj.id === el.id);
      let totalPriceUniqueIds = cartById.reduce((a, b) => a + +(b.productPrice), 0);
      const divModalTotalProdPrice = el.parentElement.parentElement.childNodes[3];
        divModalTotalProdPrice.textContent = totalPriceUniqueIds.toFixed(2);
        divModalTotalProdPrice.insertAdjacentHTML("beforeend", "<span>грн</span>");

        if (divModalTotalProdPrice.textContent === "0.00грн") {
          const cartItem = el.parentElement.parentElement.parentElement.parentElement;
          cartItem.classList.add("hidden");

          setTimeout(() => {
            cartItem.parentNode.removeChild(cartItem)            
          }, 500);
        }
    }

    uniqueProdInCart(){
        const uniqueProdInCart = document.querySelector(".unique_prod_in_cart");
        uniqueProdInCart.classList.remove("not_visible");
        uniqueProdInCart.classList.add("visible");
        const uniqueIds = [...new Set(this.prodInCart.map(item => item.id))];
        uniqueProdInCart.textContent = uniqueIds.length;
        if (uniqueIds.length === 0 ) {
            uniqueProdInCart.classList.remove("visible");
            uniqueProdInCart.classList.add("not_visible");
        }  
    }

    totalPriceVisibility(){
        const epsilon = 0.000001;
        const totalPriceHeader = document.querySelector(".total_price");
        if (Math.abs(this.totalPriceValue) > epsilon) {
            totalPriceHeader.classList.remove("not_visible");
            totalPriceHeader.classList.add("visible"); 
        } else {
            totalPriceHeader.classList.remove("visible");
            totalPriceHeader.classList.add("not_visible");                                                          
        }
    }

    showNotification(message, duration){
        const notification = document.querySelector(".notification");
        notification.textContent = message;
        notification.classList.add("show");

        const imgCartUrl = "./img/ico/cart.png";
        const img = document.createElement("img");
        img.src = imgCartUrl;
        notification.prepend(img); 
        

        setTimeout(() => {
            notification.classList.remove("show");
        }, duration);
    }

    updateModalTotalAmount(){
      const modalTotalAmount = document.querySelector(".total_amount");
      modalTotalAmount.textContent = cart.totalPriceValue.toFixed(2);
    }

    updateMainPageCartItemInputValue(el){
      const id = el.id;
      const elementOnPage = document.querySelector(`[id="${id}"]`); // Знаходимо елемент на початковій сторінці за його id
      const input = elementOnPage.parentElement.childNodes[1].childNodes[3];
      const prodById = this.prodInCart.filter(obj => obj.id === el.id);
      input.value = prodById.length;
      const btn_plus_minus_value_block = elementOnPage.parentNode.childNodes[1];
  
      if (input.value === "0") {
        elementOnPage.classList.remove("not_visible");
        elementOnPage.classList.add("visible");
        btn_plus_minus_value_block.classList.remove("visible");
        btn_plus_minus_value_block.classList.add("not_visible");
      }
    }

    updateModalIfNothingInCart(){
      if (cart.prodInCart.length === 0) {
        cartPopupTop.innerHTML = "";
        modalContent.innerHTML = "";
        cartPopupBottom.innerHTML = "";
        showModal();
      }
    }
}
  
  const cart = new Cart();
  
  const allBtns_btnAddToCart = document.querySelectorAll(".btn_add_toCart");

  allBtns_btnAddToCart.forEach(el => {
    el.addEventListener("click", function () {
      const objFromId = dataStore.find(obj => obj.id === el.id);
      cart.addToCart(objFromId);
  
      el.classList.remove("visible");
      el.classList.add("not_visible");
  
      const btn_plus_minus_value_block = el.parentNode.childNodes[1];
      btn_plus_minus_value_block.classList.add("visible");
  
      cart.updateCartItemCount(el);
      cart.uniqueProdInCart();
      cart.totalPriceVisibility();
      cart.showNotification("Товар додано у кошик", 1300);
    });
  
    const btn_plus_minus_value_block = el.parentNode.childNodes[1];
    btn_plus_minus_value_block.addEventListener("click", function (e) {
      if (e.target.classList.contains("btn_minus")) {
        cart.removeFromCart(el);
        cart.uniqueProdInCart();
        cart.updateCartItemCount(el);
        cart.totalPriceVisibility();
        cart.showNotification("Товар видалено з кошику", 1300);
      }
  
      if (e.target.classList.contains("btn_plus")) {
        const objFromId = dataStore.find(obj => obj.id === el.id);
        cart.addToCart(objFromId);
        cart.updateCartItemCount(el);
        cart.showNotification("Товар додано у кошик", 1300);
      }
      cart.updateMainPageCartItemInputValue(el);
    });
  });
  
// 

// реалізація модального вікна 

const modalContent = document.querySelector(".cart_popup__content");
const cartPopupTop = document.querySelector(".cart_popup__top");
const cartPopupBottom = document.querySelector(".cart_popup__bottom");





function showModal() {
  const modalOverlay = document.querySelector(".modal_overlay");
        modalOverlay.classList.remove("not_visible");
        modalOverlay.classList.add("visible");
  const modal = document.querySelector(".cart_popup");
  const popupContainer =  document.querySelector(".cart_popup__container").classList.add("animation__for__card_popup");
  modal.classList.remove("not_visible");
  document.body.style.overflow = "hidden";

  if (cart.prodInCart.length == 0) {
    modalContent.innerHTML = "";
    modalContent.insertAdjacentHTML("beforeend", `
      <div class="modal__content_container_cart_zero">
        <div class="modal_img">
          <img src="./img/ico/empty-shopping-basket.png" alt="empty-shopping-basket">
        </div>
        <div class="title">
          <h2>Ваш кошик порожній, саме час закупитися!</h2>
        </div>
      </div>
    `) 
  } else {
    cartPopupTop.innerHTML = "";
    modalContent.innerHTML = "";
    cartPopupBottom.innerHTML = "";



    cartPopupTop.insertAdjacentHTML("beforeend",`
      <div class="cart_popup__top_title">Ви додали до кошика</div>
        <div class="cart_popup__top_controls">
            <span class="clear_shopping_cart">Очистити корзину</span>
        </div>
      </div> 
    `);
    
    modalContent.insertAdjacentHTML("beforeend", `
      <div class="cart_section__list">
        <div class="cart_list">
          <div class="cart_list__row"></div>
        </div>
      </div>
    `);

    cartPopupBottom.insertAdjacentHTML("beforeend", `
      <div class="cart_total__products">
        <div class="cart_total__price_name">До сплати
        :</div>
        <span class="total_amount"></span>
        <span>грн</span>
      </div>
      <div class="cart_total__send_order">
        <a href="#" onclick="return false" class="cart_total__order_link">Оформити замовлення</a>
      </div>
    `)

    const cartListRow = document.querySelector(".cart_list__row");

    const elForModal = [...new Set(cart.prodInCart.map(({id, productImage, productName, productDescription, productPrice, currencyUnits}) => {
      return `
        <div class="cart_item fade_out">
          <div class="modal__card">
                <div class="img_box">
                    <img src="${productImage}">
                </div> 
                <div class="modal__card_info">
                    <div class="modal__prod_name">${productName}${productDescription}</div>
                </div>
                <div class="modal__prod_price">${productPrice}<span>${currencyUnits}</span>
                  <div class="modal__total_prod_price"></div>
                  <div class="modal__btns_block">
                      <div class="modal__btn_plus_minus_value_block">
                          <button class="btn_minus">&#8722;</button>
                          <input type="text" class="addToCart_value" value="">
                          <button class="btn_plus">&#43;</button>
                      </div>
                      <button id="${id}" class="btn_delete_prod_from_cart__modal"><img src="./img/ico/bin.png" alt="bin"></button>
                  </div>
                </div>
            </div>
        </div>
      `
    }))
    
    ].join("")

    cartListRow.insertAdjacentHTML("beforeend", elForModal);
  }


  if (document.querySelector(".clear_shopping_cart") != null) {
    document.querySelector(".clear_shopping_cart").addEventListener("click", clearShoppingCart);  
  }





    const allModalBin = document.querySelectorAll(".btn_delete_prod_from_cart__modal");

    allModalBin.forEach(el => {
//   видалення продуктів корзиною (з одним id)     
      el.addEventListener("click", function () {
        const cartItem = el.parentElement.parentElement.parentElement.parentElement;
        const allProdOneId = cart.prodInCart.filter(obj => obj.id === el.id);

        // визначення суми всих унікальних продуктів що видаляються

        let cartById = cart.prodInCart.filter(obj => obj.id === el.id);
        let totalPriceUniqueIds = cartById.reduce((a, b) => a + +(b.productPrice), 0);
        
        // визначення різниці суми всього кошика та суми всих унікальних продуктів що видаляються
        
        cart.totalPriceValue = cart.totalPriceValue - totalPriceUniqueIds;
        cart.totalPriceSpan.textContent = cart.totalPriceValue.toFixed(2);
        cart.totalPriceVisibility();
        //

        allProdOneId.forEach(el => {
          let index = cart.prodInCart.findIndex(obj => obj.id === el.id);

          while (index != -1) {
            cart.prodInCart.splice(index, 1);
            index = cart.prodInCart.findIndex(obj => obj.id === el.id);
          }
        })

        cartItem.classList.add("hidden");
    
        setTimeout(() => {
          cartItem.parentNode.removeChild(cartItem)            
        }, 500);

        cart.uniqueProdInCart();
        cart.updateModalTotalAmount();
        cart.updateMainPageCartItemInputValue(el);

       cart.updateModalIfNothingInCart();
      })




      cart.updateCartItemCount(el);
      cart.modalCartItemTotalPrice(el);
      cart.updateModalTotalAmount(); 



//   модальні кнопки  плюс та мінус
      const modalBtnPlusMinusValueBlock = el.parentElement.childNodes[1];

      modalBtnPlusMinusValueBlock.addEventListener("click", function (e) {
        if (e.target.classList.contains("btn_minus")) {
          cart.removeFromCart(el);
          cart.uniqueProdInCart();
          cart.updateCartItemCount(el);
          cart.totalPriceVisibility();
          cart.modalCartItemTotalPrice(el);
          cart.updateModalTotalAmount();
          cart.updateMainPageCartItemInputValue(el);
          cart.updateModalIfNothingInCart();
        }

        if (e.target.classList.contains("btn_plus")) {
          const objFromId = dataStore.find(obj => obj.id === el.id);
          cart.addToCart(objFromId);
          cart.updateCartItemCount(el);
          cart.modalCartItemTotalPrice(el);
          cart.updateModalTotalAmount();
          cart.updateMainPageCartItemInputValue(el);
        }
      })
//      
    })
    
}
  


    
function hideModal() {
  const modalOverlay = document.querySelector(".modal_overlay")
        modalOverlay.classList.add("not_visible");
        modalOverlay.classList.remove("visible");
  const modal = document.querySelector(".cart_popup");
  document.querySelector(".cart_popup__container").classList.remove("animation__for__card_popup");
  modal.classList.add("not_visible");
  document.body.style.overflow = "";
  cartPopupTop.innerHTML = "";
  cartPopupBottom.innerHTML = "";
}

//   функція очищення корзини через модальне вікно при натисненні "Очистити корзину"

function clearShoppingCart() {   
  cart.prodInCart = [];
  cart.totalPriceValue = 0;
  cartPopupTop.innerHTML = "";
  modalContent.innerHTML = "";
  cartPopupBottom.innerHTML = "";
  cart.totalPriceVisibility();
  cart.uniqueProdInCart();

  const allBtnsPlusMinusValueBlock = document.querySelectorAll(".btn_plus_minus_value_block");
        allBtnsPlusMinusValueBlock.forEach(element => {
          element.classList.remove("visible");
        })

        allBtns_btnAddToCart.forEach(element  => {
          element.classList.remove("not_visible");
        })
  showModal();
}

//

document.querySelector(".total_price_block").addEventListener("click", showModal);

document.querySelector(".hide_modal_btn").addEventListener("click", hideModal);