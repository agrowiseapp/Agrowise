const axios = require("axios");
const FormData = require("form-data");

class ImageUploadService {
  constructor() {
    this.apiKey = process.env.IMGBB_API_KEY;
    this.uploadUrl = "https://api.imgbb.com/1/upload";

    // Validate API key on initialization
    if (!this.apiKey) {
      console.warn("WARNING: IMGBB_API_KEY not found in environment variables");
    }
  }

  async uploadImage(imageBase64, filename) {
    try {
      if (!this.apiKey) {
        throw new Error("ImgBB API key not configured");
      }
      const form = new FormData();
      form.append("image", imageBase64);

      const headers = form.getHeaders();

      const response = await axios.post(
        this.uploadUrl + `?key=${this.apiKey}`,
        form,
        { headers }
      );

      if (response.data.success) {
        console.log("✅ ImgBB: Image uploaded successfully");
        return {
          success: true,
          url: response.data.data.url,
          deleteUrl: response.data.data.delete_url,
          thumbnail: response.data.data.thumb?.url || response.data.data.url,
        };
      } else {
        throw new Error(response.data.error?.message || "Upload failed");
      }
    } catch (error) {
      console.log("❌ ImgBB: Upload failed -", error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async uploadImageFromBase64(base64Data, filename) {
    try {
      if (!base64Data) {
        throw new Error("No image data provided");
      }
      // Robustly strip the prefix
      const base64Image = base64Data.replace(
        /^data:image\/[a-zA-Z0-9+]+;base64,/,
        ""
      );
      if (
        !base64Image ||
        base64Image.length === 0 ||
        base64Image.startsWith("data:")
      ) {
        throw new Error("Invalid image data after stripping prefix");
      }
      // Do NOT convert to Buffer, just send the string!
      return await this.uploadImage(base64Image, filename);
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  validateImageFile(file) {
    try {
      // Check if file exists
      if (!file) {
        return {
          valid: false,
          error: "No file provided",
        };
      }
      // Check file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        return {
          valid: false,
          error: "File size must be less than 5MB",
        };
      }
      // Check file type
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
      ];
      if (!allowedTypes.includes(file.type)) {
        return {
          valid: false,
          error: "Only JPEG, PNG, GIF, and WebP images are allowed",
        };
      }
      return { valid: true };
    } catch (error) {
      console.error("File validation error:", error);
      return {
        valid: false,
        error: "File validation failed",
      };
    }
  }

  // Method to check if service is available
  isServiceAvailable() {
    return !!this.apiKey;
  }
}

// Export an instance, not the class
module.exports = new ImageUploadService();
