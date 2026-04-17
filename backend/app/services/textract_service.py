import os
import boto3

AWS_REGION = os.environ.get("AWS_REGION", "us-east-2")
S3_BUCKET = os.environ.get("S3_BUCKET_NAME")

textract = boto3.client("textract", region_name=AWS_REGION)


def extract_text_from_s3(bucket: str, key: str):
    response = textract.detect_document_text(
        Document={
            "S3Object": {
                "Bucket": bucket,
                "Name": key
            }
        }
    )

    lines = []
    words = []

    for block in response.get("Blocks", []):
        block_type = block.get("BlockType")

        if block_type == "LINE":
            text = block.get("Text", "").strip()
            if text:
                lines.append(text)

        elif block_type == "WORD":
            text = block.get("Text", "").strip()
            if text:
                words.append(text)

    full_text = "\n".join(lines)

    return {
        "lines": lines,
        "words": words,
        "full_text": full_text,
        "raw": response
    }


def get_extracted_text_for_key(key: str) -> str:
    if not S3_BUCKET:
        raise Exception("S3_BUCKET_NAME is not set")

    result = extract_text_from_s3(S3_BUCKET, key)
    return result.get("full_text", "")