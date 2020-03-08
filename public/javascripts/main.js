function openApp(appId) {
    location.href = './appdetails?pkg=' + appId;
}

function InitModal() {
    const modal = document.querySelector(".modal");
    const container = modal.querySelector(".container");

    document.querySelector("#refresh").addEventListener("click", function (e) {
        modal.classList.remove("hidden");
        fetch('./refresh')
    });
}

function docReady(fn) {
    if (document.readyState === "complete" || document.readyState === "interactive") {
        setTimeout(fn, 1);
    } else {
        document.addEventListener("DOMContentLoaded", fn);
    }
}
docReady(InitModal);
