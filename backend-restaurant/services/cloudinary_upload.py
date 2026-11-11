import hashlib
import json
import os
import time
import urllib.error
import urllib.parse
import urllib.request

UPLOAD_FOLDER = os.getenv("CLOUDINARY_FOLDER", "vinhky")
MAX_DATA_URL_LENGTH = 8 * 1024 * 1024


class CloudinaryError(Exception):
    pass


def _config():
    cloud_name = os.getenv("CLOUDINARY_CLOUD_NAME")
    api_key = os.getenv("CLOUDINARY_API_KEY")
    api_secret = os.getenv("CLOUDINARY_API_SECRET")
    if not (cloud_name and api_key and api_secret):
        raise CloudinaryError("Cloudinary chưa được cấu hình trên máy chủ.")
    return cloud_name, api_key, api_secret


def upload_image(data_url: str) -> str:
    """Upload a base64 data URL to Cloudinary and return its secure URL."""
    if not data_url.startswith("data:image/"):
        raise CloudinaryError("Tệp tải lên không phải hình ảnh.")
    if len(data_url) > MAX_DATA_URL_LENGTH:
        raise CloudinaryError("Hình ảnh quá lớn.")

    cloud_name, api_key, api_secret = _config()
    params = {"folder": UPLOAD_FOLDER, "timestamp": str(int(time.time()))}
    to_sign = "&".join(f"{key}={params[key]}" for key in sorted(params))
    signature = hashlib.sha1((to_sign + api_secret).encode("utf-8")).hexdigest()

    body = urllib.parse.urlencode(
        {**params, "file": data_url, "api_key": api_key, "signature": signature}
    ).encode("utf-8")
    request = urllib.request.Request(
        f"https://api.cloudinary.com/v1_1/{cloud_name}/image/upload", data=body
    )
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            payload = json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as error:
        try:
            message = json.loads(error.read().decode("utf-8"))["error"]["message"]
        except Exception:
            message = "Cloudinary từ chối yêu cầu."
        raise CloudinaryError(message) from error
    except (urllib.error.URLError, TimeoutError) as error:
        raise CloudinaryError("Không kết nối được Cloudinary.") from error

    url = payload.get("secure_url")
    if not url:
        raise CloudinaryError("Cloudinary không trả về đường dẫn ảnh.")
    return url
