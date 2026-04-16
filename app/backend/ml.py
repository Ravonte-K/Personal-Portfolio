import os

import joblib
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import mean_absolute_error
from sklearn.preprocessing import StandardScaler

_BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PATH = os.path.join(_BASE_DIR, "data", "spy.csv")
MODEL_PATH = os.path.join(_BASE_DIR, "models", "composite.joblib")
TEST_SIZE = 0.2
HORIZON_DAYS = 10
NO_TRADE_BAND = 0.005

DIRECTION_FEATURES = [
    "return_5d",
    "momentum_20",
    "ma_gap_50",
]

RETURN_FEATURES = [
    "return_5d",
    "momentum_20",
    "momentum_60",
    "ma_gap_50",
]


def get_data(path: str) -> pd.DataFrame:
    df = pd.read_csv(path)
    df["Date"] = pd.to_datetime(df["Date"])
    return df.sort_values("Date")


def make_features(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    df["return_5d"] = (df["Close"].shift(1) / df["Close"].shift(6)) - 1
    df["momentum_20"] = df["Close"].shift(1) / df["Close"].shift(21) - 1
    df["momentum_60"] = df["Close"].shift(1) / df["Close"].shift(61) - 1
    df["avg_50"] = df["Close"].shift(1).rolling(50).mean()
    df["ma_gap_50"] = (df["Close"].shift(1) - df["avg_50"]) / df["avg_50"]

    future_return = df["Close"].shift(-HORIZON_DAYS) / df["Close"] - 1
    df["target"] = pd.Series(pd.NA, index=df.index, dtype="Int64")
    df.loc[future_return > NO_TRADE_BAND, "target"] = 1
    df.loc[future_return < -NO_TRADE_BAND, "target"] = 0
    df["target_return"] = future_return
    return df.dropna().reset_index(drop=True)


def make_inference_features(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    df["return_5d"] = (df["Close"].shift(1) / df["Close"].shift(6)) - 1
    df["momentum_20"] = df["Close"].shift(1) / df["Close"].shift(21) - 1
    df["momentum_60"] = df["Close"].shift(1) / df["Close"].shift(61) - 1
    df["avg_50"] = df["Close"].shift(1).rolling(50).mean()
    df["ma_gap_50"] = (df["Close"].shift(1) - df["avg_50"]) / df["avg_50"]
    return df.dropna(subset=RETURN_FEATURES).reset_index(drop=True)


def split_data(df: pd.DataFrame):
    split_index = int(len(df) * (1 - TEST_SIZE))
    return {
        "X_dir_train": df[DIRECTION_FEATURES].iloc[:split_index],
        "X_dir_test": df[DIRECTION_FEATURES].iloc[split_index:],
        "y_dir_train": df["target"].astype(int).iloc[:split_index],
        "y_dir_test": df["target"].astype(int).iloc[split_index:],
        "X_ret_train": df[RETURN_FEATURES].iloc[:split_index],
        "X_ret_test": df[RETURN_FEATURES].iloc[split_index:],
        "y_ret_train": df["target_return"].iloc[:split_index],
        "y_ret_test": df["target_return"].iloc[split_index:],
        "close_test": df["Close"].iloc[split_index:],
    }


def tune_direction_threshold(X_train: pd.DataFrame, y_train: pd.Series) -> float:
    val_start = int(len(X_train) * 0.8)
    if val_start <= 0 or val_start >= len(X_train):
        return 0.5

    X_subtrain = X_train.iloc[:val_start]
    y_subtrain = y_train.iloc[:val_start]
    X_val = X_train.iloc[val_start:]
    y_val = y_train.iloc[val_start:]

    scaler = StandardScaler()
    X_subtrain_scaled = scaler.fit_transform(X_subtrain)
    X_val_scaled = scaler.transform(X_val)

    model = LogisticRegression(max_iter=2000)
    model.fit(X_subtrain_scaled, y_subtrain)
    y_val_prob = model.predict_proba(X_val_scaled)[:, 1]

    best_threshold = 0.5
    best_accuracy = -1.0
    for threshold in [i / 100 for i in range(35, 96)]:
        y_val_pred = (y_val_prob >= threshold).astype(int)
        accuracy = (y_val_pred == y_val).mean()
        if accuracy > best_accuracy:
            best_accuracy = accuracy
            best_threshold = threshold

    return best_threshold


def fit_models(data):
    X_dir_train = data["X_dir_train"]
    y_dir_train = data["y_dir_train"]
    X_ret_train = data["X_ret_train"]
    y_ret_train = data["y_ret_train"]

    direction_threshold = tune_direction_threshold(X_dir_train, y_dir_train)
    scaler = StandardScaler()
    X_dir_train_scaled = scaler.fit_transform(X_dir_train)

    direction_model = LogisticRegression(max_iter=2000)
    direction_model.fit(X_dir_train_scaled, y_dir_train)

    return_model = RandomForestRegressor(
        n_estimators=300,
        max_depth=6,
        min_samples_leaf=10,
        max_features="sqrt",
        random_state=42,
    )
    return_model.fit(X_ret_train, y_ret_train)

    return direction_model, return_model, scaler, direction_threshold


def save_artifacts(
    direction_model: LogisticRegression,
    return_model: RandomForestRegressor,
    scaler: StandardScaler,
    direction_threshold: float,
    model_path: str = MODEL_PATH,
):
    os.makedirs(os.path.dirname(model_path), exist_ok=True)
    joblib.dump(
        {
            "direction_model": direction_model,
            "return_model": return_model,
            "scaler": scaler,
            "direction_threshold": direction_threshold,
            "direction_features": DIRECTION_FEATURES,
            "return_features": RETURN_FEATURES,
        },
        model_path,
    )


def load_artifacts(model_path: str = MODEL_PATH):
    return joblib.load(model_path)


def composite_predictor(
    direction_model: LogisticRegression,
    return_model: RandomForestRegressor,
    direction_scaler: StandardScaler,
    X_dir: pd.DataFrame,
    X_ret: pd.DataFrame,
    close: pd.Series,
    direction_threshold: float,
) -> pd.DataFrame:
    X_dir_scaled = direction_scaler.transform(X_dir)
    direction_prob = direction_model.predict_proba(X_dir_scaled)[:, 1]
    direction_pred = (direction_prob >= direction_threshold).astype(int)
    pred_return = return_model.predict(X_ret)
    pred_price = close.to_numpy() * (1 + pred_return)

    return pd.DataFrame(
        {
            "direction": direction_pred,
            "pred_return": pred_return,
            "pred_price": pred_price,
        },
        index=close.index,
    )


def train_and_save(train_csv: str = PATH, model_path: str = MODEL_PATH):
    df = make_features(get_data(train_csv))
    data = split_data(df)
    direction_model, return_model, scaler, direction_threshold = fit_models(data)
    save_artifacts(
        direction_model=direction_model,
        return_model=return_model,
        scaler=scaler,
        direction_threshold=direction_threshold,
        model_path=model_path,
    )

    predictions = composite_predictor(
        direction_model=direction_model,
        return_model=return_model,
        direction_scaler=scaler,
        X_dir=data["X_dir_test"],
        X_ret=data["X_ret_test"],
        close=data["close_test"],
        direction_threshold=direction_threshold,
    )
    metrics = evaluate(data, predictions)
    return metrics


def predict_from_csv(predict_csv: str, model_path: str = MODEL_PATH) -> pd.DataFrame:
    artifacts = load_artifacts(model_path)
    df = make_inference_features(get_data(predict_csv))
    predictions = composite_predictor(
        direction_model=artifacts["direction_model"],
        return_model=artifacts["return_model"],
        direction_scaler=artifacts["scaler"],
        X_dir=df[artifacts["direction_features"]],
        X_ret=df[artifacts["return_features"]],
        close=df["Close"],
        direction_threshold=artifacts["direction_threshold"],
    ).reset_index(drop=True)
    predictions.insert(0, "Date", df["Date"].reset_index(drop=True))
    return predictions


def evaluate(data, predictions: pd.DataFrame):
    y_dir_test = data["y_dir_test"]
    y_ret_test = data["y_ret_test"]
    close_test = data["close_test"]

    direction_accuracy = (predictions["direction"].astype(int) == y_dir_test).mean()
    direction_baseline = (y_dir_test == 1).mean()
    direction_edge = direction_accuracy - direction_baseline

    return_mae = mean_absolute_error(y_ret_test, predictions["pred_return"])
    return_baseline_mae = y_ret_test.abs().mean()
    return_edge = return_baseline_mae - return_mae

    y_test_price = close_test * (1 + y_ret_test)
    price_mae = mean_absolute_error(y_test_price, predictions["pred_price"])
    price_baseline_mae = mean_absolute_error(y_test_price, close_test)
    price_edge = price_baseline_mae - price_mae

    return {
        "direction_accuracy": float(direction_accuracy),
        "direction_baseline": float(direction_baseline),
        "direction_edge": float(direction_edge),
        "return_mae": float(return_mae),
        "return_baseline_mae": float(return_baseline_mae),
        "return_edge": float(return_edge),
        "price_mae": float(price_mae),
        "price_baseline_mae": float(price_baseline_mae),
        "price_edge": float(price_edge),
    }


def main():
    if not os.path.exists(MODEL_PATH):
        metrics = train_and_save(PATH, MODEL_PATH)
        print("Trained and saved model artifacts.")
        print(f"Direction accuracy: {metrics['direction_accuracy']:.2%}")
        print(f"Return MAE: {metrics['return_mae']:.4f}")
        print(f"Price MAE: {metrics['price_mae']:.4f}")

    predictions = predict_from_csv(PATH, MODEL_PATH)
    latest_signal = predictions.iloc[-1]
    print(
        f"Latest composite prediction -> direction: {int(latest_signal['direction'])}, "
        f"predicted price: {latest_signal['pred_price']:.2f}"
    )


if __name__ == "__main__":
    main()
