import boto3


class StorageService:
    def __init__(self, storage_location):
        session = boto3.Session(profile_name='backend')
        self.client = boto3.client('s3')
        self.bucket_name = storage_location

    def get_storage_location(self):
        return self.bucket_name

    def upload_file(self, file_bytes, file_name):
        s3_key = f"uploads/{file_name}"

        self.client.put_object(Bucket = self.bucket_name,
                               Body = file_bytes,
                               Key = s3_key,
                               )

        return {'fileId': s3_key,
                'fileUrl': "http://" + self.bucket_name + ".s3.amazonaws.com/" + file_name}
