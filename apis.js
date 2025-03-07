import { BASE_API_URL } from "./constants.js";
import { state } from "./index.js";
import { renderVideoRequests } from "./utils.js";

export async function getVideoRequests() {
  const url = new URL(`${BASE_API_URL}/video-request`);
  url.searchParams.set("sort", state.sortBy);
  url.searchParams.set("query", state.query);
  url.searchParams.set("filter", state.filter);

  try {
    const res = await fetch(url);
    return await res.json();
  } catch (error) {
    console.error(error);
    alert("Failed to fetch video requests");
  }
}

export async function sendVoteRequest(vidReqId, vote_type) {
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

    return await res.json();
  } catch (error) {
    console.error(error);
    alert("Failed to update vote");
  }
}

export const deleteVidReq = async (e) => {
  const id = e.currentTarget.id.split("_").at(-1);

  const isSure = confirm("Are you sure you want to delete this video request?");

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
};

export const updateVidReq = async (id, status, resVideo) => {
  await fetch(`${BASE_API_URL}/video-request`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id, status, resVideo }),
  }).catch((err) => console.error(err));

  await renderVideoRequests();
};
