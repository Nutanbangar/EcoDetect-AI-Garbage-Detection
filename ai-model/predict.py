import tensorflow as tf
import numpy as np
from tensorflow.keras.preprocessing import image

# Load trained model
model = tf.keras.models.load_model("garbage_model.keras")

# Image to test
img_path = r"C:\Users\nutan\Downloads\Plastic_gb.jpg"

# Load and prepare image
img = image.load_img(img_path, target_size=(160, 160))
img_array = image.img_to_array(img)
img_array = img_array / 255.0
img_array = np.expand_dims(img_array, axis=0)

# Predict
prediction = model.predict(img_array)

classes = [
    "cardboard",
    "glass",
    "metal",
    "paper",
    "plastic",
    "trash"
]

result = classes[np.argmax(prediction)]

print("\n==========================")
print("   GARBAGE DETECTION")
print("==========================")
print("Garbage Type:", result)
print("==========================")