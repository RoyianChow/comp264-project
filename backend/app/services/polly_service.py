import boto3
import os

from services.s3_service import upload_file, generate_download_url, S3_BUCKET

AWS_REGION = os.environ.get("AWS_REGION", "us-east-2")

polly = boto3.client("polly", region_name=AWS_REGION)
s3 = boto3.client("s3", region_name=AWS_REGION)


def sanitize_text_for_polly(text: str) -> str:
    # strips excess whitespace and newlines
    return " ".join(text.split()).strip()


def build_audio_key_from_file_key(file_key: str) -> str:
    # converts file path to audio destination key
    # e.g. images/receiptX.jpg -> audio/receiptX.mp3
    base_name = file_key.rsplit(".", 1)[0].split("/")[-1]
    return f"audio/{base_name}.mp3"


def generate_polly_audio_for_file(file_key: str, text: str, voice_id: str = "Joanna"):
    """
    converts text to speech (TTS) using AWS Polly and saves the MP3 to the corresponding S3 bucket
    """
    clean_text = sanitize_text_for_polly(text)

    if not clean_text:
        raise Exception("Text cannot be empty")

    audio_key = build_audio_key_from_file_key(file_key)

    # synthesizes the speech (truncating at 3000 characters)
    polly_response = polly.synthesize_speech(
        Text=clean_text[:3000],
        OutputFormat="mp3",
        VoiceId=voice_id
    )

    audio_stream = polly_response.get("AudioStream")
    if audio_stream is None:
        raise Exception("No audio stream returned from Polly")

    audio_bytes = audio_stream.read()

    # saves the generated audio to S3
    upload_file(
        file_bytes=audio_bytes,
        key=audio_key,
        content_type="audio/mpeg"
    )

    return {
        "audioKey": audio_key,
        "audioUrl": generate_download_url(audio_key)
    }


def get_existing_polly_audio_url(file_key: str):
    """ 
    checks S3 bucket for an existing audio file to avoid redundancy
    """
    
    if not S3_BUCKET:
        return None

    audio_key = build_audio_key_from_file_key(file_key)

    try:
        # checks file existence without the need to download
        s3.head_object(Bucket=S3_BUCKET, Key=audio_key)
        return generate_download_url(audio_key)
    except Exception:
        return None