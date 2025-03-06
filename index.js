const BASE_API_URL = "http://localhost:7777";

const videoRequestForm = document.getElementById("videoRequestForm");
const videoRequestFormSubmitButton = videoRequestForm.querySelector(
  `button[type="submit"]`
);
const listOfRequestsContainer = document.getElementById("listOfRequests");

const loadingSpinner = `<div class="spinner-border spinner-border-sm" role="status"></div>`;

function toggleLoadingSpinner(element) {
  const existingLoadingSpinner = element.querySelector(".spinner-border");

  if (existingLoadingSpinner) existingLoadingSpinner.remove();
  else element.innerHTML += loadingSpinner;
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

    const vidReq = await res.json();

    if (res.ok) {
      videoRequestForm.reset();
      listOfRequestsContainer.prepend(getSingleVideoRequestElm(vidReq));
    }
  } catch (error) {
    console.error(error);
    alert("Something went wrong:", error);
  } finally {
    toggleLoadingSpinner(videoRequestFormSubmitButton);
    allFormElements.forEach((e) => e.removeAttribute("disabled"));
  }
});

async function getVideoRequests() {
  try {
    const res = await fetch(`${BASE_API_URL}/video-request`);

    const reqs = await res.json();
    console.log(reqs);
    return reqs;
  } catch (error) {
    console.error(error);
    alert("Failed to fetch video requests");
  }
}

function getSingleVideoRequestElm(vidReqInfo) {
  const vidReqWrapperElm = document.createElement("div");
  vidReqWrapperElm.innerHTML = `
      <div class="card mb-3">
          <div class="card-body d-flex justify-content-between flex-row">
            <div class="d-flex flex-column">
              <h3>${vidReqInfo.topic_title}</h3>
              <p class="text-muted mb-2">${vidReqInfo.topic_details}</p>
              <p class="mb-0 text-muted">
                <strong>Expected results:</strong> ${vidReqInfo.expected_result}
              </p>
            </div>
            <div class="d-flex flex-column text-center">
              <a class="btn btn-link">🔺</a>
              <h3>${vidReqInfo.votes.ups - vidReqInfo.votes.downs}</h3>
              <a class="btn btn-link">🔻</a>
            </div>
          </div>
          <div class="card-footer d-flex flex-row justify-content-between">
            <div>
              <span class="text-info">${vidReqInfo.status.toUpperCase()}</span>
              &bullet; added by <strong>${vidReqInfo.author_name}</strong> on
              <strong>${new Date(
                vidReqInfo.submit_date
              ).toDateString()}</strong>
            </div>
            <div
              class="d-flex justify-content-center flex-column 408 ml-auto mr-2"
            >
              <div class="badge badge-success">${vidReqInfo.target_level}</div>
            </div>
          </div>
        </div>
      `;

  return vidReqWrapperElm;
}

function displayVideoRequests(reqs) {
  let fragment = document.createDocumentFragment();

  reqs.forEach((vidReq) => {
    fragment.appendChild(getSingleVideoRequestElm(vidReq));
  });

  listOfRequestsContainer.appendChild(fragment);
}

async function showVideoRequests() {
  const reqs = await getVideoRequests();
  displayVideoRequests(reqs);
}

showVideoRequests();
