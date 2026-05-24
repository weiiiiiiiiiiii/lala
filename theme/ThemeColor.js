

const themeColor = {
    light: {
        header: "#A79E8D",
        BG: "#C1B69C",
        profileTop: "#D8D1B9",
        windows_actionBG: "#FFFFFF",
        input: "#B1A893",
        profileText: "#9E554D",
        text: "#1A1A1A"
    },
    dark: {
        header: "#2D3A48",
        BG: "#626C72",
        profileTop: "#838D95",
        windows_actionBG: "#838D95",
        input: "#424E58",
        profileText: "#F3C0BA",
        text: "#FFFFFF"
    },
};

function themeColors(key) {
    return [themeColor.light[key], themeColor.dark[key]];
}

module.exports = { themeColor, themeColors };