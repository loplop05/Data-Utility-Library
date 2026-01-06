import numpy as np
import pandas as pd
import base


class MissingTools:
    # ==========================================================
    """SECTION: Missing Values + Duplicates"""
    # ==========================================================
    def naCount(self, column: str = None):
        """Count missing values in a column (or all columns if None)."""
        if column:
            self._require_columns(column)
            return int(self.df[column].isna().sum())
        return self.df.isna().sum()

    def dropMissingValues(self, *, axis: int = 0, thresh: int = None, columns=None, inplace: bool = True):
        """
        Drop missing values with more control.

        axis:
            0 => drop rows
            1 => drop columns

        thresh:
            minimum number of non-NA values required to keep row/column

        columns:
            only used when axis=0 (rows) to consider missing in a subset of columns
        """
        new_df = self.df.copy()

        if axis not in (0, 1):
            raise ValueError("axis must be 0 (rows) or 1 (columns).")

        if axis == 1:
            new_df = new_df.dropna(axis=1, thresh=thresh)
            return self._apply(new_df, inplace)

        # axis == 0
        if columns is None:
            new_df = new_df.dropna(axis=0, thresh=thresh)
        else:
            cols = self._ensure_list(columns)
            self._require_columns(cols)
            new_df = new_df.dropna(axis=0, thresh=thresh, subset=cols)

        return self._apply(new_df, inplace)

    def fillMissingValues(self, strategy: str = "mean", *, value=None, columns=None, inplace: bool = True):
        """
        Fill missing values using ONE unified API.

        strategy:
            'mean' | 'median' | 'min' | 'max' | 'mode' | 'value'

        columns:
            None => apply to all columns, but numeric-only strategies will affect numeric columns only
            str or list[str] => specific columns (validated)

        Examples:
            dt.fillMissingValues("mean")                        # all numeric columns
            dt.fillMissingValues("median", columns=["age"])     # one numeric column
            dt.fillMissingValues("mode", columns=["city"])      # categorical
            dt.fillMissingValues("value", value=0)              # fill with constant
        """
        strategy = strategy.lower()
        new_df = self.df.copy()

        # Decide target columns
        if columns is None:
            target_cols = list(new_df.columns)
        else:
            target_cols = self._ensure_list(columns)
            self._require_columns(target_cols)

        if strategy in ("mean", "median", "min", "max"):
            num_cols = self._numeric_columns(target_cols)

            for c in num_cols:
                if strategy == "mean":
                    new_df[c] = new_df[c].fillna(new_df[c].mean())
                elif strategy == "median":
                    new_df[c] = new_df[c].fillna(new_df[c].median())
                elif strategy == "min":
                    new_df[c] = new_df[c].fillna(new_df[c].min())
                elif strategy == "max":
                    new_df[c] = new_df[c].fillna(new_df[c].max())

        elif strategy == "mode":
            for c in target_cols:
                mode_vals = new_df[c].mode(dropna=True)
                if len(mode_vals) == 0:
                    continue
                new_df[c] = new_df[c].fillna(mode_vals.iloc[0])

        elif strategy == "value":
            if value is None:
                raise ValueError("strategy='value' requires value=...")
            for c in target_cols:
                new_df[c] = new_df[c].fillna(value)

        else:
            raise ValueError("Invalid strategy. Use: mean|median|min|max|mode|value")

        return self._apply(new_df, inplace)

    def fillMissingGroupBy(self, group_col: str, target_col: str, *, strategy: str = "median", inplace: bool = True):
        """
        Fill missing values in target_col based on groups in group_col.
        strategy: 'mean' | 'median' | 'mode'
        """
        self._require_columns([group_col, target_col])
        strategy = strategy.lower()

        new_df = self.df.copy()

        if strategy in ("mean", "median"):
            if not pd.api.types.is_numeric_dtype(new_df[target_col]):
                raise TypeError(f"target_col '{target_col}' must be numeric for {strategy}.")

            if strategy == "mean":
                filler = new_df.groupby(group_col)[target_col].transform("mean")
            else:
                filler = new_df.groupby(group_col)[target_col].transform("median")

            new_df[target_col] = new_df[target_col].fillna(filler)

        elif strategy == "mode":
            def mode_of_group(s):
                m = s.mode(dropna=True)
                return m.iloc[0] if len(m) else np.nan

            filler = new_df.groupby(group_col)[target_col].transform(mode_of_group)
            new_df[target_col] = new_df[target_col].fillna(filler)

        else:
            raise ValueError("strategy must be: mean | median | mode")

        return self._apply(new_df, inplace)

    def dropDuplicates(self, columns=None, *, inplace: bool = True, keep="first"):
        """
        Drop duplicate rows.
        - columns=None => duplicates across all columns
        - else => duplicates based on subset
        """
        if columns is None:
            new_df = self.df.drop_duplicates(keep=keep)
        else:
            cols = self._ensure_list(columns)
            self._require_columns(cols)
            new_df = self.df.drop_duplicates(subset=cols, keep=keep)

        return self._apply(new_df, inplace)

    def missingColumns(self,threshold:float = 0.5):
        """
            Return columns where missing-value ratio >= threshold.

            threshold:
                float between 0 and 1
                e.g. 0.4 => columns with 40% or more missing values
            """
        if not (0 <= threshold <= 1):
            raise ValueError("threshold must be between 0 and 1.")

        missing_ratio = self.df.isna().mean()
        return missing_ratio[missing_ratio >= threshold].index.tolist()

    def missingRows(self, threshold: float = 0.5, columns=None):
        """
        Return rows where missing-value ratio >= threshold.

        threshold:
            float between 0 and 1

        columns:
            None => consider all columns
            str | list[str] => consider subset of columns only
        """
        if not (0 <= threshold <= 1):
            raise ValueError("threshold must be between 0 and 1.")

        if columns is None:
            subset_df = self.df
        else:
            cols = self._ensure_list(columns)
            self._require_columns(cols)
            subset_df = self.df[cols]

        missing_ratio = subset_df.isna().mean(axis=1)
        return self.df.loc[missing_ratio >= threshold]
