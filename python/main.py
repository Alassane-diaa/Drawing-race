from google.cloud import storage
import os

# CONFIG
BUCKET_NAME = "quickdraw_dataset"
PREFIX = "sketchrnn/"
LOCAL_DIR = "./quickdraw_data"

os.makedirs(LOCAL_DIR, exist_ok=True)

client = storage.Client.create_anonymous_client()
bucket = client.bucket(BUCKET_NAME)

blobs = client.list_blobs(BUCKET_NAME, prefix=PREFIX)

print("Downloading files...")

for blob in blobs:
    if blob.name.endswith(".npz"):
        filename = os.path.join(LOCAL_DIR, os.path.basename(blob.name))
        
        if not os.path.exists(filename):
            print(f"Downloading {blob.name}...")
            blob.download_to_filename(filename)

print("Done!")




