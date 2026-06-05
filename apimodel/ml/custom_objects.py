import tensorflow as tf
from tensorflow.keras.layers import Dense

# Custom Loss untuk Model A (Burnout Predictor)
class WeightedBurnoutLoss(tf.keras.losses.Loss):
    def __init__(self, high_burnout_weight=2.0, threshold=7.0, **kwargs):
        super().__init__(**kwargs)
        self.high_burnout_weight = high_burnout_weight
        self.threshold = threshold

    def call(self, y_true, y_pred):
        huber = tf.keras.losses.Huber(delta=1.0)
        base_loss = huber(y_true, y_pred)
        weights = tf.where(y_true > self.threshold, self.high_burnout_weight, 1.0)
        return tf.reduce_mean(weights * base_loss)

# Custom Attention Layer untuk Model C (Emotion Classifier)
class TextAttentionLayer(tf.keras.layers.Layer):
    def __init__(self, units, **kwargs):
        super().__init__(**kwargs)
        self.units = units
        self.W = Dense(units, activation='tanh')
        self.V = Dense(1)

    def call(self, inputs):
        attention_score = self.V(self.W(inputs))
        attention_weights = tf.nn.softmax(attention_score, axis=1)
        context_vector = attention_weights * inputs
        return tf.reduce_sum(context_vector, axis=1)

    def get_config(self):
        config = super().get_config()
        config.update({'units': self.units})
        return config