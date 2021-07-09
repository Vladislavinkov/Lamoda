"use strict";

let hash = location.hash.substring(1); // сохраняем ссылку на страницу

//  делаем отброжение города
const headerCityButton = document.querySelector('.header__city-button'); // получаем кнпку город


const cartListGoods = document.querySelector('.cart__list-goods'); // получаем корзину
const cartTotalCost = document.querySelector('.cart__total-cost'); // получаем цену
// if (localStorage.getItem('lomoda-location')){ // проверяем если в хранилище данные
//     headerCityButton.textContent = localStorage.getItem('lomoda-location'); // выводим данные города из хранилища браузера на страницу
// }



const updateLocation = () => {
    const lsLocation = localStorage.getItem('lomoda-location');
    headerCityButton.textContent = lsLocation && lsLocation !== 'null' ?
     lsLocation : 
     'Ваш город?';


}

updateLocation();

headerCityButton.addEventListener('click', () => {
    const city = prompt('Укажите ваш город').trim();
    if(city !== null){
        localStorage.setItem('lomoda-location', city); // записываем введеный город в хранилише браузера по ключу lomoda-location
    } 
    updateLocation();
});

// записываем данные корзины в local Storage в нужном формате
const getLocalStorage = () => JSON?.parse(localStorage.getItem('cart-lomoda')) || [];
const setLocalStorage = data => localStorage.setItem('cart-lomoda', JSON.stringify(data));

