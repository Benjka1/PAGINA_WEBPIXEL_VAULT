document.addEventListener("DOMContentLoaded", function () {
    "use strict";

    const searchInput = document.getElementById("game-search");
    const gameCards = Array.from(
        document.querySelectorAll(".featured-card")
    );

    if (!searchInput || gameCards.length === 0) {
        return;
    }

    const grid = document.querySelector(".featured-grid");

    if (!grid) {
        return;
    }

    function normalizeText(text) {
        return String(text || "")
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .trim();
    }

    let noResults = grid.querySelector(".no-search-results");

    if (!noResults) {
        noResults = document.createElement("div");
        noResults.className = "no-search-results";
        noResults.innerHTML = `
            <i class="fa-solid fa-magnifying-glass"></i>
            <strong>No se encontraron videojuegos.</strong>
            <span>Prueba con otro nombre, categoría o descripción.</span>
        `;
        grid.appendChild(noResults);
    }

    function filterGames(value) {
        const searchText = normalizeText(value);
        let visibleGames = 0;

        gameCards.forEach(function (card) {
            const title =
                card.querySelector("h3")?.textContent || "";

            const category =
                card.querySelector(".game-category")?.textContent || "";

            const description =
                card.querySelector("p")?.textContent || "";

            const searchableText = normalizeText(
                `${title} ${category} ${description}`
            );

            const matches =
                searchText === "" ||
                searchableText.includes(searchText);

            card.style.display = matches ? "" : "none";

            if (matches) {
                visibleGames++;
            }
        });

        noResults.style.display =
            searchText !== "" && visibleGames === 0
                ? "flex"
                : "none";
    }

    searchInput.addEventListener("input", function () {
        filterGames(this.value);
    });

    searchInput.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
            this.value = "";
            filterGames("");
            this.blur();
        }
    });

    filterGames("");
});
