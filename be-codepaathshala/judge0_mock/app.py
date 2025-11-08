from flask import Flask, request, jsonify
import base64

app = Flask(__name__)


def make_response_status(accepted=True, stdout_text=""):
    # status id 3 = accepted, 4 = wrong answer, other ids represent compile/runtime errors
    status_id = 3 if accepted else 4
    stdout_b64 = base64.b64encode(stdout_text.encode()).decode() if stdout_text is not None else None
    return {
        "status": {"id": status_id},
        "stdout": stdout_b64,
        "compile_output": "",
        "stderr": ""
    }


@app.route('/submissions/', methods=['POST'])
def submissions():
    # Accept both base64-encoded and plain payloads for basic testing
    # This mock always returns an Accepted response for simple flows.
    try:
        # return accepted with empty stdout by default
        resp = make_response_status(accepted=True, stdout_text="")
        return jsonify(resp)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/submissions/batch', methods=['POST'])
def submissions_batch():
    # Return a simple batch response
    try:
        return jsonify({"tokens": ["mock-token-1", "mock-token-2"], "status": "ok"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/languages/', methods=['GET'])
def languages():
    return jsonify([{"id": 71, "name": "python3"}, {"id": 82, "name": "cpp"}])


@app.route('/languages/<int:lid>/', methods=['GET'])
def language_detail(lid):
    return jsonify({"id": lid, "name": f"lang-{lid}"})


@app.route('/statuses', methods=['GET'])
def statuses():
    return jsonify({"statuses": []})


@app.route('/statistics', methods=['GET'])
def statistics():
    return jsonify({"statistics": {}})


@app.route('/workers', methods=['GET'])
def workers():
    return jsonify({"workers": []})


@app.route('/about', methods=['GET'])
def about():
    return jsonify({"about": "Judge0 Mock"})


@app.route('/version', methods=['GET'])
def version():
    return jsonify({"version": "mock-1.0"})


@app.route('/isolate', methods=['GET'])
def isolate():
    return jsonify({"isolate": True})


@app.route('/license', methods=['GET'])
def license_info():
    return jsonify({"license": "mock"})


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3000)
