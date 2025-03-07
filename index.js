import {
  handleLoggedInUser,
  renderVideoRequests,
  addSortEventListeners,
  addFiltersEventListeners,
  addSearchEventListener,
  handleFormSubmission,
  addVoteButtonsEventListeners,
} from "./utils.js";

export const state = {
  sortBy: "new",
  query: "",
  loggedInUserId: "",
  filter: "all",
  isAdmin: false,
};

document.addEventListener("DOMContentLoaded", () => {
  handleLoggedInUser();
  handleFormSubmission();
  addSortEventListeners();
  addFiltersEventListeners();
  addSearchEventListener();
  renderVideoRequests();
  addVoteButtonsEventListeners();
});
