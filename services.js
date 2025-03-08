import { renderVideoRequests } from "./utils.js";
import API from "./api.js";

const getVideoRequests = () => API.videoReq.get();

const createVideoRequest = (formData) => API.videoReq.create(formData);

const deleteVidReq = (e) => {
  API.videoReq.delete(e).then(() => e.target.closest(".card").remove());
};

const updateVidReq = (id, status, resVideo) => {
  API.videoReq.update(id, status, resVideo).then(() => renderVideoRequests());
};

const updateVote = (vidReqId, voteDir) => API.votes.update(vidReqId, voteDir);

export {
  getVideoRequests,
  createVideoRequest,
  deleteVidReq,
  updateVidReq,
  updateVote,
};
