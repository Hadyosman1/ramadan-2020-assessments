export default function adminActionsCardHeaderComponent(isAdmin, vidReqInfo) {
  return isAdmin
    ? `<div class="card-header d-flex justify-content-between">
        <select 
          id="admin_change_status_${vidReqInfo._id}"
          class="custom-select w-25"
        >
          <option value="new">New</option>
          <option value="planned">Planned</option>
          <option value="done">Done</option>
        </select>
        <div 
          id="admin_video_res_container_${vidReqInfo._id}"
          class="input-group 
            ${vidReqInfo.status !== "done" && "d-none"}
            ml-2 mr-5"
        >
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
    : "";
}