// вставка верстки корзины
const renderCart = () => {
    cartListGoods.textContent = '';

    const cartItems = getLocalStorage(); // получаем данные для корзины из localStorege

    let totalPrice = 0; // цена товара изначально

    cartItems.forEach((item, i) => {

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${i + 1}</td>
            <td>${item.brand} ${item.name}</td>
            ${item.color ? `<td>${item.color}</td>` : `<td>-</td>`}
            ${item.size ? `<td>${item.size}</td>` : `<td>-</td>`}
            <td>${item.cost} &#8381;</td>
            <td><button class="btn-delete" data-id="${item.id}">&times;</button></td>
        `;

        totalPrice += item.cost; // подсчитываем общую цену
        cartListGoods.append(tr); // выводим верстку корзины на страницу
    });
    cartTotalCost.textContent = `${totalPrice} ₽`; // выводим цену на страницу
};

const deleteItemCart = id => { // функция удаления элементов из корзины через local Storege
    const cartItems = getLocalStorage();
    const newCartItems = cartItems.filter(item => item.id !== id);
    setLocalStorage(newCartItems);
}



// отключение скрола

const disabledScroll = () => {

    if(document.disabledScroll) return;

    const widthScroll = window.innerWidth - document.body.offsetWidth; // вычесляем ширину скрола 
    document.disabledScroll = true;
    document.body.dbScrollY = window.scrollY; // убираем отмотку вверх страницы
    document.body.style.cssText = `
        position: fixed;
        top: ${-window.scrollY}px;
        left: 0;
        width: 100%;
        height: 100vh;
        overflow: hidden;
        padding-right: ${widthScroll}px;
    
    `;
};

const enabeleScroll = () => {
    document.disabledScroll = false;
    document.body.style.cssText = '';
    window.scroll({ // оставляем прокрутку там же где она и была при закрытии модального окна
        top: document.body.dbScrollY,
    })
};

// модальное окно (корзина)

const subheaderCart = document.querySelector('.subheader__cart'); // получаем кнопку корзина
const cartOverlay = document.querySelector('.cart-overlay'); // получаем модальное окно


const cartModalOpen = () => {
    cartOverlay.classList.add('cart-overlay-open'); // добовляем класс модальному окну (открываем)
    disabledScroll();
    renderCart();
};

const cartModalClose = () => {
    cartOverlay.classList.remove('cart-overlay-open'); // убираем класс модальному окну (закрываем)
    enabeleScroll();
};

subheaderCart.addEventListener('click', cartModalOpen);  // отслеживаем нажатие на кнопку корзина

cartOverlay.addEventListener('click', event => { // отслеживаем место клика
    const target = event.target;
    if(target.classList.contains('cart__btn-close') || target.classList.contains('cart-overlay')){ // проверяем клик или по кнопке закрыть либо вне модального окна
        cartModalClose();
    }
});

// запрос на базу данных

const getData = async () => { // сделали запрос на сервер
    const data = await fetch('db.json');

    if(data.ok) {
        return data.json()
    } else{
        throw new Error(`Данные не были получены, ощибка ${data.status} ${data.statusText}`);
    }
};

const getGoods = (callback, prop, value) => {  // получили данные и обработали
        getData()             // унивкрсальная функция обработки запроса
        .then( data => {
            if(value){
                callback(data.filter(item => item[prop] === value)); // фильтруем товар по категориям
            } else{
                callback(data);
            }
            
    }) .catch(err => {
        console.log(err);
    });

};

// getGoods((data) => {
//     console.warn(data)
// })

cartListGoods.addEventListener('click', e => { // отслеживаем нажатие на кнопку удалить товар в самой корзине
    if (e.target.matches('.btn-delete')) {
        deleteItemCart(e.target.dataset.id);
        renderCart();
    }
});

// вывод карточек товаров
// работа скрипьа только на странице товара

try{
    const goodsList = document.querySelector('.goods__list');
    if(!goodsList){
        throw 'This is not page!';
    }

    const goodsTitle = document.querySelector('.goods__title');

    const changeTitle = () => { // функция обновления заголовка
        goodsTitle.textContent = document.querySelector(`[href*="#${hash}"]`).textContent;
    }

   

    const createCart = ({ id,  preview, cost, brand, name, sizes }) => { // формируем карточку товара

        const li = document.createElement('li');
        li.classList.add('goods__item');

        li.innerHTML = `
                <article class="good">
                    <a class="good__link-img" href="card-good.html#${id}">
                        <img class="good__img" src="goods-image/${preview}" alt="">
                    </a>
                    <div class="good__description">
                        <p class="good__price">${cost} &#8381;</p>
                        <h3 class="good__title">${brand} <span class="good__title__grey">/ ${name}</span></h3>
                        ${sizes ? 
                            `<p class="good__sizes">Размеры (RUS): <span class="good__sizes-list">${sizes.join(' ')}</span></p>`
                            : '' }
                        <a class="good__link" href="card-good.html#${id}">Подробнее</a>
                    </div>
                </article>
        `;

        return li;
    }
            
    const renderGoodsList = data => { // рендерим карточки товара с сервера 
        goodsList.textContent = ''; // очищаем страницу

        data.forEach(item => { // пребераем масив
            const card = createCart(item);
            goodsList.append(card);
        });
    };

    window.addEventListener('hashchange', () => { // обновление страницы с товарами без презагрузки
        hash = location.hash.substring(1);
        getGoods(renderGoodsList, 'category', hash);
        changeTitle();
    })
    changeTitle();
    getGoods(renderGoodsList, 'category', hash);


} catch (err){
    console.warn(err);
};

// страница товара

try{

    if(!document.querySelector('.card-good')){
        throw 'This is not a card good';
    }

    const cardGoodImage = document.querySelector('.card-good__image');
    const cardGoodBrand = document.querySelector('.card-good__brand');
    const cardGoodTitle = document.querySelector('.card-good__title');
    const cardGoodPrice = document.querySelector('.card-good__price');
    const cardGoodColor = document.querySelector('.card-good__color');
    const cardGoodSelectWrapper = document.querySelectorAll('.card-good__select__wrapper');
    const cardGoodColorList = document.querySelector('.card-good__color-list');
    const cardGoodSizes = document.querySelector('.card-good__sizes');
    const cardGoodSizesList = document.querySelector('.card-good__sizes-list');
    const cardGoodBuy = document.querySelector('.card-good__buy');

    
    // добовляем элементы li на страницу      
    const  generateList = data => data.reduce((html, item, i) => 
        html + `<li class="card-good__select-item" data-id="${i}">${item}</li>`, '');
    

    const renderCartGood = ([{ id, photo, cost, brand, name, sizes, color}]) => {
        
        const data = { brand, name, cost, id }; // объект с товаром для корзины

        cardGoodImage.src = `goods-image/${photo}`;
        cardGoodImage.alt = `${brand} ${name}`;
        cardGoodBrand.textContent = brand;
        cardGoodTitle.textContent = name;
        cardGoodPrice.textContent = `${cost} ₽`;
        if(color){
            cardGoodColor.textContent = color[0];
            cardGoodColor.dataset.id = 0;
            cardGoodColorList.innerHTML = generateList(color);
        } else{
            cardGoodColor.style.display = 'none';
        }
        if(sizes){
            cardGoodSizes.textContent = sizes[0];
            cardGoodSizes.dataset.id = 0;
            cardGoodSizesList.innerHTML = generateList(sizes);
        } else{
            cardGoodSizes.style.display = 'none';
        }

        // обработка корзины

        if (getLocalStorage().some(item => item.id === id)) { // ищем товар по id из local Storege
            cardGoodBuy.classList.add('delete');
            cardGoodBuy.textContent = 'Удалить из корзины';
        }

        cardGoodBuy.addEventListener('click', () => { // отслеживаем нажатие на кнопку добавить корзину
 
            if (cardGoodBuy.classList.contains('delete')) {
                deleteItemCart(id);
                cardGoodBuy.classList.remove('delete');
                cardGoodBuy.textContent = 'Добавить в корзину';
                return;
            }
            if (color) data.color = cardGoodColor.textContent;
            if (sizes) data.size = cardGoodSizes.textContent;

            cardGoodBuy.classList.add('delete');
            cardGoodBuy.textContent = 'Удалить из корзины';

            const cardData = getLocalStorage(); // получение и отправление данных корзины из local Storedge
            cardData.push(data);
            setLocalStorage(cardData);
        });
       
    };
    // обработка выподающих списков
    cardGoodSelectWrapper.forEach(item => {
        item.addEventListener('click', (e) =>  {
            const target = e.target;
            if(target.closest('.card-good__select')){
                target.classList.toggle('card-good__select__open');
            }
            if(target.closest('.card-good__select-item')){
                const cartGoodSelect = item.querySelector('.card-good__select');
                cartGoodSelect.textContent = target.textContent;
                cartGoodSelect.dataset.id = target.dataset.id;
                cartGoodSelect.classList.remove('card-good__select__open');
            }
        });
    });

    getGoods(renderCartGood, 'id', hash);

} catch(err){
    console.warn(err);
};