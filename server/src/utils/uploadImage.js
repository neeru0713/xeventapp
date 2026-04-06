import { cloudinary, hasCloudinaryConfig } from '../config/cloudinary.js'

const uploadImage = async (file) => {
  if (!file) {
    return ''
  }

  if (!hasCloudinaryConfig) {
    return `data:${file.mimetype};base64,${file.buffer.toString('base64')}`
  }

  const dataUri = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`
  const response = await cloudinary.uploader.upload(dataUri, {
    folder: 'xevents',
  })

  return response.secure_url
}

export default uploadImage
