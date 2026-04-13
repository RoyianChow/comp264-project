from chalice import Chalice, Response
import csv
import io
import uuid

app = Chalice(app_name='smart-retail-api')

@app.route('/upload', methods=['POST'], cors=True, content_types=['text/csv'])
def upload_csv():
    request = app.current_request

    if request.raw_body is None or len(request.raw_body) == 0:
        return Response(
            body={'success': False, 'message': 'No CSV data received.'},
            status_code=400
        )

    try:
        csv_text = request.raw_body.decode('utf-8')
        reader = csv.DictReader(io.StringIO(csv_text))
        rows = list(reader)

        if not rows:
            return Response(
                body={'success': False, 'message': 'CSV contains no data rows.'},
                status_code=400
            )

        result_id = str(uuid.uuid4())

        return {
            'success': True,
            'message': 'CSV uploaded and parsed successfully.',
            'resultId': result_id,
            'rowCount': len(rows),
            'columns': reader.fieldnames or []
        }

    except UnicodeDecodeError:
        return Response(
            body={'success': False, 'message': 'Could not decode CSV as UTF-8.'},
            status_code=400
        )
    except Exception as e:
        return Response(
            body={'success': False, 'message': f'Failed to parse CSV: {str(e)}'},
            status_code=500
        )