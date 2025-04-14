document.addEventListener("DOMContentLoaded", () => {
    // === NAV: Toggle mobile menu ===
    const toggleBtn = document.querySelector(".nav-toggle");
    const navLinks = document.querySelector(".nav-links");

    toggleBtn.addEventListener("click", () => {
        const isVisible = navLinks.getAttribute("data-visible") === "true";
        navLinks.setAttribute("data-visible", !isVisible);
        toggleBtn.setAttribute("aria-expanded", !isVisible);
    });

    // === FILTERS: Toggle filter aside ===
    const toggleFilterBtn = document.querySelector(".filters-toggle-button");
    const closeFiltersBtn = document.getElementById("close-bilters-button");
    const filtersWrapper = document.querySelector(".filters-wrapper");

    toggleFilterBtn?.addEventListener("click", () => {
        const isVisible = filtersWrapper.getAttribute("data-visible") === "true";
        filtersWrapper.setAttribute("data-visible", !isVisible);
    });

    closeFiltersBtn?.addEventListener("click", () => {
        filtersWrapper.setAttribute("data-visible", false);
    });

    // === CAROUSEL ===
    const slidesContainer = document.querySelector(".carousel-slides");
    const slides = document.querySelectorAll(".carousel-slide");
    const nextBtn = document.querySelector(".carousel-next");
    const prevBtn = document.querySelector(".carousel-prev");
    const dots = document.querySelectorAll(".carousel-dot");

    let currentIndex = 1;

    const updateCarousel = () => {
        const width = slides[0].clientWidth;
        slidesContainer.style.transform = `translateX(-${currentIndex * width}px)`;
        dots.forEach(dot => dot.classList.remove("carousel-dot-active"));
        if (dots[currentIndex]) {
            dots[currentIndex].classList.add("carousel-dot-active");
        }
    };

    nextBtn?.addEventListener("click", () => {
        currentIndex = (currentIndex + 1) % slides.length;
        updateCarousel();
    });

    prevBtn?.addEventListener("click", () => {
        currentIndex = (currentIndex - 1 + slides.length) % slides.length;
        updateCarousel();
    });

    dots?.forEach((dot, index) => {
        dot.addEventListener("click", () => {
            currentIndex = index;
            updateCarousel();
        });
    });

    window.addEventListener("resize", updateCarousel);
    updateCarousel();

    // === POPOVER DETAILS ===
    class PopoverDetails {
        constructor() {
            this.popover = document.getElementById("popover-details");
            this.btnClose = null;
        }

        open(data, triggerButton) {
            const triggerButtonRect = triggerButton.getBoundingClientRect();
            this.popover.classList.remove("hidden");
            this.popover.setAttribute("data-visible", "true");

            this.popover.innerHTML = `
          <header>
            <strong>Desglose de precios</strong>
            <button class="popover-close">
              <img src="img/close.svg" aria-label="Cerrar ventana" alt="Cerrar">
            </button>
          </header>
          <section class="popover-content">
            <h3 class="popover-title">${data.description}<span>${data.days}</span></h3>
            <div class="popover-prices">
            <p class="popover-price">
              <span>Precio base:</span> <strong class="popover-price-base">${data.base}€</strong> 
            </p>
            <p class="popover-price">
              <span>Impuestos:</span> <strong class="popover-price-tax">${data.tax}€</strong> 
            </p>
            </div>
          </section>
          <footer>
            <span>Total:</span> <span class="popover-price-total">${data.total} €</span>
          </footer>
        `;

            this.btnClose = this.popover.querySelector(".popover-close");
            this.btnClose.addEventListener("click", () => this.close());

            window.addEventListener("keydown", (e) => {
                if (e.key === "Escape") this.close();
            });

            if (window.innerWidth <= 697) {
                this.popover.style.position = "fixed";
                this.popover.style.top = 0;
                this.popover.style.left = 0;
            } else {
                this.popover.style.position = "absolute";
                this.popover.style.top = `${triggerButtonRect.bottom + window.scrollY}px`;
                this.popover.style.left = `${triggerButtonRect.left + window.scrollX - 15}px`;
            }

            setTimeout(() => {
                document.body.addEventListener("click", this.handleOutsideClick);
                this.btnClose.focus();
            }, 100);
        }

        close() {
            this.popover.classList.add("hidden");
            this.popover.setAttribute("data-visible", "false");
            document.body.removeEventListener("click", this.handleOutsideClick);
        }

        handleOutsideClick = (event) => {
            if (!this.popover.contains(event.target)) {
                this.close();
            }
        };
    }

    const popoverDetails = new PopoverDetails();

    document.querySelectorAll(".card-see-details").forEach((button) => {
        button.addEventListener("click", () => {
            const card = button.closest(".card");
            const description = card.querySelector(".card-description").childNodes[0].textContent.trim();
            const days = card.querySelector(".card-description span").textContent.trim();
            const base = Math.floor(Math.random() * 500) + 500;
            const tax = Math.floor(Math.random() * 100) + 50;
            const total = base + tax;

            const data = { description, days, base, tax, total };
            popoverDetails.open(data, button);
        });
    });

    // === FILTERS: Aplica lógica de filtrado de cards ===
    const formFilters = document.getElementById("form-filters");
    const cardsContainer = document.getElementById("cards-container");
    const cards = cardsContainer.querySelectorAll(".card");

    const getFilterValues = () => {
        const formData = new FormData(formFilters);
        const values = {
            destination: formData.getAll("destination"),
            activity: formData.getAll("activity"),
            accommodation: formData.getAll("accommodation"),
            minPrice: parseFloat(formData.get("minPrice")) || 0,
            maxPrice: parseFloat(formData.get("maxPrice")) || Infinity,
        };
        return values;
    };

    const filterCards = () => {
        const { destination, activity, accommodation, minPrice, maxPrice } = getFilterValues();

        cards.forEach((card) => {
            const tag = card.querySelector(".card-tag").textContent.toLowerCase();
            const description = card.querySelector(".card-description").textContent.toLowerCase();
            const priceText = card.querySelector(".card-price-amount").textContent.replace(/[^\d]/g, "");
            const price = parseFloat(priceText);

            const matchesDestination = destination.length === 0 || destination.some(d => description.includes(d));
            const matchesActivity = activity.length === 0 || activity.includes(tag);
            const matchesAccommodation = accommodation.length === 0 || accommodation.some(a => description.includes(a));
            const matchesPrice = price >= minPrice && price <= maxPrice;

            if (matchesDestination && matchesActivity && matchesAccommodation && matchesPrice) {
                card.style.display = "";
            } else {
                card.style.display = "none";
            }
        });
    };

    // Aplica filtro al cambiar cualquier campo
    formFilters.addEventListener("input", filterCards);

});
