export function formValidation(formData) {
  const topic_title = formData.get("topic_title");
  const topic_details = formData.get("topic_details");

  if (!topic_title.trim() || topic_title.trim().length > 100) {
    document.querySelector('[name="topic_title"]').classList.add("is-invalid");
  }

  if (!topic_details.trim() || topic_details.trim().length > 100) {
    document
      .querySelector('[name="topic_details"]')
      .classList.add("is-invalid");
  }

  const allInvalidElms = videoRequestForm.querySelectorAll(".is-invalid");

  if (allInvalidElms.length) {
    allInvalidElms.forEach((el) => {
      el.addEventListener("input", () => el.classList.remove("is-invalid"));
    });
    return false;
  }

  return true;
}
