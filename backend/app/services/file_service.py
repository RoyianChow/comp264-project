from services.s3_service import generate_download_url
from services.textract_service import get_extracted_text_for_key
from services.polly_service import get_existing_polly_audio_url


def get_file_details_payload(key: str):
    file_url = generate_download_url(key)
    lower_key = key.lower()

    if lower_key.endswith((".jpg", ".jpeg", ".png", ".pdf")):
        extracted_text = get_extracted_text_for_key(key)
    elif lower_key.endswith(".csv"):
        extracted_text = "This is a CSV file. Textract does not support CSV extraction."
    else:
        extracted_text = "Preview/extraction is not supported for this file type."

    return {
        "success": True,
        "key": key,
        "imageUrl": file_url,
        "extractedText": extracted_text,
        "pollyAudioUrl": get_existing_polly_audio_url(key)
    }