from chalice import Chalice, Response
from chalicelib.storage_service import StorageService
import botocore

#####
# chalice app configuration
#####
app = Chalice(app_name='comp264-smartretail')
storage = StorageService('comp264-smartretail')
app.debug = True

app.api.binary_types = ['*/*']

@app.route('/upload/{file_name}', methods=['POST'], content_types=['*/*'])
def upload_file(file_name):
	request = app.current_request
	file_bytes = request.raw_body

	if not file_bytes:
		return Response(body={'error': 'No file body provided'}, status_code=400)

	try:
		result = storage.upload_file(file_bytes, file_name)
		return result
	except botocore.exceptions.ClientError as e:
		return Response(
			body={'error': str(e)},
			status_code=403,
			headers={'Content-Type': 'application/json'}		
		)
