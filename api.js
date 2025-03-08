import { BASE_API_URL } from "./constants.js";
import { state } from "./index.js";

export default {
  videoReq: {
    get: () => {
      const url = new URL(`${BASE_API_URL}/video-request`);
      url.searchParams.set("sort", state.sortBy);
      url.searchParams.set("query", state.query);
      url.searchParams.set("filter", state.filter);

      return fetch(url)
        .then((res) => res.json())
        .catch((error) => {
          console.error(error);
          alert("Failed to fetch video requests");
        });
    },
    create: (formData) => {
      return fetch(`${BASE_API_URL}/video-request`, {
        method: "POST",
        body: formData,
      });
    },
    update: (id, status, resVideo) => {
      return fetch(`${BASE_API_URL}/video-request`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status, resVideo }),
      }).catch((err) => console.error(err));
    },
    delete: (e) => {
      const id = e.currentTarget.id.split("_").at(-1);

      const isSure = confirm(
        "Are you sure you want to delete this video request?"
      );

      if (!isSure) return;

      return fetch(`${BASE_API_URL}/video-request`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      }).catch((err) => console.error(err));
    },
  },
  votes: {
    update: (vidReqId, vote_type) => {
      return fetch(`${BASE_API_URL}/video-request/vote`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          id: vidReqId,
          vote_type,
          user_id: state.loggedInUserId,
        }),
      })
        .then((res) => res.json())
        .catch((error) => {
          console.error(error);
          alert("Failed to update vote");
        });
    },
  },
};
