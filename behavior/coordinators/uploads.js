import { post, get } from "../api/rest"
import { setRecentUploads } from "../../state/upload/action"
import { HandleError } from "./errors"

import AWS from "aws-sdk"
import Moment from "moment"

const s3 = new AWS.S3({
  accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY,
  secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY
})
  

export const UploadVideo = (dispatch) => async ({ userId, file, fileName }) => {
  console.log("uploading", userId, file, fileName)
  try {
    const uploadId = Moment().format("YYYY_MM_DD_hh_mm_ss")
    const params = {
      Bucket: process.env.NEXT_PUBLIC_SWINGS_BUCKET,
      Key: `originals/${userId}/${uploadId}/${fileName}`,
      Body: file,
      ACL: "public-read",
    }

    s3.upload(params, async (err, data) => {
      if (err) {
        HandleError(dispatch, err)
        return false
      }
      const response = await post("/uploads", { originalURL: data.Location })
      console.log("create_swing_upload response", response )
    })
  }
  catch( err ) {
    HandleError(dispatch, err)
    return false
  }
  return true
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