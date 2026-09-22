import tensorflow as tf
from tensorflow.keras import layers, models
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.preprocessing.image import ImageDataGenerator

# =========================
# SETTINGS
# =========================

dataset_path = r"E:\GarbageDetection\dataset-resized"

IMG_SIZE = 160
BATCH_SIZE = 32
EPOCHS = 10

# =========================
# DATASET
# =========================

datagen = ImageDataGenerator(
    rescale=1.0 / 255,
    validation_split=0.2,
    rotation_range=20,
    width_shift_range=0.15,
    height_shift_range=0.15,
    zoom_range=0.15,
    horizontal_flip=True
)

train_data = datagen.flow_from_directory(
    dataset_path,
    target_size=(IMG_SIZE, IMG_SIZE),
    batch_size=BATCH_SIZE,
    class_mode="categorical",
    subset="training",
    shuffle=True
)

validation_data = datagen.flow_from_directory(
    dataset_path,
    target_size=(IMG_SIZE, IMG_SIZE),
    batch_size=BATCH_SIZE,
    class_mode="categorical",
    subset="validation",
    shuffle=False
)

# =========================
# MOBILE NET V2
# =========================

base_model = MobileNetV2(
    weights="imagenet",
    include_top=False,
    input_shape=(IMG_SIZE, IMG_SIZE, 3)
)

# Freeze pre-trained layers
base_model.trainable = False

# =========================
# CREATE MODEL
# =========================

model = models.Sequential([
    layers.Input(shape=(IMG_SIZE, IMG_SIZE, 3)),

    layers.RandomFlip("horizontal"),
    layers.RandomRotation(0.1),
    layers.RandomZoom(0.1),

    base_model,

    layers.GlobalAveragePooling2D(),

    layers.Dense(128, activation="relu"),
    layers.Dropout(0.4),

    layers.Dense(6, activation="softmax")
])

# =========================
# COMPILE
# =========================

model.compile(
    optimizer="adam",
    loss="categorical_crossentropy",
    metrics=["accuracy"]
)

# =========================
# SHOW MODEL
# =========================

model.summary()

# =========================
# TRAIN
# =========================

print("\nStarting AI model training...\n")

history = model.fit(
    train_data,
    validation_data=validation_data,
    epochs=EPOCHS
)

# =========================
# SAVE MODEL
# =========================

model.save(
    r"E:\GarbageDetection\ai-model\garbage_model.keras"
)

print("\n==============================")
print("Training completed successfully!")
print("==============================")
print("Model saved as garbage_model.keras")

print("\nGarbage Classes:")
print(train_data.class_indices)