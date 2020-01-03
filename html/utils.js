window.toggle = (el, val) => {
    el.style.display = val ? "block" : "none";
}

window.hexToRGBArray = (hexColor) => {
    let hexToDec = offset => parseInt(hexColor.replace("#", "").substr(offset, 2), 16);

    return {
        r: hexToDec(0),
        g: hexToDec(2),
        b: hexToDec(4),
        a: 1
    };
}