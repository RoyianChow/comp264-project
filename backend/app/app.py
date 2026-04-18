from chalice import Chalice, Response
import uuid
import boto3
import os

from services.s3_service import (
    upload_file,
    list_files,
    generate_download_url,
    delete_file_and_related_files,
    S3_BUCKET,
)
from services.file_service import get_file_details_payload
from services.polly_service import generate_polly_audio_for_file

app = Chalice(app_name='smart-retail-api')

AWS_REGION = os.environ.get("AWS_REGION", "us-east-2")
s3 = boto3.client("s3", region_name=AWS_REGION)


def error_response(message: str, status_code: int = 500):
    return Response(
        body={"success": False, "message": message},
        status_code=status_code
    )


@app.route(
    '/upload',
    methods=['POST'],
    cors=True,
    content_types=['image/jpeg', 'image/png', 'text/csv']
)
def upload_image():
    request = app.current_request

    if not request.raw_body:
        return error_response("No file data received.", 400)

    try:
        content_type = request.headers.get("content-type", "image/jpeg").lower()
        allowed_types = {
            "image/jpeg": "jpg",
            "image/png": "png",
            "text/csv": "csv",
        }

        if content_type not in allowed_types:
            return error_response("Only JPG, PNG, and CSV files are supported.", 400)

        extension = allowed_types[content_type]
        file_id = str(uuid.uuid4())
        s3_key = f"uploads/{file_id}.{extension}"

        upload_file(
            file_bytes=request.raw_body,
            key=s3_key,
            content_type=content_type
        )

        return {
            "success": True,
            "message": "File uploaded to S3 successfully.",
            "s3Key": s3_key
        }

    except Exception as e:
        print("UPLOAD ERROR:", repr(e))
        return error_response(f"Failed to upload file: {str(e)}")


@app.route('/files', methods=['GET'], cors=True)
def get_files():
    try:
        files = list_files(prefix="uploads/")
        return {
            "success": True,
            "files": [
                {
                    "key": file["key"],
                    "size": file["size"],
                    "lastModified": file["lastModified"],
                    "downloadUrl": generate_download_url(file["key"])
                }
                for file in files
            ]
        }
    except Exception as e:
        print("FILES ERROR:", repr(e))
        return error_response(str(e))


@app.route('/file-details', methods=['GET'], cors=True)
def file_details():
    request = app.current_request
    key = request.query_params.get("key") if request.query_params else None

    if not key:
        return error_response("Missing file key", 400)

    try:
        return get_file_details_payload(key)
    except Exception as e:
        print("FILE DETAILS ERROR:", repr(e))
        return error_response(str(e))


@app.route('/polly', methods=['POST'], cors=True, content_types=['application/json'])
def generate_polly_audio():
    request = app.current_request
    data = request.json_body

    if not data:
        return error_response("Missing request body", 400)

    key = data.get("key")
    text = data.get("text")

    if not key or not text:
        return error_response("Both 'key' and 'text' are required", 400)

    if not S3_BUCKET:
        return error_response("S3_BUCKET_NAME environment variable is not set", 500)

    try:
        result = generate_polly_audio_for_file(key, text)
        return {
            "success": True,
            "audioUrl": result["audioUrl"],
            "audioKey": result["audioKey"],
            "message": "Polly audio generated successfully"
        }
    except Exception as e:
        print("POLLY ERROR:", repr(e))
        return error_response(f"Failed to generate Polly audio: {str(e)}")


@app.route('/delete', methods=['POST'], cors=True, content_types=['application/json'])
def delete_file():
    request = app.current_request
    data = request.json_body

    if not data or "key" not in data:
        return error_response("Missing file key", 400)

    try:
        delete_file_and_related_files(s3, data["key"])
        return {
            "success": True,
            "message": "File deleted successfully"
        }
    except Exception as e:
        print("DELETE ERROR:", repr(e))
        return error_response(str(e))