import pandas as pd
import numpy as np

class DataTools:
    def __init__(self, df: pd.DataFrame):
        self.df = df.copy()

    # ----- inspection -----
    def importData(self, df: pd.DataFrame):
        self.df = df.copy()
        return self.df

    def insightData(self):
        return self.df.describe().transpose()

    def dataHead(self, n: int = 5):
        return self.df.head(n)

    def dataFoot(self, n: int = 5):
        return self.df.tail(n)

    # ----- missing values -----
    def dataNaCount(self, column: str = None):
        if column:
            return self.df[column].isna().sum()
        return self.df.isna().sum()

    def dataNaDrop(self, column: str = None):
        if column:
            self.df = self.df.dropna(subset=[column])
        else:
            self.df = self.df.dropna()
        return self.df

    def dataDropDuplicate(self, column: str = None):
        if column:
            self.df = self.df.drop_duplicates(subset=[column])
        else:
            self.df = self.df.drop_duplicates()
        return self.df

    def fillMissingWithMean(self, column: str = None):
        if column:
            self.df[column] = self.df[column].fillna(self.df[column].mean())
        else:
            self.df = self.df.fillna(self.df.mean(numeric_only=True))
        return self.df

    def fillMissingWithMedian(self, column: str = None):
        if column:
            self.df[column] = self.df[column].fillna(self.df[column].median())
        else:
            self.df = self.df.fillna(self.df.median(numeric_only=True))
        return self.df

    def fillMissingWithMin(self, column: str = None):
        if column:
            self.df[column] = self.df[column].fillna(self.df[column].min())
        else:
            self.df = self.df.fillna(self.df.min(numeric_only=True))
        return self.df

    def fillMissingWithMax(self, column: str = None):
        if column:
            self.df[column] = self.df[column].fillna(self.df[column].max())
        else:
            self.df = self.df.fillna(self.df.max(numeric_only=True))
        return self.df

    def detectOutliersIQR(df: pd.DataFrame, k: float = 1.5) -> pd.DataFrame:
        """
        Returns rows that contain outliers in any numeric column
        using the IQR method.
        """

        # Boolean mask for rows with at least one outlier
        outlier_mask = pd.Series(False, index=df.index)

        for col in df.select_dtypes(include="number"):
            q1 = df[col].quantile(0.25)
            q3 = df[col].quantile(0.75)
            iqr = q3 - q1

            lower = q1 - k * iqr
            upper = q3 + k * iqr

            outlier_mask |= (df[col] < lower) | (df[col] > upper)

        return df[outlier_mask]
    # ----- types -----
    def to_int(self, column: str):
        self.df[column] = self.df[column].astype("int64")
        return self.df

    def to_float(self, column: str):
        self.df[column] = self.df[column].astype("float64")
        return self.df

    def to_string(self, column: str):
        self.df[column] = self.df[column].astype("string")
        return self.df

    def to_bool(self, column: str):
        self.df[column] = self.df[column].astype("bool")
        return self.df

    def to_datetime(self, column: str):
        self.df[column] = pd.to_datetime(self.df[column])
        return self.df

    def to_category(self, column: str):
        self.df[column] = self.df[column].astype("category")
        return self.df
