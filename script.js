const ENDPOINT = "https://api.coingecko.com/api/v3";
let changeTimeout = null;

const getCourse = async (coinId) => {
    let data = await fetch(ENDPOINT + "/simple/price?ids=" + coinId + "&vs_currencies=usd", {
        headers: {
            accept: "application/json",
        },
    });
    data = await data.json();
    console.log(data);
    return data[coinId]?.usd;
};

const calculatePrice = async () => {
    const coinId = document.getElementById('from_cur').value;
    const priceText = document.getElementById('usd_price');
    const amount = document.getElementById('from_val').value;

    if(amount !== '' && amount !== 0) {
        const course = await getCourse(coinId);
    
        if(course) {
            priceText.innerText = (course * amount).toFixed(3);
        } else {
            priceText.innerText = 0;
        }
    } else {
        priceText.innerText = 0;
    }
};

const handleChange = () => {
    if(changeTimeout) {
        clearTimeout(changeTimeout);
    }
    changeTimeout = setTimeout(calculatePrice, 500);
}

window.addEventListener("DOMContentLoaded", async () => {
    document.getElementById("from_val").addEventListener("input", handleChange);
    document.getElementById("from_cur").addEventListener("change", handleChange);
});
