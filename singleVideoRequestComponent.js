import { state } from "./index.js";

export function getSingleVideoRequestElm(vidReqInfo) {
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

          <div style="gap:10px;" class="card-body d-flex justify-content-between flex-row flex-wrap">
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
                ? `
                <div class="ml-auto mr-3">
                  <iframe width="240" height="135" src="https://www.youtube.com/embed/${vidReqInfo.video_ref.link}" allowfullscreen frameborder="0"></iframe>
                </div>
                `
                : ""
            }
            <div class="d-flex flex-column text-center">
              <button   ${
                state.isAdmin || vidReqInfo.status === "done" ? "disabled" : ""
              } id="vote_up_${vidReqInfo._id}" class="vote-button btn btn-link"
               style="opacity:${
                 userVote === "down" ||
                 state.isAdmin ||
                 vidReqInfo.status === "done"
                   ? "0.5"
                   : "1"
               }"
              >🔺</button>
              <h3 id="count_container_${vidReqInfo._id}">
                ${vidReqInfo.votes.ups.length - vidReqInfo.votes.downs.length}
              </h3>
              <button ${
                state.isAdmin || vidReqInfo.status === "done" ? "disabled" : ""
              } id="vote_down_${vidReqInfo._id}" 
               class="vote-button btn btn-link"
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
