import tensorflow as tf
from PIL import Image
import numpy as np
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "verification_model.keras")
DATASET_DIR = os.path.join(BASE_DIR, "..", "AI_Verification_Dataset")

model = tf.keras.models.load_model(MODEL_PATH)

IMG_SIZE = (192, 192)


def get_prediction(image_path):
    img = Image.open(image_path).convert("RGB")
    img = img.resize(IMG_SIZE)

    img_array = np.array(img)
    img_array = np.expand_dims(img_array, axis=0)

    prediction = model.predict(img_array, verbose=0)[0][0]

    if prediction >= 0.5:
        result = "NOT_CLEAN"
    else:
        result = "CLEAN"

    return result, prediction


# ==============================
# CLEAN TEST
# ==============================

clean_folder = os.path.join(DATASET_DIR, "CLEAN")

clean_images = [
    f for f in os.listdir(clean_folder)
    if f.lower().endswith((".jpg", ".jpeg", ".png", ".webp"))
]

clean_correct = 0
clean_wrong = 0

print("\n==============================")
print("CLEAN IMAGE TEST")
print("==============================")

for image_name in clean_images:

    image_path = os.path.join(clean_folder, image_name)

    result, prediction = get_prediction(image_path)

    print(
        f"{image_name} -> "
        f"{result} "
        f"({prediction * 100:.2f}%)"
    )

    if result == "CLEAN":
        clean_correct += 1
    else:
        clean_wrong += 1


# ==============================
# NOT_CLEAN TEST
# ==============================

not_clean_folder = os.path.join(DATASET_DIR, "NOT_CLEAN")

not_clean_images = [
    f for f in os.listdir(not_clean_folder)
    if f.lower().endswith((".jpg", ".jpeg", ".png", ".webp"))
]

not_clean_correct = 0
not_clean_wrong = 0

print("\n==============================")
print("NOT_CLEAN IMAGE TEST")
print("==============================")

for image_name in not_clean_images:

    image_path = os.path.join(not_clean_folder, image_name)

    result, prediction = get_prediction(image_path)

    print(
        f"{image_name} -> "
        f"{result} "
        f"({prediction * 100:.2f}%)"
    )

    if result == "NOT_CLEAN":
        not_clean_correct += 1
    else:
        not_clean_wrong += 1


# ==============================
# FINAL SUMMARY
# ==============================

total_clean = len(clean_images)
total_not_clean = len(not_clean_images)

total_images = total_clean + total_not_clean

total_correct = clean_correct + not_clean_correct

overall_accuracy = (
    total_correct / total_images
) * 100


print("\n==============================")
print("FINAL TEST SUMMARY")
print("==============================")

print("CLEAN images tested:", total_clean)
print("CLEAN correctly detected:", clean_correct)
print("CLEAN incorrectly detected:", clean_wrong)

print("NOT_CLEAN images tested:", total_not_clean)
print("NOT_CLEAN correctly detected:", not_clean_correct)
print("NOT_CLEAN incorrectly detected:", not_clean_wrong)

print(f"Overall Accuracy: {overall_accuracy:.2f}%")

print("==============================")