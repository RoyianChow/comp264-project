from chalice import Chalice, Response
import uuid

from services.s3_service import (
    upload_file,
    list_files,
    generate_download_url,
)
from services.textract_service import get_extracted_text_for_key

app = Chalice(app_name='smart-retail-api')


@app.route(
    '/upload',
    methods=['POST'],
    cors=True,
    content_types=['image/jpeg', 'image/png']
)
def upload_image():
    request = app.current_request

    if request.raw_body is None or len(request.raw_body) == 0:
        return Response(
            body={
                'success': False,
                'message': 'No file data received.'
            },
            status_code=400
        )

    try:
        content_type = request.headers.get("content-type", "image/jpeg").lower()

        if content_type not in ["image/jpeg", "image/png"]:
            return Response(
                body={
                    'success': False,
                    'message': 'Only JPG and PNG files are supported.'
                },
                status_code=400
            )

        extension = "jpg"
        if content_type == "image/png":
            extension = "png"

        file_id = str(uuid.uuid4())
        s3_key = f"uploads/{file_id}.{extension}"

        upload_file(
            file_bytes=request.raw_body,
            key=s3_key,
            content_type=content_type
        )

        return {
            'success': True,
            'message': 'Image uploaded to S3 successfully.',
            's3Key': s3_key
        }

    except Exception as e:
        print("UPLOAD ERROR:", repr(e))
        return Response(
            body={
                'success': False,
                'message': f'Failed to upload image: {str(e)}'
            },
            status_code=500
        )


@app.route('/files', methods=['GET'], cors=True)
def get_files():
    try:
        files = list_files(prefix="uploads/")

        result = []
        for file in files:
            result.append({
                "key": file["key"],
                "size": file["size"],
                "lastModified": file["lastModified"],
                "downloadUrl": generate_download_url(file["key"])
            })

        return {
            "success": True,
            "files": result
        }

    except Exception as e:
        print("FILES ERROR:", repr(e))
        return Response(
            body={
                "success": False,
                "message": str(e)
            },
            status_code=500
        )


@app.route('/file-details', methods=['GET'], cors=True)
def file_details():
    request = app.current_request
    key = request.query_params.get("key") if request.query_params else None

    if not key:
        return Response(
            body={
                "success": False,
                "message": "Missing file key"
            },
            status_code=400
        )

    try:
        image_url = generate_download_url(key)
        extracted_text = get_extracted_text_for_key(key)

        return {
            "success": True,
            "key": key,
            "imageUrl": image_url,
            "extractedText": extracted_text
        }

    except Exception as e:
        print("FILE DETAILS ERROR:", repr(e))
        return Response(
            body={
                "success": False,
                "message": str(e)
            },
            status_code=500
        )