import pandas as pd
import numpy as np

def importData(dataFrame: pd.DataFrame):
    return dataFrame


def insightData(dataFrame: pd.DataFrame):
    return dataFrame.describe().transpose()


def dataHead(dataFrame: pd.DataFrame, n: int = 5):
    return dataFrame.head(n)


def dataFoot(dataFrame: pd.DataFrame, n: int = 5):
    return dataFrame.tail(n)


def dataNaCount(dataFrame: pd.DataFrame, column: str = None):
    if column:
        return dataFrame[column].isna().sum()
    return dataFrame.isna().sum()


def dataNaDrop(dataFrame: pd.DataFrame, column: str = None):
    if column:
        return dataFrame.dropna(subset=[column])
    return dataFrame.dropna()


def dataDropDuplicate(dataFrame: pd.DataFrame, column: str = None):
    if column:
        return dataFrame.drop_duplicates(subset=[column])
    return dataFrame.drop_duplicates()


def fillMissingWithMean(dataFrame: pd.DataFrame, column: str = None):
    df = dataFrame.copy()
    if column:
        df[column] = df[column].fillna(df[column].mean())
    else:
        df = df.fillna(df.mean(numeric_only=True))
    return df


def fillMissingWithMedian(dataFrame: pd.DataFrame, column: str = None):
    df = dataFrame.copy()
    if column:
        df[column] = df[column].fillna(df[column].median())
    else:
        df = df.fillna(df.median(numeric_only=True))
    return df


def fillMissingWithMin(dataFrame: pd.DataFrame, column: str = None):
    df = dataFrame.copy()
    if column:
        df[column] = df[column].fillna(df[column].min())
    else:
        df = df.fillna(df.min(numeric_only=True))
    return df


def fillMissingWithMax(dataFrame: pd.DataFrame, column: str = None):
    df = dataFrame.copy()
    if column:
        df[column] = df[column].fillna(df[column].max())
    else:
        df = df.fillna(df.max(numeric_only=True))
    return df
