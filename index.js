const BASE_API_URL = "http://localhost:7777";

const videoRequestForm = document.getElementById("video-request-form");
const videoRequestFormSubmitButton = videoRequestForm.querySelector(
  `button[type="submit"]`
);

const loadingSpinner = `<div class="spinner-border spinner-border-sm" role="status"></div>`;

function toggleLoadingSpinner(element) {
  const existingLoadingSpinner = element.querySelector(".spinner-border");

  if (existingLoadingSpinner) {
    existingLoadingSpinner.remove();
  } else {
    element.innerHTML += loadingSpinner;
  }
}

videoRequestForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData(videoRequestForm);
  const formDataObject = Object.fromEntries(formData.entries());
  const allFormElements = videoRequestForm.querySelectorAll("*");

  // TODO: Add form validation

  toggleLoadingSpinner(videoRequestFormSubmitButton);
  allFormElements.forEach((e) => e.setAttribute("disabled", "true"));

  try {
    const res = await fetch(`${BASE_API_URL}/video-request`, {
      method: "POST",
      body: formData,
    });

    if (res.ok) videoRequestForm.reset();
  } catch (error) {
    console.error(error);
    alert("Something went wrong:", error);
  } finally {
    toggleLoadingSpinner(videoRequestFormSubmitButton);
    allFormElements.forEach((e) => e.removeAttribute("disabled"));
  }
});
