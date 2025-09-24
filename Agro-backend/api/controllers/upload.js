const imageUploadService = require("../utils/imageUploadService");
const { createResponse } = require("../utils/responseUtils");

exports.upload_image = async (req, res, next) => {
  try {
    const { imageData, filename } = req.body;

    // Validate input
    if (!imageData) {
      const response = createResponse("error", 1, "Image data is required");
      return res.status(400).json(response);
    }

    // Check if image upload service is available
    if (!imageUploadService.isServiceAvailable()) {
      const response = createResponse(
        "error",
        1,
        "Image upload service is not configured"
      );
      return res.status(503).json(response);
    }

    // Upload image to ImgBB
    const result = await imageUploadService.uploadImageFromBase64(
      imageData,
      filename || `image_${Date.now()}.jpg`
    );

    if (result.success) {
      const response = createResponse(
        "success",
        0,
        "Image uploaded successfully",
        {
          imageUrl: result.url,
          thumbnailUrl: result.thumbnail,
          deleteUrl: result.deleteUrl,
        }
      );
      res.status(200).json(response);
    } else {
      console.error("Image upload failed:", result.error);
      const response = createResponse(
        "error",
        1,
        result.error || "Upload failed"
      );
      res.status(500).json(response);
    }
  } catch (error) {
    console.error("Upload controller error:", error);
    const response = createResponse("error", 1, "Upload service unavailable");
    res.status(500).json(response);
  }
};
