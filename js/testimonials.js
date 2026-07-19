const testimonials = [
  {
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc maximus, nulla ut commodo sagittis, sapien dui mattis dui, non pulvinar lorem felis nec erat.",
    author: "Adam Smith",
    role: "Designation",
    rating: 3.5,
  },
  {
    text: "Grâce à leur accompagnement, notre structure RH est enfin claire et efficace. Un vrai gain de temps au quotidien.",
    author: "Julie Martin",
    role: "Gérante, TPE Services",
    rating: 5,
  },
  {
    text: "Un suivi rigoureux et une écoute réelle de nos besoins. Je recommande sans hésiter pour toute PME en croissance.",
    author: "Karim Belkacem",
    role: "Fondateur, Atelier K",
    rating: 4,
  },
];

let currentIndex = 0;

const starsEl = document.getElementById("testimonial-stars");
const textEl = document.getElementById("testimonial-text");
const authorEl = document.getElementById("testimonial-author");
const roleEl = document.getElementById("testimonial-role");

function renderStars(rating) {
  starsEl.innerHTML = "";
  for (let i = 1; i <= 5; i++) {
    const fill = rating >= i ? 1 : rating >= i - 0.5 ? 0.5 : 0;
    starsEl.innerHTML += `
      <svg viewBox="0 0 24 24">
        <defs>
          <linearGradient id="star-${i}">
            <stop offset="${fill * 100}%" stop-color="currentColor" />
            <stop offset="${fill * 100}%" stop-color="transparent" />
          </linearGradient>
        </defs>
        <path
          fill="url(#star-${i})"
          stroke="currentColor"
          stroke-width="1.5"
          d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.7 7-6.3-3.9-6.3 3.9 1.7-7L2 9.2l7.1-.6z"
        />
      </svg>`;
  }
}

function renderTestimonial(index) {
  const t = testimonials[index];
  textEl.textContent = t.text;
  authorEl.textContent = t.author;
  roleEl.textContent = t.role;
  renderStars(t.rating);
}

document
  .querySelector(".testimonials__nav--prev")
  .addEventListener("click", () => {
    currentIndex =
      (currentIndex - 1 + testimonials.length) % testimonials.length;
    renderTestimonial(currentIndex);
  });

document
  .querySelector(".testimonials__nav--next")
  .addEventListener("click", () => {
    currentIndex = (currentIndex + 1) % testimonials.length;
    renderTestimonial(currentIndex);
  });

renderTestimonial(currentIndex);
