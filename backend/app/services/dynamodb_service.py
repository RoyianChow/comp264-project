import boto3
import os

dynamodb = boto3.resource("dynamodb")
TABLE_NAME = os.environ.get("DYNAMODB_TABLE_NAME")
table = dynamodb.Table(TABLE_NAME)


def get_extracted_text_for_key(key: str) -> str:
    response = table.get_item(
        Key={
            "PK": f"FILE#{key}",
            "SK": "RESULT"
        }
    )

    item = response.get("Item")
    if not item:
        return ""

    return item.get("extracted_text", "")