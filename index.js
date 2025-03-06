const BASE_API_URL = "http://localhost:7777";

const videoRequestForm = document.getElementById("videoRequestForm");
const videoRequestFormSubmitButton = videoRequestForm.querySelector(
  `button[type="submit"]`
);
const listOfRequestsContainer = document.getElementById("listOfRequests");
const sortButtons = document.querySelectorAll(".sort-btn");
const searchInput = document.getElementById("search-input");
const appContentContainer = document.getElementById("app-content");
const loginForm = document.getElementById("login-form");
let sortBy = "new";
let query = "";
let loggedInUserId = "";

const loadingSpinner = `<div class="spinner-border spinner-border-sm" role="status"></div>`;

function handleLoggedInUser() {
  if (window.location.search) {
    const userId = new URLSearchParams(window.location.search).get("id");
    loggedInUserId = userId;
    loginForm.classList.add("d-none");
    appContentContainer.classList.remove("d-none");
  }
}
handleLoggedInUser();

const debounce = (fn, delay) => {
  let timeOut;

  return (...args) => {
    clearTimeout(timeOut);
    timeOut = setTimeout(() => fn(...args), delay);
  };
};

searchInput.addEventListener(
  "input",
  debounce(async (e) => {
    const searchVal = e.target.value;
    query = searchVal;
    listOfRequestsContainer.innerHTML = "";
    await showVideoRequests();
  }, 500)
);

sortButtons.forEach((btn) => {
  btn.addEventListener("click", async (e) => {
    sortButtons.forEach((btn) => btn.classList.remove("active"));
    e.currentTarget.classList.add("active");
    listOfRequestsContainer.innerHTML = "";
    const sortVal = e.currentTarget.dataset.sort;
    sortBy = sortVal;
    await showVideoRequests();
  });
});

function toggleLoadingSpinner(element) {
  const existingLoadingSpinner = element.querySelector(".spinner-border");

  if (existingLoadingSpinner) existingLoadingSpinner.remove();
  else element.innerHTML += loadingSpinner;
}

function formValidation(formData) {
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

videoRequestForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData(videoRequestForm);
  const allFormElements = videoRequestForm.querySelectorAll("*");

  if (!formValidation(formData)) return;

  formData.append("user_id", loggedInUserId);

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
    const res = await fetch(
      `${BASE_API_URL}/video-request?sort=${sortBy}&query=${encodeURIComponent(
        query
      )}`
    );

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
  const userVote = vidReqInfo.votes.ups.includes(loggedInUserId)
    ? "up"
    : vidReqInfo.votes.downs.includes(loggedInUserId)
    ? "down"
    : "";

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
              }" class="btn vote-up btn-link"
               style="opacity:${userVote === "down" ? "0.5" : "1"}"
              >🔺</button>
              <h3 data-id="${vidReqInfo._id}">
                ${vidReqInfo.votes.ups.length - vidReqInfo.votes.downs.length}
              </h3>
              <button onclick="voteDown(this)" data-id="${
                vidReqInfo._id
              }"  class="btn vote-down btn-link"
               style="opacity:${userVote === "up" ? "0.5" : "1"}"
              >🔻</button>
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

async function showVideoRequests() {
  const reqs = await getVideoRequests();
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
      body: JSON.stringify({
        id: vidReqId,
        vote_type,
        user_id: loggedInUserId,
      }),
    });

    const updatedVotes = await res.json();

    // console.log(updatedVotes);

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

  const voteDownBtn = el.parentElement.querySelector(".vote-down");

  if (updatedVotes.ups.includes(loggedInUserId)) {
    el.style.opacity = "1";
    voteDownBtn.style.opacity = "0.5";
  } else {
    voteDownBtn.style.opacity = "1";
  }

  countContainerElm.innerHTML =
    updatedVotes.ups.length - updatedVotes.downs.length;
}

async function voteDown(el) {
  const id = el.dataset.id;
  const countContainerElm = document.querySelector(`h3[data-id="${id}"]`);
  const updatedVotes = await sendVoteRequest(id, "downs");

  const voteUpBtn = el.parentElement.querySelector(".vote-up");

  if (updatedVotes.downs.includes(loggedInUserId)) {
    el.style.opacity = "1";
    voteUpBtn.style.opacity = "0.5";
  } else {
    voteUpBtn.style.opacity = "1";
  }

  countContainerElm.innerHTML =
    updatedVotes.ups.length - updatedVotes.downs.length;
}
