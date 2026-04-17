import boto3
import os

AWS_REGION = os.environ.get("AWS_REGION", "us-east-2")
S3_BUCKET = os.environ.get("S3_BUCKET_NAME")

s3 = boto3.client("s3", region_name=AWS_REGION)
print("S3_BUCKET_NAME =", S3_BUCKET)


def upload_file(file_bytes: bytes, key: str, content_type: str = "application/octet-stream"):
    if not S3_BUCKET:
        raise Exception("S3_BUCKET_NAME is not set")

    s3.put_object(
        Bucket=S3_BUCKET,
        Key=key,
        Body=file_bytes,
        ContentType=content_type
    )

    return key


def list_files(prefix: str = ""):
    if not S3_BUCKET:
        raise Exception("S3_BUCKET_NAME is not set")

    response = s3.list_objects_v2(
        Bucket=S3_BUCKET,
        Prefix=prefix
    )

    files = []
    for obj in response.get("Contents", []):
        key = obj["Key"]

        if key.endswith("/"):
            continue

        files.append({
            "key": key,
            "size": obj.get("Size", 0),
            "lastModified": obj.get("LastModified").isoformat() if obj.get("LastModified") else None
        })

    return files


def generate_download_url(key: str, expires_in: int = 3600):
    if not S3_BUCKET:
        raise Exception("S3_BUCKET_NAME is not set")

    return s3.generate_presigned_url(
        "get_object",
        Params={
            "Bucket": S3_BUCKET,
            "Key": key
        },
        ExpiresIn=expires_in
    )