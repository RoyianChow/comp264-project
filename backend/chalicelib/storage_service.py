import boto3

class StorageService:
    def __init__(self, storage_location):
        """
        initializes S3 client and sets target bucket
        """

        # creates AWS session using our 'backend' local profile
        session = boto3.Session(profile_name='backend')
        self.client = boto3.client('s3')
        self.bucket_name = storage_location

    def get_storage_location(self):
        # returns configures S3 bucket name
        return self.bucket_name

    def upload_file(self, file_bytes, file_name):
        """
        uploads file bytes to the 'uploads/' directory in S3
        """
        s3_key = f"uploads/{file_name}"

        # puts the raw file data into the bucket
        self.client.put_object(Bucket = self.bucket_name,
                               Body = file_bytes,
                               Key = s3_key,
                               )

        # returns the object key and constructs a basic public HHTP URL 
        return {'fileId': s3_key,
                'fileUrl': "http://" + self.bucket_name + ".s3.amazonaws.com/" + file_name}
