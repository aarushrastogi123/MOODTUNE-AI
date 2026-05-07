"""
MoodTune AI — Emotion Model Architecture (FER2013-inspired)
Defines a CNN model for facial expression recognition using TensorFlow/Keras.
Trained or loaded from a pre-trained .h5 file.

Architecture Reference: FER2013 dataset — 48x48 grayscale face images
Classes: angry, disgust, fear, happy, neutral, sad, surprise
"""

import os
import numpy as np
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers


# Emotion class labels (matches FER2013 dataset order)
EMOTION_LABELS = ["angry", "disgust", "fear", "happy", "neutral", "sad", "surprise"]

# Input shape for the model
IMG_SIZE = 48
INPUT_SHAPE = (IMG_SIZE, IMG_SIZE, 1)


def build_emotion_model(num_classes: int = 7) -> keras.Model:
    """
    Build a CNN model for facial emotion recognition.
    Architecture: 4 Conv blocks → GlobalAveragePooling → Dense classifier.

    This architecture achieves ~65-70% accuracy on FER2013 validation set.
    For production, use a pre-trained model (provided in models/ directory).
    """
    inputs = keras.Input(shape=INPUT_SHAPE)

    # ── Block 1 ──────────────────────────────────────────────────────────────
    x = layers.Conv2D(32, (3, 3), padding="same")(inputs)
    x = layers.BatchNormalization()(x)
    x = layers.Activation("relu")(x)
    x = layers.Conv2D(32, (3, 3), padding="same")(x)
    x = layers.BatchNormalization()(x)
    x = layers.Activation("relu")(x)
    x = layers.MaxPooling2D((2, 2))(x)
    x = layers.Dropout(0.25)(x)

    # ── Block 2 ──────────────────────────────────────────────────────────────
    x = layers.Conv2D(64, (3, 3), padding="same")(x)
    x = layers.BatchNormalization()(x)
    x = layers.Activation("relu")(x)
    x = layers.Conv2D(64, (3, 3), padding="same")(x)
    x = layers.BatchNormalization()(x)
    x = layers.Activation("relu")(x)
    x = layers.MaxPooling2D((2, 2))(x)
    x = layers.Dropout(0.25)(x)

    # ── Block 3 ──────────────────────────────────────────────────────────────
    x = layers.Conv2D(128, (3, 3), padding="same")(x)
    x = layers.BatchNormalization()(x)
    x = layers.Activation("relu")(x)
    x = layers.Conv2D(128, (3, 3), padding="same")(x)
    x = layers.BatchNormalization()(x)
    x = layers.Activation("relu")(x)
    x = layers.MaxPooling2D((2, 2))(x)
    x = layers.Dropout(0.25)(x)

    # ── Block 4 ──────────────────────────────────────────────────────────────
    x = layers.Conv2D(256, (3, 3), padding="same")(x)
    x = layers.BatchNormalization()(x)
    x = layers.Activation("relu")(x)
    x = layers.GlobalAveragePooling2D()(x)

    # ── Classifier Head ───────────────────────────────────────────────────────
    x = layers.Dense(256, activation="relu")(x)
    x = layers.Dropout(0.5)(x)
    x = layers.Dense(128, activation="relu")(x)
    x = layers.Dropout(0.3)(x)
    outputs = layers.Dense(num_classes, activation="softmax")(x)

    model = keras.Model(inputs=inputs, outputs=outputs, name="MoodTune_EmotionCNN")
    return model


def compile_model(model: keras.Model) -> keras.Model:
    """Compile the model with Adam optimizer and categorical crossentropy."""
    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate=0.001),
        loss="categorical_crossentropy",
        metrics=["accuracy"],
    )
    return model


def get_training_callbacks(checkpoint_path: str) -> list:
    """
    Return a list of Keras callbacks for training:
    - ModelCheckpoint: Save best model
    - ReduceLROnPlateau: Reduce LR when validation loss plateaus
    - EarlyStopping: Stop early to prevent overfitting
    """
    return [
        keras.callbacks.ModelCheckpoint(
            filepath=checkpoint_path,
            monitor="val_accuracy",
            save_best_only=True,
            verbose=1,
        ),
        keras.callbacks.ReduceLROnPlateau(
            monitor="val_loss",
            factor=0.5,
            patience=5,
            min_lr=1e-6,
            verbose=1,
        ),
        keras.callbacks.EarlyStopping(
            monitor="val_accuracy",
            patience=15,
            restore_best_weights=True,
            verbose=1,
        ),
    ]


if __name__ == "__main__":
    # Build and summarize the model for verification
    model = build_emotion_model()
    model = compile_model(model)
    model.summary()
    print(f"\nTotal Parameters: {model.count_params():,}")
