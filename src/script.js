// Currencies object
const currencies = {
    tokens: [
        {
            image: "bitcoin.webp",
            name: "BTC",
            id: "bitcoin",
        },
        {
            image: "eth.webp",
            name: "ETH",
            id: "ethereum",
        },
        {
            image: "litecoin.webp",
            name: "LTC",
            id: "litecoin",
        },
        {
            image: "bnb.webp",
            name: "BNB",
            id: "binancecoin",
        },
    ],
    fiat: [
        {
            image: "dollar.webp",
            name: "USD",
        },
        {
            image: "hryvna.webp",
            name: "UAH",
        },
    ],
};

// Some variables
const ENDPOINT = "https://api.coingecko.com/api/v3";
const CURRENCIES_ASSETS = "../assets/currencies/";
let changeTimeout = null;
let isSelectedFrom = true;
let selectedSelect = null;

let selectedFromCurr = currencies.tokens[0];
let selectedToCurr = currencies.fiat[0];

// Fetch request to coingecko
const getCourse = async (coinId, vsCurr) => {
    let data = await fetch(ENDPOINT + "/simple/price?ids=" + coinId + "&vs_currencies=" + vsCurr, {
        headers: {
            accept: "application/json",
        },
    });
    data = await data.json();
    return data[coinId]?.[vsCurr];
};

// Calculate price
const calculatePrice = async () => {
    const fromAmount = document.getElementById("from_val").value;
    const toAmount = document.getElementById("to_val");

    if (fromAmount !== "" && fromAmount !== 0) {
        const fromCurr = selectedFromCurr.id ?? selectedFromCurr.name.toLowerCase();

        if(fromCurr === 'uah') {
            const course = await getCourse(selectedToCurr.id ?? selectedToCurr.name.toLowerCase(), fromCurr);
            if (course) {
                toAmount.value = (fromAmount / course).toFixed(3);
            } else {
                toAmount.value = 0;
            }
        } else {
            course = await getCourse(fromCurr, selectedToCurr.name.toLowerCase());
            if (course) {
                toAmount.value = (course * fromAmount).toFixed(3);
            } else {
                toAmount.value = 0;
            }
        }
    } else {
        toAmount.value = 0;
    }
};

// Handle changing currency or value
const handleChange = () => {
    if (changeTimeout) {
        clearTimeout(changeTimeout);
    }
    changeTimeout = setTimeout(calculatePrice, 500);
};

const handleDropdownClickToFreeSpace = (e) => {
    let paths = e.path;
    if (!paths) {
        paths = e.composedPath ? e.composedPath() : null;
    }

    if (paths) {
        for (let path of paths) {
            console.dir(path);
            if (path.localName === "body" || path.classList.contains("dropdown_container")) {
                handleDropdown();
                break;
            }
        }
    }
};

// Handle dropdown open/close
const handleDropdown = (rootId) => {
    const dropdown = document.getElementById("dropdown_container");
    if (rootId) {
        selectedSelect = rootId;
    }
    const root = document.getElementById(selectedSelect);

    if (dropdown && root) {
        // To open
        if (!dropdown.classList.contains("displayed")) {
            dropdown.style.top = root.offsetTop + root.offsetHeight + 5 + "px";
            root.classList.add("opened");
            dropdown.classList.add("displayed");
            setTimeout(() => {
                dropdown.classList.add("visible");
            }, 10);

            if (rootId === "from_cur") {
                isSelectedFrom = true;
            } else {
                isSelectedFrom = false;
            }

            document.addEventListener("click", handleDropdownClickToFreeSpace, {
                once: true,
                capture: true,
            });
            // To close
        } else {
            root.classList.remove("opened");
            dropdown.classList.remove("visible");
            setTimeout(() => {
                dropdown.classList.remove("displayed");
            }, 300);
        }
    }
};

// Change FROM curr
const changeFromCurr = (curr) => {
    selectedFromCurr = curr;
    const fromSelect = document.getElementById("from_cur");
    const fromImage = fromSelect.querySelector("img");
    fromImage.src = CURRENCIES_ASSETS + selectedFromCurr.image;
    const fromName = fromSelect.querySelector("span");
    fromName.innerText = selectedFromCurr.name;
};
// Change TO curr
const changeToCurr = (curr) => {
    selectedToCurr = curr;
    const toSelect = document.getElementById("to_cur");
    const toImage = toSelect.querySelector("img");
    toImage.src = CURRENCIES_ASSETS + selectedToCurr.image;
    const toName = toSelect.querySelector("span");
    toName.innerText = selectedToCurr.name;
};
// Handle select currency in dropdown
const handleDropdownSelect = (curr) => {
    if (isSelectedFrom === true) {
        if (selectedToCurr.name === curr.name) {
            changeToCurr(selectedFromCurr);
        }
        changeFromCurr(curr);
    } else {
        if(selectedFromCurr.name === curr.name) {
            changeFromCurr(selectedToCurr);
        }
        changeToCurr(curr);
    }
    calculatePrice();
};

// Setting all events
window.addEventListener("DOMContentLoaded", () => {
    // Display default currencies
    const fromSelect = document.getElementById("from_cur");
    const fromImage = fromSelect.querySelector("img");
    fromImage.src = CURRENCIES_ASSETS + selectedFromCurr.image;
    const fromName = fromSelect.querySelector("span");
    fromName.innerText = selectedFromCurr.name;

    const toSelect = document.getElementById("to_cur");
    const toImage = toSelect.querySelector("img");
    toImage.src = CURRENCIES_ASSETS + selectedToCurr.image;
    const toName = toSelect.querySelector("span");
    toName.innerText = selectedToCurr.name;

    // Setting dropdown currencies
    const dropdown = document.getElementById("dropdown_container");

    // Tokens
    const tokens = dropdown.querySelector(".tokens");
    currencies.tokens.forEach((token) => {
        const newToken = document.createElement("div");
        newToken.className = "token";

        const image = document.createElement("img");
        image.src = CURRENCIES_ASSETS + token.image;
        image.alt = token.image;
        newToken.appendChild(image);

        const name = document.createElement("span");
        name.innerText = token.name;
        newToken.appendChild(name);
        newToken.addEventListener("click", () => handleDropdownSelect(token));
        tokens.appendChild(newToken);
    });

    // Fiat
    const fiat = dropdown.querySelector(".fiat");
    currencies.fiat.forEach((fiatVar) => {
        const newToken = document.createElement("div");
        newToken.className = "token";

        const image = document.createElement("img");
        image.src = CURRENCIES_ASSETS + fiatVar.image;
        image.alt = fiatVar.image;
        newToken.appendChild(image);

        const name = document.createElement("span");
        name.innerText = fiatVar.name;
        newToken.appendChild(name);
        newToken.addEventListener("click", () => handleDropdownSelect(fiatVar));
        fiat.appendChild(newToken);
    });

    // Set change value handler
    document.getElementById("from_val").addEventListener("input", handleChange);
    document.getElementById("from_cur").addEventListener("click", () => handleDropdown("from_cur"));
    document.getElementById("to_cur").addEventListener("click", () => handleDropdown("to_cur"));
});
