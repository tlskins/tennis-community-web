import { post } from "../api/rest"
import { HandleError } from "./errors"

import AWS from "aws-sdk"
import Moment from "moment"

const s3 = new AWS.S3({
  accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY,
  secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY
})
  

export const UploadVideo = (dispatch) => async ({ userId, file, fileName, fileType }) => {
  console.log("uploading", userId, file, fileName)
  try {
    // const { data: { url: uploadUrl } } = await get("/uploads/upload_url", { fileName } )
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
      const { Bucket, Key, Location } = data
      console.log("uploaded to s3", Bucket, Key, Location )
      const response = await post("/users/create_swing_upload", { originalURL: Location })
      console.log("create_swing_upload response", response )
    })
  }
  catch( err ) {
    HandleError(dispatch, err)
    return false
  }
  return true
}