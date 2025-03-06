const BASE_API_URL = "http://localhost:7777";

const videoRequestForm = document.getElementById("videoRequestForm");
const videoRequestFormSubmitButton = videoRequestForm.querySelector(
  `button[type="submit"]`
);
const listOfRequestsContainer = document.getElementById("listOfRequests");
const sortButtons = document.querySelectorAll(".sort-btn");

const loadingSpinner = `<div class="spinner-border spinner-border-sm" role="status"></div>`;

sortButtons.forEach((btn) => {
  btn.addEventListener("click", (e) => {
    sortButtons.forEach((btn) => btn.classList.remove("active"));
    e.currentTarget.classList.add("active");
    listOfRequestsContainer.innerHTML = "";
    showVideoRequests(e.currentTarget.dataset.sort);
  });
});

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

async function getVideoRequests(sort = "new") {
  try {
    const res = await fetch(`${BASE_API_URL}/video-request?sort=${sort}`);

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
              ${
                vidReqInfo.expected_result &&
                `<p class="mb-0 text-muted">
                <strong>Expected results:</strong> ${vidReqInfo.expected_result}
              </p>`
              }
            </div>
            <div class="d-flex flex-column text-center">
              <button onclick="voteUp(this)" data-id="${
                vidReqInfo._id
              }" class="btn btn-link">🔺</button>
              <h3 data-id="${vidReqInfo._id}">
                ${vidReqInfo.votes.ups - vidReqInfo.votes.downs}
              </h3>
              <button onclick="voteDown(this)" data-id="${
                vidReqInfo._id
              }"  class="btn btn-link">🔻</button>
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

function renderVideoRequests(reqs) {
  let fragment = document.createDocumentFragment();

  reqs.forEach((vidReq) => {
    fragment.appendChild(getSingleVideoRequestElm(vidReq));
  });

  listOfRequestsContainer.appendChild(fragment);
}

async function showVideoRequests(sort) {
  const reqs = await getVideoRequests(sort);
  renderVideoRequests(reqs);
}

showVideoRequests();

async function sendVoteRequest(vidReqId, vote_type) {
  try {
    const res = await fetch(`${BASE_API_URL}/video-request/vote`, {
      method: "PUT",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ id: vidReqId, vote_type }),
    });

    const updatedVotes = await res.json();

    return updatedVotes;
  } catch (error) {
    console.error(error);
    alert("Failed to update vote");
  }
}

async function voteUp(el) {
  const id = el.dataset.id;
  const countContainerElm = document.querySelector(`h3[data-id="${id}"]`);
  const updatedVotes = await sendVoteRequest(id, "ups");
  countContainerElm.innerHTML = updatedVotes.ups - updatedVotes.downs;
}

async function voteDown(el) {
  const id = el.dataset.id;
  const countContainerElm = document.querySelector(`h3[data-id="${id}"]`);
  const updatedVotes = await sendVoteRequest(id, "downs");
  countContainerElm.innerHTML = updatedVotes.ups - updatedVotes.downs;
}
