let html = document.querySelector("html");
let moon = "/assets/icons/moon-stars.svg";
let sun = "/assets/icons/cloud-sun.svg";
let toggler = document.querySelectorAll('.theme-toggler');
let lightMode = window.matchMedia("(prefers-color-scheme: light)").matches;
let darkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;

// Recover theme from local storage
let isDarkModeEnabled = localStorage.getItem("isDark");
let isLightModeEnabled = localStorage.getItem("isLight");

if (isDarkModeEnabled === "yes") {
    html.classList.add("themes");
    toggler.forEach((tt) => {
        tt.classList.remove("sun");
        tt.classList.add("moon");
        tt.querySelector(".theme-btn").innerHTML = `<img src="${moon}" alt='theme-icon' class="t-i">`;
    });
} else if (isLightModeEnabled === "yes") {
    html.classList.remove("themes");
    toggler.forEach((tt) => {
        tt.classList.remove("moon");
        tt.classList.add("sun");
        tt.querySelector(".theme-btn").innerHTML = `<img src="${sun}" alt='theme-icon' class="t-i">`;
    });
}

// Original theme toggler code
let tt = toggler.forEach(tt => {
    let themeBtn = tt.querySelector(".theme-btn");
    if (lightMode) {
        themeBtn.innerHTML = `<img src="${sun}" alt='theme-icon' class="t-i">`;
        tt.classList.add("sun");
        tt.addEventListener("click", () => {
            let ht = html.classList.toggle("themes");
            if (html.classList.contains("themes")) {
                localStorage.setItem("isDark", "yes");
                tt.classList.remove("sun");
                themeBtn.innerHTML = `<img src="${moon}" alt='theme-icon' class="t-i">`;
                localStorage.removeItem("isLight");
            } else {
                tt.classList.add("sun");
                themeBtn.innerHTML = `<img src="${sun}" alt='theme-icon' class="t-i">`;
                localStorage.removeItem("isDark");
                localStorage.setItem("isLight", "yes");
            }
        });
    }
    
    // Dark mode features
    if (darkMode) {
        themeBtn.innerHTML = `<img src="${moon}" alt='theme-icon' class="t-i">`;
        tt.classList.add("moon");
        tt.addEventListener("click", () => {
            let ht = html.classList.toggle("themes");
            if (html.classList.contains("themes")) {
                tt.classList.remove("moon");
                tt.classList.add("sun");
                themeBtn.innerHTML = `<img src="${sun}" alt='theme-icon' class="t-i">`;
                localStorage.setItem("isLight", "yes");
                localStorage.removeItem("isDark");
            } else {
                tt.classList.add("moon");
                themeBtn.innerHTML = `<img src="${moon}" alt='theme-icon' class="t-i">`;
                localStorage.removeItem("isLight");
                localStorage.setItem("isDark", "yes");
            }
        });
    }
});

$(".year").html(`${new Date().getFullYear()}`);