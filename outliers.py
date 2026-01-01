import numpy as np


class OutliersTools:
    # ==========================================================
    """SECTION: Outliers Detection (IQR)"""
    # ==========================================================
    def outlier_mask_iqr(self, columns=None, k: float = 1.5):
        """
        Return boolean mask of rows that contain outliers using IQR in given numeric columns.
        columns=None => all numeric columns.
        """
        num_cols = self._numeric_columns(columns)
        if len(num_cols) == 0:
            raise TypeError("No numeric columns to detect outliers.")

        numeric_df = self.df[num_cols]
        q1 = numeric_df.quantile(0.25)
        q3 = numeric_df.quantile(0.75)
        iqr = q3 - q1

        lower = q1 - k * iqr
        upper = q3 + k * iqr

        return ((numeric_df < lower) | (numeric_df > upper)).any(axis=1)

    def detect_outliers_iqr(self, columns=None, k: float = 1.5):
        """Return rows that are outliers (based on IQR mask)."""
        mask = self.outlier_mask_iqr(columns=columns, k=k)
        return self.df[mask]

    def clip_outliers_iqr(self, columns=None, k: float = 1.5, inplace: bool = True):
        """
        Clip numeric columns to IQR bounds (winsorizing-like).
        Useful instead of dropping outliers.
        """
        num_cols = self._numeric_columns(columns)
        new_df = self.df.copy()

        numeric_df = new_df[num_cols]
        q1 = numeric_df.quantile(0.25)
        q3 = numeric_df.quantile(0.75)
        iqr = q3 - q1

        lower = q1 - k * iqr
        upper = q3 + k * iqr

        for c in num_cols:
            new_df[c] = new_df[c].clip(lower[c], upper[c])

        return self._apply(new_df, inplace)

    # ==========================================================
    """SECTION: Outliers Detection (Z-score)"""
    # ==========================================================
    def outlier_mask_zscore(self, columns=None, *, z: float = 3.0):
        """
        Boolean mask for rows containing z-score outliers in numeric columns.
        columns=None => all numeric columns.
        """
        num_cols = self._numeric_columns(columns)
        if len(num_cols) == 0:
            raise TypeError("No numeric columns to detect outliers.")

        df_num = self.df[num_cols].astype(float)
        mean = df_num.mean()
        std = df_num.std(ddof=0)

        std_replaced = std.replace(0, np.nan)
        zscores = (df_num - mean) / std_replaced

        mask = (zscores.abs() > z).any(axis=1).fillna(False)
        return mask

    def detect_outliers_zscore(self, columns=None, *, z: float = 3.0):
        """Return rows that contain z-score outliers."""
        mask = self.outlier_mask_zscore(columns=columns, z=z)
        return self.df[mask]

    def clip_outliers_zscore(self, columns=None, *, z: float = 3.0, inplace: bool = True):
        """
        Clip numeric columns to mean ± z*std.
        """
        num_cols = self._numeric_columns(columns)
        new_df = self.df.copy()

        df_num = new_df[num_cols].astype(float)
        mean = df_num.mean()
        std = df_num.std(ddof=0)

        lower = mean - z * std
        upper = mean + z * std

        for c in num_cols:
            new_df[c] = new_df[c].clip(lower[c], upper[c])

        return self._apply(new_df, inplace)
