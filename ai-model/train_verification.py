import tensorflow as tf
from tensorflow.keras import layers, models
from tensorflow.keras.applications import EfficientNetB0
from tensorflow.keras.callbacks import (
    EarlyStopping,
    ModelCheckpoint,
    ReduceLROnPlateau
)
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_DIR = os.path.join(BASE_DIR, "..", "AI_Verification_Dataset")
MODEL_PATH = os.path.join(BASE_DIR, "verification_model.keras")

IMG_SIZE = (192, 192)
BATCH_SIZE = 8
SEED = 42

# ==============================
# DATASET
# ==============================

train_dataset = tf.keras.utils.image_dataset_from_directory(
    DATASET_DIR,
    validation_split=0.2,
    subset="training",
    seed=SEED,
    image_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    label_mode="binary"
)

validation_dataset = tf.keras.utils.image_dataset_from_directory(
    DATASET_DIR,
    validation_split=0.2,
    subset="validation",
    seed=SEED,
    image_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    label_mode="binary"
)

print("\n==============================")
print("DATASET")
print("==============================")
print("Classes:", train_dataset.class_names)

AUTOTUNE = tf.data.AUTOTUNE

train_dataset = train_dataset.prefetch(AUTOTUNE)
validation_dataset = validation_dataset.prefetch(AUTOTUNE)

# ==============================
# DATA AUGMENTATION
# ==============================

data_augmentation = tf.keras.Sequential([
    layers.RandomFlip("horizontal"),
    layers.RandomRotation(0.20),
    layers.RandomZoom(0.25),
    layers.RandomContrast(0.20)
])

# ==============================
# BASE MODEL
# ==============================

base_model = EfficientNetB0(
    input_shape=(192, 192, 3),
    include_top=False,
    weights="imagenet"
)

base_model.trainable = False

# ==============================
# MODEL
# ==============================

inputs = layers.Input(shape=(192, 192, 3))

x = data_augmentation(inputs)

x = base_model(x, training=False)

x = layers.GlobalAveragePooling2D()(x)

x = layers.Dense(128, activation="relu")(x)

x = layers.Dropout(0.4)(x)

outputs = layers.Dense(
    1,
    activation="sigmoid"
)(x)

model = models.Model(inputs, outputs)

# ==============================
# PHASE 1
# ==============================

model.compile(
    optimizer=tf.keras.optimizers.Adam(
        learning_rate=0.0001
    ),
    loss="binary_crossentropy",
    metrics=[
        "accuracy",
        tf.keras.metrics.AUC(name="auc"),
        tf.keras.metrics.Precision(name="precision"),
        tf.keras.metrics.Recall(name="recall")
    ]
)

print("\n==============================")
print("PHASE 1 - TRAINING")
print("==============================")

model.fit(
    train_dataset,
    validation_data=validation_dataset,
    epochs=20
)

# ==============================
# PHASE 2 - FINE TUNING
# ==============================

print("\n==============================")
print("PHASE 2 - FINE TUNING")
print("==============================")

base_model.trainable = True

for layer in base_model.layers[:-40]:
    layer.trainable = False

for layer in base_model.layers:
    if isinstance(layer, layers.BatchNormalization):
        layer.trainable = False

model.compile(
    optimizer=tf.keras.optimizers.Adam(
        learning_rate=0.000005
    ),
    loss="binary_crossentropy",
    metrics=[
        "accuracy",
        tf.keras.metrics.AUC(name="auc"),
        tf.keras.metrics.Precision(name="precision"),
        tf.keras.metrics.Recall(name="recall")
    ]
)

checkpoint = ModelCheckpoint(
    MODEL_PATH,
    monitor="val_auc",
    mode="max",
    save_best_only=True,
    verbose=1
)

early_stopping = EarlyStopping(
    monitor="val_auc",
    mode="max",
    patience=7,
    restore_best_weights=True,
    verbose=1
)

reduce_lr = ReduceLROnPlateau(
    monitor="val_loss",
    factor=0.5,
    patience=3,
    min_lr=0.0000005,
    verbose=1
)

model.fit(
    train_dataset,
    validation_data=validation_dataset,
    epochs=30,
    callbacks=[
        checkpoint,
        early_stopping,
        reduce_lr
    ]
)

# ==============================
# FINAL EVALUATION
# ==============================

print("\n==============================")
print("FINAL MODEL EVALUATION")
print("==============================")

results = model.evaluate(
    validation_dataset,
    verbose=0
)

for name, value in zip(model.metrics_names, results):
    print(f"{name}: {value:.4f}")

print("\n==============================")
print("AI VERIFICATION TRAINING DONE")
print("==============================")

print("Model saved at:")
print(MODEL_PATH)

print("==============================")