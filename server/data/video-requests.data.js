var VideoRequest = require("./../models/video-requests.model");
const userData = require("./user.data");

module.exports = {
  createRequest: async (vidRequestData) => {
    const author = await userData.getUserById(vidRequestData.user_id);

    vidRequestData.author_name = author.author_name;
    vidRequestData.author_email = author.author_email;
    let newRequest = new VideoRequest(vidRequestData);
    return newRequest.save();
  },

  getAllVideoRequests: (filter) => {
    return VideoRequest.find({
      ...(filter !== "all" ? { status: filter } : {}),
    }).sort({ submit_date: "-1" });
  },

  searchRequests: (topic, filter) => {
    return VideoRequest.find({
      topic_title: { $regex: topic, $options: "i" },
      ...(filter !== "all" ? { status: filter } : {}),
    }).sort({ submit_date: "-1" });
  },

  getRequestById: (id) => {
    return VideoRequest.findById({ _id: id });
  },

  updateRequest: (id, status, resVideo) => {
    const updates = {
      status: status,
      video_ref: {
        link: resVideo,
        date: resVideo && new Date(),
      },
    };

    return VideoRequest.findByIdAndUpdate(id, updates, { new: true });
  },

  updateVoteForRequest: async (id, vote_type, user_id) => {
    const oldRequest = await VideoRequest.findById({ _id: id });
    const other_type = vote_type === "ups" ? "downs" : "ups";

    let oldVoteList = oldRequest.votes[vote_type];
    let oldOtherVoteList = oldRequest.votes[other_type];

    if (!oldVoteList.find((id) => id === user_id)) {
      oldVoteList.push(user_id);
    } else {
      oldVoteList = oldVoteList.filter((id) => id !== user_id);
    }

    if (oldOtherVoteList.includes(user_id)) {
      oldOtherVoteList = oldOtherVoteList.filter((id) => id !== user_id);
    }

    return VideoRequest.findByIdAndUpdate(
      { _id: id },
      {
        votes: {
          [vote_type]: oldVoteList,
          [other_type]: oldOtherVoteList,
        },
      },
      { new: true }
    );
  },

  deleteRequest: (id) => {
    return VideoRequest.deleteOne({ _id: id });
  },
};
