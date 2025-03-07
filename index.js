const BASE_API_URL = "http://localhost:7777";
const ADMIN_USER_ID = "29092002";

const videoRequestForm = document.getElementById("videoRequestForm");
const videoRequestFormSubmitButton = videoRequestForm.querySelector(
  `button[type="submit"]`
);
const listOfRequestsContainer = document.getElementById("listOfRequests");
const sortButtons = document.querySelectorAll(".sort-btn");
const searchInput = document.getElementById("search-input");
const appContentContainer = document.getElementById("app-content");
const loginForm = document.getElementById("login-form");
const normalUserContentWrapper = document.querySelector(".normal-user-content");
const filterInputs = document.querySelectorAll(
  "#filter-container input[type=radio]"
);
console.log(filterInputs);
const state = {
  sortBy: "new",
  query: "",
  loggedInUserId: "",
  filter: "all",
  isAdmin: false,
};

const loadingSpinner = `<div class="spinner-border spinner-border-sm" role="status"></div>`;

filterInputs.forEach((input) => {
  input.addEventListener("change", (e) => {
    filterInputs.forEach((el) =>
      el.closest("label").classList.remove("active")
    );
    state.filter = e.target.value;
    e.target.closest("label").classList.add("active");
    listOfRequestsContainer.innerHTML = "";
    showVideoRequests();
  });
});

