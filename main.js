let currencyHistory = [];
const API_KEY = 'a9f1982c9be525171a69931adf9afd17';
const API_BASE = `http://data.fixer.io/api/latest?access_key=${API_KEY}`;
const STORAGE_HISTORY_KEY = "xeu.history"

async function getExchange() {
    const query = document.querySelector('#currency').value;
    let symbols = "EUR,";
    let selecteds = document.getElementsByClassName("selected");
    for (let i = 0; i < selecteds.length; i++) {
        symbols += selecteds[i].id + ",";
    }
    
    try {
        const response = await fetch(`${API_BASE}&symbols=${symbols}&format=1`);
        if (!response.ok) {
            return
        }
       
        const {rates} = await response.json();
        
        updateHistory(rates)

        for (const key in rates) {            
            rates[key] = rates[key] * query;
        }
                
        addCurrencyToMarkupSelector(rates, '#exchanges')
    } catch (error) {
        console.log('🚨 Error', error);
    }
}

function addTableMarkup(objCurrency) {
    console.log(objCurrency);
    
    return `
    <table class="table is-bordered is-striped is-narrow is-hoverable is-fullwidth">
        <thead>
            <tr id="convert-table-name">
              ${Object.keys(objCurrency).map(function(key) {return `<td>${key}</td>`}).join('')}
            </tr>
        </thead>
        <tbody>
           <tr id="convert-table-value" class="table-bg-red">
               ${Object.keys(objCurrency).map(function(key) {return `<th>${objCurrency[key]}</th>`}).join('')}
           </tr> 
        </tbody>
    </table>
    `
}

function updateHistory(arrayCurrency) {  
    currencyHistory = currencyHistory.concat(arrayCurrency);
    addTableMarkup(arrayCurrency, '#history');
    localStorage.setItem(STORAGE_HISTORY_KEY, JSON.stringify(currencyHistory))

}

function addCurrencyToMarkupSelector(objCurrency, selector) {
    let el = document.querySelector(selector);
    el.innerHTML = addTableMarkup(objCurrency) + el.innerHTML;
}

async function installServiceWorkerAsync() {
    let storage = JSON.parse(localStorage.getItem(STORAGE_HISTORY_KEY));
    if (storage) {
        currencyHistory = storage;
        currencyHistory.forEach(element => {
            addCurrencyToMarkupSelector(element, "#history");
        });
    }
    if ("serviceWorker" in navigator) {
        try {
            const sw = await navigator.serviceWorker.register('/service-worker.js');
            console.log('service registered: ', sw);

        } catch (err) {
            console.log(`failed to install sw . ERROR : ${err}`);

        }
    }
}

document.addEventListener("DOMContentLoaded", function (event) {
    document.querySelector("#currency").addEventListener("keyup", (event) => {
        if (event.keyCode === 13) {
            event.preventDefault();
            document.querySelector("#button-search").click();
        }
    });
    installServiceWorkerAsync()
});

document.addEventListener('click', function (event) {
    if (!event.target.matches('.moneybtn')) return;
    event.target.classList.toggle('selected');
}, false);