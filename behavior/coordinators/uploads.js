import { post, get } from "../api/rest"
import { setRecentUploads } from "../../state/upload/action"
import { HandleError } from "./errors"
import { newNotification } from "../../state/ui/action"

import AWS from "aws-sdk"
import Moment from "moment"

const s3 = new AWS.S3({
  accessKeyId: process.env.VERCEL_GIT_COMMIT_REF === "production"
    ? process.env.NEXT_PUBLIC_PROD_AWS_ACCESS_KEY
    : process.env.NEXT_PUBLIC_AWS_ACCESS_KEY,
  secretAccessKey: process.env.VERCEL_GIT_COMMIT_REF === "production"
    ? process.env.NEXT_PUBLIC_PROD_AWS_SECRET_ACCESS_KEY
    : process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY,
})
  

export const UploadVideo = (dispatch, callback = () => {}) => async ({
  userId,
  file,
  fileName,
  albumName,
  isPublic,
  isViewableByFriends,
  friendIds,
}) => {
  console.log("uploading", userId, file, fileName)
  // NEXT_PUBLIC_SWINGS_BUCKET
  try {
    const uploadId = Moment().format("MMMDD_hhmm_ss_a_YYYY")
    const params = {
      Bucket: process.env.VERCEL_GIT_COMMIT_REF === "production"
        ? process.env.NEXT_PUBLIC_PROD_SWINGS_BUCKET
        : process.env.NEXT_PUBLIC_SWINGS_BUCKET,
      Key: `originals/${userId}/${uploadId}/${fileName}`,
      Body: file,
      ACL: "public-read",
    }

    s3.upload(params, async (err, data) => {
      if (err) {
        HandleError(dispatch, err)
        return false
      }
      const response = await post("/uploads", {
        originalURL: data.Location,
        albumName,
        isPublic,
        isViewableByFriends,
        friendIds,
      })
      console.log("create_swing_upload response", response )

      dispatch(newNotification({ message: `Processing new album: ${albumName} ETA ~10 minutes` }))

      if (callback) {
        callback(response)
      }
    })
  }
  catch( err ) {
    HandleError(dispatch, err)
  }
}


export const GetRecentUploads = (dispatch) => async () => {
  try {
    const response = await get("/uploads")
    dispatch(setRecentUploads(response.data))
  }
  catch( err ) {
    HandleError(dispatch, err)
    return false
  }
  return true
}