function handleLoggedInUser() {
  if (window.location.search) {
    state.loggedInUserId = new URLSearchParams(window.location.search).get(
      "id"
    );

    if (state.loggedInUserId === ADMIN_USER_ID) {
      state.isAdmin = true;
      normalUserContentWrapper.classList.add("d-none");
    }
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
    state.query = searchVal;
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
    state.sortBy = sortVal;
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

  formData.append("user_id", state.loggedInUserId);

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
      `${BASE_API_URL}/video-request?sort=${
        state.sortBy
      }&query=${encodeURIComponent(state.query)}&filter=${state.filter}`
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
  const userVote = vidReqInfo.votes.ups.includes(state.loggedInUserId)
    ? "up"
    : vidReqInfo.votes.downs.includes(state.loggedInUserId)
    ? "down"
    : "";

  vidReqWrapperElm.innerHTML = `
      <div class="card mb-3">
          ${
            state.isAdmin
              ? `<div class="card-header d-flex justify-content-between">
                <select id="admin_change_status_${
                  vidReqInfo._id
                }" class="custom-select w-25">
                  <option value="new">New</option>
                  <option value="planned">Planned</option>
                  <option value="done">Done</option>
                </select>
                <div id="admin_video_res_container_${
                  vidReqInfo._id
                }" class="input-group ${
                  vidReqInfo.status !== "done" && "d-none"
                } ml-2 mr-5">
                  <input id="admin_video_res_${
                    vidReqInfo._id
                  }" type="text" class="form-control" placeholder="Paste here youtube video id" />
                  <div class="input-group-append">
                    <button id="admin_save_video_res_${
                      vidReqInfo._id
                    }" class="btn btn-outline-secondary" type="button">
                      Save
                    </button>
                  </div>
                </div>
                <button id="admin_delete_video_req_${
                  vidReqInfo._id
                }" type="button" class="btn btn-danger">Delete</button>
              </div>`
              : ""
          }

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
            ${
              vidReqInfo.video_ref.link && vidReqInfo.status === "done"
                ? `<div class="ml-auto mr-3">
              <iframe width="240" height="135" src="https://www.youtube.com/embed/${vidReqInfo.video_ref.link}" allowfullscreen frameborder="0"></iframe>
            </div>`
                : ""
            }
            <div class="d-flex flex-column text-center">
              <button onclick="voteUp(this)" ${
                state.isAdmin || vidReqInfo.status === "done" ? "disabled" : ""
              } data-id="${vidReqInfo._id}" class="btn vote-up btn-link"
               style="opacity:${
                 userVote === "down" ||
                 state.isAdmin ||
                 vidReqInfo.status === "done"
                   ? "0.5"
                   : "1"
               }"
              >🔺</button>
              <h3 data-id="${vidReqInfo._id}">
                ${vidReqInfo.votes.ups.length - vidReqInfo.votes.downs.length}
              </h3>
              <button onclick="voteDown(this)" ${
                state.isAdmin || vidReqInfo.status === "done" ? "disabled" : ""
              } data-id="${vidReqInfo._id}"  class="btn vote-down btn-link"
               style="opacity:${
                 userVote === "up" ||
                 state.isAdmin ||
                 vidReqInfo.status === "done"
                   ? "0.5"
                   : "1"
               }"
              >🔻</button>
            </div>
          </div>
          <div class="card-footer d-flex flex-row justify-content-between">
            <div  class="${
              vidReqInfo.status === "done"
                ? "text-success font-bold"
                : vidReqInfo.status === "planned"
                ? "text-primary"
                : "text-info"
            }">
              <span>${vidReqInfo.status.toUpperCase()} 
                ${
                  vidReqInfo.status === "done"
                    ? `<strong> on ${new Date(
                        vidReqInfo.video_ref.date
                      ).toDateString()}</strong>`
                    : ""
                }
             </span>
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
    if (state.isAdmin) addAdminActions(vidReq, fragment);
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
        user_id: state.loggedInUserId,
      }),
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

  const voteDownBtn = el.parentElement.querySelector(".vote-down");

  if (updatedVotes.ups.includes(state.loggedInUserId)) {
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

  if (updatedVotes.downs.includes(state.loggedInUserId)) {
    el.style.opacity = "1";
    voteUpBtn.style.opacity = "0.5";
  } else {
    voteUpBtn.style.opacity = "1";
  }

  countContainerElm.innerHTML =
    updatedVotes.ups.length - updatedVotes.downs.length;
}

const adminActions = {
  deleteVidReq: async (e) => {
    const id = e.currentTarget.id.split("_").at(-1);

    const isSure = confirm(
      "Are you sure you want to delete this video request?"
    );

    if (!isSure) return;

    const res = await fetch(`${BASE_API_URL}/video-request`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
    }).catch((err) => console.error(err));

    if (res.ok) {
      e.target.closest(".card").remove();
    }
  },
  updateVidReq: async (id, status, resVideo) => {
    await fetch(`${BASE_API_URL}/video-request`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id, status, resVideo }),
    }).catch((err) => console.error(err));

    listOfRequestsContainer.innerHTML = "";
    showVideoRequests();
  },
};

function addAdminActions(vidReq, fragment) {
  const videoResInput = fragment.getElementById(
    `admin_video_res_${vidReq._id}`
  );
  const adminVidResContainer = fragment.getElementById(
    `admin_video_res_container_${vidReq._id}`
  );
  const changeStatusSelect = fragment.getElementById(
    `admin_change_status_${vidReq._id}`
  );

  changeStatusSelect
    .querySelector(`option[value="${vidReq.status}"]`)
    .setAttribute("selected", "");
  videoResInput.value = vidReq.video_ref.link;

  changeStatusSelect.addEventListener("change", async (e) => {
    const id = e.currentTarget.id.split("_").at(-1);
    const status = e.currentTarget.value;

    if (status === "done")
      return adminVidResContainer.classList.remove("d-none");

    adminVidResContainer.classList.add("d-none");
    await adminActions.updateVidReq(id, status, videoResInput.value);
  });

  fragment
    .getElementById(`admin_save_video_res_${vidReq._id}`)
    .addEventListener("click", async (e) => {
      e.preventDefault();
      if (!videoResInput.value.trim()) {
        videoResInput.classList.add("is-invalid");
        videoResInput.addEventListener("input", () => {
          videoResInput.classList.remove("is-invalid");
        });
        return;
      }

      await adminActions.updateVidReq(
        vidReq._id,
        changeStatusSelect.value,
        videoResInput.value.trim()
      );
    });

  fragment
    .getElementById(`admin_delete_video_req_${vidReq._id}`)
    .addEventListener("click", adminActions.deleteVidReq);
}
