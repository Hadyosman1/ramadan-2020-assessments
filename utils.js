import { listOfRequestsContainer, videoRequestForm } from "./selectors.js";
import { state } from "./index.js";
import { ADMIN_USER_ID } from "./constants.js";
import singleVideoRequestComponent from "./singleVideoRequestComponent.js";
import {
  createVideoRequest,
  deleteVidReq,
  getVideoRequests,
  updateVidReq,
  updateVote,
} from "./services.js";
import { formValidation } from "./validations.js";

export const debounce = (fn, delay) => {
  let timeOut;

  return (...args) => {
    clearTimeout(timeOut);
    timeOut = setTimeout(() => fn(...args), delay);
  };
};

export function getLoadingSpinner() {
  return `<div class="spinner-border spinner-border-sm" role="status"></div>`;
}

export function toggleLoadingSpinner(element) {
  const existingLoadingSpinner = element.querySelector(".spinner-border");
  if (existingLoadingSpinner) existingLoadingSpinner.remove();
  else element.innerHTML += getLoadingSpinner();
}

export function handleLoggedInUser() {
  if (!window.location.search) return;

  const loginForm = document.getElementById("login-form");
  const appContentContainer = document.getElementById("app-content");
  const normalUserContentWrapper = document.querySelector(
    ".normal-user-content"
  );

  state.loggedInUserId = new URLSearchParams(window.location.search).get("id");

  if (state.loggedInUserId === ADMIN_USER_ID) {
    state.isAdmin = true;
    normalUserContentWrapper.classList.add("d-none");
  }

  loginForm.classList.add("d-none");
  appContentContainer.classList.remove("d-none");
}

export function addAdminActions(vidReq, fragment) {
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

  changeStatusSelect.addEventListener("change", (e) => {
    const id = e.currentTarget.id.split("_").at(-1);
    const status = e.currentTarget.value;

    if (status === "done") {
      return adminVidResContainer.classList.remove("d-none");
    }

    adminVidResContainer.classList.add("d-none");
    updateVidReq(id, status, videoResInput.value);
  });

  fragment
    .getElementById(`admin_save_video_res_${vidReq._id}`)
    .addEventListener("click", (e) => {
      e.preventDefault();
      if (!videoResInput.value.trim()) {
        videoResInput.classList.add("is-invalid");
        videoResInput.addEventListener("input", () => {
          videoResInput.classList.remove("is-invalid");
        });
        return;
      }

      updateVidReq(
        vidReq._id,
        changeStatusSelect.value,
        videoResInput.value.trim()
      );
    });

  fragment
    .getElementById(`admin_delete_video_req_${vidReq._id}`)
    .addEventListener("click", deleteVidReq);
}

export async function renderVideoRequests() {
  const reqs = await getVideoRequests();
  let fragment = document.createDocumentFragment();

  reqs.forEach((vidReq) => {
    fragment.appendChild(singleVideoRequestComponent(vidReq));
    if (state.isAdmin) addAdminActions(vidReq, fragment);
  });

  listOfRequestsContainer.innerHTML = "";
  listOfRequestsContainer.appendChild(fragment);
}

export function addSearchEventListener(delay = 500) {
  const searchInput = document.getElementById("search-input");
  searchInput.addEventListener(
    "input",
    debounce((e) => {
      state.query = e.target.value;
      renderVideoRequests();
    }, delay)
  );
}

export function addFiltersEventListeners() {
  const filterInputs = document.querySelectorAll(
    "#filter-container input[type=radio]"
  );

  filterInputs.forEach((input) => {
    input.addEventListener("change", (e) => {
      filterInputs.forEach((el) =>
        el.closest("label").classList.remove("active")
      );
      state.filter = e.target.value;
      e.target.closest("label").classList.add("active");

      renderVideoRequests();
    });
  });
}

export function addSortEventListeners() {
  const sortButtons = document.querySelectorAll(".sort-btn");

  sortButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      sortButtons.forEach((btn) => btn.classList.remove("active"));
      e.currentTarget.classList.add("active");
      state.sortBy = e.currentTarget.dataset.sort;
      renderVideoRequests();
    });
  });
}

export function addVoteButtonsEventListeners() {
  listOfRequestsContainer.addEventListener("click", async (e) => {
    const isVoteButton = e.target.matches(".vote-button");
    if (!isVoteButton) return;

    const [, dir, vidReqId] = e.target.id.split("_");
    const voteDir = `${dir}s`;

    const countContainerElm = document.getElementById(
      `count_container_${vidReqId}`
    );
    const anotherVoteDirButton = document.getElementById(
      `vote_${dir === "up" ? "down" : "up"}_${vidReqId}`
    );

    const updatedVotes = await updateVote(vidReqId, voteDir);

    countContainerElm.innerHTML =
      updatedVotes.ups.length - updatedVotes.downs.length;

    if (
      (updatedVotes.ups.includes(state.loggedInUserId) && dir === "up") ||
      (updatedVotes.downs.includes(state.loggedInUserId) && dir === "down")
    ) {
      e.target.style.opacity = "1";
      anotherVoteDirButton.style.opacity = "0.5";
    } else {
      e.target.style.opacity = "1";
      anotherVoteDirButton.style.opacity = "1";
    }
  });
}

export function handleFormSubmission() {
  videoRequestForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const formData = new FormData(videoRequestForm);
    const allFormElements = videoRequestForm.querySelectorAll("*");

    if (!formValidation(formData)) return;

    formData.append("user_id", state.loggedInUserId);

    const videoRequestFormSubmitButton = videoRequestForm.querySelector(
      `button[type="submit"]`
    );

    toggleLoadingSpinner(videoRequestFormSubmitButton);
    allFormElements.forEach((e) => e.setAttribute("disabled", "true"));

    createVideoRequest(formData)
      .then((res) => res.json())
      .then((vidReq) => {
        videoRequestForm.reset();
        listOfRequestsContainer.prepend(singleVideoRequestComponent(vidReq));
      })
      .catch((error) => {
        console.error(error);
        alert("Something went wrong:", error);
      })
      .finally(() => {
        toggleLoadingSpinner(videoRequestFormSubmitButton);
        allFormElements.forEach((e) => e.removeAttribute("disabled"));
      });
  });
}
