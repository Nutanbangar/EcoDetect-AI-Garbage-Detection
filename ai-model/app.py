from flask import Flask, request, jsonify
import tensorflow as tf
from PIL import Image
import numpy as np
import io

app = Flask(__name__)

# ==========================================
# Garbage Detection Model
# ==========================================

garbage_model = tf.keras.models.load_model(
    "garbage_model.keras"
)

garbage_classes = [
    "cardboard",
    "glass",
    "metal",
    "paper",
    "plastic",
    "trash"
]

GARBAGE_IMG_SIZE = 160


# ==========================================
# Cleaning Verification Model
# ==========================================

verification_model = tf.keras.models.load_model(
    "verification_model.keras"
)

VERIFICATION_IMG_SIZE = 192


# ==========================================
# Garbage Type Detection
# ==========================================

@app.route("/predict", methods=["POST"])
def predict():

    if "image" not in request.files:
        return jsonify({
            "error": "No image provided"
        }), 400

    file = request.files["image"]

    try:

        img = Image.open(
            io.BytesIO(file.read())
        ).convert("RGB")

        img = img.resize(
            (GARBAGE_IMG_SIZE, GARBAGE_IMG_SIZE)
        )

        img_array = np.array(img)

        img_array = img_array / 255.0

        img_array = np.expand_dims(
            img_array,
            axis=0
        )

        prediction = garbage_model.predict(
            img_array,
            verbose=0
        )

        result = garbage_classes[
            np.argmax(prediction)
        ]

        return jsonify({
            "garbageType": result
        })

    except Exception as e:

        return jsonify({
            "error": str(e)
        }), 500


# ==========================================
# Cleaning Verification
# ==========================================

@app.route("/verify", methods=["POST"])
def verify():

    if "image" not in request.files:
        return jsonify({
            "error": "No image provided"
        }), 400

    file = request.files["image"]

    try:

        img = Image.open(
            io.BytesIO(file.read())
        ).convert("RGB")

        img = img.resize(
            (VERIFICATION_IMG_SIZE, VERIFICATION_IMG_SIZE)
        )

        img_array = np.array(img)

        # EfficientNetB0 model
        # No MobileNetV2 preprocessing needed

        img_array = np.expand_dims(
            img_array,
            axis=0
        )

        prediction = verification_model.predict(
            img_array,
            verbose=0
        )[0][0]

        if prediction >= 0.5:

            result = "NOT_CLEAN"
            confidence = prediction

        else:

            result = "CLEAN"
            confidence = 1 - prediction

        return jsonify({
            "verificationResult": result,
            "confidence": float(confidence)
        })

    except Exception as e:

        return jsonify({
            "error": str(e)
        }), 500


# ==========================================
# Home
# ==========================================

@app.route("/", methods=["GET"])
def home():

    return "Garbage Detection AI API is running!"


# ==========================================
# Start Flask
# ==========================================

if __name__ == "__main__":

   app.run(
    host="0.0.0.0",
    port=5000
)